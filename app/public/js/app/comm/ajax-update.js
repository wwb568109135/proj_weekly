/*
 * Copyright 2013, Tgideas.qq.com
 * Creator: Sonic
 * Date: 2013-09-29
 * Modify: 2013-09-29
 */

var appAjax = (function(){
  
  /**
   * 返回AJAX反馈信息并在屏幕打印显示
   * @param  {string} msg
   * @return {func}
   */
  function callbackMsg(msg){
    var $ajaxCallbackMsg = $("#ajaxCallbackMsg");
        $ajaxCallbackMsg.html(msg).addClass('msg-show');
    setTimeout(function(){$ajaxCallbackMsg.removeClass('msg-show')},2000)
  };

  /**
   * AJAX更新表单内容
   * @param  {object} e (td object)
   * @param  {string} dbCollection
   * @return {func}
   */
  function update(e,dbCollection){
    if( e && dbCollection ){
      var dbCollection = dbCollection,
          _id = e.parent("tr").find("span[data-name='_id']").html(),
          fieldName = e.find(".editable").attr("data-name"),
          fieldValue = e.find(".editableval").val() || e.find(".editable").html(),
          postAjaxUrl = "/comm-ajaxUpdate?dbCollection="+dbCollection+"&id="+_id+"&fieldName="+fieldName+"&fieldValue="+fieldValue;
    }
    console.log('postAjaxUrl :' + postAjaxUrl);
    $.ajax({
      type: "POST",
      url: postAjaxUrl
    }).done(function( msg ) {
      callbackMsg(msg);
    }).fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
  }

  /* 供闭包外部使用的方法
  -------------------------------------*/
  return{
    callbackMsg : function(msg){ showAjaxCallbackMsg(msg) },
    update : function(e,dbCollection){ update(e,dbCollection) }
  }

})()


