const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  const bearerToken = token.split(" ")[1];

  if (!bearerToken) {
    return res.status(401).json({ error: "Token format is invalid" });
  }

  try {
    console.log("JWT_SECRET used: ", process.env.JWT_SECRET); // Add this log to check if the secret is loaded properly
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Token verification error:", err); // This will show the specific error
    res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = authMiddleware;
