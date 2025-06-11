
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
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

    const fetchRating = async () => {
      try {
        const ratingsQuery = query(
          collection(db, 'ratings'),
          where('contractorId', '==', contractorId)
        );
        
        const snapshot = await getDocs(ratingsQuery);
        
        if (snapshot.empty) {
          setRatingData({ rating: 0, totalRatings: 0, loading: false });
          return;
        }

        const ratings = snapshot.docs.map(doc => doc.data().rating as number);
        const totalRatings = ratings.length;
        const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings;

        setRatingData({
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          totalRatings,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching contractor rating:', error);
        setRatingData({ rating: 0, totalRatings: 0, loading: false });
      }
    };

    fetchRating();
  }, [contractorId]);

  return ratingData;
};
