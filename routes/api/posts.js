const express = require("express");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const { check, validationResult } = require("express-validator");
const router = express.Router();

// @route POST api/posts
// @desc Create a post
// @access Public
router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ msg: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select("-password");

        const newPost = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        const post = await newPost.save();

        res.json(post);
    } catch (e) {
        console.log(e.message);
        res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
