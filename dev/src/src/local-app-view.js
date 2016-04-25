$(function(){

  var template = 
    '<div style="height:16px">'+
      '<a class="url" href="#<%= name %>"></a>&nbsp---&nbsp'+
      '<button type="button" class="remove icon-trash" title="delete app" style="width:14px;height:14px;font-size:6px"></button>'+
    '</div>';

  beflow.LocalAppView = Backbone.View.extend({
    tagName: "div",
    className: "localapp",
    template: _.template(template),
    events: {
      "click .remove":    "delete"
    },
    initialize: function () {
      this.render();
      beflow.$(".localapps").append(this.el);
      this.model.on('destroy', this.remove, this);
      return this;
    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      this.$(".url").text( decodeURIComponent(this.model.get("name")) ) ;
    },
    disabled: function (value) {
      this.$('button').prop('disabled', value);
    },
    delete: function () {
      beflow.deleteApp(this.model.get("name"));
    },
    remove: function () {
      this.$el.remove();
    }

  });

});
