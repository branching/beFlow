if (global.side == "svr") {
  
  var Backbone = require('backbone');
  var NodeModel = require('../node-box').NodeBox;

  exports.Node = NodeModel.extend({
    type: "svr",
    inputserver: function(server, s){
      this.Store.save("server", server, s)
    },
    inputinstance: function(instance, s){
      this.Store.save("instance", instance, s)
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
    inputsql: function(sql, s){
      this.Store.save("sql", sql, s)
    },
    inputparams: function(params, s){
      try {
        var server = this.Store.query("server", s);
        var database = this.Store.query("database", s);
        var user = this.Store.query("user", s);
        var password = this.Store.query("password", s);
        var sql = this.Store.query("sql", s);
        
        if ( !server || !database || !user || !password || !sql ) {
          return;
        }
        
        // select * from Usuarios where Nombre = '<<nombre>>'
        // { "name": "elkin" }
        if (params && params != '!') {
          try {
            var json = JSON.parse(params);
            for (var key in json) {
              var value = json[key];
              sql = sql.replace(key, value);
            }
          } catch (e) {
            var err = '* Error in params format:\n  ' + e.toString();
            console.error(err);
            this.send("error", err, s);
            return;
          }
        }
        
        var instance = this.Store.query("instance", s);
        if ( instance && instance != '' ) {
          server = server + '\\' + instance;
        }

        var mssql = require('mssql'); 

        // localhost
        // SQLEXPRESS
        // demo
        // sa
        // branching
        var config = {
          server: server, // You can use 'localhost\\instance' to connect to named instance
          database: database,
          user: user,
          password: password
        }

        var port = this.Store.query("port", s);
        if (port && parseInt(port) != NaN) {
          config["port"] = parseInt(port);
        };
        
        // DB Connection
        var self = this;
        var connection = new mssql.Connection(config, function(err) {
          // ... error checks
          if (!err) {
            // Query
            var request = new mssql.Request(connection);
            request.query(sql, function(err, recordset) {
              // ... error checks
              if (!err) {
                self.send("docs", JSON.stringify(recordset), s)
              } else {
                err = '* Query error:\n  ' + err.toString();
                console.error(err);
                self.send("error", err, s);
              }
            });          
          } else {
              err = '* Error connecting to database:\n  ' + err.toString();
              console.error(err);
              self.send("error", err, s);
          }
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
      instance: {
        type: "string",
        description: "instance name for connection"
      },
      database: {
        type: "string",
        description: "database name for connection"
      },
      port: {
        type: "number",
        description: "database port. Default port: 1433"
      },
      user: {
        type: "string",
        description: "user for login to database"
      },
      password: {
        type: "string",
        description: "password for login"
      },
      sql: {
        type: "string",
        description: "sql sentence"
      },
      params: {
        type: "all",
        description: "params for query and execute sentence"
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

    beflow.NativeNodes["mssquery"] = beflow.NodeBoxNativeView.extend({
      template: _.template(template),
      info: {
        title: "mssquery",
        description: "a node to query to SQL Server"
      },
      type: "svr",
      depen: {
        npm: "mssql"
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
      inputinstance: function(instance){
        this._instance = instance;
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
      inputsql: function(sql){
        this._sql = sql;
        this.paramview();
      },
      inputparams: function(params){
        try {
          // dummy documents
          var docs = '[{"id":1,"name":"Jhon","lastname":"Connor"},';
          docs += '{"id":2,"name":"William","lastname":"Wallace"},';
          docs += '{"id":3,"name":"Tony","lastname":"Montana"}]';
          
          this._params = params;
          this.paramview();
          
          if ( !this._server || !this._database || !this._user || !this._password || !this._sql ) {
            return;
          }
          
          if (params && params != '!') {
            try {
              var json = JSON.parse(params);
            } catch (e) {
              var err = '* Error in params format:\n  ' + e.toString();
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
        if (this._instance) {
          val += 'Instance: ' + this._instance + '\n'
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
        if (this._sql) {
          val += 'SQL: ' + this._sql + '\n'
        }
        if (this._params) {
          if (this._params == '!') {
            val += 'Params: bang!\n'
          } else {
            val += 'Params: ' + this._params + '\n'
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
        instance: {
          type: "string",
          description: "instance name for connection"
        },
        database: {
          type: "string",
          description: "database for connection"
        },
        port: {
          type: "number",
          description: "database port. Default port: 1433"
        },
        user: {
          type: "string",
          description: "user for login to database"
        },
        password: {
          type: "string",
          description: "password for login"
        },
        sql: {
          type: "string",
          description: "sql sentence"
        },
        params: {
          type: "all",
          description: "params for query and execute sentence"
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
