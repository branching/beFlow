$(function(){

  var template = 
    '';

  if (beflow.environment == "dev"){
    template += 
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>'+
      '<button type="button">send</button>';
  };

  beflow.NativeNodes["jsonarray"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "json array",
      description: "insert, update or delete a element into array"
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
    inputoperation: function(op){
      this._op = op;
    },
    inputindex: function(ix){
      this._ix = ix;
    },
    inputarray: function(arr){
      try {
        _arr = JSON.parse(arr);
        if (_arr.constructor.toString().indexOf("Array") == -1)
          _arr = [ _arr ];
      } catch (e) {
        _arr = [ arr ];
      }
      this._arr = _arr;
      this.inputsend();
    },
    inputelement: function(el){
      try {
        _el = JSON.parse(el);
      } catch (e) {
        _el = el;
      }
      this._el = _el;
      this.inputsend();
    },
    inputsend: function(){
      var arr = _.clone(this._arr);
      if (!arr || arr == "")
        arr = [];
      switch(this._op) {
        case "insert":
          if (this._el)
            switch(this._ix) {
              case "first":
                arr.splice(1, 0, this._el);
                break;
              case "last":
                arr.push(this._el);
                break;
              default:
                if (!_.isNaN(this._ix))
                  arr.splice(parseInt(this._ix), 0, this._el);
            }
          break;
        case "update":
          if (this._el)
            switch(this._ix) {
              case "first":
                arr.splice(1, 1, this._el);
                break;
              case "last":
                arr.splice(arr.length - 1, 1, this._el);
                break;
              default:
                if (!_.isNaN(this._ix))
                  arr.splice(parseInt(this._ix), 1, this._el);
            }
          break;
        case "delete":
          switch(this._ix) {
            case "first":
              arr.splice(1, 1);
              break;
            case "last":
              arr.splice(arr.length - 1, 1);
              break;
            default:
              if (!_.isNaN(this._ix))
                arr.splice(parseInt(this._ix), 1);
          }
          break;
      }
      
      var newJson = JSON.stringify(arr, null, 2);
      if (beflow.environment == "dev") {
        this.$("textarea").val(newJson);
        this.$("textarea").trigger( "click" );
      }
      this.send("json", newJson);
    },
    inputs: {
      operation: {
        type: "string",
        description: "operation to apply: insert, update or delete",
        "default": "insert"
      },
      index: {
        type: "string",
        description: "element index to apply operation: first, last or a number"
      },
      array: {
        type: "string",
        description: "base json array. format: [1, 2, 3, ...]"
      },
      element: {
        type: "string",
        description: "element to join to array"
      },
      send: {
        type: "bang",
        description: "send the json"
      }
    },
    outputs: {
      json: {
        type: "string"
      }
    }

  });

});
