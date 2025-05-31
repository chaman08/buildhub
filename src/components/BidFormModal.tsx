import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const bidSchema = z.object({
  priceQuoted: z.number().min(1, 'Price must be greater than 0'),
  timeline: z.string().min(1, 'Timeline is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type BidFormData = z.infer<typeof bidSchema>;

interface BidFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    title: string;
    budget: number;
    budgetMax?: number;
    postedBy: string;
  };
}

const BidFormModal: React.FC<BidFormModalProps> = ({ open, onOpenChange, project }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      priceQuoted: project.budget,
      timeline: '',
      message: '',
    },
  });

  const onSubmit = async (data: BidFormData) => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to place a bid',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'bids'), {
        projectId: project.id,
        contractorId: currentUser.uid,
        customerId: project.postedBy,
        priceQuoted: data.priceQuoted,
        timeline: data.timeline,
        message: data.message,
        status: 'pending',
        createdAt: Timestamp.now(),
      });

      toast({
        title: 'Bid placed successfully!',
        description: 'Your bid has been sent to the customer.',
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: 'Error placing bid',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudget = (amount: number) => {
    if (!amount || isNaN(amount)) {
      console.log('Invalid amount detected:', amount);
      return '₹0';
    }
    
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>
            Submit your bid for "{project.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Customer Budget Range:</p>
          <p className="font-semibold">
            {formatBudget(project.budget)}
            {project.budgetMax && project.budgetMax !== project.budget && 
              ` - ${formatBudget(project.budgetMax)}`
            }
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="priceQuoted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Quoted Price (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your price"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Timeline</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 3 months, 6 weeks"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to Customer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell the customer about your experience, approach, or any questions..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BidFormModal;
