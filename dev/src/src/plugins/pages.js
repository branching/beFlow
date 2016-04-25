$( function () {

  var template = $(
    '<div>'+
      '<div class="listing">'+
        '<div class="servercolor">'+
          '<label style="vertical-align:middle">SERVER</label>'+
          '<input type="color" style="vertical-align:middle;margin-left:10px" value="#FFFFCC" ></input>'+
        '</div>'+
        '<div class="controls">'+
          '<form class="addpage">'+
            '<input class="addpageinput" placeholder="input page name" type="text" />'+
            '<button class="addpagesubmit icon-ok" type="button">add</button>'+
          '</form>'+
        '</div>'+
      '</div>'+
    '</div>'
  );

  // Add menu
  beflow.addMenu("pages", template, "icon-doc");

  beflow.addPage = function(page){
    template.find('.listing').append(page);
  };
  
  beflow.setServerColor = function(value){
    template.find("input[type='color']").prop('value', value);
  };

  template.find("input[type='color']").change(function(){
    Mousetrap.pause();
    beflow.shownGraph.color($( this ).prop('value'));
    Mousetrap.unpause();
  });
  
  // Form submit action
  template.find(".addpage").click(function(){
    
    var addpageInput = template.find(".addpageinput");
    
    var pageName = addpageInput.val();
    if (pageName) {
      var oldpage = beflow.shownGraph.attributes.pages.getByName(pageName);
      
      if (!oldpage) { // create page
        var newpage = { name: pageName, checked: "checked", layout: "", color: beflow.shownGraph.getNodeColor() };
        newpage.parentGraph = beflow.shownGraph;
        var page = new beflow.Page(newpage);
        beflow.shownGraph.addPage(page);
        page.view.change();
      } else {
        oldpage.view.select();
      }
      
      beflow.trigger("addPage", pageName, beflow.shownGraph);
    }

    addpageInput.val("");
  });
});
