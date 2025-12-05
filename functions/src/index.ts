import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import StreamZip from 'node-stream-zip';
import { parseStringPromise } from 'xml2js';

admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

type KycStatus = 'pending' | 'under_review' | 'needs_info' | 'verified' | 'rejected';

const isAdminUser = async (uid: string) => {
  const userDoc = await db.collection('users').doc(uid).get();
  const claims = (await admin.auth().getUser(uid)).customClaims;
  return Boolean(userDoc.exists && userDoc.data()?.isAdmin === true) || Boolean(claims?.admin);
};

const allowlistedPayload = (data: any) => {
  const allow = [
    'pan',
    'gstin',
    'businessName',
    'businessType',
    'businessAddress',
    'aadhaarLast4',
    'aadhaarShareCode',
    'aadhaarZipPath',
    'license',
    'documents',
  ];
  const sanitized: any = {};
  allow.forEach((key) => {
    if (data[key] !== undefined) sanitized[key] = data[key];
  });
  return sanitized;
};

const verifyPanViaApi = async (pan: string) => {
  const url = functions.config().kyc?.pan_api_url;
  const apiKey = functions.config().kyc?.pan_api_key;
  if (!url || !apiKey) return { status: 'unchecked' };
  const res = await axios.post(
    url,
    { pan },
    { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 5000 }
  );
  return res.data;
};

const verifyGstViaApi = async (gstin: string) => {
  const url = functions.config().kyc?.gst_api_url;
  const apiKey = functions.config().kyc?.gst_api_key;
  if (!url || !apiKey) return { status: 'unchecked' };
  const res = await axios.post(
    url,
    { gstin },
    { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 5000 }
  );
  return res.data;
};

const parseAadhaarZip = async (zipPath: string, shareCode: string) => {
  const [zipBuffer] = await bucket.file(zipPath).download();
  if (zipBuffer.byteLength > MAX_FILE_BYTES) {
    throw new functions.https.HttpsError('invalid-argument', 'Aadhaar ZIP too large.');
  }

  const zip = new StreamZip.async({ buffer: zipBuffer, password: shareCode });
  const entries = await zip.entries();
  const xmlEntry = Object.values(entries).find((e: any) => e.name.endsWith('.xml'));
  if (!xmlEntry) {
    await zip.close();
    throw new functions.https.HttpsError('invalid-argument', 'Aadhaar XML not found in ZIP.');
  }
  const xmlBuffer = await zip.entryData(xmlEntry.name);
  await zip.close();

  const xml = xmlBuffer.toString();
  const parsed = await parseStringPromise(xml, { explicitArray: false, attrkey: 'attr' });
  const data = parsed?.PrintLetterBarcodeData?.attr;
  if (!data) {
    throw new functions.https.HttpsError('invalid-argument', 'Aadhaar XML could not be parsed.');
  }

  return {
    name: data.name || data?.Name,
    dob: data.dob || data?.Dob,
    gender: data.gender || data?.Gender,
    address: [
      data.house,
      data.street,
      data.lm,
      data.loc,
      data.vtc,
      data.dist,
      data.state,
      data.pc,
    ]
      .filter(Boolean)
      .join(', '),
    referenceId: data.referenceId || data?.uid || '',
  };
};

export const submitKyc = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const uid = context.auth.uid;
  const payload = allowlistedPayload(data);

  if (!payload.pan || !PAN_REGEX.test(String(payload.pan).toUpperCase())) {
    throw new functions.https.HttpsError('invalid-argument', 'PAN format invalid.');
  }
  if (payload.gstin && !GST_REGEX.test(String(payload.gstin).toUpperCase())) {
    throw new functions.https.HttpsError('invalid-argument', 'GSTIN format invalid.');
  }
  if (!payload.aadhaarLast4 || String(payload.aadhaarLast4).length !== 4) {
    throw new functions.https.HttpsError('invalid-argument', 'Aadhaar last 4 required.');
  }
  if (!payload.aadhaarShareCode || String(payload.aadhaarShareCode).length < 4) {
    throw new functions.https.HttpsError('invalid-argument', 'Aadhaar share code required.');
  }
  if (!payload.aadhaarZipPath) {
    throw new functions.https.HttpsError('invalid-argument', 'Aadhaar ZIP storage path required.');
  }

  let aadhaarInfo: any = {};
  try {
    aadhaarInfo = await parseAadhaarZip(payload.aadhaarZipPath, String(payload.aadhaarShareCode));
  } catch (err: any) {
    functions.logger.error('Aadhaar parse error', err);
    throw err;
  }

  let panCheck = { status: 'unchecked' };
  let gstCheck = { status: 'unchecked' };
  try {
    panCheck = await verifyPanViaApi(String(payload.pan).toUpperCase());
  } catch (err) {
    functions.logger.warn('PAN API failed', err);
  }
  if (payload.gstin) {
    try {
      gstCheck = await verifyGstViaApi(String(payload.gstin).toUpperCase());
    } catch (err) {
      functions.logger.warn('GST API failed', err);
    }
  }

  const kycRef = db.collection('kycRequests').doc();
  await kycRef.set({
    uid,
    status: 'pending',
    kycLevel: 'business',
    pan: String(payload.pan).toUpperCase(),
    gstin: payload.gstin ? String(payload.gstin).toUpperCase() : null,
    businessName: payload.businessName || null,
    businessType: payload.businessType || null,
    businessAddress: payload.businessAddress || null,
    aadhaarLast4: String(payload.aadhaarLast4),
    aadhaarSummary: aadhaarInfo,
    panCheck,
    gstCheck,
    documents: {
      aadhaarZipPath: payload.aadhaarZipPath,
      panUrl: payload.documents?.panUrl || null,
      gstUrl: payload.documents?.gstUrl || null,
      licenseUrl: payload.documents?.licenseUrl || null,
    },
    license: payload.license || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection('auditLogs').add({
    actor: uid,
    action: 'kyc_submit',
    target: kycRef.id,
    after: { status: 'pending' },
    ts: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection('users').doc(uid).set(
    {
      kycStatus: 'pending',
      kycRequestId: kycRef.id,
      kycLevel: 'business',
      kycSubmittedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { requestId: kycRef.id, status: 'pending' };
});

export const updateKycStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }
  const adminUser = await isAdminUser(context.auth.uid);
  if (!adminUser) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only.');
  }

  const { requestId, status, notes } = data as { requestId: string; status: KycStatus; notes?: string };
  if (!requestId || !['pending', 'under_review', 'needs_info', 'verified', 'rejected'].includes(status)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid status or request id.');
  }

  const reqRef = db.collection('kycRequests').doc(requestId);
  const snap = await reqRef.get();
  if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Request not found');
  const req = snap.data()!;

  await reqRef.set(
    {
      status,
      notes: notes || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db.collection('users').doc(req.uid).set(
    {
      kycStatus: status,
      kycRequestId: requestId,
      kycNotes: notes || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db.collection('auditLogs').add({
    actor: context.auth.uid,
    action: 'kyc_status_update',
    target: requestId,
    before: { status: req.status },
    after: { status },
    ts: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { status };
});
