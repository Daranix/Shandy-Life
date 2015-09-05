var SimpleFileWriter = require('../lib/SimpleFileWriter');
var assert = require('assert');
var Readable = require('stream').Readable;
var $u = require('util');
var fs = require('fs');

var testutil = require('./testutil');
var uuid = require('node-uuid');
var ROWS = 100;
var ROW_SIZE = 2511;


describe('basic tests - write stuff to disk - ', function () {
	it('strings with specified encoding', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

		assert.ok(writer instanceof SimpleFileWriter);

	 	writer.write(new Buffer('boo').toString('base64'), 'base64');

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, 'base64', function(err, data) {
				if (err) {
					assert.fail(err);
				}

				assert.strictEqual(new Buffer('boo').toString('base64'), data)
				done();
			});
		}, 1000)
	});

	it('strings with a callback', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);
		var callbackCalled = false;

	 	writer.write('boo', function() {
	 		callbackCalled = true;
	 	});

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, function(err, data) {
				if (err) {
					assert.fail(err);
				}

				assert.deepEqual(new Buffer('boo'), data)
				assert.strictEqual(true, callbackCalled, 'callback not fired');
				done();
			});
		}, 1000)
	});


	it('strings with a callback and encoding specified', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);
		var callbackCalled = false;

	 	writer.write(new Buffer('boo').toString('base64'), 'base64', function() {
	 		callbackCalled = true;
	 	});

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, 'base64', function(err, data) {
				if (err) {
					assert.fail(err);
				}

				assert.strictEqual(new Buffer('boo').toString('base64'), data)
				assert.strictEqual(true, callbackCalled, 'callback not fired');
				done();
			});
		}, 1000)
	});

	it('buffers', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

	 	writer.write(new Buffer('boo'));

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, function(err, data) {
				if (err) {
					assert.fail(err);
				}

				assert.deepEqual(new Buffer('boo'), data)
				done();
			});
		}, 1000)
	});

	it('buffers with callback', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

		var callbackCalled = false;
	 	writer.write(new Buffer('boo'), function() {
	 		callbackCalled = true;
	 	});

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, function(err, data) {
				if (err) {
					assert.fail(err);
				}

				assert.deepEqual(new Buffer('boo'), data)
				assert.strictEqual(true, callbackCalled, 'callback not fired');
				done();
			});
		}, 1000)
	});


	it('streams', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

	 	writer.write(new testutil.TestStream(testutil.createRowData(20)));

		this.timeout(2000);
		setTimeout(function () {
			fs.readFile(logfile, 'utf8', testutil.verifyDataIntegrity(1, 20, done, writer.currentPath));
		}, 1000)
	});

	it('streams with callback', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

		var callbackFired = false;
	 	writer.write(new testutil.TestStream(testutil.createRowData(20)), function () {
	 		callbackFired = true;
	 	});

		this.timeout(2000);
		setTimeout(function () {
			assert.strictEqual(true, callbackFired);
			fs.readFile(logfile, 'utf8', testutil.verifyDataIntegrity(1, 20, done, writer.currentPath));
		}, 1000)
	});


	it('mix', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

	 	writer.write(new Buffer('boo\n'));
	 	writer.write(new testutil.TestStream('A' + testutil.createRowData(20)));
	 	writer.write(new testutil.TestStream('B' + testutil.createRowData(20)));
	 	writer.write('C' + testutil.createRowData(100));

		this.timeout(5000);
		setTimeout(function () {
			assert.strictEqual(0, writer._buffer.length);
			fs.readFile(logfile, 'utf8', function (err, data) {
				if (err)
					return assert.fail(err);

				var parsed = data.split('\n');

				assert.strictEqual(5, parsed.length);
				assert.strictEqual('', parsed[4]); // the empty row
				assert.strictEqual('boo', parsed[0]);
				assert.strictEqual('A', parsed[1][0]);
				assert.strictEqual('B', parsed[2][0]);
				assert.strictEqual('C', parsed[3][0]);

				done();
			});
		}, 1000)
	});

	it('ends', function (done) {
		this.timeout(15000);

		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

		for (var i = 0; i < 100000; i++) {
			writer.write('abracadabra!!!! abracadabra!!!! abracadabra!!!! abracadabra!!!!');
		}

		assert.ok(writer._buffer.length > 0);

		writer.end(done);

		try {
			writer.write('should not be written');
			assert.fail('as exception should have been thrown');
		} catch (e) {
			assert.ok(e);
		}

		console.log('if this test times out it means that there was a problem with the flushing, its either too slow or not happening at all');
	});

	it('can be paused and resumed', function (done) {
		var logFile = testutil.newLogFilename()
		var writer = testutil.newWriter(logFile);

		writer.pause()

		writer.write('123')
		writer.write('123')
		writer.write('123')

		assert.strictEqual(writer._buffer.length, 3)

		fs.readFile(logFile, 'utf8', function(err, data) {
			if (err) return done(err)

			assert(!data)

			writer.resume()

			setTimeout(function () {
				assert.strictEqual(writer._buffer.length, 0)
				
				fs.readFile(logFile, 'utf8', function(err, data) {
					if (err) return done(err)

					assert.strictEqual(data, '123123123')
					done()
				})
			}, 500)	
		})		
	})
});