require('dotenv').config();
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const axios = require('axios');

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const MONGODB_URI = process.env.MONGODB_URI;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

// Redis connection
const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
    console.log('✅ Worker MongoDB connected');
  } catch (error) {
    console.error('❌ Worker MongoDB error:', error.message);
    setTimeout(connectDB, 5000);
  }
};

// Load models
const Grievance = require('./models/Grievance');
const Notification = require('./models/Notification');

// AI Classification worker
const aiWorker = new Worker('ai-classification', async (job) => {
  const { grievanceId, title, description, category } = job.data;
  console.log(`🤖 Processing AI classification for grievance ${grievanceId}`);

  try {
    // Simulated AI Classification using keyword matching
    const textToAnalyze = `${title} ${description} ${category}`.toLowerCase();
    
    let department = 'General';
    let priority = 'Medium';

    // Keyword to Department Mapping
    const deptKeywords = {
      'Electricity': ['power', 'electricity', 'outage', 'voltage', 'wire', 'pole', 'transformer', 'shock', 'spark'],
      'Water': ['water', 'leak', 'pipe', 'drainage', 'sewage', 'drinking', 'plumbing', 'flood'],
      'Roads': ['road', 'pothole', 'street', 'highway', 'traffic', 'pavement', 'asphalt'],
      'Sanitation': ['garbage', 'trash', 'waste', 'cleaning', 'sweep', 'dustbin', 'smell', 'hygiene'],
      'Healthcare': ['hospital', 'clinic', 'doctor', 'medicine', 'health', 'ambulance', 'disease'],
      'Education': ['school', 'college', 'teacher', 'student', 'exam', 'syllabus', 'education'],
      'Public Safety': ['police', 'crime', 'safety', 'theft', 'harassment', 'security', 'emergency'],
      'Environment': ['tree', 'park', 'pollution', 'noise', 'smoke', 'air', 'environment']
    };

    // Keyword to Priority Mapping
    const criticalKeywords = ['emergency', 'death', 'serious', 'fire', 'accident', 'immediate', 'urgent'];
    const highKeywords = ['outage', 'leak', 'broken', 'theft', 'danger', 'hazard'];
    const lowKeywords = ['suggestion', 'feedback', 'inquiry', 'question'];

    // Determine priority
    if (criticalKeywords.some(kw => textToAnalyze.includes(kw))) {
      priority = 'Critical';
    } else if (highKeywords.some(kw => textToAnalyze.includes(kw))) {
      priority = 'High';
    } else if (lowKeywords.some(kw => textToAnalyze.includes(kw))) {
      priority = 'Low';
    }

    // Determine department
    for (const [dept, keywords] of Object.entries(deptKeywords)) {
      if (keywords.some(kw => textToAnalyze.includes(kw))) {
        department = dept;
        break; // Stop at first match
      }
    }

    // Simulated network delay (1-2 seconds) to look like AI processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    await Grievance.findByIdAndUpdate(grievanceId, { department, priority, aiClassified: true });
    console.log(`✅ AI (Simulated) classified grievance ${grievanceId}: dept=${department}, priority=${priority}`);
  } catch (error) {
    console.error(`❌ Simulated AI classification failed for ${grievanceId}:`, error.message);
    await Grievance.findByIdAndUpdate(grievanceId, { aiClassified: false });
  }
}, { connection, concurrency: 2 });

// Notification worker
const notificationWorker = new Worker('notifications', async (job) => {
  const { userId, message, type, grievanceId } = job.data;
  console.log(`🔔 Processing notification for user ${userId}: ${type}`);

  try {
    await Notification.create({ userId, message, type, grievanceId: grievanceId || null });
    console.log(`✅ Notification created for user ${userId}`);
  } catch (error) {
    console.error(`❌ Notification creation failed:`, error.message);
    throw error;
  }
}, { connection, concurrency: 5 });

// Event handlers
aiWorker.on('completed', (job) => console.log(`✅ AI job ${job.id} completed`));
aiWorker.on('failed', (job, err) => console.error(`❌ AI job ${job?.id} failed:`, err.message));
notificationWorker.on('completed', (job) => console.log(`✅ Notification job ${job.id} completed`));
notificationWorker.on('failed', (job, err) => console.error(`❌ Notification job ${job?.id} failed:`, err.message));

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Worker shutting down...');
  await aiWorker.close();
  await notificationWorker.close();
  process.exit(0);
});

connectDB();
console.log('🚀 Worker service started - listening for jobs...');
