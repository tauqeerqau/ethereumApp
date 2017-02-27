/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var GasUsedChartSchema   = new mongoose.Schema({
    gasUsedTimestamp: String,
    gasUsedValue: String,
});

// Export the Mongoose model
module.exports = mongoose.model('GasUsedChart', GasUsedChartSchema);

