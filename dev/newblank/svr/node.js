var Backbone = require('backbone');

exports.Node = Backbone.Model.extend({
  send: function (message) {
    // Send message out to connected nodes
  },
  receive: function (message) {
    // Get message from another node
  },
});

exports.Nodes = Backbone.Collection.extend({
  model: exports.Node
});
