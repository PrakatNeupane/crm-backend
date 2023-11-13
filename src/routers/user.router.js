const express = require("express");
const router = express.Router();
const { route } = require("./ticket.router");

const { hashPassword } = require("../helpers/bcrypt.helper");
const { insertUser } = require("../model/user/User.model");

router.all("/", (req, res, next) => {
  next();
});

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

module.exports = router;
