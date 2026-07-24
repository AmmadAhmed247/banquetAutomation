const authService = require("../services/auth.service");
const login = async (req, res) => {
  try {
    const data = await authService.loginClient(req.body);
    
    res.cookie("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    res.json({ client: data.client }); 
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  // Clear the token cookie with the same options used when setting it
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  // Also set an expired cookie as a fallback for some browsers
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.json({ message: "Logged out" });
};

const me = async (req, res) => {
  res.json({ client: req.user }); 
};

module.exports = { login, logout, me };

