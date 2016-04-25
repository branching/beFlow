$(function(){

  var template = 
    '<label></label>'+
    '<table></table>';

  beflow.NativeNodes["table"] = beflow.NodeBoxNativeView.extend({

    template: _.template(template),
    info: {
      title: "table",
      description: "load Html table from json"
    },
    events: {
    },
    type: "cln",
    inputlabel: function(label){
      this.$("label").text(label);
    },
    inputjson: function(data){
      this.$('table tr').each(function() {
        $(this).remove();
      })

      try {
        var arr = JSON.parse(data);
        if (arr.constructor.toString().indexOf("Array") == -1)
          arr = [ arr ];
      } catch (e) {
        this.$('table').hide();
        return;
      }
      
      if (arr.length == 0)
        this.$('table').hide();
      else {
        // Builds the HTML Table out of myList.
        var columns = this.addAllColumnHeaders(arr);
        var table = this.$('table');
        $.each(arr, function(i, json) {
          var row = $('<tr/>');
          $.each(columns, function(j, col) {
            var value = json[col];
            if (value == null)
              value = "";
            row.append($('<td/>').html(value));
          });
          table.append(row);
        });
        this.$('table').show();
      }
    },
    addAllColumnHeaders: function(arr){
        // Adds a header row to the table and returns the set of columns.
        // Need to do union of keys from all records as some records may not contain all records
        var columnSet = [];
        var headerTr = $('<tr/>');

        $.each(arr, function(i, json) {
          $.each(json, function(key, val) {
            if ($.inArray(key, columnSet) == -1){
                columnSet.push(key);
                headerTr.append($('<th/>').html(key));
            }
          });
        });
        this.$('table').append(headerTr);

        return columnSet;
    },
    inputcss: function(css){
      try {
        this.$("table").css( JSON.parse(css) );
      } catch (e) {}
    },
    inputs: {
      label: {
        type: "string",
        description: "label for input"
      },
      json: {
        type: "string",
        description: "input data in json format"
      },
      css: {
        type: "string",
        description: "css for table"
      }
    },
    outputs: { }

  });

});
