$(function(){

  var template = 
    '';

  beflow.NativeNodes["initialbang"] = beflow.NodeBoxNativeView.extend({
    template: _.template(template),
    info: {
      title: "initialbang",
      description: "bang when all loaded"
    },
    events: {},
    type: "cln",
    initializeModule: function(){
      this.once("initialBang", this.send("bang", "!"));
    },
    inputs: {},
    outputs: {
      bang: {
        type: "bang"
      }
    }

  });

});
