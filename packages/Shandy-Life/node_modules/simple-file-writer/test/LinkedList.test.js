var LinkedList = require('../lib/LinkedList');
var assert = require('assert');

assert.includes = function(collection, item, msg) {
	assert.ok(collection.indexOf(item) > -1, msg);
};

assert.isUndefined = function(what, msg) {
	assert.strictEqual(undefined, what, msg);
};

assert.isDefined = function(what, msg) {
	assert.ok(undefined !== what, msg);
};

assert.lengthOf = function(what, len, msg) {
	assert.strictEqual(len, what.length, msg);
};

var LinkedList = require('../lib/LinkedList');

describe('LinkedList', function () {
	describe('basic stuff', function() {
		var items = [];
		var topic = new LinkedList();
		
		it('one item in the list', function() {
			var item = {n:1};
			items.push(item);
			var node = topic.push(item);
			assert.strictEqual(1, topic.length);
			assert.strictEqual(node, topic.head);
			assert.strictEqual(node, topic.tail);
		});

		it('two items in the list', function() {
			var item = {n:2};
			items.push(item);
			var node = topic.push(item);
			assert.strictEqual(2, topic.length);		
			assert.strictEqual(node, topic.tail);
			assert.strictEqual(node, topic.tail.prev.next);	
		});

		it('many items in the list', function() {
			var item = {n:3};
			items.push(item);			
			var node = topic.push(item);
			assert.strictEqual(3, topic.length);		
			assert.strictEqual(node, topic.tail);
			assert.strictEqual(node, topic.tail.prev.next);	
			assert.strictEqual(node, topic.tail.prev.prev.next.next);	
		});
		
		it('iteration', function() {
			var count = 0;
			var self = this;
			topic.foreach(function(item) {
				count++;								
				assert.includes(items, item.data);				
			});

			assert.strictEqual(count, items.length, 'iteration failed to go over ' + items.length + ' items');
		});
		
		it('removing head', function() {
			var expectedHead = topic.head.next;
			topic.remove(topic.head);

			assert.strictEqual(2, topic.length);
			assert.strictEqual(expectedHead, topic.head);
			assert.strictEqual(undefined, topic.head.prev);
		});
		
		it('removing tail', function() {
			assert.strictEqual(2, topic.length);
			topic.remove(topic.head.next);
			assert.strictEqual(1, topic.length);
			assert.strictEqual(undefined, topic.head.next);
		});		
	});

	describe('internal linked list 2', function () {
		
		var topic = new LinkedList();
		for (var i = 0; i < 10; i++) {
			topic.push({ n: i });
		}
		
		it('add many items', function() {
			assert.strictEqual(10, topic.length);
		});

		it('remove item from the middle', function() {
			var item = topic.head.next.next.next; // item #4
			var expectedNext = topic.head.next.next.next.next; //item #5
			var expectedPrev = topic.head.next.next; // item #3

			topic.remove(item);
			assert.strictEqual(9, topic.length);
			assert.strictEqual(expectedPrev, expectedNext.prev);
			assert.strictEqual(expectedNext, expectedPrev.next);
		});

		it('break mid iteration', function() {
			
			var count = 0;
			var current;

			topic.foreach(function(item) {				
				count++;
				current = item;

				if (item.data.n === 8)
					return true; // break				
			});

			assert.strictEqual(8, current.data.n);
			assert.strictEqual(8, count);
		});
	});

	describe('last item removal bug', function() {
		
		var topic = new LinkedList();
		for (var i = 0; i < 10; i++) {				
			topic.push({ n: i });
		}

		it('remove everything and check state', function() {
			var iterator = topic.iterator();
			var current = undefined;

			while (current = iterator()) {
				topic.remove(current);								
			}

			assert.strictEqual(0, topic.length);
			assert.isUndefined(topic.head, 'head should have been undefined');
			assert.isUndefined(topic.tail, 'tail should have been undefined');
		});
	});


	describe('iterator', function () {
		var topic = new LinkedList();
		for (var i = 0; i < 10; i++) {				
			topic.push({ n: i });
		}

		it('assert iteration order', function() {
			var iterator = topic.iterator();
			var results = [];
			var current;
			var count = 0;
			while (current = iterator()) {
				assert.strictEqual(count++, current.data.n);				
				results.push(current.data);				
			}
			assert.lengthOf(results, 10);
		});
	});

	describe('data iterator', function () {
		var topic = new LinkedList();
		for (var i = 0; i < 10; i++) {				
			topic.push({ n: i });
		}

		it('assert iteration order', function() {
			var iterator = topic.dataIterator();
			var results = [];
			var current;
			var count = 0;
			while (current = iterator()) {
				assert.strictEqual( count++, current.n);				
				results.push(current);				
			}
			assert.lengthOf(results, 10);
		});
	});
	
	describe('find item node / nodes', function () {
		var topic = new LinkedList();
		for (var i = 0; i < 10; i++) {				
			topic.push({ n: i });
		}

		it('find an existing node', function() {
			var result = topic.findNode({ n : 1 }, function(d1, d2) {
				return d1.n === d2.n;
			});

			assert.isDefined(result);

			assert.strictEqual(1, result.data.n);
		});

		it('find a non-existing node', function() {
			var result = topic.findNode({ n : 100 }, function(d1, d2) {
				return d1.n === d2.n;
			});

			assert.isUndefined(result);
		});

		it('find several nodes', function() {
			var results = topic.findAllNodes(function(d1) {				
				return d1.n === 1 || d1.n === 2;
			});

			assert.lengthOf(results, 2);

			if (results[0].data.n === 1)
				assert.strictEqual(2, results[1].data.n);
			else if (results[0].data.n === 2)
				assert.strictEqual(1, results[1].data.n);
			else
				assert.fail('missing expected results');
		});
	});
	
	describe('push all', function () {

		var topic = new LinkedList();
	
		var arr = [];		
		for (var i = 0; i < 3; i++) {				
			arr.push({ n: i });
		}

		it('check everything is pushed', function() {

			topic.pushAll(arr);

			assert.strictEqual(0, topic.head.data.n);
			assert.strictEqual(1, topic.head.next.data.n);
			assert.strictEqual(2, topic.head.next.next.data.n);
			assert.strictEqual(3, topic.length);
		});
	});

	describe('pop', function () {

		var topic = new LinkedList();
		for (var i = 0; i < 3; i++) {				
			topic.push({ n: i });
		}

		it('pop', function() {
			topic.pop();
			
			assert.strictEqual(0, topic.head.data.n);
			assert.strictEqual(1, topic.head.next.data.n);			
		});
	});

	describe('shift', function () {

		var topic = new LinkedList();
		for (var i = 0; i < 3; i++) {				
			topic.push({ n: i });
		}

		it('shift', function() {
			topic.shift();
			
			assert.strictEqual(1, topic.head.data.n);
			assert.strictEqual(2, topic.head.next.data.n);			
		});
	});
});


