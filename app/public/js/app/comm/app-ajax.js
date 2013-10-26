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
   * AJAX更新内容
   * @param  {object} o ajaxupdata object
   * @param  {function} callback Callback Function
   * @return {funcion}
   */
  function updateSet(o,callback){
    if( o && o.dbCollection ){
      $.ajax({
        type: "POST",
        url: "/comm-ajaxUpdateSet",
        data : o
      }).done(function( msg ) {
        if(callback){
          callbackMsg(msg);
          (callback)();
        }else{
          callbackMsg(msg);
        }
      }).fail(function(jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      });
    }
  };


  /**
   * 通过过传入英文名去获取用户的role名字
   * @param  {element} e         显示角色名的element
   * @param  {object} staffName 用户英文名
   * @return {function}           
   */
  function getRoles(e,staffName){
    if(e && staffName){
      postAjaxUrl = "/comm-ajaxGetRoles?staffName="+staffName;
      $.ajax({
        type: "POST",
        url: postAjaxUrl
      }).done(function( roles ) {
        // console.log(roles);
        e.html(roles);
        //----- 如果角色未定义的话，调用 user.js 的弹出选择用户角色函数
        if( roles == "角色未定义" ){
          appUser.showUserRolesSelect();
        }

      }).fail(function(jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      });
    }
  };


  /**
   * 获取所有的项目并填入slect框里
   * @param  {element} e select 元素
   * @return {function}   alax callback
   */
  function getProjects(e){
    var eop = e.find("option");
    // console.log(eop.length);

    if (e && eop.length < 2 ) {
      var postAjaxUrl = "/comm-ajaxGetProjects";
      $.ajax({
        type: "POST",
        url: postAjaxUrl
      }).done(function( pj ) {
        if(pj){
          var insertHTML = "";
          for(var i = 0; i < pj.length; i++){
            insertHTML+= "<option value='"+ pj[i].id +"'>"+ pj[i].name +"</option>";
          }
          console.log("插入option");
          e.append(insertHTML);
        }

      }).fail(function(jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      });
    }

  };


  /* 供闭包外部使用的方法
  -------------------------------------*/
  return{
    callbackMsg : function(msg){ callbackMsg(msg) },
    updateSet : function(o,callback){ updateSet(o,callback) },
    getRoles : function(e,staffName){ getRoles(e,staffName) },
    getProjects : function(e){ getProjects(e) }
  }

})()


