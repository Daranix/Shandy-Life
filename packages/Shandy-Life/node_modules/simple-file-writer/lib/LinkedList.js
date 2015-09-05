function Node(data) {
	this.data = data;
}

function LinkedList() {
	this.head = undefined;		
	this.tail = undefined;
	this.length = 0;
}

LinkedList.prototype.push = function(item) {
	var node = new Node(item);

	if (this.length > 0) {		
		this.tail.next = node;		
		node.prev = this.tail;
		this.tail = node;
	} else {
		this.head = node;
		this.tail = node;
	}
	
	this.length++;

	return node;
};

LinkedList.prototype.pushAll = function(arr) {
	for (var i = 0; i < arr.length; i++)
		this.push(arr[i]);
};

LinkedList.prototype.foreach = function(fn) {
	var current = this.head;
	while (current) {
		var next = current.next;
		var doBreak = fn(current);
		if (doBreak)
			break;
		current = next;
	}
};

LinkedList.prototype.iterator = function() {
	var next = this.head;
	
	return function() {
		
		if (next) {
			var t = next;
			next = next.next;
			return t;
		}
	};
};

LinkedList.prototype.dataIterator = function() {
	var next = this.head;
	
	return function() {
		if (next) {
			var data = next.data;
			next = next.next;
			return data;
		}
	};
};


// default strict equality
function defaultFindNodePredicate(d1, d2) {
	return d1 === d2;
}

LinkedList.prototype.findNode = function(data, predicate) {
	var current = this.head;

	if (arguments.length === 1) 
		predicate = defaultFindNodePredicate	

	while (current !== undefined) {
		if (predicate(current.data, data)) {
			return current;
		}

		current = current.next;
	}


	return undefined;
};

LinkedList.prototype.findAllNodes = function(predicate) {
	var current = this.head;
	var results = [];

	while (current !== undefined) {
		if (predicate(current.data)) {
			results.push(current);
		}

		current = current.next;
	}

	return results;
};

LinkedList.prototype.remove = function(node) {

	if (!(node instanceof Node))
		throw new TypeError('not an instance of node');

	if (this.length === 0)
		return;

	if (this.head === node) {		
		// its the head
		this.head = this.head.next;
		if (this.head) {
			this.head.prev = undefined;

			if (!this.head.next)
				this.tail = this.head; // only 1 item remains

		} else {
			this.tail = undefined; // was the last, now its empty - so clean tail reference too
		}
		
		this.length--;

	} else if (this.tail === node) {
		this.tail = this.tail.prev;
		this.tail.next = undefined;
		this.length--;
	} else if (node.prev && node.next) {		
		var prev = node.prev;
		var next = node.next;
		prev.next = next;
		next.prev = prev;		
		this.length--;
	} 

	node.prev = undefined;
	node.next = undefined;

	return node;
};

LinkedList.prototype.shift = function() {
	if (this.head)
		return this.remove(this.head);	
};

LinkedList.prototype.pop = function() {
	if (this.tail)
		return this.remove(this.tail);	
};

module.exports = LinkedList;