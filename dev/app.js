// Code dependencies
var express = require('express'),
  app = express(),
  server = app.listen(1000),
  io = require('socket.io').listen(server),
  fs = require('fs'),
  fse = require('fs-extra'),
  net = require('net'),
	_ = require('underscore'),
	shell = require('shelljs');

// Basic express server, only for static content
app.use(express.static(__dirname + '/src'));

// Beflow Parameters
var allAppsFolder = '../apps/';
var newBlankFolder = 'newblank';
var defaultAppName = 'app';
var svrPath = '/svr';
var clnPath = '/cln/src';
var devNodesFolder = 'src/src/nodes/';
var sourceFile = 'source.js';
var configFile = 'config.json';
var beflowFile = 'beflow.json';
var clnNodesFolder = '/nodes/';
var nodeModules = '/node_modules/';
var clnLibs = '/cln/libs/';
var srcLibs = 'src/libs/';
var index = 'index';

fs.readFile('config.json', 'utf8', function (err, data) {
  if (!err && data != '') {
  	try {
			var j = JSON.parse(data);
			
			if (j.allAppsFolder)
				allAppsFolder = j.allAppsFolder;
			if (j.newBlankFolder)
				newBlankFolder = j.newBlankFolder;
			if (j.defaultAppName)
				defaultAppName = j.defaultAppName;
			if (j.svrPath)
				svrPath = j.svrPath;
			if (j.clnPath)
				clnPath = j.clnPath;
			if (j.sourceFile)
				sourceFile = j.sourceFile;
			if (j.configFile)
				configFile = j.configFile;
			if (j.beflowFile)
				beflowFile = j.beflowFile;
			if (j.clnNodesFolder)
				clnNodesFolder = j.clnNodesFolder;
			if (j.nodeModules)
				nodeModules = j.nodeModules;
			if (j.clnLibs)
				clnLibs = j.clnLibs;
			if (j.srcLibs)
				srcLibs = j.srcLibs;
  	}
  	catch(e) {}
  }
})

// Currently app Parameters
var devPort={};

// Add listeners to the sockets
io.sockets.on('connection', function(socket) {

  // *****************************************************************
	// Eventos para administrar el conjunto de aplicaciones de beflow
  // *****************************************************************

	// Handle query apps
	socket.on('queryApps', function() {
    // find all folders
    fs.readdir(allAppsFolder, function(err, files) {
    	if (!err) {
	    	if (files.length == 0) {
	    		// create default app
	    		createApp('queryAppsResp', defaultAppName, true)
	    	} else {
		    	for (var i=0; i<files.length; i++) {
		    		validateApp(files[i], (i == files.length - 1))
		    	}
	    	}
    	} else {
    		err = 'Error accessing to folder ' + allAppsFolder + '\n' + err;
    		console.error(err);
    		socket.emit('queryAppsResp', err, allAppsFolder, true)
    	}
    })
	});
	
	function validateApp(file, end) {
		fs.stat(allAppsFolder + file, function(err, stats) {
			// validate if is directory
			if (!err) {
				if (stats.isDirectory()) {
					// find source.json
					fs.exists(allAppsFolder + file + '/' + beflowFile, function (exists) {
					  if (exists) {
					  	// send app name
	  					socket.emit('queryAppsResp', null, file, end)
					  }
					})
				}
			} else {
    		err = 'Error accessing to folder/file ' + allAppsFolder + file + '\n' + err;
    		console.error(err);
				socket.emit('queryAppsResp', err, file, end)
			}
		})
	};

	// Handle create App
	socket.on('newBlank', function(appName) {
		// validate repeated app name
		fs.exists(allAppsFolder + appName, function (exists) {
		  if (!exists) {
				createApp('newBlankResp', appName, false)
			} else {
    		var err = 'Already exists a app called ' + appName;
    		console.error(err);
				socket.emit('newBlankResp', err, appName, false)
			}
		})
	});
	
	function createApp(channel, appName, end) {
		fse.copy(newBlankFolder, allAppsFolder + appName, function(err) {
		  if (!err) {
		  	var info = { info: { author: "author of " + appName, title: appName, description: "description of " + appName, parents: [], url: "", servercolor: "#FFFFCC", colorindex: 1, location: {x:50,y:50} },
		  							pages: [{ name: "index", checked: "checked", layout: "", color: "#FFE1E1" }], nodes: [], edges: [] };

				fs.writeFile(allAppsFolder + appName + '/' + beflowFile, JSON.stringify(info), function (err) {
				  if (!err) {
				  	socket.emit(channel, null, appName, end)
				  } else {
		    		err = 'Error writing to file ' + allAppsFolder + appName + '/' + beflowFile + '\n' + err;
		    		console.error(err);
				  	socket.emit(channel, err, appName, end)
				  }
				});
		  } else {
    		err = 'Error copying app ' + appName + '\n' + err;
    		console.error(err);
		  	socket.emit(channel, err, appName, end)
		  }
		})
	};

	// Handle save as
	socket.on('saveAs', function(oldAppName, newAppName) {
		// validate repeated app name
		fs.exists(allAppsFolder + newAppName, function (exists) {
		  if (!exists) {
				fse.copy(allAppsFolder + oldAppName, allAppsFolder + newAppName, function(err) {
				  if (!err) {
				  	socket.emit('saveAsResp', null, newAppName)
				  } else {
		    		err = 'Error copying app ' + newAppName + '\n' + err;
		    		console.error(err);
				  	socket.emit('saveAsResp', err, null)
				  }
				});
			} else {
    		var err = 'Already exists a app called ' + newAppName;
    		console.error(err);
				socket.emit('saveAsResp', err, null)
			}
		})
	});

	// Handle query graph
	socket.on('graph', function(appName) {
		fs.stat(allAppsFolder + appName, function(err, stats) {
			if (!err) {
				if (stats.isDirectory()) {
					var p = allAppsFolder + appName + '/' + beflowFile;
					fs.exists(p, function (exists) {
					  if (exists) {
							fs.readFile(p, 'utf8', function (err, data) {
							  if (!err) {
							  	getConfig(appName);
							  	// send app graph
			  					socket.emit('graphResp', null, data)
							  } else {
					    		err = 'Error reading file ' + p + '\n' + err;
					    		console.error(err);
							  	socket.emit('graphResp', err, null)
							  }
							})
					  } else {
			    		err = 'File ' + p + ' not exists';
			    		console.error(err);
					  	socket.emit('graphResp', err, null)
					  }
					})
				} else {
	    		err = allAppsFolder + appName + ' is not a directory';
	    		console.error(err);
					socket.emit('graphResp', err, null)
				}
			} else {
    		err = 'Error accessing directory ' + allAppsFolder + appName + '\n' + err;
    		console.error(err);
				socket.emit('graphResp', err, null)
			}
		})
	});

	function getConfig(appName)	{
  	// find config.json
  	fs.exists(allAppsFolder + appName + '/' + configFile, function (exists) {
  		if (exists) {
				fs.readFile(allAppsFolder + appName + '/' + configFile, 'utf8', function (err, data) {
				  if (!err && data != '') {
				  	try {
							var j = JSON.parse(data);
							if (j.devPort) {
								devPort[appName] = j.devPort;
							} else {
								devPort[appName] = 8000;
							}
				  	}
				  	catch(e) {
				  		devPort[appName] = 8000;
				  	}
				  } else {
		  			devPort[appName] = 8000;
				  }
				})
  		} else {
  			devPort[appName] = 8000;
  		}
  	});
	};
	
	// Handle remove App
	socket.on('removeApp', function(appName) {
		fs.exists(allAppsFolder + appName, function(exists) {
		  if (exists) {
		    fse.remove(allAppsFolder + appName, function(err) {
				  if (!err) {
				  	socket.emit('removeAppResp', null)
				  } else {
		    		err = 'Error deleting folder ' + allAppsFolder + appName + '\n' + err;
		    		console.error(err);
				  	socket.emit('removeAppResp', err)
				  }
		    })
		  } else {
		  	socket.emit('removeAppResp', null);
		  }
		})
	});

  // *****************************************************************
  // Eventos para sincronizar la aplicacion
  // *****************************************************************

	var sourceDev={};
	
	// Handle update graph
	socket.on('updateGraph', function(appName, pageList, data, updsvr, updcln) {
		updateGraph(appName, pageList, data, updsvr, updcln);
	});
	
	function updateGraph(appName, pageList, data, updsvr, updcln) {
		try{
			var d = data.graph;
			if (updcln || updsvr){
	    	var sourceSvrNew = { nodes: [], edges: [] };
	    	var sourceClnNew = {};
	    	
				_.each(pageList, function(pageName){
					var layout = _.find( d.pages, function(page){ return page.name == pageName } ).layout;
					sourceClnNew[pageName] = { page: pageName, layout: layout, nodes: [], edges: [] };
				});
	    	
		    nodes = d.nodes;
		    for (var i=0; i<nodes.length; i++) {
		    	node = nodes[i];
					var nodeResult = {
						id: node.id,
						src: node.src,
						state: node.state
					}

					if ( updcln && node.type == "cln" && _.contains(pageList, node.page) ){
						sourceClnNew[node.page].nodes.push(nodeResult)
					}

					if ( updsvr && node.type == "svr" ){
						sourceSvrNew.nodes.push(nodeResult)
					}
		    }
		    
		    edges = d.edges;
		    for (var j=0; j<edges.length; j++) {
		    	edge = edges[j];

					var sourceNode = _.find( d.nodes, function(n){ return n.id == edge.source[0] } );
					var targetNode = _.find( d.nodes, function(n){ return n.id == edge.target[0] } );
					
					var sourceType = sourceNode.type;
					var targetType = targetNode.type;

					var sourcePage = sourceNode.page;
					var targetPage = targetNode.page;
					
					var edgeResult = {
						source: [ edge.source[0], edge.source[1], sourceType, sourcePage ],
						target: [ edge.target[0], edge.target[1], targetType, targetPage ]
					}

					if (updcln){
						if (sourceType == "cln" && _.contains(pageList, sourcePage)){
							sourceClnNew[sourcePage].edges.push(edgeResult)
						} else {
							if (targetType == "cln" && _.contains(pageList, targetPage)){
								sourceClnNew[targetPage].edges.push(edgeResult)
							}
						}
					}
					
					if ( updsvr && (sourceType == "svr" || targetType == "svr") ){
						sourceSvrNew.edges.push(edgeResult)
					}
		    }
		    
		    if (updcln){
					_.each(pageList, function(page){
						fs.writeFileSync(allAppsFolder + appName + clnPath + '/src-' + page + '.js', 
							"var sourcejson=" + JSON.stringify(sourceClnNew[page]))
					});
				}
				
		    if (updsvr){
					fs.writeFileSync(allAppsFolder + appName + svrPath + '/' + sourceFile, 
						"exports.sourcejson=" + JSON.stringify(sourceSvrNew))
				}
	    }
	    
			fs.writeFileSync(allAppsFolder + appName + '/' + beflowFile, JSON.stringify(d));
		}
		catch(e){
			console.error('Error:' + '\n' + e);
		}
	};
	
	socket.on("addPage", function(appName, pageName, data) {
		
		// Create .html file
		var f = newBlankFolder + '/cln/' + index + '.html';
		fs.readFile(f, 'utf8', function (err, html) {
		  if (!err) {
		  	f = allAppsFolder + appName + '/cln/' + pageName + '.html';
		  	html = html.replace(index, pageName);
				fs.writeFile(f, html, function (err) {
				  if (!err) {

				  	// Create .js file
				  	f = allAppsFolder + appName + clnPath + '/src-' + pageName + '.js';
						var len = fs.writeFileSync(f, "var sourcejson=" + JSON.stringify({ page: pageName, layout: "", nodes: [], edges: [] }));
						
						if (len == 0){
			    		err = 'Error writing to file ' + f + '\n' + err;
			    		console.error(err);
					  	socket.emit('addPageResp', err)
						}

						f = allAppsFolder + appName + '/' + beflowFile;
						len = fs.writeFileSync(f, JSON.stringify(data.graph));
						
						if (len == 0){
			    		err = 'Error writing to file ' + f + '\n' + err;
			    		console.error(err);
					  	socket.emit('addPageResp', err)
						}
						
						socket.emit('addPageResp', null);

				  } else {
		    		err = 'Error writing to file ' + f + '\n' + err;
		    		console.error(err);
				  	socket.emit('addPageResp', err)
				  }
				});
		  } else {
    		err = 'Error reading file ' + f + '\n' + err;
    		console.error(err);
		  	socket.emit('addPageResp', err)
		  }
		})

	});
	
	socket.on("removePage", function(appName, page2delete, data) {
		fs.writeFileSync(allAppsFolder + appName + '/' + beflowFile, JSON.stringify(data.graph));
		fse.removeSync( allAppsFolder + appName + '/cln/' + page2delete + '.html' );
		fse.removeSync( allAppsFolder + appName + clnPath + '/src-' + page2delete + '.js' );
		socket.emit('removePageResp', null);
	});
	
	// Handle update add node
	socket.on("addNode", function(appName, node) {
		var ClientFile = false;
		var ServerFile = false;
		var NpmModules = [];
		var depenFiles = [];
		var errTotal = '';

		// Copy js file to client
		fs.exists(allAppsFolder + appName + clnPath + clnNodesFolder + node.src + '.js', function (exists) {
		  if (!exists) {
				fse.copy(devNodesFolder + node.src + '.js', 
					allAppsFolder + appName + clnPath + clnNodesFolder + node.src + '.js', function(err) {
				  	ClientFile = true;
					  if (!err){
					  	testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
					  } else {
			    		err = '* Error copying client file ' + devNodesFolder + node.src + '.js' + '\n  ' + err;
			    		console.error(err);
			    		errTotal += err + '\n';
					  	testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
					  }
				})
			} else {
		  	ClientFile = true;
		  	testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
			}
		})

		// Copy js file to server
		if (node.type == "svr") {
			fs.exists(allAppsFolder + appName + svrPath + clnNodesFolder + node.src + '.js', function (exists) {
			  if (!exists) {
					fse.copy(devNodesFolder + node.src + '.js', 
						allAppsFolder + appName + svrPath + clnNodesFolder + node.src + '.js', function(err) {
						ServerFile = true;
					  if (!err) {
				  		testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
					  	Send2App(appName, "addNodeSvr", node);
					  } else {
			    		err = '* Error copying server file ' + devNodesFolder + node.src + '.js' + '\n  ' + err;
			    		console.error(err);
			    		errTotal += err + '\n';
					  	testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
					  }
					})
				} else {
					ServerFile = true;
		  		testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
					Send2App(appName, "addNodeSvr", node);
				}
			})
		} else {
			ServerFile = true;
		}
		
		// Dependencies: NPM & files
		if (node.depen) {
			// NPM
			if (node.depen.npm) {
				if (_.isArray(node.depen.npm)) {
					if (node.depen.npm.length > 0) {
			      NpmModules = node.depen.npm;
			      _.each(node.depen.npm, function(npm) {
							fs.exists(allAppsFolder + appName + nodeModules + npm, function(exists) {
								var ix = _.indexOf(NpmModules, npm);
					  		if (!exists) {
					  			var command = 'npm --prefix ' + allAppsFolder + appName + ' install ' + npm;
									shell.exec(command, function(errCode) {
										if (errCode) {
							    		var err = '* Error running command: ' + command;
							    		console.error(err);
							    		errTotal += err + '\n';
										}
										NpmModules.splice(ix, 1);
										testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
									})
					  		} else {
									NpmModules.splice(ix, 1);
			  					testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
					  		}
							})
			      })
			    }
				} else {
					NpmModules.push(node.depen.npm);
					var npm = node.depen.npm;
					fs.exists(allAppsFolder + appName + nodeModules + npm, function(exists) {
			  		if (!exists) {
			  			var command = 'npm --prefix ' + allAppsFolder + appName + ' install ' + npm;
							shell.exec(command, function(errCode) {
								if (errCode) {
					    		var err = '* Error running command: ' + command;
					    		console.error(err);
					    		errTotal += err + '\n';
								}
								NpmModules = [];
	  						testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
							});
			  		} else {
							NpmModules = [];
	  					testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
			  		}
					})
				}
			}

			// files
			if (node.depen.files) {
				if (_.isArray(node.depen.files)) {
					if (node.depen.files.length > 0) {
			      depenFiles = node.depen.files;
			      _.each(node.depen.files, function(file) {
							fs.exists(allAppsFolder + appName + clnLibs + file, function (exists) {
								var ix = _.indexOf(depenFiles, file);
					  		if (!exists) {
									fse.copy(srcLibs + file, 
										allAppsFolder + appName + clnLibs + file, function(err) {
									  if (!err) {
											depenFiles.splice(ix, 1);
					  					testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
									  } else {
							    		var err = '* Error copying dependency folder/file ' + file + '\n  ' + err;
							    		console.error(err);
							    		errTotal += err + '\n';
											depenFiles.splice(ix, 1);
									  	testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
									  }
									})
					  		} else {
									depenFiles.splice(ix, 1);
			  					testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
					  		}
							})
			      })
			    }
				} else {
		      depenFiles.push(node.depen.files);
					var file = node.depen.files;
					fs.exists(allAppsFolder + appName + clnLibs + file, function (exists) {
			  		if (!exists) {
							fse.copy(srcLibs + file, 
								allAppsFolder + appName + clnLibs + file, function(err) {
							  if (!err) {
									depenFiles = [];
			  					testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
							  } else {
					    		err = '* Error copying dependency folder/file ' + file + '\n  ' + err;
					    		console.error(err);
					    		errTotal += err + '\n';
									depenFiles = [];
							  	testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
							  }
							})
			  		} else {
							depenFiles = [];
	  					testLoaded(errTotal, ClientFile, ServerFile, NpmModules, depenFiles, node.id);
			  		}
					})
				}
			}
		}
	});
	
	function testLoaded(err, ClientFile, ServerFile, NpmModules, depenFiles, id)	{
    if (ClientFile && ServerFile && NpmModules.length == 0 && depenFiles.length == 0) {
			socket.emit('addNodeResp', err, id);
    }
  };

	// Handle update remove node
	socket.on("removeNodeSvr", function(appName, id) {
		Send2App(appName, "removeNodeSvr", id);
	});

	// Handle update add edge
	socket.on("addEdgeSvr", function(appName, edge) {
		Send2App(appName, "addEdgeSvr", edge);
	});

	// Handle update remove edge
	socket.on("removeEdgeSvr", function(appName, edge) {
		Send2App(appName, "removeEdgeSvr", edge);
	});

	// Handle update save new state
	socket.on("saveToState", function(appName, data) {
		Send2App(appName, "saveToState", data);
	});

	function Send2App(appName, event, data)	{
		if (devPort[appName]) {
			var client = net.connect({port: devPort[appName]}, function() { //'connect' listener
		  	var info = {
		  		'appname': appName,
		  		'event': event,
		  		'data': data
		  	};
		  	client.write(JSON.stringify(info), function() { client.end() });
			});

			client.on('error', function(e) {})
		}
	};

	// Handle disconnects
	socket.on('disconnect', function(data) {
		// TODO
	});
});

// Start Express
console.log("beFlow developer server ready!");
