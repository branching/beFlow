$(function(){

  beflow.NodeBox = beflow.Node.extend({
    loaded: false,
    defaults: function() {
      return {
        src: "",
        state: {}
      };
    },
    info: {
      title: "native-node",
      description: "extend me"
    },
    initialize: function () {
      this.Inputs = new beflow.Ports();
      this.Outputs = new beflow.Ports();

      this.parentGraph = this.get("parentGraph");
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
      var newPort = new beflow.Port(info);
      newPort.node = this;
      newPort.parentGraph = this.parentGraph;
      this.Inputs.add(newPort);

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
      var newPort = new beflow.Port(info);
      newPort.node = this;
      newPort.parentGraph = this.parentGraph;
      this.Outputs.add(newPort);

      return newPort;
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
    },
    setValue: function(name, value) {
      this.get("state")[name] = value;
    }

  });
  
});
