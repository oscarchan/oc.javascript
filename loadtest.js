function nextInt(min, max) { 
	return Math.floor(Math.random() * (max - min) + 0.5 ) + min; 
} 

function nextPaddedId(min, max) {
    n = nextInt(min, max);
    format = max.toString().replace(/\w/g, '0');

    return padding(format, n);
}

function padding(foramt, n) {
    s = n.toString();
    len = s.length;

    if (len < format.length) {
	s = (format + s).slice(-format.length);
    }
    
    return s;
}

function range(start, end) {
	var range = new Array();
	for(var i=start;i<=end;i++) {
		range.push(i);
	}

	return range;
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

rand_min = vars.get('SAMPLE_MIN');
rand_max = vars.get('SAMPLE_MAX');

rand_num = nextPaddedId(rand_min, rand_max);

log.info('rand num ' + rand_num);

vars.put('RAND_NUM', rand_num);