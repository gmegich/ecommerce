/**
 * Seed a default admin account (run once).
 *
 *   node scripts/seedAdmin.js
 *
 * Optional env overrides:
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@nilelink.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.ADMIN_NAME || 'System Administrator';
  const phone = process.env.ADMIN_PHONE || null;

  const existing = await User.findByEmail(email);
  if (existing) {
    console.log(`[seedAdmin] Admin already exists: ${email}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 12);
  const admin = await User.create({
    name,
    email,
    phone,
    password: hashed,
    role: 'admin',
    account_status: 'active',
  });

  console.log('[seedAdmin] Admin created successfully');
  console.log(`  email: ${admin.email}`);
  console.log(`  password: ${password}`);
  console.log('  Change this password after first login.');
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('[seedAdmin] Failed:', err.message || err);
  process.exit(1);
});
