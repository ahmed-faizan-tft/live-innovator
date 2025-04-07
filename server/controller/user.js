const jwt = require("jsonwebtoken");
const User = require("../model/user");

const authentication = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Decode/verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { userId, name, role } = decoded;

    if (!userId || !name || !role) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    // Find or create user
    let user = await User.findOne({userId});
    if (!user) {
      user = await User.create({ userId: userId, name, role });
    }

    return res.status(200).json({ message: "Authentication successful", data: user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { authentication };
