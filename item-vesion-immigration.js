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

function nextInt(min, max) { 
	return Math.floor(Math.random() * (max - min) + 0.5 ) + min; 
} 

function range(start, end) {
	var range = new Array();
	for(var i=start;i<=end;i++) {
		range.push(i);
	}

	return range;
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




result = db.objects.mapReduce(
	// map function
	function() {
		emit({ game_id: this.game_id, item_code: this.item_code }, this);
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
	{ query: {game_id: 10, tags: { $all: ["a1"] } } }
	
);


// db migration scripts

// step 1: clone database
db.copyDatabase('appdata', 'temp', 'localhost');
db.copyDatabase('appdata', 'appdata_backup_q1_s6', 'localhost');

// step 2: switch to temp
use temp;

// step 3: dropIndexes
db.items.dropIndexes();

// update for all versions
db.items.update( {version: null },  { $set: { version: 0 } }, false, true);

// step 4: reindexing
db.items.ensureIndex( { id: 1, version: -1 }, {unique: true, name: "items_id_version_udx" });
db.items.ensureIndex( { game_id: 1, item_code: 1, version: -1, sn_id: 1}, {unique: true, name: "items_sn_id_game_id_item_code_version_udx"});
db.items.ensureIndex( { game_id: 1, tags:1}, {name: "items_game_id_tags_idx" } );
db.items.ensureIndex( { game_id: 1, name:1, sn_id: 1}, {name: "items_sn_id_game_id_name_idx" } );


// step 5: locking 
use admin
db.runCommand( { "fsync": 1, "lock": 1 } );

// step 6: replace appdata by temp (no renaming in database) 
use appdata
db.dropDatabase();
db.copyDatabase('temp', 'appdata', 'localhost');

// step 7: unlocking
use admin
db.$cmd.sys.unlock.findOne();
db.currentOp();




