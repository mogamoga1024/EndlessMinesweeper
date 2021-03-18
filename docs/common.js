// 1msでも速い処理にしたいので、静的に存在し続けるDOMのjQueryオブジェクトを事前に作っておく。
const $window = $(window);
const $document = $(document);
const $field = $("#field");
const $minesCount = $("#minesCount");
const $score = $("#score");
const $face = $("#face");
const $timer = $("#timer");

// クリアとか死亡時の顔
const Face = {
	SMILE: "🙂",
	NEUTRAL: "😑",
	SUNGLASSES: "😎",
	DIZZY: "😵"
};

// ゲーム難易度
const EASY = 0;
const NORMAL = 1;
const HARD = 2;
const TAXING = 3;
const ENDLESS = 4;

// 難易度ごとのフィールドデータ（幅、高さ、地雷の密度、色=[red, green, blue]）
const fieldData = [
	/* EASY    */ {row: 9, col: 9, mpf: 0.13, colorData: [127, 191, 255]},
	/* NORMAL  */ {row: 16, col: 16, mpf: 0.16, colorData: [76, 140, 54]},
	/* HARD    */ {row: 16, col: 30, mpf: 0.208, colorData: [165, 150, 76]},
	/* TAXING  */ {row: 100, col: 30, mpf: 0.222, colorData: [56, 51, 44]},
	/* ENDLESS */ {row: 16, col: 30}
];

// colorData配列:[red, green, blue]に、透明度を加えて、文字列で表現されたrgbaを返す。
const rgba = function(colorData, opacity) {
	if (opacity === undefined) opacity = 1;
	return "rgba(" + colorData[0] + "," + colorData[1] + "," + colorData[2] + "," + opacity + ")";
};

// n秒を"(h)h(m)m(s)s"に変換します。
const secToHms = function(sec) {
	if (sec === null) return "-"
	
	let hms = "";
	const h = Math.floor(sec / 3600);
	const m = Math.floor(sec % 3600 / 60);
	const s = sec % 60;
	
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
const MinesweeperFactory = {
	create: function(level) {
		if (level === ENDLESS) {
			return new EndlessMinesweeper();
		}
		else {
			return new Minesweeper(level);
		}
	}
};

// 過去のクリアタイムなどをまとめたオブジェクト
const Recode = {
	data: [
		/* EASY    */ {
			ranking: [null, null, null],
			play: 0,
			win: 0
		},
		/* NORMAL  */ {
			ranking: [null, null, null],
			play: 0,
			win: 0
		},
		/* HARD    */ {
			ranking: [null, null, null],
			play: 0,
			win: 0
		},
		/* TAXING  */ {
			ranking: [null, null, null],
			play: 0,
			win: 0
		},
		/* ENDLESS */ {
			ranking: [0, 0, 0],
			play: 0
		}
	],
	setClearTimeRanking: function(level, sec) {
		const ranking = this.data[level].ranking;
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
		const ranking = this.data[ENDLESS].ranking;
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
	incPlayCount: function(level) {
		this.data[level].play++;
	},
	incWinCount: function(level) {
		this.data[level].win++;
	}
};