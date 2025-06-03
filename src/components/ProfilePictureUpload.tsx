
import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpdate?: (newUrl: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ 
  currentPhotoUrl, 
  onPhotoUpdate 
}) => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [uploading, setUploading] = useState(false);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Create a reference to the storage location
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile-pictures/${currentUser.uid}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      // Upload the file
      console.log('Uploading file:', file.name);
      const uploadResult = await uploadBytes(storageRef, file);
      console.log('Upload completed:', uploadResult);

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Download URL:', downloadURL);

      // Update user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        profilePicture: downloadURL,
        updatedAt: new Date()
      });

      // Refresh user profile
      await refreshUserProfile();

      // Call the callback if provided
      if (onPhotoUpdate) {
        onPhotoUpdate(downloadURL);
      }

      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully."
      });

    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={currentPhotoUrl || userProfile?.profilePicture} />
        <AvatarFallback className="text-xl">
          {userProfile?.fullName ? getInitials(userProfile.fullName) : 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="profile-picture-upload"
          disabled={uploading}
        />
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          disabled={uploading}
          asChild
        >
          <label htmlFor="profile-picture-upload" className="cursor-pointer">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {uploading ? 'Uploading...' : 'Change Photo'}
          </label>
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Supported formats: JPG, PNG, GIF<br />
        Maximum size: 5MB
      </p>
    </div>
  );
};

export default ProfilePictureUpload;
