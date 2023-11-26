const express = require("express");
const { verifyRefreshJWT } = require("../helpers/jwt.helper");
const { getUserByEmail } = require("../model/user/User.model");
const router = express.Router();

router.get("/", async (req, res, next) => {
  const { authorization } = req.headers;
  //1. make sure the token is valid
  const decoded = await verifyRefreshJWT(authorization);
  if (decoded.email) {
    //2. check if the jwt exists in database
    const userProfile = await getUserByEmail(decoded.email);
    if (userProfile._id) {
      //3. check if it is not expired
      res.status(403).json({ message: userProfile });
      let tokenExp = userProfile.refreshJWT.addedAt;
      tokenExp = tokenExp.setDate(
        tokenExp.getDate() + +process.env.JWT_REFRESH_SECRET_EXP_DAY
      );

      const today = new Date();

      if (tokenExp < today) {
        res.status(403).json({ message: "Forbidden" });
      }
    }
  }
  res.status(403).json({
    message: "Forbidden",
  });
});

module.exports = router;
