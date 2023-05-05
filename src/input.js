const { alphabet } = require('./constants');

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

	/**
	 * Checks whether a character is a letter in the alphabet [a-zA-Z]
	 * @param {string} char The character to check if it's a letter.
	 * @returns Whether the character is a letter.
	 */
	isLetter(char) {
		return alphabet.indexOf(char.toUpperCase()) != -1;
	}

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
		if (direction === -1 && this.cursor < 1) return;
		if (direction === 1 && this.cursor >= this.value.length) {
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
	bulkSelect(direction) {
		const str =
			direction === 1
				? this.value.substring(this.cursor)
				: this.value.substring(0, this.cursor);

		if (str.length < 1) return;

		let newCursor;
		let letterFound = false;
		if (direction === 1) {
			for (let i = 0; i < str.length; i++) {
				if (i === str.length - 1) {
					newCursor = str.length;
					break;
				}

				const char = str.charAt(i);
				const isLetter = this.isLetter(char);
				if (isLetter && !letterFound) letterFound = true;

				if (letterFound && !isLetter) {
					newCursor = i;
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
				const isLetter = this.isLetter(char);
				if (isLetter && !letterFound) letterFound = true;

				if (letterFound && !isLetter) {
					newCursor = i = 1;
					break;
				}
			}
		}

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

		this.calcSelectMeta();
		this.cursor = newCursor;
	}
}

module.exports = Input;
