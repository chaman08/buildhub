
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email?: string;
  fullName: string;
  userType: 'customer' | 'contractor';
  mobile: string;
  city?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isDocumentVerified?: boolean;
  // Contractor specific fields
  companyName?: string;
  serviceCategory?: string;
  experience?: number;
  documents?: string[];
  verificationBadge?: boolean;
  // Customer specific fields
  projectsPosted?: number;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signupWithPhone: (phoneNumber: string, userData: Partial<UserProfile>) => Promise<ConfirmationResult>;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  setupRecaptcha: (elementId: string) => RecaptchaVerifier;
  sendPhoneOTP: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyPhoneOTP: (confirmationResult: ConfirmationResult, otp: string, userData?: Partial<UserProfile>) => Promise<void>;
  isVerificationComplete: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string, userData: Partial<UserProfile>) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create user profile in Firestore
    const profileData: UserProfile = {
      uid: user.uid,
      email: user.email!,
      fullName: userData.fullName!,
      userType: userData.userType!,
      mobile: userData.mobile!,
      city: userData.city,
      isEmailVerified: false,
      isPhoneVerified: false,
      isDocumentVerified: false,
      ...userData
    };
    
    await setDoc(doc(db, 'users', user.uid), profileData);
    setUserProfile(profileData);
  };

  const signupWithPhone = async (phoneNumber: string, userData: Partial<UserProfile>): Promise<ConfirmationResult> => {
    const recaptchaVerifier = setupRecaptcha('recaptcha-container');
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithPhone = async (phoneNumber: string): Promise<ConfirmationResult> => {
    const recaptchaVerifier = setupRecaptcha('recaptcha-container');
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user profile exists, if not create a basic one
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      // New Google user - create incomplete profile that needs completion
      const profileData: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        fullName: result.user.displayName || '',
        userType: 'customer', // Default, user will be prompted to complete
        mobile: '', // Empty, needs to be filled
        isEmailVerified: result.user.emailVerified,
        isPhoneVerified: false,
        isDocumentVerified: false
      };
      
      await setDoc(doc(db, 'users', result.user.uid), profileData);
      setUserProfile(profileData);
    } else {
      // Existing user - update email verification status
      const profile = userDoc.data() as UserProfile;
      profile.isEmailVerified = result.user.emailVerified;
      setUserProfile(profile);
      
      if (profile.isEmailVerified !== result.user.emailVerified) {
        await setDoc(doc(db, 'users', result.user.uid), { ...profile, isEmailVerified: result.user.emailVerified }, { merge: true });
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const sendEmailVerificationHandler = async () => {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    }
  };

  const refreshUserProfile = async () => {
    if (currentUser) {
      await currentUser.reload();
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        profile.isEmailVerified = currentUser.emailVerified;
        setUserProfile(profile);
        
        // Update Firestore if email verification status changed
        if (profile.isEmailVerified !== currentUser.emailVerified) {
          await setDoc(doc(db, 'users', currentUser.uid), { ...profile, isEmailVerified: currentUser.emailVerified }, { merge: true });
        }
      }
    }
  };

  const setupRecaptcha = (elementId: string): RecaptchaVerifier => {
    return new RecaptchaVerifier(auth, elementId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      }
    });
  };

  const sendPhoneOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const verifyPhoneOTP = async (confirmationResult: ConfirmationResult, otp: string, userData?: Partial<UserProfile>): Promise<void> => {
    const result = await confirmationResult.confirm(otp);
    
    // If this is a new phone signup, create user profile
    if (userData && result.user) {
      const profileData: UserProfile = {
        uid: result.user.uid,
        fullName: userData.fullName!,
        userType: userData.userType!,
        mobile: result.user.phoneNumber!,
        city: userData.city,
        isEmailVerified: false,
        isPhoneVerified: true,
        isDocumentVerified: false,
        ...userData
      };
      
      await setDoc(doc(db, 'users', result.user.uid), profileData);
      setUserProfile(profileData);
    } else if (currentUser) {
      // Update existing user profile to mark phone as verified
      await setDoc(doc(db, 'users', currentUser.uid), {
        isPhoneVerified: true
      }, { merge: true });
      
      await refreshUserProfile();
    }
  };

  const isVerificationComplete = (): boolean => {
    if (!userProfile) return false;
    return userProfile.isEmailVerified || userProfile.isPhoneVerified;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          // Update email verification status
          profile.isEmailVerified = user.emailVerified;
          setUserProfile(profile);
          
          // Update Firestore if email verification status changed
          if (profile.isEmailVerified !== user.emailVerified) {
            await setDoc(doc(db, 'users', user.uid), { ...profile, isEmailVerified: user.emailVerified }, { merge: true });
          }
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    signupWithPhone,
    login,
    loginWithPhone,
    signInWithGoogle,
    logout,
    sendEmailVerification: sendEmailVerificationHandler,
    refreshUserProfile,
    setupRecaptcha,
    sendPhoneOTP,
    verifyPhoneOTP,
    isVerificationComplete
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
