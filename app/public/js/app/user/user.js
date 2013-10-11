// User all func
(function(){
  //- 初始化 ------------------------------------------------------------------
  function initDomReady(){
    var $userRolse = $("#userRoles"),
        staffName = $("#userRtx").html();
    console.log($userRolse)
    console.log(staffName)

    if( $userRolse && staffName ){
      appAjax.getRoles($userRolse,staffName);
    }
  }
  
  $(initDomReady);
})()