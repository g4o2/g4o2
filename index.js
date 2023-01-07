const express = require('express');
const app = express();
const http = require('http');
const mysql = require('mysql')
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var con = mysql.createConnection({
  host: 'sql12.freemysqlhosting.net',
  user: 'sql12561191',
  database: 'sql12561191',
  password: process.env.DB_PASS
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected");
});

app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + '/style.css');
})
app.get('/img/0000001.jpg', (req, res) => {
  res.sendFile(__dirname + '/img/0000001.jpg');
})
app.get('/img/default-pfp.png', (req, res) => {
  res.sendFile(__dirname + '/img/default-pfp.png');
})
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
/*
app.get("/:username/chat", (req, res, next) => {
  req.username = req.params.username;
  next()
}, (req, res, next) => {
  res.send({
    echo: req.username
  })
})
*/
io.on('connection', (socket) => {
  socket.on('user-connect', (username) => {
    console.log(`user ${username} connected`);
    io.emit('user-connect', username);
  })
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
io.on('connection', (socket) => {
  socket.on('message-submit', (messageDetails) => {
    io.emit('message-submit', messageDetails);
    console.log(messageDetails);
    let username = messageDetails.username;
    let message = messageDetails.message;
    let date = messageDetails.date;
    var sql = "insert into g4o2 (username, message, message_date) values (?, ?, ?)";
    con.query(sql, [username, message, date], function(err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
    // con.end();
  });
})
io.on('connection', (socket) => {
  socket.on('load-messages', (username) => {
    console.log(`user ${username} load chat`)
    con.query('SELECT * from g4o2', (err, rows, fields) => {
      if (err) throw err
      rows = rows.map(v => Object.assign({}, v));
      io.emit('load-messages', rows);
      console.log(rows);
    })
  })
})
server.listen(3000, () => {
  console.log('listening on *:3000');
});