const { Queue } = require('bullmq');
const { getRedis } = require('../config/redis');

let notificationQueue;
let aiClassificationQueue;

const getNotificationQueue = () => {
  if (!notificationQueue) {
    notificationQueue = new Queue('notifications', {
      connection: getRedis(),
    });
  }
  return notificationQueue;
};

const getAIClassificationQueue = () => {
  if (!aiClassificationQueue) {
    aiClassificationQueue = new Queue('ai-classification', {
      connection: getRedis(),
    });
  }
  return aiClassificationQueue;
};

module.exports = { getNotificationQueue, getAIClassificationQueue };
