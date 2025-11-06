import { collection, addDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

type ActivityAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'view';

interface ActivityLog {
  action: ActivityAction;
  collection: string;
  documentId?: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  details: string;
  metadata?: Record<string, any>;
}

export async function logActivity(
  action: ActivityAction,
  collectionName: string,
  details: string,
  userId: string,
  userName: string,
  userRole: string,
  documentId?: string,
  metadata?: Record<string, any>
) {
  try {
    const { firestore } = initializeFirebase();

    const log: ActivityLog = {
      action,
      collection: collectionName,
      documentId,
      userId,
      userName,
      userRole,
      timestamp: new Date().toISOString(),
      details,
      metadata,
    };

    await addDoc(collection(firestore, 'activity_logs'), log);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to prevent breaking the main operation
  }
}

export function getActivityDescription(action: ActivityAction, collection: string, details: string): string {
  const actionMap: Record<ActivityAction, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    login: 'Logged in',
    logout: 'Logged out',
    export: 'Exported',
    view: 'Viewed',
  };

  return `${actionMap[action]} ${collection}: ${details}`;
}
