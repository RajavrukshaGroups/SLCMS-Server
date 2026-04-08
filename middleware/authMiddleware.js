const jwt = require("jsonwebtoken");

const protectAdmin = (req, res, next) => {
  try {
    let token;

    // 🔥 Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    // 🔥 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};

module.exports = protectAdmin;
