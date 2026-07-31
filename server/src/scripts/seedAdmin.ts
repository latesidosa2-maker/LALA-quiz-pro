/**
 * Run once after setting up the database:
 *   npm run seed:admin
 *
 * Creates (or promotes) the single admin account defined by ADMIN_EMAIL.
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/DatabaseSchema';
import mongoose from 'mongoose';

const run = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file first.');
    process.exit(1);
  }

  await connectDB();

  // Enforce single-admin: demote any existing admin first.
  await User.updateMany({ role: 'admin' }, { role: 'student' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await User.findOneAndUpdate(
    { email },
    { name: 'Admin', email, password: hashedPassword, role: 'admin' },
    { upsert: true, new: true }
  );

  console.log(`Admin ready: ${admin.email}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
