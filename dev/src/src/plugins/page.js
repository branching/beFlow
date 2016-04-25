$(function(){

  beflow.Page = Backbone.Model.extend({
    defaults: {
      name: "",
      checked: "",
      layout: "",
      color: ""
    },
    initialize: function () {
      this.parentGraph = this.get("parentGraph");
    },
    initializeView: function () {
      if (!this.view) {
        this.view = new beflow.PageView({model:this});
      }
      return this.view;
    },
    delete: function () {
      this.parentGraph.deletePage(this);
    },
    remove: function () {
      if (this.view) {
        this.view.remove();
      }
    },
    toJSON: function () {
      return {
        name: this.get("name"),
        checked: this.get("checked"),
        layout: this.get("layout"),
        color: this.get("color")
      }
    }
  });
  
  beflow.Pages = Backbone.Collection.extend({
    model: beflow.Page,
    getByName: function (pageName) {
      var page = this.find(function(page){
        return page.get("name") === pageName;
      });
      return page;
    },
    getSelected: function () {
      var page = this.find(function(page){
        return page.get("checked") === "checked";
      });
      return page;
    },
    forceChange: function () {
      var p;
      this.each(function(page){
        var checked = "";
        if (page.view.getState()){
          p = page;
          checked = "checked";
          beflow.editorSetValue(page.get("layout"));
        }
        page.set({
          checked: checked
        });
      });
      p.parentGraph.trigger("updateGraph");
    }
  });

});
