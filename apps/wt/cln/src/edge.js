$(function(){

  beflow.Edge = Backbone.Model.extend({
    defaults: {
      source: [0, "default", "cln", ""], 
      target: [0, "default", "cln", ""]
    },
    initialize: function () {
      this.parentGraph = this.get("parentGraph");
    },
    Source: null,
    Target: null,
    connected: false,
    channel: null,
    connect: function () {
      // Called from graph.connectEdges()
      var fromOtherPage = false;
      var toOtherPage = false;

      if ( !this.get("source")[2] || this.get("source")[2] == "cln" ){
        if ( this.get("source")[3] == beflow._page ) {
          this.Source = this.parentGraph.get("nodes").get( this.get("source")[0] ).Outputs.get( this.get("source")[1] );
          if (!this.Source){
            return false;
          }
        } else{
          fromOtherPage = true;
        }
      }

      if ( !this.get("target")[2] || this.get("target")[2] == "cln" ){
        if ( this.get("target")[3] == beflow._page ) {
          this.Target = this.parentGraph.get("nodes").get( this.get("target")[0] ).Inputs.get( this.get("target")[1] );
          if (!this.Target){
            return false;
          }
        } else{
          toOtherPage = true;
        }
      }

      if (this.Source) {
        this.Source.connect(this);
        // Set up listener
        this.Source.node.on( "send:"+this.get("source")[1], this.send, this );
      }

      if (fromOtherPage) {
        beflow.once( "send:"+this.get("target")[0]+":"+this.get("target")[1], this.send, this );
      }

      if (this.Target) {
        this.Target.connect(this);
        if (this.Target.node.view && this.Target.node.view.Native) {
          this.Target.node.view.Native.connectEdge(this);
        }

        // Set up listener by socket
        if ( this.get("source")[2] && this.get("source")[2] == "svr" ) {
          if (beflow.socket) {
            var self = this;
            beflow.socket.on( "io:"+this.get("source")[0]+":"+this.get("source")[1]+":"+this.get("target")[0]+":"+this.get("target")[1], function (value) {
              self.Target.node.receive( self.get("target")[1], value );
            });
          }
        }
      }

      if (toOtherPage) {
        this.channel = "send:"+this.get("target")[0]+":"+this.get("target")[1];
      }

      this.connected = true;

      return this;
    },
    send: function (value) {
      if (this.Source) {
        if (this.Target) {
          this.receive(value)
        } else {
          if (this.channel) {
            localStorage.setItem("beflow_channel", this.channel);
            localStorage.setItem("beflow_value", value);

            // Call other page
            window.document.location.href = this.get("target")[3] + '.html'
          }
        }
        
        if ( this.get("target")[2] && this.get("target")[2] == "svr" ){
          if (beflow.socket){
            beflow.socket.emit( "io:"+this.get("target")[0]+":"+this.get("target")[1]+":"+this.get("source")[0]+":"+this.get("source")[1], value );


/*
            $.ajax({
              type: "POST",
              url: "hola",
              contentType: 'application/json',
              data: JSON.stringify({ msg: "mensaje de subida" })
            })
            .done(function( msg ) {
              console.log( "llego el mensaje: " + msg );
            });
*/


          }
        }
      } else {
        this.receive(value)
      }
    },
    receive: function (value) {
      this.Target.node.receive( this.Target.id, value );
    },
    disconnect: function () {
      // Called from graph.removeEdge()
      if (this.Source && this.Target) {
        this.Source.disconnect(this);
        this.Target.disconnect(this);
        if (this.Target.node.view && this.Target.node.view.Native) {
          this.Target.node.view.Native.disconnectEdge(this);
        }
      }

      // Remove listener
      this.Source.node.off( "send:"+this.Source.id, this.send, this );

      this.connected = false;
    },
    remove: function(){
      this.parentGraph.removeEdge(this);
    }

  });
  
  beflow.Edges = Backbone.Collection.extend({
    model: beflow.Edge
  });

});
