$(function(){

  beflow.NodeBox = beflow.Node.extend({
    loaded: false,
    loaded2: false,
    defaults: function() {
      return {
        src: "",
        type: "cln",
        x: 100,
        y: 400,
        z: 0,
        w: 200,
        h: 210,
        page: "",
        state: {},
        depen: {
          npm: [], 
          files: []
        }
      };
    },
    info: {
      title: "native-node",
      description: "extend me"
    },
    initialize: function () {
      this.Inputs = new beflow.PortsIn();
      this.Outputs = new beflow.PortsOut();

      this.parentGraph = this.get("parentGraph");

      // Change event
      this.on("updateNode", this.nodeChanged);
    },
    initializeView: function () {
      // Called from GraphView.addNode
      this.view = new beflow.NodeBoxView({model:this});
      return this.view;
    },
    send: function (name, value) {
      // Send message out to connected modules
      // Defer to make this safe for infinite loops
      var self = this;
      _.defer(function(){
        self.trigger("send:"+name, value);
      });
    },
    receive: function (name, value) {
      // The listener that hits this is added in the edge
      if (this.view.Native) {
        this.view.Native.receive(name, value);
      }
    },
    infoLoaded: function (info) {
      this.info = info;
      if (this.view) {
        this.view.infoLoaded(info);
      }
    },
    setState: function () {
      var state = this.get("state");
      if (state && this.view.Native){
        for (var name in state) {
          if (this.view.Native["input"+name]){
            this.view.Native["input"+name](state[name]);
          } else {
            this.view.Native["_"+name] = state[name];
          }
        }
      }
    },
    addInput: function (info) {
      if (info.id === undefined) {
        info.id = info.name;
      }
      info.parentNode = this;
      // Name must be unique
      var replace = this.Inputs.get(info.id);
      if (replace) {
        replace.set(info);
        return;
      }
      var newPort = new beflow.PortIn(info);
      newPort.isIn = true;
      newPort.node = this;
      newPort.parentGraph = this.parentGraph;
      this.Inputs.add(newPort);
      if (this.view) {
        this.view.addInput(newPort);
      }
      // Set state to post defaults
      var currentState = this.get("state");
      if ( info.hasOwnProperty("default") && info["default"] !== "" && !currentState.hasOwnProperty(info.name) ) {
        currentState[info.name] = info["default"];
      }
      return newPort;
    },
    addOutput: function (info) {
      if (info.id === undefined) {
        info.id = info.name;
      }
      info.parentNode = this;
      // Name must be unique
      var replace = this.Outputs.get(info.id);
      if (replace) {
        replace.set(info);
        return;
      }
      var newPort = new beflow.PortOut(info);
      newPort.isIn = false;
      newPort.node = this;
      newPort.parentGraph = this.parentGraph;
      this.Outputs.add(newPort);
      if (this.view) {
        this.view.addOutput(newPort);
      }
      return newPort;
    },
    nodeChanged: function () {
      if (this.parentGraph) {
        var t = this.get("type");
        
        if (t == "cln"){
          beflow.pageList.push(this.get("page"));
        }
        
        if (t == "svr"){
          beflow.serverChange = true;
        }
        
        this.parentGraph.trigger("updateGraph");
      }
    },
    remove: function (fromView) {
      if (fromView) {
        // Called from NodeBoxView.removeModel
        // User initiated undo, so make it undoable
        this.parentGraph.removeNode(this);
      } else {
        // Called from Graph.remove
        // Just remove it
        if (this.view) {
          this.view.remove();
        }
      }
    },
    setValues: function(info) {
      for (var name in info) {
        this.setValue(name, info[name]);
      }
      this.nodeChanged();
    },
    setValue: function(name, value) {
      this.get("state")[name] = value;
      this.nodeChanged();
    },
    sendAddNode: function () {
      if (!beflow._waitApp) {
        var t = this.get("type");
        
        if (t == "cln") {
          beflow.editorAddNode(this.id);
          var page = this.parentGraph.attributes.pages.getSelected();
          page.set({
            layout: beflow.editorGetValue()
          });
          beflow.pageList.push(page.get("name"));
        }
        
        if (t == "svr"){
          beflow.serverChange = true;
        }
        
        if (!this.parentGraph._NotUpdateGraphNode){
          this.parentGraph.trigger("updateGraph");
        }
        
        var data = {
          id: this.get("id"),
          src: this.get("src"),
          type: this.get("type"),
          state: this.get("state"),
          depen: this.get("depen")
        }
        beflow.trigger("addNode", data);
      }
      this.loaded2 = true;
      this.parentGraph.checkLoaded()
    },
    toString: function() {
      if (this.info) {
        return "Native node "+this.get("id")+": "+this.info.title;
      } else {
        return "Native node "+this.get("id");
      }
    },
    toJSON: function () {
      return {
        id: this.id,
        src: this.get("src"),
        type: this.get("type"),
        x: this.get("x"),
        y: this.get("y"),
        w: this.get("w"),
        h: this.get("h"),
        page: this.get("page"),
        state: this.get("state")
      };
    }

  });
  
  beflow.Nodes = Backbone.Collection.extend({
    model: beflow.Node
  });

});
