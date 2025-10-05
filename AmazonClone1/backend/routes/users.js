const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'cart.product',
        select: 'title price images stock isActive',
        populate: {
          path: 'seller',
          select: 'firstName lastName'
        }
      });

    // Filter out products that are no longer active
    const activeCartItems = user.cart.filter(item => 
      item.product && item.product.isActive
    );

    // Calculate cart totals
    const itemsPrice = activeCartItems.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );
    
    const taxPrice = Math.round(itemsPrice * 0.085 * 100) / 100; // 8.5% tax
    const shippingPrice = itemsPrice >= 35 ? 0 : 5.99; // Free shipping over $35
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    res.status(200).json({
      success: true,
      cart: {
        items: activeCartItems,
        summary: {
          itemsPrice: Math.round(itemsPrice * 100) / 100,
          taxPrice,
          shippingPrice,
          totalPrice: Math.round(totalPrice * 100) / 100,
          totalItems: activeCartItems.reduce((total, item) => total + item.quantity, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/users/cart
// @access  Private
router.post('/cart', protect, [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

    const { productId, quantity } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    // Check stock availability
    const user = await User.findById(req.user.id);
    const existingItem = user.cart.find(item => 
      item.product.toString() === productId
    );
    
    const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    
    if (totalQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    await user.addToCart(productId, quantity);

    // Return updated cart
    const updatedUser = await User.findById(req.user.id)
      .populate('cart.product', 'title price images stock');

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: updatedUser.cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/users/cart/:productId
// @access  Private
router.put('/cart/:productId', protect, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

    const { productId } = req.params;
    const { quantity } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    // Check stock availability
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    const user = await User.findById(req.user.id);
    const cartItem = user.cart.find(item => 
      item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cartItem.quantity = quantity;
    await user.save();

    // Return updated cart
    const updatedUser = await User.findById(req.user.id)
      .populate('cart.product', 'title price images stock');

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart: updatedUser.cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
router.delete('/cart/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    await user.removeFromCart(productId);

    // Return updated cart
    const updatedUser = await User.findById(req.user.id)
      .populate('cart.product', 'title price images stock');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: updatedUser.cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Clear cart
// @route   DELETE /api/users/cart
// @access  Private
router.delete('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    await user.clearCart();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: []
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'wishlist',
        select: 'title price images rating numReviews isActive',
        match: { isActive: true },
        populate: {
          path: 'seller',
          select: 'firstName lastName'
        }
      });

    res.status(200).json({
      success: true,
      wishlist: user.wishlist.filter(item => item) // Remove null items
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Toggle wishlist item
// @route   POST /api/users/wishlist/:productId
// @access  Private
router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    const user = await User.findById(req.user.id);
    const isInWishlist = user.wishlist.includes(productId);
    
    await user.toggleWishlist(productId);

    // Return updated wishlist
    const updatedUser = await User.findById(req.user.id)
      .populate('wishlist', 'title price images rating numReviews');

    res.status(200).json({
      success: true,
      message: isInWishlist ? 'Item removed from wishlist' : 'Item added to wishlist',
      wishlist: updatedUser.wishlist,
      isInWishlist: !isInWishlist
    });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');

    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
router.put('/addresses/:addressId', protect, [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('addressLine1').optional().notEmpty().withMessage('Address line 1 cannot be empty'),
  body('city').optional().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().notEmpty().withMessage('State cannot be empty'),
  body('zipCode').optional().notEmpty().withMessage('ZIP code cannot be empty'),
  body('country').optional().notEmpty().withMessage('Country cannot be empty')
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

    const { addressId } = req.params;
    const user = await User.findById(req.user.id);

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Update address fields
    Object.keys(req.body).forEach(key => {
      address[key] = req.body[key];
    });

    // If setting as default, remove default from others
    if (req.body.isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const wasDefault = address.isDefault;
    address.remove();

    // If deleted address was default, make first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get cart summary (item count and total)
// @route   GET /api/users/cart/summary
// @access  Private
router.get('/cart/summary', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'cart.product',
        select: 'price isActive'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out inactive products
    const activeCartItems = user.cart.filter(item => 
      item.product && item.product.isActive
    );

    const itemCount = activeCartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = activeCartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100
    });
  } catch (error) {
    console.error('Cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;