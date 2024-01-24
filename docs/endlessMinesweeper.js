// EndlessMinesweeperクラス
// Minesweeperクラスの無限版です。
const EndlessMinesweeper = function() {
	this.rowSize = 0;
	this.colSize = fieldData[ENDLESS].col;
	this.subRowSize = fieldData[ENDLESS].row;
	this.field = [];
	this.layer = 1;
	this.safeCellsCounts = {};
	this.score = new Score();
	this.direction = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
	this.numberColor = {1: "blue", 2: "green", 3: "red", 4: "navy", 5: "brown", 6: "cyan", 7: "black", 8: "gray"};
	this.isDownLeft = false;
	this.state;
	this.WORKING = 0;
	this.DIED = 1;
	this.isFirstLeftDown = true;
	this.timer = Timer.getInstance();
};

EndlessMinesweeper.prototype.start = function() {
	const self = this;
	
	this.state = this.WORKING;
	
	this.score.display();
	
	$minesCount.css("visibility", "hidden");
	$score.css("visibility", "visible");
	$face.text(Face.SMILE);
	
	$field.empty();
	
	let row = 0;
	for (let level = EASY; level <= TAXING; level++) {
		const key = this.levelToKey(level);
		let safeCellsCount = this.subRowSize * this.colSize;
		for (let subRow = 0; subRow < this.subRowSize; subRow++) {
			const rowField = [];
			$field.append("<tr></tr>");
			for (let col = 0; col < this.colSize; col++) {
				const id = this.pointToId(row, col);
				$("tr:last").append($("<td>")
					.attr({id: id, key: key})
					.css("background-color", rgba(fieldData[level].colorData)));
				if (fieldData[level].mpf < Math.random()) {
					rowField.push({existsMine: false, existsFlag: false});
				}
				else {
					rowField.push({existsMine: true, existsFlag: false});
					safeCellsCount--;
				}
			}
			this.field.push(rowField);
			row++;
		}
		this.safeCellsCounts[key] = safeCellsCount;
		this.rowSize += this.subRowSize;
	}
	this.layer++;
	
	const LEFT_DOWN = 0;
	const RIGHT_DOWN = 2;
	$field.on("mousedown", "td",
		function(event) {
			if (event.button === LEFT_DOWN) {
				$face.text(Face.NEUTRAL);
				const point = self.idToPoint($(this).attr("id"));
				const row = point.row;
				const col = point.col;
				if (self.isFirstLeftDown) {
					self.isFirstLeftDown = false;
					// 初回押下時に地雷を踏んだ場合、その地雷をなくして処理を行う。
					if (self.field[row][col].existsMine) {
						self.field[row][col].existsMine = false;
						const id = self.pointToId(row, col);
						const key = $("#" + id).attr("key");
						self.safeCellsCounts[key]++;
					}
					self.timer.start();
					
					// プレイ回数を1増やして保存する。
					Recode.incPlayCount(ENDLESS);
					if (localStorage !== undefined) {
						localStorage.setItem("recode", JSON.stringify(Recode.data));
					}
				}
				self.isDownLeft = true;
				const state = self.dig(row, col);
				self.score.display();
				switch (state) {
					case self.WORKING:
						break;
					case self.DIED:
						self.gameover();
						break;
				}
			}
			else if (event.button === RIGHT_DOWN) {
				if (self.isDownLeft) {
					const point = self.idToPoint($(this).attr("id"));
					const row = point.row;
					const col = point.col;
					if (self.field[row][col] === null) {
						const state = self.digAround(row, col);
						self.score.display();
						switch (state) {
							case self.WORKING:
								break;
							case self.DIED:
								self.gameover();
								return;
								break;
						}
					}
				}
				else {
					const id = $(this).attr("id");
					const point = self.idToPoint(id);
					const row = point.row;
					const col = point.col;
					if (self.field[row][col] !== null) {
						if (self.field[row][col].existsFlag) {
							self.field[row][col].existsFlag = false;
							$(this).text("");
						}
						else {
							self.field[row][col].existsFlag = true;
							$(this).text("P").css("color", "yellow");
						}
					}
				}
			}
		}
	);
	
	$window.on("mouseup",
		function(event) {
			if (event.button === LEFT_DOWN) {
				$face.text(Face.SMILE);
				self.isDownLeft = false;
			}
		}
	);
	
	// スクロールでフィールドを増やす。
	$window.scroll(function () {
		// 一番下から500pxの位置までスクロールした時に実行
		if (Math.ceil($window.scrollTop()) >= ($document.height() - $window.height()) - 500) {
			const topRowOfAddedField = self.field.length;
			
			let row = topRowOfAddedField;
			for (let level = EASY; level <= TAXING; level++) {
				const key = self.levelToKey(level);
				let safeCellsCount = self.subRowSize * self.colSize;
				for (let subRow = 0; subRow < self.subRowSize; subRow++) {
					const rowField = [];
					$field.append("<tr></tr>");
					for (let col = 0; col < self.colSize; col++) {
						const id = self.pointToId(row, col);
						$("tr:last").append($("<td>")
							.attr({id: id, key: key})
							.css("background-color", rgba(fieldData[level].colorData)));
						if (fieldData[level].mpf < Math.random()) {
							rowField.push({existsMine: false, existsFlag: false});
						}
						else {
							rowField.push({existsMine: true, existsFlag: false});
							safeCellsCount--;
						}
					}
					self.field.push(rowField);
					row++;
				}
				self.safeCellsCounts[key] = safeCellsCount;
				self.rowSize += self.subRowSize;
			}
			self.layer++;
			
			for (let col = 0; col < self.colSize; col++) {
				if (self.field[topRowOfAddedField - 1][col] === null) {
					self.dig(topRowOfAddedField, col);
				}
			}
			
			for (let col = 0; col < self.colSize; col++) {
				if (self.field[topRowOfAddedField - 1][col] === null) {
					const id = self.pointToId(topRowOfAddedField - 1, col);
					const $cell = $("#" + id);
					const minesCount = self.aroundMinesCount(topRowOfAddedField - 1, col); 
					if (minesCount !== 0) {
						$cell.css("color", self.numberColor[minesCount]);
						$cell.text(minesCount);
					}
				}
			}
		}
	});
};

EndlessMinesweeper.prototype.gameover = function() {
	this.timer.stop();
	$window.off("scroll mouseup");
	$field.off("mousedown");
	
	$face.text(Face.DIZZY);
	
	Recode.setScoreRanking(this.score.getScore());
	if (localStorage !== undefined) {
		localStorage.setItem("recode", JSON.stringify(Recode.data));
	} 
	
	for (let row = 0; row < this.rowSize; row++) {
		for (let col = 0; col < this.colSize; col++) {
			const id = this.pointToId(row, col);
			if (this.field[row][col] !== null &&
			    this.field[row][col].existsMine) {
				$("#" + id).css("background-color", "blue");
			}
		}
	}
};

EndlessMinesweeper.prototype.idToPoint = function(id) {
	const strPoint = id.substr(4).split("_");
	return {row: Number(strPoint[0]), col: Number(strPoint[1])};
};

EndlessMinesweeper.prototype.pointToId = function(row, col) {
	return "cell" + row + "_" + col;
};

EndlessMinesweeper.prototype.levelToKey = function(level) {
	let key;
	
	switch (level) {
		case EASY:   key = "e" + this.layer; break;
		case NORMAL: key = "n" + this.layer; break;
		case HARD:   key = "h" + this.layer; break;
		case TAXING: key = "t" + this.layer; break;
	}
	
	return key;
};

EndlessMinesweeper.prototype.keyToLevel = function(key) {
	let level;
	
	switch (key.substr(0, 1)) {
		case "e": level = EASY;   break;
		case "n": level = NORMAL; break;
		case "h": level = HARD;   break;
		case "t": level = TAXING; break;
	}
	
	return level;
};

EndlessMinesweeper.prototype.dig = function(row, col) {
	if (this.field[row][col] === null) return this.WORKING;
	if (this.field[row][col].existsFlag) return this.WORKING;
	
	if (this.field[row][col].existsMine) {
		return this.DIED;
	};
	
	this.field[row][col] = null;
	
	const id = this.pointToId(row, col);
	const $cell = $("#" + id);
	const key = $cell.attr("key")
	const level = this.keyToLevel(key);
	
	this.safeCellsCounts[key]--;
	$cell.css("background-color", rgba(fieldData[level].colorData, 0.5));
	this.score.addDigScore(level);
	
	const minesCount = this.aroundMinesCount(row, col); 
	if (minesCount !== 0) {
		$cell.css("color", this.numberColor[minesCount]);
		$cell.text(minesCount);
	}
	else {
		for (let i = 0; i < this.direction.length; i++) {
			const targetRow = row + this.direction[i][0];
			const targetCol = col + this.direction[i][1];
			if (targetRow < 0 || targetRow === this.rowSize ||
			    targetCol < 0 || targetCol === this.colSize) continue;
			this.dig(targetRow, targetCol);
		}
	}
	
	if (key in this.safeCellsCounts) {
		if (this.safeCellsCounts[key] === 0) {
			delete this.safeCellsCounts[key];
			const self = this;
			$("td[key='" + key + "']").each(function() {
				const $this = $(this);
				const point = self.idToPoint($this.attr("id"));
				const row = point.row;
				const col = point.col;
				if (self.field[row][col] !== null) {
					self.field[row][col].existsFlag = true;
					$this.mousedown(function() {return false;});
					$this.text("@").css("color", "pink");
				}
			});
			this.score.addClearScore(level);
		}
	}
	
	return this.WORKING;
};

EndlessMinesweeper.prototype.digAround = function(row, col) {
	let minesCount = 0;
	let flagCount = 0;
	for (let i = 0; i < this.direction.length; i++) {
		const targetRow = row + this.direction[i][0];
		const targetCol = col + this.direction[i][1];
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
		const targetRow = row + this.direction[i][0];
		const targetCol = col + this.direction[i][1];
		if (targetRow < 0 || targetRow === this.rowSize ||
		    targetCol < 0 || targetCol === this.colSize) continue;
		const state = this.dig(targetRow, targetCol);
		if (state === this.DIED) {
			rtnState = this.DIED;
		}
	}
	
	return rtnState;
};

EndlessMinesweeper.prototype.aroundMinesCount = function(row, col) {
	let minesCount = 0;
	for (let i = 0; i < this.direction.length; i++) {
		const targetRow = row + this.direction[i][0];
		const targetCol = col + this.direction[i][1];
		if (targetRow < 0 || targetRow === this.rowSize ||
		    targetCol < 0 || targetCol === this.colSize ||
		    this.field[targetRow][targetCol] === null) continue;
		if (this.field[targetRow][targetCol].existsMine) minesCount++;
	}
	return minesCount;
};