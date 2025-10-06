const User = require("../models/users");

const setUser = async (req, res, next) => {
    if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      req.user = user;
      res.locals.user = user; // 👈 makes `user` available in ALL EJS templates
    } catch (err) {
      req.user = null;
      res.locals.user = null;
    }
  } else {
    req.user = null;
    res.locals.user = null;
  }
  next();
}

module.exports = setUser;