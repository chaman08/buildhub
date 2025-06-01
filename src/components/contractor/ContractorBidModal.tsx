
import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { DollarSign, Calendar, FileText, Upload } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetMax?: number;
  location: string;
  startDate: string;
}

interface ContractorBidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onBidSubmitted?: () => void;
}

const ContractorBidModal: React.FC<ContractorBidModalProps> = ({
  open,
  onOpenChange,
  project,
  onBidSubmitted
}) => {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    quotedPrice: '',
    timeline: '',
    message: '',
    attachments: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !project) return;

    if (!formData.quotedPrice || !formData.timeline || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const bidData = {
        projectId: project.id,
        contractorId: currentUser.uid,
        contractorName: userProfile?.fullName || 'Unknown Contractor',
        contractorEmail: userProfile?.email || currentUser.email,
        contractorPhone: userProfile?.mobile || '',
        companyName: userProfile?.companyName || '',
        priceQuoted: parseFloat(formData.quotedPrice),
        timeline: formData.timeline,
        message: formData.message,
        attachments: formData.attachments || null,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log('Submitting bid:', bidData);

      await addDoc(collection(db, 'bids'), bidData);
      
      toast({
        title: "Bid Submitted Successfully",
        description: "Your proposal has been sent to the client. You'll be notified of any updates.",
      });

      // Reset form
      setFormData({
        quotedPrice: '',
        timeline: '',
        message: '',
        attachments: ''
      });
      
      onOpenChange(false);
      if (onBidSubmitted) onBidSubmitted();
      
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        title: "Error",
        description: "Failed to submit bid. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatBudget = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Proposal for: {project.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Project Details</h3>
            <div className="text-sm space-y-1">
              <p><strong>Budget:</strong> {formatBudget(project.budget)}{project.budgetMax && ` - ${formatBudget(project.budgetMax)}`}</p>
              <p><strong>Location:</strong> {project.location}</p>
              <p><strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quoted Price */}
            <div className="space-y-2">
              <Label htmlFor="quotedPrice" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Quoted Price (₹) *
              </Label>
              <Input
                id="quotedPrice"
                name="quotedPrice"
                type="number"
                value={formData.quotedPrice}
                onChange={handleInputChange}
                placeholder="Enter your quote in rupees"
                required
              />
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label htmlFor="timeline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline *
              </Label>
              <Input
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
                placeholder="e.g., 45 days, 2 months, etc."
                required
              />
            </div>

            {/* Proposal Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Proposal Message *
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Describe your approach, experience, and why you're the right choice for this project..."
                rows={6}
                required
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label htmlFor="attachments" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Attachments (Optional)
              </Label>
              <Input
                id="attachments"
                name="attachments"
                value={formData.attachments}
                onChange={handleInputChange}
                placeholder="URLs to portfolio, certificates, or relevant documents"
              />
              <p className="text-xs text-gray-500">
                Share links to your portfolio, certifications, or relevant project images
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Proposal'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractorBidModal;
