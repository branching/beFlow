$(function(){
  
  var template = 
      '<input type="radio" name="page" style="vertical-align:middle" value="<%= name %>" <%= checked %> ><%= name %></input>'+
      '<input type="color" style="vertical-align:middle;margin:1px;margin-left:10px" value="<%= color %>" ></input>&nbsp---&nbsp'+
      '<button type="button" class="remove icon-trash" title="delete page" style="width:14px;height:14px;font-size:6px"></button>';
    
  beflow.PageView = Backbone.View.extend({
    tagName: "div",
    template: _.template(template),
    events: {
      "change input[type='radio']": "change",
      "change input[type='color']": "changeColor",
      "click .remove":              "delete"
    },
    initialize: function () {
      this.render();
      this.model.on('destroy', this.remove, this);
      return this;
    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
    },
    disabled: function () {
      this.$('button').prop('disabled', true);
    },
    change: function () {
      this.model.parentGraph.attributes.pages.forceChange();
    },
    changeColor: function () {
      Mousetrap.pause();
      var value = this.$('input[type="color"]').prop('value');
      this.model.set({
        color: value
      });
      this.model.parentGraph.color(value, this.model.get("name"));
      Mousetrap.unpause();
    },
    select: function () {
      this.$('input[type="radio"]').prop('checked', true);
      this.change();
    },
    getState: function () {
      return this.$('input[type="radio"]').prop('checked');
    },
    delete: function () {
      this.model.delete();
    },
    remove: function () {
      this.$el.remove();
    }

  });

});
