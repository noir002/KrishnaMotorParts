# Automobile Ecommerce Backend

Backend API for Krishna Motor Parts ecommerce platform built with Node.js, Express.js, and MongoDB.

## Features

- RESTful API architecture
- JWT-based authentication
- Role-based authorization (Customer/Admin)
- MongoDB with Mongoose ODM
- Input validation with Joi
- Rate limiting and security middleware
- Comprehensive error handling
- Property-based testing with fast-check

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set your MongoDB connection string
   - Configure JWT secret
   - Set client URL for CORS

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication (Coming Soon)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products (Coming Soon)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders (Coming Soon)
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID

### Cart (Coming Soon)
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove item from cart

## Project Structure

```
server/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── app.js          # Express app setup
├── tests/              # Test files
├── .env.example        # Environment variables template
├── jest.config.js      # Jest configuration
├── package.json        # Dependencies and scripts
└── server.js           # Entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/automobile_ecommerce |
| CLIENT_URL | Frontend URL for CORS | http://localhost:5173 |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRE | JWT expiration time | 30d |

## Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Ensure all tests pass before committing
4. Follow the API design patterns established in the codebase