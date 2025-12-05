
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RatingData {
  rating: number;
  totalRatings: number;
  loading: boolean;
}

export const useContractorRating = (contractorId: string): RatingData => {
  const [ratingData, setRatingData] = useState<RatingData>({
    rating: 0,
    totalRatings: 0,
    loading: true
  });

  useEffect(() => {
    if (!contractorId) {
      setRatingData({ rating: 0, totalRatings: 0, loading: false });
      return;
    }

    const ratingsQuery = query(
      collection(db, 'ratings'),
      where('contractorId', '==', contractorId)
    );

    const unsubscribe = onSnapshot(
      ratingsQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setRatingData({ rating: 0, totalRatings: 0, loading: false });
          return;
        }
        const ratings = snapshot.docs.map(doc => doc.data().rating as number);
        const totalRatings = ratings.length;
        const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings;

        setRatingData({
          rating: Math.round(averageRating * 10) / 10,
          totalRatings,
          loading: false
        });
      },
      (error) => {
        console.error('Error fetching contractor rating:', error);
        setRatingData({ rating: 0, totalRatings: 0, loading: false });
      }
    );

    return () => unsubscribe();
  }, [contractorId]);

  return ratingData;
};
