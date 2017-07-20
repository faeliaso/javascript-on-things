const five     = require('johnny-five');
const Tessel   = require('tessel-io');
const express  = require('express');
const SocketIO = require('socket.io');

const path = require('path');
const http = require('http');
const os   = require('os');

const app    = new express();
const server = new http.Server(app);
const socket = new SocketIO(server);
app.use(express.static(path.join(__dirname, '/app')));

const board = new five.Board({ io: new Tessel() });

board.on('ready', () => {
  const weatherSensor = new five.Multi({
    controller: 'BMP180',
    freq: 5000
  });

  socket.on('connection', client => {
    weatherSensor.on('change', () => {
      client.emit('change', {
        temperature: weatherSensor.thermometer.F,
        pressure: (weatherSensor.barometer.pressure * 10)
      });
    });
  });

  server.listen(3000, () => {
    console.log(`http://${os.networkInterfaces().wlan0[0].address}:3000`);
  });
});
