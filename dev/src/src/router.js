$(function(){
  
  // Router
  var beflowRouter = Backbone.Router.extend({
    routes: {
      "new":          "newBlank",
      ":url":         "loadApp",
      "*path":        "default"
    },
    loadApp: function(url) {
      if (beflow._loadedApp) {
        beflow.loadApp(url);
      } else {
        localStorage.setItem("appCurrent", url);
      }
    },
    newBlank: function() {
      beflow.newBlank();
    },
    'default': function() {

    }
  });
  beflow.router = new beflowRouter();
  Backbone.history.start();
    
});