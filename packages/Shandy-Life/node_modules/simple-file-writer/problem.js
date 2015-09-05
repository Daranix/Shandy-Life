var fs = require('fs');
var testutil = require('./testutil.js');

var stream = fs.createWriteStream('testlogs/1.log');

var data = testutil.createRowData(3000);

var batch = 0;

// Write the data to the supplied writable stream 1MM times.
// Be attentive to back-pressure.
function writeOneMillionTimes(writer, data, encoding, callback) {
	var i = 100000;

	var last = i;

	write();

	function write() {
		//console.log(i)
		var ok = true;
		do {
			i -= 1;
			if (i === 0) {
				// last time!
				writer.write(data, encoding, callback);
			} else {
				// see if we should continue, or wait
				// don't pass the callback, because we're not done yet.
				ok = writer.write(data, encoding);
			}
		} while (i > 0 && ok);

		//console.log('rows: %s', last - i);
		last = i;

		if (i > 0) {
			// had to stop early!
			// write some more once it drains
			writer.once('drain', write);
		}
	}
}

writeOneMillionTimes(stream, data, null, function() {
	stream.end();
})
