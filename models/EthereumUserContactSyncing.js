/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var EthereumUserContactSyncing   = new mongoose.Schema({
    doesNumberExist: Boolean,
    userContactNumber: String
});

// Export the Mongoose model
module.exports = mongoose.model('EthereumUserContactSyncing', EthereumUserContactSyncing);

