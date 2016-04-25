var Backbone = require('backbone');
var _ = require('underscore');
var NodesModel = require('./node').Nodes;
var EdgeModel = require('./edge').Edge;
var EdgesModel = require('./edge').Edges;

exports.Graph = Backbone.Model.extend({
  defaults: {
    nodes: [],
    edges: []
  },
  usedIds: [],
  edgeCount: 0,
  isSubgraph: false,
  io: null,
  usedPorts: [],
  activatedPorts: [],
  initialize: function () {
    this.io = this.attributes.io;
    // Is this a subgraph?
    var parentGraph = this.get("parentGraph");
    if (parentGraph) {
      this.isSubgraph = true;
      this.parentGraph = parentGraph;
    }
    
    this.usedIds = [];
    // Convert arrays into Backbone Collections
    if (this.attributes.nodes) {
      var nodes = this.attributes.nodes;
      this.attributes.nodes = new NodesModel();
      for (var i=0; i<nodes.length; i++) {
        var node = this.makeNode(nodes[i]);
        if (node)
          this.addNode(node);
      }
    }
    if (this.attributes.edges) {
      var edges = this.attributes.edges;
      this.attributes.edges = new EdgesModel();
      for (var j=0; j<edges.length; j++) {
        edges[j].parentGraph = this;
        var edge = new EdgeModel(edges[j]);
        this.addEdge(edge);
      }
    }
    this.connectEdges();
  },
  makeNode: function (info) {
    if (!info.src){
      return false;
    }
    info.parentGraph = this;

    var NodeModel = require('./nodes/'+info.src).Node;
    var node = new NodeModel(info);

    return node;
  },
  addNode: function (node) {
    if (!node.cid) {
      // input is not a beflow.Node model
      node = this.makeNode(node);
      if (!node) {
        return false;
      }
    }

    var count = this.get("nodes").length;
    // Give id if not defined or NaN
    var nodeId = parseInt(node.get('id'), 10);
    if (nodeId !== nodeId) {
      node.set({"id": count});
    }
    // Make sure node id is unique
    while ( this.usedIds.indexOf(node.get('id')) >= 0 ) {
      count++;
      node.set({"id": count});
    }
    this.usedIds.push( node.get('id') );

    this.get("nodes").add(node);

    node.initializePorts();

    return node;
  },
  addEdgeSocket: function (edge) {
    var newEdge = new EdgeModel({
      source: edge.source,
      target: edge.target,
      parentGraph: this
    });
    if (this.addEdge(newEdge)){
      newEdge.connect();
    }
  },
  addEdge: function (edge) {
    // Make sure edge is unique
    var isDupe = this.get("edges").any(function(_edge) {
      return ( _edge.get('source')[0] === edge.get('source')[0] && _edge.get('source')[1] === edge.get('source')[1] && _edge.get('target')[0] === edge.get('target')[0] && _edge.get('target')[1] === edge.get('target')[1] );
    });
    if (isDupe) {
      console.log("duplicate edge ignored", edge);
      return false;
    } else {
      return this.get("edges").add(edge);
    }
  },
  remove: function() {
    // Called from beflowView.loadGraph
    this.get("nodes").each(function(node){
      node.remove();
    });
  },
  removeNodeSocket: function (id) {
    var self = this;
    this.get("nodes").each(function(_node) {
      if ( _node.id === id ) {
        //self.removeNode(_node);
        self.get("nodes").remove(_node);
        return true;
      }
    });
  },
  saveToState: function (data) {
    // QUEDA PENDIENTE PROBAR
    var self = this;
    this.get("nodes").each(function(_node) {
      if ( _node.id === data.id ) {
        _node.receive(data.input, data.value, null);
        return true;
      }
    });
  },
  removeNode: function (node) {
    var connected = [];

    // Disconnect edges
    this.get("edges").each(function (edge) {
      if (edge.Source && edge.Target) {
        if (edge.Source.parentNode === node || edge.Target.parentNode === node) {
          connected.push(edge);
        }
      }
    }, this);

    _.each(connected, function(edge){
      edge.remove();
    });

    this.get("nodes").remove(node);
  },
  removeEdgeSocket: function (edge) {
    var self = this;
    this.get("edges").each(function(_edge) {
      if ( _edge.get('source')[0] === edge.source[0] && _edge.get('source')[1] === edge.source[1] && _edge.get('target')[0] === edge.target[0] && _edge.get('target')[1] === edge.target[1] ) {
        self.removeEdge(_edge);
        return true;
      }
    });
  },
  removeEdge: function (edge) {
    edge.disconnect();
    this.get("edges").remove(edge);
  },
  connectEdges: function () {
    // Connect edges
    this.get("edges").each(function(edge){
      if (!edge.connected) {
        edge.connect();
      }
    });

    // Set state of nodes
    this.get("nodes").each(function(node){
      node.setState();
    });
  }

});

exports.Graphs = Backbone.Collection.extend({
  model: exports.Graph
});
