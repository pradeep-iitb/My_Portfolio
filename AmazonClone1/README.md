# Amazon Clone - Full Stack E-commerce Application

A full-featured Amazon clone built with React, Node.js, Express, MongoDB, and GSAP animations.

## Features

### Backend Features
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management, password change
- **Product Management**: CRUD operations with Amazon image URLs
- **Shopping Cart**: Add, update, remove items with real-time calculations
- **Wishlist**: Save favorite products
- **Order Management**: Complete order processing
- **Address Management**: Multiple shipping addresses
- **Search & Filtering**: Advanced product search with filters

### Frontend Features
- **Responsive Design**: Amazon-like UI with mobile-first approach
- **GSAP Animations**: Smooth page transitions and interactive elements
- **React Router**: Single-page application with protected routes
- **Context Management**: Global state for auth and cart
- **Real-time Updates**: Live cart and wishlist updates
- **Toast Notifications**: User feedback for all actions

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React** - Frontend library
- **React Router DOM** - Client-side routing
- **GSAP** - Animations and interactions
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Hook Form** - Form handling
- **React Icons** - Icon library

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AmazonClone1
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/amazon_clone
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=12
   ```

5. **Seed the database**
   ```bash
   cd backend
   node seed.js
   ```

6. **Start the application**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm start
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Sample Login Credentials

After seeding the database, you can use these credentials:

- **Admin**: john@example.com / Password123!
- **Seller**: jane@example.com / Password123!
- **Customer**: customer@example.com / Password123!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/addresses` - Add address

### Products
- `GET /api/products` - Get all products (with search/filter)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/bestsellers` - Get bestsellers
- `GET /api/products/categories` - Get product categories
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Seller/Admin)
- `PUT /api/products/:id` - Update product (Seller/Admin)
- `DELETE /api/products/:id` - Delete product (Seller/Admin)
- `POST /api/products/:id/reviews` - Add product review

### User Cart & Wishlist
- `GET /api/users/cart` - Get cart items
- `POST /api/users/cart` - Add item to cart
- `PUT /api/users/cart/:productId` - Update cart item quantity
- `DELETE /api/users/cart/:productId` - Remove item from cart
- `DELETE /api/users/cart` - Clear cart
- `GET /api/users/wishlist` - Get wishlist
- `POST /api/users/wishlist/:productId` - Toggle wishlist item

## Product Images

The application uses real Amazon product images with URLs following the pattern:
```
https://m.media-amazon.com/images/I/[IMAGE_ID].[EXTENSION]
```

Sample products include:
- Amazon Echo Dot (5th Gen)
- iPhone 15 Pro Max
- Sony WH-1000XM5 Headphones
- YETI Rambler Tumbler
- North Face Backpack
- Instant Vortex Air Fryer

## Database Schema

### User Model
- Personal information (name, email, password)
- Shopping cart (with product references)
- Wishlist (product references)
- Multiple addresses
- Order history
- Role-based permissions

### Product Model
- Product details (title, description, price)
- Amazon image URLs and thumbnails
- Specifications and features
- Reviews and ratings
- Stock management
- Category and tags
- Seller information

### Order Model
- Order items with product details
- Shipping and billing addresses
- Payment information
- Order status tracking
- Delivery tracking

## Features in Detail

### Authentication System
- Secure password hashing with bcrypt
- JWT tokens with configurable expiration
- Role-based access control (User, Seller, Admin)
- Protected routes and middleware

### Shopping Cart
- Real-time cart updates
- Persistent cart across sessions
- Quantity management with stock validation
- Price calculations with tax and shipping

### Product Management
- Dynamic product rendering
- Advanced search and filtering
- Category-based browsing
- Product reviews and ratings

### Animations
- GSAP-powered smooth transitions
- Scroll-triggered animations
- Interactive hover effects
- Loading states and micro-interactions

## Development

### Project Structure
```
AmazonClone1/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── server.js        # Express server
│   ├── seed.js          # Database seeding
│   └── .env             # Environment variables
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── contexts/    # React contexts
    │   ├── utils/       # Utility functions
    │   └── index.css    # Global styles
    └── public/          # Static assets
```

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node seed.js` - Seed database with sample data

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Order tracking and notifications
- [ ] Advanced product filters
- [ ] Product recommendations
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Admin dashboard
- [ ] Seller dashboard
- [ ] Product comparison
- [ ] Advanced search with Elasticsearch

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Amazon for design inspiration
- React community for excellent tools
- GSAP for animation capabilities
- MongoDB for flexible data storage