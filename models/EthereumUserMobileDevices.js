/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var EthereumUserMobileDevicesSchema   = new mongoose.Schema({
    userName: String,
    _userId: String,
    userMobileUniqueId: String,
    userMobileOSName: String,
    userMobileOSVersion: String,
    userLastLoginTime: String
});

// Export the Mongoose model
module.exports = mongoose.model('EthereumUserMobileDevices', EthereumUserMobileDevicesSchema);

