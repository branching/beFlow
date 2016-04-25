$(function(){

  var template = 
    '<input type="checkbox"></input>'+
    '<label></label>';

  if (beflow.environment == "dev"){
    template += 
      '<textarea style="resize:none;border:none;width:100%";background-color:transparent" disabled></textarea>'+
      '<button type="button">send</button>';
  };

  beflow.NativeNodes["checkbox"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "checkbox",
      description: "a Html checkbox"
    },
    events: {
      "click button": "inputsend",
      "change input": "inputsend"
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
    inputtext: function(text){
      this.$("label").text(text);
    },
    inputkey: function(key){
      this._key = key;
      this.merge();
    },
    inputcheck: function(value){
      if (value)
        this.$('input').prop('checked', true)
      else
        this.$('input').prop('checked', false)
      this.inputsend();
    },
    inputjson: function(json){
      this._json = json;
      this.merge();
    },
    inputsend: function(){
      this.send("checked", this.$('input').is(':checked'));
      this.merge();
    },
    inputcss: function(css){
      try {
        this.$("input").css( JSON.parse(css) );
      } catch (e) {}
    },
    merge: function(){
      var newJson = beflow.join2json(this._key, this.$('input').is(':checked'), this._json)
      if (beflow.environment == "dev") {
        this.$("textarea").val(newJson);
        this.$("textarea").trigger( "click" );
      }
      this.send("json", newJson);
    },
    inputs: {
      text: {
        type: "string",
        description: "label for input"
      },
      key: {
        type: "string",
        description: "key for option checked"
      },
      check: {
        type: "boolean",
        description: "check option by value"
      },
      json: {
        type: "string",
        description: "json for input"
      },
      send: {
        type: "bang",
        description: "send data"
      },
      css: {
        type: "string",
        description: "css for checkbox"
      }
    },
    outputs: {
      checked: {
        type: "boolean"
      },
      json: {
        type: "string"
      }
    }

  });

});
