$(function(){

  var template = 
    '';

  beflow.GraphView = Backbone.View.extend({
    tagName: "div",
    className: "graph",
    template: _.template(template),
    unhidden: false,
    initialize: function () {
      this.render();
      if (this.model.isSubgraph) {
        this.$el.hide();
      }

      this.model.get("nodes").each( this.addNode.bind(this) );
    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    renderAnimationFrame: function (timestamp) {
      // Hit all nodes
      this.model.get("nodes").each(function(node){
        if (node.view && node.view.Native) {
          node.view.Native.renderAnimationFrame(timestamp);
        }
      });
    },
    addNode: function (node) {
      //this.$(".nodes").append( node.initializeView().el );
      node.initializeView();

      // Render the native view
      if (node.lazyLoadType) {
        node.view.initializeNative();
      }
    },
    remove: function(){
      this.$el.remove();
    },
    removeNode: function (node) {
      if (node.view) {
        node.view.remove();
      }
    }
    
  });

});
