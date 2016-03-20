var RDFGenerator = require('./RDFGenerator');
var method = MappingManager.prototype;

function MappingManager() {
    this._rdfGenerator = new RDFGenerator();    
}

method.generateConfiguration = function(input, triples) {
	var configuration = {
							configuration: 'mapping',
							input : input,
							triples: triples
						};
	return configuration;
};

method.executeConfiguration = function(configuration) {
	for(triple in configuration.triples) {
		method.generateRDF(input);
	}
};

// calls the rdfgenerator to execute the mapping
method.generateRDF = function(input, sources) {
	var sourcenames = [];
	var needed = [];
	var addednames = [];
	for(var i = 0; i < input.triples.length; i++) {
		sourcenames.push(input.triples[i].logicalsource.rmlsource);
	}
	for(var i = 0; i < sources.length; i++) {
		for(var j = 0; j < sourcenames.length; j++) {
			if(sources[i].filename == sourcenames[j] && addednames.indexOf(sources[i].filename) < 0) {
				//source is needed!
				addednames.push(sources[i].filename);
				needed.push(sources[i]);
			}
		}
	}
	var publish = this._rdfGenerator.execute(input, needed);
	return publish;
};

//exporting module
module.exports = MappingManager;