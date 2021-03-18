// Timerクラス
// 時間の管理を行います。
// どこからでも、ひとつのタイマーを操作をしたいので、シングルトンです。
const Timer = (function() {
	let startTime;
	let timer;
	let instance;
	let sec;
	
	return {
		// 唯一のインスタンスを返します。
		getInstance: function() {
			$("#timer").text("0s");
			
			if (instance === undefined) {
				instance = {
					// startメソッド
					// 時間計測を開始します。
					// 呼び出し前にすでに計測開始されている場合は、
					// 一旦resetメソッドを実行して下さい。
					start: function() {
						startTime = (new Date()).getTime();
						let hms = "";
						timer = setInterval(function() {
							sec = Math.floor(((new Date()).getTime() - startTime) / 1000);
							// 359999s = 99h59m59s
							if (sec > 359999) sec = 359999;
							hms = secToHms(sec);
							$("#timer").text(hms);
						}, 1000);
					},
					// stopメソッド
					// 計測を終了します。
					// 画面に経過時間を表示させたいときに使います。
					stop: function() {
						clearInterval(timer);
					},
					// resetメソッド
					// 計測を終了し、画面に表示されている時間を"0s"に戻します。
					reset: function() {
						this.stop();
						$("#timer").text("0s");
					},
					getSec: function() {
						return sec;
					}
				};
			}
			
			return instance;
		}
	};
})();