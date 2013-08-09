/*
 * Copyright 2013, Tgideas.qq.com
 * Creator: Sonic
 * Date: 2013-08-06
 * Modify: 2013-08-06
 */

$(document).ready(function(){
	/* table tr hover
	----------------------------------*/
	if($(".m-table-data")){
		$(".m-table-data tr").hover(function(){
			$(this).addClass("table-hover");
		},function(){
			$(this).removeClass("table-hover");
		})

	}

	/* btn-append-task
	----------------------------------*/
	if($("#btnAppendTask")){
		$("#btnAppendTask").click(function(){
			var $taskCreateTable = $("#taskCreateTable");
			var appendHtml = $("#taskCreateTable tbody tr:last-child(callback)").html(),
				appendHtmlPro = "<tr>"+ appendHtml +"</tr>";
			$("#taskCreateTable tbody").append(appendHtmlPro);
		})


	}
})