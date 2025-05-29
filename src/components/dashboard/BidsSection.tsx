
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Phone, Mail, MessageCircle } from 'lucide-react';

const BidsSection: React.FC = () => {
  // Mock data - will be replaced with real data from Firestore
  const bids = [
    {
      id: '1',
      projectTitle: 'Residential House Construction',
      contractorName: 'Raj Construction',
      contractorRating: 4.5,
      quotedPrice: '₹14,50,000',
      timeline: '5 months',
      message: 'We have 10+ years experience in residential construction...',
      status: 'pending',
      submittedDate: '2024-01-16'
    },
    {
      id: '2',
      projectTitle: 'Office Interior Renovation',
      contractorName: 'Modern Interiors',
      contractorRating: 4.8,
      quotedPrice: '₹7,80,000',
      timeline: '3 months',
      message: 'Specializing in modern office interior designs...',
      status: 'shortlisted',
      submittedDate: '2024-01-12'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Bids Received</h2>
      </div>

      {bids.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Bids Yet</h3>
              <p className="text-gray-500">Once you post projects, contractors will start bidding on them.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <Card key={bid.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{bid.projectTitle}</CardTitle>
                    <Badge className={getStatusColor(bid.status)} variant="secondary">
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(bid.submittedDate).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {bid.contractorName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{bid.contractorName}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{bid.contractorRating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-green-600">{bid.quotedPrice}</div>
                    <div className="text-sm text-gray-500">Timeline: {bid.timeline}</div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                  "{bid.message}"
                </p>

                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" className="flex-1">
                    Accept Bid
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Shortlist
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BidsSection;
