# System Integration Guide

## Overview

This document describes the complete system integration for the Krishna Motor Parts automobile ecommerce platform, including real-time updates, notifications, caching, and performance optimizations.

## Architecture Components

### 1. Real-Time Communication (WebSocket)

**Backend: Socket.IO Server**
- Location: `server/src/services/socketService.js`
- Initialized in: `server/server.js`
- Features:
  - Real-time stock updates
  - Order status notifications
  - Low stock alerts for admins
  - New order notifications for admins
  - Multi-device cart synchronization

**Frontend: Socket.IO Client**
- Location: `client/src/services/socketService.js`
- Integrated via: `client/src/context/NotificationContext.jsx`
- Features:
  - Automatic connection management
  - Event subscription system
  - Product room management for stock updates

### 2. Notification System

**Backend: Email Notifications**
- Location: `server/src/services/notificationService.js`
- Features:
  - Order confirmation emails
  - Order status update emails
  - Low stock alerts to admin
  - HTML email templates

**Frontend: In-App Notifications**
- Context: `client/src/context/NotificationContext.jsx`
- Component: `client/src/components/common/NotificationBell.jsx`
- Features:
  - Real-time notification display
  - Unread count badge
  - Notification history
  - Mark as read functionality

### 3. Caching System

**Backend: Redis Cache**
- Location: `server/src/services/cacheService.js`
- Middleware: `server/src/middleware/cache.js`
- Features:
  - Product list caching (10 minutes)
  - Single product caching (30 minutes)
  - Category caching (1 hour)
  - Search results caching (5 minutes)
  - Admin stats caching (5 minutes)
  - Automatic cache invalidation on updates

**Cache Invalidation Strategy:**
- Product updates → Invalidate product cache and product lists
- Order creation → Invalidate admin stats
- Stock changes → Invalidate product cache

### 4. Performance Optimizations

**Backend Optimizations:**
- Compression middleware for response compression
- Performance monitoring middleware
- Memory usage monitoring
- Response time tracking
- Database query optimization with indexes

**Frontend Optimizations:**
- Real-time stock updates without polling
- Efficient WebSocket connection management
- Context-based state management
- Lazy loading of components

## Integration Flow

### Stock Update Flow

1. Admin updates product stock via API
2. Backend updates database
3. Backend emits WebSocket event to all clients viewing that product
4. Backend checks for low stock condition
5. If low stock, emit alert to admin users and send email
6. Backend invalidates product cache
7. Frontend receives stock update via WebSocket
8. Frontend updates UI in real-time without page refresh

### Order Creation Flow

1. Customer places order via API
2. Backend creates order in database
3. Backend updates product stock quantities
4. Backend emits stock updates for affected products
5. Backend sends order confirmation email to customer
6. Backend emits new order notification to admin users
7. Backend invalidates admin stats cache
8. Frontend receives order confirmation
9. Admin receives real-time notification

### Order Status Update Flow

1. Admin updates order status via API
2. Backend updates order in database
3. Backend sends status update email to customer
4. Backend emits WebSocket event to customer
5. Backend invalidates admin stats cache
6. Customer receives real-time notification
7. Customer sees updated status without refresh

## Configuration

### Backend Environment Variables

```env
# Server Configuration
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
ADMIN_EMAIL=admin@krishnamotorparts.com

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5001
```

## Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install socket.io nodemailer redis
```

**Frontend:**
```bash
cd client
npm install socket.io-client
```

### 2. Configure Email Service

1. Create a Gmail app password (if using Gmail)
2. Update `.env` file with email credentials
3. Set `ADMIN_EMAIL` for low stock alerts

### 3. Configure Redis (Optional)

**Install Redis:**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis
```

**Update `.env`:**
```env
REDIS_URL=redis://localhost:6379
```

If Redis is not configured, the system will work without caching.

### 4. Start Services

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```
Returns system health status including:
- Server uptime
- Memory usage
- Database status
- Cache status
- WebSocket status
- Connected users count

## WebSocket Events

### Client → Server

- `authenticate` - Authenticate user with userId and role
- `join_product` - Subscribe to product stock updates
- `leave_product` - Unsubscribe from product updates

### Server → Client

- `stock_update` - Product stock changed
- `order_update` - Order status changed (to specific user)
- `low_stock_alert` - Product low on stock (to admin)
- `new_order` - New order received (to admin)
- `cart_sync` - Cart synchronized across devices

## Usage Examples

### Frontend: Subscribe to Product Stock Updates

```javascript
import { useNotifications } from '../context/NotificationContext';

function ProductDetail({ productId }) {
  const { subscribeToProduct, unsubscribeFromProduct, getStockUpdate } = useNotifications();
  
  useEffect(() => {
    subscribeToProduct(productId);
    return () => unsubscribeFromProduct(productId);
  }, [productId]);
  
  const stockUpdate = getStockUpdate(productId);
  // Use stockUpdate to display real-time stock
}
```

### Frontend: Use Real-Time Stock Hook

```javascript
import { useRealTimeStock } from '../hooks/useRealTimeStock';

function ProductCard({ product }) {
  const realtimeStock = useRealTimeStock(product._id, product.stock);
  const currentStock = realtimeStock || product.stock;
  
  return (
    <div>
      <p>Stock: {currentStock.quantity}</p>
      {currentStock.isLowStock && <span>Low Stock!</span>}
    </div>
  );
}
```

### Backend: Emit Stock Update

```javascript
const socketService = require('../services/socketService');

// After updating product stock
socketService.emitStockUpdate(productId, {
  quantity: product.stock.quantity,
  inStock: product.stock.inStock,
  isLowStock: product.isLowStock
});
```

### Backend: Send Email Notification

```javascript
const notificationService = require('../services/notificationService');

// Send order confirmation
await notificationService.sendOrderConfirmation(order, customer);

// Send order status update
await notificationService.sendOrderStatusUpdate(order, customer, oldStatus, newStatus);

// Send low stock alert
await notificationService.sendLowStockAlert(product);
```

## Monitoring and Debugging

### Check System Health

```bash
curl http://localhost:5001/health
```

### Monitor WebSocket Connections

Check server logs for:
- `User connected: <socketId>`
- `User <userId> authenticated with socket <socketId>`
- `Socket <socketId> joined product room: <productId>`

### Monitor Cache Performance

Check server logs for:
- `Cache hit for key: <key>`
- `Data cached for key: <key>`

### Monitor Performance

Check server logs for:
- `Slow request detected: <method> <url> - <time>ms`
- `High memory usage detected: <memoryInfo>`

## Troubleshooting

### WebSocket Connection Issues

1. Check CORS configuration in `server/src/services/socketService.js`
2. Verify CLIENT_URL in `.env` matches frontend URL
3. Check browser console for connection errors
4. Ensure server is running and accessible

### Email Not Sending

1. Verify email credentials in `.env`
2. Check Gmail app password is correct
3. Enable "Less secure app access" if using Gmail
4. Check server logs for email errors

### Cache Not Working

1. Verify Redis is running: `redis-cli ping`
2. Check REDIS_URL in `.env`
3. Review cache service logs
4. System works without Redis, just without caching

### Performance Issues

1. Check `/health` endpoint for memory usage
2. Review slow request logs
3. Verify database indexes are created
4. Consider enabling Redis caching
5. Check network latency

## Best Practices

1. **WebSocket Management:**
   - Always unsubscribe from product rooms when component unmounts
   - Authenticate users immediately after connection
   - Handle connection errors gracefully

2. **Caching:**
   - Use appropriate TTL values for different data types
   - Invalidate cache on data updates
   - Monitor cache hit rates

3. **Notifications:**
   - Keep notification messages concise
   - Provide actionable information
   - Allow users to dismiss notifications

4. **Performance:**
   - Monitor response times regularly
   - Use database indexes effectively
   - Implement pagination for large datasets
   - Use compression for API responses

## Future Enhancements

1. **Advanced Caching:**
   - Implement cache warming strategies
   - Add cache statistics dashboard
   - Implement distributed caching for scaling

2. **Real-Time Features:**
   - Live chat support
   - Real-time inventory dashboard
   - Live order tracking map

3. **Notifications:**
   - SMS notifications
   - Push notifications
   - Notification preferences management

4. **Performance:**
   - CDN integration for static assets
   - Database query optimization
   - Load balancing for horizontal scaling
   - API rate limiting per user

## Support

For issues or questions:
1. Check server logs for errors
2. Review browser console for frontend errors
3. Verify environment configuration
4. Check system health endpoint
5. Review this integration guide

## Conclusion

The system is now fully integrated with:
- ✅ Real-time stock updates via WebSocket
- ✅ Email and in-app notifications
- ✅ Redis caching for performance
- ✅ Performance monitoring
- ✅ Comprehensive error handling
- ✅ Health check endpoints

All components are wired together and ready for production use.