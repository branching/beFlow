$(function(){

  beflow.NodeBoxNativeView = Backbone.View.extend({
    tagName: "div",
    className: "nativenode",
    info: {
      title: "native-node-view",
      description: "extend me"
    },
    type: "cln",
    inputs: {},
    outputs: {},
    initialize: function () {
      this.render();

      // Ports
      for (var inputname in this.inputs) {
        if (this.inputs.hasOwnProperty(inputname)) {
          var inInfo = this.inputs[inputname];
          inInfo.name = inputname;
          this.model.addInput(inInfo);
        }
      }
      for (var outputname in this.outputs) {
        if (this.outputs.hasOwnProperty(outputname)) {
          var outInfo = this.outputs[outputname];
          outInfo.name = outputname;
          this.model.addOutput(outInfo);
        }
      }

      this.countloaded = 0;
      if (this.libs && this.libs.length > 0){
        var self = this;
        _.each(this.libs, function(lib){
          if (_.isEmpty(lib)){
            self.loadcomplete()
          } else {
            lib.complete = function() { self.loadcomplete() };
            yepnope(lib);
          }
        })
      } else {
        this.loadcomplete();
      }
      return this;
    },
    loadcomplete: function(){
      this.countloaded++;
      if (!this.libs || this.libs.length == 0 || this.libs.length == this.countloaded){
        this.initializeModule();
        // Check if all modules are loaded
        this.model.loaded = true;
        this.model.parentGraph.checkLoaded();
      }
    },
    initializeModule: function(){
      // for example, override in nodes/image-combine.js
    },
    render: function () {
      this.$el.html(this.template(this.model));
      return this;
    },
    redraw: function (timestamp) {
      // Do everything that will cause a redraw here
    },
    _triggerRedraw: false,
    _lastRedraw: 0,
    renderAnimationFrame: function (timestamp) {
      // Get a tick from GraphView.renderAnimationFrame()
      // this._valueChanged is set by NodeBox.receive()
      if (this._triggerRedraw) {
        this._triggerRedraw = false;
        this.redraw(timestamp);
        this._lastRedraw = timestamp;
      }
    },
    set: function (name, value) {
      // Sets own state, use sparingly
      this.model.setValue(name, value);
    },
    send: function (name, value) {
      this.model.send(name, value);
    },
    receive: function (name, value) {
      if (this["input"+name]){
        this["input"+name](value);
        // Must manually set _triggerRedraw in that function if needed
      } else {
        this["_"+name] = value;
        // Will trigger a NodeBoxNativeView.redraw() on next renderAnimationFrame
        this._triggerRedraw = true;
      }
    },
    connectEdge: function(edge) {
      // Called from Edge.connect();
    },
    disconnectEdge: function(edge) {
      // Called from Edge.disconnect();
    },
    remove: function(){
      // Called from NodeBoxView.remove();
    }

  });

});
