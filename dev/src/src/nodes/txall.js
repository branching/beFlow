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
        tx: "all"
      }
    }

  });

}

if (global.side == "cln") {

  $(function(){

    var template = 
      '<div>SERVER NODE</div>';

    beflow.NativeNodes["txall"] = beflow.NodeBoxNativeView.extend({
      template: _.template(template),
      info: {
        title: "tx all",
        description: "data transmission to all target"
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
