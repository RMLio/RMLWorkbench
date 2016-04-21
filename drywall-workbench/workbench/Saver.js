'use strict'

exports = module.exports =  {
    
    //adds an endpoint
    saveEndpoint : function(endpoint, user, models, callback) {
        models.User.update({_id : user._id}, {$addToSet : {endpoints : endpoint}}, (err) => {
            if(err) throw err;
            callback();
        });    
    },
    
    //save description
    
    saveDescription : function(description, models, user, callback) {
        console.log('[WORKBENCH LOG] Description name: ' + description.name);
        console.log('[WORKBENCH LOG] Creating new description entry in database...');
        models.description.create(description, (err, descriptionSchema) => {
           if(err) throw err;
           console.log('[WORKBENCH LOG] Updating user description files...');
           models.User.update({
	            _id: user._id
	        }, {
	            $addToSet: {
	                descriptions: descriptionSchema._id
	            }
	        }, () => {
	            if (err) throw err
                console.log('[WORKBENCH LOG] Updating user descriptions successful!');
	            callback();
	        }); 
        });    
    },    

	//save the mapping
	saveMapping : function(mapping, models, user, callback) {

	    console.log('[WORKBENCH LOG]' + ' Mapping name: "' + mapping.filename + '"');

	    var triples = mapping.triples; //hacky 
	    mapping.triples = [];

	    console.log('[WORKBENCH LOG]' + ' Creating new mapping entry in database...');

	    //create the new mapping
	    models.Mapping.create(mapping, (err, mappingSchema) => {
	        if (err) throw err;

	        var amountOfTriples = triples.length;
	        var amountDone = 0;

	        console.log('[WORKBENCH LOG]' + ' Creating new triple entries in database...');
			if(amountOfTriples !==0 ) {
	        //create new triples from the mapping and add to triples of the user
	        for (var i = 0; i < triples.length; i++) {
	            models.Triple.create(triples[i], (err, tripleSchema) => {
	                if (err) throw err;
	                models.Mapping.update({
	                    _id: mappingSchema._id
	                }, {
	                    $addToSet: {
	                        triples: tripleSchema
	                    }
	                }, () => {
	                    amountDone++;

	                    console.log('[WORKBENCH LOG] Updating user mappingfiles...');

	                    //when everything is created, write to user 
	                    if (amountDone == amountOfTriples) {
	                        models.User.update({
	                            _id: user._id
	                        }, {
	                            $addToSet: {
	                                mappingfiles: mappingSchema._id
	                            }
	                        }, () => {
	                            if (err) throw err
                                console.log('[WORKBENCH LOG] Updating user mapping files successful!');
	                            callback();	                            
	                        });
	                    }
	                });


	            });
	        } }
	    });

	},

	//save source
	saveSource : function(source, models, user, callback) {

	    console.log('[WORKBENCH LOG]' + ' Filename source: "' + source.filename + '"');

	    //create new source from upload and add to sources of user

	    console.log('[WORKBENCH LOG]' + ' Creating new source entry in database...');

	    //create the new source
	    models.Source.create(source, (err, sourceSchema) => {
	        if (err) throw err;
	        console.log('[WORKBENCH LOG]' + ' Updating user sourcefiles...');
	        models.User.update({
	            _id: user._id
	        }, {
	            $addToSet: {
	                sourcefiles: sourceSchema._id
	            }
	        }, () => {
	            if (err) throw err
                console.log('[WORKBENCH LOG] Updating user source files successful!');
	            callback();
	        });
	    });
	},

	//save source
	saveRDF : function(rdf, models, user, callback) {

	    console.log('[WORKBENCH LOG]' + ' Filename rdf: "' + rdf.filename + '"');

	    //create new source from upload and add to sources of user

	    console.log('[WORKBENCH LOG]' + ' Creating new rdf entry in database...');

	    //create the new source
	    models.RDF.create(rdf, (err, rdfSchema) => {
	        if (err) throw err;
	        console.log('[WORKBENCH LOG]' + ' Updating user rdf files...');
	        models.User.update({
	            _id: user._id
	        }, {
	            $addToSet: {
	                rdffiles: rdfSchema._id
	            }
	        }, () => {
	            if (err) throw err
                console.log('[WORKBENCH LOG] Updating user rdf files successful!');
	            callback();                
	        });
	    });
	}
}