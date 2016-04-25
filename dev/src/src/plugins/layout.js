$( function() {

  var editor = CodeMirror.fromTextArea(document.getElementById("layout-editor"), {
    lineNumbers: true,
    mode: "text/html",
    matchBrackets: true
  });

  editor.setSize(null, "80%");

  beflow.editorAddNode = function(id){
    var node = '<div f="' + id + '"></div>';
    if ( editor.isClean() ){
      beflow.editorSetValue(node);
    } else{
      beflow.editorSetValue(editor.getValue() + "\n" + node);
    }
  }
  
  beflow.editorDelNode = function(id){
    var tmp = $( '<div>' + editor.getValue() + '</div>' );
    tmp.find('div').remove('div[f="' + id + '"]');
    beflow.editorSetValue(tmp.html());
  }

  beflow.editorSetValue = function(value){
    if (editor.getValue() != value){
      change = false;
      editor.setValue(value);
    }
  }

  beflow.editorGetValue = function(){
    return editor.getValue();
  }

  beflow.editorRefresh = function(){
    editor.refresh()
  }

  var change = true;
  editor.on("change", function(){
    if (change) {
      if (!beflow._waitApp) {
        beflow.shownGraph.changeLayout( editor.getValue() );
      }
    } else{
      change = true;
    }
  });
});