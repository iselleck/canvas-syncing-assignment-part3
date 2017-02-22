const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html ',
  });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

const draws = {};

console.log(`Listening on 127.0.0.1: ${port}`);

const io = socketio(app);


const onConnect = (sock) => {
  const socket = sock;

  socket.join('room1');

  const response = {
    name: 'server',
    msg: 'Someone has joined the room',
  };
  socket.broadcast.to('room1').emit('msg', response);

  socket.emit('msg', {
    name: 'server',
    msg: 'You joined the room',
  });
};

const onSqrs = (sock) => {
  const socket = sock;

  socket.on('draw', (data) => {
    if (!draws[data.name]) {
      draws[data.name] = data.coords;
    } else if (data.coords.lastUpdate > draws[data.name].lastUpdate) {
      draws[data.name] = data.coords;
    }

    io.sockets.in('room1').emit('draw', {
      name: data.name,
      coords: data.coords,
    });
  });
};


io.sockets.on('connection', (socket) => {
  console.log('started');

  onConnect(socket);
  onSqrs(socket);
});

console.log('Websocket server started');

