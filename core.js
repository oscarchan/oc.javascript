function nextInt(min, max) { 
	return Math.floor(Math.random() * (max - min) + 0.5 ) + min; 
} 

function nextPaddedId(min, max) {
    var n = nextInt(min, max);

    var format = '000000000000000000000000'.substring(0, max.toString().length);

    return padding(format, n);
}

function padding(foramt, n) {
    var s = n.toString();
    var len = s.length;

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
