$(function(){

  var template = 
    '';

  if (beflow.environment == "dev"){
    template += 
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>'+
      '<button type="button">call</button>';
  };

  beflow.NativeNodes["webtask"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "webtask",
      description: "execute a Webtask"
    },
    events: {
      "click button": "inputcall"
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
    inputurl: function(url){
      this._url = url;
      this.paramview();
    },
    inputdata: function(data){
      this._data = data;
      this.paramview();
    },
    inputcall: function(){
      if ( !this._url ) {
        return;
      }
      
      var self = this;
      
      var obj = {
                  type: "PUT",
                  url: self._url,
                  contentType: 'application/json'
                }

      if (self._data) {
        obj.data = self._data
      }
      
      $.ajax(obj)
      .done(function( data ) {
        self.send("ok", data)
      })
      .fail(function( jqXHR, textStatus, errorThrown ) {
        self.send("error", JSON.parse(jqXHR.responseText).message)
      });
    },
    paramview: function() {
      var val = '';

      if (this._url) {
        val += 'url: ' + this._url + '\n'
      }
      if (this._data) {
        val += 'data: ' + this._data + '\n'
      }
      
      this.$("textarea").text(val);
      this.$("textarea").trigger( "click" );
    },
    inputs: {
      url: {
        type: "string",
        description: "The Webtask url"
      },
      data: {
        type: "string",
        description: "The url query parameters of the request"
      },
      call: {
        type: "bang",
        description: "call Webtask"
      }
    },
    outputs: {
      ok: {
        type: "string"
      },
      error: {
        type: "string"
      }
    }

  });

});
