var mongoose = require('mongoose');
var EthereumUser = require('./EthereumUser');
var Conversation = require('./Conversation');

// Define our beer schema
var ConversationMessagesSchema   = new mongoose.Schema({
    messageType: String,
    messageText: String,
    messageData:Object,
    _conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    _messageToUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'EthereumUser' },
    _messageFromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'EthereumUser' },
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('ConversationMessages', ConversationMessagesSchema);