
// ロード時処理とかいろいろ

// 選択したレベルで、画面を初期化します。
const init = function(level) {
	$(window).scrollTop(0);
	$window.off("scroll");
	$field.off("mousedown mouseup dblclick");
	$("td").off("mousedown mouseup dblclick");
	currentLevel = level;
	timer.reset();
	const minesweeper = MinesweeperFactory.create(level);
	minesweeper.start();
};

// tableタグ内での右クリックでメニューを表示させない。
$field.on("contextmenu",function(){
	return false;
});

// IEでスクロール時にカクつくのを防ぐ。
// https://souken-blog.com/2017/08/25/ie11-smoothscroll/
if(navigator.userAgent.match(/MSIE 10/i) ||
   navigator.userAgent.match(/Trident\/7\./) ||
   navigator.userAgent.match(/Edge\/12\./)) {
	$('body').on("mousewheel", function () {
		event.preventDefault();
		const wd = event.wheelDelta;
		const csp = window.pageYOffset;
		window.scrollTo(0, csp - wd);
	});
}

// ロード時処理 start

//localStorage.clear()

if (localStorage !== undefined && localStorage.getItem("recode") != null) {
	Recode.data = JSON.parse(localStorage.getItem("recode"));
}

const timer = Timer.getInstance();
let currentLevel = EASY;

init(currentLevel);

// ロード時処理 end

$("#face").click(function() {
	init(currentLevel);
});

$("#easy").click(function() {
	init(EASY);
});

$("#normal").click(function() {
	init(NORMAL);
});

$("#hard").click(function() {
	init(HARD);
});

$("#taxing").click(function() {
	init(TAXING);
});

$("#endless").click(function() {
	init(ENDLESS);
});

