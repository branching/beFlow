$(function(){

  beflow.PortIn = beflow.Port.extend({
    defaults: {
      name: "",
      type: "",
      description: "",
      "default": null
    },
    initializeView: function () {
      this.view = new beflow.PortInView({model:this});
      return this.view;
    }
  });
  
  beflow.PortsIn = Backbone.Collection.extend({
    model: beflow.PortIn
  });

});
