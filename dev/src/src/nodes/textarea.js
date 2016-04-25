$(function(){

  var template = 
    '<label></label>'+
    '<textarea id="txtinput"></textarea>';

  if (beflow.environment == "dev"){
    template += 
      '<textarea id=txtjson style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>'+
      '<button type="button">send</button>';
  };

  beflow.NativeNodes["textarea"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "textarea",
      description: "a multiline text box to save and send text"
    },
    events: {
      "click button": "inputsend",
      "keyup #txtinput": "inputsend"
    },
    type: "cln",
    initializeModule: function(){
      if (beflow.environment == "dev") {
        this.$("#txtjson").on("click", function() {
          this.style.overflow = "hidden";resize="none"
          this.style.height = 0;
          this.style.height = this.scrollHeight + "px";
        });
        this.$("#txtjson").trigger( "click" );
      }
      this.inputifempty("");
    },
    inputlabel: function(label){
      this.$("label").text(label);
    },
    inputkey: function(key){
      this._key = key;
      this.merge();
    },
    inputvalue: function(value){
      this.$("#txtinput").val(value);
      this.inputsend();
    },
    inputifempty: function(ifempty){
      this._ifempty = ifempty;
    },
    inputjson: function(json){
      this._json = json;
      this.merge();
    },
    inputsend: function(){
      this.send("text", this.$("#txtinput").val());
      this.merge();
    },
    inputcss: function(css){
      try {
        this.$("#txtinput").css( JSON.parse(css) );
      } catch (e) {}
    },
    merge: function(){
      if (this.$("#txtinput").val() != "")
        var newJson = beflow.join2json(this._key, this.$("#txtinput").val(), this._json);
      else {
        switch(this._ifempty) {
          case "none":
            var newJson = beflow.join2json(null, null, this._json);
            break;
          case "null":
            var newJson = beflow.join2json(this._key, null, this._json);
            break;
          default:
            var newJson = beflow.join2json(this._key, this._ifempty, this._json);
        }
      }
      if (beflow.environment == "dev") {
        this.$("#txtjson").val(newJson);
        this.$("#txtjson").trigger( "click" );
      }
      this.send("json", newJson);
    },
    inputs: {
      label: {
        type: "string",
        description: "label for input"
      },
      key: {
        type: "string",
        description: "key for document"
      },
      value: {
        type: "string",
        description: "manual input of text"
      },
      ifempty: {
        type: "string",
        description: "value to get if textarea is empty: none, null or other value"
      },
      json: {
        type: "string",
        description: "json for input"
      },
      send: {
        type: "bang",
        description: "send the text"
      },
      css: {
        type: "string",
        description: "css for textarea"
      }
    },
    outputs: {
      text: {
        type: "string"
      },
      json: {
        type: "string"
      }
    }

  });

});
