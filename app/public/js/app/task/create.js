// Task Create all func
(function(){
      var isReturn = false;

      //- 表单非空检测
      function checkCreateForm(){
        var errorInput = 0;
        var dataTD = $("#taskCreateForm .data-line input:enabled, #taskCreateForm .data-line select:enabled");
        dataTD.each(function(index, el){
          if(el.value == ""){
            // console.log(el);
            $(this).parent("td").addClass("error");
            errorInput += 1;
          }else{
            // $(this).parent("td").removeClass("error");
            var sb = $(this).siblings("input:enabled, select:enabled");
            if(sb.length > 0){
              console.log(sb.length);
              sb.each(function(){
                $(this).parent("td").addClass("error");
                if($(this).val() == ""){return false}
                $(this).parent("td").removeClass("error");
              })
            }else{
              $(this).parent("td").removeClass("error");
            }
          }
        })
        console.log("errorInput:"+ errorInput);
        if(errorInput == 0 ){  isReturn = true }
      }

      function onDomReady(){
        //- current nav 2013-12-03
        $(".nav-ul li").eq(1).addClass("current");

        //- jQuery UI datepicker 
        $('.date-picker').datepicker({ dateFormat: "yy-mm-dd" });

        //- Setting the value of checkbox to true or false
        $("#taskCreateForm").delegate( "input[name='focus']", "change", function() {
          if($(this).attr('checked')){
              $(this).val('true');
           }else{
              $(this).val('false');
           }
        });

        // 填充备注的下载框和事件 2013-12-03
        var $directionSelect = $("select.select-direction");
        // console.log($directionSelect)
        if($directionSelect.length > 0 ){
          $directionSelect.each(function(){
            appAjax.getDirections($(this));
          })
        }
        $("#taskCreateForm" ).delegate("select.select-direction", "change", function() {
          var _self = $(this),
              _selfTr = $(this).parents("tr.data-line"),
              _selfInput = _self.siblings("input.input-direction");
          if(_self.val() =="其它" ){
            _selfInput.removeClass('hidden');
            _selfInput.attr("name","direction")
            _self.attr("name","")
          }else{
            _selfInput.addClass('hidden');
            _selfInput.attr("name","").val(" ");
            _self.attr("name","direction");
            // 选中排期中/重构中/联调中/已上线时。当前状态与进度百分比的联动 2013-12-21
            if(_self.val() =="重构中"){
              _selfTr.find("input[name='status']").val(1);
              _selfTr.find("input[name='progress']").val(40);
            }
            if(_self.val() =="联调中"){
              _selfTr.find("input[name='status']").val(2);
              _selfTr.find("input[name='progress']").val(90);
            }
            if(_self.val() =="已上线"){
              _selfTr.find("input[name='status']").val(3);
              _selfTr.find("input[name='progress']").val(100);
            }
          }
          


        });


        //- select[name="type"] select func 2013-12-02
        $("select[name='type']").bind("change",function(){
        	var _self = $(this),
        		_selfVal = _self.val();
        	var insertTrTaskTitle = $("#insertTr").find("select[name='type']");
        	insertTrTaskTitle.find("option").each(function(index, el){
        		var v = $(this).attr('value');
        		if( v == _selfVal ){
        			$(this).attr("selected","selected");
        		}
        	})
        })

        // CP check box func 2013-12-03
        $("#taskCreateForm").delegate("input[name='isCP']", "change", function(){
          var _selfCheck = $(this).attr("checked");
              _selfTr = $(this).parents("tr.data-line");
          if(_selfCheck){  //选中时
            // _selfTr.find('input[name="pp"]').attr("disabled",true).val("CP");
            var v = _selfTr.find('input[name="pp"]').val(),
                v = "CP;" + v.replace(/CP;?/,"");
            _selfTr.find('input[name="pp"]').val(v);
            // _selfTr.find('input[name="pm"]').attr("disabled",true).val("CP");

          }else{            //未选中时
            var v = _selfTr.find('input[name="pp"]').val(),
                v = v.replace(/CP;?/,"");
            _selfTr.find('input[name="pp"]').val(v);
            // _selfTr.find('input[name="pm"]').attr("disabled",false).val("");
          }
        })

        //- add one line form ------------------------
        $("#btnAppendTask").click(function(){
          var $taskCreateTable = $("#taskCreateTable"),
              randomNum = Math.floor((Math.random()*10000));
              // console.log(randomNum);
          //- var appendHtml = $("#taskCreateTable tbody tr:last-child(callback)").html(),
          var appendHtml = $("#insertTr").html(),
              appendHtmlModi = appendHtml.replace(/task--/g ,"task" ),
              appendHtmlModi = appendHtmlModi.replace(/date-picker-insert/g ,"date-picker-in" ),
              appendHtmlModi = appendHtmlModi.replace(/--x--/g ,randomNum ),
              appendHtmlPro = "<tr class='data-line'>"+ appendHtmlModi +"</tr>";
          $("#taskCreateTable tbody").append(appendHtmlPro);
          //- console.log("inset one line");
          $('.date-picker-in').datepicker({ dateFormat: "yy-mm-dd" });

          //- 插入条数记数
          //- var $recordNum = $('#recordNum');
          //- $recordNum.val(parseInt($recordNum.val())+1)
          //- console.log($recordNum.val());
        })

        //- add one line form ------------------------
        $(".task-create-table").delegate(".link-delete-task","click",function(){
          var _self = $(this);
              _selfTr = _self.parents("tr");
              _selfTr.remove();
        })

        //- Submit func ------------------------
        $("#taskCreateForm").on('submit',function(e){
            checkCreateForm();
            
            //- 提交前的表单数据处理
            if(isReturn){ 
              //- 锁定提交按钮
              $(this).find(".btn-submit").val("已提交").removeClass("btn-skin-1").addClass("btn-skin-3").attr("disabled",true);

              $("#insertTr").remove();              //- 删除 tr模板代码;
              //- 提交前删除 input[name="data-temp-pp"] input[name="pm-temp"] input[name='isCP']
              $("input[name='pp-tmp'], input[name='pm-tmp'], input[name='isCP']").attr("disabled",true);;
              $("input[name='pp'], input[name='pm']").attr("disabled",false);

              //- 表单数据处理成 [{},{},{}……] 的格式
              var data = $(this).serializeArray(),
                  data2 = [],
                  trNum = $(this).find("tr.data-line").length,
                  //- 重要，慎改！设定1行tr有多少个表单值；
                  objectNum = 14;
              for(var j = 1 ; j<=trNum; j++ ){
                var dd = {},
                    star = (j-1)*objectNum;
                for( var i = star; i<j*objectNum; i++ ){
                  dd[data[i].name] = data[i].value;
                }
                data2.push(dd);
              }
              //- console.dir(data)
              console.dir(data2);

              //- 数据json化(使用jquery.json插件)
              data2 = $.toJSON( data2 )

              //- 数据存入textarea里
              $("#outputTemp").val(data2);
            }
            
            return isReturn;
            // return false;
        });
      }
      $(onDomReady);
    })()