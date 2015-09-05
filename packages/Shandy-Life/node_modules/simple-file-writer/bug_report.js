var fs = require('fs');

if (fs.existsSync('1.log'))
	fs.unlinkSync('1.log');

var stream = fs.createWriteStream('1.log');

var data = createRowData(3000);

function createRowData(rowSize) {

	var s1 = '';

	for (var s = 0; s < rowSize; s++) {
		if (s > 0)
			s1 += ',';

		s1 += s;
	}

	s1 += '\n';

	return s1;
};

// taken from node.js api docs
function writeBigFile(writer, data, encoding, callback) {
	// change to 500000 to see the other exception
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

writeBigFile(stream, data, null, function() {
	stream.end(function () {

		/************************************************************
			this call throws an error and never invokes the callback
		*************************************************************/
		fs.readFile('1.log', function(err, data) {
			console.log(err);
			console.log(data ? data.length : 0);
		});
	});
});
