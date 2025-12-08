import { UserProfile } from '@/contexts/AuthContext';

export type TrustAction = 'bid' | 'message';

const MIN_KYC_STATUSES: Array<UserProfile['kycStatus']> = [
  'pending',
  'under_review',
  'verified'
];

export const hasVerifiedContact = (profile?: UserProfile | null): boolean => {
  return !!profile && (profile.isEmailVerified || profile.isPhoneVerified);
};

export const hasCompleteProfile = (profile?: UserProfile | null): boolean => {
  if (!profile) return false;
  if (profile.profileComplete) return true;

  if (profile.userType === 'contractor') {
    return !!(
      profile.fullName &&
      profile.mobile &&
      profile.city &&
      profile.companyName &&
      profile.serviceCategory
    );
  }

  return !!(profile.fullName && profile.mobile && profile.city);
};

export const hasMinimumKyc = (profile?: UserProfile | null): boolean => {
  if (!profile) return false;
  const status = profile.kycStatus || 'not_started';
  return MIN_KYC_STATUSES.includes(status);
};

export const evaluateTrustGate = (
  profile: UserProfile | null,
  action: TrustAction,
  options: { requireKyc?: boolean } = {}
): { allowed: boolean; reason?: string; missing?: 'profile' | 'verification' | 'kyc' | 'auth' } => {
  const actionLabel = action === 'bid' ? 'place bids' : 'send messages';

  if (!profile) {
    return { allowed: false, reason: `Log in to ${actionLabel}.`, missing: 'auth' };
  }

  if (profile.isAdmin) {
    return { allowed: true };
  }

  if (!hasCompleteProfile(profile)) {
    return {
      allowed: false,
      reason: `Complete your profile to ${actionLabel}.`,
      missing: 'profile'
    };
  }

  if (!hasVerifiedContact(profile)) {
    return {
      allowed: false,
      reason: `Verify your email or phone number to ${actionLabel}.`,
      missing: 'verification'
    };
  }

  const requiresKyc = options.requireKyc ?? profile.userType === 'contractor';
  if (requiresKyc && !hasMinimumKyc(profile)) {
    const kycMessage =
      profile.kycStatus === 'rejected'
        ? 'Your KYC was rejected. Re-submit to regain access.'
        : 'Submit KYC to unlock this action.';

    return {
      allowed: false,
      reason: `${kycMessage} You need it to ${actionLabel}.`,
      missing: 'kyc'
    };
  }

  return { allowed: true };
};

export type TrustBadge = {
  label: string;
  className: string;
};

export const buildTrustBadges = (
  profile: Partial<UserProfile> | null | undefined
): TrustBadge[] => {
  if (!profile) return [];

  const badges: TrustBadge[] = [];
  const contactVerified = !!(profile.isEmailVerified || profile.isPhoneVerified);

  if (profile.verified || profile.verificationBadge) {
    badges.push({
      label: 'BuildHub verified',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    });
  }

  badges.push(
    contactVerified
      ? {
          label: 'Contact verified',
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        }
      : {
          label: 'Verification pending',
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        }
  );

  badges.push(
    profile.profileComplete
      ? {
          label: 'Profile complete',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }
      : {
          label: 'Profile incomplete',
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        }
  );

  if (profile.kycStatus) {
    const status = profile.kycStatus;
    switch (status) {
      case 'verified':
        badges.push({
          label: 'KYC verified',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        });
        break;
      case 'pending':
      case 'under_review':
        badges.push({
          label: 'KYC in review',
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        });
        break;
      case 'needs_info':
        badges.push({
          label: 'KYC needs info',
          className: 'bg-orange-50 text-orange-700 border-orange-200'
        });
        break;
      case 'rejected':
        badges.push({
          label: 'KYC rejected',
          className: 'bg-red-50 text-red-700 border-red-200'
        });
        break;
      default:
        break;
    }
  }

  return badges;
};
