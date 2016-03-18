var Fetcher = require('./Fetcher'); //maybe not necessary
var method = InputManager.prototype;


function InputManager() {
    this._fetcher = new Fetcher();    
}

method.generateConfiguration = function(_uploads, _downloads) {
	var configuration = {
							configuration: 'input',
							uploads: _uploads,
							downlaods: _downloads
						};
	return configuration;
}

method.executeConfiguration = function(configuration) {
	for(upload in configuration.uploads) {
		method.uploadInput(upload);
	}

	for(download in configuration.downloads) {
		method.downloadInput(download);
	}
};

method.uploadInput = function(upload) {
	//TODO
	return input;
};

method.downloadFromAPI = function() {
	//TODO
	return input;
};

method.downloadFromURI = function(download) {
	//TODO
	return input;
};

//exporting module
module.exports = InputManager;