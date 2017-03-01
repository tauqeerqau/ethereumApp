var mongoose = require('mongoose');
var EthereumUser = require('./EthereumUser');


// Define our beer schema
var ConversationSchema   = new mongoose.Schema({
    _user1Id : { type: mongoose.Schema.Types.ObjectId, ref: 'EthereumUser' },
    username1:String,
    _user2Id : { type: mongoose.Schema.Types.ObjectId, ref: 'EthereumUser' },
    username2:String,
    user1Mobile:String,
    user2Mobile:String,
    createdOnUTC: Date,
    updatedOnUTC: Date,
    conversationReadByUser1: Boolean,
    conversationReadByUser2: Boolean,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('Conversation', ConversationSchema);