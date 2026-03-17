const Notification = require('../models/Notification');
const { getNotificationQueue } = require('../queues');

const createNotification = async ({ userId, message, type, grievanceId }) => {
  try {
    const queue = getNotificationQueue();
    await queue.add('create-notification', {
      userId,
      message,
      type,
      grievanceId,
    });
  } catch (error) {
    console.error('Failed to queue notification:', error.message);
    // Fallback: create directly
    await Notification.create({ userId, message, type, grievanceId });
  }
};

const notifyGrievanceSubmitted = async (userId, ticketId) => {
  await createNotification({
    userId,
    message: `Your grievance ${ticketId} has been submitted successfully.`,
    type: 'grievance_submitted',
  });
};

const notifyOfficerAssigned = async (userId, officerId, ticketId) => {
  await createNotification({
    userId,
    message: `An officer has been assigned to your grievance ${ticketId}.`,
    type: 'officer_assigned',
  });
  await createNotification({
    userId: officerId,
    message: `You have been assigned to grievance ${ticketId}.`,
    type: 'officer_assigned',
  });
};

const notifyStatusUpdated = async (userId, ticketId, newStatus) => {
  await createNotification({
    userId,
    message: `Your grievance ${ticketId} status has been updated to: ${newStatus.replace('_', ' ')}.`,
    type: 'status_updated',
  });
};

const notifyGrievanceResolved = async (userId, ticketId) => {
  await createNotification({
    userId,
    message: `Your grievance ${ticketId} has been resolved. Thank you for your patience.`,
    type: 'grievance_resolved',
  });
};

module.exports = {
  createNotification,
  notifyGrievanceSubmitted,
  notifyOfficerAssigned,
  notifyStatusUpdated,
  notifyGrievanceResolved,
};
