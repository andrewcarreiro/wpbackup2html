var Promise = require('bluebird'),
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	_ = require('lodash'),
	request = require('request'),
	colors = require('colors'),
	ProgressBar = require('progress'),
	outputdir = './output/';

function fetchImages ( imgs, optionalOutput ) {
	if(optionalOutput){ outputdir = optionalOutput; }
	console.log('Downloading images...');
	imgs = _.uniq(imgs);

	return fetchMachine(imgs);
}


function fetchMachine ( imgs ){
	var count = imgs.length;
	var curCount = 0;
	var bar = new ProgressBar(':bar :percent', {
		total : count
	});
	
	function newFetchRequest ( img ){
		curCount++;
		var imgName = img.substring(img.lastIndexOf("/")+1,img.length);
		return new Promise( function ( resolve, reject ){
			var path = img.match(/(\d{4}\/\d{2}\/)/gi)[0];
			mkdirp.sync(outputdir+path);
			var req = request(img).pipe(fs.createWriteStream(outputdir+path+imgName));

			req.on('finish', function () {
				bar.tick();
				if( imgs.length > 0 ){
					newFetchRequest(imgs.splice(0,1)[0])
						.then( function (){ resolve(); });
				}else{
					resolve();
				}
			});
		});
	}

	var MAX_CONCURRENCY = 10;
	var current = imgs.splice(0,MAX_CONCURRENCY);

	var promises = current.map( function ( img ){
		return newFetchRequest(img);
	});

	return Promise.all(promises).then(function(){ return curCount+" images downloaded."; });
}


module.exports = fetchImages;