/**
 * Seed demo seller + sample products for local testing.
 *
 *   node scripts/seedDemoData.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Category = require('../models/Category');
const Product = require('../models/Product');

const seed = async () => {
  const email = 'seller.demo@nilelink.local';
  const password = 'Seller@12345';

  let user = await User.findByEmail(email);
  if (!user) {
    user = await User.create({
      name: 'Demo Seller',
      email,
      phone: '0711000000',
      password: await bcrypt.hash(password, 12),
      role: 'seller',
      city: 'Nairobi',
      county: 'Nairobi',
      account_status: 'active',
    });
    console.log('[seedDemo] Seller user created');
  } else {
    console.log('[seedDemo] Seller user already exists');
  }

  let seller = await Seller.findByUserId(user.id);
  if (!seller) {
    seller = await Seller.create({
      user_id: user.id,
      business_name: 'Nile Heritage Supplies',
      business_description: 'Traditional South Sudanese foods and crafts for diaspora in Kenya.',
      business_location: 'Eastleigh, Nairobi',
      contact_information: email,
      verification_status: 'approved',
    });
    console.log('[seedDemo] Seller profile created + approved');
  } else if (seller.verification_status !== 'approved') {
    seller = await Seller.updateVerificationStatus(seller.id, 'approved');
    console.log('[seedDemo] Seller approved');
  }

  const { categories } = await Category.findAll({ status: 'active', limit: 20 });
  if (!categories.length) {
    throw new Error('No categories found. Run database/schema.sql in Supabase first.');
  }

  const byName = Object.fromEntries(categories.map((c) => [c.name, c.id]));
  const samples = [
    {
      name: 'Kisra Flour Mix',
      description: 'Ready mix for traditional South Sudanese kisra flatbread.',
      price: 850,
      stock_quantity: 40,
      category_id: byName['Traditional Foods'] || categories[0].id,
      location: 'Nairobi',
      images: [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Handwoven Basket',
      description: 'Handmade basket crafted by South Sudanese artisans.',
      price: 2200,
      stock_quantity: 15,
      category_id: byName['Handmade Products'] || categories[0].id,
      location: 'Nairobi',
      images: [
        'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Cultural Beaded Necklace',
      description: 'Traditional beadwork necklace for cultural occasions.',
      price: 1800,
      stock_quantity: 25,
      category_id: byName['Cultural Products'] || categories[0].id,
      location: 'Nairobi',
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Shea Butter Cream',
      description: 'Natural shea-based cosmetic cream popular in South Sudanese homes.',
      price: 950,
      stock_quantity: 50,
      category_id: byName['Cosmetics'] || categories[0].id,
      location: 'Nairobi',
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      ],
    },
  ];

  const existing = await Product.findAll({ sellerId: seller.id, status: 'active', limit: 50 });
  if (existing.products.length === 0) {
    for (const item of samples) {
      await Product.create({
        seller_id: seller.id,
        status: 'active',
        average_rating: 0,
        ...item,
      });
    }
    console.log(`[seedDemo] Created ${samples.length} sample products`);
  } else {
    console.log(`[seedDemo] Products already exist (${existing.products.length})`);
  }

  console.log('\nDemo accounts:');
  console.log('  Admin:    admin@nilelink.local / Admin@12345');
  console.log(`  Seller:   ${email} / ${password}`);
  console.log('  Customer: customer.phase3@test.local / Test1234 (if seeded earlier)');
  process.exit(0);
};

seed().catch((err) => {
  console.error('[seedDemo] Failed:', err.message || err);
  process.exit(1);
});
