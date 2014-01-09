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


//评分
$('#taskVoteBtn').click(function(){
  $('.dialog-task-score').show();
});

$.each($('#task-score-form :radio'),function(key){
  $(this).change(function(){
  if($(this).attr('checked')){
    $('#task-score-form h4').eq(0).html('此需求已完,评分：<b>' + $(this).val() + '</b>分')
     .after($('<a class="m-btn btn-skin-4" id="resetscore" href="javascript:">重新打分</a>'));
    $('#task-score-form .score-list').hide();

    $('#task-score-form #resetscore').click(function(){
      $('#task-score-form .score-list').show();
      $('#task-score-form h4').eq(0).html('请您为本次需求服务评分');
      $(this).remove();
    });

    input.m-btn.btn-skin-4(type='reset', value='提交评分')
  }
  });
})

var iframestr = '#{weekly.content}';
iframestr = iframestr.replace(/&lt;/g,'<');
iframestr = iframestr.replace(/&gt;/g,'>');

document.getElementById('contentIframe').style.height = $('.task-detail-content').innerHeight()+'px';
//$('#contentIframe').css('height',$('.task-detail-content').innerHeight());
document.getElementById('contentIframe').contentWindow.document.getElementsByTagName('body')[0].innerHTML= iframestr;

$('#task-score-form').submit(function(){
  var $radios = $('#task-score-form :radio:checked');
  if(!$radios.length){
    $('#task-score-form :submit').after($('<h4 id="noticeh4"><b>请您为本次需求服务评分后再提交</b></h4>'));
    var ttimeout = setTimeout(function(){$('#noticeh4').remove();},1500);
    return false;
  } else{
    $('#task-score-form h4').eq(1).text();
    return ture;
  }    
});


//评论    
$('#commentarea').focus(function(){
  $(this).val('');
});

var myeditor2 = TFL.editor({"id":"commentarea","width":"65%","height":"128px","name":"task[content]","showRelativePath":false,"mode":1});  