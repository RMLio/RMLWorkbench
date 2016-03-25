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

    console.log('[WORKBENCH LOG]' + ' Mapping name: "' + mapping.filename + '"');

    var triples = mapping.triples; //hacky 
    mapping.triples = [];

    console.log('[WORKBENCH LOG]' + ' Creating new mapping entry in database...');

    //create the new mapping
    mappingschema.create(mapping, (err, mappingSchema) => {
        if (err) throw err;

        var amountOfTriples = triples.length;
        var amountDone = 0;

        console.log('[WORKBENCH LOG]' + ' Creating new triple entries in database...');

        //create new triples from the mapping and add to triples of the user
        for (var i = 0; i < triples.length; i++) {
            tripleschema.create(triples[i], (err, tripleSchema) => {
                if (err) throw err;
                mappingschema.update({
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
                        userschema.update({
                            _id: user._id
                        }, {
                            $addToSet: {
                                mappingfiles: mappingSchema._id
                            }
                        }, () => {
                            if (err) throw err
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

    console.log('[WORKBENCH LOG]' + ' Filename source: "' + source.filename + '"');

    //create new source from upload and add to sources of user

    console.log('[WORKBENCH LOG]' + ' Creating new source entry in database...');

    //create the new source
    sourceschema.create(source, (err, sourceSchema) => {
        if (err) throw err;
        console.log('[WORKBENCH LOG]' + ' Updating user sourcefiles...');
        userschema.update({
            _id: user._id
        }, {
            $addToSet: {
                sourcefiles: sourceSchema._id
            }
        }, () => {
            if (err) throw err
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

    this._fetchManager.createRDFFields(file, (rdf) => {
        saveRDF(rdf, req.app.db.models, user, () => {
            res.send();
        });
    });
};

//save source
var saveRDF = function(rdf, models, user, callback) {

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
            callback();
            console.log('[WORKBENCH LOG] Upload successful!');
        });
    });
}

//generate an rdf, mapping id is needed as param
method.generateRDFfromFile = function(req, res) {
    var mapping_id = req.params.mapping_id;
    var sources = req.user.sourcefiles;
    var models = req.app.db.models;
    var user = req.user;
    //execute the mapping
    executeMapping(mapping_id, models, user, sources, () => {
        res.send();
    });
}

//TODO
method.generateRDFfromTriples = function(req, res) {
    console.log('[WORKBENCH LOG] Generating RDF...');
    var mapping_id = req.params.mapping_id;
    var sources = req.user.sourcefiles;
    var mappings = req.user.mappingfiles;
    for (var i = 0; i < mappings.length; i++) {
        if (mappings[i]._id == mapping_id) {
            mapping = mappings[i];
        }
    }
    var rdf = this._mappingManager.generateRDFfromTriples(mapping, req.body, sources, (rdf) => {
        req.app.db.models.User.findOne({
            _id: req.user._id
        }, (err, doc) => {
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
    var sources = req.user.sourcefiles;
    var models = req.app.db.models;
    var user = req.user;



    var executemappings = () => {
        console.log('I come here');
        //variables for mapping
        var mappingsFromTriples = req.body.mappingsFromTriples;
        var mappingsFromFile = req.body.mappingsFromFile;

        retrieveFiles(req.user.sourcefiles, models.Source, (sources) => {
            retrieveFiles(mappingsFromFile, models.Mapping, (mappingsFromFile) => {
                retrieveFiles(mappingsFromTriples, models.Mapping, (mappingsFromTriples) => {
                    var amountofjobs = mappingsFromTriples.length + mappingsFromFile.length;
                    var jobsdone = 0;



                    /**
                     * Schedule utility functions
                     **/



                    console.log("[WORKBENCH LOG] Execute mappings from file...")
                    var amountDone = 0;
                    //execute scheduled mappings from file
                    for (var i = 0; i < mappingsFromFile.length; i++) {

                        executeMapping(mappingsFromFile[i], models, user, sources, () => {
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
                        mapping = method.findMapping(mappingsFromTriples[i]._id, mappings);

                        console.log(mapping);
                        this._mappingManager.generateRDFfromTriples(mapping, mappingsFromTriples[i].triples, sources, (rdf) => {

                            req.app.db.models.User.findOne({
                                _id: req.user._id
                            }, (err, doc) => {

                                doc.rdfiles.push(rdf);
                                doc.save();
                                console.log('[WORKBENCH LOG] RDF generating succesful!');

                                //checking if all jobs are done
                                jobsdone++;
                                if (jobsdone == amountofjobs) {
                                    console.log("[WORKBENCH LOG] Jobs done!")
                                }

                            });
                        });
                    }



                });
            });
        });
    };


    //schedule the job with date
    schedule.scheduleJob(date, () => {

        console.log("[WORKBENCH LOG] Executing jobs!");

        executemappings();

    });

    res.send();
}

/**
 * Clearing
 **/

method.clearAll = function(req, res) {
    console.log('[WORKBENCH LOG] Clearing data of ' + req.user.username + '...');
    req.app.db.models.User.findOne({
        _id: req.user._id
    }, (err, doc) => {
        doc.rdffiles = [];
        doc.mappingfiles = [];
        doc.sourcefiles = [];
        doc.save();
    });

    res.send();
};

method.clearSources = function(req, res) {
    console.log('[WORKBENCH LOG] Clearing sources of ' + req.user.username + '...');
    req.app.db.models.User.findOne({
        _id: req.user._id
    }, (err, doc) => {
        doc.sourcefiles = [];
        doc.save();
    });
    res.send();
};

method.clearMappings = function(req, res) {
    console.log('[WORKBENCH LOG] Clearing mappings of ' + req.user.username + '...');
    req.app.db.models.User.findOne({
        _id: req.user._id
    }, (err, doc) => {
        doc.mappingfiles = [];
        doc.save();
    });
    res.send();
};

method.clearRdf = function(req, res) {
    console.log('[WORKBENCH LOG] Clearing rdf of ' + req.user.username + '...');
    req.app.db.models.User.findOne({
        _id: req.user._id
    }, (err, doc) => {
        doc.rdffiles = [];
        doc.save();
    });
    res.send();
};


/**
 * Getters
 **/

//get sourcefiles from database by id
method.getInputs = function(req, res) {
    var sourceschema = req.app.db.models.Source;
    var idsources = req.user.sourcefiles;
    console.log('[WORKBENCH LOG] Retrieving sources of ' + req.user.username + '...');
    retrieveFiles(idsources, sourceschema, (sources) => {
        console.log('[WORKBENCH LOG] Retrieving sources successful!');
        res.send(sources);
    });
};

//get mappingfiles from database by id
method.getMappings = function(req, res) {
    var mappingschema = req.app.db.models.Mapping;
    var idmappings = req.user.mappingfiles;
    console.log('[WORKBENCH LOG] Retrieving mappings of ' + req.user.username + '...');
    retrieveFiles(idmappings, mappingschema, (mappings) => {
        console.log('[WORKBENCH LOG] Retrieving mappings successful!');
        res.send(mappings);
    });
};

//get rdffiles from database by id
method.getRdf = function(req, res) {
    var rdfschema = req.app.db.models.RDF;
    var idrdf = req.user.rdffiles;
    console.log('[WORKBENCH LOG] Retrieving rdf (' + idrdf.length + ') of ' + req.user.username + '...');
    retrieveFiles(idrdf, rdfschema, (rdf) => {
        console.log('[WORKBENCH LOG] Retrieving rdf successful!');
        res.send(rdf);
    });
};




/**
 * Utility function
 **/

//retrieving files from database by id and schema
var retrieveFile = function(idfile, schema, callback) {
    schema.findOne({
        _id: idfile
    }, (err, doc) => {
        if (err) throw err;
        callback(doc);
    });
}

//retrieving files from database by id and schema
var retrieveFiles = function(idfiles, schema, callback) {
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
}

//excute mapping by id
var executeMapping = function(mapping_id, models, user, sources, callback) {
    console.log('[WORKBENCH LOG] Generating RDF...');
    retrieveFiles(sources, models.Source, (sources) => {
        retrieveFile(mapping_id, models.Mapping, (mapping) => {
            (new MappingManager).generateRDFfromFile(mapping, sources, (rdf) => {
                  saveRDF(rdf, models, user, () => {                    
                    models.User.update({
                    _id: user._id
                    }, {
                    $addToSet: {
                        rdffiles: rdf
                    }
                    }, () => {
                    console.log('[WORKBENCH LOG] Generating RDF succesful!');
                    callback();
                });
                  });                
            });
        });
    });
}

method.findMapping = function(_id, mappings) {
    for (var i = 0; i < mappings.length; i++) {
        if (mappings[i]._id == _id) {
            return mappings[i];
        }
    }
}

//exporting module
module.exports = SessionManager;