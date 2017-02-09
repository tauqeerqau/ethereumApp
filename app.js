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
// sever object
var server = require('http').Server(app);
//
var index = require('./routes/index');
var users = require('./routes/users');
var ethereumUsers = require('./routes/ethereumUsers');

//var app = express();
//server.listen(3000);
server.listen(process.env.PORT);
//for socket IO page
/*app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});*/
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


app.use('/', index);
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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var rooms = [];
var usernames = [];
var io = require('socket.io')(server);
io.sockets.on('connection', function (client) {
  client.on('createRoom', function (roomName) {//Mobile App will send Room Name
    var flag = false;
    for (var i = 0; i < rooms.length; i++) {
      if (rooms[i] == roomName) {
        flag = true;
      }
    }
    if (flag === false) {
      rooms.push(roomName);
    }
    client.room = roomName;
    client.emit('updaterooms', rooms, client.room);
  });
  client.on('adduser', function (data) {// IOS will send { id: 1, name: 'ali', _roomId = '', roomName='' }
    var conversation = new Conversation();
    var date = new Date();
    console.log(data);
    client.username = data;
    client.room = 'Lobby';
    client.emit('updatechat', 'SERVER', 'you have connected to ' + client.room);
    client.broadcast.to(client.room).emit('updatechat', 'SERVER', data + ' has connected to this room');
    Conversation.findOne({ user1Id: data.user1Id, user2Id: data.user2Id })
      .exec(function (err, conversationObject) {
        if (err) {
          res.json(err);
        }
        else {
          Conversation.findOne({ user1Id: data.user1Id, user2Id: data.user2Id })
            .exec(function (err, conversationObject) {
              if (err) {

              }
              if (conversationObject == null) {
                conversation._user1Id = data.user1Id;
                conversation._user2Id = data.user2Id;
                conversation.username1 = data.username1;
                conversation.username2 = data.username2;
                conversation.createdOnUTC = date;
                conversation.updatedOnUTC = date;
                conversation.isDeleted = false;
                conversation.save(function (err) {
                  if (err) {

                  }
                  else {
                    client.username = data.name;
                    client.room = data.roomName;
                    usernames[data.name] = data.name;
                    client.join(data.roomName);
                    client.emit('updatechat', 'SERVER', 'you have connected to ' + data.roomName);
                    client.broadcast.to('Lobby').emit('updatechat', 'SERVER', data.name + ' has connected to this room');
                    client.emit('updaterooms', rooms, data.roomName);
                    client.emit('conversationId', conversation._id);
                    //BotWelcomeMessage(data, date);
                  }
                });
              }
              else {
                client.username = data.username;
                client.room = data.roomName;
                usernames[data.name] = data.name;
                client.join(data.roomName);
                client.emit('updatechat', 'SERVER', 'you have connected to ' + data.roomName);
                client.broadcast.to('Lobby').emit('updatechat', 'SERVER', data.name + ' has connected to this room');
                client.emit('updaterooms', rooms, data.roomName);
                client.emit('conversationId', conversationObject._id);
              }
            });
        }
      });

  });
  client.on('sendchat', function (data) {//IOS will send Room Name
    console.log(data);
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
  client.on('sendImage', function (data) {//IOS will send Room Name
    console.log(data.Image);
    console.log(__dirname);
      var extension = data.extension;
      var imageName = uuid.v4() + extension;
      var file = __dirname + "//public/images/" + imageName+'.'+extension;
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
  client.on('switchRoom', function (newroom) {
    var oldroom;
    oldroom = client.room;
    client.leave(client.room);
    client.join(newroom);
    client.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
    client.broadcast.to(oldroom).emit('updatechat', 'SERVER', client.username + ' has left this room');
    client.room = newroom;
    client.broadcast.to(newroom).emit('updatechat', 'SERVER', client.username + ' has joined this room');
    client.emit('updaterooms', rooms, newroom);
  });
  client.on('disconnect', function () {
    delete usernames[client.username];
    io.sockets.emit('updateusers', usernames);
    client.broadcast.emit('updatechat', 'SERVER', client.username + ' has disconnected');
    client.leave(client.room);
  });

  client.on('event', function (data) { });
});




/*socket.on('adduser', function (data) {// IOS will send { id: 1, name: 'ali', _roomId = '', roomName='' }
  var conversation = new Conversation();
  var date = new Date();
  Conversation.findOne({ user1Id: data.id, user2Id: '586e3b264a030317e09feeb9' })
    .exec(function (err, conversationObject) {
      if (err) {
        res.json(err);
      }
      else {
        if (conversationObject == null) {
          conversation._user1Id = data.id;
          conversation._user2Id = "586e3b264a030317e09feeb9"
          conversation.username1 = data.name;
          conversation.username2 = "April App";
          conversation._roomId = data._roomId;
          conversation.createdOnUTC = date;
          conversation.updatedOnUTC = date;
          conversation.isDeleted = false;
          conversation.save(function (err) {
            if (err) {

            }
            else {
              socket.username = data.name;
              socket.room = data.roomName;
              usernames[data.name] = data.name;
              socket.join(data.roomName);
              socket.emit('updatechat', 'SERVER', 'you have connected to ' + data.roomName);
              socket.broadcast.to('Lobby').emit('updatechat', 'SERVER', data.name + ' has connected to this room');
              socket.emit('updaterooms', rooms, data.roomName);
              socket.emit('conversationId', conversation._id);
              BotWelcomeMessage(data, date);
            }
          });
        }
        else {
          socket.username = data.name;
          socket.room = data.roomName;
          usernames[data.name] = data.name;
          socket.join(data.roomName);
          socket.emit('updatechat', 'SERVER', 'you have connected to ' + data.roomName);
          socket.broadcast.to('Lobby').emit('updatechat', 'SERVER', data.name + ' has connected to this room');
          socket.emit('updaterooms', rooms, data.roomName);
          socket.emit('conversationId', conversationObject._id);
        }
      }
    });
});*/

module.exports = app;
