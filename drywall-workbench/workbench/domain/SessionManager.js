var FetchManager = require('./FetchManager');
var MappingManager = require('./MappingManager');
var ScheduleManager = require('./ScheduleManager');
var schedule = require('node-schedule');
const chalk = require('chalk');
var method = SessionManager.prototype;
var mongoose = require('mongoose');

//this class represents a single workbench session
function SessionManager() {
    this._mappingManager = new MappingManager();
    this._fetchManager = new FetchManager();
    this._scheduleManager = new ScheduleManager();
}


//fetch a mapping
method.fetchMapping = function(req, res) {
   
  console.log('[WORKBENCH LOG] ' + req.user.username + ' tries to upload mapping file...');   

  var mapping = this._fetchManager.uploadMapping(req.file, (mapping) => {

      console.log('[WORKBENCH LOG]' + ' Mapping name: "'+mapping.filename+'"'); 
      var triples = mapping.triples; //hacky 
      mapping.triples = [];
      req.app.db.models.User.findOne({ _id: req.user._id }, (err, user) => {
        req.app.db.models.Mapping.create(mapping, (err, mappingSchema) => {
          if(err) throw err;
          var mappingSchema = mappingSchema;
          var amountOfTriples = triples.length;
          var amountDone = 0;
          for(var i = 0; i < triples.length; i++) {
            req.app.db.models.Triple.create(triples[i], function(err, tripleSchema) {
              console.log(tripleSchema);
              mappingSchema.triples.push(tripleSchema);
              amountDone++;
              if(amountDone == amountOfTriples) {
                console.log(mappingSchema);
                user.mappingfiles.push(mappingSchema);
                user.save();
              }
            });
          }
        });
        

      });
      console.log('[WORKBENCH LOG] Upload succesful!');

   });  

  res.send();
};

//fetch a source
method.fetchInput = function(req, res) {

  console.log('[WORKBENCH LOG] ' + req.user.username + ' tries to upload source file...');

  var input = this._fetchManager.uploadInput(req.file, (input) => {

    console.log(chalk.green('[WORKBENCH LOG]') + 'Source name: "'+input.filename+'"');
    req.app.db.models.User.findOne({ _id: req.user._id }, (err, doc) => {
        doc.sourcefiles.push(input);
        doc.save();
    });

    console.log('[WORKBENCH LOG] Upload succesful!');

  });

  res.send();
};

//fetch a rdf
method.fetchRDF = function(req, res) {

  		var rdf = _fetchManager.uploadRDF(req.file, (rdf) => {

        console.log(chalk.green('[WORKBENCH LOG]') + 'RDF name: "'+rdf.filename+'"');
        req.app.db.models.User.findOne({ _id: req.user._id }, (err, doc) => {
          doc.rdfiles.push(rdf);
          doc.save();
        });
        console.log('[WORKBENCH LOG] Upload succesful!');

      });

  res.send();
};

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
          doc.rdfiles = [];
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
          doc.rdfiles = [];
          doc.save();
  });
  res.send();
};


/**
* Getters
**/

method.getInputs = function(req, res) {
  console.log('[WORKBENCH LOG] Retrieving sources of ' + req.user.username + '...');
  res.send(req.user.sourcefiles);
};

method.getMappings = function(req, res) {
  console.log('[WORKBENCH LOG] Retreiving mappings of ' + req.user.username + '...');
  res.send(req.user.mappingfiles);
};

method.getRdf = function(req, res) {
  console.log('[WORKBENCH LOG] Retreiving rdf of ' + req.user.username + '...');
  res.send(req.user.rdfiles);
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