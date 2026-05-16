const authService = require("../services/auth.service");
const login = async (req, res) => {
  try {
    const data = await authService.loginClient(req.body);
    
    res.cookie("token", data.token, {
      httpOnly: true,      
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    res.json({ client: data.client }); 
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

const me = async (req, res) => {
  res.json({ client: req.user }); 
};

module.exports = { login, logout, me };

