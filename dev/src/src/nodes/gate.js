$(function(){

  var template = 
    '';

  if (beflow.environment == "dev"){
    template += 
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>'+
      '<button type="button">send</button>';
  };

  beflow.NativeNodes["gate"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "gate",
      description: "send data with each bang"
    },
    events: {
      "click button": "inputsend"
    },
    type: "cln",
    initializeModule: function(){
      if (beflow.environment == "dev") {
        this.$("textarea").on("click", function() {
          this.style.overflow = "hidden";resize="none"
          this.style.height = 0;
          this.style.height = this.scrollHeight + "px";
        });
        this.$("textarea").trigger( "click" );
      }
    },
    inputinput: function(value){
      this._value = value;
      if (beflow.environment == "dev") {
        if (_.isString(value) || _.isNumber(value))
          this.$("textarea").val(value);
        else
          this.$("textarea").val("[object]");
        this.$("textarea").trigger( "click" );
      }
    },
    inputsend: function(){
      if (this._value === undefined)
        this.send("output", null);
      else
        this.send("output", this._value);
    },
    inputs: {
      input: {
        type: "all",
        description: "input data"
      },
      send: {
        type: "bang",
        description: "send data"
      }
    },
    outputs: {
      output: {
        type: "all"
      }
    }

  });

});
