'use strict';

var rmlMapper = require('./RMLMapper');
var util = require('./Utility');

var uniq_fast = function(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
};

var exports = module.exports =  {

	

	//excute mapping by id and return the rdf
	executeMappingFromFile : function(mapping_id, models, user, sources, callback) {
	    console.log('[WORKBENCH LOG] Generating RDF...');
	    console.log(sources);
	    util.retrieveFiles(sources, models.Source, (sources) => {
	        util.retrieveFile(mapping_id, models.Mapping, (mapping) => {
	            exports.executeFromFile(mapping, sources, (rdf) => {
					if(rdf!=null) {
	                	console.log('[WORKBENCH LOG] Generating RDF successful!');
					} else {
						console.log('[WORKBENCH LOG] Necessary sources not available!');
					}
	                callback(rdf);
	            });
	        });
	    });
	},
    
    //excute mapping by id and return the rdf
	executeMappingFromTriples : function(user, models, triples, mapping_id, callback) {
	    console.log('[WORKBENCH LOG] Generating RDF...');
	    util.retrieveFiles(user.sourcefiles, models.Source, (sources) => {
	        util.retrieveFile(mapping_id, models.Mapping, (mapping) => {
                util.retrieveFiles(triples, models.Triple, (triples) => {
                    exports.executeFromTriples(mapping, triples, sources, (rdf) => {
	                    if(rdf!=null) {
	                		console.log('[WORKBENCH LOG] Generating RDF successful!');
						} else {
							console.log('[WORKBENCH LOG] Necessary sources not available!');
						}
	                    callback(rdf);
	                });    
                });	            
	        });
	    });
	},

	// generate rdf from the whole mapping file, utility function of executeMappingFromFile
	executeFromFile : function(mappingfile, sources, callback) {
		exports.executeRMLMapper(mappingfile, mappingfile.triples, sources, callback);
	},

	//generate rdf from triples, utility function of executeMappingFromTriples
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
			var source = triples[i].logicalsource.rmlsource;
			if(triples[i].local) {
				sourcenames.push(source);				
			}
		}
		
        //removing duplicates
        sourcenames = uniq_fast(sourcenames);
        console.log('SOURCENAMES');
        console.log(sourcenames);
        
		for(var i = 0; i < sources.length; i++) {
			for(var j = 0; j < sourcenames.length; j++) {
				//compares the filenames and checks if the source isn't already added to the list
				console.log(sources[i]);
				if(sources[i]!=null) {
					if(sources[i].filename == sourcenames[j] && addednames.indexOf(sources[i].filename) < 0) {
						//source is needed!
						addednames.push(sources[i].filename);
						needed.push(sources[i]);
					}
				}
			}
		}       
        
        //removing duplicates
        needed = uniq_fast(needed);
        console.log(needed);
        		
		if(needed.length == sourcenames.length) {
			//execute the mapping with the RML Mapper		
			rmlMapper.execute(mappingfile, triples, needed, (rdf) => {
				callback(rdf);
			});
		} else {
			callback(null);
		}
	},

	//executing multiple mappings
	executeMultipleMappings : function(mappingsFromFile, mappingsFromTriples, sources, models, user, callback) {
		var util = require('./Utility');
        var rdflist = [];
		//retrieving all necessary files from db
        util.retrieveFiles(sources, models.Source, (sources) => {
            util.retrieveFiles(mappingsFromFile, models.Mapping, (mappingsFromFile) => {

                var amountofjobs = mappingsFromTriples.length + mappingsFromFile.length;
                var jobsdone = 0;
                console.log("[WORKBENCH LOG] Execute mappings from file...")
                var amountDone = 0;
                //execute scheduled mappings from file
                for (var i = 0; i < mappingsFromFile.length; i++) {

                    exports.executeMappingFromFile(mappingsFromFile[i], models, user, sources, (rdf) => {
                        if(rdf != null) {
                            rdflist.push(rdf);
                               
                        }
                        
                        amountDone++;
                        if(amountDone == mappingsFromFile.length) {
                            if(mappingsFromTriples.length != 0) {
                                console.log("[WORKBENCH LOG] Execute mappings from triples...")    
                                //Execute scheduled mappings from triples                                                            
                                    for (var j = 0; j < mappingsFromTriples.length; j++) {
                                        exports.executeMappingFromTriples(user, models, mappingsFromTriples[j].triples, mappingsFromTriples[j].mapping, (rdf) => {
                                            rdflist.push(rdf);
                                            amountDone++;
                                            if (amountDone == amountofjobs) { 
                                                callback(rdflist);                                                                               
                                            }
                                        });
                                    }   
                            } else {                                
                                callback(rdflist);                        
                            }
                            
                        }                   
                    });

                }           
                 
                            
                
           });
        });
    }
	
}


