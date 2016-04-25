$(function(){

  // Bind shortcuts
  Mousetrap.bind(['command+a', 'ctrl+a'], function(e) {
    if (beflow.shownGraph && beflow.shownGraph.view) {
      e.preventDefault();
      beflow.shownGraph.view.selectAll();
    }
  });

  Mousetrap.bind(['command+x', 'ctrl+x'], function(e) {
    if (beflow.shownGraph && beflow.shownGraph.view) {
      // e.preventDefault();
      beflow.shownGraph.view.cut();
    }
  });

  Mousetrap.bind(['command+c', 'ctrl+c'], function(e) {
    if (beflow.shownGraph && beflow.shownGraph.view) {
      // e.preventDefault();
      beflow.shownGraph.view.copy();
    }
  });

  Mousetrap.bind(['command+v', 'ctrl+v'], function(e) {
    if (beflow.shownGraph && beflow.shownGraph.view) {
      // e.preventDefault();
      beflow.shownGraph.view.paste();
    }
  });
  
  var socket = io.connect('http://' + window.location.hostname + ':' + window.location.port);

  beflow.socket = socket;

  // *****************************************************************
  // Eventos para administrar el conjunto de aplicaciones de beflow
  // *****************************************************************
  beflow.on("queryApps", function(){
    socket.emit("queryApps");
  });
  
  socket.on("queryAppsResp", function(err, appName, end){
    beflow.appLink(err, appName, end);
  });
  

  beflow.on("newBlank", function(appName){
    socket.emit("newBlank", appName);
  });

  socket.on('newBlankResp', function(err, appName, end){
    beflow.loadNewBlank(err, appName);
  });
  

  beflow.on("saveAs", function(oldAppName, newAppName){
    socket.emit("saveAs", oldAppName, newAppName);
  });

  socket.on("saveAsResp", function(err, appName){
    beflow.loadSavedApp(err, appName);
  });


  beflow.on("graph", function(appName){
    socket.emit("graph", appName);
  });

  socket.on("graphResp", function(err, graph){
    beflow.loadGraph(err, JSON.parse(graph));
  });


  beflow.on("removeApp", function(appName){
    socket.emit("removeApp", appName);
  });
  
  socket.on("removeAppResp", function(err){
    beflow.removeApp(err);
  });


  // Start
  beflow.allLoaded();

  // *****************************************************************
  // Eventos para sincronizar la aplicacion
  // *****************************************************************
  beflow.on("updateGraph", function(data){
    if (!beflow._waitApp) {
      var pageList = _.uniq(beflow.pageList);
      socket.emit("updateGraph", beflow._loadedApp, pageList, { graph: data }, beflow.serverChange, (pageList.length > 0));
      beflow.serverChange = false;
      beflow.pageList = [];
    }
  });


  beflow.on("addPage", function(pageName, data){
    if (!beflow._waitApp) {
      beflow.visibleWait(true);
      socket.emit("addPage", beflow._loadedApp, pageName, { graph: data });
      beflow.pageList = [];
    }
  });
  
  socket.on("addPageResp", function(err){
    beflow.shownGraph.addedPage(err);
  });


  beflow.on("removePage", function(page2delete, data){
    socket.emit("removePage", beflow._loadedApp, page2delete, { graph: data });
    beflow.serverChange = false;
    beflow.pageList = [];
  });
  
  socket.on("removePageResp", function(err){
    beflow.shownGraph.removePage(err);
  });


  beflow.on("addNode", function(node){
    if (!beflow._waitApp) {
      beflow.visibleWait(true);
      socket.emit("addNode", beflow._loadedApp, node);
    }
  });
  
  socket.on("addNodeResp", function(err, id){
    // evento de nodo listo
    beflow.trigger("nodeReady" + id, err);
  });
  

  beflow.on("removeNodeSvr", function(id){
    if (!beflow._waitApp) {
      socket.emit("removeNodeSvr", beflow._loadedApp, id);
    }
  });


  beflow.on("addEdgeSvr", function(edge){
    if (!beflow._waitApp) {
      socket.emit("addEdgeSvr", beflow._loadedApp, edge);
    }
  });

  beflow.on("removeEdgeSvr", function(edge){
    if (!beflow._waitApp) {
      socket.emit("removeEdgeSvr", beflow._loadedApp, edge);
    }
  });


  beflow.on("saveToState", function(data){
    if (!beflow._waitApp) {
      socket.emit("saveToState", beflow._loadedApp, data);
    }
  });

});
