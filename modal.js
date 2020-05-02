
$("#history").click(function() {
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

