const nodemailer = require('nodemailer');
const { generateUnsubscribeToken } = require('../utils/unsubscribeToken');

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailService();
  }

  // Initialize email service
  initializeEmailService() {
    if (process.env.EMAIL_SERVICE && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
      this.emailTransporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      console.log('Email service not configured. Email notifications will be logged only.');
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(order, customer) {
    const subject = `Order Confirmation - ${order.orderNumber}`;
    const html = this.generateOrderConfirmationHTML(order, customer);
    
    return this.sendEmail(customer.email, subject, html);
  }

  // Send order status update email
  async sendOrderStatusUpdate(order, customer, oldStatus, newStatus) {
    const subject = `Order Update - ${order.orderNumber}`;
    const html = this.generateOrderStatusUpdateHTML(order, customer, oldStatus, newStatus);
    
    return this.sendEmail(customer.email, subject, html);
  }

  // Send newsletter subscription confirmation
  async sendNewsletterConfirmation(email) {
    const subject = 'Welcome to Krishna Motor Parts Newsletter!';
    const html = this.generateNewsletterConfirmationHTML(email);
    
    return this.sendEmail(email, subject, html);
  }

  // Send test email
  async sendTestEmail(to) {
    const subject = 'Test Email from Krishna Motor Parts';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #d71920;">Krishna Motor Parts</h1>
        <p>This is a test email to verify email functionality is working correctly.</p>
        <p>If you received this email, the email service is configured properly!</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    `;
    
    return this.sendEmail(to, subject, html);
  }
  async sendLowStockAlert(product) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USERNAME;
    if (!adminEmail) return;

    const subject = `Low Stock Alert - ${product.name}`;
    const html = this.generateLowStockAlertHTML(product);
    
    return this.sendEmail(adminEmail, subject, html);
  }

  /**
   * Send abandoned cart reminder email with retry logic
   * @param {Object} cart - Cart document
   * @param {Object} user - User document
   * @param {Number} reminderNumber - Which reminder (1, 2, or 3)
   * @returns {Object} - Result of email send operation
   */
  async sendAbandonedCartReminder(cart, user, reminderNumber) {
    try {
      // Validate user opt-in status
      if (user.notificationPreferences && user.notificationPreferences.abandonedCartEmails === false) {
        console.log(`[NotificationService] User ${user._id} has opted out of abandoned cart emails`);
        return { success: false, error: 'User opted out' };
      }

      // Populate cart with product details
      try {
        await cart.populate({
          path: 'items.productId',
          select: 'name price discountPrice images stock brand partNumber isActive'
        });
      } catch (error) {
        console.error('[NotificationService] Database error populating cart products:', {
          cartId: cart._id,
          error: error.message,
          stack: error.stack
        });
        return { success: false, error: 'Failed to load cart products' };
      }

      // Filter out invalid products (deleted or inactive)
      const validItems = cart.items.filter(item => {
        return item.productId && item.productId.isActive;
      });

      // Skip if no valid products remain
      if (validItems.length === 0) {
        console.log(`[NotificationService] Cart ${cart._id} has no valid products, skipping notification`);
        return { success: false, error: 'No valid products in cart' };
      }

      // Create a temporary cart object with only valid items for email generation
      const validCart = {
        ...cart.toObject(),
        items: validItems
      };

      // Generate email HTML
      const html = this.generateAbandonedCartHTML(validCart, user, reminderNumber);
      const subject = this.getAbandonedCartSubject(reminderNumber);

      // Send email with retry logic
      const result = await this.sendEmailWithRetry(user.email, subject, html);

      if (result.success) {
        console.log(`[NotificationService] Abandoned cart reminder ${reminderNumber} sent to ${user.email}`);
      } else {
        console.error('[NotificationService] Failed to send abandoned cart reminder after retries:', {
          cartId: cart._id,
          userId: user._id,
          userEmail: user.email,
          reminderNumber,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      console.error('[NotificationService] Error sending abandoned cart reminder:', {
        cartId: cart._id,
        userId: user._id,
        reminderNumber,
        error: error.message,
        stack: error.stack
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get email subject based on reminder number
   * @param {Number} reminderNumber - Which reminder (1, 2, or 3)
   * @returns {string} - Email subject
   */
  getAbandonedCartSubject(reminderNumber) {
    const subjects = {
      1: 'You left items in your cart - Krishna Motor Parts',
      2: 'Still interested? Your cart is waiting - Krishna Motor Parts',
      3: 'Last chance! Complete your order - Krishna Motor Parts'
    };
    return subjects[reminderNumber] || 'Your cart is waiting - Krishna Motor Parts';
  }

  /**
   * Send email with exponential backoff retry logic
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} html - Email HTML content
   * @returns {Object} - Result of email send operation
   */
  async sendEmailWithRetry(to, subject, html) {
    const maxAttempts = 3;
    const delays = [1000, 2000, 4000]; // 1s, 2s, 4s

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Email send attempt ${attempt}/${maxAttempts} to ${to}`);
        const result = await this.sendEmail(to, subject, html);
        
        if (result.success) {
          console.log(`Email sent successfully on attempt ${attempt}`);
          return result;
        }
        
        // If not successful and not the last attempt, wait before retrying
        if (attempt < maxAttempts) {
          const delay = delays[attempt - 1];
          console.log(`Email send failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Email send attempt ${attempt} failed:`, error.message);
        
        // If this is the last attempt, return failure
        if (attempt === maxAttempts) {
          console.error(`All ${maxAttempts} email send attempts failed`);
          return { success: false, error: error.message };
        }
        
        // Wait before retrying
        const delay = delays[attempt - 1];
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return { success: false, error: 'All retry attempts failed' };
  }

  /**
   * Generate abandoned cart email HTML
   * @param {Object} cart - Cart object with populated products
   * @param {Object} user - User object
   * @param {Number} reminderNumber - Which reminder (1, 2, or 3)
   * @returns {string} - HTML email content
   */
  generateAbandonedCartHTML(cart, user, reminderNumber) {
    // Calculate total cart value
    const totalAmount = cart.items.reduce((sum, item) => {
      if (item.productId) {
        const price = item.productId.discountPrice || item.productId.price;
        return sum + (price * item.quantity);
      }
      return sum;
    }, 0);

    // Generate product rows HTML
    const itemsHTML = cart.items.map(item => {
      const product = item.productId;
      const price = product.discountPrice || product.price;
      const subtotal = price * item.quantity;
      const imageUrl = product.images && product.images.length > 0 
        ? product.images[0] 
        : 'https://via.placeholder.com/80';

      return `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #eee;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right: 15px;">
                  <img src="${imageUrl}" alt="${product.name}" 
                       style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;" />
                </td>
                <td>
                  <div style="font-weight: bold; margin-bottom: 5px;">${product.name}</div>
                  <div style="color: #666; font-size: 12px;">Part #: ${product.partNumber}</div>
                  ${product.brand ? `<div style="color: #666; font-size: 12px;">Brand: ${product.brand}</div>` : ''}
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
            ₹${price.toFixed(2)}
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
            ₹${subtotal.toFixed(2)}
          </td>
        </tr>
      `;
    }).join('');

    // Generate message based on reminder number
    const messages = {
      1: {
        greeting: `Hi ${user.firstName || 'there'},`,
        message: `We noticed you left some items in your cart. Don't worry, we've saved them for you!`,
        cta: 'Complete Your Purchase'
      },
      2: {
        greeting: `Hello ${user.firstName || 'there'},`,
        message: `Your cart is still waiting! The items you selected are still available and ready to ship.`,
        cta: 'Checkout Now'
      },
      3: {
        greeting: `${user.firstName || 'Valued Customer'},`,
        message: `This is your last reminder! Don't miss out on these quality auto parts. Complete your order today.`,
        cta: 'Complete Order Now'
      }
    };

    const messageContent = messages[reminderNumber] || messages[1];

    // Generate unsubscribe token
    const unsubscribeToken = generateUnsubscribeToken(user._id.toString());
    const unsubscribeUrl = `${process.env.CLIENT_URL}/unsubscribe/abandoned-cart?token=${unsubscribeToken}`;
    const checkoutUrl = `${process.env.CLIENT_URL}/checkout`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Cart is Waiting</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #d71920 0%, #a01419 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Krishna Motor Parts</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Cart is Waiting</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 10px;">${messageContent.greeting}</p>
            <p style="font-size: 15px; color: #555; margin-bottom: 25px;">${messageContent.message}</p>
            
            <!-- Cart Items -->
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #333;">Your Cart Items</h2>
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #e9e9e9;">
                    <th style="padding: 12px; text-align: left; font-size: 13px; color: #666;">Product</th>
                    <th style="padding: 12px; text-align: center; font-size: 13px; color: #666;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-size: 13px; color: #666;">Price</th>
                    <th style="padding: 12px; text-align: right; font-size: 13px; color: #666;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 20px 15px 15px; text-align: right; font-weight: bold; font-size: 16px; border-top: 2px solid #d71920;">
                      Total Amount:
                    </td>
                    <td style="padding: 20px 15px 15px; text-align: right; font-weight: bold; font-size: 18px; color: #d71920; border-top: 2px solid #d71920;">
                      ₹${totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${checkoutUrl}" 
                 style="background: #d71920; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(215, 25, 32, 0.3);">
                ${messageContent.cta}
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center; margin-top: 25px;">
              Need help? Contact us at <a href="mailto:${process.env.EMAIL_USERNAME}" style="color: #d71920;">${process.env.EMAIL_USERNAME}</a>
              <br>or call us at +91 8630373030
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
              Krishna Motor Parts, Chhatari Doraha, Chattari, Bulandshahr, U.P.
            </p>
            <p style="color: #999; font-size: 11px; margin: 0;">
              <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">
                Unsubscribe from abandoned cart emails
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generic email sending method
  async sendEmail(to, subject, html) {
    try {
      if (!this.emailTransporter) {
        console.log(`Email would be sent to ${to}: ${subject}`);
        return { success: true, message: 'Email logged (service not configured)' };
      }

      const mailOptions = {
        from: `"Krishna Motor Parts" <${process.env.EMAIL_USERNAME}>`,
        to,
        subject,
        html
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}: ${subject}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate order confirmation HTML
  generateOrderConfirmationHTML(order, customer) {
    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d71920;">Krishna Motor Parts</h1>
            <h2 style="color: #666;">Order Confirmation</h2>
          </div>
          
          <p>Dear ${customer.firstName} ${customer.lastName},</p>
          
          <p>Thank you for your order! We've received your order and it's being processed.</p>
          
          <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">
                  Total Amount:
                </td>
                <td style="padding: 15px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">
                  ₹${order.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
          
          <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3>Shipping Address</h3>
            <p>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
              ${order.shippingAddress.pincode}<br>
              Phone: ${order.shippingAddress.phone}
            </p>
          </div>
          
          <p>We'll send you another email when your order ships. If you have any questions, please contact us.</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666;">Thank you for choosing Krishna Motor Parts!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate order status update HTML
  generateOrderStatusUpdateHTML(order, customer, oldStatus, newStatus) {
    const statusMessages = {
      processing: 'Your order is being processed',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d71920;">Krishna Motor Parts</h1>
            <h2 style="color: #666;">Order Status Update</h2>
          </div>
          
          <p>Dear ${customer.firstName} ${customer.lastName},</p>
          
          <p>${statusMessages[newStatus] || 'Your order status has been updated'}.</p>
          
          <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Status:</strong> <span style="color: #d71920; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
            ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
          </div>
          
          <p>You can track your order status anytime by logging into your account on our website.</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666;">Thank you for choosing Krishna Motor Parts!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate newsletter confirmation HTML
  generateNewsletterConfirmationHTML(email) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Newsletter Subscription Confirmed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d71920;">Krishna Motor Parts</h1>
            <h2 style="color: #666;">Welcome to Our Newsletter!</h2>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
            <h3 style="color: #059669;">✓ Subscription Confirmed</h3>
            <p>Thank you for subscribing to our newsletter with email: <strong>${email}</strong></p>
          </div>
          
          <p>You'll now receive:</p>
          <ul style="padding-left: 20px;">
            <li>Latest product updates and new arrivals</li>
            <li>Exclusive deals and discounts</li>
            <li>Maintenance tips and automotive insights</li>
            <li>Special offers for genuine spare parts</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/products" 
               style="background: #d71920; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Shop Now
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Krishna Motor Parts, Chhatari Doraha, Chattari, Bulandshahr, U.P.<br>
              Phone: +91 8630373030 | Email: Krishnamotorparts1993@gmail.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate low stock alert HTML
  generateLowStockAlertHTML(product) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Low Stock Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d71920;">Krishna Motor Parts</h1>
            <h2 style="color: #ff6b35;">Low Stock Alert</h2>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #856404;">Product Low on Stock</h3>
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Part Number:</strong> ${product.partNumber}</p>
            <p><strong>Current Stock:</strong> ${product.stock.quantity}</p>
            <p><strong>Low Stock Threshold:</strong> ${product.stock.lowStockThreshold}</p>
            <p><strong>Brand:</strong> ${product.brand}</p>
          </div>
          
          <p>Please restock this item to avoid stockouts.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/admin/products" 
               style="background: #d71920; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Manage Inventory
            </a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new NotificationService();