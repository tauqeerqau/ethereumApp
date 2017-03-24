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
    createdOnUTC:  { type: Date, default: Date.now },
    updatedOnUTC:  { type: Date, default: Date.now },
    conversationSyncByUser1: { type: Boolean, default: false },
    conversationSyncByUser2: { type: Boolean, default: false },
    isDeletedByUser1:  { type: Boolean, default: false },
    isDeletedByUser2: { type: Boolean, default: false }
});

ConversationSchema.index({user1Mobile:1,user2Mobile:1}, { "unique": true })
// Export the Mongoose model
module.exports = mongoose.model('Conversation', ConversationSchema);