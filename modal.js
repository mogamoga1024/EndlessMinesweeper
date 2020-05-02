
$("#history").click(function() {
	if (localStorage === undefined) {
		alert("現在のブラウザでは、この機能を利用できません。\nGoogle Chromeなどのブラウザでは利用可能です。");
		return false;
	}

	$("#modal-container").fadeIn("slow");
	$("#modal-content").fadeIn("slow");
	return false;
});

$("#modal-container").click(function(event) {
	if (event.target.id === 'modal-container') {
		$("#modal-container").fadeOut("slow");
		$("#modal-content").fadeOut("slow");
	}
});

