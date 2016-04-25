if (global.side == "svr") {
  
  var Backbone = require('backbone');
  var NodeModel = require('../node-box').NodeBox;

  exports.Node = NodeModel.extend({
    type: "svr",
    inputserver: function(server, s){
      this.Store.save("server", server, s)
    },
    inputdatabase: function(database, s){
      this.Store.save("database", database, s)
    },
    inputport: function(port, s){
      this.Store.save("port", port, s)
    },
    inputuser: function(user, s){
      this.Store.save("user", user, s)
    },
    inputpassword: function(password, s){
      this.Store.save("password", password, s)
    },
    inputcollection: function(collection, s){
      this.Store.save("collection", collection, s)
    },
    inputschema: function(schema, s){
      this.Store.save("schema", schema, s)
    },
    inputfields: function(fields, s){
      this.Store.save("fields", fields, s)
    },
    inputconditions: function(conditions, s){
      try {
        var server = this.Store.query("server", s);
        var database = this.Store.query("database", s);
        var collection = this.Store.query("collection", s);
        var schema = this.Store.query("schema", s);

        if ( !server || !database || !collection || !schema ) {
          return;
        }
        
        try {
          var _schema = JSON.parse(schema);
        } catch (e) {
          var err = '* Error in schema format.';
          console.error(err);
          this.send("error", err, s);
          return;
        }

        // { "name": "elkin" }
        var _conditions = null;
        if (conditions && conditions != '!') {
          try {
            _conditions = JSON.parse(conditions);
          } catch (e) {
            var err = '* Error in condition format.';
            console.error(err);
            this.send("error", err, s);
            return;
          }
        }
        
        // name
        var _fields = null;
        var fields = this.Store.query("fields", s);
        if (fields) {
          _fields = fields;
        }
        
        // DB Connection
        var mongoose = require('mongoose');

        var user = this.Store.query("user", s);
        var pass = this.Store.query("password", s);
        if (user) {
          if (!pass) {
            pass = '';
          }
          user = user + ':' + pass + '@';
        } else {
          user = '';
        }
        
        var port = this.Store.query("port", s);
        if (port && port != '' && parseInt(port) != NaN) {
          port = ':' + parseInt(port).toString();
        } else {
          port = '';
        };
        
        var self = this;
        // mongodb://localhost/demo
        var conn = mongoose.createConnection('mongodb://' + user + server + port + '/' + database);

        conn.on('error', function(err) {
          err = '* Error connecting to database:\n  ' + err.toString();
          console.error(err);
          self.send("error", err, s);
        });

        // { "name": "String" }
        var Schema = new mongoose.Schema(_schema);
        // usuarios
        var Model = conn.model(collection, Schema);
        
        Model.on('error', function(err) {
          err = '* Error in the model:\n  ' + err.toString();
          console.error(err);
          self.send("error", err, s);
        });
        
        Model.find(_conditions, _fields, function(err, docs) {
          if (!err) {
            // And finally, send to client
            self.send("docs", JSON.stringify(docs, null, 2), s);
          } else {
            err = '* Error finding document(s):\n  ' + err.toString();
            console.error(err);
            self.send("error", err, s);
          }
          conn.close();
          conn = null;
        });
      } catch (err) {
        console.error(err);
        this.send("error", err.toString(), s);
      }
    },
    inputs: {
      server: {
        type: "string",
        description: "server name for connection"
      },
      database: {
        type: "string",
        description: "database for connection"
      },
      port: {
        type: "number",
        description: "database port. Default port: 27017"
      },
      user: {
        type: "string",
        description: "user for login to database"
      },
      password: {
        type: "string",
        description: "password for login"
      },
      collection: {
        type: "string",
        description: "collection name"
      },
      schema: {
        type: "string",
        description: "collection schema"
      },
      fields: {
        type: "string",
        description: "fields to select"
      },
      conditions: {
        type: "all",
        description: "json for conditions and query / bang for query"
      }
    },
    outputs: {
      docs: {
        type: "string"
      },
      error: {
        type: "string"
      }
    }

  });
  
}

if (global.side == "cln") {

  $(function(){

    var template = 
      '<div>SERVER NODE</div>'+
      '<textarea style="resize:none;border:none;width:100%;background-color:transparent" disabled></textarea>';

    beflow.NativeNodes["mongoquery"] = beflow.NodeBoxNativeView.extend({
      template: _.template(template),
      info: {
        title: "mongoquery",
        description: "a node to query to mongo"
      },
      type: "svr",
      depen: {
        npm: "mongoose"
      },
      initializeModule: function(){
        this.$("textarea").on("click", function() {
          this.style.overflow = "hidden";resize="none"
          this.style.height = 0;
          this.style.height = this.scrollHeight + "px";
        });
        this.$("textarea").trigger( "click" );
      },
      inputserver: function(server){
        this._server = server;
        this.paramview();
      },
      inputdatabase: function(database){
        this._database = database;
        this.paramview();
      },
      inputport: function(port){
        this._port = port;
        this.paramview();
      },
      inputuser: function(user){
        this._user = user;
        this.paramview();
      },
      inputpassword: function(password){
        this._password = password;
        this.paramview();
      },
      inputcollection: function(collection){
        this._collection = collection;
        this.paramview();
      },
      inputschema: function(schema){
        this._schema = schema;
        this.paramview();
      },
      inputfields: function(fields){
        this._fields = fields;
        this.paramview();
      },
      inputconditions: function(conditions){
        try {
          // dummy documents
          var docs = '[{"id":1,"name":"Jhon","lastname":"Connor"},';
          docs += '{"id":2,"name":"William","lastname":"Wallace"},';
          docs += '{"id":3,"name":"Tony","lastname":"Montana"}]';
          
          this._conditions = conditions;
          this.paramview();

          if ( !this._server || !this._database || !this._collection || !this._schema ) {
            return;
          }
          
          try {
            var _schema = JSON.parse(this._schema);
          } catch (e) {
            var err = 'Error in schema format.';
            console.error(err);
            this.send("error", err);
            return;
          }

          if (conditions && conditions != '!') {
            try {
              var _conditions = JSON.parse(conditions);
            } catch (e) {
              var err = 'Error in condition format.';
              console.error(err);
              this.send("error", err);
              return;
            }
          }
          
          this.send("docs", JSON.stringify(JSON.parse(docs), null, 2));
        } catch (err) {
          console.error(err);
          this.send("error", err);
        }
      },
      paramview: function() {
        var val = '';

        if (this._server) {
          val += 'Server: ' + this._server + '\n'
        }
        if (this._database) {
          val += 'Database: ' + this._database + '\n'
        }
        if (this._port) {
          val += 'Port: ' + this._port + '\n'
        }
        if (this._user) {
          val += 'User: ' + this._user + '\n'
        }
        if (this._password) {
          val += 'Password: ' + this._password + '\n'
        }
        if (this._collection) {
          val += 'Collection: ' + this._collection + '\n'
        }
        if (this._schema) {
          val += 'Schema: ' + this._schema + '\n'
        }
        if (this._fields) {
          val += 'Fields: ' + this._fields + '\n'
        }
        if (this._conditions)
        {
          if (this._conditions == '!') {
            val += 'Conditions: bang!\n'
          } else {
            val += 'Conditions: ' + this._conditions + '\n'
          }
        }
        
        this.$("textarea").text(val);
        this.$("textarea").trigger( "click" );
      },
      inputs: {
        server: {
          type: "string",
          description: "server name for connection"
        },
        database: {
          type: "string",
          description: "database for connection"
        },
        port: {
          type: "number",
          description: "database port. Default port: 27017"
        },
        user: {
          type: "string",
          description: "user for login to database"
        },
        password: {
          type: "string",
          description: "password for login"
        },
        collection: {
          type: "string",
          description: "collection name"
        },
        schema: {
          type: "string",
          description: "collection schema"
        },
        fields: {
          type: "string",
          description: "fields to select"
        },
        conditions: {
          type: "all",
          description: "json for conditions and query / bang for query"
        }
      },
      outputs: {
        docs: {
          type: "string"
        },
        error: {
          type: "string"
        }
      }
    });
  });
  
}
