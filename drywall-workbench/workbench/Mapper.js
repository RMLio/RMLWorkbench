'use strict';

var rmlMapper = require('./RMLMapper');
var util = require('./Utility');
var exports = module.exports =  {

	

	//excute mapping by id and return the rdf
	executeMappingFromFile : function(mapping_id, models, user, sources, callback) {
	    console.log('[WORKBENCH LOG] Generating RDF...');
	    util.retrieveFiles(sources, models.Source, (sources) => {
	        util.retrieveFile(mapping_id, models.Mapping, (mapping) => {
	            exports.executeFromFile(mapping, sources, (rdf) => {
	                console.log('[WORKBENCH LOG] Generating RDF successful!');
	                callback(rdf);
	            });
	        });
	    });
	},
    
    //excute mapping by id and return the rdf
	executeMappingFromTriples : function(user, models, triples, mapping_id, callback) {
	    console.log('[WORKBENCH LOG] Generating RDF...');
        console.log(triples);
	    util.retrieveFiles(user.sourcefiles, models.Source, (sources) => {
	        util.retrieveFile(mapping_id, models.Mapping, (mapping) => {
                util.retrieveFiles(triples, models.Triple, (triples) => {
                    exports.executeFromTriples(mapping, triples, sources, (rdf) => {
	                    console.log('[WORKBENCH LOG] Generating RDF successful!');
	                    callback(rdf);
	                });    
                });	            
	        });
	    });
	},

	// generate rdf from the whole mapping file
	executeFromFile : function(mappingfile, sources, callback) {
		exports.executeRMLMapper(mappingfile, mappingfile.triples, sources, callback);
	},

	//generate rdf from triples
	executeFromTriples : function(mappingfile, triples, sources, callback) {
		exports.executeRMLMapper(mappingfile, triples, sources, callback);
	},


	// calls the rdf mapper to execute the mapping 
	executeRMLMapper : function(mappingfile, triples, sources, callback) {
		
		var sourcenames = [];	//stores the filenames necessary sources
		var needed = [];		//store the necessary sources
		var addednames = []; 	//store filenames that are already added in case of doubles

		//extracts names of the sources that are needed
		for(var i = 0; i < triples.length; i++) {
			sourcenames.push(triples[i].logicalsource.rmlsource);
		}
		for(var i = 0; i < sources.length; i++) {
			for(var j = 0; j < sourcenames.length; j++) {
				//compares the filenames and checks if the source isn't already added to the list
				if(sources[i].filename == sourcenames[j] && addednames.indexOf(sources[i].filename) < 0) {
					//source is needed!
					addednames.push(sources[i].filename);
					needed.push(sources[i]);
				}
			}
		}       
        

		//execute the mapping with the RML Mapper		
		rmlMapper.execute(mappingfile, triples, needed, (rdf) => {
			callback(rdf);
		});
	},

	//executing multiple mappings
	executeMultipleMappings : function(mappingsFromFile, mappingsFromTriples, sources, models, user) {
		var util = require('./Utility');
		//retrieving all necessary files from db
        util.retrieveFiles(sources, models.Source, (sources) => {
            util.retrieveFiles(mappingsFromFile, models.Mapping, (mappingsFromFile) => {
                util.retrieveFiles(mappingsFromTriples, models.Mapping, (mappingsFromTriples) => {
                    var amountofjobs = mappingsFromTriples.length + mappingsFromFile.length;
                    var jobsdone = 0;
                    console.log("[WORKBENCH LOG] Execute mappings from file...")
                    var amountDone = 0;
                    //execute scheduled mappings from file
                    for (var i = 0; i < mappingsFromFile.length; i++) {

                        exports.executeMappingFromFile(mappingsFromFile[i], models, user, sources, () => {
                            amountDone++;
                            if (amountDone == amountofjobs) {
                                console.log("[WORKBENCH LOG] Jobs done!");
                            }
                        });

                    }

                    //TODO
                    console.log("[WORKBENCH LOG] Execute mappings from triples...")

                    //execute scheduled mappings from triples
                    for (var i = 0; i < mappingsFromTriples.length; i++) {

                        console.log(mapping);
                        exports.executeFromTriples(mapping, mappingsFromTriples[i].triples, sources, (rdf) => {

                          
                                //checking if all jobs are done
                                jobsdone++;
                                if (jobsdone == amountofjobs) {
                                    console.log("[WORKBENCH LOG] Jobs done!")
                                }

                            
                        });
                    }

                });
            });
        });
    }
	
}