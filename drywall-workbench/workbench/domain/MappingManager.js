var RDFGenerator = require('./RDFGenerator');
var method = MappingManager.prototype;

function MappingManager() {
    this._rdfGenerator = new RDFGenerator();    
}

method.generateConfiguration = function(_inputs) {
	var configuration = {
							configuration: 'mapping',
							inputs: _inputs
						};
	return configuration;
};

method.executeConfiguration = function(configuration) {
	for(input in configuration.inputs) {
		method.generateRDF(input);
	}
};

method.generateRDF = function(input) {
	var publish = this._rdfGenerator.execute(input);
	return publish;
};

//exporting module
module.exports = MappingManager;