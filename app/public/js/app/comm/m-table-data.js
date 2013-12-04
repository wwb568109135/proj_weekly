/*
 * Copyright 2013, Tgideas.qq.com
 * Creator: Sonic
 * Date: 2013-08-06
 * Modify: 2013-08-06
 */


(function(){
  /* commInitDomReady
  ----------------------------------------------------------------------------------*/
  function commInitDomReady(){
    /* .m-table-data 通用事件
    -----------------------------------------*/
    //- tr hover 变色  ----
    if($("table.m-table-data").html()){
      $("table.m-table-data").delegate("tr", "mouseover", function() {
        var _self = $(this);
        _self.addClass("table-hover");
      });
      $("table.m-table-data").delegate("tr", "mouseout", function() {
        var _self = $(this);
        _self.removeClass("table-hover");
      });
    }

    //- select.editinput 选择事件 ----
    $("table.m-table-data").delegate("select.editinput","change",function(){
      var _self = $(this);
      if( _self.attr("name") == "editDirection" && _self.val() == "其它" ){
        // 备注下拉选项，选中其它说明时，单独处理
        _self.siblings('input').removeClass('hidden').addClass('block');
      }else{
        _self.parent().find("input[type='hidden']").val(_self.val());
        _self.parent().trigger('dblclick');//- 让它所在的td执行一次双击事件
      }

    })

    //- select.editinput 回车事件 ----
    $("table.m-table-data").delegate("input.editinput","keydown",function(e){
      var key = e.which;
      if (key == 13) {
        $(this).parent().trigger('dblclick');
      }
    })

     //- input.date-picker 日期重选后自动保存事件 ----
    $("table.m-table-data").delegate("input.date-picker","change",function(e){
        $(this).parent().trigger('dblclick');
    })
  }

  $(commInitDomReady);
})()

