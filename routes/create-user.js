const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/FetchUser");
const jwtSecret = "RudraIsTheBest";

router.get("/", (req, res) => {
  res.send("Hello");
});

// * Create POST request for Sign-Up
router.post(
  "/sign-up",
  [
    body("name", "Enter a name more than 2 characters").isLength({ min: 2 }),
    body("email", "Enter a valid email address").isEmail(),
    body("password", "Enter password greater than 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // * Return errors if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // * Check if user exists
    const salt = await bcrypt.genSalt(15);
    const securePassword = await bcrypt.hash(req.body.password, salt);
    try {
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
        const data = {
          id: User.id,
        };
        const authToken = jwt.sign(data, jwtSecret);
        res.json({ authToken });
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error Occured");
    }
  }
);

// * Create POST request for Login

router.post(
  "/login",
  [
    body("email", "Enter a valid email address").isEmail(),
    body("password", "Enter password greater than 5 characters").exists(),
  ],
  async (req, res) => {
    // * Return errors if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ errors: "Enter correct credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(404).json({ errors: "Enter correct credentials" });
      }
      const data = {
        id: user.id,
      };
      const authToken = jwt.sign(data, jwtSecret);
      res.json({ authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error Occured");
    }
  }
);

// * Create POST request for Fetch User

router.post("/fetch-user", fetchUser, async (req, res) => {
  try {
    userId = await req.userId;
    console.log("\n");
    console.log(req.userId);
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error Occured ME");
  }
});

module.exports = router;
