var SimpleFileWriter = require('../lib/SimpleFileWriter');
var assert = require('assert');
var testutil = require('./testutil');
var fs = require('fs');
var config = require('./testconfig')['stress.test'];

// TEST PARAMS
var rows = config.rows;
var rowSize = config.rowSize;
var rowData = testutil.createRowData(rowSize);

Error.stackTraceLimit = 1000;

describe('stress string test - ', function () {

	it('write lots of strings', function (done) {
		var logfile = testutil.newLogFilename();
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

		for (var x = 0; x < rows; x++)
		 	writer.write(rowData, callback);

		this.timeout(160000);

	});
});
