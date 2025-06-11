
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { useContractorRating } from '@/hooks/useContractorRating';

interface ContractorCardProps {
  contractor: {
    id: string;
    fullName: string;
    companyName?: string;
    serviceCategory?: string;
    location?: string;
    bio?: string;
    profilePicture?: string;
    email?: string;
    mobile?: string;
    experience?: string;
  };
  onContact?: (contractorId: string) => void;
  onViewProfile?: (contractorId: string) => void;
}

const ContractorCard: React.FC<ContractorCardProps> = ({
  contractor,
  onContact,
  onViewProfile
}) => {
  const { rating, totalRatings, loading } = useContractorRating(contractor.id);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={contractor.profilePicture} />
            <AvatarFallback className="text-lg">
              {contractor.fullName?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{contractor.fullName}</h3>
                {contractor.companyName && (
                  <p className="text-sm text-gray-600">{contractor.companyName}</p>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-5 w-12 rounded"></div>
                ) : (
                  <>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">
                      {rating > 0 ? rating : 'New'}
                    </span>
                    {totalRatings > 0 && (
                      <span className="text-sm text-gray-500">({totalRatings})</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {contractor.serviceCategory && (
              <Badge variant="secondary" className="mb-2">
                {contractor.serviceCategory}
              </Badge>
            )}

            {contractor.location && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                {contractor.location}
              </div>
            )}

            {contractor.experience && (
              <p className="text-sm text-gray-600 mb-3">
                Experience: {contractor.experience}
              </p>
            )}

            {contractor.bio && (
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {contractor.bio}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewProfile?.(contractor.id)}
                className="flex-1"
              >
                View Profile
              </Button>
              
              <Button
                size="sm"
                onClick={() => onContact?.(contractor.id)}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Contact
              </Button>
              
              {contractor.mobile && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`tel:${contractor.mobile}`)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              )}
              
              {contractor.email && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`mailto:${contractor.email}`)}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractorCard;
