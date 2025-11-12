import { query } from './db';

type NotificationType = 'info' | 'warning' | 'error' | 'success';

interface CreateNotificationParams {
  userIds: number | number[] | 'all'; // Single user, array of users, or 'all' for all users
  title: string;
  message: string;
  type?: NotificationType;
  relatedCollection?: string;
  relatedDocumentId?: number;
}

/**
 * Create notification(s) for user(s)
 */
export async function createNotification({
  userIds,
  title,
  message,
  type = 'info',
  relatedCollection,
  relatedDocumentId,
}: CreateNotificationParams): Promise<void> {
  try {
    let targetUserIds: number[] = [];

    if (userIds === 'all') {
      // Get all active user IDs
      const result = await query(
        "SELECT id FROM users WHERE status = 'Active'",
        []
      );
      targetUserIds = result.rows.map((row: any) => row.id);
    } else if (Array.isArray(userIds)) {
      targetUserIds = userIds;
    } else {
      targetUserIds = [userIds];
    }

    // Insert notifications for all target users
    const insertPromises = targetUserIds.map((userId) =>
      query(
        `INSERT INTO notifications (user_id, title, message, type, related_collection, related_document_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, title, message, type, relatedCollection || null, relatedDocumentId || null]
      )
    );

    await Promise.all(insertPromises);
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw error - notifications are non-critical
  }
}

/**
 * Create notification for admins and managers only
 */
export async function createAdminNotification({
  title,
  message,
  type = 'info',
  relatedCollection,
  relatedDocumentId,
}: Omit<CreateNotificationParams, 'userIds'>): Promise<void> {
  try {
    // Get admin and manager user IDs
    const result = await query(
      "SELECT id FROM users WHERE role IN ('Admin', 'Manager') AND status = 'Active'",
      []
    );
    const adminUserIds = result.rows.map((row: any) => row.id);

    if (adminUserIds.length > 0) {
      await createNotification({
        userIds: adminUserIds,
        title,
        message,
        type,
        relatedCollection,
        relatedDocumentId,
      });
    }
  } catch (error) {
    console.error('Error creating admin notification:', error);
  }
}
