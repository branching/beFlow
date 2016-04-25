$( function () {

  var template = $(
    '<div>'+
      '<div class="listing">'+
        '<div class="controls">'+
          '<form class="addbyurl">'+
            '<input class="addbyurlinput" name="addbyurlinput" placeholder="search by name" type="text" />'+
            '<button class="addbyurlsubmit icon-ok" type="button">load</button>'+
          '</form>'+
        '</div>'+
      '</div>'+
    '</div>'
  );

  // Add menu
  beflow.addMenu("nodes", template, "icon-cog");

  var modulesAll = [];
  beflow.loadLibrary = function (library) {

    var autocompleteData = [];

    var accordion = $("<div></div>");

    for (var category in library) {
      if (!library.hasOwnProperty(category)){continue;}
      var section = $('<div class="library-section"></div>');

      // section title
      section.append( $('<h3><a href="#">'+category+"</a></h3>") );

      // section items
      var sectionDiv = $("<div></div>");
      var modules = library[category];
      for (var i = 0; i<modules.length; i++) {
        var module = new beflow.Module(modules[i]);
        // this.Library.add(module);

        module.initializeView();
        sectionDiv.append(module.view.$el);

        var autocompleteDataItem = {
          value: module.get("src"),
          label: module.get("info").title + " - " + module.get("info").description + " - " + module.get("src"),
          title: module.get("info").title,
          description: module.get("info").description + " - " + module.get("src")
        };
        autocompleteData.push(autocompleteDataItem);
        modulesAll.push({
          src: module.get("src"),
          size: module.get("size")
        });
      }
      section.append( sectionDiv );
      accordion.append( section );
    }

    template.find('.listing').append(accordion);
    accordion.children(".library-section")
      .accordion({
        animate: false,
        header: "h3",
        heightStyle: "content",
        collapsible: true,
        active: false
      });

    template.find('.addbyurlinput')
      .autocomplete({
        minLength: 1,
        source: autocompleteData,
        select: function( event, ui ) {
          _.defer(function(){
            addByUrl();
          });
        }
      })
      .data( "ui-autocomplete" )._renderItem = function( ul, item ) {
        // Custom display
        return $( "<li>" )
          .append( '<a><span style="font-size:120%;">' + item.title + "</span><br>" + item.description + "</a>" )
          .appendTo( ul );
      };
  };

  var addByUrl = beflow.addByUrl = function() {
    var addByUrlInput = beflow.$(".addbyurlinput");
    addByUrlInput.blur();

    var url = addByUrlInput.val();
    if (url !== "") {
      for (var i=0; i<modulesAll.length; i++) {
        var m = modulesAll[i];
        if (m.src == url) {
          var graphEl = beflow.$(".graph");
          
          if ((beflow.shownGraph.get("info")["location"].x + 100) > graphEl.width() || 
            (beflow.shownGraph.get("info")["location"].y + 100) > graphEl.height()) {
            
            beflow.shownGraph.get("info")["location"].x = 100;
            beflow.shownGraph.get("info")["location"].y = 100
          }
          else {
            beflow.shownGraph.get("info")["location"].x += 50;
            beflow.shownGraph.get("info")["location"].y += 50
          }
          
          beflow.shownGraph.addNode({
            "src": url,
            "x": beflow.shownGraph.get("info")["location"].x + graphEl.scrollLeft(),
            "y": beflow.shownGraph.get("info")["location"].y + graphEl.scrollTop(),
            "w": m.size.w,
            "h": m.size.h,
            "page": beflow.shownGraph.attributes.pages.getSelected().get("name")
          });
          addByUrlInput
            .val("")
            .attr("placeholder", "loading...");
          window.setTimeout(function(){
            addByUrlInput
              .attr("placeholder", "search or url");
          }, 1000);
          break;
        };
      };
    };
    return false;
  };

  // Form submit action
  template.find(".addbyurl").click(function(){
    addByUrl();
    return false;
  });

} );
