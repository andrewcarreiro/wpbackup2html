var yargs = require('yargs'),
	fs = require('fs'),
	colors = require('colors');

var argv = yargs
	.usage('Convert Wordpress backups to functional static HTML sites.\nUsage: $0 [options]')
	.demand('f')
	.alias('f', 'file')
	.describe('f', 'Load a Wordpress XML file.')
	.help('h')
	.alias('h', 'help')
.argv;


if( argv._.length != 0 ){
	yargs.showHelp();
	process.exit(1);
}

require('rmrf')('./output');
fs.mkdirSync('./output');
fs.createReadStream('./assets/basic.css').pipe(fs.createWriteStream('./output/basic.css'));
fs.createReadStream('./assets/bootstrap.min.css').pipe(fs.createWriteStream('./output/bootstrap.min.css'));

require('./lib/createsite').createSite(argv.f)
	.then( function ( result ){
		console.log(result);
		console.log("Site created. View it in the output directory.".green);
	})
.catch ( function ( err ){
	console.log(err.red);
	process.exit(1);
});