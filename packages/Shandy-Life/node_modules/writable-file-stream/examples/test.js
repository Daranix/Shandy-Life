var WritableStream = require('../lib/writable-file-stream');

var f = WritableStream('./test.txt', {
	bufferSize: 1000
});

f.write('test1');
f.write('test2');
f.reopen();
f.write('test3');
f.write('test4');
f.end();
