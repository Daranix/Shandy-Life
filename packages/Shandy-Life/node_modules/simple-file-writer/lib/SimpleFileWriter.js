var fs = require('fs');
var Readable = require('stream').Readable;
var $u = require('util');
var LinkedList = require('./LinkedList');

function SimpleFileWriter(path, options) {
	this._buffer = new LinkedList();

	this._paused = false;

	this._ending = false;

	this._userPause = false;

	//this.messageCount = 0;

	if (options === undefined)
		this._options = { flags: 'a' };
	else
		this._options = options;

	if (path !== undefined)
		this.setupFile(path);

	var self = this;

	this._drainCallback = function drainCallback () {
		self._flushBuffer();
	};
}

SimpleFileWriter.prototype.setupFile = function(path, callback) {
	// rotating flag is redundant and should be removed
	this._rotating = true;

	var self = this;

	if (this._log) {
		this._log.end(callback);
	}

	this.currentPath = path;

	this._log = this._createFileStream(path);
	this._log.setMaxListeners(0);

	// if we are paused all drain event handlers on previous stream are lost
	// so refresh the pause
	this._rotating = false;
	if (this._paused)
		this._flushBuffer();
};

SimpleFileWriter.prototype.write = function(message, encoding, callback) {
	if (this._ending)
		throw new Error('cannot write to stream after a call to end() or endImmediately()');

	if (this._paused || this._userPause) {
		this._buffer.push([message, encoding, callback]);
	} else {
		this._write(message, encoding, callback);
	}

	return this._paused;
};

SimpleFileWriter.prototype.pause = function() {
	this._userPause = true;
};

SimpleFileWriter.prototype.resume = function () {
	if (this._userPause) {
		this._userPause = false
		this._flushBuffer()
	}
};

SimpleFileWriter.prototype._write = function(message, encoding, callback) {
	// splitted methods here seems redundant, but it makes testing easy and supports customization via overriding for specific messages
	if (message instanceof Buffer) {
		this._writeBuffer(message, encoding, callback);
	} else if (typeof(message) === 'string') {
		this._writeString(message, encoding, callback);
	} else if (message instanceof Readable) {
		this._writeStream(message, encoding, callback);
	} else {
		this._writeOther(message, encoding, callback);
	}
};

SimpleFileWriter.prototype._writeString = function(message, encoding, callback) {

	this._paused = !this._log.write(message, encoding, callback);

	if (this._paused) {
		this._log.once('drain', this._drainCallback);
	}
};

SimpleFileWriter.prototype._writeBuffer = function(message, encoding, callback) {

	this._paused = !this._log.write(message, encoding, callback);

	if (this._paused) {
		this._log.once('drain', this._drainCallback);
	}
};

SimpleFileWriter.prototype._writeStream = function(stream, encoding, callback) {
	if (typeof(encoding) === 'function')
		callback = encoding;

	this._paused = true;

	var self = this;

	stream.on('end', function () {

		if (callback) {
			callback();
		}

		self._flushBuffer();
	});

	stream.pipe(self._log, { end: false });
};

SimpleFileWriter.prototype._writeOther = function(message, encoding, callback) {
	throw new Error('invalid message: ' + $u.inspect(message) + '. you should override _writeOther in a subclass if you want to handle this type of message');
};


SimpleFileWriter.prototype._createFileStream = function(path) {
	return fs.createWriteStream(path, this._options);
};

SimpleFileWriter.prototype._flushBuffer = function () {
	if (this._rotating) return;

	if (this._buffer.length === 0) {
		this._paused = false;
	} else {
		while (this._buffer.length > 0) {
			var messageArguments = this._buffer.shift().data;

			this._write(messageArguments[0], messageArguments[1], messageArguments[2]);

			if (this._paused)
				break;
		}
	}
};

SimpleFileWriter.prototype.end = function(callback) {
	var self = this;

	this._ending = true;

	if (this._paused)
		return setImmediate(callback1);

	if (this._buffer.length === 0) {

		this._log.end(callback);

	} else {
		this._flushBuffer();

		setImmediate(callback1)
	}

	function callback1() {
		self.end(callback);
	}
};

SimpleFileWriter.prototype.endImmediately = function (callback) {
	this._ending = true;
	this._log.end(callback);
};

module.exports = SimpleFileWriter;