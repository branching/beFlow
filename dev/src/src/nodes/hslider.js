$(function(){

  var template = 
    '<label></label>'+
    '<div id="main" style="width:170px;margin: 5px 0px 5px 11px">'+
      '<div class="slider"></div>'+
    '</div>';

  if (beflow.environment == "dev"){
    template += 
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>'+
      '<button type="button">send</button>';
  };

  beflow.NativeNodes["hslider"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "hslider",
      description: "horizontal slider"
    },
    events: {
      "click button": "inputsend",
      "slide .slider": "slide"
    },
    type: "cln",
    depen: {
      files: "jquery-ui"
    },
    libs: [
      {
        test: $.ui,
        nope: ["libs/jquery-ui/jquery-ui.js", "libs/jquery-ui/jquery-ui.css"]
      }
    ],
    initializeModule: function(){
      if (beflow.environment == "dev") {
        this.$("textarea").on("click", function() {
          this.style.overflow = "hidden";resize="none"
          this.style.height = 0;
          this.style.height = this.scrollHeight + "px";
        });
        this.$("textarea").trigger( "click" );
      }
      this.config();
    },
    config: function (){
      if (!this._value) { this._value = 0; }
      if (!this._min) { this._min = 0; }
      if (!this._max) { this._max = 1; }
      if (!this._step) { this._step = 0; }
      this.$(".slider")
        .slider({
          value: this._value,
          min: this._min,
          max: this._max,
          step: this._step === 0 ? 0.001 : this._step
        });
      this.$el.css({
        overflow: "hidden"
      });
    },
    slide: function (event, ui){
      this.setValue(ui.value);
      this.inputsend();
    },
    inputlabel: function(label){
      this.$("label").text(label);
    },
    inputkey: function(key){
      this._key = key;
      this.merge();
    },
    inputvalue: function(val){
      this.setValue(val);
      this.$(".slider").slider({
        value: val
      });
      this.inputsend();
    },
    setValue: function(val){
      this._value = val;
    },
    inputmin: function(min){
      this._min = min;
      this.config();
    },
    inputmax: function(max){
      this._max = max;
      this.config();
    },
    inputstep: function(step){
      this._step = step;
      this.config();
    },
    inputjson: function(json){
      this._json = json;
      this.merge();
    },
    inputsend: function(){
      this.send("value", this._value);
      this.merge();
    },
    inputcss: function(css){
      try {
        this.$("#main").css( JSON.parse(css) );
      } catch (e) {}
    },
    merge: function(){
      var newJson = beflow.join2json(this._key, this._value, this._json)
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
        type: "float",
        description: "manual input value; sets default",
        "default": 0
      },
      min: {
        type: "float",
        description: "slider jumps values",
        "default": 0
      },
      max: {
        type: "float",
        "default": 1
      },
      step: {
        type: "float",
        description: "slider jumps by this amount",
        "default": 0
      },
      json: {
        type: "string",
        description: "json for input"
      },
      send: {
        type: "bang",
        description: "send current value"
      },
      css: {
        type: "string",
        description: "css for control"
      }
    },
    outputs: {
      value: {
        type: "float"
      },
      json: {
        type: "string"
      }
    }

  });
});
