var mongoose = require('mongoose');
var EthereumUser = require('./EthereumUser');
var Conversation = require('./Conversation');

// Define our beer schema
var ConversationMessagesSchema   = new mongoose.Schema({
    messageType: String,
    messageText: String,
    messageRequestedEtherValue: String,
    messageData:Object,
    _conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    _messageToUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'EthereumUser' },
    _messageFromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'EthereumUser' },
    _messageFromMobile: String,
    _messageToMobile: String,
    createdOnUTC: String,
    updatedOnUTC: String,
    userMessageFromDeliverStatus: { type: Boolean, default: false },
    isDeletedByUser1:  { type: Boolean, default: false },
    isDeletedByUser2:  { type: Boolean, default: false },
    isSyncedUser1:{ type: Boolean, default: false },
    isSyncedUser2:{ type: Boolean, default: false },
});
ConversationMessagesSchema.index({ _messageFromMobile: 1,_messageToMobile: 1,createdOnUTC:1}, { "unique": true })
// Export the Mongoose model
module.exports = mongoose.model('ConversationMessages', ConversationMessagesSchema);