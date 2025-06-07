import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextProps {
  children: ReactNode;
}

// Define the structure of a user profile
interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  mobile: string;
  userType: 'customer' | 'contractor';
  profileComplete: boolean;
  createdAt: any;
  profilePicture?: string;
  companyName?: string;
  serviceCategory?: string;
  experience?: string;
  location?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  rating?: number;
  reviewCount?: number;
  isPhoneVerified?: boolean;
  countryCode?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  setupRecaptcha: (elementId: string) => RecaptchaVerifier;
  verifyPhoneNumber: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  confirmVerificationCode: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signup = async (email: string, password: string, userData: Partial<UserProfile>) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const profileData: UserProfile = {
      uid: user.uid,
      email: user.email!,
      fullName: userData.fullName || '',
      mobile: userData.mobile || '',
      userType: userData.userType || 'customer',
      profileComplete: false,
      createdAt: new Date(),
      isPhoneVerified: false,
      countryCode: userData.countryCode || '+91'
    };

    await setDoc(doc(db, 'users', user.uid), profileData);
    setUserProfile(profileData);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      const profileData: UserProfile = {
        uid: user.uid,
        email: user.email!,
        fullName: user.displayName || '',
        mobile: '',
        userType: 'customer',
        profileComplete: false,
        createdAt: new Date(),
        profilePicture: user.photoURL || undefined,
        isPhoneVerified: false,
        countryCode: '+91'
      };

      await setDoc(doc(db, 'users', user.uid), profileData);
      setUserProfile(profileData);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user logged in');

    await updateDoc(doc(db, 'users', currentUser.uid), data);
    setUserProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const setupRecaptcha = (elementId: string): RecaptchaVerifier => {
    return new RecaptchaVerifier(auth, elementId, {
      'size': 'invisible',
      'callback': () => {
        console.log('reCAPTCHA solved');
      }
    });
  };

  const verifyPhoneNumber = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const confirmVerificationCode = async (confirmationResult: ConfirmationResult, code: string): Promise<void> => {
    await confirmationResult.confirm(code);
    
    if (currentUser) {
      await updateProfile({
        isPhoneVerified: true
      });
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    setupRecaptcha,
    verifyPhoneNumber,
    confirmVerificationCode,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
