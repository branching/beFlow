$(function(){

  var template = 
    '';

  if (beflow.environment == "dev"){
    template += 
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>'+
      '<button type="button">send</button>';
  };

  beflow.NativeNodes["jcomposer"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "jcomposer",
      description: "create json objects"
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
    inputvalue: function(value){
      this._val = value;
      this.inputsend();
    },
    inputkey: function(key){
      this._key = key;
      this.inputsend();
    },
    inputjson: function(json){
      this._json = json;
      this.inputsend();
    },
    inputsend: function(){
      var newJson = beflow.join2json(this._key, this._val, this._json);
      if (beflow.environment == "dev") {
        this.$("textarea").val(newJson);
        this.$("textarea").trigger( "click" );
      }
      this.send("json", newJson);
    },
    inputs: {
      key: {
        type: "string",
        description: "key for json element"
      },
      value: {
        type: "string",
        description: "value for json element"
      },
      json: {
        type: "string",
        description: "json for input"
      },
      send: {
        type: "bang",
        description: "send the json"
      }
    },
    outputs: {
      json: {
        type: "string"
      }
    }

  });

});
