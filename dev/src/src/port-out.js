$(function(){

  beflow.PortOut = beflow.Port.extend({
    defaults: {
      name: "",
      type: "",
      description: "",
      "default": null
    },
    initializeView: function () {
      this.view = new beflow.PortOutView({model:this});
      return this.view;
    }
  });
  
  beflow.PortsOut = Backbone.Collection.extend({
    model: beflow.PortOut
  });

});
