$(function(){

  var template = 
    '<label></label>'+
    '<form></form>';

  if (beflow.environment == "dev"){
    template += 
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>'+
      '<button type="button">send</button>';
  };

  beflow.NativeNodes["radiobutton"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "radiobutton array",
      description: "load radiobutton array from json array"
    },
    events: {
      "click button": "inputsend",
      "click input": "inputsend"
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
      this.inputifnotcheck("");
    },
    inputlabel: function(label){
      this.$("label").text(label);
    },
    inputkey: function(key){
      this._key = key;
      this._ch = this.$(":checked");
      this.merge();
    },
    inputinitial: function(initial){
      this._initial = initial;
    },
    inputifnotcheck: function(notchecked){
      this._notchecked = notchecked;
    },
    inputoptions: function(options){
      try {
        this.$('div').each(function() {
          $(this).remove();
        });
        var arr = JSON.parse(options);
        var form = this.$("form");

        if (arr.constructor.toString().indexOf("Array") == -1)
          arr = [ arr ];

        $.each(arr, function(i, json) {
          values = _.values(json);
          
          if (values.length > 0) {
            if (values.length == 1)
              values[1] = values[0];

            form.append(
              $('<div/>'
              ).append(
                $('<input/>', { 
                    type: 'radio', 
                    value: values[0],
                    name: 'g'
                  }
                )
              ).append(
                $('<label/>', { 
                    text: values[1]
                  }
                )
              )
            )
          }

        })
        if (this._css)
          this.inputcss(this._css);
      } catch (e) {};
      
      this.inputcheck(this._initial);
    },
    inputcheck: function(value){
      if (value){
        if (this.$('div input[value="'+value+'"]').size()){
          this.$('div input[value="'+value+'"]').prop('checked', true)
        } else {
          this.$('div label:contains("'+value+'")').prev().prop('checked', true)
        }
      }
      this.inputsend();
    },
    inputjson: function(json){
      this._json = json;
      this._ch = this.$(":checked");
      this.merge();
    },
    inputsend: function(){
      this._ch = this.$(":checked");
      if (this._ch.size()) {
        this.send("value", this._ch.val());
        this.send("text", this._ch.next().text());
      } else {
        switch(this._notchecked) {
          case "none":
            break;
          case "null":
            this.send("value", null);
            this.send("text", null);
            break;
          default:
            this.send("value", this._notchecked);
            this.send("text", this._notchecked);
        }
      }
      this.merge();
    },
    inputcss: function(css){
      try {
        this.$("div").css( JSON.parse(css) );
        this._css = css;
      } catch (e) {
        this._css = null
      }
    },
    merge: function(){
      if (this._ch.size())
        var newJson = beflow.join2json(this._key, this._ch.val(), this._json)
      else {
        switch(this._notchecked) {
          case "none":
            var newJson = beflow.join2json(null, null, this._json);
            break;
          case "null":
            var newJson = beflow.join2json(this._key, null, this._json);
            break;
          default:
            var newJson = beflow.join2json(this._key, this._notchecked, this._json);
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
        description: "key for option checked"
      },
      initial: {
        type: "string",
        description: "option checked when node is charged"
      },
      ifnotcheck: {
        type: "string",
        description: "value to get if none option is checked: none, null or other value"
      },
      options: {
        type: "string",
        description: "a json array that contains options for radiobutton array: value = first pair key/value. text = first/second pair key/value."
      },
      check: {
        type: "string",
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
        description: "css for radiobutton"
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
