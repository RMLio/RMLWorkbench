var mongoose = require('mongoose');
var fs = require('fs');
var util = require('./Utility');
var parser = require('./TripleParser');


var exports = module.exports = {

  //upload rdf
  readRDFFields : function(file, callback) {
  	fs.readFile(file.path, 'utf8',(err, data) => { //using arrow function, this has no 'this'
        if (err) throw err;
        var rdf = {
                filename: file.originalname,
                data : data,
                _id : mongoose.Types.ObjectId()
                };
        fs.unlink(file.path, function (err) {
          if (err) throw err;
        });
        callback(rdf);
      });
  },

  //upload input
  readSourceFields : function(file, callback) {
    fs.readFile(file.path, 'utf8', (err, data) => { //using arrow function, this has no 'this'
        if (err) throw err;
        var input = {
                filename: file.originalname,
                data : data,
                _id : mongoose.Types.ObjectId()
                };        
        fs.unlink(file.path, function (err) {
        if (err) throw err;
        });
        callback(input);
      });
  },

  //set fields for mapping
  readMappingFields : function(file, callback) {
  	var mapping;
          fs.readFile(file.path, 'utf8', function (err, data) { //using arrow function, this has no 'this'
              if(err) {
                  callback(err, mapping)
              } else {
                  mapping = {
                      _id: mongoose.Types.ObjectId(),
                      filename: file.originalname,
                      data: data,
                      triples: []
                  };
                  //mapping.triples = util.parseTriples(mapping);
                  fs.unlink(file.path, function (err) {
                      if (err) callback(err, mapping);
                  });
                      parser.parseRMLMapping(data, function (err, data) {
                          if(err) {
                              callback(err,mapping);
                          } else {
                              mapping.parsedObject = data;
                              callback(err, mapping);
                          }

                      });
              }

          });

  },
  
    //set fields for mapping
  readScheduleFields : function(file, callback) {
  	var mapping;
  	fs.readFile(file.path, 'utf8', (err, data) => { //using arrow function, this has no 'this'
    		if (err) throw err;      
    		mapping = {
                _id : mongoose.Types.ObjectId(),
    						filename: file.originalname,
    						data : data,
                triples : []
    						};
        mapping.triples = util.parseTriples(mapping);
    		fs.unlink(file.path, function (err) {
      	if (err) throw err;
      	}); 
    		callback(mapping);
    	});
    	
    	
  }
  

}

