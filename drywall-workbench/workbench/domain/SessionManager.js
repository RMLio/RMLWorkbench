var FetchManager = require('./FetchManager');
var MappingManager = require('./MappingManager');
var ScheduleManager = require('./ScheduleManager');
var schedule = require('node-schedule');
var method = SessionManager.prototype;
var mongoose = require('mongoose');

function SessionManager() {
    this._mappingManager = new MappingManager();
    this._fetchManager = new FetchManager();
    this._scheduleManager = new ScheduleManager();
}


//upload a mapping
method.uploadMapping = function(req, res) {
  var file = req.file;
  var userschema = req.app.db.models.User;
  var tripleschema = req.app.db.models.Triple;
  var mappingschema = req.app.db.models.Mapping;
  var user = req.user;
   
  console.log('[WORKBENCH LOG] User ' + req.user.username + ' tries to upload mapping file...');   

  //read the file and make mapping fields
  this._fetchManager.createMappingFields(req.file, (mapping) => {
    //save to db
    saveMapping(mapping, userschema, mappingschema, tripleschema, user, () => {
      res.send();
    });
  });

};

//save the mapping
var saveMapping = function(mapping, userschema, mappingschema, tripleschema, user, callback) {

  console.log('[WORKBENCH LOG]' + ' Mapping name: "'+mapping.filename+'"'); 

  var triples = mapping.triples; //hacky 
  mapping.triples = [];

        console.log('[WORKBENCH LOG]' + ' Creating new mapping entry in database...');

        //create the new mapping
        mappingschema.create(mapping, (err, mappingSchema) => {
          if(err) throw err;
          
          var amountOfTriples = triples.length;
          var amountDone = 0;

          console.log('[WORKBENCH LOG]' + ' Creating new triple entries in database...');

          //create new triples from the mapping and add to triples of the user
          for(var i = 0; i < triples.length; i++) {
            tripleschema.create(triples[i], (err, tripleSchema) => {
              if(err) throw err;
              mappingschema.update({_id : mappingSchema._id}, { $addToSet : { triples : tripleSchema }}, () => {
                  amountDone++;
              
                  console.log('[WORKBENCH LOG] Updating user mappingfiles...');

                  //when everything is created, write to user 
                  if(amountDone == amountOfTriples) {
                    userschema.update({_id : user._id}, { $addToSet : { mappingfiles : mappingSchema._id}}, () => {
                      if(err) throw err
                      callback();
                      console.log('[WORKBENCH LOG] Upload successful!');
                    });
                  }
              });        
              
              
            });   
          }       
        });     

}

//upload source
method.uploadSource = function(req, res) {

  var file = req.file;
  var userschema = req.app.db.models.User;
  var sourceschema = req.app.db.models.Source;
  var user = req.user;

  console.log('[WORKBENCH LOG] ' + user.username + ' tries to upload source file...');

  this._fetchManager.createSourceFields(file, (source) => {
    saveSource(source, userschema, sourceschema, user, () => {
      res.send();
    });
  });
};

//save source
var saveSource = function(source, userschema, sourceschema, user, callback) {

  console.log('[WORKBENCH LOG]' + ' Filename source: "'+source.filename+'"'); 

      //create new source from upload and add to sources of user

        console.log('[WORKBENCH LOG]' + ' Creating new source entry in database...');

        //create the new source
        sourceschema.create(source, (err, sourceSchema) => {
          if(err) throw err;      
          console.log('[WORKBENCH LOG]' + ' Updating user sourcefiles...');  
          userschema.update({_id : user._id}, { $addToSet : { sourcefiles : sourceSchema._id}}, () => {
            if(err) throw err
            callback();
            console.log('[WORKBENCH LOG] Upload successful!');
          });
      });
}

//upload source
method.uploadRDF = function(req, res) {

  var file = req.file;
  var userschema = req.app.db.models.User;
  var rdfschema = req.app.db.models.RDF;
  var user = req.user;

  console.log('[WORKBENCH LOG] ' + user.username + ' tries to upload RDF file...');

  this._fetchManager.createSourceFields(file, (rdf) => {
    saveRDF(rdf, userschema, rdfschema, user, () => {
      res.send();
    });
  });
};

//save source
var saveRDF = function(rdf, userschema, rdfschema, user, callback) {

  console.log('[WORKBENCH LOG]' + ' Filename rdf: "'+source.filename+'"'); 

      //create new source from upload and add to sources of user

        console.log('[WORKBENCH LOG]' + ' Creating new rdf entry in database...');

        //create the new source
        rdfschema.create(rdf, (err, rdfSchema) => {
          if(err) throw err;      
          console.log('[WORKBENCH LOG]' + ' Updating user rdf files...');  
          userschema.update({_id : user._id}, { $addToSet : { rdffiles : rdfSchema._id}}, () => {
            if(err) throw err
            callback();
            console.log('[WORKBENCH LOG] Upload successful!');
          });
      });
}

//generate an rdf, mapping id is needed as param
method.generateRDFfromFile = function(req, res) {
  console.log('[WORKBENCH LOG] Generating RDF...');
  var mapping_id = req.params.mapping_id;
  var sources = req.user.sourcefiles;
  var mappings = req.user.mappingfiles;
  var mapping = undefined;
  for(var i = 0; i < mappings.length; i++) {
    if(mappings[i]._id == mapping_id) {
      mapping = mappings[i];
    }
  }
  var rdf = this._mappingManager.generateRDFfromFile(mapping, sources, (rdf) => {
    req.app.db.models.User.findOne({ _id: req.user._id }, (err, doc) => {
          doc.rdfiles.push(rdf);
          doc.save();
          console.log('[WORKBENCH LOG] RDF generating succesful!');
        });
  });  
  res.send();
} 


method.generateRDFfromTriples = function(req, res) {
  console.log('[WORKBENCH LOG] Generating RDF...');
  var mapping_id = req.params.mapping_id;
  var sources = req.user.sourcefiles;
  var mappings = req.user.mappingfiles;
  for(var i = 0; i < mappings.length; i++) {
    if(mappings[i]._id == mapping_id) {
      mapping = mappings[i];
    }
  }
  var rdf = this._mappingManager.generateRDFfromTriples(mapping, req.body, sources, (rdf) => {
    req.app.db.models.User.findOne({ _id: req.user._id }, (err, doc) => {
          doc.rdfiles.push(rdf);
          doc.save();
          console.log('[WORKBENCH LOG] RDF generating succesful!');
        });
  });
  res.send();
}


/**
* Scheduling method
**/

method.addToSchedule = function(req, res) {

  console.log("[WORKBENCH LOG] Adding job!");
  var year = req.body.date.year;
  var month = req.body.date.month;
  var day = req.body.date.day;
  var hour = req.body.date.hour;
  var minute = req.body.date.minute;
  var date = new Date(year, month, day, hour, minute);

  /* TODO
  //variables for uploading
  var inputForUpload = req.body.upload.inputs;
  var mappingForUpload = req.body.upload.mappings;
  var rdfForUpload = req.body.upload.rdf;
  */

  //variables for mapping
  var mappingsFromTriples = req.body.mappingsFromTriples;
  var mappingsFromFile = req.body.mappingsFromFile;
  var sources = req.user.sourcefiles;
  var mappings = req.user.mappingfiles;
  var amountofjobs = mappingsFromTriples.length + mappingsFromFile.length;
  var jobsdone = 0;

  //schedule the job with date
  schedule.scheduleJob(date, () => {

    console.log("[WORKBENCH LOG] Executing jobs!")

    executemappings();    

  }); 

  /**
  * Schedule utility functions
  **/

  /*
  var uploadfiles = (callback) => {
    for(var i = 0; i < inputForUpload.length; i++) {
      
    }
    for(var i = 0; i < mappingForUpload.length; i++) {
      //if mapping needs to be mapped too => declared in executed
    }
    for(var i = 0; i < rdfForUpload.length; i++) {
      //if rdf needs to be published too => declared in published
    }
  }
  */

  var executemappings = () => {
    console.log("[WORKBENCH LOG] Execute mappings from file...")

    //execute scheduled mappings from file
    for(var i = 0; i < mappingsFromFile.length; i++) {      
      var mapping = method.findMapping(mappingsFromFile[i]._id, mappings);
      this._mappingManager.generateRDFfromFile(mapping, sources, (rdf) => {
        
        req.app.db.models.User.findOne({ _id: req.user._id }, (err, doc) => {
          
          doc.rdfiles.push(rdf);
          doc.save();
          console.log('[WORKBENCH LOG] RDF generating succesful!');

          //checking if all jobs are done
          jobsdone++;
          if(jobsdone == amountofjobs) {
            console.log("[WORKBENCH LOG] Jobs done!")
          }

        });

      });

    }

    console.log("[WORKBENCH LOG] Execute mappings from triples...")

    //execute scheduled mappings from triples
    for(var i = 0; i < mappingsFromTriples.length; i++) {
      mapping = method.findMapping(mappingsFromTriples[i]._id, mappings);
      
      console.log(mapping);
      this._mappingManager.generateRDFfromTriples(mapping, mappingsFromTriples[i].triples, sources, (rdf) => {

        req.app.db.models.User.findOne({ _id: req.user._id }, (err, doc) => {
          
          doc.rdfiles.push(rdf);
          doc.save();
          console.log('[WORKBENCH LOG] RDF generating succesful!');

          //checking if all jobs are done
          jobsdone++;
          if(jobsdone == amountofjobs) {
            console.log("[WORKBENCH LOG] Jobs done!")
          }

        });
      });
    }
  };
  
  res.send();
}

/**
* Clearing
**/

method.clearAll = function(req, res) {
  console.log('[WORKBENCH LOG] Clearing data of ' + req.user.username + '...');

  req.app.db.models.User.findOne({ _id: req.user._id }, (err, doc) => {
          doc.rdffiles = [];
          doc.mappingfiles = [];
          doc.sourcefiles = [];
          doc.save();
  });

  res.send();
};

method.clearSources = function(req, res) {
  console.log('[WORKBENCH LOG] Clearing sources of ' + req.user.username + '...');
  req.app.db.models.User.findOne({ _id: req.user._id }, (err, doc) => {
          doc.sourcefiles = [];
          doc.save();
  });
  res.send();
};

method.clearMappings = function(req, res) {
  console.log('[WORKBENCH LOG] Clearing mappings of ' + req.user.username + '...');
  req.app.db.models.User.findOne({ _id: req.user._id }, (err, doc) => {
          doc.mappingfiles = [];
          doc.save();
  });
  res.send();
};

method.clearRdf = function(req, res) {
  console.log('[WORKBENCH LOG] Clearing rdf of ' + req.user.username + '...');
  req.app.db.models.User.findOne({ _id: req.user._id }, (err, doc) => {
          doc.rdffiles = [];
          doc.save();
  });
  res.send();
};


/**
* Getters
**/

method.getInputs = function(req, res) {
  console.log('[WORKBENCH LOG] Retrieving sources of ' + req.user.username + '...');
  var amountRetrieved = 0;
  var sources = [];
  for(var i = 0; i < req.user.sourcefiles.length; i++) {
    req.app.db.models.Source.findOne({ _id: req.user.sourcefiles[i] }, (err, doc) => {
      amountRetrieved++;
      sources.push(doc);
      if(amountRetrieved == req.user.sourcefiles.length) { 
        console.log('[WORKBENCH LOG] Retrieving sources successful!');       
        res.send(sources);
      }
    });
  }
  
};

method.getMappings = function(req, res) {
  console.log('[WORKBENCH LOG] Retreiving mappings of ' + req.user.username + '...');
  var amountRetrieved = 0;
  var mappings = [];
  for(var i = 0; i < req.user.mappingfiles.length; i++) {
    req.app.db.models.Mapping.findOne({ _id: req.user.mappingfiles[i] }, (err, doc) => {
      amountRetrieved++;
      mappings.push(doc);
      if(amountRetrieved == req.user.mappingfiles.length) { 
        console.log('[WORKBENCH LOG] Retrieving mappings successful!');       
        res.send(mappings);
      }
    });
  }
};

method.getRdf = function(req, res) {
  console.log('[WORKBENCH LOG] Retreiving rdf of ' + req.user.username + '...');
  var amountRetrieved = 0;
  var rdf = [];
  for(var i = 0; i < req.user.mappingfiles.length; i++) {
    req.app.db.models.RDF.findOne({ _id: req.user.rdffiles[i] }, (err, doc) => {
      amountRetrieved++;
      rdf.push(doc);
      if(amountRetrieved == req.user.rdffiles.length) { 
        console.log('[WORKBENCH LOG] Retrieving rdf successful!');       
        res.send(rdf);
      }
    });
  }
};

/**
* Utility function
**/

method.findMapping = function(_id, mappings) {
  for(var i = 0; i < mappings.length; i++) {
    if(mappings[i]._id == _id) {
      return mappings[i];
    }
  }
}

//exporting module
module.exports = SessionManager;