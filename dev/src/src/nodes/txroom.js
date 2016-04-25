if (global.side == "svr") {
  
  var Backbone = require('backbone');
  var NodeModel = require('../node-box').NodeBox;

  exports.Node = NodeModel.extend({
    type: "svr",
    inputroom: function(room, s){
      this._room = room;
      this.Store.save("room", room, s)
    },
    inputinput: function(data, s){
      var room = this.Store.query("room", s);
      if (room) {
        this.send("output", data, s, room);
      }
    },
    inputs: {
      room: {
        type: "string",
        description: "room name"
      },
      input: {
        type: "all",
        description: "input data"
      }
    },
    outputs: {
      output: {
        type: "all",
        tx: "room"
      }
    }

  });
  
}

if (global.side == "cln") {
  
  $(function(){

    var template = 
      '<div>SERVER NODE</div>'+
      '<label></label>';

    beflow.NativeNodes["txroom"] = beflow.NodeBoxNativeView.extend({
      template: _.template(template),
      info: {
        title: "tx room",
        description: "data transmission to room what user previously is subscribed"
      },
      type: "svr",
      inputroom: function(room){
        if (room) {
          this._room = room;
          this.$("label").text(room);
        }
      },
      inputinput: function(data){
        if (this._room && this._room !== "")
          this.send("output", data);
      },
      inputs: {
        room: {
          type: "string",
          description: "room name to send data"
        },
        input: {
          type: "all",
          description: "input data to send"
        }
      },
      outputs: {
        output: {
          type: "all"
        }
      }
    });
  });
  
}
