const fs = require('fs');
const async = require('async');

function getNodes(callback) {
	fs.readFile('stack_network_nodes.csv', function(err, data) {
		if (err) {
			callback(err);
		}
		var techs = {};
		var data = data.toString();
		data = data.split('\n');
		data = data.slice(1, data.length-1);
		data.forEach(function(tech, i) {
			tech = tech.split(',');
			techs[tech[0]] = {};
			techs[tech[0]]['group'] = tech[1];
			techs[tech[0]]['size'] = tech[2];
			techs[tech[0]]['links'] = [];

		})
		callback(null, techs);
	});
}

function makeLinks(techs, callback) {
	fs.readFile('stack_network_links.csv', function(err, data) {
		if (err) {
			callback(err);
		}
		var data = data.toString();
		data = data.split('\n');

		data = data.slice(1, data.length-1);
		data.forEach(function(link, i) {
			link = link.split(',');
			if (!techs.hasOwnProperty(link[0])) {
				console.log('the techs did not contain this tech: ' + link)
				return;
			}
			linkVals = {}
			linkVals['tech'] = link[1];
			linkVals['size'] = link[2];
			techs[link[0]]['links'].push(linkVals);
		})
		callback(null, techs);
	});
}

async.waterfall([
    getNodes,
    makeLinks
], function (error, result) {
    if (error) {
        console.log(error)
    }
    for (key in result) {
    	result[key]['links'].sort(function(a,b) {
    		return b['size'] - a['size'];
    	})
    }
	fs.writeFile('techs.json', JSON.stringify(result), (err) => {
		if (err) throw err;
		console.log("made the file!")
	});
});