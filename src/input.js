class Input {
	constructor() {
		this.value = '';
		this.reset();
	}

	reset() {
		this.cursor = 0;
		this.isFocused = false;
		this.capsLocked = false;
		this.value = '';
		this.resetSelection();
		this.onInputChange(this.value);
	}

	resetSelection() {
		this.selectionStart = null;
		this.selectionEnd = null;
		this.direction = null;
	}

	focus() {
		this.reset();
		this.isFocused = true;
	}

	/**
	 * @param {string} value The new value of the input.
	 */
	onInputChange() {}

	getSelection() {
		return this.value.substring(this.selectionStart, this.selectionEnd);
	}

	isTextSelected() {
		return this.selectionStart !== null && this.selectionEnd !== null;
	}

	/**
	 * Insert a character or string into the input.
	 * @param {string} char The character or string to insert.
	 */
	insert(char) {
		if (this.isTextSelected()) {
			this.delete();
		}
		this.value =
			this.value.substring(0, this.cursor) +
			char +
			this.value.substring(this.cursor);
		this.cursor += char.length;
		this.onInputChange(this.value);
	}

	delete() {
		if (this.isTextSelected()) {
			this.value =
				this.value.substring(0, this.selectionStart) +
				this.value.substring(this.selectionEnd);
			this.cursor = this.selectionStart;
			this.resetSelection();
		} else if (this.cursor > 0) {
			this.value =
				this.value.substring(0, this.cursor - 1) +
				this.value.substring(this.cursor);
			this.cursor--;
		}
		this.onInputChange(this.value);
	}

	/**
	 * Handles an arrow press.
	 * @param {-1|1} direction The direction of the arrow.
	 * @param {boolean} select Whether the user is selecting text.
	 */
	sideArrow(direction, select) {
		if (
			(direction === -1 && this.cursor < 1) ||
			(direction === 1 && this.cursor >= this.value.length)
		) {
			this.resetSelection();
			return;
		}

		let updateCursor = true;

		if (select) {
			if (this.isTextSelected()) {
				if (direction === 1) {
					if (this.direction === 1) {
						this.selectionEnd++;
					} else {
						this.selectionStart++;
					}
				} else {
					if (this.direction === -1) {
						this.selectionStart--;
					} else {
						this.selectionEnd--;
					}
				}
			} else {
				if (direction === 1) {
					this.selectionStart = this.cursor;
					this.selectionEnd = this.cursor + 1;
				} else {
					this.selectionStart = this.cursor - 1;
					this.selectionEnd = this.cursor;
				}
				this.direction = direction;
			}

			this.calcSelectMeta();
		} else {
			if (this.isTextSelected()) {
				this.cursor = direction === 1 ? this.selectionEnd : this.selectionStart;
				this.resetSelection();
				updateCursor = false;
			}
		}

		if (updateCursor) {
			if (direction === 1) this.cursor++;
			else this.cursor--;
		}
	}

	swapSelectPoints() {
		const temp = this.selectionStart;
		this.selectionStart = this.selectionEnd;
		this.selectionEnd = temp;
	}

	calcSelectMeta() {
		if (!this.isTextSelected()) return;
		if (this.selectionStart === this.selectionEnd) {
			this.resetSelection();
		} else if (this.selectionStart > this.selectionEnd) {
			this.swapSelectPoints();
			this.direction = -1;
		}
	}

	selectAll() {
		this.selectionStart = 0;
		this.selectionEnd = this.value.length;
		this.cursor = this.selectionEnd;
		this.direction = 1;
	}

	/**
	 * Selects the next chunk of characters.
	 * @param {-1|1} direction The direction to select.
	 */
	bulkSelect(direction, jump) {
		const str =
			direction === 1
				? this.value.substring(this.cursor)
				: this.value.substring(0, this.cursor);

		if (str.length < 1) return;

		let newCursor;
		let nonSpaceFound = false;
		if (direction === 1) {
			for (let i = 0; i < str.length; i++) {
				if (i === str.length - 1) {
					newCursor = str.length;
					break;
				}

				const char = str.charAt(i);
				const notSpace = char !== ' ';
				if (notSpace && !nonSpaceFound) nonSpaceFound = true;

				if (nonSpaceFound && !notSpace) {
					newCursor = i + 1;
					break;
				}
			}
			newCursor += this.cursor;
		} else {
			for (let i = str.length - 1; i >= 0; i--) {
				if (i === 0) {
					newCursor = 0;
					break;
				}

				const char = str.charAt(i);
				const notSpace = char !== ' ';
				if (notSpace && !nonSpaceFound) nonSpaceFound = true;

				if (nonSpaceFound && !notSpace) {
					newCursor = i + 1;
					break;
				}
			}
		}

		if (jump) {
			this.resetSelection();
		} else {
			if (direction === 1) {
				if (this.direction === -1) {
					this.selectionStart = this.selectionEnd;
					this.selectionEnd = newCursor;
					if (this.selectionStart > this.selectionEnd) this.direction = -1;
					else this.direction = 1;
				} else {
					if (this.selectionStart == null) this.selectionStart = this.cursor;
					this.selectionEnd = newCursor;
					this.direction = 1;
				}
			} else {
				if (this.direction === 1) {
					this.selectionEnd = newCursor;
					if (this.selectionStart > this.selectionEnd) this.direction = -1;
					else this.direction = 1;
				} else {
					if (this.selectionEnd == null) this.selectionEnd = this.cursor;
					this.selectionStart = newCursor;
					this.direction = -1;
				}
			}
		}

		this.calcSelectMeta();
		this.cursor = newCursor;
	}

	/**
	 * Finds the point to pivot around when selecting text.
	 * @param {-1|1} direction The direction to select.
	 */
	findPivot(direction) {
		if (direction === 1) {
			if (this.direction === 1) return this.selectionStart;
			else return this.selectionEnd;
		} else {
			if (this.direction === 1) return this.selectionStart;
			else return this.selectionEnd;
		}
	}

	/**
	 * Results from CTRL +  arrow press at the same time.
	 * @param {-1|1} direction The direction to jump.
	 * @param {boolean} select Whether to select the text or not.
	 */
	arrowJump(direction, select) {
		if (select) {
			if (direction === 1 && this.cursor < this.value.length) {
				this.selectionStart = this.isTextSelected()
					? this.findPivot(direction)
					: this.cursor;
				this.selectionEnd = this.value.length;
			} else if (direction === -1 && this.cursor > 0) {
				this.selectionEnd = this.isTextSelected()
					? this.findPivot(direction)
					: this.cursor;
				this.selectionStart = 0;
			}
		} else {
			this.resetSelection();
		}

		if (direction === -1) this.cursor = 0;
		else this.cursor = this.value.length;
	}
}

module.exports = Input;
