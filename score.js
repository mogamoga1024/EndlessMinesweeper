// Scoreクラス
// ENDLESSモード時にスコアを管理します。
let Score = function() {
	this.score = 0;
};

// 画面に今のスコアを表示します。
Score.prototype.display = function() {
	if (this.score > 99999) this.score = 99999;
	$("#score").text(this.score + "pt");
};

// マスが掘られた際に、レベルに応じてポイントを加算します。
Score.prototype.addDigScore = function(level) {
	switch (level) {
		case EASY:   this.score += 1; break;
		case NORMAL: this.score += 3; break;
		case HARD:   this.score += 5; break;
		case TAXING: this.score += 8; break;
	}
};

// 個別のフィールドをクリアした際に、レベルに応じてポイントを加算します。
Score.prototype.addClearScore = function(level) {
	switch (level) {
		case EASY:   this.score += 500;  break;
		case NORMAL: this.score += 800;  break;
		case HARD:   this.score += 2500; break;
		case TAXING: this.score += 5000; break;
	}
};

Score.prototype.getScore = function() {
	return this.score;
};