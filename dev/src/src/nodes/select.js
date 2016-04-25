$(function(){

  var template = 
    '<label></label>'+
    '<select></select>';

  if (beflow.environment == "dev"){
    template += 
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>'+
      '<button type="button">send</button>';
  };

  beflow.NativeNodes["select"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "select",
      description: "load select from json array"
    },
    events: {
      "click button": "inputsend",
      "change select": "inputsend"
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
      this.inputifinvalid("");
    },
    inputlabel: function(label){
      this.$("label").text(label);
    },
    inputkey: function(key){
      this._key = key;
      this._valid = (!this._invalid || (this._invalid && this._invalid != "" && this._invalid != this.$("option:selected").val()));
      this.merge();
    },
    inputinitial: function(initial){
      this._initial = initial;
    },
    inputinvalid: function(invalid){
      this._invalid = invalid;
    },
    inputifinvalid: function(ifinvalid){
      this._ifinvalid = ifinvalid;
    },
    inputoptions: function(options){
      try {
        this.$('option').each(function() {
          $(this).remove();
        });
        var arr = JSON.parse(options);
        var select = this.$('select');

        if (arr.constructor.toString().indexOf("Array") == -1)
          arr = [ arr ];

        $.each(arr, function(i, json) {
          values = _.values(json);

          if (values.length > 0) {
            if (values.length == 1)
              values[1] = values[0];
            select.append($('<option/>').text(values[1]).attr('value', values[0]))
          }
        })
      } catch (e) {};
      
      this.inputselect(this._initial);
    },
    inputselect: function(value){
      if (value)
        if (this.$('option[value="'+value+'"]').size())
          this.$('option[value="'+value+'"]').prop('selected', true)
        else
          this.$('option:contains("'+value+'")').prop('selected', true)
      this.inputsend();
    },
    inputjson: function(json){
      this._json = json;
      this._valid = (!this._invalid || (this._invalid && this._invalid != "" && this._invalid != this.$("option:selected").val()));
      this.merge();
    },
    inputsend: function(){
      var s = this.$("option:selected");
      this._valid = (!this._invalid || (this._invalid && this._invalid != "" && this._invalid != s.val()));
      if (this._valid) {
        this.send("value", s.val());
        this.send("text", s.text());
      } else {
        switch(this._ifinvalid) {
          case "none":
            break;
          case "null":
            this.send("value", null);
            this.send("text", null);
            break;
          default:
            this.send("value", this._ifinvalid);
            this.send("text", this._ifinvalid);
        }
      }
      this.merge();
    },
    inputcss: function(css){
      try {
        this.$("select").css( JSON.parse(css) );
      } catch (e) {}
    },
    merge: function(){
      if (this._valid)
        var newJson = beflow.join2json(this._key, this.$("select option:selected").val(), this._json)
      else {
        switch(this._ifinvalid) {
          case "none":
            var newJson = beflow.join2json(null, null, this._json);
            break;
          case "null":
            var newJson = beflow.join2json(this._key, null, this._json);
            break;
          default:
            var newJson = beflow.join2json(this._key, this._ifinvalid, this._json);
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
        description: "json key for option selected"
      },
      initial: {
        type: "string",
        description: "option selected when node is charged"
      },
      invalid: {
        type: "string",
        description: "option assumed as invalid"
      },
      ifinvalid: {
        type: "string",
        description: "value to get if selected option is invalid one: none, null or other word"
      },
      options: {
        type: "string",
        description: "a json array that contains options for select: value = first pair key/value. text = first/second pair key/value."
      },
      select: {
        type: "string",
        description: "change option by value"
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
        description: "css for select"
      }
    },
    outputs: {
      value: {
        type: "string"
      },
      text: {
        type: "string"
      },
      json: {
        type: "string"
      }
    }

  });

});
