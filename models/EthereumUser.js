/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var UserSchema   = new mongoose.Schema({
    userName: String,
    userEmail: String,
    userFullName: String,
    userContactNumber: String,
    userPassword: String,
    userEthereumId: String,
    userProfileStatus: Number,
    userAddress: String,
    userOccupation: String,
    userAddress: String,
    userProfilePictureURL: String,
    ethereumUserApplicationToken: String,
    ethereumUserPasscode:String,
	ethereumUserPasscodeStatus: Number
});

// Export the Mongoose model
module.exports = mongoose.model('EthereumUser', UserSchema);

