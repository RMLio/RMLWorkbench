var Publisher = require('./Publisher');
var method = PublishManager.prototype;

function PublishManager() {
    this._publisher = new Publisher();    
}

method.generateConfiguration = function(_publishes) {
	var configuration = {
							configuration: 'publish',
							publishes: _publishes
						};
	return configuration;
}

method.executeConfiguration = function(configuration) {
	for(publish in configuration.publishes) {
		method.publish(publish);
	}
}

method.publish = function(publish) {
	//TODO
};

method.publishToLdf = function(publish) {
	//TODO
};

method.publishToVirtuoso = function(publish) {
	//TODO
};

//exporting module
module.exports = PublishManager;