const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

router.get("/", (req, res) => {
  res.send("Hello");
});

// * Create POST request
router.post(
  "/",
  [
    body("name", "Enter a name more than 2 characters").isLength({ min: 2 }),
    body("email", "Enter a valid email address").isEmail(),
    body("password", "Enter password greater than 5 characters").isLength({
      min: 5,
    }),
  ],
  (req, res) => {
    // * Return errors if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // * Check if user exists
    try {
      const salt = bcrypt.genSalt(15);
      const securePassword = bcrypt.hash(req.body.password, salt);
      User.findOne({ email: req.body.email }, (err, email) => {
        if (email) {
          res
            .status(400)
            .json({ error: "Sorry a user with this email already exists." });
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: securePassword,
          });
        }
      });
    } catch (error) {
      console.error(error.message);
    }
  }
);

module.exports = router;
