const express = require("express");
const router = express.Router();
const { route } = require("./ticket.router");

const { hashPassword, comparePassword } = require("../helpers/bcrypt.helper");
const { insertUser } = require("../model/user/User.model");
const { getUserByEmail, getUserById } = require("../model/user/User.model");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt.helper");
const { userAuthorization } = require("../middleware/authorization.middleware");

router.all("/", (req, res, next) => {
  next();
});

// Get user profile router
router.get("/", userAuthorization, async (req, res) => {
  const _id = req.userId;
  const userProfile = await getUserById(_id);
  res.json({ user: userProfile });
});

// Create a new user route
router.post("/", async (req, res) => {
  const { name, company, address, phone, email, password } = req.body;
  try {
    const hashedPass = await hashPassword(password);

    const newUserObj = {
      name,
      company,
      address,
      phone,
      email,
      password: hashedPass,
    };
    const result = await insertUser(newUserObj);
    console.log(result);
    res.json({
      message: "New user created",
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", message: error.message });
  }
});

// User sign in Router
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // hash password and compare the db one
  if (!email || !password) {
    return res.json({ status: "error", message: "Invalid form submission" });
  }

  // get user email from db
  const user = await getUserByEmail(email);

  const passFromDb = user && user._id ? user.password : null;

  if (!passFromDb) {
    return res.json({ status: "error", message: "Invalid email or password" });
  }

  const result = await comparePassword(password, passFromDb);

  if (!result) {
    return res.json({ status: "error", message: "Invalid email or password!" });
  }
  console.log("user email", user.email, `userid: ${user._id}`);
  const accessJWT = await createAccessJWT(user.email, `${user._id}`);

  const refreshJWT = await createRefreshJWT(user.email, `${user._id}`);

  res.json({
    status: "success",
    message: "Login Successfully!",
    accessJWT,
    refreshJWT,
  });
});

module.exports = router;
