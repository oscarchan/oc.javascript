// constants
MAX_TAG_SIZE = 5;
MIN_TAG_SIZE = 1;

// insert items with random 

db.objects.ensureIndex( { game_id: 1, tags:1, version: -1});
db.objects.ensureIndex( { game_id: 1, item_code: 1, version: -1}, {unique: true});

function add_sample(gameId, size) {
	return add_sample(gameId, size, 0);
}

function add_sample(gameId, size) {
    for(var i=0;i<size;i++) {
		var tags = generate_tags(1, 5);
		var versions = generate_versions(2, 4);

		for(var k in versions) {
			db.objects.insert( { game_id: gameId, item_code: "item_" + i, tags: tags, version: k} ); 

			if(tags.length > 1)
				tags.pop();
		}
	}
}

function generate_versions(min_size, max_size) {
	var size = nextInt(min_size, max_size);
	return range(1, size);
}

function generate_tags(min, max)  { 
    var tags = new Array(); 
    var num_tags = nextInt(min, max); 
    for(var i=0;i<num_tags;i++) { 
	var seed = nextInt(1, (i + 1) * 3);
	tags.push(String.fromCharCode('a'.charCodeAt() + i) + "" + seed); 
    } 
    return tags; 
}

result = db.objects.mapReduce(
	// map function
	function() {
		this.tags.forEach(
			function(t) {
				emit(t, { count: 1 });
			}
		);
	},
	// reduce function
	function(key, values) { 
		var total = 0;
		for (var i=0;i<values.length;i++) {
			total += values[i].count;
		}

		return { count: total };
	},
	// query function
	{ query: {game_id: 10 } }
);

function is_subset(bigger_set, smaller_set) {
	for(var i=0;i<smaller_set.length;i++) { 
		var s = smaller_set[i];
		if(bigger_set.indexOf(s)==-1) {
			return false;
		}
	}

	return true;
}

function get_by_tags(game_id, tags) {
	return db.objects.mapReduce(
		// map function
		function() {
			emit({ game_id: this.game_id, item_code: this.item_code }, this);
		},
		// reduce function
		function(key, values) { 
			var latest = values[0];
			
			for (var i=1;i<values.length;i++) {
				var current = values[i];
				
				if(latest.version > current.version)
					latest = current;
			}
			
			return latest;
		},
		
		// query function
		{ query: {game_id: 10, tags: tags } }
		
	);
}


db[result.result].find();




result = db.items.mapReduce(
	// map function
	function() {
	    emit({ sn_id: this.sn_id, game_id: this.game_id, item_code: this.item_code }, this);
	},
	// reduce function
	function(key, values) { 
		var latest = values[0];
		
		for (var i=1;i<values.length;i++) {
			var current = values[i];
			
			if(latest.version < current.version)
				latest = current;
		}
		
		return latest;
	},
	
		// query function
	{ query: {game_id: 69, tags: { $all: ["dev"] } } }
	
);


// db migration scripts

db.items.ensureIndex( { game_id: 1, tags:1, version: -1});
db.items.ensureIndex( { game_id: 1, item_code: 1, version: -1}, {unique: true}db
db.items.update( { $set: { version: 0 } );
