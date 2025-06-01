
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
  occupation?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isDocumentVerified?: boolean;
  // Contractor specific fields
  companyName?: string;
  serviceCategory?: string;
  experience?: number;
  documents?: string[];
  verificationBadge?: boolean;
  rating?: number;
  // Customer specific fields
  projectsPosted?: number;
  createdAt?: Date;
  updatedAt?: Date;
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

  const createUserProfile = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const now = new Date();
      const profileData: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        fullName: additionalData.fullName || user.displayName || '',
        userType: additionalData.userType || 'customer',
        mobile: additionalData.mobile || '',
        city: additionalData.city || '',
        occupation: additionalData.occupation || '',
        profilePicture: additionalData.profilePicture || user.photoURL || '',
        isEmailVerified: user.emailVerified,
        isPhoneVerified: additionalData.isPhoneVerified || false,
        isDocumentVerified: false,
        createdAt: now,
        updatedAt: now,
        ...additionalData
      };
      
      await setDoc(userRef, profileData);
      return profileData;
    }
    
    return userDoc.data() as UserProfile;
  };

  const signup = async (email: string, password: string, userData: Partial<UserProfile>) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create user profile in Firestore
    const profileData = await createUserProfile(user, {
      ...userData,
      isEmailVerified: false,
      isPhoneVerified: false
    });
    
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
    
    // Create or update user profile
    const profileData = await createUserProfile(result.user, {
      isEmailVerified: result.user.emailVerified,
      isPhoneVerified: false
    });
    
    setUserProfile(profileData);
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
        
        // Update email verification status if it changed
        if (profile.isEmailVerified !== currentUser.emailVerified) {
          profile.isEmailVerified = currentUser.emailVerified;
          profile.updatedAt = new Date();
          
          await setDoc(doc(db, 'users', currentUser.uid), {
            isEmailVerified: currentUser.emailVerified,
            updatedAt: profile.updatedAt
          }, { merge: true });
        }
        
        setUserProfile(profile);
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
    
    if (userData && result.user) {
      // New phone signup - create user profile
      const profileData = await createUserProfile(result.user, {
        ...userData,
        mobile: result.user.phoneNumber || '',
        isEmailVerified: false,
        isPhoneVerified: true
      });
      
      setUserProfile(profileData);
    } else if (currentUser) {
      // Update existing user profile to mark phone as verified
      const now = new Date();
      await setDoc(doc(db, 'users', currentUser.uid), {
        isPhoneVerified: true,
        updatedAt: now
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
          
          // Update email verification status if changed
          if (profile.isEmailVerified !== user.emailVerified) {
            profile.isEmailVerified = user.emailVerified;
            profile.updatedAt = new Date();
            
            await setDoc(doc(db, 'users', user.uid), {
              isEmailVerified: user.emailVerified,
              updatedAt: profile.updatedAt
            }, { merge: true });
          }
          
          setUserProfile(profile);
        } else {
          // Create profile for existing user (migration case)
          const profileData = await createUserProfile(user);
          setUserProfile(profileData);
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
