if (global.side == "svr") {
  
  var NodeModel = require('../node-box').NodeBox;

  exports.Node = NodeModel.extend({
    type: "svr",
    initializeModule: function(){
      this.once("startapp", this.send("bang", "!"));
    },
    inputs: {},
    outputs: {
      bang: {
        type: "bang"
      }
    }

  });

}

if (global.side == "cln") {

  $(function(){

    var template = 
      '<div>SERVER NODE</div>';

    beflow.NativeNodes["startapp"] = beflow.NodeBoxNativeView.extend({
      template: _.template(template),
      info: {
        title: "start app",
        description: "bang when start application"
      },
      events: {},
      type: "svr",
      inputs: {},
      outputs: {
        bang: {
          type: "bang"
        }
      }

    });

  });

}
