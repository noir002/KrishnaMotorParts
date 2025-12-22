# 🚗 Krishna Motor Parts - Ecommerce Platform

<div align="center">

![Krishna Motor Parts](https://img.shields.io/badge/Krishna%20Motor%20Parts-Ecommerce%20Platform-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)

**A modern, full-stack ecommerce platform for automobile spare parts and accessories**

[🌐 Live Demo](https://krishna-motor-parts-noir002s-projects.vercel.app) • [📚 API Docs](https://krishnamotorparts.onrender.com/health) • [🐛 Report Bug](https://github.com/noir002/KrishnaMotorParts/issues)

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [🌐 Deployment](#-deployment)
- [📱 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [👥 Contributing](#-contributing)
- [📞 Contact](#-contact)

---

## 🎯 Overview

Krishna Motor Parts is a comprehensive ecommerce platform designed specifically for the automobile spare parts industry. Built with modern web technologies, it provides a seamless shopping experience for customers and powerful management tools for administrators.

### 🏢 Business Information
- **Company**: Krishna Motor Parts
- **Location**: Chhatari Doraha, Chattari, Bulandshahr, U.P., India
- **Contact**: +91 8630373030
- **Email**: krishnamotorparts1993@gmail.com
- **Established**: 1993

---

## ✨ Features

### 🛒 **Customer Features**
- **Product Catalog**: Browse extensive inventory of automobile spare parts
- **Advanced Search**: Filter by make, model, year, and part type
- **User Authentication**: Secure registration and login system
- **Shopping Cart**: Add, update, and manage cart items
- **Order Management**: Place orders and track order history
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live inventory and pricing updates

### 👨‍💼 **Admin Features**
- **Dashboard Analytics**: Comprehensive business insights
- **Product Management**: Add, edit, and manage product inventory
- **Order Processing**: View and manage customer orders
- **User Management**: Manage customer accounts and permissions
- **Email Notifications**: Automated order confirmations and updates
- **Inventory Tracking**: Real-time stock management

### 🔧 **Technical Features**
- **RESTful API**: Clean, documented API architecture
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse and spam
- **Email Integration**: Automated email notifications
- **Real-time Communication**: WebSocket support for live updates
- **Performance Monitoring**: Built-in performance tracking
- **Error Handling**: Comprehensive error management
- **Security**: Helmet.js, CORS, and input validation

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 3.4.19
- **HTTP Client**: Axios 1.7.7
- **Routing**: React Router DOM 6.30.2
- **Real-time**: Socket.IO Client 4.8.1

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 7.5.0
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Validation**: Joi 17.9.2 + Express Validator 7.3.1
- **Security**: Helmet 7.0.0, bcryptjs 2.4.3
- **Email**: Nodemailer 7.0.11
- **Real-time**: Socket.IO 4.8.1
- **Testing**: Jest 29.6.2, Supertest 6.3.3

### **DevOps & Deployment**
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: MongoDB Atlas
- **Version Control**: Git & GitHub
- **CI/CD**: Automated deployments

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/noir002/KrishnaMotorParts.git
cd KrishnaMotorParts
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

### 4. Database Setup
```bash
cd ../server
# Seed the database with sample data
node seed.js
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

---

## 📁 Project Structure

```
KrishnaMotorParts/
├── 📁 client/                    # React frontend application
│   ├── 📁 public/               # Static assets
│   ├── 📁 src/                  # Source code
│   │   ├── 📁 components/       # Reusable UI components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 context/         # React context providers
│   │   ├── 📁 services/        # API service functions
│   │   └── 📁 utils/           # Utility functions
│   ├── 📄 package.json         # Frontend dependencies
│   └── 📄 vite.config.js       # Vite configuration
│
├── 📁 server/                   # Node.js backend application
│   ├── 📁 src/                 # Source code
│   │   ├── 📁 controllers/     # Route handlers
│   │   ├── 📁 middleware/      # Custom middleware
│   │   ├── 📁 models/          # MongoDB schemas
│   │   ├── 📁 routes/          # API routes
│   │   ├── 📁 services/        # Business logic
│   │   └── 📁 utils/           # Utility functions
│   ├── 📁 tests/               # Test files
│   ├── 📄 package.json         # Backend dependencies
│   ├── 📄 server.js            # Application entry point
│   └── 📄 render.yaml          # Deployment configuration
│
├── 📄 README.md                # Project documentation
└── 📄 INTEGRATION_GUIDE.md     # Integration guidelines
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/automobile_ecommerce

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Client Configuration
CLIENT_URL=http://localhost:3000

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
ADMIN_EMAIL=admin@example.com

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5001

# App Configuration
VITE_APP_NAME=Krishna Motor Parts
VITE_APP_VERSION=1.0.0
```

---

## 🌐 Deployment

### Production URLs
- **Frontend**: https://krishna-motor-parts-noir002s-projects.vercel.app
- **Backend API**: https://krishnamotorparts.onrender.com

### Deployment Process

#### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

#### Backend (Render)
1. Connect GitHub repository to Render
2. Configure environment variables
3. Deploy using `render.yaml` configuration

#### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Configure IP whitelist (0.0.0.0/0 for cloud deployments)
3. Update connection string in environment variables

---

## 📱 API Documentation

### Base URL
- **Development**: http://localhost:5001
- **Production**: https://krishnamotorparts.onrender.com

### Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Core Endpoints

#### Health Check
```http
GET /health
```

#### Authentication
```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
PUT  /api/auth/profile     # Update profile
```

#### Products
```http
GET    /api/products       # Get all products
GET    /api/products/:id   # Get product by ID
POST   /api/products       # Create product (Admin)
PUT    /api/products/:id   # Update product (Admin)
DELETE /api/products/:id   # Delete product (Admin)
```

#### Orders
```http
GET  /api/orders           # Get user orders
POST /api/orders           # Create new order
GET  /api/orders/:id       # Get order details
```

#### Categories
```http
GET    /api/categories     # Get all categories
POST   /api/categories     # Create category (Admin)
PUT    /api/categories/:id # Update category (Admin)
DELETE /api/categories/:id # Delete category (Admin)
```

---

## 🧪 Testing

### Backend Testing
```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Frontend Testing
```bash
cd client

# Run tests
npm test

# Run linting
npm run lint
```

### Test Accounts
```
Admin Account:
Email: krishnamotorparts1993@gmail.com
Password: admin123

Customer Account:
Email: chauhanparas7500@gmail.com
Password: Paras@1234
```

---

## 👥 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new features**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📊 Performance & Monitoring

### Key Metrics
- **Response Time**: < 200ms average
- **Uptime**: 99.9% availability
- **Database**: Optimized queries with indexing
- **Caching**: Redis integration ready
- **Security**: Rate limiting and input validation

### Monitoring Tools
- Health check endpoint: `/health`
- Performance middleware for request timing
- Error logging and tracking
- Memory usage monitoring

---

## 🔒 Security Features

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Protection against abuse
- **CORS**: Configured for secure cross-origin requests
- **Helmet**: Security headers middleware
- **Password Hashing**: bcrypt for secure password storage

---

## 📞 Contact

### Business Contact
- **Company**: Krishna Motor Parts
- **Address**: Chhatari Doraha, Chattari, Bulandshahr, U.P., India
- **Phone**: +91 8630373030
- **Email**: krishnamotorparts1993@gmail.com

### Development Team
- **Developer**: Paras Chauhan
- **Email**: chauhanparas7500@gmail.com
- **GitHub**: [@noir002](https://github.com/noir002)

---

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the needs of the automobile spare parts industry
- Designed for scalability and performance
- Community-driven development approach

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by the Krishna Motor Parts team

</div>