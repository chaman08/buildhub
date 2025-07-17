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
  ConfirmationResult,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
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
  isAdmin?: boolean;
  profileComplete?: boolean;
  verified?: boolean;
  // Contractor specific fields
  companyName?: string;
  serviceCategory?: string;
  experience?: number;
  bio?: string;
  certifications?: string[];
  documents?: string[];
  verificationBadge?: boolean;
  rating?: number;
  reviewsCount?: number;
  // Customer specific fields
  projectsPosted?: number;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  loginCount?: number;
  phoneLinkingPending?: boolean; // Added for phone linking
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
  sendPhoneOTP: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyPhoneOTP: (confirmationResult: ConfirmationResult, otp: string, userData?: Partial<UserProfile>) => Promise<void>;
  linkPhoneToUser: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyAndLinkPhone: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  isVerificationComplete: () => boolean;
  isAdmin: () => boolean;
  isProfileComplete: () => boolean;
  markProfileComplete: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add validation functions
const validatePhoneNumber = (phone: string): boolean => {
  // Indian phone number format: +91 followed by 10 digits
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCompanyName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100;
};

const validateServiceCategory = (category: string): boolean => {
  const validCategories = [
    'Civil Construction', 'Electrical', 'Plumbing', 'Painting', 'Carpentry',
    'Interior Design', 'Architecture', 'Landscaping', 'Roofing', 'Flooring'
  ];
  return validCategories.includes(category);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState<{[key: string]: number}>({});
  const [lastLoginAttempt, setLastLoginAttempt] = useState<{[key: string]: Date}>({});

  // Rate limiting check
  const checkRateLimit = (email: string): boolean => {
    const now = new Date();
    const lastAttempt = lastLoginAttempt[email];
    const attempts = loginAttempts[email] || 0;

    // Reset attempts after 1 hour
    if (lastAttempt && (now.getTime() - lastAttempt.getTime() > 3600000)) {
      setLoginAttempts({...loginAttempts, [email]: 0});
      setLastLoginAttempt({...lastLoginAttempt, [email]: now});
      return true;
    }

    // Allow max 5 attempts per hour
    if (attempts >= 5) {
      return false;
    }

    setLoginAttempts({...loginAttempts, [email]: attempts + 1});
    setLastLoginAttempt({...lastLoginAttempt, [email]: now});
    return true;
  };

  const createUserProfile = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // For Google sign-in, we'll create a basic profile first
      const isGoogleUser = user.providerData.some(provider => provider.providerId === 'google.com');
      const isPhoneUser = user.providerData.some(provider => provider.providerId === 'phone');
      
      if (isGoogleUser) {
        const now = new Date();
        const profileData: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          fullName: user.displayName || '',
          userType: 'customer', // Set default user type
          mobile: '', // Will be updated in profile completion
          city: '', // Will be updated in profile completion
          profilePicture: user.photoURL || '',
          isEmailVerified: true,
          isPhoneVerified: false,
          isDocumentVerified: false,
          isAdmin: false,
          profileComplete: false,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
          loginCount: 1
        };
        
        await setDoc(userRef, profileData);
        return profileData;
      } else if (isPhoneUser) {
        // For phone users, create minimal profile initially
        const now = new Date();
        const profileData: UserProfile = {
          uid: user.uid,
          email: '',
          fullName: additionalData.fullName || 'User',
          userType: additionalData.userType || 'customer',
          mobile: additionalData.mobile || '',
          city: additionalData.city || '',
          occupation: additionalData.occupation || '',
          profilePicture: additionalData.profilePicture || '',
          isEmailVerified: false,
          isPhoneVerified: true,
          isDocumentVerified: false,
          isAdmin: false,
          profileComplete: additionalData.profileComplete || false,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
          loginCount: 1,
          ...additionalData
        };
        
        await setDoc(userRef, profileData);
        return profileData;
      } else {
        // For regular sign-up, validate required fields
        if (!additionalData.fullName || !additionalData.mobile) {
          throw new Error('Full name and mobile number are required');
        }

        if (!validatePhoneNumber(additionalData.mobile)) {
          throw new Error('Invalid phone number format. Please use format: +91XXXXXXXXXX');
        }

        if (additionalData.email && !validateEmail(additionalData.email)) {
          throw new Error('Invalid email format');
        }

        if (additionalData.userType === 'contractor') {
          if (!additionalData.companyName || !additionalData.serviceCategory) {
            throw new Error('Company name and service category are required for contractors');
          }

          if (!validateCompanyName(additionalData.companyName)) {
            throw new Error('Company name must be between 2 and 100 characters');
          }

          if (!validateServiceCategory(additionalData.serviceCategory)) {
            throw new Error('Invalid service category');
          }
        }

        const now = new Date();
        const profileData: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          fullName: additionalData.fullName,
          userType: additionalData.userType || 'customer',
          mobile: additionalData.mobile,
          city: additionalData.city || '',
          occupation: additionalData.occupation || '',
          profilePicture: additionalData.profilePicture || user.photoURL || '',
          isEmailVerified: user.emailVerified,
          isPhoneVerified: additionalData.isPhoneVerified || false,
          isDocumentVerified: false,
          isAdmin: false,
          profileComplete: additionalData.profileComplete || false,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
          loginCount: 1,
          ...additionalData
        };
        
        await setDoc(userRef, profileData);
        return profileData;
      }
    }
    
    // Update last login for existing user
    const now = new Date();
    await updateDoc(userRef, {
      lastLoginAt: now,
      loginCount: increment(1),
      updatedAt: now
    });
    
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
      isPhoneVerified: false,
      profileComplete: false
    });
    
    setUserProfile(profileData);
  };

  // New function to link phone number to existing user
  const linkPhoneToUser = async (phoneNumber: string): Promise<ConfirmationResult> => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    const recaptchaVerifier = setupRecaptcha('recaptcha-container');
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  // New function to verify and link phone number
  const verifyAndLinkPhone = async (confirmationResult: ConfirmationResult, otp: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    try {
      await confirmationResult.confirm(otp);
      
      // Update user profile to mark phone as verified
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        isPhoneVerified: true,
        updatedAt: new Date()
      });
      
      await refreshUserProfile();
    } catch (error: any) {
      console.error('Error verifying and linking phone:', error);
      throw error;
    }
  };

  const signupWithPhone = async (phoneNumber: string, userData: Partial<UserProfile>): Promise<ConfirmationResult> => {
    const recaptchaVerifier = setupRecaptcha('recaptcha-container');
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const login = async (email: string, password: string) => {
    if (!checkRateLimit(email)) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    try {
      // Set local persistence to keep user logged in
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
  };

  const loginWithPhone = async (phoneNumber: string): Promise<ConfirmationResult> => {
    const recaptchaVerifier = setupRecaptcha('recaptcha-container');
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Set local persistence to keep user logged in
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      
      console.log('Google sign-in successful, email verified status:', result.user.emailVerified);
      
      // Create initial user profile with Google data
      await createUserProfile(result.user, {
        fullName: result.user.displayName || '',
        email: result.user.email || '',
        profilePicture: result.user.photoURL || '',
        isEmailVerified: true,
        isPhoneVerified: false,
        profileComplete: false,
        userType: 'customer',
        mobile: '',
        city: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        loginCount: 1
      });
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      }
      throw error;
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
      try {
        await currentUser.reload();
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          
          // For Google users, always ensure email is marked as verified
          const isGoogleUser = currentUser.providerData.some(provider => provider.providerId === 'google.com');
          let needsUpdate = false;
          
          if (isGoogleUser && !profile.isEmailVerified) {
            console.log('Updating Google user email verification status');
            profile.isEmailVerified = true;
            needsUpdate = true;
          }
          
          // Update email verification status if changed for any user
          if (profile.isEmailVerified !== currentUser.emailVerified && !isGoogleUser) {
            profile.isEmailVerified = currentUser.emailVerified;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            profile.updatedAt = new Date();
            await setDoc(doc(db, 'users', currentUser.uid), {
              isEmailVerified: profile.isEmailVerified,
              updatedAt: profile.updatedAt
            }, { merge: true });
          }
          
          setUserProfile(profile);
        } else {
          // Only create profile for users without existing profiles
          // For phone users, this should not happen as profile is created during verification
          const isGoogleUser = currentUser.providerData.some(provider => provider.providerId === 'google.com');
          const isPhoneUser = currentUser.providerData.some(provider => provider.providerId === 'phone');
          
          if (isGoogleUser) {
            const profileData = await createUserProfile(currentUser, {
              isEmailVerified: true
            });
            setUserProfile(profileData);
          } else if (isPhoneUser) {
            // For phone users without profile, this indicates an error
            console.error('Phone user without profile found - this should not happen');
          }
        }
      } catch (error) {
        console.error('Error refreshing user profile:', error);
        // Don't throw error, just log it and keep existing profile
      }
    }
  };

  const setupRecaptcha = (elementId: string): RecaptchaVerifier => {
    // Clear any existing recaptcha first
    const existingContainer = document.getElementById(elementId);
    if (existingContainer) {
      existingContainer.innerHTML = '';
    }
    
    return new RecaptchaVerifier(auth, elementId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        // Clear the container and reinitialize if needed
        if (existingContainer) {
          existingContainer.innerHTML = '';
        }
      }
    });
  };

  const sendPhoneOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      // Clear any existing recaptcha first
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }

      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });

      // Render the reCAPTCHA first
      await recaptchaVerifier.render();

      console.log('Sending OTP to:', phoneNumber);
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
      return confirmationResult;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      // Clean up the reCAPTCHA verifier on error
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
      throw error;
    }
  };

  const verifyPhoneOTP = async (confirmationResult: ConfirmationResult, otp: string, userData?: Partial<UserProfile>): Promise<void> => {
    try {
      await confirmationResult.confirm(otp);
      
      if (userData && !currentUser) {
        // This is a new user signup via phone
        const user = auth.currentUser;
        if (user) {
          await createUserProfile(user, {
            ...userData,
            isPhoneVerified: true,
            profileComplete: false
          });
          await refreshUserProfile();
        }
        return;
      }
      
      // This is verification for existing user - update their profile
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          isPhoneVerified: true,
          updatedAt: new Date()
        });
        
        await refreshUserProfile();
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  const isVerificationComplete = (): boolean => {
    if (!userProfile) return false;
    return userProfile.isEmailVerified || userProfile.isPhoneVerified;
  };

  const isAdmin = (): boolean => {
    return userProfile?.isAdmin === true;
  };
  
  const isProfileComplete = (): boolean => {
    if (!userProfile) return false;
    
    // Check if the profile is explicitly marked as complete
    if (userProfile.profileComplete === true) {
      return true;
    }
    
    // If not explicitly marked, check for required fields
    if (userProfile.userType === 'customer') {
      return !!(userProfile.fullName && userProfile.mobile && userProfile.city);
    } else if (userProfile.userType === 'contractor') {
      return !!(
        userProfile.fullName && 
        userProfile.mobile && 
        userProfile.city &&
        userProfile.companyName &&
        userProfile.serviceCategory
      );
    }
    
    return false;
  };
  
  const markProfileComplete = async (): Promise<void> => {
    if (!currentUser || !userProfile) return;
    
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, {
      profileComplete: true,
      updatedAt: new Date()
    }, { merge: true });
    
    await refreshUserProfile();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setCurrentUser(user);
      
      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            
            // For Google users, always ensure email is marked as verified
            const isGoogleUser = user.providerData.some(provider => provider.providerId === 'google.com');
            let needsUpdate = false;
            
            if (isGoogleUser && !profile.isEmailVerified) {
              console.log('Updating Google user email verification status');
              profile.isEmailVerified = true;
              needsUpdate = true;
            }
            
            // Update email verification status if changed for any user
            if (profile.isEmailVerified !== user.emailVerified && !isGoogleUser) {
              profile.isEmailVerified = user.emailVerified;
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              profile.updatedAt = new Date();
              await setDoc(doc(db, 'users', user.uid), {
                isEmailVerified: profile.isEmailVerified,
                updatedAt: profile.updatedAt
              }, { merge: true });
            }
            
            setUserProfile(profile);
          } else {
            // Only create profile for users without existing profiles
            // For phone users, this should not happen as profile is created during verification
            const isGoogleUser = user.providerData.some(provider => provider.providerId === 'google.com');
            const isPhoneUser = user.providerData.some(provider => provider.providerId === 'phone');
            
            if (isGoogleUser) {
              const profileData = await createUserProfile(user, {
                isEmailVerified: true
              });
              setUserProfile(profileData);
            } else if (isPhoneUser) {
              // For phone users without profile, this indicates an error
              console.error('Phone user without profile found - this should not happen');
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          // Don't throw error, just log it
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
    linkPhoneToUser,
    verifyAndLinkPhone,
    isVerificationComplete,
    isAdmin,
    isProfileComplete,
    markProfileComplete
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;