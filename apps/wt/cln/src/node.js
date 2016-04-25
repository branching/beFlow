$(function(){

  beflow.Node = Backbone.Model.extend({
    send: function (message) {
      // Send message out to connected nodes
    },
    receive: function (message) {
      // Get message from another node
    },
  });
  
  beflow.Nodes = Backbone.Collection.extend({
    model: beflow.Node
  });

});
