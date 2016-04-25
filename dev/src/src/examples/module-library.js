// Module is used for beflow.Library and has info about ins and outs
// Node is used by Graph, and has info about x, y, w, h

$(function(){

  var library = {
    UI: [
      {"src":"button","size":{w:130,h:40},"info":{"title":"button","author":"beflow","description":"a button sends a bang, and you can attach a keyboard key"}},
      {"src":"text","size":{w:190,h:200},"info":{"title":"text","author":"beflow","description":"a text box to send json object"}},
      {"src":"textarea","size":{w:200,h:200},"info":{"title":"textarea","author":"beflow","description":"a multiline text box to edit and send text"}},
      {"src":"hslider","size":{w:200,h:150},"info":{"title":"hslider","author":"beflow","description":"horizontal slider"}},
      {"src":"table","size":{w:300,h:300},"info":{"title":"table","author":"beflow","description":"load Html table from json"}},
      {"src":"select","size":{w:300,h:200},"info":{"title":"select","author":"beflow","description":"load select from json"}},
      {"src":"radiobutton","size":{w:300,h:200},"info":{"title":"radiobutton","author":"beflow","description":"load radio button array from json"}},
      {"src":"checkbox","size":{w:150,h:100},"info":{"title":"checkbox","author":"beflow","description":"a Html checkbox"}}
    ],
    "Flow Control": [
      {"src":"initialbang","size":{w:150,h:50},"info":{"title":"initialbang","author":"beflow","description":"bang when all loaded"}},
      {"src":"jcomposer","size":{w:200,h:200},"info":{"title":"jcomposer","author":"beflow","description":"create json objects"}},
      {"src":"jsonarray","size":{w:300,h:200},"info":{"title":"jsonarray","author":"beflow","description":"insert, update or delete a element into array"}},
      {"src":"valuebykey","size":{w:200,h:200},"info":{"title":"value by key","author":"beflow","description":"get value from json by key"}},
      {"src":"gate","size":{w:200,h:200},"info":{"title":"gate","author":"beflow","description":"send data with each bang"}},
      {"src":"delay","size":{w:150,h:30},"info":{"title":"delay","author":"beflow","description":"send data after delay milliseconds"}},
      {"src":"startapp","size":{w:150,h:50},"info":{"title":"start app","author":"beflow","description":"bang when start application"}}
    ],
    TX: [
      {"src":"txall","size":{w:150,h:30},"info":{"title":"tx all","author":"beflow","description":"data transmission to all target"}},
      {"src":"broadcast","size":{w:150,h:30},"info":{"title":"broadcast","author":"beflow","description":"broadcast data transmission"}},
      {"src":"subscribe","size":{w:150,h:50},"info":{"title":"subscribe","author":"beflow","description":"subscribe currently user to a room"}},
      {"src":"txroom","size":{w:150,h:30},"info":{"title":"tx room","author":"beflow","description":"data transmission to room what user previously is subscribed"}},
      {"src":"unsubscribe","size":{w:150,h:50},"info":{"title":"unsubscribe","author":"beflow","description":"unsubscribe currently user to room"}},
      {"src":"nodejswebsocket","size":{w:200,h:250},"info":{"title":"nodejs web socket","author":"beflow","description":"a node to send text to other web socket"}}
    ],
    "Mongo Server": [
      {"src":"mongoadd","size":{w:200,h:250},"info":{"title":"mongoadd","author":"beflow","description":"a node to add document to mongo"}},
      {"src":"mongoquery","size":{w:200,h:250},"info":{"title":"mongoquery","author":"beflow","description":"a node to query to mongo"}}
    ],
    "SQL Server": [
      {"src":"mssquery","size":{w:200,h:250},"info":{"title":"mssquery","author":"beflow","description":"a node to query to SQL Server"}},
      {"src":"mssnonquery","size":{w:200,h:250},"info":{"title":"mssnonquery","author":"beflow","description":"a node to execute non query to SQL Server"}}
    ],
    "Tessel.io": [
      {"src":"servo","size":{w:200,h:250},"info":{"title":"servo","author":"beflow","description":"control data for position or speed of servomotor"}}
    ],
    "Webtask": [
      {"src":"webtask","size":{w:300,h:200},"info":{"title":"webtask","author":"beflow","description":"call a Webtask"}}
    ]
  };
  
  beflow.loadLibrary(library);

});
