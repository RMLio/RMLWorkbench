var RDFGenerator = require('./RDFGenerator');
var method = MappingManager.prototype;

function MappingManager() {    
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


// generate rdf from the whole mapping file
method.generateRDFfromFile = (mappingfile, sources, callback) => {
	method.generateRDF(mappingfile, mappingfile.triples, sources, callback);
}

//generate rdf from triples
method.generateRDFfromTriples = (mappingfile, triples, sources, callback) => {
	method.generateRDF(mappingfile, triples, sources, callback);
}



// calls the rdfgenerator to execute the mapping 
method.generateRDF = function(mappingfile, triples, sources, callback) {
	var sourcenames = [];	//stores the filenames necessary sources
	var needed = [];		//store the necessary sources
	var addednames = []; 	//store filenames that are already added in case of doubles

	//extracts names of the sources that are needed
	for(var i = 0; i < mappingfile.triples.length; i++) {
		sourcenames.push(triples[i].logicalsource.rmlsource);
	}
	for(var i = 0; i < sources.length; i++) {
		for(var j = 0; j < sourcenames.length; j++) {
			//compares the filenames and checks if the source isn't already added to the list
			if(sources[i].filename == sourcenames[j] && addednames.indexOf(sources[i].filename) < 0) {
				//source is needed!
				addednames.push(sources[i].filename);
				needed.push(sources[i]);
			}
		}
	}
	//execute the mapping with the RDF generator
	var rdfgenerator = new RDFGenerator();
	rdfgenerator.execute(mappingfile, triples, needed, (rdf) => {
		callback(rdf);
	});
};

//exporting module
module.exports = MappingManager;