
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Star, Phone, Mail, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContractorProject {
  id: string;
  title: string;
  description: string;
  serviceType: string;
  categories: string[];
  location: string;
  budget: number;
  budgetMax?: number;
  timeline: string;
  requirements: string;
  contactInfo: string;
  contractorName: string;
  companyName?: string;
  contractorEmail?: string;
  contractorMobile?: string;
  verified: boolean;
  status: string;
  createdAt: any;
}

const ContractorServices = () => {
  const [services, setServices] = useState<ContractorProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchContractorServices();
  }, []);

  const fetchContractorServices = async () => {
    try {
      setLoading(true);
      const servicesQuery = query(
        collection(db, 'contractor_projects'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(servicesQuery);
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContractorProject[];
      
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching contractor services:', error);
      toast({
        title: "Error Loading Services",
        description: "Failed to load contractor services. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !locationFilter || 
                           service.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const formatBudget = (amount: number, maxAmount?: number) => {
    const formatAmount = (amt: number) => {
      if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(1)} Cr`;
      if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)} L`;
      return `₹${amt.toLocaleString('en-IN')}`;
    };

    if (maxAmount && maxAmount !== amount) {
      return `${formatAmount(amount)} - ${formatAmount(maxAmount)}`;
    }
    return `Starting from ${formatAmount(amount)}`;
  };

  const handleContactContractor = (service: ContractorProject) => {
    const message = `Hi ${service.contractorName}, I'm interested in your service: ${service.title}. Please contact me to discuss further.`;
    const phoneNumber = service.contractorMobile || service.contactInfo;
    
    if (phoneNumber) {
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      toast({
        title: "Contact Information",
        description: `Contact: ${service.contactInfo}`,
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading contractor services...</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Contractor Services</h1>
        <p className="text-muted-foreground mb-6">
          Find professional contractors offering various services for your projects.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search services, categories, or contractors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:flex-1"
          />
          <Input
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="md:w-64"
          />
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-500">No contractor services match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 pr-2">{service.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        {service.contractorName}
                      </p>
                      {service.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {service.companyName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {service.companyName}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {service.categories.slice(0, 2).map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                  {service.categories.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{service.categories.length - 2}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-3">{service.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{service.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{formatBudget(service.budget, service.budgetMax)}</span>
                  </div>
                  
                  {service.timeline && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{service.timeline}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t">
                  <Button 
                    onClick={() => handleContactContractor(service)}
                    className="w-full"
                    size="sm"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Contractor
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

export default ContractorServices;
