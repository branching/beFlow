$(function(){

  beflow.Edge = Backbone.Model.extend({
    defaults: {
      source: [0, "default"], 
      target: [0, "default"]
    },
    initialize: function () {
      this.parentGraph = this.get("parentGraph");
    },
    initializeView: function () {
      this.view = new beflow.EdgeView({model:this});
      return this.view;
    },
    Source: null,
    Target: null,
    connectTryCount: 5,
    connected: false,
    connect: function () {
      // Called from graph.connectEdges()
      try {
        this.Source = this.parentGraph.get("nodes").get( this.get("source")[0] ).Outputs.get( this.get("source")[1] );
        this.Target = this.parentGraph.get("nodes").get( this.get("target")[0] ).Inputs.get( this.get("target")[1] );
      } catch (e) {
        console.warn("Edge source or target port not found, try #"+this.connectTryCount+": "+this.toString());
        if (this.connectTryCount > 0) {
          this.connectTryCount--;
          var self = this;
          _.delay(function(){
            self.connect();
          }, 1000);
        }
        return false;
      }

      if (!this.Source || !this.Target) {
        return false;
      }

      this.Source.connect(this);
      this.Target.connect(this);
      
      if (this.parentGraph.view) {
        this.parentGraph.view.addEdge(this);
      }

      if (this.Target.node.view && this.Target.node.view.Native) {
        this.Target.node.view.Native.connectEdge(this);
      }
      
      this.connected = true;

      // Set up listener
      //if ( this.Source.node.get("type") == "cln" )
      this.Source.node.on( "send:"+this.Source.id, this.send, this );
      
      // Set up listener by socket
      if ( this.Source.node.get("type") == "svr" && this.Target.node.get("type") == "cln" && beflow.socket ) {
        var self = this;
        beflow.socket.on( "io:"+this.Source.node.id+":"+this.Source.id+":"+this.Target.node.id+":"+this.Target.id, function (value) {
          self.Target.node.receive( self.Target.id, value );
        });
      }

      return this;
    },
    send: function (value) {
      //if ( this.Target.node.get("type") == "cln" )
      this.Target.node.receive( this.Target.id, value );
      
      if ( this.Target.node.get("type") == "svr" && beflow.socket ) {
        beflow.socket.emit( "io:"+this.Target.node.id+":"+this.Target.id+":"+this.Source.node.id+":"+this.Source.id, value );
      }
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
      if (this.view) {
        this.view.remove();
      }

      // Remove listener
      //if ( this.Source.node.get("type") == "cln" )
        this.Source.node.off( "send:"+this.Source.id, this.send, this );

      // Unsuscribe listener by socket
      if ( this.Source.node.get("type") == "svr" && this.Target.node.get("type") == "cln" && beflow.socket ) {
        beflow.socket.removeListener( "io:"+this.Source.node.id+":"+this.Source.id+":"+this.Target.node.id+":"+this.Target.id, function (value) {
        });
      }

      this.connected = false;
    },
    remove: function(){
      this.parentGraph.removeEdge(this);
    },
    toJSON: function () {
      return {
        source: this.get("source"),
        target: this.get("target")
      };
    },
    toString: function(){
      return this.get("source")[0]+":"+this.get("source")[1]+"->"+this.get("target")[0]+":"+this.get("target")[1];
    }
  });
  
  beflow.Edges = Backbone.Collection.extend({
    model: beflow.Edge
  });

});
