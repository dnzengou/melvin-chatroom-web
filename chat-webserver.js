'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const Wit = require('node-wit').Wit;


app.set('port', (process.env.PORT || 3000));

// Wit.ai parameters
const WIT_TOKEN = process.env.WIT_TOKEN || '6OLD24RCABCBZHU3YJRWTY2CAJ7UMOV6';
const contexts = {};
const sockets = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	sockets[socket.id] = socket;
	contexts[socket.id] = {context: {}};

  socket.on('chat message', function(msg){
    socket.emit('chat message', msg);

    const sessionId = socket.id;


		wit.runActions(
        sessionId, // the user's current session
        msg, // the user's message 
        contexts[sessionId], // the user's current session state
        (error, context) => {
          if (error) {
            console.log('Oops! Got an error from Wit:', error);
          } else {
            // Our bot did everything it has to do.
            // Now it's waiting for further messages to proceed.
            console.log('Waiting for futher messages.');

            // Updating the user's current session state
            contexts[sessionId] = context;
          }
        }
      );


  });
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


// Our bot actions
const actions = {
  say(sessionId, context, message, cb) {
  	sockets[sessionId].emit('chat message', message);
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
    cb(context);
  },
  error(sessionId, context, error) {
    console.log(error.message);
  },
  // You should implement your custom actions here
  // See https://wit.ai/docs/quickstart
};

// Setting up our bot
const wit = new Wit(WIT_TOKEN, actions);