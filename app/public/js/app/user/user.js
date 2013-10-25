// User all func
var appUser = (function(){
  //- 初始化 ------------------------------------------------------------------
  function initDomReady(){
    getUserRoles();
  };

  //- 获取用户的角色名 ----
  function getUserRoles(){
    var $userRolse = $("#userRoles"),
        staffName = $("#userRtx").html();
    if( $userRolse && staffName ){
      appAjax.getRoles($userRolse,staffName);
    }
  };

  //- 弹出层让用户选择角色 ----
  function showUserRolesSelect(){
    var $dialogSelectRoles = $(".dialog-select-roles");
    $dialogSelectRoles.addClass("md-show");
    bindUserRolesSelectEvent();    // 弹层事件绑定
  };

  //- 弹出层的事件绑定
  function bindUserRolesSelectEvent(){
    var $userRolesPD = $("#userRolesPD"),
        $userRolesRB = $("#userRolesRB"),
        $userRolesSet = $("#userRolesSet"),
        $userProject = $("#userProject"),
        $userGroup = $("#userGroup"),
        $selectRolesForm = $("#selectRolesForm");

    $userRolesPD.on("change",function(){
      console.log("userRolesPD selected");
      $userRolesSet.val(1);
      $userGroup.val(0);
      appAjax.getProjects($userProject);    //取project集合内容填入Select框
    })

    $userRolesRB.on("change",function(){
      console.log("userRolesRB selected");
       $userRolesSet.val(3);
      $userProject.val(0);
    })

    $selectRolesForm.on("submit",function(){
      console.log("selectRolesForm sumbit");
      var r = $userRolesSet.val(),
          p = $userProject.val(),
          g = $userGroup.val();
      // 非空检测
      if( r == 0 ){
        alert("请选择角色");
      }else if(r == 1 && p==0){
        alert("请选择您所负责的产品");
      }else if(r == 3 && g==0){
        alert("请选择组别");
      }else{
        console.log("选择正确！")

      }



      return false;
    })

  };


  /* 供闭包外部使用的方法
  -------------------------------------*/
  return{
    initDomReady : function(){ initDomReady() },
    getUserRoles : function(){ getUserRoles() },
    showUserRolesSelect : function(){ showUserRolesSelect() },
    bindUserRolesSelectEvent : function(){ bindUserRolesSelectEvent() }
  }

})()

appUser.initDomReady();
