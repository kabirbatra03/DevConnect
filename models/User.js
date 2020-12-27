const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required:true,
        unique:true,
    },
    password: {
        type: String,
        reqiured: true,
    },
    avatar: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

//Creating variable "User" and user in database with UserSchema
module.exports = User = mongoose.model('user', UserSchema);