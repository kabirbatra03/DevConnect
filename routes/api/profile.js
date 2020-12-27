const express = require('express');
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const { response } = require('express');

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'email']);
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

router.post(
  '/',
  [
    auth,
    [
      check('gender', 'Please enter gender').not().isEmpty(),
      check('skills', 'Please enter skills').not().isEmpty(),
      check('age', 'Please enter age').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      bio,
      location,
      gender,
      age,
      skills,
      education,
      twitter,
      instagram,
      facebook,
      github,
    } = req.body;

    const profileFeilds = {};
    profileFeilds.user = req.user.id;
    if (company) profileFeilds.company = company;
    if (website) profileFeilds.website = website;
    if (bio) profileFeilds.bio = bio;
    if (location) profileFeilds.location = location;
    if (gender) profileFeilds.gender = gender;
    if (age) profileFeilds.age = age;
    if (skills) {
      profileFeilds.skills = skills.split(',').map((item) => item.trim());
    }
    if (education) expFeilds.education = education;

    profileFeilds.social = {};
    if (twitter) profileFeilds.social.twitter = twitter;
    if (instagram) profileFeilds.social.instagram = instagram;
    if (facebook) profileFeilds.social.facebook = facebook;
    if (github) profileFeilds.social.github = github;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile(
          { user: req.user.id },
          { $set: profileFeilds },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profileFeilds);
      await profile.save();

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

router.get('/', async (req, res) => {
  try {
    const profile = await Profile.find().populate('user', ['name', 'email']);
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'email']);
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    return res.status(500).send('Server error');
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.send('User Deleted');
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Please enter a title').exists(),
      check('company', 'Enter company name').exists(),
      check('from', 'Enter from (date)').exists(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, description } = req.body;

    const expFeilds = {};
    if (company) expFeilds.company = company;
    if (title) expFeilds.title = title;
    if (description) expFeilds.description = description;
    if (location) expFeilds.location = location;
    if (from) expFeilds.from = from;
    if (to) expFeilds.to = to;

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(expFeilds);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience
      .map((item) => item.id)
      .filter((item) => item == req.params.exp_id); //.indexOf(req.params.exp_id)
    profile.experience.splice(removeIndex, 1);
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: encodeURI(
        `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
      ),
      method: 'GET',
      headers: {
        'user-agent': 'node.js',
        Authorization: `token ${config.get('githubToken')}`,
      },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
