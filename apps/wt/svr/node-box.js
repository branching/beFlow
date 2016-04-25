var Backbone = require('backbone');
var _ = require('underscore');
var NodeModel = require('./node').Node;
var PortModel = require('./port').Port;
var PortsModel = require('./port').Ports;
var StoreModel = require('./store').Store;

exports.NodeBox = NodeModel.extend({
  defaults: function() {
    return {
      state: {}
    };
  },
  type: "svr",
  inputs: {},
  outputs: {},
  initialize: function () {
    this.Inputs = new PortsModel();
    this.Outputs = new PortsModel();
    this.Store = new StoreModel();

    this.parentGraph = this.get("parentGraph");
  },
  initializePorts: function () {
    for (var inputname in this.inputs) {
      if (this.inputs.hasOwnProperty(inputname)) {
        var inInfo = this.inputs[inputname];
        inInfo.name = inputname;
        this.addInput(inInfo);
      }
    }
    for (var outputname in this.outputs) {
      if (this.outputs.hasOwnProperty(outputname)) {
        var outInfo = this.outputs[outputname];
        outInfo.name = outputname;
        this.addOutput(outInfo);
      }
    }

    this.initializeModule();
  },
  initializeModule: function(){
    // for example, override in nodes/image-combine.js
  },
  send: function (name, value, socket, room) {
    // Send message out to connected modules
    // Defer to make this safe for infinite loops
    var self = this;
    _.defer(function(){
      self.trigger("send:"+name, value, socket, room);
    });
  },
  receive: function (name, value, socket) {
    if (this["input"+name])
      this["input"+name](value, socket)
    else
      this["_"+name] = value
  },
  setState: function () {
    var state = this.get("state");
    if (state){
      for (var name in state) {
        if (this["input"+name]){
          this["input"+name](state[name]);
        } else {
          this["_"+name] = state[name];
        }
      }
    }
  },
  addInput: function (info) {
    if (info.id === undefined) {
      info.id = info.name;
    }
    info.parentNode = this;
    // Name must be unique
    var replace = this.Inputs.get(info.id);
    if (replace) {
      replace.set(info);
      return;
    }
    var newPort = new PortModel(info);
    newPort.node = this;
    newPort.parentGraph = this.parentGraph;
    this.Inputs.add(newPort);

    // Set state to post defaults
    var currentState = this.get("state");
    if ( info.hasOwnProperty("default") && info["default"] !== "" && !currentState.hasOwnProperty(info.name) ) {
      currentState[info.name] = info["default"];
    }
    return newPort;
  },
  addOutput: function (info) {
    if (info.id === undefined) {
      info.id = info.name;
    }
    info.parentNode = this;
    // Name must be unique
    var replace = this.Outputs.get(info.id);
    if (replace) {
      replace.set(info);
      return;
    }
    var newPort = new PortModel(info);
    newPort.node = this;
    newPort.parentGraph = this.parentGraph;
    this.Outputs.add(newPort);

    return newPort;
  },
  subscribe: function(room, socket) {
    socket.join(room);
  },
  unsubscribe: function(room, socket) {
    socket.leave(room);
  },
  connectEdge: function(edge) {
    // Called from Edge.connect();
  },
  disconnectEdge: function(edge) {
    // Called from Edge.disconnect();
  },
  remove: function(){
    // Called from Graph.remove
  }

});
