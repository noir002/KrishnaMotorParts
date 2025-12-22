const nodemailer = require('nodemailer');

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