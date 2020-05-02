// 1msでも速い処理にしたいので、静的に存在し続けるDOMのjQueryオブジェクトを事前に作っておく。
let $window = $(window);
let $document = $(document);
let $field = $("#field");
let $minesCount = $("#minesCount");
let $score = $("#score");
let $face = $("#face");
let $timer = $("#timer");

// クリアとか死亡時の顔
let Face = {
	SMILE: "🙂",
	NEUTRAL: "😑",
	SUNGLASSES: "😎",
	DIZZY: "😵"
};

// ゲーム難易度
let EASY = 0;
let NORMAL = 1;
let HARD = 2;
let TAXING = 3;
let ENDLESS = 4;

// 難易度ごとのフィールドデータ（幅、高さ、地雷の密度、色=[red, green, blue]）
let fieldData = [
	/* EASY    */ {row: 9, col: 9, mpf: 0.13, colorData: [127, 191, 255]},
	/* NORMAL  */ {row: 16, col: 16, mpf: 0.16, colorData: [76, 140, 54]},
	/* HARD    */ {row: 16, col: 30, mpf: 0.208, colorData: [165, 150, 76]},
	/* TAXING  */ {row: 100, col: 30, mpf: 0.222, colorData: [56, 51, 44]},
	/* ENDLESS */ {row: 16, col: 30}
];

// debug
/*let fieldData = [
	{row: 9, col: 9, mpf: 0.1, colorData: [127, 191, 255]},
	{row: 16, col: 16, mpf: 0.1, colorData: [76, 140, 54]},
	{row: 16, col: 30, mpf: 0.1, colorData: [165, 150, 76]},
	{row: 100, col: 30, mpf: 0.1, colorData: [56, 51, 44]},
	{row: 5, col: 10}
];*/

// colorData配列:[red, green, blue]に、透明度を加えて、文字列で表現されたrgbaを返す。
let rgba = function(colorData, opacity) {
	if (opacity === undefined) opacity = 1;
	return "rgba(" + colorData[0] + "," + colorData[1] + "," + colorData[2] + "," + opacity + ")";
};

// n秒を"(h)h(m)m(s)s"に変換します。
let secToHms = function(sec) {
	let hms = "";
	let h = Math.floor(sec / 3600);
	let m = Math.floor(sec % 3600 / 60);
	let s = sec % 60;
	
	if (h !== 0) {
		hms = h + "h" + m + "m" + s + "s";
	} else if (m !== 0) {
		hms = m + "m" + s + "s";
	} else {
		hms = s + "s";
	}
	
	return hms;
};

// レベルに対応するマインスイーパオブジェクトを返す。
let MinesweeperFactory = {
	create: function(level) {
		if (level === ENDLESS) {
			return new EndlessMinesweeper();
		}
		else {
			return new Minesweeper(level);
		}
	}
};

let Recode = {
	data: [
		/* EASY    */ {
			ranking: [null, null, null],
			win: 0,
			lose: 0
		},
		/* NORMAL  */ {
			ranking: [null, null, null],
			win: 0,
			lose: 0
		},
		/* HARD    */ {
			ranking: [null, null, null],
			win: 0,
			lose: 0
		},
		/* TAXING  */ {
			ranking: [null, null, null],
			win: 0,
			lose: 0
		},
		/* ENDLESS */ {
			ranking: [null, null, null]
		}
	],
	setClearTimeRanking: function(level, sec) {
		let ranking = this.data[level].ranking;
		if (ranking[0] === null) {
			ranking[0] = sec;
			return;
		}
		else if (sec < ranking[0]) {
			ranking.splice(0, 0, sec);
			ranking.pop();
		}
		else if (ranking[1] === null) {
			ranking[1] = sec;
			return;
		}
		else if (sec < ranking[1]) {
			ranking.splice(1, 0, sec);
			ranking.pop();
		}
		else if (ranking[2] === null) {
			ranking[2] = sec;
			return;
		}
		else if (sec < ranking[2]) {
			ranking.splice(2, 0, sec);
			ranking.pop();
		}
	},
	setScoreRanking: function(score) {
		let ranking = this.data[ENDLESS].ranking;
		if (ranking[0] === null) {
			ranking[0] = score;
			return;
		}
		else if (score > ranking[0]) {
			ranking.splice(0, 0, score);
			ranking.pop();
		}
		else if (ranking[1] === null) {
			ranking[1] = score;
			return;
		}
		else if (score > ranking[1]) {
			ranking.splice(1, 0, score);
			ranking.pop();
		}
		else if (ranking[2] === null) {
			ranking[2] = score;
			return;
		}
		else if (score > ranking[2]) {
			ranking.splice(2, 0, score);
			ranking.pop();
		}
	},
	incWinCount: function(level) {
		this.data[level].win++;
	},
	incLoseCount: function(level) {
		this.data[level].lose++;
	}
};