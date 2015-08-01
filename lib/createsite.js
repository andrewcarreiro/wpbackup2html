var Promise = require('bluebird'),
	_ = require('lodash'),
	fs = require('fs');

var postTemplate = _.template(fs.readFileSync('./assets/post.ejs', { 'encoding' : 'utf-8' }));
var homeTemplate = _.template(fs.readFileSync('./assets/home.ejs', { 'encoding' : 'utf-8' }));


function createSite ( filePath ){
	return new Promise( function ( resolve, reject ){
		var feedparser = new require('feedparser')({ "normalize" : false });
		fs.createReadStream( filePath, { 'encoding' : 'utf8' }).pipe(feedparser);
		feedparser.on('readable', function (){
			var stream = this
				, meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
				, item;

			while (item = stream.read()) {
				createPage( item );
			}
		});

		feedparser.on('end', function (){
			generateHomePage();
			require('./imagefetcher')(imagesToFetch, './output/images/')
			.then(function (r) { resolve(r); })
			.catch(function (e){ reject(e); });
		});
	});
}


var nav = [];
var imagesToFetch = [];


function createPage( post ){
	var pubdate = post['wp:post_date']['#'];
	var filename = pubdate.substring(0,pubdate.indexOf(" "))+"-"+post['wp:post_name']["#"];
	var body = post["rss:description"]["#"] || post["content:encoded"]["#"];
	
	var comments = post["wp:comment"];
	if( !comments ){
		comments = [];
	}else if( !comments.length ){
		comments = [comments];
	}
	

	// add to image fetch list
	var imgRegexp = /(http:\/\/1morecastle\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/[A-Za-z_\-0-9\.]*\.(?:png|jpg|jpeg))/gi;
	var found_images = body.match(imgRegexp);
	if( found_images ){
		imagesToFetch = imagesToFetch.concat(found_images);
	}
	body = body.replace(/(http:\/\/1morecastle\.com\/wp-content\/uploads\/)/gi, "images/");
	
	var data = {
		title 		:	post["rss:title"]["#"],
		pubdate 	:	pubdate,
		filename 	:	filename,
		body 		:	body,
		categories 	:	post["rss:category"].map(function ( cat ){ return cat["#"]; }),
		link 		:	post["rss:link"]["#"],
		author		:	{
							name 	: post.meta["wp:author"]["wp:author_display_name"]["#"],
							email 	: post.meta["wp:author"]["wp:author_email"]["#"]
						},
		comments 	:	comments.map(function ( comment ){
							return {
								author 	: comment["wp:comment_author"]["#"],
								email 	: comment["wp:comment_author_email"]["#"],
								date 	: comment["wp:comment_date"]["#"],
								content : comment["wp:comment_content"]["#"]
							}
						})
	};



	// add to nav
	nav.push({
		title : post["rss:title"]["#"],
		filename : filename
	});

	console[nav.length === 1 ? "log" : "overwrite"]("Created "+nav.length+" HTML pages.");


	fs.writeFile("./output/"+data.filename+".html", postTemplate(data));
}

function generateHomePage(){
	fs.writeFile("./output/index.html", homeTemplate({ nav : nav }));
}


console.overwrite = function ( msg ){
	process.stdout.clearLine();  // clear current text
	process.stdout.cursorTo(0);
	process.stdout.moveCursor(0,-1);
	process.stdout.write(msg + "\n");
}


module.exports = {
	createSite : createSite
};