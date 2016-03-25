'use strict';

var mongoose = require('mongoose');

var exports = module.exports =  {
	/**
 * Utility functions
 **/

//retrieving files from database by id and schema
retrieveFile : function(idfile, schema, callback) {
    schema.findOne({
        _id: idfile
    }, (err, doc) => {
        if (err) throw err;
        callback(doc);
    });
},

//retrieving files from database by id and schema
retrieveFiles : function(idfiles, schema, callback) {
    var amountRetrieved = 0;
    var files = [];
    if (idfiles.length == 0) {
        callback(files);
    }
    for (var i = 0; i < idfiles.length; i++) {
        schema.findOne({
            _id: idfiles[i]
        }, (err, doc) => {
            amountRetrieved++;
            files.push(doc);
            if (amountRetrieved == idfiles.length) {
                callback(files);
            }
        });
    }
},

//parse triples of a local mapping file
  parseTriples : function(mapping) {
    var content = mapping.data.replace(/(?:\r\n|\r|\n|\t)/g, ' ');
    content = content.split(" ");
    var triples = [];
    var triple = false;
    var newTriple;

    //parse mapping
    for(var i = 0; i < content.length; i++) {

      //check for triple name
      if(!triple && content[i].substring(0, 2) == '<#') {
        //new triple found
        newTriple = {
          _id : mongoose.Types.ObjectId(),
          triplename : content[i].replace(/[><#]+/g, ''),    
        };
        triple = true;
      }

      //check for logicalsource
      if(triple && content[i] == 'rml:logicalSource') {
        newTriple.logicalsource = {};
      }

      //check for rml:source 
      if(triple && content[i] == 'rml:source') {
          var source = content[i+1].replace(/['";]+/g, '');
          //check if local or not
          if(source.substring(0, 4) == 'http' || source.substring(0,2) == '<#') {
              newTriple.local = false;
          }
          source.replace(/[><#]+/g, '');
          var regex = /(\w*\.\w*)$/;  //match filename
          var match = regex.exec(source);
          newTriple.logicalsource.rmlsource = match[0];
      }

      //check for rml:referenceFormulation
      if(triple && content[i] == 'rml:referenceFormulation') {
          var reference = content[i+1].replace(/['";]+/g, '');        
          reference.replace(/[><#]+/g, '');
          newTriple.logicalsource.rmlreferenceformulation = reference;
      }

      //check for iterator
      if(triple && content[i] == 'rml:iterator') {
          var iterator = content[i+1].replace(/['";]+/g, '');        
          newTriple.logicalsource.rmliterator = iterator;
      }

      //check for sqlversion
      if(triple && content[i] == 'rr:sqlversion') {
          var version = content[i+1].replace(/['";]+/g, '');        
          newTriple.logicalsource.rrsqlversion = version;
      }

      //check for query
      if(triple && content[i] == 'rr:query') {
          var queryn = content[i+1].replace(/['";]+/g, '');        
          newTriple.logicalsource.rrquery = query;
      }

      //check if triple has ended
      if(content[i] == '].') {
        triple = false;
        triples.push(newTriple);
      }

      //TO DO SERVICE DATADESCRIPTION
      
    }
    return triples;
  }


}