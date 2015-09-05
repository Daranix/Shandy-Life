/*
	distilled version of the problem I'm trying to solve:

	write a log from many streams

	each row is made of numbers prefixed by a row number

	data integrity is later verified by checking the sum of the row and that each datum is prefixed correctly
*/
var fs = require('fs');
var $u = require('util');
var Readable = require('stream').Readable;
var assert = require('assert');


// test params
var ROWS = 100;
var ROW_SIZE = 100000;


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

function verifyRow(row) {
	var expectedSum = ((ROW_SIZE - 1) * ROW_SIZE) / 2 ;

	var values = row.split(',');

	var prefix = values[0].split('-')[0];

	var sum = 0;

	for (var i = 0; i < values.length; i++) {
		var parsed = values[i].split('-');

		assert.strictEqual(prefix, parsed[0]);

		if (isNaN(parsed[1])) {
			console.log('data verification failed, row with prefix %s has an invalid value: %s', prefix, values[i]);			
		}

		sum += parseInt(parsed[1]);		
	}

	assert.strictEqual(expectedSum, sum);
}

function createChunk(index, size)  {
	var data = '';

	for (var i = 0; i < size; i++) {
		if (i > 0)
			data += ',';

		data += index + '-' + i;
	}

	data += '\n';

	return data;
}

var log = fs.createWriteStream('./log');

var unpipeFires = 0;

var buffer = [];

for (var i = 0; i < ROWS; i++) {
	buffer.push(new TestStream(createChunk(i, ROW_SIZE)));
}

function flush() {

	if (buffer.length > 0) {
		//console.log('flushing');

		var stream = buffer.pop();

		log.once('unpipe', function (stream) {
			//console.log('log unpipe fired');
			unpipeFires++;
			flush();
		});

		stream.on('end', function() {
			//console.log('stream end fired');
			stream.unpipe(log);
		});

		stream.pipe(log, { end: false });
	} else {
		done();
	}
}

function done() {
	assert.strictEqual(unpipeFires, ROWS);

	var data = fs.readFileSync('./log', 'utf8');

	var parsed = data.split('\n');

	assert.strictEqual(ROWS + 1, parsed.length);
	assert.strictEqual(parsed[ROWS], '');
	parsed.pop(); // remove last empty row

	for (var l = 0; l < parsed.length; l++) {
		verifyRow(parsed[l]);
	}
}

flush();

process.on('exit', function() {
	fs.unlinkSync('./log');
});