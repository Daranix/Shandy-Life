# Writable Stream

Writable file stream with memory buffer and reopen features.

## Example

``` js
var WritableFileStream = require('writable-file-stream');

var f = WritableFileStream('./test.txt', {
	bufferSize: 1000
});

f.write('test');
f.write('test');
f.reopen(); // <- writes here
f.write('test');
f.write('test');
f.end(); // <- writes here

```
