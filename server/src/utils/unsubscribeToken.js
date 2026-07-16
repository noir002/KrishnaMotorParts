const jwt = require('jsonwebtoken');

/**
 * Generate an unsubscribe token for a user
 * @param {string} userId - The user's ID
 * @returns {string} - Signed JWT token
 */
function generateUnsubscribeToken(userId) {
  if (!userId) {
    throw new Error('User ID is required to generate unsubscribe token');
  }

  const payload = {
    userId: userId.toString(),
    type: 'unsubscribe',
    purpose: 'abandoned-cart'
  };

  // Token expires in 90 days (longer than typical email retention)
  // Use dedicated UNSUBSCRIBE_JWT_SECRET for security isolation
  const secret = process.env.UNSUBSCRIBE_JWT_SECRET || process.env.JWT_SECRET;
  const token = jwt.sign(payload, secret, {
    expiresIn: '90d'
  });

  return token;
}

/**
 * Verify and decode an unsubscribe token
 * @param {string} token - The JWT token to verify
 * @returns {object} - Decoded token payload with userId
 * @throws {Error} - If token is invalid or expired
 */
function verifyUnsubscribeToken(token) {
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    // Use dedicated UNSUBSCRIBE_JWT_SECRET for security isolation
    const secret = process.env.UNSUBSCRIBE_JWT_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    // Validate token type and purpose
    if (decoded.type !== 'unsubscribe' || decoded.purpose !== 'abandoned-cart') {
      throw new Error('Invalid token type');
    }

    return {
      userId: decoded.userId
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

module.exports = {
  generateUnsubscribeToken,
  verifyUnsubscribeToken
};
