const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const { protect, seller, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products with search, filter, and pagination
// @route   GET /api/products
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const options = {
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const products = await Product.search(search, options);
    
    // Get total count for pagination
    let countQuery = { isActive: true };
    if (search) countQuery.$text = { $search: search };
    if (category && category !== 'all') countQuery.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      countQuery.price = {};
      if (minPrice !== undefined) countQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) countQuery.price.$lte = parseFloat(maxPrice);
    }
    if (rating) countQuery.rating = { $gte: parseFloat(rating) };

    const total = await Product.countDocuments(countQuery);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage: parseInt(page),
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .populate('seller', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(12)
    .select('-reviews');

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get best sellers
// @route   GET /api/products/bestsellers
// @access  Public
router.get('/bestsellers', async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      isBestseller: true 
    })
    .populate('seller', 'firstName lastName')
    .sort({ rating: -1, numReviews: -1 })
    .limit(12)
    .select('-reviews');

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get bestsellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    // Get count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({ 
          category, 
          isActive: true 
        });
        return { name: category, count };
      })
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'firstName lastName avatar')
      .populate('reviews.user', 'firstName lastName avatar');

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has this product in wishlist
    let isInWishlist = false;
    if (req.user) {
      isInWishlist = req.user.wishlist.includes(product._id);
    }

    res.status(200).json({
      success: true,
      product: {
        ...product.toObject(),
        isInWishlist
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
router.post('/', protect, seller, [
  body('title').notEmpty().withMessage('Product title is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: req.body.sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    const product = await Product.create({
      ...req.body,
      seller: req.user.id
    });

    await product.populate('seller', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin - own products only)
router.put('/:id', protect, seller, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product or is admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own products'
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('seller', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin - own products only)
router.delete('/:id', protect, seller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product or is admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own products'
      });
    }

    // Soft delete - mark as inactive
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Review comment is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { rating, comment } = req.body;

    try {
      await product.addReview(
        req.user.id,
        req.user.fullName,
        rating,
        comment,
        false // verifiedPurchase - would need to check order history
      );

      await product.populate('reviews.user', 'firstName lastName avatar');

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        product
      });
    } catch (reviewError) {
      return res.status(400).json({
        success: false,
        message: reviewError.message
      });
    }
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
    .populate('seller', 'firstName lastName')
    .sort({ rating: -1 })
    .limit(8)
    .select('-reviews');

    res.status(200).json({
      success: true,
      count: relatedProducts.length,
      products: relatedProducts
    });
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;