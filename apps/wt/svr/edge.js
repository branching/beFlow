var Backbone = require('backbone');
var _ = require('underscore');

exports.Edge = Backbone.Model.extend({
  defaults: {
    source: [0, "default", "svr"], 
    target: [0, "default", "svr"]
  },
  initialize: function () {
    this.parentGraph = this.get("parentGraph");
  },
  Source: null,
  Target: null,
  connected: false,
  connect: function () {
    // Called from graph.connectEdges()
    if ( !this.get("source")[2] || this.get("source")[2] == "svr" ) {
      this.Source = this.parentGraph.get("nodes").get( this.get("source")[0] ).Outputs.get( this.get("source")[1] );
      if (!this.Source)
        return false;
    }

    if ( !this.get("target")[2] || this.get("target")[2] == "svr" ) {
      this.Target = this.parentGraph.get("nodes").get( this.get("target")[0] ).Inputs.get( this.get("target")[1] );
      if (!this.Target) {
        return false;
      }
    }

    if (this.Source) {
      this.Source.connect(this);
      // Set up listener
      this.Source.node.on( "send:"+this.get("source")[1], this.send, this );
    }

    if (this.Target) {
      this.Target.connect(this);
      if (this.Target.node) {
        this.Target.node.connectEdge(this);
      }

      // Set up listener by socket
      if ( this.get("source")[2] && this.get("source")[2] == "cln" ) {
        this.receiveBySocket( "io:"+this.get("target")[0]+":"+this.get("target")[1]+":"+this.get("source")[0]+":"+this.get("source")[1] )
      }
    }
    
    this.connected = true;
    
    return this;
  },
  send: function (value, socket, room) {
    if ( !this.get("source")[2] || this.get("source")[2] == "svr" ) {
      if ( !this.get("target")[2] || this.get("target")[2] == "svr" ) {
        this.Target.node.receive( this.get("target")[1], value, socket )
      }
      
      if ( this.get("target")[2] && this.get("target")[2] == "cln" ) {
        this.sendBySocket( "io:"+this.get("source")[0]+":"+this.get("source")[1]+":"+this.get("target")[0]+":"+this.get("target")[1], value, socket, room )
      }
    }
  },
  sendBySocket: function(name, value, socket, room) {
    var tx = this.Source.get("tx");
    if ( !tx ) {
      this.sendClient(name, value, socket);
    } else {
      switch( tx ) {
          case "client":
              this.sendClient(name, value, socket);
              break;
          case "broadcast":
              this.sendBroadcast(name, value, socket);
              break;
          case "all":
              this.sendAll(name, value);
              break;
          case "room":
              this.sendRoom(name, value, socket, room);
              break;
          default:
              this.sendClient(name, value, socket);
      }
    }
  },
  sendClient: function(name, value, socket) {
    if (socket) {
      socket.emit(name, value);
    } else {
      this.sendAll(name, value);
    }
  },
  sendBroadcast: function(name, value, socket) {
    if (socket) {
      socket.broadcast.emit(name, value);
    } else {
      this.sendAll(name, value);
    }
  },
  sendAll: function(name, value){
    this.parentGraph.io.sockets.emit(name, value);
  },
  sendRoom: function(name, value, socket, room) {
    if (room) {
      this.parentGraph.io.to(room).emit(name, value);
    } else {
      this.sendClient(name, value, socket);
    }
  },
  receiveBySocket: function (name) {
    var self = this;

    // Validar que NO se repitan los this.parentGraph.io.sockets.on('connection', function(socket) {...
    if ( !this.existsElement(this.parentGraph.usedPorts, name) ) {
      this.parentGraph.usedPorts.push(name);
      // Add listeners to the sockets
      this.parentGraph.io.sockets.on('connection', function(socket) {
        self.parentGraph.activatedPorts.push(name);
        socket.on(name, function(value) {
          if ( self.existsElement(self.parentGraph.activatedPorts, name) ) {
            self.Target.node.receive( self.Target.id, value, socket );
          }
        });
      });
    } else {
      this.parentGraph.activatedPorts.push(name);
    }
  },
  unsubscribeSocket: function (name) {
    var index = this.parentGraph.activatedPorts.indexOf(name);
    if (index > -1)
      this.parentGraph.activatedPorts.splice(index, 1);
  },
  existsElement: function (arr, name) {
    return (arr.indexOf(name) != -1)
  },
  disconnect: function () {
    // Called from graph.removeEdge()
    if (this.Source) {
      this.Source.disconnect(this);
      // Remove listener
      this.Source.node.off( "send:"+this.Source.id, this.send, this );
    }
    
    if (this.Target) {
      this.Target.disconnect(this);
      if (this.Target.node)
        this.Target.node.disconnectEdge(this);
    }
    
    // Unsubscribe listener by socket
    if ( !this.get("target")[2] || this.get("target")[2] == "svr" ) {
      if ( this.parentGraph.get("nodes").get( this.get("target")[0] ).Inputs.get( this.get("target")[1] ) ) {
        // Set up listener by socket
        if ( this.get("source")[2] && this.get("source")[2] == "cln" )
          this.unsubscribeSocket( "io:"+this.get("target")[0]+":"+this.get("target")[1]+":"+this.get("source")[0]+":"+this.get("source")[1] )
      }
    }

    this.connected = false;
  },
  remove: function(){
  //remove: function(banDelSvr){
    //this.parentGraph.removeEdge(this, banDelSvr);
    this.parentGraph.removeEdge(this);
  }

});

exports.Edges = Backbone.Collection.extend({
  model: exports.Edge
});
