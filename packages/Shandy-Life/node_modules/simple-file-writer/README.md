simple file writer
===================

A swiss army file writer. Handles backpressure by buffering. You don't always want to do that.

Data will be written in the order it was fed to the writer.

Extensive tests are included.

###Install

```
npm install simple-file-writer
```

###usage example 1 - strings or buffers

```
	var SimpleFileWriter = require('simple-file-writer');

	var writer = new SimpleFileWriter('./1.log');

	writer.write('yey!');

	writer.setupFile('./2.log');

	writer.write(new Buffer('yey!'), function() {
		console.log('message written');
	});
```

### usage example 2 - streams
```
	var SimpleFileWriter = require('simple-file-writer');

	var writer = new SimpleFileWriter('./1.log');

	var http = require('http');

	http.createServer(function(request, response) {
		//pipe to file
		writer.write(request, function () {
			response.end();
		});
	});

	http.listen(8181, function() {
		console.log('server listening');
	});

```

### usage example 3 - MIX!
```
	var SimpleFileWriter = require('simple-file-writer');

	var writer = new SimpleFileWriter('./1.log');

	var http = require('http');

	http.createServer(function(request, response) {
		//pipe to file
		writer.write(request, function () {
			response.end();
		});

		writer.write('boo');

		writer.write(new Buffer('zzzzzzzzzzzzzzzzz'));
	});

	http.listen(8181, function() {
		console.log('server listening');
	});

```