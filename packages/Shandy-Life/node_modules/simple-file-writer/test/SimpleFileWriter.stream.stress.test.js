var SimpleFileWriter = require('../lib/SimpleFileWriter');
var assert = require('assert');
var testutil = require('./testutil');
var fs = require('fs');
var config = require('./testconfig')['stress.test'];

// TEST PARAMS
var rows = config.rows;
var rowSize = config.rowSize;
var rowData = testutil.createRowData(rowSize);

Error.stackTraceLimit = 50;

describe('stress stream test - ', function () {
	it('write lots of streams (pipes them)', function (done) {
		var logfile = testutil.newLogFilename();
		var writer = testutil.newWriter(logfile);

		var writes = 0;

		var start = Date.now();

		function callback() {

			if (++writes === rows) {
				console.log('average %s (writes/ms)', writes / (Date.now() - start));
				console.log('verifying data integrity');
				fs.readFile(logfile, 'utf8', testutil.verifyDataIntegrity(rows, rowSize, done, logfile));
			}
		}

		for (var x = 0; x < rows; x++) {
			var s = new testutil.TestStream(rowData);
			writer.write(s, callback);
		}

		this.timeout(25000);
	});
});
