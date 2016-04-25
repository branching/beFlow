// Code dependencies
var express = require('express'),
  app = express(),
  server = app.listen(3000),
  io = require('socket.io').listen(server);

// Basic express server, only for static content
app.use(express.static(__dirname + '/cln'));

global.side = "svr";

// Start app
beflowModel = require('./svr/beflow').beflow;
beflow = new beflowModel({ 'io': io });

var bodyParser = require('body-parser')
// parse application/json 
app.use(bodyParser.json())

// Start Express
console.log("beFlow application server ready!");
