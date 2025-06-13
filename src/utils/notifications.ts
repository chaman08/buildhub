import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type NotificationType = 'bid_update' | 'project_update' | 'payment' | 'review' | 'message';

interface CreateNotificationParams {
  recipientId: string;
  message: string;
  type: NotificationType;
  projectId?: string;
  projectTitle?: string;
  senderId?: string;
  senderName?: string;
}

export const createNotification = async ({
  recipientId,
  message,
  type,
  projectId,
  projectTitle,
  senderId,
  senderName
}: CreateNotificationParams) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      recipientId,
      message,
      type,
      projectId,
      projectTitle,
      senderId,
      senderName,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Helper functions for common notification types
export const createBidAcceptedNotification = async (
  contractorId: string,
  projectId: string,
  projectTitle: string,
  customerName: string
) => {
  await createNotification({
    recipientId: contractorId,
    message: `Your bid for "${projectTitle}" has been accepted by ${customerName}`,
    type: 'bid_update',
    projectId,
    projectTitle,
    senderName: customerName
  });
};

export const createBidRejectedNotification = async (
  contractorId: string,
  projectId: string,
  projectTitle: string,
  customerName: string
) => {
  await createNotification({
    recipientId: contractorId,
    message: `Your bid for "${projectTitle}" was not selected by ${customerName}`,
    type: 'bid_update',
    projectId,
    projectTitle,
    senderName: customerName
  });
};

export const createPaymentNotification = async (
  contractorId: string,
  projectId: string,
  projectTitle: string,
  amount: number,
  customerName: string
) => {
  await createNotification({
    recipientId: contractorId,
    message: `Payment of ₹${amount} received for "${projectTitle}" from ${customerName}`,
    type: 'payment',
    projectId,
    projectTitle,
    senderName: customerName
  });
};

export const createReviewNotification = async (
  contractorId: string,
  projectId: string,
  projectTitle: string,
  customerName: string,
  rating: number
) => {
  await createNotification({
    recipientId: contractorId,
    message: `You received a ${rating}-star review for "${projectTitle}" from ${customerName}`,
    type: 'review',
    projectId,
    projectTitle,
    senderName: customerName
  });
};

export const createMessageNotification = async (
  recipientId: string,
  senderId: string,
  senderName: string,
  projectId: string,
  projectTitle: string
) => {
  await createNotification({
    recipientId,
    message: `New message from ${senderName} regarding "${projectTitle}"`,
    type: 'message',
    projectId,
    projectTitle,
    senderId,
    senderName
  });
}; 