if (global.side == "svr") {
  
  var Backbone = require('backbone');
  var NodeModel = require('../node-box').NodeBox;

  exports.Node = NodeModel.extend({
    type: "svr",
    inputwhichServo: function(whichServo){
      this.Store.save("whichServo", whichServo, s);
      this.send2Servo(s);
    },
    inputposOrSpeed: function(posOrSpeed){
      this.Store.save("posOrSpeed", posOrSpeed, s);
      this.send2Servo(s);
    },
    send2Servo: function(s){
      try {
        var whichServo = this.Store.query("whichServo", s);
        var posOrSpeed = this.Store.query("posOrSpeed", s);

        if ( !whichServo || !posOrSpeed ) {
          return;
        }
        
        if ( whichServo < 1 || whichServo > 16 ) {
          console.error("whichServo must be between 1 and 16");
          return;
        }
        
        if (posOrSpeed < 0) {
          posOrSpeed = 0
        }

        if (posOrSpeed > 1) {
          posOrSpeed = 1
        }
        
        var json = { whichServo: whichServo, posOrSpeed: posOrSpeed };
        var jsonString = JSON.stringify(json);
        this.send("json", jsonString, s);
      } catch (err) {
        console.error(err);
      }
    },
    inputs: {
      whichServo: {
        type: "number",
        description: "servo plugged in this position"
      },
      posOrSpeed: {
        type: "number",
        description: "position or speed is a value between 0 and 1"
      }
    },
    outputs: {
      json: {
        type: "string"
      }
    }
  });
}

if (global.side == "cln") {

  $(function(){

    var template = 
      '<div>SERVER NODE</div>'+
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>';

    beflow.NativeNodes["servo"] = beflow.NodeBoxNativeView.extend({
      template: _.template(template),
      info: {
        title: "servo",
        description: "control data for position or speed of servomotor"
      },
      type: "svr",
      initializeModule: function(){
        this.$("textarea").on("click", function() {
          this.style.overflow = "hidden";resize="none"
          this.style.height = 0;
          this.style.height = this.scrollHeight + "px";
        });
        this.$("textarea").trigger( "click" );
      },
      inputwhichServo: function(whichServo){
        this._whichServo = whichServo;
        this.send2Servo();
      },
      inputposOrSpeed: function(posOrSpeed){
        this._posOrSpeed = posOrSpeed;
        this.send2Servo();
      },
      send2Servo: function(){
        try {
          var whichServo = this._whichServo;
          var posOrSpeed = this._posOrSpeed;

          if ( !whichServo || !posOrSpeed ) {
            return;
          }
          
          if ( whichServo < 1 || whichServo > 16 ) {
            console.error("whichServo must be between 1 and 16");
            return;
          }
          
          if (posOrSpeed < 0) {
            posOrSpeed = 0
          }

          if (posOrSpeed > 1) {
            posOrSpeed = 1
          }
          
          var json = { whichServo: whichServo, posOrSpeed: posOrSpeed };
          var jsonString = JSON.stringify(json, null, 2);
          if (beflow.environment == "dev") {
            this.$("textarea").val(jsonString);
            this.$("textarea").trigger( "click" );
          }
          this.send("json", jsonString);
        } catch (err) {
          console.error(err);
        }
      },
      inputs: {
        whichServo: {
          type: "number",
          description: "servo plugged in this position"
        },
        posOrSpeed: {
          type: "number",
          description: "position or speed is a value between 0 and 1"
        }
      },
      outputs: {
        json: {
          type: "string"
        }
      }
    });
  });
  
}
