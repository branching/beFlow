var Backbone = require('backbone');
var GraphModel = require('./graph').Graph;
var net = require('net');
var _ = require('underscore');

exports.beflow = Backbone.Model.extend({
  defaults: {
    "io": null
  },
  NativeNodes: {},
  initialize: function() {
    var sourcejson = require('./source').sourcejson;
    sourcejson.io = this.attributes.io;
    this.loadGraph(sourcejson);

    var self = this;
    var server = net.createServer(function(socket) { //'connection' listener
      socket.on('data', function(info) {
        var Jinfo = JSON.parse(info);
        switch(Jinfo.event) {
            case "addNodeSvr":
                self.shownGraph.addNode(Jinfo.data);
                break;
            case "removeNodeSvr":
                self.shownGraph.removeNodeSocket(Jinfo.data);
                break;
            case "addEdgeSvr":
                self.shownGraph.addEdgeSocket(Jinfo.data);
                break;
            case "removeEdgeSvr":
                self.shownGraph.removeEdgeSocket(Jinfo.data);
                break;
            case "saveToState":
                self.shownGraph.saveToState(Jinfo.data);
                break;
            default:
        }
      });
    });
    server.listen(8000, function() { //'listening' listener
    });
    var self = this;
    _.defer(function(){
      self.trigger("startapp");
    });
  },
  graph: null,
  shownGraph: null,
  loadGraph: function (graph) {
    // Load a new parent graph
    if (this.graph) {
      this.graph.remove();
      this.graph = null;
    }
    this.graph = new GraphModel(graph);
    this.shownGraph = this.graph;
    return this.graph;
  }
});
