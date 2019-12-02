const express = require('express');
const path = require('path');
const server = express();
server.use(express.static(path.join(__dirname, 'public')));

server.listen(9000); //port no is 80 usually

var Datastore = require('nedb');
var UserDB = new Datastore({ filename: __dirname + '/Users.db', autoload: true });

server.get('/users', function (req, res) {
  //從資料庫擷取data
  UserDB.find({}, function (err, users) {
    if (!err) {
      users.sort(function (a, b) { return Math.random() - 0.5; });
      res.send(users);
    }
  });
});