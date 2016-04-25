$(function(){

  var template = 
    '';

  if (beflow.environment == "dev"){
    template += 
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>'+
      '<button type="button">send</button>';
  };

  beflow.NativeNodes["valuebykey"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "value by key",
      description: "get value from json by key"
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
      this.inputifnotexists("");
    },
    inputkey: function(key){
      this._key = key;
      this.inputsend();
    },
    inputifnotexists: function(notexists){
      this._notexists = notexists;
    },
    inputjson: function(json){
      this._json = json;
      this.inputsend();
    },
    inputsend: function(){
      if (this._json != null && this._json != "") {
        try {
          var json = JSON.parse(this._json)
        } catch (e) {
          var json = {}
        }
        if (beflow.environment == "dev") {
          this.$("textarea").val(JSON.stringify(json, null, 2));
          this.$("textarea").trigger( "click" );
        }
        if (this._key != null && this._key != "")
          if (_.contains(_.keys(json), this._key))
            this.send("value", json[this._key]);
          else
            switch(this._notexists) {
              case "none":
                break;
              case "null":
                this.send("value", null);
                break;
              default:
                this.send("value", this._notexists);
            }
      }
    },
    inputs: {
      key: {
        type: "string",
        description: "key of json element"
      },
      ifnotexists: {
        type: "string",
        description: "value to get if key not found into json: none, null or other value"
      },
      json: {
        type: "string",
        description: "json to evaluate"
      },
      send: {
        type: "bang",
        description: "send the json"
      }
    },
    outputs: {
      value: {
        type: "all"
      }
    }

  });

});
