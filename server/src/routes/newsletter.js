const express = require('express');
const notificationService = require('../services/notificationService');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribeToNewsletter = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email address',
          details: { errors: errors.array() }
        }
      });
    }

    const { email } = req.body;

    // Send confirmation email
    const emailResult = await notificationService.sendNewsletterConfirmation(email);
    
    if (emailResult.success) {
      res.status(200).json({
        success: true,
        data: {
          message: 'Successfully subscribed to newsletter! Check your email for confirmation.'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'EMAIL_SEND_FAILED',
          message: 'Subscription processed but confirmation email could not be sent',
          details: {}
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Send test email (for development)
// @route   POST /api/newsletter/test
// @access  Public (should be protected in production)
const sendTestEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email address is required',
          details: {}
        }
      });
    }

    const result = await notificationService.sendTestEmail(email);
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Test email sent successfully',
        result
      }
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.post('/subscribe', [
  body('email').isEmail().normalizeEmail()
], subscribeToNewsletter);

router.post('/test', sendTestEmail);

module.exports = router;