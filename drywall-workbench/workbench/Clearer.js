'use strict'

var mongoose = require('mongoose');

var exports = module.exports = {
 
   /**
   * Clearing (does not destroy individual data in the db, only the reference will be deleted)
   **/

  //clear all data of the user
  clearAll : function(user, models, callback) {
      console.log('[WORKBENCH LOG] Clearing all data of ' + user.username + '...');
      models.User.update({
          _id: user._id
      }, {"$set": {"sourcefiles": [], "mappingfiles": [], "rdffiles": []}}, (err, doc) => {
          if(err) throw err;          
          console.log('[WORKBENCH LOG] Data cleared!');
          callback();
      });      
  },

  //clear sources of the user
  clearAllSources : function(user, models, callback) {
      console.log('[WORKBENCH LOG] Clearing all sources of ' + user.username + '...');
      models.User.update({
          _id: user._id
      }, {"$set": {"sourcefiles": []}}, (err, doc) => {
          if(err) throw err;          
          console.log('[WORKBENCH LOG] Data cleared!');
          callback();
      });
  },
  
  //clear a selection of sources
  clearSources: function(user, models, sources, callback) {
      console.log('[WORKBENCH LOG] Clearing sources of ' + user.username + '...');
      var deleted = 0;
      for(var i = 0; i < sources.length; i++) {
        models.User.update({
            _id: user._id
        }, {"$pull": {"sourcefiles": mongoose.Types.ObjectId(sources[i])}}, (err, doc) => {
            if(err) throw err;          
            console.log('[WORKBENCH LOG] Data cleared!');
            deleted++;
            if(deleted == sources.length) {
                callback();
            }
        });
      }
  },

  //clear mappings
  clearAllMappings : function(user, models, callback) {
      console.log('[WORKBENCH LOG] Clearing all mappings of ' + user.username + '...');
      models.User.update({
          _id: user._id
      }, {"$set": {"mappingfiles": []}}, (err, doc) => {
          if(err) throw err;          
          console.log('[WORKBENCH LOG] Data cleared!');
          callback();
      });
  },
  
  //clear a selection of mappings
  clearMappings: function(user, models, mappings, callback) {
      console.log('[WORKBENCH LOG] Clearing mappings of ' + user.username + '...');
      var deleted = 0;
      if(mappings.length == 0) {
          callback();
          return;
      }
      for(var i = 0; i < mappings.length; i++) {
        models.User.update({
            _id: user._id
        }, {"$pull": {mappingfiles: mongoose.Types.ObjectId(mappings[i])}}, (err, doc) => {
            if(err) throw err;          
            deleted++;
            if(deleted == mappings.length) {
                console.log('[WORKBENCH LOG] Data cleared!');
                callback();
            }
        });
      }
  },
  
  
  //clear rdfs
  clearAllRdf : function(user, models, callback) {
      console.log('[WORKBENCH LOG] Clearing all rdf files of ' + user.username + '...');
      models.User.update({
          _id: user._id
      }, {"$set": {"rdffiles": []}}, (err, doc) => {
          if(err) throw err;          
          console.log('[WORKBENCH LOG] Data cleared!');
          callback();
      });
  },
  
  //clear a selection of rdf files
  clearRdf: function(user, models, rdf, callback) {
      console.log('[WORKBENCH LOG] Clearing rdf of ' + user.username + '...');
      var deleted = 0;
      if(rdf.length == 0) {
          callback();
          return;
      }
      for(var i = 0; i < rdf.length; i++) {
        models.User.update({
            _id: user._id
        }, {"$pull": {"rdffiles": mongoose.Types.ObjectId(rdf[i])}}, (err, doc) => {
            if(err) throw err;          
            console.log('[WORKBENCH LOG] Data cleared!');
            deleted++;
            if(deleted == rdf.length) {
                callback();
            }
        });
      }
  },
  
  clearEndpoint: function(endpoint, user, models, callback) {
    console.log('[WORKBENCH LOG] Removing endpoint.');
    models.User.update({_id : user._id}, 
    {"$pull" : {"endpoints" : { "name" : endpoint.name }}}, (err) => {
        if(err) throw err;
        console.log('[WORKBENCH LOG] Endpoint removed.');
        callback();
    });  
    
  },
  
  clearEndpoints : function(user, models, callback) {
    console.log('[WORKBENCH LOG] Removing endpoints.');  
    models.User.update({_id : user._id}, 
    {"endpoints" : []}, (err) => {
        if(err) throw err;
        console.log('[WORKBENCH LOG] Endpoints removed.');
        callback();
    });  
  } 
    
  
    
}