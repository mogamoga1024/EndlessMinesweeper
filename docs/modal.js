
$("#history").click(function() {
	if (localStorage === undefined) {
		alert("現在のブラウザでは、この機能を利用できません。\nGoogle Chromeなどのブラウザでは利用可能です。");
		return false;
	}

	$(".record").each(function(level) {
		const $this = $(this)

		if (level !== ENDLESS) {
			$this.children(".first").text(secToHms(Recode.data[level].ranking[0]));
			$this.children(".second").text(secToHms(Recode.data[level].ranking[1]));
			$this.children(".third").text(secToHms(Recode.data[level].ranking[2]));
			$this.children(".play-count").text(Recode.data[level].play);
			$this.children(".win-count").text(Recode.data[level].win);
		}
		else {
			$this.children(".first").text(Recode.data[level].ranking[0] + "pt");
			$this.children(".second").text(Recode.data[level].ranking[1] + "pt");
			$this.children(".third").text(Recode.data[level].ranking[2] + "pt");
			$this.children(".play-count").text(Recode.data[level].play);
		}
	});

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

