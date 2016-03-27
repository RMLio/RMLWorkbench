var schedule = require('node-schedule');
var mongoose = require('mongoose');
var util = require('./Utility');
var mapper = require('./Mapper');
var reader = require('./Reader');

var exports = module.exports = {


  //upload a mapping
  uploadMapping : function(req, res) {
      var file = req.file;
      var user = req.user;
      var models = req.app.db.models;
      var saver = require('./Saver');
      console.log('[WORKBENCH LOG] User ' + req.user.username + ' tries to upload mapping file...');
      //read the file and make mapping fields
      reader.readMappingFields(req.file, (mapping) => {
          //save to db
          saver.saveMapping(mapping, models, user, () => {
              res.send();
          });
      });

  },

  //upload source
  uploadSource : function(req, res) {
      var file = req.file;
      var user = req.user;
      var models = req.app.db.models;
      var saver = require('./Saver');
      console.log('[WORKBENCH LOG] ' + user.username + ' tries to upload source file...');
      //create source fields
      reader.readSourceFields(file, (source) => {
          saver.saveSource(source, models, user, () => {
              res.send();
          });
      });
  },

  //upload source
  uploadRDF : function(req, res) {
      var file = req.file;
      var userschema = req.app.db.models.User;
      var rdfschema = req.app.db.models.RDF;
      var user = req.user;
      var saver = require('./Saver');
      console.log('[WORKBENCH LOG] ' + user.username + ' tries to upload RDF file...');
      //create rdf fields
      reader.readRDFFields(file, (rdf) => {
          saver.saveRDF(rdf, req.app.db.models, user, () => {
              res.send();
          });
      });
  },


  //generate an rdf, mapping id is needed as param
  executeMappingFromFile : function(req, res) {
      var mapping_id = req.params.mapping_id;
      var sources = req.user.sourcefiles;
      var models = req.app.db.models;
      var user = req.user;
      var saver = require('./Saver');

      //execute the mapping
      mapper.executeMappingFromFile(mapping_id, models, user, sources, (rdf) => {
          saver.saveRDF(rdf, models, user, () => {
            res.send();          
          });

      });
  },

  //TODO 
  generateRDFfromTriples : function(req, res) {
      console.log('[WORKBENCH LOG] Generating RDF...');
      var mapping_id = req.params.mapping_id;
      var sources = req.user.sourcefiles;
      var mappings = req.user.mappingfiles;
      for (var i = 0; i < mappings.length; i++) {
          if (mappings[i]._id == mapping_id) {
              mapping = mappings[i];
          }
      }
      var rdf = mapper.executeFromTriples(mapping, req.body, sources, (rdf) => {
          req.app.db.models.User.findOne({
              _id: req.user._id
          }, (err, doc) => {
              doc.rdfiles.push(rdf);
              doc.save();
              console.log('[WORKBENCH LOG] RDF generating succesful!');
          });
      });
      res.send();
  },


  /**
   * Scheduling method
   **/

  addToSchedule : function(req, res) {

      console.log("[WORKBENCH LOG] Adding job!");
      var year = req.body.date.year;
      var month = req.body.date.month;
      var day = req.body.date.day;
      var hour = req.body.date.hour;
      var minute = req.body.date.minute;
      var date = new Date(year, month, day, hour, minute);

      var sources = req.user.sourcefiles;
      var models = req.app.db.models;
      var user = req.user;
      var mappingsFromTriples = req.body.mappingsFromTriples;
      var mappingsFromFile = req.body.mappingsFromFile;    
      var mapper = require('./Mapper');

      //schedule the job with date
      schedule.scheduleJob(date, (err) => {
          if(err) throw err;
          console.log("[WORKBENCH LOG] Executing jobs!");
          mapper.executeMultipleMappings(mappingsFromFile, mappingsFromTriples, sources, models, user);
      });

      res.send();
  },

  /**
   * Clearing (does not destroy individual data in the db, only the reference will be deleted)
   **/

  //clear all data of the user
  clearAll : function(req, res) {
      console.log('[WORKBENCH LOG] Clearing data of ' + req.user.username + '...');
      req.app.db.models.User.update({
          _id: req.user._id
      }, {"$set": {"sourcefiles": [], "mappingfiles": [], "rdffiles": []}}, (err, doc) => {
          if(err) throw err;
          res.send();
          console.log('[WORKBENCH LOG] Data cleared!');
      });      
  },

  //clear sources of the user
  clearSources : function(req, res) {
      console.log('[WORKBENCH LOG] Clearing sources of ' + req.user.username + '...');
      req.app.db.models.User.update({
          _id: req.user._id
      }, {"$set": {"sourcefiles": []}}, (err, doc) => {
          if(err) throw err;
          res.send();
          console.log('[WORKBENCH LOG] Data cleared!');
      });
  },

  //clear mappings
  clearMappings : function(req, res) {
      console.log('[WORKBENCH LOG] Clearing mappings of ' + req.user.username + '...');
      req.app.db.models.User.update({
          _id: req.user._id
      }, {"$set": {"mappingfiles": []}}, (err, doc) => {
          if(err) throw err;
          res.send();
          console.log('[WORKBENCH LOG] Data cleared!');
      });
  },
  
  //clear rdfs
  clearRdf : function(req, res) {
      console.log('[WORKBENCH LOG] Clearing rdf of ' + req.user.username + '...');
      req.app.db.models.User.update({
          _id: req.user._id
      }, {"$set": {"rdffiles": []}}, (err, doc) => {
          if(err) throw err;
          res.send();
          console.log('[WORKBENCH LOG] Data cleared!');
      });
  },


  /**
   * Getters
   **/

  //get sourcefiles from database by id
  getInputs : function(req, res) {
      var sourceschema = req.app.db.models.Source;
      var idsources = req.user.sourcefiles;
      console.log('[WORKBENCH LOG] Retrieving sources of ' + req.user.username + '...');
      util.retrieveFiles(idsources, sourceschema, (sources) => {
          console.log('[WORKBENCH LOG] Retrieving sources successful!');
          res.send(sources);
      });
  },

  //get mappingfiles from database by id
  getMappings : function(req, res) {
      var mappingschema = req.app.db.models.Mapping;
      var idmappings = req.user.mappingfiles;
      console.log('[WORKBENCH LOG] Retrieving mappings of ' + req.user.username + '...');
      util.retrieveFiles(idmappings, mappingschema, (mappings) => {
          console.log('[WORKBENCH LOG] Retrieving mappings successful!');
          res.send(mappings);
      });
  },

  //get rdffiles from database by id
  getRdf : function(req, res) {
      var rdfschema = req.app.db.models.RDF;
      var idrdf = req.user.rdffiles;
      console.log('[WORKBENCH LOG] Retrieving rdf (' + idrdf.length + ') of ' + req.user.username + '...');
      util.retrieveFiles(idrdf, rdfschema, (rdf) => {
          console.log('[WORKBENCH LOG] Retrieving rdf successful!');
          res.send(rdf);
      });
  }

}