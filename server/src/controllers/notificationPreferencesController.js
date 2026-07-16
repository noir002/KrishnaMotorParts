const User = require('../models/User');
const { verifyUnsubscribeToken } = require('../utils/unsubscribeToken');

/**
 * @desc    Unsubscribe from abandoned cart emails via token link
 * @route   GET /api/unsubscribe/abandoned-cart
 * @access  Public (token-based)
 */
const unsubscribeFromAbandonedCart = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Unsubscribe token is required'
      });
    }

    // Verify and decode the token
    let decoded;
    try {
      decoded = verifyUnsubscribeToken(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid or expired unsubscribe token'
      });
    }

    // Find user and update preferences
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update notification preferences
    user.notificationPreferences.abandonedCartEmails = false;
    user.notificationPreferences.optOutDate = new Date();
    await user.save();

    // Return HTML confirmation page
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed - Krishna Motor Parts</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            text-align: center;
          }
          h1 {
            color: #2c3e50;
            margin-bottom: 20px;
          }
          p {
            color: #555;
            line-height: 1.6;
            margin-bottom: 15px;
          }
          .success-icon {
            font-size: 48px;
            color: #27ae60;
            margin-bottom: 20px;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
          }
          .btn:hover {
            background-color: #2980b9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✓</div>
          <h1>Successfully Unsubscribed</h1>
          <p>You have been unsubscribed from abandoned cart reminder emails.</p>
          <p>You can re-enable these notifications anytime from your account preferences.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="btn">Return to Home</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in unsubscribeFromAbandonedCart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing unsubscribe request'
    });
  }
};

/**
 * @desc    Update notification preferences
 * @route   PUT /api/notification-preferences
 * @access  Private (authenticated)
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const { abandonedCartEmails } = req.body;

    // Validate input
    if (typeof abandonedCartEmails !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'abandonedCartEmails must be a boolean value'
      });
    }

    // Find user (req.user is set by auth middleware)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    user.notificationPreferences.abandonedCartEmails = abandonedCartEmails;
    
    // If re-enabling, clear the opt-out date
    if (abandonedCartEmails) {
      user.notificationPreferences.optOutDate = undefined;
    } else {
      user.notificationPreferences.optOutDate = new Date();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (error) {
    console.error('Error in updateNotificationPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notification preferences'
    });
  }
};

/**
 * @desc    Get current notification preferences
 * @route   GET /api/notification-preferences
 * @access  Private (authenticated)
 */
const getNotificationPreferences = async (req, res) => {
  try {
    // Find user (req.user is set by auth middleware)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (error) {
    console.error('Error in getNotificationPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notification preferences'
    });
  }
};

module.exports = {
  unsubscribeFromAbandonedCart,
  updateNotificationPreferences,
  getNotificationPreferences
};
