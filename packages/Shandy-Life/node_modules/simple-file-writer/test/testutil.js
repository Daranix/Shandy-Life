var fs = require('fs');
var assert = require('assert');
var $u = require('util');
var Readable = require('stream').Readable;
var path = require('path');
var uuid = require('node-uuid');
var SimpleFileWriter = require('../lib/SimpleFileWriter');

//console.log(process.cwd())
var pcwd = process.cwd();
var testLogs;
if (pcwd.substr(-4) === 'test')
	testLogs = path.join(pcwd, 'testlogs');
else
	testLogs = path.join(pcwd, 'test','testlogs');

$u.inherits(TestStream, Readable);
function TestStream(data) {
	Readable.call(this);

	this.data = data;
	this.progress = 0;
	this.step = Math.ceil(data.length / 2);
}

TestStream.prototype._read = function(n) {

	var start = this.progress;
	this.progress += this.step;
	this.push(this.data.substr(start, this.step));

	if (this.progress >= this.data.length) {
		return this.push(null);
	}
};

module.exports.TestStream = TestStream;

var logs = module.exports.logs = [];

module.exports.newWriter = function(logname, dontPush) {
	if (!dontPush)
		logs.push(logname)

	return new SimpleFileWriter(logname);
}

module.exports.newLogFilename = function() {
	return path.join(testLogs, uuid() + '.log');
};

module.exports.verifyDataIntegrity = function(expectedRowCount, expectedRowSize, done, filename) {
	var expectedSum = ((expectedRowSize - 1) * expectedRowSize) / 2;

	return function(err, content) {

		if (err) throw err;

		var rows = content.split('\n');
	//	assert.strictEqual(expectedRowCount + 1, rows.length, 'expected ' + expectedRowCount + ' rows to be written but found ' + rows.length + ' in file: ' + filename);
		//assert.strictEqual(rows[expectedRowCount], '', 'expected last row to be empty in file: ' + filename);
		rows.pop(); // remove last empty line

		for (var i = 0; i < rows.length; i++) {
			var row = rows[i].split(',');

			if (expectedRowSize !== row.length)
				fs.writeFileSync(path.join(testLogs, 'badrow'), $u.inspect([expectedRowSize ,row.length, row.join('|')]));

			assert.strictEqual(expectedRowSize, row.length, 'expected to find ' + expectedRowSize + ' numbers in row ' + i + ' but it was ' + row.length + ' in file: ' + filename);


			var sum = 0;
			for (var x = 0; x < row.length; x++)
				sum += parseInt(row[x]);

			assert.strictEqual(expectedSum, sum, 'unexpected sum in a row ' + i + ' in file: ' + filename);
		}

		done(null, rows.length);
	};
};

module.exports.createRowData = function(rowSize) {

	var s1 = '';

	for (var s = 0; s < rowSize; s++) {
		if (s > 0)
			s1 += ',';

		s1 += s;
	}

	s1 += '\n';

	return s1;
};

process.on('exit', function () {
	for (var i = 0; i < logs.length; i++) {
		try {
			//fs.unlinkSync(logs[i]);
		} catch(e) {
			console.log(e.message);
		}
	}
});