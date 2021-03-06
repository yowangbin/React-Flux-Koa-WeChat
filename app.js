/*!
 * WeChat - app.js
 * Copyright(c) 2016 wangbin <yowangbin@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var middlewares = require('koa-middlewares');
var routes = require('./routes');
var config = require('./config');
var path = require('path');
var http = require('http');
var koa = require('koa');
var io = require('socket.io');
var db = require('./models/db');
var app = koa();
var router = middlewares.router();
var randomID = require("random-id");

/**
 * ignore favicon
 */
app.use(middlewares.favicon(path.join(__dirname, 'public/images', 'favicon.ico')));

/**
 * response time header
 */
app.use(middlewares.rt());

/**
 * static file server
 */
app.use(middlewares.staticCache(path.join(__dirname, 'public'), {
  buffer: !config.debug,
  maxAge: config.debug ? 0 : 60 * 60 * 24 * 7
}));
app.use(middlewares.bodyParser());

if (config.debug && process.env.NODE_ENV !== 'test') {
  app.use(middlewares.logger());
}

/**
 * router
 */

routes(router);

app.use(router.routes());
app.use(router.allowedMethods());

app = module.exports = http.createServer(app.callback());

/**
 * io
 */
io(app).on('connection', function (socket) {
  var addedUser = false;
  socket.emit('login', {
    // socketId: socket.id
  });
  socket.on('new message', function (message, id) {
    db.addOneChat({
      message: message,
      name: socket.username,
      id: id
    }).then((chats) => {
      socket.broadcast.emit('new message', {
        list: chats
      });
    })
  });

  socket.on('add user', function (username) {
    if (addedUser) return;
    db.addOneUser({
      name: username
    }).then((user) => {
      if (user.result['ok'] === 1) {
        addedUser = true;
        socket.username = username;
        socket.userId = user.ops[0]._id;
        db.getAllUsers()
          .then((users) => {
            socket.broadcast.emit('user joined', { id: user.ops[0]._id, users: users });
          });

        db.getAllChats()
          .then((chats) => {
            socket.broadcast.emit('get message', {
              username: username,
              list: chats
            });
          });
      }
    });
  });


  socket.on('disconnect', function () {
    if (addedUser) {
      db.deleteUser(socket.userId).then((users) => {
        console.log(users)
        socket.broadcast.emit('user left', {
          username: socket.username,
          users: users
        });
      });
    }
  });

  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username,
      typing: true
    });
  });

  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username,
      typing: false
    });
  });
});

if (!module.parent) {
  app.listen(config.port);
  console.log('$ open http://127.0.0.1:' + config.port);
}
