const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Product title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Product description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Electronics',
      'Computers',
      'Smart Home',
      'Arts & Crafts',
      'Automotive',
      'Baby',
      'Beauty & Personal Care',
      'Books',
      'Fashion',
      'Health & Household',
      'Home & Kitchen',
      'Industrial & Scientific',
      'Luggage',
      'Movies & TV',
      'Music',
      'Pet Supplies',
      'Software',
      'Sports & Outdoors',
      'Tools & Home Improvement',
      'Toys & Games',
      'Video Games'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  images: [{
    url: {
      type: String,
      required: true,
      // Amazon image URL pattern validation
      match: [/^https:\/\/(m\.)?media-amazon\.com\/images\/.*\.(jpg|jpeg|png|gif|webp)$/i, 'Please provide a valid Amazon image URL']
    },
    alt: {
      type: String,
      default: function() { return this.parent().title; }
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  thumbnails: [{
    type: String,
    match: [/^https:\/\/(m\.)?media-amazon\.com\/images\/.*\.(jpg|jpeg|png|gif|webp)$/i, 'Please provide a valid Amazon image URL']
  }],
  specifications: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  features: [{
    type: String,
    maxlength: [200, 'Feature description cannot exceed 200 characters']
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      enum: ['inches', 'cm', 'mm'],
      default: 'inches'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  variants: [{
    name: String, // e.g., "Color", "Size"
    options: [{
      value: String, // e.g., "Red", "Large"
      price: Number,
      stock: Number,
      sku: String,
      images: [String]
    }]
  }],
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    }
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amazonChoice: {
    type: Boolean,
    default: false
  },
  primeEligible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
productSchema.index({ title: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1, numReviews: -1 });
productSchema.index({ isActive: 1, stock: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ tags: 1 });

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return this.originalPrice - this.price;
  }
  return 0;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images.length > 0 ? this.images[0].url : '');
});

// Virtual for availability status
productSchema.virtual('availability').get(function() {
  if (this.stock > 20) return 'In Stock';
  if (this.stock > 0) return `Only ${this.stock} left in stock`;
  return 'Out of Stock';
});

// Method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return this.save();
  }

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10; // Round to 1 decimal
  this.numReviews = this.reviews.length;
  
  return this.save();
};

// Method to add review
productSchema.methods.addReview = function(userId, name, rating, comment, verifiedPurchase = false) {
  // Check if user already reviewed this product
  const existingReview = this.reviews.find(review => 
    review.user.toString() === userId.toString()
  );

  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }

  this.reviews.push({
    user: userId,
    name,
    rating,
    comment,
    verifiedPurchase
  });

  return this.calculateAverageRating();
};

// Method to update stock
productSchema.methods.updateStock = function(quantity, operation = 'subtract') {
  if (operation === 'subtract') {
    if (this.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
  } else if (operation === 'add') {
    this.stock += quantity;
  }
  
  return this.save();
};

// Static method for search
productSchema.statics.search = function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    rating,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = options;

  let searchQuery = { isActive: true };

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Category filter
  if (category && category !== 'all') {
    searchQuery.category = category;
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    searchQuery.price = {};
    if (minPrice !== undefined) searchQuery.price.$gte = minPrice;
    if (maxPrice !== undefined) searchQuery.price.$lte = maxPrice;
  }

  // Rating filter
  if (rating) {
    searchQuery.rating = { $gte: rating };
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  return this.find(searchQuery)
    .populate('seller', 'firstName lastName')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .select('-reviews'); // Exclude reviews for performance
};

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Ensure at least one image is marked as primary
  if (this.images.length > 0 && !this.images.some(img => img.isPrimary)) {
    this.images[0].isPrimary = true;
  }

  // Calculate discount percentage if originalPrice exists
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);