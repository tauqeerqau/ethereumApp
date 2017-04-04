/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var EthereumUserTransactionsSchema = new mongoose.Schema({
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'EthereumUser' },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'EthereumUser' },
    transactionAmount: Number,
    transactionReason: String,
    createdOnUTC: String,
    updatedOnUTC: String,
    transactionId: String
});

// Export the Mongoose model
module.exports = mongoose.model('EthereumUserTransactions', EthereumUserTransactionsSchema);