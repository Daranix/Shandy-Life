'use strict';
var Stream = require('stream').Stream,
	util = require('util'),
	fs = require('fs');

/**
 * WritableFileStream
 *
 * @param {String} file Writable file name
 * @param {[Integer]} options.bufferSize write memory buffer size, default: 0
 * @param {[String]} options.flags fileopen flags, default: 'a'
 * @param {[Integer]} options.mode Fileopen mode, default: 0644
 * @param {[String]} options.encoding write stream encoding, default: utf8
 */
function WritableFileStream(file, options) {
	if ( !(this instanceof WritableFileStream) ) {
		return new WritableFileStream(file, options);
	}
	Stream.call(this);
	options = options || {};
	this._file = file;
	this._bufferSize = options.bufferSize || 0;
	this._flags = options.flags || 'a';
	this._mode = options.mode || parseInt('0644', 8);
	this._encoding = options.encoding || 'utf8';

	this._stream = null;
	this._isReopening = false;
	this._buffer = null;
	this._open();

	/** @see https://github.com/dominictarr/stream-spec/blob/master/stream_spec.md#writablestream **/
	this.writable = false;
}

util.inherits(WritableFileStream, Stream);
var proto = WritableFileStream.prototype;

proto._open = function _open() {
	this.writable = true;
	this._resetBuffer();
	this._stream = fs.createWriteStream(this._file, {
		flags: this._flags,
		mode: this._mode,
		encoding: this._encoding
	})
	.on('error', this.emit.bind(this, 'error'))
	.on('pipe', this.emit.bind(this, 'pipe'))
	.on('drain', this.emit.bind(this, 'drain'))
	.on('open', this._onOpen.bind(this))
	.on('close', this._onClose.bind(this));
};

proto._onOpen = function _onOpen() {
	this._isReopening = false;
};

proto._onClose = function _onClose() {
	if (!this._isReopening) {
		this.emit('close');
	}
};

proto._clean = function _clean() {
	this.writable = this._isReopening = false;
};

proto._resetBuffer = function _resetBuffer() {
	this._buffer = '';
};

proto._flush = function _flush() {
	if (this._bufferSize) {
		this._stream.write(this._buffer);
		this._resetBuffer();
	}
};

proto.reopen = function reopen() {
	this._isReopening = true;
	this._flush();
	this._streamFixedEnd();
	this._open();
};

proto._streamFixedEnd = function _streamFixedEnd() {
	this._stream.end();
	//hack: after process.exit or sigint stream auto closes
	if (this._stream._writableState && Array.isArray(this._stream._writableState.buffer)) {
		var dataStr = this._stream._writableState.buffer.map(function map(item) {
			return item.chunk.toString();
		}).join('');
		if (dataStr) {
			fs.appendFileSync(this._file, dataStr);
		}
	}
	this._stream = null;
};

proto.end = function end(string) {
	this.write(string);
	this._flush();
	this._clean();
	this._streamFixedEnd();
};

proto.destroy = function destroy() {
	this._clean();
	this._stream.destroy();
	this._stream = null;
};

proto.destroySoon = function destroySoon() {
	this._clean();
	this._stream.destroySoon();
	this._stream = null;
};

proto.write = function write(string) {
	if (!string) {
		return false;
	}
	if (this._bufferSize) {
		this._buffer += string;
		if (this._buffer.length > this._bufferSize) {
			this._flush();
		}

		return string.length;
	} else {
		return this._stream.write(string);
	}
};

module.exports = WritableFileStream;
