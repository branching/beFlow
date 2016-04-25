var global = {};
global.side = "cln";

$(function(){
  
  // requestAnimationFrame shim from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimationFrame = (function(){
    return  window.requestAnimationFrame || 
      window.webkitRequestAnimationFrame || 
      window.mozRequestAnimationFrame    || 
      window.oRequestAnimationFrame      || 
      window.msRequestAnimationFrame     || 
      function( callback ){
        window.setTimeout(callback, 1000 / 60);
      };
  }());    
  
  var global = {};
  global.side = "cln";
  
  var beflowView = Backbone.View.extend({
    tagName: "div",
    className: "app",
    template: _.template(''),
    environment: "rel",
    frameCount: 0, // HACK to not use same name in Firefox
    NativeNodes: {},
    socket: null,
    initialize: function () {
      if (io){
        this.socket = io.connect('http://' + window.location.hostname + ':' + window.location.port);
      }
    },
    allLoaded: function () {
      this.loadGraph(sourcejson);

      // Start animation loop
      window.requestAnimationFrame( this.renderAnimationFrame.bind(this) );
    },
    renderAnimationFrame: function (timestamp) {
      // Safari doesn't pass timestamp
      timestamp = timestamp !== undefined ? timestamp : Date.now();
      // Queue next frame
      window.requestAnimationFrame( this.renderAnimationFrame.bind(this) );
      // Hit graph, which hits nodes
      if (this.graph && this.graph.view) {
        this.graph.view.renderAnimationFrame(timestamp);
      }
    },
    graph: null,
    shownGraph: null,
    loadGraph: function (graph) {
      // Load a new parent graph
      if (this.graph) {
        this.graph.remove();
        this.graph = null;
      }
      
      // Ser page name
      this._page = graph.page;

      this.graph = new beflow.Graph(graph);
      this.shownGraph = this.graph;
      return this.graph;
    },
    join2json: function(key, value, json){
      var newJson = "{}";
      var isNotJson = !(json == null || json == "");
      if (key == null || key == "") {
        if (isNotJson)
          try {
            newJson = JSON.stringify(JSON.parse(json), null, 2)
          } catch (e) {}
      }
      else {
        var merged = {};
        if (isNotJson)
          try {
            merged = JSON.parse(json)
          } catch (e) {}
        
        var obj = _.object([[ key, value ]]);
        _.extend(merged, obj);
        newJson = JSON.stringify(merged, null, 2)
      };
      return newJson;
    }

  });

  // Start app
  window.beflow = new beflowView();

});
