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
   * Ajax修改需求单,记录进修改历史
   * @param  {object} o ajaxupdata object
   * @param  {function} Callback Function
   * @return {funcion}
   */
  function tasksModifyRecord(o){
    if( o ){
      var editObj = {};
          editObj.task = o.id,
          editObj.modify = [];
          
      delete o.id;
      delete o.dbCollection;
      for( prop in o ){
        var mm = {};
            mm.edate = new Date(),
            mm.editor = $("#userRtx").html(),
            mm.efield = prop,
            mm.evalue_after = o[prop];
        editObj.modify.push(mm);
      }

      console.dir(editObj);

      $.ajax({
        type: "POST",
        url: "/tasksHistoryCreate",
        data : editObj
      }).done(function( msg ) {
        // alert("修改记录成功！")
      }).fail(function(jqXHR, textStatus) {
        // alert( "修改记录失败：" + textStatus );
      });
    }
  };


  /**
   * Ajax修改当前状态,联动修改百分比 2013-12-19
   * @param  {object} o ajaxupdata object
   * @param  {function} Callback Function
   * @return {funcion}
   */
  function syncProgress(o){
    if( o && o.status ){
      var pp = "";
      switch(parseInt(o.status)){
        case 0:
          pp = "0";
          break;
        case 1:
          pp = "40";
          break;
        case 2:
          pp = "90";
          break;
        case 3:
          pp = "100";
          break;
      }
      o.progress = pp;
    }
    return o;
  };
  

  /**
   * AJAX删除附件/评论 
   * author：v_xhshen
   * time: 2014-01-14
   */
  function updateDel(o,callback){
    if( o ){

      console.log(o);
      $.ajax({
        type: "POST",
        url: "/comm-ajaxUpdateDel",
        data : o
      }).done(function( msg ) {
        callbackMsg(msg);
		if (callback){ (callback)(); }
      }).fail(function(jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      });
    }
  };
  
  /**
   * AJAX编辑评论 
   * author：v_xhshen
   * time: 2014-01-14
   */
  function commentUpdateEdit(o,callback){
    if( o ){
      console.log(o);
      $.ajax({
        type: "POST",
        url: "/comm-ajaxUpdateCommetEdit",
        data : o
      }).done(function( msg ) {
        callbackMsg(msg);
		if (callback){ (callback)(); }
      }).fail(function(jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
      });
    }
  };


  /**
   * AJAX更新内容
   * @param  {object} o ajaxupdata object
   * @param  {function} Callback Function
   * @return {funcion}
   */
  function updateSet(o,callback){
    if( o && o.dbCollection ){
      
      // 如果是修改状态的，要同步更新进度
      if(o.status){  
        o = syncProgress(o);
        if(o.wrap){
          var objWrap = o.wrap,
              callback2 = function(){objWrap.parent("tr").find("span[data-name='progress']").html(o.progress);}
          delete o.wrap;
        }
      }
      
      if(o.wrap){delete o.wrap;}
      // console.log(o);
      $.ajax({
        type: "POST",
        url: "/comm-ajaxUpdateSet",
        data : o
      }).done(function( msg ) {
        callbackMsg(msg);
        if (callback){ (callback)(); }
        if (callback2){ (callback2)(); }
      }).fail(function(jqXHR, textStatus) {
        // alert( "Request failed: " + textStatus );
        console.log( "Request failed: " + textStatus );
      });

      if(o.dbCollection === "Weekly"){  // 如果是需求的修改，记录进需求修改历历
        tasksModifyRecord(o);
      }
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
        rolesText = ["未定义角色", "产品角色", "管理角色", "重构角色"];
        roleName = rolesText[parseInt(roles)];
        e.html(roleName);
        e.attr("data-roles",roles);
        //----- 如果角色未定义的话，调用 user.js 的弹出选择用户角色函数
        if( roles == "0" ){
          appUser.showUserRolesSelect();
        }

      }).fail(function(jqXHR, textStatus) {
        // alert( "Request failed: " + textStatus );
        console.log( "Request failed: " + textStatus );
      });
    }
  };


  /**
   * 获取所有的项目并填入slect框里
   * @param  {element} e select 元素
   * @param  {callback} callback function
   * @return {function}   ajax callback
   */
  function getProjects(e,callback){
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
          // console.log("插入option");
          e.append(insertHTML);
        }
        if(callback){
          (callback)();
        }
      }).fail(function(jqXHR, textStatus) {
        // alert( "Request failed: " + textStatus );
        console.log( "Request failed: " + textStatus );
      });
    }
  };


  /**
   * 获取所有的其它说明并填入slect框里
   * @param  {element} e select 元素
   * @return {function}   ajax callback
   */
  function getDirections(e){
    var eop = e.find("option");
    // console.log(eop.length);
    if (e && eop.length < 2 ) {
      var postAjaxUrl = "/comm-ajaxGetDirections";
      $.ajax({
        type: "POST",
        url: postAjaxUrl
      }).done(function( dir ) {
        if(dir){
          var insertHTML = "";
          for(var i = 0; i < dir.length; i++){
            insertHTML+= "<option value='"+ dir[i].name +"'>"+ dir[i].name +"</option>";
          }
          insertHTML+= "<option value='其它'>其它</option>";
          // console.log("插入option");
          e.append(insertHTML);
        }
      }).fail(function(jqXHR, textStatus) {
        // alert( "Request failed: " + textStatus );
        console.log( "Request failed: " + textStatus );
      });
    }
  };


  /* 供闭包外部使用的方法
  -------------------------------------*/
  return{
    callbackMsg : function(msg){ callbackMsg(msg) },
    updateSet : function(o,callback){ updateSet(o,callback) },
    getRoles : function(e,staffName){ getRoles(e,staffName) },
    getProjects : function(e,callback){ getProjects(e,callback) },
    getDirections : function(e){ getDirections(e) },
    updateDel : function(o,callback){ updateDel(o,callback) }
  }

})()


