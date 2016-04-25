$(function(){

  var template = 
    '<label></label>'+
    '<input type="text"></input>';

  if (beflow.environment == "dev"){
    template += 
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>'+
      '<button type="button">send</button>';
  };

  beflow.NativeNodes["text"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "text",
      description: "a text box to send json object"
    },
    events: {
      "click button": "inputsend",
      "keyup input": "inputsend"
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
      this.$("input").val(value);
      this.inputsend();
    },
    inputifempty: function(ifempty){
      this._ifempty = ifempty;
      this.merge();
    },
    inputjson: function(json){
      this._json = json;
      this.merge();
    },
    inputsend: function(){
      this.send("text", this.$("input").val());
      this.merge();
    },
    inputcss: function(css){
      try {
        this.$("input").css( JSON.parse(css) );
      } catch (e) {}
    },
    merge: function(){
      if (this.$("input").val() != "")
        var newJson = beflow.join2json(this._key, this.$("input").val(), this._json)
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
        this.$("textarea").val(newJson);
        this.$("textarea").trigger( "click" );
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
        description: "value to get if textbox is empty: none, null or any text default"
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
        description: "css for textbox"
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
