var schedule = require('node-schedule');
var mongoose = require('mongoose');
var util = require('./Utility');
var mapper = require('./Mapper');
var reader = require('./Reader');
var clearer = require('./Clearer');
var saver = require('./Saver');
var sparql = require('./Sparql');

var exports = module.exports = {

    //TODO seperate controllers!
    
    /*
    * Sparql
    */

    //add a sparql endpoint the users collection
    addSparqlEndpoint: function(req, res) {
        sparql.addSparqlEndpoint(req.body.endpoint,req.user,
        req.app.db.models, () => {
            //?
            res.send(200);
        })
    },

    //remove a sparql endpoint form the users collection 
    removeSparqlEndpoint: function(req, res) {
        sparql.removeEndpoint(req.body.endpoint, req.user, 
        req.app.db.models, () => {
            //?
            res.send(200);
        });
    }, 
    
    removeAllSparqlEndpoints: function(req, res) {
        sparql.removeEndpoints(req.user, req.app.db.models, () => {
            //?
            res.send(200);      
        });
    },   

    //execute sparqlqueries
    executeQueries: function(req, res) {
        sparql.executeQueries(req.body.queries, req.body.url, req.body.isJson, (responses)=> {
            //?
            res.send(responses);
        })
    },

    //returns all endpoints from a user
    getEndpoints: function(req, res) {
        sparql.getEndpoints(req.user,req.app.db.models,(endpoints)=>{
            //?
            res.send(endpoints);
        });
    },


    /*
    * Uploading 
    */

    //upload a mapping
    uploadMapping: function(req, res) {
        var file = req.file;
        var user = req.user;
        var models = req.app.db.models;
        console.log('[WORKBENCH LOG] User ' + req.user.username + ' tries to upload mapping file...');
        //read the file and make mapping fields
        reader.readMappingFields(req.file, (mapping) => {
            //save to db
            saver.saveMapping(mapping, models, user, () => {
                console.log('[WORKBENCH LOG] Upload successful!');
                res.send(200);
            });
        });

    },

    //upload source
    uploadSource: function(req, res) {
        var file = req.file;
        var user = req.user;
        var models = req.app.db.models;
        console.log('[WORKBENCH LOG] ' + user.username + ' tries to upload source file...');
        //create source fields
        reader.readSourceFields(file, (source) => {
            saver.saveSource(source, models, user, () => {
                console.log('[WORKBENCH LOG] Upload successful!');
                res.send(200);
            });
        });
    },

    //upload rdf
    uploadRDF: function(req, res) {
        var file = req.file;
        var userschema = req.app.db.models.User;
        var rdfschema = req.app.db.models.RDF;
        var user = req.user;

        console.log('[WORKBENCH LOG] ' + user.username + ' tries to upload RDF file...');
        //create rdf fields
        reader.readRDFFields(file, (rdf) => {
            
            saver.saveRDF(rdf, req.app.db.models, user, () => {
                console.log('[WORKBENCH LOG] Upload successful!');
                res.send(200);
            });
        });
    },


    //execute a whole mapping file, mapping id is needed as param
    executeMappingFromFile: function(req, res) {
        var mapping_id = req.params.mapping_id;
        var sources = req.user.sourcefiles;
        var models = req.app.db.models;
        var user = req.user;

        //execute the mapping
        mapper.executeMappingFromFile(mapping_id, models, user, sources, (rdf) => {
            if(rdf!=null) {
                saver.saveRDF(rdf, models, user, () => {
                    res.send(200);
                });
            } else {
                res.send(200);
            }

        });
    },

    //execute triples of a mapping file
    executeMappingFromTriples: function(req, res) {
        var mapping_id = req.params.mapping_id;
        var user = req.user;
        var triples = req.body.triples;
        var models = req.app.db.models;
        //execute the mapping
        mapper.executeMappingFromTriples(user, models, triples, mapping_id, (rdf) => {
            saver.saveRDF(rdf, models, user, () => {
                res.send(200);
            });
        });
    },
    
    
    /**
     * Descriptions
     */      

    extractDescriptionsFromMapping: function(req, res) {         
        var models = req.app.db.models;
        var user = req.user;
        var mapping_id = req.body.mapping_id;        
        util.retrieveFile(mapping_id, models.Mapping, (mapping) => {
           //extract description 
           descriptions = sourceExtractor.parseMappingForSources(mapping); 
           for(var i = 0; i < descriptions.length; i++) {
               //save description
                saver.saveDescription(descriptions,models, req.user, () => {
                   res.send(200); 
                });   
           }           
        });
    },
    
    //create a new description for the user
    createDescription: function(req, res) {
      //TODO  
    },
    
    //removes a description from the users collection
    removeDescription: function(req, res) {
      //TODO  
    },
    
    //add a description to a mapping file
    addDescriptionToMapping: function(req, res) {
      //TODO  
    },
    
    //remove a description from a mapping file
    removeDescriptionFromMapping: function(req, res) {
      //TODO      
    },    
    

    /**
     * Scheduling 
     **/

    addToSchedule: function(req, res) {

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

        console.log("[WORKBENCH LOG] Job added! Scheduled for " + date);

        //schedule the job with date
        schedule.scheduleJob(date, (err) => {
            if (err) throw err;
            console.log("[WORKBENCH LOG] Executing jobs!");
            mapper.executeMultipleMappings(mappingsFromFile, mappingsFromTriples, sources, models, user, (rdflist) => {
                var done = 0;
                for (var i = 0; i < rdflist.length; i++) {
                    saver.saveRDF(rdflist[i], models, user, () => {
                        done++;
                        if (done == rdflist.length) {
                            console.log("[WORKBENCH LOG] Jobs Done!");
                        }
                    });
                }
            });
        });
        res.send(200);
    },

    /**
     * Clearing (does not destroy individual data in the db, only the reference will be deleted)
     **/

    //clear all data of the user
    clearAll: function(req, res) {
        clearer.clearAll(req.user, req.app.db.models, () => {
            res.send(200);
        });
    },

    //clear all sources of the user
    clearAllSources: function(req, res) {
        clearer.clearAllSources(req.user, req.app.db.models, () => {
            res.send(200);
        });
    },

    //clear all sources of the user
    clearSources: function(req, res) {
        clearer.clearSources(req.user, req.app.db.models, req.body.sources, () => {
            res.send(200);
        });
    },

    //clear all mappings
    clearAllMappings: function(req, res) {
        clearer.clearAllMappings(req.user, req.app.db.models, () => {
            res.send(200);
        });
    },

    //clear all mappings of the user
    clearMappings: function(req, res) {
        clearer.clearMappings(req.user, req.app.db.models, req.body.mappings, () => {
            res.send(200);
        });
    },

    //clear all rdfs
    clearAllRdf: function(req, res) {
        clearer.clearAllRdf(req.user, req.app.db.models, () => {
            res.send(200);
        });
    },

    //clear all rdf of the user
    clearRdf: function(req, res) {
        clearer.clearRdf(req.user, req.app.db.models, req.body.rdf, () => {
            res.send(200);
        });
    },



    /**
     * Getting
     **/

    //get sourcefiles from database by id
    getInputs: function(req, res) {
        var sourceschema = req.app.db.models.Source;
        var idsources = req.user.sourcefiles;
        console.log('[WORKBENCH LOG] Retrieving sources of ' + req.user.username + '...');
        util.retrieveFiles(idsources, sourceschema, (sources) => {
            console.log('[WORKBENCH LOG] Retrieving sources successful!');
            res.send(sources);
        });
    },

    //get mappingfiles from database by id
    getMappings: function(req, res) {
        var mappingschema = req.app.db.models.Mapping;
        var idmappings = req.user.mappingfiles;
        console.log(idmappings);
        console.log('[WORKBENCH LOG] Retrieving mappings of ' + req.user.username + '...');
        util.retrieveFiles(idmappings, mappingschema, (mappings) => {
            console.log('[WORKBENCH LOG] Retrieving mappings successful!');
            res.send(mappings);
        });
    },

    //get rdffiles from database by id
    getRdf: function(req, res) {
        var rdfschema = req.app.db.models.RDF;
        var idrdf = req.user.rdffiles;
        console.log('[WORKBENCH LOG] Retrieving rdf (' + idrdf.length + ') of ' + req.user.username + '...');
        util.retrieveFiles(idrdf, rdfschema, (rdf) => {
            console.log('[WORKBENCH LOG] Retrieving rdf successful!');
            res.send(rdf);
        });
    },
    
    /**
     * Provenance
     */
    
    createProvenance: function(req, res) {
        
    }

}