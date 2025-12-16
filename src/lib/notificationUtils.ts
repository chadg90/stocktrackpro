import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { firebaseDb } from './firebase';
import { NotificationType } from '@/app/dashboard/components/NotificationItem';

export interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  company_id: string;
  user_id: string;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Creates a notification in Firestore
 * @param params Notification parameters
 * @returns Promise that resolves when notification is created
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  if (!firebaseDb) {
    console.error('Firebase DB not initialized');
    return;
  }

  try {
    await addDoc(collection(firebaseDb, 'notifications'), {
      ...params,
      read: false,
      created_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Creates a notification for all managers in a company (managers only, not admins)
 * @param params Notification parameters (without user_id)
 * @returns Promise that resolves when notifications are created
 */
export async function createNotificationForCompanyManagers(
  params: Omit<CreateNotificationParams, 'user_id'>
): Promise<void> {
  if (!firebaseDb) {
    console.error('Firebase DB not initialized');
    return;
  }

  try {
    // Fetch all managers in the company (managers only, not admins)
    const { query, where, getDocs, collection: firestoreCollection } = await import('firebase/firestore');
    const profilesQuery = query(
      firestoreCollection(firebaseDb, 'profiles'),
      where('company_id', '==', params.company_id),
      where('role', '==', 'manager')
    );
    
    const profilesSnap = await getDocs(profilesQuery);
    const userIds = profilesSnap.docs.map(doc => doc.id);

    // Create notification for each manager
    await Promise.all(
      userIds.map(userId =>
        createNotification({
          ...params,
          user_id: userId,
        })
      )
    );
  } catch (error) {
    console.error('Error creating notifications for company managers:', error);
  }
}
