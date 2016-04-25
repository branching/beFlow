$(function(){
  beflow.NodeBoxView = beflow.NodeView.extend({
    tagName: "div",
    className: "node",
    initializeNative: function () {
      // Called from GraphView.addNode
      if (!this.Native){
        if (beflow.NativeNodes.hasOwnProperty(this.model.lazyLoadType)) {
          this.Native = new beflow.NativeNodes[this.model.lazyLoadType]({model:this.model});
          $( "div[f='" + this.model.get("id") + "']" ).replaceWith( this.Native.$el );
        } else {
          console.warn("No native node found.");
        }
      }
    },
    removeModel: function () {
      this.model.remove(true);
    },
    remove: function () {
      // Called from GraphView.removeNode
      if (this.Native) {
        this.Native.remove();
      }
      this.$el.remove();
    }

  });

});
