// Minesweeperクラス
// 使用者はstartメソッドを呼ぶだけでいいです。
let Minesweeper = function(level) {
	this.level = level;
	this.rowSize = fieldData[level].row;
	this.colSize = fieldData[level].col;
	this.field = [];
	this.fieldColorData = fieldData[level].colorData;
	this.minesMaxCount = Math.floor(this.rowSize * this.colSize * fieldData[level].mpf);
	this.safeCellsCount = this.rowSize * this.colSize - this.minesMaxCount;
	// 画面に表示する推定地雷数（= 実際の地雷の数 - 旗を立てた数）
	this.remainingMinesCount = this.minesMaxCount;
	this.direction = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
	this.numberColor = {1: "blue", 2: "green", 3: "red", 4: "navy", 5: "brown", 6: "cyan", 7: "black", 8: "gray"};
	this.isDownLeft = false;
	this.state;
	this.WORKING = 0;
	this.DIED = 1;
	this.CLEAR = 2;
	this.isFirstLeftDown = true;
	this.timer = Timer.getInstance();
	
	// debug start
	console.log(Recode.data);
	// debug end
};

// ゲームを開始できる状況を作り出します。
Minesweeper.prototype.start = function() {
	let self = this;
	
	this.state = this.WORKING;
	
	$minesCount.text(this.remainingMinesCount);
	
	$minesCount.css("visibility", "visible");
	$score.css("visibility", "hidden");
	$face.text(Face.SMILE);
	
	$field.empty();
	
	// HTMLのタグを作ります。
	// 配列fieldも初期化しますが、まだ地雷は作りません。
	for (let row = 0; row < this.rowSize; row++) {
		let rowField = [];
		$field.append("<tr></tr>");
		for (let col = 0; col < this.colSize; col++) {
			let id = this.pointToId(row, col);
			$("tr:last").append($("<td>").attr("id", id));
			rowField.push({existsMine: false, existsFlag: false});
		}
		this.field.push(rowField);
	}
	
	$("#field td").css("background-color", rgba(this.fieldColorData));
	
	// イベント処理
	const LEFT_DOWN = 1;
	const RIGHT_DOWN = 3;
	$("#field td").on({
		"mousedown": function(event) {
			// 左ボタン押下時
			if (event.which === LEFT_DOWN) {
				$face.text(Face.NEUTRAL);
				let point = self.idToPoint($(this).attr("id"));
				let row = point.row;
				let col = point.col;
				// 初回左ボタンクリック時
				if (self.isFirstLeftDown) {
					self.isFirstLeftDown = false;
					// 初回クリック時に地雷を生成します。
					// 初回クリックで死亡を防ぐためです。
					self.fillMines(row, col);
					// タイム計測開始
					self.timer.start();
					
					// プレイ回数を1増やして保存する。
					Recode.incPlayCount(self.level);
					if (localStorage !== undefined) {
						localStorage.setItem("recode", JSON.stringify(Recode.data));
					}
				}
				self.isDownLeft = true;
				// 穴を掘る。
				switch (self.dig(row, col)) {
					case self.WORKING:
						break;
					case self.DIED:
						self.gameover();
						break;
					case self.CLEAR:
						self.gameclear();
						break;
				}
			}
			// 右ボタン押下時
			else if (event.which === RIGHT_DOWN) {
				// もし解放されているマスの上で、
				// 左ボタンを押下されている状態で右ボタンを押下した場合、
				// そのマスの数字と、周囲の旗の数が一致するときに
				// 周囲の未開放のマスを掘ります。
				if (self.isDownLeft) {
					let point = self.idToPoint($(this).attr("id"));
					let row = point.row;
					let col = point.col;
					if (self.field[row][col] === null) {
						// 周囲掘り
						switch (self.digAround(row, col)) {
							case self.WORKING:
								break;
							case self.DIED:
								self.gameover();
								return;
								break;
							case self.CLEAR:
								self.gameclear();
								break;
						}
					}
				}
				// 掘られていないマスの上で、
				// 右ボタンだけ押下された場合
				// 旗が立てられていなければ、旗を立てます。
				// 旗が立てられていれば、旗を消します。
				else {
					let id = $(this).attr("id");
					let point = self.idToPoint(id);
					let row = point.row;
					let col = point.col;
					if (self.field[row][col] !== null) {
						// 旗があれば、旗を消す。
						if (self.field[row][col].existsFlag) {
							self.field[row][col].existsFlag = false;
							$(this).text("");
							// 画面の推定地雷数を1増やす。
							$minesCount.text(++self.remainingMinesCount);
						}
						// 旗がなければ、旗を立てる。
						else {
							self.field[row][col].existsFlag = true;
							$(this).text("P").css("color", "yellow");
							// 画面の推定地雷数を1減らす。
							$minesCount.text(--self.remainingMinesCount);
						}
					}
				}
			}
		},
		// 左ボタンが離されたときに、左ボタン押下中フラグを折ります。
		// 左ボタン押下中フラグは、右ボタン押下時処理で、
		// 周囲掘りをするかどうかの判定に用いります。
		"mouseup": function(event) {
			if (event.which === LEFT_DOWN) {
				$face.text(Face.SMILE);
				self.isDownLeft = false;
			}
		}
	});
};

// ゲームオーバー時処理
Minesweeper.prototype.gameover = function() {
	// タイマーを止めます。
	this.timer.stop();
	// マス上でのイベントをなくします。
	$("#field td").off("mousedown mouseup");
	
	$face.text(Face.DIZZY);
	
	// 埋まっている地雷を表示します。
	for (let row = 0; row < this.rowSize; row++) {
		for (let col = 0; col < this.colSize; col++) {
			let id = this.pointToId(row, col);
			if (this.field[row][col] !== null &&
			    this.field[row][col].existsMine) {
				$("#" + id).css("background-color", "blue");
			}
		}
	}
};

// ゲームクリア処理
Minesweeper.prototype.gameclear = function() {
	// タイマーを止めます。
	this.timer.stop();
	// マス上でのイベントをなくします。
	$("#field td").off("mousedown mouseup");
	
	$face.text(Face.SUNGLASSES);
	
	Recode.incWinCount(this.level);
	
	Recode.setClearTimeRanking(this.level, this.timer.getSec());
	if (localStorage !== undefined) {
		localStorage.setItem("recode", JSON.stringify(Recode.data));
	}
};

// fieldに地雷を埋めます。
Minesweeper.prototype.fillMines = function(ignoreRow, ignoreCol) {
	// 地雷を定義された数だけ順番に埋めます。
	// ただし、初回押下されたマスには埋めません。
	// ちなみに、minesMaxCountがマス以上であってもバグりません。
	let minesCount = 0;
	for (let row = 0; row < this.rowSize; row++) {
		for (let col = 0; col < this.colSize; col++) {
			if (minesCount < this.minesMaxCount &&
			    !(row === ignoreRow && col === ignoreCol)) {
				this.field[row][col].existsMine = true;
				minesCount++;
			}
		}
	}
	
	// 地雷を混ぜます。
	// ただし、初回押下されたマスに地雷は配置されません。
	for (let row = 0; row < this.rowSize; row++) {
		for (let col = 0; col < this.colSize; col++) {
			let tmpRow = Math.floor(Math.random() * this.rowSize);
			let tmpCol = Math.floor(Math.random() * this.colSize);
			if (row === ignoreRow && col === ignoreCol ||
			    tmpRow === ignoreRow && tmpCol === ignoreCol) continue;
			let tmpExistsMine = this.field[row][col].existsMine;
			this.field[row][col].existsMine = this.field[tmpRow][tmpCol].existsMine;
			this.field[tmpRow][tmpCol].existsMine = tmpExistsMine;
		}
	}
};

// tdタグのidを座標へ変換します。
Minesweeper.prototype.idToPoint = function(id) {
	let strPoint = id.substr(4).split("_");
	return {row: Number(strPoint[0]), col: Number(strPoint[1])};
};

// 座標をtdタグのidへ変換します。
Minesweeper.prototype.pointToId = function(row, col) {
	return "cell" + row + "_" + col;
};

// 指定されたマスを掘ります。
// ・そのマスが地雷だった場合は死亡を返します。
// ・周囲のマスの地雷数を、そのマスに表示します。
// ・周囲のマスの地雷数が0の場合は、周囲のマスを掘ります。
// ・地雷以外のすべてのマスを掘った場合はクリアを返します。
Minesweeper.prototype.dig = function(row, col) {
	let id = this.pointToId(row, col);
	let $cell = $("#" + id);
	
	// 対象のマスがすでに掘られていたり、旗が立てられている場合は掘りません。
	if (this.field[row][col] === null) return this.WORKING;
	if (this.field[row][col].existsFlag) return this.WORKING;
	
	// 対象のマスが地雷の場合は死亡します。
	if (this.field[row][col].existsMine) {
		return this.DIED;
	};
	
	// 掘ったマスはメモリの負荷を減らすために、
	// 対応するオブジェクトの参照を外します。
	this.field[row][col] = null;
	this.safeCellsCount--;
	$cell.css("background-color", rgba(this.fieldColorData, 0.5));
	
	let minesCount = this.aroundMinesCount(row, col); 
	// 周囲の地雷数が0でなければ、それを表示する。
	if (minesCount !== 0) {
		$cell.css("color", this.numberColor[minesCount]);
		$cell.text(minesCount);
	}
	// 周囲に地雷が存在しなければ、周囲のマスを掘る。
	else {
		for (let i = 0; i < this.direction.length; i++) {
			let targetRow = row + this.direction[i][0];
			let targetCol = col + this.direction[i][1];
			if (targetRow < 0 || targetRow === this.rowSize ||
			    targetCol < 0 || targetCol === this.colSize) continue;
			this.dig(targetRow, targetCol);
		}
	}
	
	// 安全マスがなくなったらクリア
	if (this.safeCellsCount === 0) {
		return this.CLEAR;
	}
	else {
		return this.WORKING;
	}
};

// 周囲8マスを掘ります。
// 引数のマスは掘りません。
// あとはdigメソッドと同じです。
Minesweeper.prototype.digAround = function(row, col) {
	let minesCount = 0;
	let flagCount = 0;
	for (let i = 0; i < this.direction.length; i++) {
		let targetRow = row + this.direction[i][0];
		let targetCol = col + this.direction[i][1];
		if (targetRow < 0 || targetRow === this.rowSize ||
		    targetCol < 0 || targetCol === this.colSize ||
		    this.field[targetRow][targetCol] === null) continue;
		if (this.field[targetRow][targetCol].existsMine) {
			minesCount++;
		}
		if (this.field[targetRow][targetCol].existsFlag) {
			flagCount++;
		}
	}
	if (minesCount !== flagCount) return this.WORKING;
	
	let rtnState = this.WORKING;
	for (let i = 0; i < this.direction.length; i++) {
		let targetRow = row + this.direction[i][0];
		let targetCol = col + this.direction[i][1];
		if (targetRow < 0 || targetRow === this.rowSize ||
		    targetCol < 0 || targetCol === this.colSize) continue;
		let state = this.dig(targetRow, targetCol);
		if (state === this.DIED) {
			rtnState = this.DIED;
		}
		else if (state === this.CLEAR) {
			rtnState = this.CLEAR;
		}
	}
	
	return rtnState;
};

// 対象のマスの周囲8マスに存在する地雷数を返します。
Minesweeper.prototype.aroundMinesCount = function(row, col) {
	let minesCount = 0;
	for (let i = 0; i < this.direction.length; i++) {
		let targetRow = row + this.direction[i][0];
		let targetCol = col + this.direction[i][1];
		if (targetRow < 0 || targetRow === this.rowSize ||
		    targetCol < 0 || targetCol === this.colSize ||
		    this.field[targetRow][targetCol] === null) continue;
		if (this.field[targetRow][targetCol].existsMine) minesCount++;
	}
	return minesCount;
};