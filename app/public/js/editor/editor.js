var myeditor = TFL.editor({"id":"taskDescription","width":"630px","height":"300px","name":"task[content]","showRelativePath":false});

//附件添加按钮
var nnm=2;
$('.task-attachment-form li.add a').click(function(){
  nnm++;
  var htmle = $("<li><input type='file' class='inp-file' name='accessory" + nnm + "'><label class='inline'>附件说明：</label><input class='m-input inp-txt' type='text' name='accessoryditail" + nnm + "' /><a class='dela' href='javascript:#'>删除</a></li>");
  
  $(this).parent().before(htmle);
  delfun();
});

delfun();

function delfun(){
  var lias =$('ul.task-attachment-form li .dela');
  $.each(lias, function(key){
	  $(this).click(function(){
	    $(this).parent().remove()
	  })
  })
}
