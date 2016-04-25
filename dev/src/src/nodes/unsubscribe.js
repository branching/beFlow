if (global.side == "svr") {
  
  var Backbone = require('backbone');
  var NodeModel = require('../node-box').NodeBox;

  exports.Node = NodeModel.extend({
    type: "svr",
    inputroom: function(room, s){
      this.unsubscribe(room, s);
      this.send("unsubscribed", "!", s);
    },
    inputs: {
      room: {
        type: "string",
        description: "room name"
      }
    },
    outputs: {
      unsubscribed: {
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

    beflow.NativeNodes["unsubscribe"] = beflow.NodeBoxNativeView.extend({
      template: _.template(template),
      info: {
        title: "unsubscribe",
        description: "unsubscribe currently user to room"
      },
      type: "svr",
      inputroom: function(room){
        this.$("label").text('Channel: ' + room);
        this.send("unsubscribed", "!");
      },
      inputs: {
        room: {
          type: "string",
          description: "room name to unsubscribe"
        }
      },
      outputs: {
        unsubscribed: {
          type: "bang"
        }
      }
    });
  });
  
}
