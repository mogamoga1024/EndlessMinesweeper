// オシャンティーなプルダウンです。

$("li[class!='selected']").hide();

$("ul").mouseenter(function() {
	$("li[class='selected']").css("border-bottom-width", 0);
	$("li").stop().slideDown(200);
});

$("ul").mouseleave(function() {
	$("li[class!='selected']").stop().slideUp(200,
		function() {
			$("li[class='selected']").css("border-bottom-width", "1px");
		}
	);
});

$("li").click(function() {
	$(".selected").removeClass("selected");
	$(this).addClass("selected");
	$("li[class!='selected']").stop().slideUp(200,
		function() {
			$("li[class='selected']").css("border-bottom-width", "1px");
		}
	);
});