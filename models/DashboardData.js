/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var DashboardDataSchema   = new mongoose.Schema({
    averageBlockTime: String,
    hashRate: String,
    lastBlock: String,
    currentRate: String,
    difficulty: String,
    uncleRate: String,
    gasLimit: String,
    gasPrice: String,
    activeNodeCount: String,
    totalSupply: String,
    marketCapacity: String,
    totalTransactionCount: String
});

// Export the Mongoose model
module.exports = mongoose.model('DashboardData', DashboardDataSchema);

