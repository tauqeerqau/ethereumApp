/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var TransactionChartSchema   = new mongoose.Schema({
    transactionTimestamp: String,
    transactionValue: String,
});

// Export the Mongoose model
module.exports = mongoose.model('TransactionChart', TransactionChartSchema);

