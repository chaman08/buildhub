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
const MAX_CHAT_ATTACHMENTS = 5;

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

const normalizeParticipants = (ids: string[]) => Array.from(new Set(ids)).sort();

const buildConversationId = (projectId: string, participants: string[]) => {
  const projectKey = projectId?.trim() ? projectId.trim() : 'direct';
  if (participants.length !== 2) return '';
  return `${projectKey}__${participants[0]}__${participants[1]}`;
};

const sanitizeAttachments = (attachments: any) => {
  if (!attachments) return [] as string[];
  if (!Array.isArray(attachments)) {
    throw new functions.https.HttpsError('invalid-argument', 'attachments must be an array.');
  }
  if (attachments.length > MAX_CHAT_ATTACHMENTS) {
    throw new functions.https.HttpsError('invalid-argument', `Maximum ${MAX_CHAT_ATTACHMENTS} attachments allowed.`);
  }
  const cleaned = attachments.map((att) => String(att || '').trim()).filter(Boolean);
  cleaned.forEach((att) => {
    if (!att.startsWith('https://') && !att.startsWith('gs://')) {
      throw new functions.https.HttpsError('invalid-argument', 'Attachment URLs must be https or gs paths.');
    }
    if (att.length > 2048) {
      throw new functions.https.HttpsError('invalid-argument', 'Attachment URL too long.');
    }
  });
  return cleaned;
};

const notificationsConfig = functions.config().notifications || {};
type NotificationType = 'bid_update' | 'project_update' | 'message';
type ChannelStatus = 'sent' | 'skipped' | 'failed';

interface NotificationPayload {
  recipientId: string;
  message: string;
  type: NotificationType;
  projectId?: string;
  projectTitle?: string;
  senderId?: string;
  senderName?: string;
  metadata?: Record<string, any>;
  dedupeKey?: string;
}

const truncateText = (value: string, limit = 140) => {
  if (!value) return '';
  return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
};

const toUniqueStringArray = (value: any): string[] => {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  return Array.from(new Set(arr.map((item) => String(item || '').trim()).filter(Boolean)));
};

const fetchUserProfile = async (uid: string) => {
  if (!uid) return null;
  try {
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? { id: uid, ...snap.data() } : null;
  } catch (err) {
    functions.logger.warn('Failed to fetch user profile', uid, err);
    return null;
  }
};

const getUserDisplayName = async (uid?: string) => {
  if (!uid) return '';
  const profile = await fetchUserProfile(uid);
  return (
    (profile?.fullName as string) ||
    (profile?.name as string) ||
    (profile?.displayName as string) ||
    (profile?.email as string) ||
    ''
  );
};

const getProjectTitle = async (projectId?: string) => {
  if (!projectId) return 'Project';
  const primary = await db.collection('projects').doc(projectId).get();
  if (primary.exists && primary.data()?.title) {
    return (primary.data() as any).title as string;
  }
  const contractor = await db.collection('contractor_projects').doc(projectId).get();
  if (contractor.exists && contractor.data()?.title) {
    return (contractor.data() as any).title as string;
  }
  return 'Project';
};

const getUserEmail = (user: FirebaseFirestore.DocumentData | null) =>
  (user?.email as string) ||
  (user?.contactEmail as string) ||
  (user?.recoveryEmail as string) ||
  '';

const getUserPushTokens = (user: FirebaseFirestore.DocumentData | null) => {
  const buckets = [user?.fcmTokens, user?.pushTokens, user?.deviceTokens, user?.notificationTokens];
  const tokens: string[] = [];

  buckets.forEach((bucket) => {
    if (Array.isArray(bucket)) {
      bucket.forEach((token) => {
        if (typeof token === 'string') tokens.push(token);
      });
    } else if (typeof bucket === 'string') {
      tokens.push(bucket);
    }
  });

  return toUniqueStringArray(tokens);
};

const sendEmailNotification = async (to: string | undefined, subject: string, html: string): Promise<ChannelStatus> => {
  const apiKey = notificationsConfig.resend_api_key || notificationsConfig.email_api_key;
  const from = notificationsConfig.from_email || notificationsConfig.from || notificationsConfig.sender;
  if (!to || !apiKey || !from) {
    return 'skipped';
  }

  try {
    await axios.post(
      'https://api.resend.com/emails',
      { from, to, subject, html },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 7000,
      }
    );
    return 'sent';
  } catch (err) {
    functions.logger.error('Email notification failed', { to, err });
    return 'failed';
  }
};

const sendPushNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<ChannelStatus> => {
  const cleanTokens = toUniqueStringArray(tokens);
  if (cleanTokens.length === 0) return 'skipped';

  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: cleanTokens,
      notification: { title, body },
      data,
    });

    const success = response.responses.some((r) => r.success);
    if (!success) {
      functions.logger.warn('Push notification failed for all tokens', { tokens: cleanTokens, response });
      return 'failed';
    }
    return 'sent';
  } catch (err) {
    functions.logger.error('Push notification send error', { tokens: cleanTokens, err });
    return 'failed';
  }
};

const buildNotificationSubject = (payload: NotificationPayload) => {
  const prefix = (() => {
    if (payload.type === 'message') return 'New message';
    if (payload.type === 'bid_update') return 'Bid update';
    return 'Project update';
  })();
  return payload.projectTitle ? `${prefix} · ${payload.projectTitle}` : prefix;
};

const createNotificationRecord = async (
  payload: NotificationPayload,
  delivery: { email: ChannelStatus; push: ChannelStatus }
) => {
  const notificationDoc: FirebaseFirestore.DocumentData = {
    recipientId: payload.recipientId,
    message: payload.message,
    type: payload.type,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    delivery,
  };

  if (payload.projectId) notificationDoc.projectId = payload.projectId;
  if (payload.projectTitle) notificationDoc.projectTitle = payload.projectTitle;
  if (payload.senderId) notificationDoc.senderId = payload.senderId;
  if (payload.senderName) notificationDoc.senderName = payload.senderName;
  if (payload.metadata) notificationDoc.metadata = payload.metadata;

  const ref = payload.dedupeKey
    ? db.collection('notifications').doc(payload.dedupeKey)
    : db.collection('notifications').doc();

  await ref.set(notificationDoc, { merge: Boolean(payload.dedupeKey) });
  return ref.id;
};

const dispatchNotification = async (payload: NotificationPayload) => {
  const userProfile = await fetchUserProfile(payload.recipientId);
  const email = getUserEmail(userProfile);
  const tokens = getUserPushTokens(userProfile);

  const subject = buildNotificationSubject(payload);
  const html = `<p>${payload.message}</p>${payload.projectTitle ? `<p><strong>${payload.projectTitle}</strong></p>` : ''}`;

  const [emailStatus, pushStatus] = await Promise.all([
    sendEmailNotification(email, subject, html),
    sendPushNotification(tokens, payload.projectTitle || subject, payload.message, {
      type: payload.type,
      projectId: payload.projectId || '',
    }),
  ]);

  const notificationId = await createNotificationRecord(payload, { email: emailStatus, push: pushStatus });
  return { notificationId, emailStatus, pushStatus };
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

export const createChatMessage = functions.https.onCall(async (data, context) => {
  const senderId = context.auth?.uid;
  if (!senderId) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const {
    recipientId,
    recipientName = '',
    recipientType = '',
    projectId = '',
    message = '',
    attachments = []
  } = data || {};

  if (!recipientId || typeof recipientId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'recipientId is required.');
  }
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';
  const cleanedAttachments = sanitizeAttachments(attachments);
  if (!trimmedMessage && cleanedAttachments.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Message or attachment required.');
  }

  const participants = normalizeParticipants([senderId, recipientId]);
  if (participants.length !== 2) {
    throw new functions.https.HttpsError('invalid-argument', 'Exactly two participants are required.');
  }
  if (participants[0] === participants[1]) {
    throw new functions.https.HttpsError('invalid-argument', 'Cannot message yourself.');
  }

  const conversationId = buildConversationId(projectId, participants);
  if (!conversationId) {
    throw new functions.https.HttpsError('invalid-argument', 'Conversation could not be determined.');
  }

  // Optionally enforce project participation
  if (projectId) {
    const projectSnap = await db.collection('projects').doc(projectId).get();
    if (projectSnap.exists) {
      const project = projectSnap.data() as any;
      const allowed =
        project.postedBy === senderId ||
        project.acceptedContractorId === senderId ||
        project.postedBy === recipientId ||
        project.acceptedContractorId === recipientId;
      if (!allowed) {
        throw new functions.https.HttpsError('permission-denied', 'Not allowed to chat on this project.');
      }
    }
  }

  // Fetch sender profile for name/type
  const senderDoc = await db.collection('users').doc(senderId).get();
  const senderProfile = senderDoc.exists ? senderDoc.data() : {};

  const now = admin.firestore.FieldValue.serverTimestamp();
  const threadRef = db.collection('chatThreads').doc(conversationId);
  const threadSnap = await threadRef.get();
  if (threadSnap.exists) {
    const thread = threadSnap.data() as any;
    const sameParticipants =
      Array.isArray(thread?.participants) &&
      thread.participants.length === participants.length &&
      thread.participants.every((p: string, idx: number) => p === participants[idx]);
    if (!sameParticipants || (thread.projectId || '') !== (projectId || '')) {
      throw new functions.https.HttpsError('failed-precondition', 'Conversation metadata mismatch.');
    }
  }

  const messageSummary = trimmedMessage || (cleanedAttachments.length ? 'Sent an attachment' : '');
  await threadRef.set(
    {
      projectId: projectId || '',
      participants,
      lastMessage: messageSummary,
      lastMessageSenderId: senderId,
      lastMessageSenderName: senderProfile?.fullName || senderProfile?.name || '',
      lastMessageAt: now,
      updatedAt: now,
      createdAt: threadSnap.exists ? threadSnap.get('createdAt') ?? now : now,
    },
    { merge: true }
  );

  const chatRef = db.collection('chats').doc();
  await chatRef.set({
    conversationId,
    projectId: projectId || '',
    senderId,
    senderName: senderProfile?.fullName || senderProfile?.name || '',
    senderType: senderProfile?.userType || '',
    recipientId,
    recipientName,
    recipientType,
    participants,
    message: trimmedMessage,
    attachments: cleanedAttachments,
    timestamp: now,
    deliveredTo: { [senderId]: now },
    readBy: { [senderId]: now },
    status: 'sent',
  });

  return { id: chatRef.id, conversationId };
});

export const acceptBid = functions.https.onCall(async (data, context) => {
  const actorId = context.auth?.uid;
  if (!actorId) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const bidId = String(data?.bidId || '').trim();
  if (!bidId) {
    throw new functions.https.HttpsError('invalid-argument', 'bidId is required.');
  }

  const actorIsAdmin = await isAdminUser(actorId);

  return db.runTransaction(async (tx) => {
    const bidRef = db.collection('bids').doc(bidId);
    const bidSnap = await tx.get(bidRef);
    if (!bidSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Bid not found.');
    }
    const bid = bidSnap.data() as any;

    if (!['pending', 'shortlisted'].includes(bid.status)) {
      throw new functions.https.HttpsError('failed-precondition', 'Bid is already resolved.');
    }

    // Locate the project in either collection
    let projectRef = db.collection('projects').doc(bid.projectId);
    let projectSnap = await tx.get(projectRef);
    let projectCollection: 'projects' | 'contractor_projects' = 'projects';

    if (!projectSnap.exists) {
      projectRef = db.collection('contractor_projects').doc(bid.projectId);
      projectSnap = await tx.get(projectRef);
      projectCollection = 'contractor_projects';
    }

    if (!projectSnap.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'Project for bid not found.');
    }

    const project = projectSnap.data() as any;
    const actorIsOwner = project.postedBy === actorId;
    if (!actorIsOwner && !actorIsAdmin) {
      throw new functions.https.HttpsError('permission-denied', 'Only the project owner can accept bids.');
    }

    if (project.acceptedBidId && project.acceptedBidId !== bidId) {
      throw new functions.https.HttpsError('failed-precondition', 'Project already has an accepted bid.');
    }

    // Read competing bids before writes to keep transaction valid
    const otherBidsSnap = await tx.get(
      db.collection('bids').where('projectId', '==', bid.projectId)
    );

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    tx.update(bidRef, {
      status: 'accepted',
      acceptedAt: timestamp,
      updatedAt: timestamp,
      acceptedBy: actorId,
    });

    tx.update(projectRef, {
      status: 'in_progress',
      acceptedContractorId: bid.contractorId,
      acceptedBidId: bidId,
      acceptedBidAmount: bid.priceQuoted ?? null,
      acceptedTimeline: bid.timeline ?? null,
      updatedAt: timestamp,
    });

    otherBidsSnap.docs.forEach((docSnap) => {
      if (docSnap.id === bidId) return;
      const otherBid = docSnap.data() as any;
      if (['pending', 'shortlisted'].includes(otherBid.status)) {
        tx.update(docSnap.ref, {
          status: 'rejected',
          updatedAt: timestamp,
          rejectedReason: 'another_bid_accepted',
        });
      }
    });

    return {
      bidId,
      projectId: bid.projectId,
      projectCollection,
      acceptedContractorId: bid.contractorId,
    };
  });
});

export const onBidStatusChange = functions.firestore
  .document('bids/{bidId}')
  .onWrite(async (change, context) => {
    if (!change.after.exists) return null;
    const after = change.after.data() as any;
    const beforeStatus = change.before.exists ? (change.before.data() as any)?.status : undefined;
    const afterStatus = after?.status as string | undefined;

    if (!after || !after.contractorId || !afterStatus || afterStatus === beforeStatus) {
      return null;
    }
    if (afterStatus !== 'accepted' && afterStatus !== 'rejected') return null;

    const projectTitle = after.projectTitle || (await getProjectTitle(after.projectId));
    const senderName = await getUserDisplayName(after.customerId || after.postedBy);

    let message =
      afterStatus === 'accepted'
        ? `Your bid for "${projectTitle}" was accepted.`
        : `Your bid for "${projectTitle}" was not selected.`;

    if (afterStatus === 'rejected' && after.rejectedReason === 'another_bid_accepted') {
      message = `Another bid was accepted for "${projectTitle}".`;
    }

    await dispatchNotification({
      recipientId: after.contractorId,
      senderId: after.customerId || after.postedBy || '',
      senderName,
      projectId: after.projectId || '',
      projectTitle,
      type: 'bid_update',
      message,
      metadata: {
        bidId: context.params.bidId,
        status: afterStatus,
        rejectedReason: after.rejectedReason || null,
      },
      dedupeKey: `${context.params.bidId}_${after.contractorId}_${afterStatus}`,
    });

    return null;
  });

export const onChatMessageCreated = functions.firestore
  .document('chats/{chatId}')
  .onCreate(async (snap, context) => {
    const chat = snap.data() as any;
    if (!chat || !chat.recipientId || chat.recipientId === chat.senderId) return null;

    const projectTitle = chat.projectId ? await getProjectTitle(chat.projectId) : 'Direct message';
    const senderName = chat.senderName || (await getUserDisplayName(chat.senderId));
    const messagePreview = chat.message
      ? truncateText(chat.message, 160)
      : Array.isArray(chat.attachments) && chat.attachments.length > 0
      ? 'Sent you an attachment.'
      : 'New message received.';

    await dispatchNotification({
      recipientId: chat.recipientId,
      senderId: chat.senderId,
      senderName,
      projectId: chat.projectId || '',
      projectTitle,
      type: 'message',
      message: messagePreview,
      metadata: {
        chatId: context.params.chatId,
        conversationId: chat.conversationId || '',
        projectId: chat.projectId || '',
      },
      dedupeKey: `${context.params.chatId}_${chat.recipientId}`,
    });

    return null;
  });

const handleProjectStatusNotification = async (
  projectId: string,
  after: Record<string, any>,
  beforeStatus: string | undefined,
  collection: 'projects' | 'contractor_projects'
) => {
  const status = (after?.status as string) || '';
  if (!status || status === beforeStatus) return;

  const projectTitle = after?.title || (await getProjectTitle(projectId));
  const recipients = new Set<string>();
  if (after?.postedBy) recipients.add(after.postedBy as string);
  if (after?.acceptedContractorId) recipients.add(after.acceptedContractorId as string);

  const readableStatus = status.replace(/_/g, ' ');
  const previousLabel = beforeStatus ? beforeStatus.replace(/_/g, ' ') : '';
  const senderId = (after?.updatedBy as string) || '';
  const senderName = senderId ? await getUserDisplayName(senderId) : '';

  for (const recipientId of recipients) {
    await dispatchNotification({
      recipientId,
      senderId,
      senderName,
      projectId,
      projectTitle,
      type: 'project_update',
      message: `Project status is now "${readableStatus}"${previousLabel ? ` (was ${previousLabel})` : ''}.`,
      metadata: {
        status,
        previousStatus: beforeStatus || null,
        projectCollection: collection,
      },
      dedupeKey: `${collection}_${projectId}_${recipientId}_${status}`,
    });
  }
};

export const onProjectStatusChange = functions.firestore
  .document('projects/{projectId}')
  .onUpdate(async (change, context) => {
    const beforeStatus = (change.before.data()?.status as string) || '';
    const afterStatus = (change.after.data()?.status as string) || '';
    if (!afterStatus || afterStatus === beforeStatus) return null;

    await handleProjectStatusNotification(
      context.params.projectId,
      change.after.data() as Record<string, any>,
      beforeStatus,
      'projects'
    );
    return null;
  });

export const onContractorProjectStatusChange = functions.firestore
  .document('contractor_projects/{projectId}')
  .onUpdate(async (change, context) => {
    const beforeStatus = (change.before.data()?.status as string) || '';
    const afterStatus = (change.after.data()?.status as string) || '';
    if (!afterStatus || afterStatus === beforeStatus) return null;

    await handleProjectStatusNotification(
      context.params.projectId,
      change.after.data() as Record<string, any>,
      beforeStatus,
      'contractor_projects'
    );
    return null;
  });
