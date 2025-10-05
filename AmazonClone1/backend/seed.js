const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amazonclone');

// Sample products with Amazon image URLs
const products = [
  // Electronics Category
  {
    title: 'Amazon Echo Dot (5th Gen) - Smart Speaker with Alexa',
    description: 'The Echo Dot is our most popular smart speaker with Alexa. The improved speaker delivers crisp vocals and balanced bass for full sound. Voice control your entertainment, connect with others, and get information, news, and weather.',
    shortDescription: 'Smart speaker with Alexa, improved audio quality.',
    brand: 'Amazon',
    category: 'Electronics',
    subcategory: 'Smart Speakers',
    price: 49.99,
    originalPrice: 59.99,
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg',
        alt: 'Amazon Echo Dot 5th Gen',
        isPrimary: true
      },
      {
        url: 'https://m.media-amazon.com/images/I/61lTjM8mF2L._AC_SL1000_.jpg',
        alt: 'Echo Dot side view'
      }
    ],
    thumbnails: [
      'https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SX300_SY300_QL70_FMwebp_.jpg'
    ],
    specifications: [
      { name: 'Dimensions', value: '3.9" x 3.9" x 3.5"' },
      { name: 'Weight', value: '10.7 oz' },
      { name: 'Connectivity', value: 'Wi-Fi, Bluetooth' },
      { name: 'Audio', value: '1.6" speaker' }
    ],
    features: [
      'Voice control with Alexa',
      'Improved audio quality',
      'Smart home hub built-in',
      'Works with compatible devices'
    ],
    stock: 50,
    sku: 'ECHO-DOT-5-CHAR',
    isFeatured: true,
    isNewArrival: true,
    primeEligible: true,
    amazonChoice: true,
    tags: ['smart speaker', 'alexa', 'voice control', 'smart home']
  },
  {
    title: 'Apple AirPods Pro (2nd Generation)',
    description: 'AirPods Pro feature Active Noise Cancellation, Transparency mode, and Personalized Spatial Audio. Up to 2x more Active Noise Cancellation than the previous generation.',
    shortDescription: 'Premium wireless earbuds with active noise cancellation.',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Headphones',
    price: 199.99,
    originalPrice: 249.99,
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/61SUj23roXL._AC_SL1500_.jpg',
        alt: 'Apple AirPods Pro 2nd Gen',
        isPrimary: true
      }
    ],
    specifications: [
      { name: 'Battery Life', value: 'Up to 6 hours listening time' },
      { name: 'Case Battery', value: 'More than 24 hours' },
      { name: 'Connectivity', value: 'Bluetooth 5.3' },
      { name: 'Chip', value: 'Apple H2' }
    ],
    features: [
      'Active Noise Cancellation',
      'Transparency mode',
      'Personalized Spatial Audio',
      'Touch control',
      'Find My support'
    ],
    stock: 75,
    sku: 'AIRPODS-PRO-2-WHITE',
    isFeatured: true,
    isBestseller: true,
    primeEligible: true,
    amazonChoice: true,
    tags: ['airpods', 'wireless', 'apple', 'earbuds', 'noise cancellation']
  },
  {
    title: 'Samsung 55" Neo QLED 4K Smart TV (QN55QN85C)',
    description: 'Experience brilliant picture quality with Quantum Matrix Technology and Neural Quantum Processor 4K. Features Object Tracking Sound and Gaming Hub.',
    shortDescription: '55-inch 4K Neo QLED Smart TV with advanced features.',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Televisions',
    price: 1199.99,
    originalPrice: 1499.99,
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/81Vq2ca9dDL._AC_SL1500_.jpg',
        alt: 'Samsung 55-inch Neo QLED TV',
        isPrimary: true
      }
    ],
    specifications: [
      { name: 'Screen Size', value: '55 inches' },
      { name: 'Resolution', value: '4K Ultra HD (3840 x 2160)' },
      { name: 'HDR', value: 'HDR10, HDR10+, HLG' },
      { name: 'Smart Platform', value: 'Tizen OS' }
    ],
    features: [
      'Neo Quantum Processor 4K',
      'Quantum Matrix Technology',
      'Object Tracking Sound',
      'Gaming Hub',
      'Alexa Built-in'
    ],
    stock: 15,
    sku: 'SAMSUNG-QN55QN85C-TV',
    isFeatured: true,
    primeEligible: false,
    tags: ['samsung', 'tv', '4k', 'smart tv', 'neo qled']
  },
  // Fashion Category
  {
    title: 'Levi\'s Men\'s 511 Slim Jeans',
    description: 'The Levi\'s 511 Slim jeans are cut close to the body with a slightly tapered leg. Sits below waist. Slim through hip and thigh.',
    shortDescription: 'Classic slim-fit jeans for men.',
    brand: 'Levi\'s',
    category: 'Fashion',
    subcategory: 'Men\'s Jeans',
    price: 59.99,
    originalPrice: 69.99,
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/71jeoX0rMBL._AC_UY879_.jpg',
        alt: 'Levi\'s 511 Slim Jeans',
        isPrimary: true
      }
    ],
    specifications: [
      { name: 'Fit', value: 'Slim' },
      { name: 'Rise', value: 'Sits below waist' },
      { name: 'Leg Opening', value: '14.75 inches' },
      { name: 'Material', value: '99% Cotton, 1% Elastane' }
    ],
    features: [
      'Slim through hip and thigh',
      'Slightly tapered leg',
      'Classic 5-pocket styling',
      'Zip fly with button closure'
    ],
    stock: 100,
    sku: 'LEVIS-511-SLIM-DARK-32x32',
    isBestseller: true,
    primeEligible: true,
    tags: ['levis', 'jeans', 'slim', 'mens', 'denim']
  },
  {
    title: 'Nike Women\'s Air Max 270 Sneakers',
    description: 'Nike\'s largest heel Air unit yet delivers all-day comfort. The stretchy inner sleeve creates a sock-like fit, and the foam midsole feels incredibly soft.',
    shortDescription: 'Women\'s lifestyle sneakers with Air Max cushioning.',
    brand: 'Nike',
    category: 'Fashion',
    subcategory: 'Women\'s Shoes',
    price: 129.99,
    originalPrice: 150.00,
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/71nF2vvZRlL._AC_UY695_.jpg',
        alt: 'Nike Air Max 270 Women\'s',
        isPrimary: true
      }
    ],
    specifications: [
      { name: 'Upper Material', value: 'Mesh and synthetic' },
      { name: 'Sole Material', value: 'Rubber' },
      { name: 'Closure Type', value: 'Lace-up' },
      { name: 'Heel Height', value: '1.5 inches' }
    ],
    features: [
      'Nike\'s largest heel Air unit',
      'Stretchy inner sleeve',
      'Foam midsole',
      'Rubber outsole',
      'Pull tabs'
    ],
    stock: 80,
    sku: 'NIKE-AIRMAX270-WHITE-SIZE8',
    isFeatured: true,
    primeEligible: true,
    tags: ['nike', 'air max', 'sneakers', 'womens', 'shoes']
  },
  // Home & Kitchen Category  
  {
    title: 'KitchenAid Artisan Series 5-Qt. Stand Mixer',
    description: 'The KitchenAid Artisan Series 5-Quart Tilt-Head Stand Mixer is the perfect culinary companion. Features 325 watts of power and 10 speeds.',
    shortDescription: 'Professional-grade stand mixer for baking and cooking.',
    brand: 'KitchenAid',
    category: 'Home & Kitchen',
    subcategory: 'Small Appliances',
    price: 399.99,
    originalPrice: 499.99,
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/81hkVjmISQL._AC_SL1500_.jpg',
        alt: 'KitchenAid Stand Mixer',
        isPrimary: true
      }
    ],
    specifications: [
      { name: 'Capacity', value: '5 Quarts' },
      { name: 'Power', value: '325 Watts' },
      { name: 'Speeds', value: '10 Speeds' },
      { name: 'Weight', value: '22 pounds' }
    ],
    features: [
      'Tilt-head design',
      '325 watts of power',
      '10 speeds',
      'Pouring shield included',
      'Multiple attachments available'
    ],
    stock: 30,
    sku: 'KITCHENAID-ARTISAN-5QT-RED',
    isFeatured: true,
    primeEligible: true,
    tags: ['kitchenaid', 'mixer', 'baking', 'kitchen', 'appliance']
  },
  // Books Category
  {
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    description: 'The #1 New York Times bestseller. Over 5 million copies sold! Tiny Changes, Remarkable Results.',
    shortDescription: 'Bestselling book on habit formation and productivity.',
    brand: 'Random House',
    category: 'Books',
    subcategory: 'Self-Help',
    price: 13.99,
    originalPrice: 18.00,
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/81YkqyaFVEL._AC_UY218_.jpg',
        alt: 'Atomic Habits Book Cover',
        isPrimary: true
      }
    ],
    specifications: [
      { name: 'Format', value: 'Paperback' },
      { name: 'Pages', value: '320' },
      { name: 'Language', value: 'English' },
      { name: 'Publisher', value: 'Avery' }
    ],
    features: [
      '#1 New York Times bestseller',
      'Over 5 million copies sold',
      'Practical strategies',
      'Based on scientific research'
    ],
    stock: 200,
    sku: 'ATOMIC-HABITS-PAPERBACK',
    isBestseller: true,
    primeEligible: true,
    amazonChoice: true,
    tags: ['self-help', 'habits', 'productivity', 'bestseller', 'james clear']
  }
];

// Sample users data
const users = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password123!',
    role: 'admin',
    addresses: [
      {
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        isDefault: true
      }
    ]
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: 'Password123!',
    role: 'seller',
    addresses: [
      {
        firstName: 'Jane',
        lastName: 'Smith',
        addressLine1: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'United States',
        isDefault: true
      }
    ]
  },
  {
    firstName: 'Customer',
    lastName: 'User',
    email: 'customer@example.com',
    password: 'Password123!',
    role: 'user',
    addresses: [
      {
        firstName: 'Customer',
        lastName: 'User',
        addressLine1: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'United States',
        isDefault: true
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');
    
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords for users
    for (let user of users) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    // Create users
    const createdUsers = await User.create(users);
    console.log('Created users');

    // Add seller ID to products
    const sellerId = createdUsers.find(user => user.role === 'seller')._id;
    const productsWithSeller = products.map(product => ({
      ...product,
      seller: sellerId
    }));

    // Create products
    await Product.create(productsWithSeller);
    console.log('Created products');

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('Sample login credentials:');
    console.log('Admin: john@example.com / Password123!');
    console.log('Seller: jane@example.com / Password123!');
    console.log('Customer: customer@example.com / Password123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();