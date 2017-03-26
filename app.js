var app = require('express')();
var uuid = require('node-uuid');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multer = require('multer');
var fs = require("fs");
var hashes = require('hashes');
var HashMap = require('hashmap');
// sever object
var server = require('http').Server(app);
//
var index = require('./routes/index');
var users = require('./routes/users');
var ethereumUsers = require('./routes/ethereumUsers');

var EthereumUser = require('./models/EthereumUser');
var Conversation = require('./models/Conversation');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
//var app = express();
server.listen(process.env.PORT||3000);
//server.listen(process.env.PORT);
//for socket IO page
app.get('/', function (req, res) {
  res.json("Data");
  // res.sendfile(__dirname + '/index.html');
});
//
var Conversation = require('./models/Conversation');
var ConversationMessages = require('./models/ConversationMessages');
//app.use(bodyParser.urlencoded());
//app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//app.use('/', index);
app.use('/users', users);
app.use('/ethereumUsers', ethereumUsers);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log("in 500 error");
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var rooms = [];
var usernames = [];
var userMobileList = [];
var userHashMaps = new HashMap();
//ConversationMessages.remove({},function(err,ree){});
var io = require('socket.io')(server);
io.sockets.on('connection', function (client) {
  console.log(client.id);
  client.on('', function () {

  });
  //Creating room by concating both users mobile numbers.
  client.on('createRoom', function (userToken, userMobileNumberFrom, userMobileNumberTo) {
    //checking whether a room exists or not
    var isRoomExist = rooms.find(x => x == userMobileNumberFrom + userMobileNumberTo || x == userMobileNumberTo + userMobileNumberFrom);
    if (!isRoomExist) {
      rooms.push(userMobileNumberFrom + userMobileNumberTo);
    }
    //assigning room to client
    client.room = userMobileNumberFrom + userMobileNumberTo;
    //joining the existing room on the socket
    client.join(userMobileNumberFrom + userMobileNumberTo);
    //emiting the room Id to the client App
    client.emit('roomId', userMobileNumberFrom + userMobileNumberTo);
  });
  //Switihing Room 
  client.on('switchRoom', function (userToken, userMobileNumberFrom, userMobileNumberTo) {
    //Leaving the Client's current room
    client.leave(client.room);
    var isRoomExist = rooms.find(x => x == userMobileNumberFrom + userMobileNumberTo || x == userMobileNumberTo + userMobileNumberFrom);
    console.log(isRoomExist);
    if (isRoomExist) {
      console.log("1");
      //Joining the new room
      client.room = isRoomExist;
      client.join(isRoomExist);
      client.emit('onRoomSet', isRoomExist);
    }
    else {
      console.log("3");
      rooms.push(userMobileNumberFrom + userMobileNumberTo);
      client.room = userMobileNumberFrom + userMobileNumberTo;
      client.join(userMobileNumberFrom + userMobileNumberTo);
      client.emit('onRoomSet', userMobileNumberFrom + userMobileNumberTo);
    }
  });
  client.on('mnb', function () {
    console.log("Pong received from client");
  });
  //Sending Conversation
  client.on('sendConversation', function (userToken, userMobile, isDbNotEmpty) {//client ask for conversation list 
    //Check usermobile in db either as user1mobile or at user2Mobile
    userHashMaps.set(userMobile, client.id);
    client.userMobile = userMobile;
    console.log(client.id);
    //sendMessageToOtherUser(userMobile);
    //***************** */
    Conversation.find({ $or: [{ user1Mobile: userMobile }, { user2Mobile: userMobile }] }, null, { sort: { 'updatedOnUTC': -1 } }, function (err, conversationList) {
      var objectArray = [];//this arraty to push messages
      if (conversationList != null) {
        if (conversationList.length > 0) {
          var count = 0;
          for (var i = 0; i < conversationList.length; i++) {
            var conversation = conversationList[i];
            if (isDbNotEmpty == true) {
              //here we check that is current conversation is synced by user or not
              var requestingMobileNumber = userMobile;
              /*if (userMobile.toString().trim() === conversation.user1Mobile) {
                if (conversation.conversationSyncByUser1 === true)
                  continue;
              }//end of if for requesting persion is user1Mobile
              else {
                if (conversation.conversationSyncByUser2 === true)
                  continue;
              }*///end of else
            }//end of if  for db is not empty from mobile
            // 
            console.log("sendConversation Called :and total conversations for users " + conversationList.length);
            var conversMessageProcessing = function (conversation) {
              ConversationMessages.find({ _conversationId: conversation._id }, null, { sort: { 'createdOnUTC': 'descending' } },
                function (err, conversationMessages) {
                  console.log(conversation.user1Mobile + ":" + conversation.user2Mobile)
                  if (conversationMessages != null && conversationMessages.length > 0) {
                    count++;
                    console.log("conversation message length" + conversationMessages.length);
                    var obj = getConversationObjForUserToSend(userMobile, conversation, conversationMessages[0]);
                    obj.messages = getMessageObjForUserToSend(conversationMessages);
                    console.log("conversationResponse" + obj.messages);
                    objectArray.push(obj);
                    //this is for sending only once response to mobile side
                    if (count >= conversationList.length) {
                      client.emit('onConversationResponse', objectArray);
                    }
                  }//end of if for err obj null
                  else {//wherr err not null
                    console.log("error " + err);
                  }
                }).limit(20);
            }//endo f fucntion proccsing of conversation messages
            conversMessageProcessing(conversation);
          }//end of loop of conversatrion lenth
        }//end of if for conversation list contain messages more than 0
      }
      //first find all messages which are not delivered
      ConversationMessages.find({ $and: [{ _messageFromMobile: userMobile }, { userMessageFromDeliverStatus: false }] }, null, { sort: { 'updatedOnUTC': -1 } })
      .exec(function (err, messageList) {
        var allMessagesServerIds = [];
        var orignalSenderOfMessages = "";
        if (messageList != null) {
          messageList.forEach(function (message) {
            message.userMessageFromDeliverStatus = true;
            orignalSenderOfMessages = message._messageFromMobile;
            allMessagesServerIds.push(message._id);
            message.save();
          });//end of foreach

        }
        console.log("all message server ids" + allMessagesServerIds);
        io.sockets["in"](client.room).emit('onAndroidClientMsgAcknowledge', allMessagesServerIds);
        var clientIdForOtherUser = userHashMaps.get(orignalSenderOfMessages);
        if (clientIdForOtherUser != null && clientIdForOtherUser.length > 0) {
          io.sockets["in"](client.room).emit('onAndroidClientMsgAcknowledge', allMessagesServerIds);
        }
      });


    });//end of conversation find from db

  });//end of sendConversation function
  //this is to set convers status synched
  client.on('conversationAcknoledge', function (token, userMobile) {
    console.log("conversationAcknoledge event for " + userMobile);
    setUserConversationStatus(userMobile, true);//here we call to set all function setting conversation true
  });//end of emitter conversation Acknolege
  client.on('sendLocalConversation', function (token, mobileNum, conversationList) {
    console.log(rooms);
    var conversationIds = [];
    var allMessagesIds = [];
    console.log(client);
    console.log("In local send conversation");
    var allLocaList = JSON.parse(conversationList);
    console.log("local conversation" + allLocaList.length);

    ///&************************************
    for (var i = 0; i < allLocaList.length; i++) {
      var conversItem = allLocaList[i];
      var convSaveDb = new Conversation;
      convSaveDb.user1Mobile = mobileNum;
      convSaveDb.user2Mobile = conversItem.mobileNumberOfOtherPerson;
      convSaveDb.conversationSyncByUser1 = true;
      if (conversItem.conversationServerId != null && conversItem.conversationServerId.length > 0) {
        convSaveDb._id = conversItem.conversationServerId;
      } else {
        convSaveDb.save();
      }
      var objectOfConversation = new Object();
      objectOfConversation.conversationClientId = conversItem.conversationClientId;
      objectOfConversation.conversationServerId = convSaveDb._id.toString();
      //  console.log(convSaveDb._id);
      conversationIds.push(objectOfConversation);
      var allLocalMessages = conversItem.unSyncedMessages;
      for (var j = 0; j < allLocalMessages.length; j++) {
        var localConversationFromMobile = allLocalMessages[j];
        var localConversationObj = new ConversationMessages;
        localConversationObj.messageType = localConversationFromMobile.messageType;
        localConversationObj.messageText = localConversationFromMobile.messageText;
        localConversationObj.messageRequestedEtherValue = localConversationFromMobile.messageRequestedEtherValue;;
        localConversationObj._messageFromMobile = localConversationFromMobile.msgFromMobileNumber;
        localConversationObj._messageToMobile = conversItem.mobileNumberOfOtherPerson;
        localConversationObj._conversationId = convSaveDb._id;
        //var dateMessage = new Date(parseInt(localConversationFromMobile.createdOnUTC, 10));
        localConversationObj.createdOnUTC = localConversationFromMobile.createdOnUTC;
        localConversationObj.save();
        var objectForMessage = new Object();
        objectForMessage.messageClientId = localConversationFromMobile._id;;
        objectForMessage.messageServerId = localConversationObj._id.toString();
        console.log("object for message" + objectForMessage);
        allMessagesIds.push(objectForMessage);
      }//end of for loop of j
      if (allMessagesIds.length > 0) {
        io.sockets["in"](client.room).emit('newMessagesArrived', client.username, true);
        console.log("Before fliping status for " + convSaveDb.user2Mobile);
        setUserSpecificConversationStatusFalse(convSaveDb.user2Mobile, convSaveDb._id);
        //sendMessageToOtherUser(convSaveDb.user2Mobile);
      }
    }//end of loop of iF

    client.emit('onRecieveSynchIDs', conversationIds, allMessagesIds);
  });//local conversation listner end
  //when user recieve other messages and send acknolege that message deliver successfully
  client.on('onAcknowledgeMessage', function (token, senderMobileNum, messageServerId) {
    //first find all messages which are not delivered
    ConversationMessages.find({ $and: [{ _messageFromMobile: senderMobileNum }, { userMessageFromDeliverStatus: false }] }, null, { sort: { 'updatedOnUTC': -1 } })
      .exec(function (err, messageList) {
        var allMessagesServerIds = [];
        var orignalSenderOfMessages = "";
        if (messageList != null) {
          messageList.forEach(function (message) {
            message.userMessageFromDeliverStatus = true;
            orignalSenderOfMessages = message._messageFromMobile;
            allMessagesServerIds.push(message._id);
            message.save();
          });//end of foreach

        }
        console.log("all message server ids" + allMessagesServerIds);
        io.sockets["in"](client.room).emit('onAndroidClientMsgAcknowledge', allMessagesServerIds);
        var clientIdForOtherUser = userHashMaps.get(orignalSenderOfMessages);
        if (clientIdForOtherUser != null && clientIdForOtherUser.length > 0) {
          io.sockets["in"](client.room).emit('onAndroidClientMsgAcknowledge', allMessagesServerIds);
        }
      });
  });//end of on function of client
  client.on('sendImage', function (data) {//IOS will send Room Name
    console.log(data.Image);
    console.log(__dirname);
    var extension = data.extension;
    var imageName = uuid.v4() + extension;
    var file = __dirname + "//public/images/" + imageName + '.' + extension;
    fs.writeFile(file, data.Image, function (err) {
      if (err) {
        console.log(err);
      } else {

      }
    });
  });
  client.on('sendRequestchat', function (data) {//IOS will send Room Name
    var conversationMessage = new ConversationMessages();
    conversationMessage.messageType = data.messageType;
    conversationMessage.messageText = data.messageText;
    conversationMessage._conversationId = data._conversationId;
    conversationMessage._messageToUserId = data._messageToUserId;
    conversationMessage._messageFromUserId = data._messageFromUserId;
    conversationMessage.save(function (err, conMes) {
      if (conMes == null) {

      }
      else {

      }
    });
    io.sockets["in"](client.room).emit('updatechat', client.username, data);
  });
  client.on('pong', function () {
    console.log("Pong received from client");
  });
  client.on('disconnect', function () {
    userHashMaps.remove(client.userMobile);
    console.log("User Disconnect " + userHashMaps.count());
  });
  client.on('messagesRequest', function (data) {
    ConversationMessages.find({ _conversationId: data.conversationId }, null, { sort: { 'updatedOnUTC': -1 } }, function (err, conversationMessages) {
      client.emit('onMessagesReceived', conversationMessages);
    }).skip(data.pageNumber * 30).limit(30);
  });
  function sendMessageToOtherUser(mobileReciverNum) {
    console.log(mobileReciverNum + " in other send message");
    var otherUserKey = userHashMaps.get(mobileReciverNum);
    if (otherUserKey != null && otherUserKey.length > 0) {
      //here send specificaly user that fetch your messages
      io.sockets["in"](client.room).emit('newMessagesArrived');
    }
    else {
      //TODO send GCM message to other user
    }
  }//end of function

});


function getOtherUserMobile(userMobile, user1Mobile, user2Mobile) {
  console.log(user1Mobile + ":" + user2Mobile);
  if (userMobile.trim() === user1Mobile.trim()) {
    return user2Mobile;
  }
  else {
    return user1Mobile;
  }

}//end of getOtherUserMobile

function isConversationExist(userNum1, userNum2) {

}//end of function
//here we will implement the structure to send conversation obj 
function getConversationObjForUserToSend(userMobile, conversationFromDB) {
  var object = new Object();
  object.updatedOnUTC = conversationFromDB.updatedOnUTC;
  object.conversationId = conversationFromDB._id.toString();
  object.user2Mobile = getOtherUserMobile(userMobile, conversationFromDB.user1Mobile, conversationFromDB.user2Mobile);
  console.log(object);
  return object;
}//end of getConversation Obj

//here we will create object of message to send user
function getMessageObjForUserToSend(messageArrFromDb) {
  var allMessagesForUser = [];

  for (var i = 0; i < messageArrFromDb.length; i++) {//here to itereate on loop db result
    var object = new Object();
    messageObjFromDb = messageArrFromDb[i];
    object.msgFromMobileNumber = messageObjFromDb._messageFromMobile;
    object.messageId = messageObjFromDb._id.toString();
    object.createdOnUTC = messageObjFromDb.createdOnUTC;
    object.updatedOnUTC = messageObjFromDb.updatedOnUTC;
    object.messageText = messageObjFromDb.messageText;
    object.messageType = messageObjFromDb.messageType;
    object.messageRequestedEtherValue = messageObjFromDb.messageRequestedEtherValue;
    object.userMessageFromDeliverStatus = messageObjFromDb.userMessageFromDeliverStatus;
    allMessagesForUser.push(object);
  }//end of for loop
  return allMessagesForUser;
}//end of function for getting object for user

function setUserConversationStatus(userMobile, statusForConversation) {
  Conversation.find({ $or: [{ user1Mobile: userMobile }, { user2Mobile: userMobile }] }, null, { sort: { 'updatedOnUTC': -1 } })
    .exec(function (err, conversationList) {
      if (conversationList != null) {
        for (var i = 0; i < conversationList.length; i++) {
          conversation = conversationList[i];
          if (userMobile.toString().trim() === conversation.user1Mobile) {
            conversation.conversationSyncByUser1 = statusForConversation;
          }//end of if for requesting persion is user1Mobile
          else {
            conversation.conversationSyncByUser2 = statusForConversation;
          }//end of else
          //console.log(conversation);
          conversation.save();
        }//end of loop 
      }

    });
}//end of setUsersConversation status
function setUserSpecificConversationStatusFalse(userMobile, conversationId) {
  Conversation.find({ _id: conversationId })
    .exec(function (err, conversationList) {
      if (conversationList != null) {
        for (var i = 0; i < conversationList.length; i++) {
          conversation = conversationList[i];
          if (userMobile.toString().trim() === conversation.user1Mobile) {
            conversation.conversationSyncByUser1 = false;
          }//end of if for requesting persion is user1Mobile
          else {
            conversation.conversationSyncByUser2 = false;
          }//end of else
          //console.log(conversation);
          conversation.save();
        }//end of loop 
      }


    });
}//end of function for setting conversation status false
function sendHeartbeat() {
  io.sockets.emit('ping', Math.floor(new Date()));
  setTimeout(sendHeartbeat, 2000);
}

setTimeout(sendHeartbeat, 2000);
module.exports = app;
