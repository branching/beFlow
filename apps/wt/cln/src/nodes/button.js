$(function(){

  var template = 
    '<button type="button">send</button>';

  beflow.NativeNodes["button"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "button",
      description: "a button sends a bang, and you can attach a keyboard key"
    },
    events: {
      "click button": "buttonclick"
    },
    type: "cln",
    depen: {
      files: "mousetrap.js"
    },
    libs: [
      {
        test: window.Mousetrap,
        nope: "libs/mousetrap.js"
      }
    ],
    initializeModule: function(){
    },
    buttonclick: function(){
      this.send("bang", "!");
    },
    inputlabel: function (label) {
      this._label = label;
      if (this._label === undefined) {
        label = "";
      }
      if (this._key && this._key !== "") {
        label += " ("+this._key+")";
      }
      this.$("button").text(label);
    },
    inputshortcut: function(key){
      // Unbind the old 
      if (this._key && this._key !== "") {
        Mousetrap.unbind(this._key, 'keydown');
        this._key = "";
      }
      if (key !== "") {
        var self = this;
        Mousetrap.bind(key, function(){
          self.buttonclick();         
        }, 'keydown');
        this._key = key;
      } 

      // Reset label
      this.inputlabel(this._label);
    },
    remove: function(){
      if (this._key && this._key !== "") {
        Mousetrap.unbind(this._key, 'keydown');
      }
      this._key = "";
    },
    inputcss: function(css){
      try {
        this.$("button").css( JSON.parse(css) );
      } catch (e) {}
    },
    inputs: {
      label: {
        type: "string",
        description: "label for button",
        "default": ""
      },
      shortcut: {
        type: "string",
        description: "For modifier keys you can use shift, ctrl, alt, option, meta, and command. Other special keys are backspace, tab, enter, return, capslock, esc, escape, space, pageup, pagedown, end, home, left, up, right, down, ins, and del. Can be a combination like \"shift+r\", or sequence like \"a b c\".",
        "default": ""
      },
      css: {
        type: "string",
        description: "css for button"
      }
    },
    outputs: {
      bang: {
        type: "bang",
        description: "bang when click on button"
      }
    }

  });

});
