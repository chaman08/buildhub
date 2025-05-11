
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContractorProps {
  id: number;
  name: string;
  profileImage: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  yearsExperience: number;
  verified: boolean;
}

const ContractorCard = ({
  id,
  name,
  profileImage,
  category,
  location,
  rating,
  reviewCount,
  description,
  yearsExperience,
  verified,
}: ContractorProps) => {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 border border-gray-100">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Profile Image */}
        <div className="sm:w-1/4">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={profileImage}
              alt={`${name} profile`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="sm:w-3/4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {name}
                {verified && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </h3>
              <p className="text-gray-600">{category}</p>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center">
              <div className="flex mr-1">{renderStars(rating)}</div>
              <span className="text-gray-600 text-sm">
                ({reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="mb-3 flex items-center text-gray-600 text-sm">
            <span className="mr-3">📍 {location}</span>
            <span>⏱️ {yearsExperience} years experience</span>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-4 line-clamp-2">{description}</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Link
              to={`/contractors/${id}`}
              className="button-outline text-center"
            >
              View Profile
            </Link>
            <Link
              to={`/request-quote/${id}`}
              className="button-primary text-center"
            >
              Request Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorCard;
