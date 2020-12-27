const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Post = require('../../models/Post');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

router.post(
  '/',
  [auth, check('text', 'text is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findById(req.user.id).select('-password');
    const newPost = {
      text: req.body.text,
      user: req.user.id,
      name: user.name,
      avatar: user.avatar,
    };

    try {
      const post = await new Post(newPost);
      await post.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.get('/', auth, async (req, res) => {
  try {
    const post = await Post.find().sort({ date: -1 });
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ msg: 'No posts found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'OjectId') {
      return res.status(400).json({ msg: 'No posts found' });
    }
    res.status(500).send('Server error');
  }
});

router.delete('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(400).json({ msg: 'No posts found' });
    }
    if (req.user.id != post.user) {
      return res.status(400).json({ msg: 'User not authorised' });
    }
    await post.delete();
    res.send('Post deleted');
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'OjectId') {
      return res.status(400).json({ msg: 'No posts found' });
    }
    res.status(500).send('Server error');
  }
});

router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    const user = await User.findById(req.user.id);
    if (!post) {
      return res.status(400).json({ msg: 'No posts found' });
    }
    if (
      post.likes.map((item) => item.user.toString()).indexOf(req.user.id) >= 0
    ) {
      return res.status(400).json({ msg: 'Already liked' });
    }

    const like = {
      user: req.user.id,
      name: user.name,
      avatar: user.avatar,
    };

    post.likes.unshift(like);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'OjectId') {
      return res.status(400).json({ msg: 'No posts found' });
    }
    res.status(500).send('Server error');
  }
});

router.delete('/like/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(400).json({ msg: 'No posts found' });
    }
    if (post.likes.map((item) => item.user).indexOf(req.user.id) < 0) {
      return res.status(400).json({ msg: 'Post has not been liked yet' });
    }

    const removeIndex = post.likes
      .map((item) => item.user)
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'OjectId') {
      return res.status(400).json({ msg: 'No posts found' });
    }
    res.status(500).send('Server error');
  }
});

router.put(
  '/comment/:post_id',
  [auth, check('text', 'text is required').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = await Post.findById(req.params.post_id);
      const user = await User.findById(req.user.id);
      if (!post) {
        return res.status(400).json({ msg: 'No posts found' });
      }

      const comment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };

      post.comments.push(comment);
      await post.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.delete(
  '/comment/:post_id/:cmnt_id',
  [auth, check('text', 'text is required').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = await Post.findById(req.params.post_id);
      const comment = post.comments.find((x) => x.id == req.params.cmnt_id);

      if (!post) {
        return res.status(400).json({ msg: 'No post found' });
      }
      if (!comment) {
        return res.status(400).json({ msg: 'No comment found' });
      }
      if (req.user.id != comment.user) {
        return res.status(400).json({ msg: 'User not Authorised' });
      }

      const removeIndex = post.comments.map((item) => item.id).indexOf(comment);

      post.comments.splice(removeIndex, 1);
      await post.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
