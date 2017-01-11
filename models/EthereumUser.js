/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var UserSchema   = new mongoose.Schema({
    userName: String,
    userEmail: String,
    userContactNumber: String,
    userPassword: String,
    userEthereumId: String,
    userProfileStatus: Number,
    userAddress: String,
    userOccupation: String,
    userProfilePictureURL: String
});

// Export the Mongoose model
module.exports = mongoose.model('EthereumUser', UserSchema);

