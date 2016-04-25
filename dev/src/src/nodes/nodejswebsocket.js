if (global.side == "svr") {
  
  var Backbone = require('backbone');
  var NodeModel = require('../node-box').NodeBox;
  var ws = require('nodejs-websocket');

  exports.Node = NodeModel.extend({
    type: "svr",
    inputIP: function(IP, s){
      this.IP = IP;
    },
    inputport: function(port, s){
      this.port = port;
    },
    inputconnect: function(s){
      var IP = this.IP;
      var port = this.port;

      if ( !IP || !port ) {
        console.log('IP and/or port invalid!');
        return;
      }
      
      if ( this.connection && this.connection.readyState != this.connection.CLOSED ) {
        console.log('Exists still a connection opened!');
        return;
      }
      
      // When we get a connection
      var self = this;
      var connection = ws.connect('ws://' + IP + ':' + port, function(err) {
        console.log('Connected to target!');
        this.connection = connection;
        self.send("connected", "!", s);
        connection.sendText(text);
        
        connection.on("close", function (code, reason) {
          console.log("Connection closed.");
          self.send("disconnected", "!", s);
          this.connection = null;
        });
        
        connection.on("error", function (err) {
          console.log("Error: " + err);
          self.send("error", "Error: " + err, s);
        });
      });
    },
    inputdisconnect: function(s){
      if ( this.connection ) {
        if ( this.connection.readyState == this.connection.OPEN ) {
          this.connection.close();
          return;
        }
        
        if ( this.connection.readyState == this.connection.CLOSED ) {
          console.log('Can´t close connection: Connection closed!');
          return;
        }
        
        if ( this.connection.readyState == this.connection.CONNECTING  ) {
          console.log('Can´t close connection: Connecting...');
          return;
        }
        
        if ( this.connection.readyState == this.connection.CLOSING  ) {
          console.log('Can´t close connection: Closing...');
          return;
        }
      }
    },
    inputsendText: function(text, s){
      var connection = this.connection;

      if ( !connection ) {
        console.log('Do not exists a connection!');
        return;
      }

      if ( connection.readyState == connection.OPEN ) {
        // Send data
        connection.sendText(text);
        return;
      }
      
      if ( connection.readyState == connection.CLOSED ) {
        console.log('Can´t send text: Connection closed!');
        return;
      }
      
      if ( connection.readyState == connection.CONNECTING  ) {
        console.log('Can´t send text: Connecting...');
        return;
      }
      
      if ( connection.readyState == connection.CLOSING  ) {
        console.log('Can´t send text: Closing...');
        return;
      }
    },
    inputs: {
      IP: {
        type: "string",
        description: "IP direction for connection"
      },
      port: {
        type: "number",
        description: "port for connection"
      },
      connect: {
        type: "bang",
        description: "connect web socket"
      },
      disconnect: {
        type: "bang",
        description: "disconnect web socket"
      },
      sendText: {
        type: "string",
        description: "text to send to target"
      }
    },
    outputs: {
      connected: {
        type: "bang"
      },
      disconnected: {
        type: "bang"
      },
      error: {
        type: "string"
      }
    }

  });
  
}

if (global.side == "cln") {

  $(function(){

    var template = 
      '<div>SERVER NODE</div>'+
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>';

    beflow.NativeNodes["nodejswebsocket"] = beflow.NodeBoxNativeView.extend({
      template: _.template(template),
      info: {
        title: "nodejs web socket",
        description: "a node to send text to other web socket"
      },
      type: "svr",
      depen: {
        npm: "nodejs-websocket"
      },
      initializeModule: function(){
        this.$("textarea").on("click", function() {
          this.style.overflow = "hidden";resize="none"
          this.style.height = 0;
          this.style.height = this.scrollHeight + "px";
        });
        this.$("textarea").trigger( "click" );
      },
      inputIP: function(IP){
        this._IP = IP;
        this.paramview();
      },
      inputport: function(port){
        this._port = port;
        this.paramview();
      },
      inputconnect: function(){
        this._state = 'CONNECTED';
        this.paramview();
        this.send("connected", "!");
      },
      inputdisconnect: function(){
        this._state = 'DISCONNECTED';
        this.paramview();
        this.send("disconnected", "!");
      },
      inputsendText: function(text){
        this._text = text;
        this.paramview();
      },
      paramview: function() {
        var val = '';

        if (this._IP) {
          val += 'IP: ' + this._IP + '\n'
        }
        if (this._port) {
          val += 'Port: ' + this._port + '\n'
        }
        if (this._state) {
          val += 'State: ' + this._state + '\n'
        }
        if (this._text) {
          val += 'Last text sended: ' + this._text + '\n'
        }
        
        this.$("textarea").text(val);
        this.$("textarea").trigger( "click" );
      },
      inputs: {
        IP: {
          type: "string",
          description: "IP direction for connection"
        },
        port: {
          type: "number",
          description: "port for connection"
        },
        connect: {
          type: "bang",
          description: "connect web socket"
        },
        disconnect: {
          type: "bang",
          description: "disconnect web socket"
        },
        sendText: {
          type: "string",
          description: "text to send to target"
        }
      },
      outputs: {
        connected: {
          type: "bang"
        },
        disconnected: {
          type: "bang"
        },
        error: {
          type: "string"
        }
      }
    });
  });
  
}
