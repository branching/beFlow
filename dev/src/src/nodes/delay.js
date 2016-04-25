if (global.side == "svr") {
  
  var NodeModel = require('../node-box').NodeBox;

  exports.Node = NodeModel.extend({
    type: "svr",
    inputmilliseconds: function(ms, s){
      this.Store.save("ms", ms, s)
    },
    inputinput: function(data, s){
      var ms = this.Store.query("ms", s);
      if ( ms && ms > 0 ) {
        var self = this;
        setTimeout(function(){
          self.send("output", data, s)
        }, ms)
      }
    },
    inputs: {
      milliseconds: {
        type: "number",
        description: "delay in milliseconds"
      },
      input: {
        type: "all",
        description: "input data"
      }
    },
    outputs: {
      output: {
        type: "all"
      }
    }

  });

}

if (global.side == "cln") {

  $(function(){

    var template = 
      '<div>SERVER NODE</div>'+
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>';

    beflow.NativeNodes["delay"] = beflow.NodeBoxNativeView.extend({
      template: _.template(template),
      info: {
        title: "delay",
        description: "send data after delay milliseconds"
      },
      type: "svr",
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
      inputmilliseconds: function(ms){
        this._ms = ms
        this.paramview();
      },
      inputinput: function(data){
        this._input = data;
        this.paramview();
        if ( this._ms && this._ms > 0 ) {
          var self = this;
          setTimeout(function(){
            self.send("output", data)
          }, this._ms)
        }
      },
      paramview: function() {
        var val = '';

        if (this._ms) {
          val += 'Miliseconds: ' + this._ms + '\n'
        }
        if (this._input) {
          val += 'Input: ' + this._input + '\n'
        }
        
        this.$("textarea").text(val);
        this.$("textarea").trigger( "click" );
      },
      inputs: {
        milliseconds: {
          type: "number",
          description: "delay in milliseconds"
        },
        input: {
          type: "all",
          description: "input data"
        }
      },
      outputs: {
        output: {
          type: "all"
        }
      }
    });
  });

}
