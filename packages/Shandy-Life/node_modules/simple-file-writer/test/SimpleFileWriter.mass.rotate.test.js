var SimpleFileWriter = require('../lib/SimpleFileWriter');
var assert = require('assert');
var testutil = require('./testutil');
var fs = require('fs');
var config = require('./testconfig')['mass.rotate'];

// TEST PARAMS
var rows = config.rows;
var rowSize = config.rowSize;
var rowData = testutil.createRowData(rowSize);
var rotationSpeed = 1024;

describe('mass rotate test - ', function () {

	it('rotates', function (done) {

		var firstLog = testutil.newLogFilename();
		console.log('first log file: %s', firstLog);
		var writer = testutil.newWriter(firstLog);

		var filesToCheck = [];

		var checked = 0;
		var writes = 0;
		var rowsCountedFromDisk = 0;
		var start = Date.now();

		function callback() {

			writes++;

			if (writes === rows) {

				filesToCheck.push(writer.currentPath);

				console.log('average %s (writes/ms), files: %s', writes / (Date.now() - start), filesToCheck.length);

				for (var i = 0; i < filesToCheck.length - 1; i++) {
					checkFile(filesToCheck[i], rotationSpeed, done);
				}

				// last file has a different number of rows
				checkFile(filesToCheck[filesToCheck.length - 1], rows % rotationSpeed, done);

			} else if (writes % rotationSpeed === 0) {

				filesToCheck.push(writer.currentPath);

				var newFile = testutil.newLogFilename();

				writer.setupFile(newFile);
			}

		}


		function checkFile(file, expectedRows, done) {

			console.log('verifying data integrity in %s', file);

			function cb(err, rowsInThisFile) {
				rowsCountedFromDisk += rowsInThisFile;
				console.log('file %s has %s rows (%s/%s)', file, rowsInThisFile, rowsCountedFromDisk, rows);
				checked++;

				if (checked === filesToCheck.length) {
					assert.strictEqual(rowsCountedFromDisk, rows, 'expected to find ' + rows + ' in all rotated logs but found ' + rowsCountedFromDisk);
					done();
				}
			}

			fs.readFile(file, 'utf8', testutil.verifyDataIntegrity(expectedRows, rowSize, cb, file));
		}

		for (var x = 0; x < rows; x++)
		 	writer.write(rowData, callback);

		this.timeout(60000);
	});
});
