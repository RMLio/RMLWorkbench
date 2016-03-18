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
method.generateRDF = function(input, triples) {
	var publish = this._rdfGenerator.execute(input);
	return publish;
};

//exporting module
module.exports = MappingManager;