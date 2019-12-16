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
      return res.status(400).json({ msg: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select("-password");

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();

        res.json(post);
    } catch (e) {
        console.log(e.message);
        res.status(500).send('Server Error');
    }
  }
);

// @route GET api/posts
// @desc Get all post
// @access Private
router.get('/', auth, async (req, res) => {
   try {
       const posts = await Post.find().sort({ date: -1 });
       res.json(posts);
   } catch (e) {
       console.log(e.message);
       res.status(500).send('Server Error');
   }
});

// @route GET api/posts/:post_id
// @desc Get post by id
// @access Private
router.get('/:post_id', auth, async (req, res) => {
   try {
       const post = await Post.findById(req.params.post_id);

       if(!post) {
           return res.status(404).send('Post not found');
       }

       res.json(post);
   } catch (e) {
       console.log(e.message);
       if(e.kind == 'ObjectId') {
           return res.status(404).json({ msg: 'Post not found'});
       }
       res.status(500).send('Server Error');
   }
});

// @route Delete api/posts/:post_id
// @desc Delete post by id
// @access Private
router.delete('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorised '});
        }

        await post.remove();

        res.json({ msg: "Post removed" });
    } catch(e) {
        console.log(e.message);
        if(e.kind == "ObjectId") {
            return res.status(404).json({ msg: 'Post not found' });
        }
    }
});

// @route PUT api/posts/like/:post_id
// @desc Like a post
// @access Private
router.put('/like/:post_id', auth, async (req, res) => {
   try {
       const post = await Post.findById(req.params.post_id);
       console.log(post);
       if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
           return res.status(400).json({ msg: 'Post already liked' });
       }

       post.likes.unshift({ user: req.user.id });

       await post.save();

       res.json(post.likes)
   } catch (e) {
       console.log(e);
       res.status(500).send('Server Error');
   }
});

// @route PUT api/posts/unlike/:post_id
// @desc Like a post
// @access Private
router.put('/unlike/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post has not been liked yet' });
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes)
    } catch (e) {
        console.log(e);
        res.status(500).send('Server Error');
    }
});

// @route PUT api/posts/comment/:post_id
// @desc Create a comment for a post
// @access Public
router.put(
    "/comment/:post_id",
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
            return res.status(400).json({ msg: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select("-password");
            const post = await Post.findById(req.params.post_id);

            const comment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(comment);
            await post.save();

            res.json(post.comments);
        } catch (e) {
            console.log(e.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route Delete api/posts/comment/:comment_id/:post_id
// @desc Delete comment from a post
// @access Private
router.delete('/comment/:comment_id/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        const comments = post.comments.find(comment => comment.id === req.params.comment_id);

        if(!comments) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        if(comments.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const commentIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(commentIndex, 1);

        await post.save();
        return res.json(post);
    } catch (e) {
        console.log(e.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
