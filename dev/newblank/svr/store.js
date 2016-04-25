var Backbone = require('backbone');
var _ = require('underscore');

exports.Store = Backbone.Model.extend({
  defaults: function() {
    return {
    	repo: { common: {} }
    };
  },
  save: function (key, value, socket) {
    if (key && value != undefined) {
	    var state = this.get("repo");
      var obj = _.object([[ key, value ]]);
	    if ( socket ) {
	      if ( state[socket.id] ) {
	      	_.extend( state[socket.id], obj )
	      } else {
	        _.extend( state, _.object([[ socket.id, obj ]]) )
	      }
	    } else {
	    	_.extend( state["common"], obj );
	    }
	    this.set("data", state);
	  }
  },
  query: function (key, socket) {
    if (key) {
    	var state = this.get("data");
	    if (socket) {
	      if (state[socket.id]) {
	      	if (state[socket.id][key] != undefined) {
	      		return state[socket.id][key]
	      	}	else if (state["common"][key] != undefined) {
      			return state["common"][key]
      		}
	      } else if (state["common"][key] != undefined) {
		      return state["common"][key]
		    }
		  } else if (state["common"][key] != undefined) {
	    	return state["common"][key]
	    }
	  }
  },
  delete: function (key, socket) {
    if (key && socket) {
    	var state = this.get("data");
      if (state[socket.id]) {
    		state[socket.id] = _.omit(state[socket.id], key);
    		this.set("data", state);
      }
	  }
  }
});
