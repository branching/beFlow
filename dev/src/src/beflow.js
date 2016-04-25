var global = {};
global.side = "cln";

$(function(){
  var template = 
    '<div class="showpanel">'+
      '<div class="waitImg"></div>'+
      '<h2 class="waitTxt">Wait...</h2>'+
      '<button class="button show-load icon-folder-open">app</button>'+
    '</div>'+
    '<div class="panel">'+
      '<div class="choosepanel">'+
        '<div class="waitImg"></div>'+
        '<h2 class="waitTxt">Wait...</h2>'+
        '<button class="button show-load icon-folder-open">app</button>'+
        '<button class="button close icon-cancel" title="close menu"></button>'+
      '</div>'+
      '<div class="menu menu-load">'+
        '<div class="listing">'+
          '<button class="button newblank icon-doc" title="new blank app">new</button>'+
          '<button class="button savelocal icon-export" title="copy app and save under a new name">save as...</button>'+
          '<div class="currentapp">'+
          '</div>'+
          '<div class="localapps">'+
            '<h2>App List</h2>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="panel-layout">'+
        '<div class="edit-layout">'+
          '<h2>Layout</h2>'+
          '<textarea id="layout-editor">'+
          '</textarea>'+
        '</div>'+
      '</div>'+
    '</div>';

  var currentTemplate = 
    '<h2></h2>'+
    '<h3 title="title, click to edit" class="settitle editable"></h3>' +
    '<p title="description, click to edit" class="setdescription editable"></p>';

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
  
  var beflowView = Backbone.View.extend({
    tagName: "div",
    className: "app",
    template: _.template(template),
    currentTemplate: _.template(currentTemplate),
    environment: "dev",
    frameCount: 0, // HACK to not use same name in Firefox
    NativeNodes: {},
    serverChange: false,
    pageList: [],
    socket: null,
    events: {
      "click .close" :         "closePanels",
      "click .show-load" :     "showLoad",

      "click .newblank":       "newBlank",
      "click .savelocal":      "saveAs",

      "blur .settitle":        "setTitle",
      "blur .setdescription":  "setDescription",
    },
    initialize: function () {
      this.render();
      $('body').prepend(this.el);
      
      // Hide panels
      this.closePanels();

      // After all of the .js is loaded, this.allLoaded will be triggered to finish the init
      this.once("allLoaded", this.queryApps, this);
    },
    allLoaded: function () {
      this.trigger("allLoaded");

      // Start animation loop
      window.requestAnimationFrame( this.renderAnimationFrame.bind(this) );
    },
    render: function () {
      this.$el.html(this.template());
      return this;
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
    selectedPort: null,
    // Thanks http://www.madebypi.co.uk/labs/colorutils/examples.html :: red.equal(7, true);
    wireColors: ["#FF9292", "#00C2EE", "#DCA761", "#8BB0FF", "#96BD6D", "#E797D7", "#29C6AD"],
    wireColorIndex: 0,
    getWireColor: function () {
      var color = this.wireColors[this.wireColorIndex];
      this.wireColorIndex++;
      if (this.wireColorIndex > this.wireColors.length-1) {
        this.wireColorIndex = 0;
      }
      return color;
    },
    addMenu: function(name, html, icon){
      var self = this;

      var menu = $('<div class="menu menu-'+name+'"></div>')
        .append(html)
        .hide();
      this.$(".panel").append(menu);

      var showButton = $('<button class="button show-'+name+'">'+name+'</button>')
        .click( function(){
          self.showPanel(name);
        });
      if (icon) {
        showButton.addClass(icon);
      }
      this.$(".showpanel").append(showButton);
      this.$(".choosepanel > .close").before(showButton.clone(true));
    },
    addMenuSection: function(name, html, parentMenu){
      var title = $("<h1>").text(name);
      this.$(".menu-"+parentMenu+" .listing").append(title, html);
    },
    showGraph: function (graph) {
      // Show a child graph / subgraph / macro
      if (this.shownGraph && this.shownGraph.view) {
        this.shownGraph.view.$el.hide();
      }
      if (!graph.view) {
        graph.initializeView();
      }
      this.shownGraph = graph;
      this.shownGraph.view.$el.show();
      // Rerender edges once
      if (!this.shownGraph.view.unhidden) {
        this.shownGraph.view.unhidden = true;
        this.shownGraph.view.rerenderEdges();
      }
    },
    closePanels: function() {
      this.$(".showpanel").show();
      this.$(".panel").hide();
      this.$(".graph").css("right", "0px");

      this.$(".menu").hide();
    },
    showPanel: function( menu ) {
      this.$(".menu").hide();

      this.$(".showpanel").hide();
      this.$(".panel").show();
      this.$(".graph").css("right", "350px");

      if (menu) {
        if ( this.$(".menu-"+menu).length > 0 ) {
          this.$(".menu-"+menu).show();
          this.trigger("showmenu:"+menu);
        } else {
          // HACK for when menu plugin isn't added yet
          var self = this;
          _.delay(function(){
            self.$(".menu-"+menu).show();
            self.trigger("showmenu:"+menu);
          }, 1000);
        }
      }
      this.editorRefresh();
    },
    showLoad: function() {
      this.showPanel();
      this.$(".menu-load").show();
    },
    _app2Load: null,
    _app2LoadGraph: null,
    _app2Delete: null,
    _activeLink: null,
    _linkList: null,
    _loadedApp: null,
    queryApps: function () {
      this._linkList = new beflow.LocalApps();
      this._app2Load = localStorage.getItem("appCurrent");
      // validate if exists current app into localStorage
      if (!this._app2Load) {
        this._app2Load = "app";
      }
      // Load apps from "Apps" server folder
      this.trigger("queryApps");
    },
    appLink: function (err, appName, end) {
      // from queryApps
      if (!err) {
        var data = { name: appName };
        var link = new beflow.LocalApp(data);
        link.initializeView();
        this._linkList.add(link);

        // find name app to load
        var load = false;
        if (!end) {
          if (this._app2Load == appName) {
            load = true;
          }
        } else {
          if (!this._app2LoadGraph) {
            load = true;
          }
        }

        if (load) {
          this._activeLink = link;
          
          this._app2LoadGraph = appName;
          this._waitApp = true;
          var self = this;
          _.defer(function(){
            self.trigger("graph", appName);
          });
        }
      } else {
        alert(err);
        this.visibleWait(false);
      }
    },
    newBlank: function () {
      var appName = window.prompt("Enter a name to application", "app");
      if (appName) {
        this.visibleWait(true);
        this._app2LoadGraph = appName;
        this.trigger("newBlank", appName);
      }
    },
    loadNewBlank: function (err, appName) {
      if (!err) {
        var data = { name: appName };
        var link = new beflow.LocalApp(data);
        link.initializeView();
        this._linkList.add(link);

        this._activeLink = link;

        this._app2LoadGraph = appName;
        this._waitApp = true;
        
        if (this.graph) {
          this.graph.remove();
          this.graph = null;
        }

        this.editorSetValue("");
        
        var self = this;
        _.defer(function(){
          self.trigger("graph", appName);
        });
      } else {
        alert(err);
        this.visibleWait(false);
      }
    },
    saveAs: function(){
      var newAppName = window.prompt("Enter a new name to application", this._loadedApp + "-copy");
      if (newAppName) {
        this.visibleWait(true);
        this.trigger("saveAs", this._loadedApp, newAppName);
      }
    },
    loadSavedApp: function (err, appName) {
      if (!err) {
        var data = { name: appName };
        var link = new beflow.LocalApp(data);
        link.initializeView();
        this._linkList.add(link);

        this._activeLink = link;

        this._loadedApp = appName;
        localStorage.setItem("appCurrent", appName);
        // URL hash
        this.router.navigate(this.encodeKey(appName));

        document.title = "beFlow: "+appName;
        this.graph.setInfo("title", appName);
        this.$(".currentapp h2").text(appName);
        this.$(".currentapp .settitle").text(appName);
      } else {
        alert(err);
      }
      this.visibleWait(false);
    },
    loadApp: function (appName) {
      this.visibleWait(true);
      
      this._activeLink = this._linkList.getByName(appName);

      this._app2LoadGraph = appName;
      this._waitApp = true;
      
      if (this.graph) {
        this.graph.remove();
        this.graph = null;
      }

      this.editorSetValue("");
      
      var self = this;
      _.defer(function(){
        self.trigger("graph", appName);
      });
    },
    loadGraph: function (err, graph) {
      if (!err) {
        if (this.graph) {
          this.graph.remove();
          this.graph = null;
        }

        this.wireColorIndex = 0;
        this.graph = new beflow.Graph(graph);
        if (graph["info"]) {
          if (graph["info"]["title"]) {
            document.title = "beFlow: "+graph["info"]["title"];
          }
          if (graph["info"]["servercolor"]) {
            beflow.setServerColor( graph["info"]["servercolor"] );
          }
        }
        
        this.editorSetValue( this.graph.attributes.pages.getSelected().get("layout") );

        this._loadedApp = this._app2LoadGraph;
        
        localStorage.setItem("appCurrent", this._loadedApp);
        // URL hash
        this.router.navigate(this.encodeKey(this._loadedApp));

        this.updateCurrentInfo(this.graph.toJSON());

        this.shownGraph = this.graph;
      } else {
        alert(err);
        // open last app again
        if (this._loadedApp) {
          this.loadApp(this._loadedApp);
        }
      };
    },
    deleteApp: function (app2Delete) {
      if (window.confirm("Are you sure you want to delete this application?")) {
        this.visibleWait(true);
        this._app2Delete = app2Delete;
        this.trigger("removeApp", app2Delete);
      }
    },
    removeApp: function (err) {
      if (!err) {
        if (this._app2Delete) {
          var link = this._linkList.getByName(this._app2Delete);
          this._linkList.remove(link);
          link.view.remove();
        }
      } else {
        alert(err);
      }
      this._app2Delete = null;
      this.visibleWait(false);
    },
    visibleWait: function(value) {
      this.$(".panel button").prop( "disabled", value );
      this.$(".panel a").prop( "disabled", value );
      this.$(".panel .addnode").prop( "disabled", value );
      if (value) {
        this.$(".waitImg").show();
        this.$(".waitTxt").show();
      } else {
        this.$(".waitImg").hide();
        this.$(".waitTxt").hide();
        if (this._activeLink) {
          this._activeLink.view.disabled(true);
        }
        this.shownGraph.attributes.pages.getByName("index").view.disabled();
      }
    },
    encodeKey: function (key) {
      key = key.toLowerCase().replace(/ /g, "-");
      key = encodeURIComponent(key);
      return key;
    },
    setTitle: function () {
      var input = this.$(".currentapp .settitle").text();
      if (input !== this.graph.get("info")["title"]) {
        this.graph.setInfo("title", input);
        document.title = "beFlow: "+input;
      }
    },
    setDescription: function () {
      var input = this.$(".currentapp .setdescription").text();
      if (input !== this.graph.get("info")["description"]) {
        this.graph.setInfo("description", input);
      }
    },
    updateCurrentInfo: function (graph) {
      this.$(".currentapp").html( this.currentTemplate(graph) );

      this.$(".currentapp h2").text(this._loadedApp);
      this.$(".currentapp .settitle").text(graph["info"]["title"]);
      this.$(".currentapp .setdescription").text(graph["info"]["description"]);

      this.$(".editable").attr("contenteditable", "true");
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
