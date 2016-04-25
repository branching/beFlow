if (global.side == "svr") {
  
  var Backbone = require('backbone');
  var NodeModel = require('../node-box').NodeBox;

  exports.Node = NodeModel.extend({
    type: "svr",
    inputinput: function(data, s){
      this.send("output", data, s);
    },
    inputs: {
      input: {
        type: "all",
        description: "input data"
      }
    },
    outputs: {
      output: {
        type: "all",
        tx: "broadcast"
      }
    }

  });

}

if (global.side == "cln") {

  $(function(){

    var template = 
      '<div>SERVER NODE</div>';

    beflow.NativeNodes["broadcast"] = beflow.NodeBoxNativeView.extend({
      template: _.template(template),
      info: {
        title: "broadcast",
        description: "broadcast data transmission"
      },
      type: "svr",
      inputinput: function(data){
        this.send("output", data);
      },
      inputs: {
        input: {
          type: "all",
          description: "input data"
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
