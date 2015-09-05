var SimpleFileWriter = require('../lib/SimpleFileWriter');
var assert = require('assert');
var testutil = require('./testutil');

describe('concurrent rotation', function (done) {
	it('rotates with different filenames', function (done) {
		this.timeout(25000)

		var writer = new SimpleFileWriter(testutil.newLogFilename())

		var i1 = setInterval(function () {
			console.log(1)
			writer.setupFile(testutil.newLogFilename())
		}, 100)		

		var i2 = setInterval(function () {
			writer.write(testutil.createRowData(100))
		}, 10)

		setTimeout(function () {
			clearInterval(i1)
			clearInterval(i2)
			writer.end(done)
		}, 10000)
	})

	it('rotates with same filename', function(done) {
		this.timeout(25000)
		var filename = testutil.newLogFilename()

		var writer = new SimpleFileWriter(filename)

		var i1 = setInterval(function () {
			console.log(1)
			writer.setupFile(filename)
		}, 100)		

		var i2 = setInterval(function () {
			writer.write(testutil.createRowData(100))
		}, 10)

		setTimeout(function () {
			clearInterval(i1)
			clearInterval(i2)
			writer.end(done)
		}, 10000)	
	})
})