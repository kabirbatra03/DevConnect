const mongoose = require('mongoose');
const ProfileSchema = new mongoose.Schema({
  user: {
    //reference
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  company: {
    type: String,
  },
  website: {
    type: String,
  },
  bio: {
    type: String,
  },
  location: {
    type: String,
  },
  age: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  education: {
    type: String,
  },
  experience: [
    {
      title: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      location: {
        type: String,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      description: {
        type: String,
      },
    },
  ],
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
