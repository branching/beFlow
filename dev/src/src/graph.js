$(function(){

  beflow.Graph = Backbone.Model.extend({
    loaded: false,
    defaults: {
      info: {
        author: "",
        title: "",
        description: "",
        parents: [],
        url: "",
        servercolor: "#FFFFCC",
        colorindex: 1,
        location: {x:50,y:50}
      },
      pages: [],
      nodes: [],
      edges: []
    },
    usedIds: [],
    edgeCount: 0,
    eventsHistory: [],
    isSubgraph: false,
    initialize: function () {
      // Is this a subgraph?
      var parentGraph = this.get("parentGraph");
      if (parentGraph) {
        this.isSubgraph = true;
        this.parentGraph = parentGraph;
      }
      
      this.usedIds = [];
      // Convert arrays into Backbone Collections
      if (this.attributes.pages) {
        var pages = this.attributes.pages;
        this.attributes.pages = new beflow.Pages();
        for (var k=0; k<pages.length; k++) {
          pages[k].parentGraph = this;
          var page = new beflow.Page(pages[k]);
          this.addPage(page);
        }
      }
      if (this.attributes.nodes) {
        var nodes = this.attributes.nodes;
        this.attributes.nodes = new beflow.Nodes();
        for (var i=0; i<nodes.length; i++) {
          var node = this.makeNode(nodes[i]);
          if (node) {
            this.addNode(node);
          }
        }
      }
      if (this.attributes.edges) {
        var edges = this.attributes.edges;
        this.attributes.edges = new beflow.Edges();
        for (var j=0; j<edges.length; j++) {
          edges[j].parentGraph = this;
          var edge = new beflow.Edge(edges[j]);
          this.addEdge(edge);
        }
      }
      this.eventsHistory = new beflow.EventsHistory();

      var self = this;
      _.defer(function(){
        self.testLoaded();
      });

      // Change event
      this.on("updateGraph", this.graphChanged);
      
      if (!nodes || !nodes.length){
        this.checkLoaded();
      }
    },
    testLoaded: function(){
      var allLoaded = true;
      this.get("nodes").each(function(node){
        if (node.hasOwnProperty("lazyLoadType")) {
          if (!beflow.NativeNodes.hasOwnProperty(node.lazyLoadType)) {
            // That nativenode's js hasn't loaded yet
            allLoaded = false;
          } else {
            if (node.view && !node.Native) {
              node.view.initializeNative();
            }
          }
        }
      }, this);
      if (allLoaded) {
        this.initializeView();
      }
      return allLoaded;
    },
    initializeView: function() {
      if (!this.view) {
        this.view = new beflow.GraphView({model:this});
      }
    },
    setInfo: function (key, val) {
      var info = this.get("info");
      info[key] = val;
      // beflow.json only file change. source.js and src-index.js keep same
      this.trigger("updateGraph");
    },
    makeNode: function (info) {
      if (!info.src){
        return false;
      }
      info.parentGraph = this;
      // Test if image
      if (beflow.util.isImageURL(info.src)) {
        // Probably an image
        var src = info.src;
        info.src = "image/in";
        if (!info.state){
          info.state = {};
        }
        info.state.url = src;
      }

      // Native node
      var node;
      node = new beflow.NodeBox(info);
      node.lazyLoadType = info.src;

      // Load js if needed
      var self = this;
      yepnope([
        {
          test: beflow.NativeNodes.hasOwnProperty(info.src),
          nope: "src/nodes/"+info.src+".js",
          complete: function() {
            _.defer(function(){
              self.testLoaded();
              node.sendAddNode();
            });
          }
        }
      ]);
      
      return node;
    },
    addPage: function (page) {
      this.get("pages").add(page);

      if (this.view) {
        this.view.addPage(page);
      }
      
      return page;
    },
    addedPage: function (err) {
      if (err){
        alert(err);
      }
      beflow.visibleWait(false);
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

      var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var randomKey = "";
      for (var i=0; i<5; i++) {
        randomKey += keyStr.charAt( Math.floor(Math.random()*keyStr.length) );
      }

      // beflow.frameCount works around a FF bug with recycling iframes with the same name
      node.frameIndex = "frame_"+node.get('id')+"_"+(beflow.frameCount++)+randomKey+"_through";

      this.get("nodes").add(node);
      
      if (this.view) {
        this.view.addNode(node);
      }
      
      return node;
    },
    addEdge: function (edge) {
      // Make sure edge is unique
      var isDupe = this.get("edges").any(function(_edge) {
        return ( _edge.get('source')[0] === edge.get('source')[0] && _edge.get('source')[1] === edge.get('source')[1] && _edge.get('target')[0] === edge.get('target')[0] && _edge.get('target')[1] === edge.get('target')[1] );
      });
      if (isDupe) {
        console.warn("duplicate edge ignored", edge);
        return false;
      } else {
        this.get("edges").add(edge);

        // Validar si es un conector del lado del servidor
        var s = this.get("nodes").get( edge.get('source')[0] ).get("type");
        var t = this.get("nodes").get( edge.get('target')[0] ).get("type");

        if (s == 'cln'){
          beflow.pageList.push(this.get("nodes").get( edge.get('source')[0] ).get("page"));
        }
        
        if (t == 'cln'){
          beflow.pageList.push(this.get("nodes").get( edge.get('target')[0] ).get("page"));
        }
        
        if ( s == 'svr' || t == 'svr' ){
          beflow.serverChange = true;
        }
        
        if (!this._NotUpdateGraphNode){
          this.trigger("updateGraph");
        }
        
        if ( s == 'svr' || t == 'svr' ){
          var newEdge = {
            source: [ edge.get('source')[0], edge.get('source')[1], s ],
            target: [ edge.get('target')[0], edge.get('target')[1], t ]
          };
          beflow.trigger("addEdgeSvr", newEdge);
        }

        return true;
      }
    },
    remove: function() {
      // Remove all radiobutton of pages
      this.get("pages").each(function(page){
        page.remove();
      });

      // Called from beflowView.loadGraph
      this.get("nodes").each(function(node){
        node.remove(false);
      });

      if (this.view) {
        this.view.remove();
      }
    },
    deletePage: function (page) {
      this.view.selectNone();
      
      for (var i=0; i<this.get("nodes").length; i++) {
        var node = this.get("nodes").at(i);
        if (node.get("page") == page.get("name")) {
          node.view.$(".module").addClass("ui-selected");
        }
      }
      
      var uiselected = this.view.$(".module.ui-selected");
      if (uiselected.length == 0 || window.confirm("This page has nodes. Are you sure you want delete it along with its nodes?")) {
        beflow.visibleWait(true);
        
        this._NotUpdateGraphNode = true;
        
        for (i=0; i<uiselected.length; i++) {
          $(uiselected[i]).data("beflow-node-view").removeModel();
        }
        
        this._NotUpdateGraphNode = false;

        // If page to delete is selected then to select index page
        if (page.get("checked") === "checked") {
          this.attributes.pages.getByName("index").view.select();
        }
        
        this.get("pages").remove(page);
        page.remove();
        
        beflow.trigger("removePage", page.get("name"), this);
      } else {
        this.view.selectNone();
      }
    },
    removePage: function (err) {
      if (err) {
        alert(err);
      }
      beflow.visibleWait(false);
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

      if (connected.length > 0) {
        this._NotUpdateGraphEdge = true;

        _.each(connected, function(edge){
          edge.remove();
        });

        this._NotUpdateGraphEdge = false;
      }

      if (this.view) {
        this.view.removeNode(node);
      }

      this.get("nodes").remove(node);

      this.eventsHistory.add( 
        new beflow.Event({
          action: "removeNode", 
          args: {
            "node": node, 
            "edges": connected
          }
        })
      );
      
      var t = node.get("type");
      if (t == "cln"){
        var html;
        var page = this.attributes.pages.getByName(node.get("page"));

        if (node.get("page") == this.attributes.pages.getSelected().get("name")){
          beflow.editorDelNode(node.id);
          html = beflow.editorGetValue();
        } else{
          var tmp = $( '<div>' + page.get("layout") + '</div>' );
          tmp.find('div').remove('div[f="' + node.id + '"]');
          html = tmp.html();
        }
        
        page.set({
          layout: html
        });
        beflow.pageList.push(node.get("page"));
      }
      
      if (t == "svr"){
        beflow.serverChange = true;
        beflow.trigger("removeNodeSvr", node.id);
      }
      
      if (!this._NotUpdateGraphNode){
        this.trigger("updateGraph");
      }
    },
    removeEdge: function (edge) {
      edge.disconnect();
      this.get("edges").remove(edge);
      if (this.view) {
        this.view.removeEdge(edge);
      }
      
      // Validar si es un conector del lado del servidor
      var s = this.get("nodes").get( edge.get('source')[0] ).get("type");
      var t = this.get("nodes").get( edge.get('target')[0] ).get("type");
      
      if (s == 'cln'){
        beflow.pageList.push(this.get("nodes").get( edge.get('source')[0] ).get("page"));
      }
      
      if (t == 'cln'){
        beflow.pageList.push(this.get("nodes").get( edge.get('target')[0] ).get("page"));
      }
      
      if ( s == 'svr' || t == 'svr' ){
        beflow.serverChange = true;
      }

      if (!this._NotUpdateGraphEdge){
        this.trigger("updateGraph");
      }

      if ( s == 'svr' || t == 'svr' ){
        var newEdge = {
          source: [ edge.get('source')[0], edge.get('source')[1], s ],
          target: [ edge.get('target')[0], edge.get('target')[1], t ]
        };
        beflow.trigger("removeEdgeSvr", newEdge);
      }
    },
    checkLoaded: function () {
      // Called from NodeBoxView.initializeNative()
      for (var i=0; i<this.get("nodes").length; i++) {
        if (this.get("nodes").at(i).loaded === false || this.get("nodes").at(i).loaded2 === false) { 
          return false; 
        }
      };

      this.loaded = true;
      
      // Connect edges when all modules have loaded (+.5 seconds)
      var self = this;
      _.defer(function(){
        self.connectEdges();
      });
      
      return true;
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
      
      beflow._waitApp = false;
      beflow.visibleWait(false);
    },
    changeLayout: function (html) {
      var page = this.attributes.pages.getSelected();
      page.set({
        layout: html
      });
      beflow.pageList.push(page.get("name"));
      this.trigger("updateGraph");
    },
    graphChanged: function () {
      beflow.trigger("updateGraph", this);
    },
    color: function (value, pageName) {
      if (pageName){
        this.get("nodes").each(function(node){
          if (node.get("type") == "cln" && node.get("page") == pageName){
            node.view.color(value);
          }
        });
      } else{
        this.get("nodes").each(function(node){
          if (node.get("type") == "svr"){
            node.view.color(value);
          }
        });
        this.get("info")["servercolor"] = value;
      }
      
      this.trigger("updateGraph");
    },
    nodeColors: ["#FFE1E1", "#D2EEFF", "#F4E6D0", "#D2E1FF", "#E4EEDB", "#F9DBEF", "#CEFFE5"],
    getNodeColor: function () {
      var index = this.get("info")["colorindex"];
      var color = this.nodeColors[index];
      index++;
      if (index > this.nodeColors.length-1) {
        index = 0;
      }
      this.get("info")["colorindex"] = index;
      return color;
    },
    toJSON: function () {
      return {
        info: this.get("info"),
        pages: this.get("pages"),
        nodes: this.get("nodes"),
        edges: this.get("edges")
      };
    }
  });
  
  beflow.Graphs = Backbone.Collection.extend({
    model: beflow.Graph
  });

});
