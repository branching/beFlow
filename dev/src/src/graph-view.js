$(function(){

  var template = 
    '<div class="edges">'+
      '<svg class="edgesSvg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="300"></svg>'+
    '</div>'+
    '<div class="nodes" />';

  beflow.GraphView = Backbone.View.extend({
    tagName: "div",
    className: "graph",
    template: _.template(template),
    events: {
      "click":           "click",
      "dragenter":       "ignoreDrag",
      "dragover":        "ignoreDrag",
      "drop":            "drop"
    },
    unhidden: false,
    initialize: function () {
      this.render();
      if (this.model.isSubgraph) {
        this.$el.hide();
      }
      beflow.$el.prepend(this.el);

      this.edgesSvg = this.$('.edgesSvg')[0];

      // HACK Panel visible?
      if ( beflow.$(".panel").is(":visible") ){
        this.$el.css("right", "350px");
      }
      
      this.model.get("pages").each( this.addPage.bind(this) );

      this.model.get("nodes").each( this.addNode.bind(this) );
      
      // Drag helper from module library
      this.$el.droppable({ 
        accept: ".addnode, .canvas, .meemoo-plugin-images-thumbnail"
      });

      // Thanks Stu Cox http://stackoverflow.com/a/14578826/592125
      var supportsTouch = 'ontouchstart' in document;
      if (!supportsTouch) {
        // Selectable messes up scroll on touch devices
        this.$el.selectable({
          filter: ".module",
          delay: 20
        });
      }

      this.resizeEdgeSVG();

    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    renderAnimationFrame: function (timestamp) {
      // Hit all nodes
      this.model.get("nodes").each(function(node){
        if (node.view.Native) {
          node.view.Native.renderAnimationFrame(timestamp);
        }
      });
    },
    click: function (event) {
      // Hide dis/connection boxes
      $(".edge-edit").remove();
      beflow.selectedPort = null;
      
      // Deactivate modules
      this.$(".module").removeClass("active");
      // Deselect modules
      this.$(".module").removeClass("ui-selected");
    },
    ignoreDrag: function (event) {
      event.originalEvent.stopPropagation();
      event.originalEvent.preventDefault();
    },
    drop: function (event, ui) {
      this.ignoreDrag(event);

      // Drop files
      var dt = event.originalEvent.dataTransfer;
      if (dt) {
        var files = dt.files;
        if ( dt.files.length > 0 ) {
          var file = dt.files[0];
          var split = file.type.split("/");
          var o = {
            x: this.el.scrollLeft + event.originalEvent.clientX + 10,
            y: this.el.scrollTop + event.originalEvent.clientY + 35
          };
          /*
          if (split[0]==="image"){
            o.src = "image-in";
            o.state = { url: window.URL.createObjectURL( file ) };
            beflow.shownGraph.addNode( o );
          } else if (split[0]==="video"){
            o.src = "video-player";
            o.state = { url: window.URL.createObjectURL( file ) };
            beflow.shownGraph.addNode( o );
          } else if (split[0]==="text"){
            var reader = new FileReader();
            reader.onload = function(e) {
              o.src = "ui-textarea";
              o.state = { value: e.target.result };
              beflow.shownGraph.addNode( o );
            };
            reader.readAsText(file);
          }
          */
        }
      }

      // Drop images or mods from libraries
      if (!ui) {return false;}

      var type = ui.helper.data("meemoo-drag-type");
      if (!type) {return false;}

      var options = {
        x: Math.round(this.el.scrollLeft + ui.offset.left + 10),
        y: Math.round(this.el.scrollTop + ui.offset.top + 35)
      };

      switch(type){
        case "library-module":
          var module = ui.draggable.data("module");
          if (module) {
            // Add module
            module.view.dragAddNode( options );
          }
          break;
        case "canvas":
          var canvas = ui.helper.data("meemoo-drag-canvas");
          // Copy canvas
          if (canvas) {
            options.src = "image-in";
            options.canvas = canvas;
            var url = ui.helper.data("meemoo-image-url");
            if (url && url.slice(0,4)==="http") {
              // Dragged from public image library
              options.state = {};
              options.state.url = url;
            }
            beflow.shownGraph.addNode( options );
          }
          break;
        default:
          break;
      }
      return false;
    },
    addPage: function (page) {
      beflow.addPage( page.initializeView().el );
    },
    addNode: function (node) {
      this.$(".nodes").append( node.initializeView().el );
      // Render the native view
      if (node.lazyLoadType) {
        node.view.initializeNative();
      }
    },
    addEdge: function (edge) {
      edge.initializeView();

      if (edge.Source.view) {
        edge.Source.view.resetRelatedEdges();
      }
      if (edge.Target.view) {
        edge.Target.view.resetRelatedEdges();
      }
    },
    remove: function(){
      this.$el.remove();
    },
    removeNode: function (node) {
      if (node.view) {
        node.view.remove();
      }
    },
    removeEdge: function (edge) {
      if (edge.Source && edge.Source.view) {
        edge.Source.view.resetRelatedEdges();
      }
      if (edge.Target && edge.Target.view) {
        edge.Target.view.resetRelatedEdges();
      }
      if (edge.view) {
        edge.view.remove();
      }
    },
    resizeEdgeSVG: _.debounce( function () {
      // _.debounce keeps it from getting called more than needed
      var svg = this.$('.edgesSvg')[0];
      var rect = svg.getBBox();
      var width = rect.x + rect.width + 100;
      var height = rect.y + rect.height + 100;
      if (width === 100 && height === 100) {
        // So wires on new graph show up
        width = this.$el.width();
        height = this.$el.height();
      }
      // Only get bigger
      if (svg.getAttribute("width") < width) {
        svg.setAttribute("width", Math.round(width));
      }
      if (svg.getAttribute("height") < height) {
        svg.setAttribute("height", Math.round(height));
      }
    }, 100),
    selectAll: function () {
      this.$(".module").addClass("ui-selected");
    },
    selectNone: function () {
      this.$(".module").removeClass("ui-selected");
    },
    cut: function(){
      // Copy selected
      this.copy();
      var i;
      for (i=0; i<beflow._copied.nodes.length; i++) {
        // HACK offset cut for pasting in same spot
        beflow._copied.nodes[i].x -= 50;
        beflow._copied.nodes[i].y -= 50;
      }
      // Delete selected
      this.model._NotUpdateGraphNode = true;
      var uiselected = this.$(".module.ui-selected");
      for (i=0; i<uiselected.length; i++) {
        $(uiselected[i]).data("beflow-node-view").removeModel();
      }
      this.model._NotUpdateGraphNode = false;
      this.model.trigger("updateGraph");
    },
    copy: function(){
      var copied = {nodes:[],edges:[]};
      var uiselected = this.$(".module.ui-selected");
      var i, selected;

      // Copy selected nodes
      for (i=0; i<uiselected.length; i++) {
        selected = $(uiselected[i]).data("beflow-node-view").model;
        copied.nodes.push( JSON.parse(JSON.stringify(selected)) );
      }

      // Copy common edges
      this.model.get("edges").each(function(edge){
        var sourceSelected, targetSelected = false;
        for (i=0; i<uiselected.length; i++) {
          selected = $(uiselected[i]).data("beflow-node-view").model;
          if (edge.Source.node === selected) {
            sourceSelected = true;
          }
          if (edge.Target.node === selected) {
            targetSelected = true;
          }
        }
        if (sourceSelected && targetSelected) {
          copied.edges.push( JSON.parse(JSON.stringify(edge)) );
        }
      }, this);
      // Save these to beflow so can paste to other graphs
      beflow._copied = copied;
    },
    paste: function(){
      var copied = beflow._copied;
      if (copied && copied.nodes.length > 0) {
        var newNodes = [];
        var page = this.model.attributes.pages.getSelected().get("name");
        // Select none
        this.model._NotUpdateGraphNode = true;
        this.$(".module").removeClass("ui-selected");
        for (var i=0; i<copied.nodes.length; i++) {
          var oldNode = JSON.parse(JSON.stringify( copied.nodes[i] ));
          // Offset pasted
          oldNode.x += 50;
          oldNode.y += 50;
          oldNode.page = page;
          oldNode.parentGraph = this.model;
          var newNode = this.model.addNode(oldNode);
          newNode.copiedFrom = oldNode.id;
          newNodes.push(newNode);
          // Select pasted
          if (newNode.view) {
            newNode.view.select();
          }
        }
        var self = this;
        setTimeout(function(){
          // Add edges
          for (var j=0; j<copied.edges.length; j++) {
            var oldEdge = JSON.parse(JSON.stringify( copied.edges[j] ));
            var newEdge = {source:[],target:[]};
            for (var k=0; k<newNodes.length; k++) {
              var node = newNodes[k];
              if (oldEdge.source[0] === node.copiedFrom) {
                newEdge.source[0] = node.id;
              }
              if (oldEdge.target[0] === node.copiedFrom) {
                newEdge.target[0] = node.id;
              }
            }
            newEdge.source[1] = oldEdge.source[1];
            newEdge.target[1] = oldEdge.target[1];
            newEdge.parentGraph = self.model;
            newEdge = new beflow.Edge( newEdge );
            self.model.addEdge(newEdge);
          }
          self.model._NotUpdateGraphNode = false;
          self.model.trigger("updateGraph");
        }, 100);
      }
    },
    maskFrames: function () {
      $(".iframe-type").append( '<div class="iframemask" />' );
    },
    unmaskFrames: function () {
      $(".iframemask").remove();
    },
    rerenderEdges: function () {
      this.model.get("edges").each(function(edge){
        if (edge.view) {
          edge.view.redraw();
        }
      }, this);
    }
    
  });

});
