require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/grievance_db?authSource=admin';

const connectDB = async () => {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
  console.log('✅ MongoDB connected for seeding');
};

// Minimal schemas for seeder
const userSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String, department: String, isActive: { type: Boolean, default: true }, createdAt: { type: Date, default: Date.now },
});
const departmentSchema = new mongoose.Schema({
  name: { type: String, unique: true }, description: String, head: String, isActive: { type: Boolean, default: true }, createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Department = mongoose.model('Department', departmentSchema);

const seed = async () => {
  try {
    await connectDB();

    // Seed departments
    const departments = [
      { name: 'Electricity', description: 'Power supply and electrical infrastructure', head: 'Mr. Ramesh Sharma' },
      { name: 'Water', description: 'Water supply and drainage management', head: 'Ms. Priya Patel' },
      { name: 'Roads', description: 'Road construction and maintenance', head: 'Mr. Suresh Kumar' },
      { name: 'Sanitation', description: 'Waste management and cleanliness', head: 'Ms. Anita Singh' },
      { name: 'Healthcare', description: 'Public health services', head: 'Dr. Rajiv Gupta' },
      { name: 'Education', description: 'Schools and educational facilities', head: 'Ms. Kavita Mehta' },
      { name: 'Public Safety', description: 'Law enforcement and emergency services', head: 'Mr. Vikram Rao' },
      { name: 'Environment', description: 'Environmental protection and parks', head: 'Ms. Sunita Verma' },
      { name: 'Infrastructure', description: 'General infrastructure projects', head: 'Mr. Anil Joshi' },
      { name: 'General', description: 'General grievances', head: 'Mr. Mohan Das' },
    ];

    for (const dept of departments) {
      await Department.findOneAndUpdate({ name: dept.name }, dept, { upsert: true, new: true });
    }
    console.log('✅ Departments seeded');

    // Seed demo users
    const demoUsers = [
      { name: 'Demo Citizen', email: 'citizen@demo.com', password: 'password123', role: 'citizen' },
      { name: 'Demo Officer', email: 'officer@demo.com', password: 'password123', role: 'officer', department: 'Electricity' },
      { name: 'System Admin', email: 'admin@demo.com', password: 'password123', role: 'admin' },
    ];

    for (const u of demoUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        const hashed = await bcrypt.hash(u.password, 12);
        await User.create({ ...u, password: hashed });
        console.log(`✅ Created user: ${u.email}`);
      } else {
        console.log(`ℹ️  User already exists: ${u.email}`);
      }
    }

    console.log('\n🎉 Seeding complete!');
    console.log('Demo credentials:');
    console.log('  Citizen:  citizen@demo.com / password123');
    console.log('  Officer:  officer@demo.com / password123');
    console.log('  Admin:    admin@demo.com   / password123');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
