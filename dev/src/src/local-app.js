$(function(){

  beflow.LocalApp = Backbone.Model.extend({
    defaults: {
      name: ""
    },
    initializeView: function () {
      if (!this.view) {
        this.view = new beflow.LocalAppView({model:this});
      }
      return this.view;
    },
    toJSON: function () {
      return {
        name: this.get("name")
      }
    }
  });

  beflow.LocalApps = Backbone.Collection.extend({
    model: beflow.LocalApp,
    getByName: function (appName) {
      var app = this.find(function(app){
        return app.get("name") === appName;
      });
      return app;
    }
  });

});
