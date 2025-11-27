
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { doc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractorId: string;
  contractorName: string;
  projectId: string;
  projectTitle: string;
  onSubmitted?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  open,
  onOpenChange,
  contractorId,
  contractorName,
  projectId,
  projectTitle,
  onSubmitted
}) => {
  const { currentUser, userProfile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitRating = async () => {
    if (!currentUser || !rating) return;

    setSubmitting(true);
    try {
      // Add rating to ratings collection
      await addDoc(collection(db, 'ratings'), {
        contractorId,
        customerId: currentUser.uid,
        customerName: userProfile?.fullName || 'Anonymous',
        projectId,
        projectTitle,
        rating,
        review: review.trim(),
        createdAt: serverTimestamp()
      });

      // Update project status to include rating
      await updateDoc(doc(db, 'projects', projectId), {
        rated: true,
        ratedAt: serverTimestamp()
      });

      onOpenChange(false);
      setRating(0);
      setReview('');
      onSubmitted?.();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Contractor</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-medium text-lg">{contractorName}</h3>
            <p className="text-sm text-gray-600">{projectTitle}</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">How was your experience?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience working with this contractor..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={!rating || submitting}
              className="flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
