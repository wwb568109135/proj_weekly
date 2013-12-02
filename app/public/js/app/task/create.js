// Task Create all func
(function(){
      var isReturn = false;

      //- 表单非空检测
      function checkCreateForm(){
        var errorInput = 0;
        var dataTD = $("#taskCreateForm .data-line input, #taskCreateForm .data-line select");
        dataTD.each(function(index, el){
          if(el.value == ""){
            //- console.log(el);
            $(this).parent("td").addClass("error");
            errorInput += 1;
          }else{
            $(this).parent("td").removeClass("error");
          }
        })
        console.log("errorInput:"+ errorInput);
        if(errorInput == 0 ){  isReturn = true }
      }

      function onDomReady(){
        //- current nav 
        $(".nav-ul li").eq(1).addClass("current");

        //- jQuery UI datepicker 
        $('.date-picker').datepicker({ dateFormat: "yy-mm-dd" });

        //- Setting the value of checkbox to true or false
        $( "#taskCreateForm" ).delegate( "input[name='focus']", "change", function() {
          if($(this).attr('checked')){
              $(this).val('true');
           }else{
              $(this).val('false');
           }
        });

        //- select[name="type"] select func
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
              $("#insertTr").remove();              //- 删除 tr模板代码;
              $("input[name='pp-temp']").remove();  //- 提交前删除 input[name="data-temp-pp"]
            
              //- 表单数据处理成 [{},{},{}……] 的格式
              var data = $(this).serializeArray(),
                  data2 = [],
                  trNum = $(this).find("tr.data-line").length,
                  //- 重要，慎改！设定1行tr有多少个表单值；
                  objectNum = 12;
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
            
            // return isReturn;
            return false;
        });
      }
      $(onDomReady);
    })()