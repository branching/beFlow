// Module is used for beflow.Library and has info about ins and outs
// Node is used by Graph, and has info about x, y, w, h

$(function(){

  beflow.Module = Backbone.Model.extend({
    defaults: {
      "src": "",
      "size": {w:200,h:210},
      "info": {}
    },
    initialize: function () {
      this.groupAndName = this.get("src").split("/");
    },
    initializeView: function () {
      if (!this.view) {
        this.view = new beflow.ModuleView({model:this});
      }
      return this.view;
    },
    toJSON: function () {
      return {
        "src": this.get("src"),
        "size": this.get("size"),
        "info": this.get("info")
      };
    }
  });
  
  beflow.Modules = Backbone.Collection.extend({
    model: beflow.Module,
    findOrAdd: function (node) {
      var module;
      module = this.find(function(module){
        return module.get("src") === node.get("src");
      });
      if (!module) {
        module = new beflow.Module({"node":node});
        this.add(module);
      }
      return module;
    }
  });

});
