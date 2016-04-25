if (global.side == "svr") {
  
  var Backbone = require('backbone');
  var NodeModel = require('../node-box').NodeBox;

  exports.Node = NodeModel.extend({
    type: "svr",
    inputroom: function(room, s){
      this.subscribe(room, s);
      this.send("subscribed", "!", s);
    },
    inputs: {
      room: {
        type: "string",
        description: "room name"
      }
    },
    outputs: {
      subscribed: {
        type: "bang"
      }
    }

  });

}

if (global.side == "cln") {

  $(function(){

    var template = 
      '<div>SERVER NODE</div>'+
      '<label></label>';

    beflow.NativeNodes["subscribe"] = beflow.NodeBoxNativeView.extend({
      template: _.template(template),
      info: {
        title: "subscribe",
        description: "subscribe currently user to a room"
      },
      type: "svr",
      inputroom: function(room){
        this.$("label").text('Channel: ' + room);
        this.send("subscribed", "!");
      },
      inputs: {
        room: {
          type: "string",
          description: "room name to subscribe"
        }
      },
      outputs: {
        subscribed: {
          type: "bang"
        }
      }
    });
  });

}
