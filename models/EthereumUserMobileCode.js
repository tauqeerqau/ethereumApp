/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var UserMobileCodeSchema   = new mongoose.Schema({
    userName: String,
    userContactNumber: String,
    userMobileCode:Number
});

// Export the Mongoose model
module.exports = mongoose.model('EthereumUserMobileCode', UserMobileCodeSchema);

