const { createClerkClient } = require('@clerk/clerk-sdk-node');

// Initialize Clerk with secret key
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Middleware to verify Clerk token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    try {
      // Verify Clerk session token
      const sessionClaims = await clerk.verifyToken(token);
      
      // Get user from Clerk
      const user = await clerk.users.getUser(sessionClaims.sub);
      
      req.user = {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        role: user.publicMetadata?.role || 'user'
      };
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Middleware to check if user is admin
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
};
