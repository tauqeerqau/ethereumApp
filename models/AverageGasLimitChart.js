/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var AverageGasLimitChartSchema   = new mongoose.Schema({
    gasLimitTimestamp: String,
    gasLimitValue: String,
});

// Export the Mongoose model
module.exports = mongoose.model('AverageGasLimitChart', AverageGasLimitChartSchema);

