var schedule = require('node-schedule');
var mongoose = require('mongoose');
var util = require('./Utility');
var mapper = require('./Mapper');
var reader = require('./Reader');
var clearer = require('./Clearer');
var saver = require('./Saver');
var tripleParser = require('./TripleParser');
var sparql = require('./Sparql');
var fs = require('fs');
var moment = require('moment');
var publisher = require('./Publisher');

var schedules = [];
var started= [];
var done=[];



var test = [];

var exports = module.exports = {

    //TODO seperate controllers!

    /*
    * Sparql
    */

    //add a sparql endpoint the users collection
    addSparqlEndpoint: function(req, res) {
        sparql.addSparqlEndpoint(req.body.endpoint,req.user,
        req.app.db.models, function() {
            //?
            res.send(200);
        })
    },

    //remove a sparql endpoint form the users collection
    removeSparqlEndpoint: function(req, res) {
        sparql.removeEndpoint(req.body.endpoint, req.user,
        req.app.db.models, function() {
            //?
            res.send(200);
    })
    },

    removeAllSparqlEndpoints: function(req, res) {
        sparql.removeEndpoints(req.user, req.app.db.models, function() {
            //?
            res.send(200);
    })
    },

    //execute sparqlqueries
    executeQueries: function(req, res) {
        sparql.executeQueries(req.body.queries, req.body.url, req.body.isJson, function(responses) {
            //?
            res.send(responses);
        })
    },

    //returns all endpoints from a user
    getEndpoints: function(req, res) {
        sparql.getEndpoints(req.user,req.app.db.models,function(endpoints) {
            //?
            res.send(endpoints);
    })
    },

    /*
    * Data Descriptions
    */

  addCSVW: function(req, res) {
      var user = req.user;
      var models = req.app.db.models;
      var name = req.body.inputcsvwName;

      console.log('[WORKBENCH LOG] User ' + user.username + ' Adding CSVW');

      var license = req.body.inputcsvwLicense;
      var prefix = 'csvw';
      var data = '@prefix csvw: <http://www.w3.org/ns/csvw#> .\n\n' +
          '<#' + name + '> a csvw:Table;\n' +
          '    csvw:url "' + req.body.inputcsvwURL + '" ;\n' +
          '    csvw:dialect [ a csvw:Dialect;\n' +
          '    csvw:delimiter "' + req.body.inputcsvwDelimiter + '";\n' +
          '    csvw:encoding "' + req.body.inputcsvwType + '";\n' +
          '    csvw:header ' + '"'+req.body.inputcsvwHeader+'"' + ';  ] . \n'

    var description = {
                        name: name,
                        type: 'csvw',
                        data: data,
                        prefix: prefix,
                        fullprefix: '@prefix ' + prefix +': <http://www.w3.org/ns/csvw#> .',
                        _id : mongoose.Types.ObjectId(),
                        metadata: { license: license }
                    };
      tripleParser.parseSourceObject(description, function() {
          saver.saveDescription(description, models, user, function(){
              console.log('[WORKBENCH LOG] DCat description added sucessfully!');
              res.send(200);
          })
      });
  },

  addDB: function(req, res) {
      var user = req.user;
      var models = req.app.db.models;
      var name = req.body.inputDBName;
      var license = req.body.inputDBLicense;
      var prefix = 'd2rq';
      var data = '@prefix d2rq: <http://www.wiwiss.fu-berlin.de/suhl/bizer/D2RQ/0.1#> .\n\n' +
          '<#' + name + '> a d2rq:Database;\n' +
          '    d2rq:jdbcDSN "' + req.body.inputDBURL + '";\n' +
          '    d2rq:jdbcDriver "' + req.body.inputDBDrive + '";\n' +
          '    d2rq:username "' + req.body.inputDBUser + '";\n' +
          '    d2rq:password "' + req.body.inputDBPass + '" . \n';
       var description = {name: name, type: 'd2rq',
           data: data,
           prefix: prefix,
           fullprefix: '@prefix ' + prefix + ': <http://www.wiwiss.fu-berlin.de/suhl/bizer/D2RQ/0.1#> .',
           _id : mongoose.Types.ObjectId(),
           metadata: { license: license }
       };
      tripleParser.parseSourceObject(description, function() {
          saver.saveDescription(description, models, user, function(){
              console.log('[WORKBENCH LOG] DCat description added sucessfully!');
              res.send(200);
          })
      });
  },

  addAPI: function(req, res) {
      var user = req.user;
      var models = req.app.db.models;
      var name = req.body.inputAPIName;
      var license = req.body.inputAPIicense;
      var prefix = 'hydra';
      var data = '<#' + name + '>\n' +
          'a hydra:IriTemplate\n' +
          'hydra:template "' + req.body.inputAPIURL + '";\n';
      var templateStuff = 'hydra:mapping \n' +
          '    [ a hydra:TemplateMapping ;\n' +
          '      hydra:variable "id";\n' +
          '      hydra:required true ],\n' +
          '    [ a hydra:TemplateMapping ;\n' +
          '      hydra:variable "format";\n' +
          '      hydra:required false ] . \n';
    var description =
    {name: name, type: 'hydra',
            data: data,
            prefix: prefix,
            fullprefix: '@prefix ' + prefix + ': <http://www.w3.org/ns/hydra/core#> .',
            _id : mongoose.Types.ObjectId(),
            metadata: { license: license }
        };
      tripleParser.parseSourceObject(description, function() {
          saver.saveDescription(description, models, user, function(){
              console.log('[WORKBENCH LOG] DCat description added sucessfully!');
              res.send(200);
          })
      });
  },

  addSPARQL: function(req, res) {
      var user = req.user;
      var models = req.app.db.models;
      var name = req.body.inputSparqlName;
      var license = req.body.inputSparqlicense;
      var prefix = 'sd';

      var data = '@prefix sd: <http://www.w3.org/ns/sparql-service-description#> .\n' +
          '<#' + name + '> a sd:Service ;\n' +
          '    sd:endpoint <' + req.body.inputSparqlURL + '> ;\n' +
          '    sd:supportedLanguage sd:SPARQL11Query ;\n' +
          '    sd:resultFormat <http://www.w3.org/ns/formats/SPARQL_Results_' + req.body.inputSparqlType + '> .';
    var   description = {name: name, type: 'sd',
                                    data: data,
                                    prefix: prefix,
                                    fullprefix: '@prefix ' + prefix +': <http://www.w3.org/ns/sparql-service-description#> .',
                                    _id : mongoose.Types.ObjectId(),
                            metadata: {license: license} };
      tripleParser.parseSourceObject(description, function() {
          saver.saveDescription(description, models, user, function(){
              console.log('[WORKBENCH LOG] DCat description added sucessfully!');
              res.send(200);
          })
      });
  },

  addDCAT: function(req, res) {
      var user = req.user;
      var models = req.app.db.models;
      var name = req.body.inputDCATName;
      var license = req.body.inputDCATLicense;
      var prefix = 'dcat';
      var models = req.app.db.models;
      var data = '@prefix dcat: <http://www.w3.org/ns/dcat#> . \n\n ' +
          '<#' + name + '>' +
          '   a dcat:Dataset ;\n' +
          '   dcat:distribution [\n' +
          '      a dcat:Distribution;\n' +
          '      dcat:downloadURL "' + req.body.inputDCATURL + '" ;].\n';
        var description =
        {name: name, type: 'dcat',
            name: name,
            data: data,
            prefix: prefix,
            fullprefix: '@prefix ' + prefix + ': <http://www.w3.org/ns/dcat#> .',
            _id : mongoose.Types.ObjectId(),
            metadata: { license: license }
          };
      console.log('???');
      tripleParser.parseSourceObject(description, function() {
          saver.saveDescription(description, models, user, function(){
              console.log('[WORKBENCH LOG] DCat description added sucessfully!');
              res.send(200);
          })
      });

  },

  getDataDescriptions: function(req, res) {
        var sourceschema = req.app.db.models.Description;
        var idsources = req.user.descriptions;
        console.log('[WORKBENCH LOG] Retrieving data descriptions of ' + req.user.username + '...');
        util.retrieveDescriptions(idsources, sourceschema, function(sources)  {
            console.log('[WORKBENCH LOG] Retrieving data descriptions successful!');
            res.send(sources);
        });
  },


    /*
    * Logical Sources
    */


  addlogical_DB: function(req, res) {
      var user = req.user;
      var models = req.app.db.models;
      var name = req.body.logicalDBName;
      var license = req.body.logicalDBLicense;
      var source = req.body.logicalDBSource;
      var query = req.body.logicalDBQuery;


      util.retrieveFile(source, req.app.db.models.Description, function(description) {

          var data = '@prefix rml:      <http://semweb.mmlab.be/ns/rml#>.\n' +
                    '@prefix rr:       <http://www.w3.org/ns/r2rml#>.\n' +
                  description.data + '\n' +
              '<#' + name + '>\n\t\ta rml:logicalSource ;\n' +
              '\trml:source <#' + description.name + '> ;\n' +
              '\trr:sqlVersion rr:SQL2008;\n' +
              '\trml:query "' + query +'"  .' ;
          var logical =
          {name: name, type: 'DB',
              name: name,
              data: data,
              _id : mongoose.Types.ObjectId(),
              metadata: { license: license }
          };
          tripleParser.parseSourceObject(logical, function() {
              saver.saveLogical( logical, models, user, function(){
                  console.log('[WORKBENCH LOG] DCAT logical added sucessfully!');
                  res.send(200);
              });
          });
      });

  },

  addlogical_API: function(req, res) {
      var user = req.user;
      var models = req.app.db.models;
      var name = req.body.logicalAPIName;
      var license = req.body.logicalAPILicense;
      var type = req.body.logicalAPIType;
      var iterator = req.body.logicalAPIIterator;
      var source = req.body.logicalAPISource;


      util.retrieveFile(source, req.app.db.models.Description, function(description) {
          var data = '@prefix rml:      <http://semweb.mmlab.be/ns/rml#>.\n'+
                  description.data+ '\n'+
              '<#' + name + '> a rml:logicalSource ;\n' +
              '\trml:source <#' + source + '> ;\n' +
              '\trml:referenceFormulation ql:' +type + ';\n' +
              '\trml:iterator  "' + iterator + '" .';

          var logical =
          { name: name,type: 'API',
              name: name,
              data: data,
              _id : mongoose.Types.ObjectId(),
              metadata: { license: license }
          };
          tripleParser.parseSourceObject(logical, function() {
              saver.saveLogical( logical, models, user, function(){
                  console.log('[WORKBENCH LOG] DCAT logical added sucessfully!');
                  res.send(200);
              });
          });

      });


  },

  addlogical_SPARQL: function(req, res) {
      var user = req.user;
      var models = req.app.db.models;
      var name = req.body.LogicalSparqlName;
      var license = req.body.logicalSparqlLicense;
      var type = req.body.logicalSparqlRef;
      var iterator = req.body.logicalSparqlIterator;
      var source = req.body.logicalSparqlSource;
      var query = req.body.logicalSparqQuery;

      util.retrieveFile(source, req.app.db.models.Description, function(description) {
          var data = '@prefix rml:      <http://semweb.mmlab.be/ns/rml#>.\n' +
              '@prefix ql:       <http://semweb.mmlab.be/ns/ql#>.\n' +
                  description.data + '\n' +
              '<#' + name + '>\n\t\ta rml:logicalSource ;\n' +
              '\trml:source <#' + description.name + '> ;\n' +
              '\trml:referenceFormulation ql:' + type + ';\n' +
              '\trml:iterator  "' + iterator + '";\n' +
              '\trml:query "' + query + '"  .';
          var logical =
          {
              name: name, type: 'SPARQL',
              name: name,
              data: data,
              _id: mongoose.Types.ObjectId(),
              metadata: {license: license}
          };
          tripleParser.parseSourceObject(logical, function () {
              saver.saveLogical(logical, models, user, function () {
                  console.log('[WORKBENCH LOG] DCAT logical added sucessfully!');
                  res.send(200);
              });
          });
      });

  },

  addlogical_DCAT: function(req, res) {
      var user = req.user;
      var models = req.app.db.models;
      var name = req.body.logicalDCATName;
      var license = req.body.logicalDCATLicense;
      var type = req.body.logicalDCATType;
      var iterator = req.body.logicalDCATIterator;
      var source = req.body.logicalDCATSource;


      util.retrieveFile(source, req.app.db.models.Description, function(description) {
          var data = '@prefix rml:      <http://semweb.mmlab.be/ns/rml#>.\n' +
                  '@prefix ql:       <http://semweb.mmlab.be/ns/ql#>.\n' +
                  description.data + '\n' +
              '<#' + name + '>\n\t\ta rml:logicalSource ;\n' +
              '\trml:source <#' + description.name + '> ;\n' +
              '\trml:referenceFormulation ql:' + type + ';\n' +
              '\trml:iterator  "' + iterator + '"  .';
          var logical =
          {
              name: name, type: 'DCAT',
              name: name,
              data: data,
              _id: mongoose.Types.ObjectId(),
              metadata: {license: license}
          };
          console.log(data);
          tripleParser.parseSourceObject(logical, function () {
              saver.saveLogical(logical, models, user, function () {
                  console.log('[WORKBENCH LOG] DCAT logical added sucessfully!');
                  res.send(200);
              });
          });
      });

  },

  getLogicalDescriptions: function(req, res) {
        var sourceschema = req.app.db.models.Logical;
        var idsources = req.user.logicals;
        console.log('[WORKBENCH LOG] Retrieving data descriptions of ' + req.user.username + '...');
        util.retrieveDescriptions(idsources, sourceschema, function(sources){
            console.log('[WORKBENCH LOG] Retrieving data descriptions successful!');
            res.send(sources);
        });
  },


    /*
    * Uploading
    */

    //upload a mapping
    uploadMapping: function(req, res) {
            var license = req.body.license;
            var file = req.file;
            var user = req.user;
            var models = req.app.db.models;
            console.log('[WORKBENCH LOG] User ' + req.user.username + ' tries to upload mapping file...');
            //read the file and make mapping fields
            reader.readMappingFields(req.file, function (err,mapping) {
                //save to db
                try {
                    try {
                        if (err) {
                            throw err;
                        } else {
                            mapping.license = license;
                            saver.saveMapping(mapping, models, user, function () {
                                console.log('[WORKBENCH LOG] Upload successful!');
                                res.send(200);
                            });
                        }
                    } catch (err) {
                        console.log('[WARNING]: Wrong filetype!');
                        res.send(409);
                    }
                } catch(err) {
                    console.log('[ERRŌR] Unknown error!');
                }
            });

    },

    //upload source
    uploadSource: function(req, res) {
        try {
            var license = req.body.license;
            var file = req.file;
            var user = req.user;
            var models = req.app.db.models;
            console.log('[WORKBENCH LOG] ' + user.username + ' tries to upload source file...');
            //create source fields
            reader.readSourceFields(file, function (source) {
                source.license = license;
                saver.saveSource(source, models, user, function () {
                    console.log('[WORKBENCH LOG] Upload successful!');
                    res.send(200);
                });
            });
        } catch(err) {
            res.send(409);
        }
    },

    //upload rdf
    uploadRDF: function(req, res) {
        try {
            var license = req.body.license;
            var file = req.file;
            var userschema = req.app.db.models.User;
            var rdfschema = req.app.db.models.RDF;
            var user = req.user;

            console.log('[WORKBENCH LOG] ' + user.username + ' tries to upload RDF file...');
            //create rdf fields
            reader.readRDFFields(file, function (rdf) {
                rdf.license = license;
                saver.saveRDF(rdf, req.app.db.models, user, function () {
                    console.log('[WORKBENCH LOG] Upload successful!');
                    res.send(200);
                });
            });
        } catch(err) {

            res.send(409);
        }
    },


    //execute a whole mapping file, mapping id is needed as param
    executeMappingFromFile: function(req, res) {

        var mapping_id = req.params.mapping_id;
        var sources = req.user.sourcefiles;
        var models = req.app.db.models;
        var user = req.user;
        var outputName = req.body.name;

        util.retrieveFiles(sources, models.Source, function(sources) {
            util.retrieveFile(mapping_id, models.Mapping, function (mapping) {
                    mapper.executeMapping(mapping, sources, outputName, function (err, output) {
                        if (err) {
                            if(err.message === 'An error occurred in the processor') {
                                output.mapping_id = mapping_id;
                                saver.saveRDF(output, models, user, function (error) {
                                    if (error) {
                                        //throw err;
                                        res.send(error.message,409);
                                    } else {
                                        res.send(200); //success
                                    }
                                });
                            } else {
                                res.send('Critical error in processor: ' + err.message, 409);
                            }
                        } else {
                            output.mapping_id = mapping_id;
                            saver.saveRDF(output, models, user, function (err) {
                                if (err) {
                                    //throw err;
                                    res.send(err,500);
                                } else {
                                    res.send(200); //success
                                }
                            });
                        }
                    });
                }
            );
        });

    },

    //execute triples of a mapping file
    executeMappingFromTriples: function(req, res) {

        var mapping_id = req.params.mapping_id;
        var user = req.user;
        var triples = req.body.triples;
        var models = req.app.db.models;
        var sources = req.user.sourcefiles;
        var outputName = req.body.name;

        console.log(triples);

        util.retrieveFiles(sources, models.Source, function(sources) {
            util.retrieveFile(mapping_id, models.Mapping, function (mapping) {
                    mapper.executeTriples(mapping, triples, sources, outputName, function (err, output) {
                        if (err) {
                            if(err.message === 'An error occurred in the processor') {
                                output.mapping_id = mapping_id;
                                saver.saveRDF(output, models, user, function (error) {
                                    if (error) {
                                        //throw err;
                                        res.send(error.message,409);
                                    } else {
                                        // still a bug in processor, it's actually working!
                                        res.send(200); //success
                                    }
                                });
                            } else {
                                res.send('Critical error in processor: ' + err.message, 409);
                            }
                        } else {
                            output.mapping_id = mapping_id;
                            saver.saveRDF(output, models, user, function (err) {
                                if (err) {
                                    //throw err;
                                    res.send(err,500);
                                } else {
                                    res.send(200); //success
                                }
                            });
                        }
                    });
                }
            );
        });

    },


    /**
     * Descriptions
     */

    extractDescriptionsFromMapping: function(req, res) {
        try {
            var models = req.app.db.models;
            var user = req.user;
            var mapping_id = req.body.mapping_id;
            util.retrieveFile(mapping_id, models.Mapping, function (mapping) {
                //extract description
                descriptions = sourceExtractor.parseMappingForSources(mapping);
                for (var i = 0; i < descriptions.length; i++) {
                    //save description
                    saver.saveDescription(descriptions, models, req.user, function () {
                        res.send(200);
                    });
                }
            });
        } catch(err) {

            res.send(409);
        }

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


    /***
     *
     * Publishing
     *
     ***/
    publishToLDF: function(req, res) {
        try {
            
          publisher.publishToLDF(req.body, function() {
              res.send(200);
          })

        } catch(err) {

            res.send(409);
        }
    },


    /**
     * Scheduling
     **/

    addToSchedule: function(req, res) {

        try {
            var year = req.body.date.year;
            var month = req.body.date.month;
            var day = req.body.date.day;
            var hour = req.body.date.hour;
            var minute = req.body.date.minute;
            var date = new Date(year, month, day, hour, minute);
            console.log(req.body);
            var sources = req.user.sourcefiles;
            var models = req.app.db.models;
            var user = req.user;
            var mappingsFromFile = req.body.mappingsFromFile;
            var mappingsFromTriples = req.body.mappingsFromTriples;
            var triples = req.body.triples;
            var outputFileName = req.body.name;
            var toBePublished = req.body.toBePublished;
            var publishTitle = req.body.publishTitle;

            //array gets undefined if empty for some reason :/
            if (mappingsFromFile == undefined) {
                mappingsFromFile = [];
            }
            if (mappingsFromTriples == undefined) {
                mappingsFromTriples = [];
            }

            if(triples == undefined) {
                triples = [];
            }

            var util = require('./Utility');

            var current_id = req.user._id;

            console.log("[WORKBENCH LOG] Job added! Scheduled for " + date);
            //schedule the job with date
            var job = schedule.scheduleJob(date, function (err) {

                started.push(current_id);

                job.running = true;
                // retrieving all necessary files from db
                util.retrieveFiles(sources, models.Source, function(sources) {
                    util.retrieveFiles(mappingsFromFile, models.Mapping, function(mappingsFromFile) {

                        console.log("[WORKBENCH LOG] Executing jobs!");
                        if (mappingsFromFile.length == 1) {
                            if(triples.length == 0) {
                                mapper.executeMapping(mappingsFromFile[0], sources, outputFileName, function (err, output) {

                                    if (err) {
                                        if (err.message === 'An error occurred in the processor') {
                                            output.mapping_id = mappingsFromFile[0].mapping_id;
                                            saver.saveRDF(output, models, user, function (error) {
                                                job.running = false
                                                job.executed = true;
                                                done.push(current_id);
                                                if(toBePublished) {
                                                    var context = util.generatePublishContext(output, publishTitle);
                                                    publisher.publishToLDF(context);
                                                }
                                            });
                                        }
                                    } else {
                                        output.mapping_id = mappingsFromFile[0].mapping_id;
                                        saver.saveRDF(output, models, user, function (err) {
                                            job.running = false
                                            job.executed = true;
                                            done.push(current_id);
                                            if(toBePublished) {
                                                var context = util.generatePublishContext(output, publishTitle);
                                                publisher.publishToLDF(context);
                                            }
                                        });
                                    }
                                });
                            } else {
                                mapper.executeTriples(mappingsFromFile[0], triples, sources, outputFileName, function (err, output) {
                                    if (err) {
                                        if (err.message === 'An error occurred in the processor') {
                                            output.mapping_id = mappingsFromFile[0].mapping_id;
                                            saver.saveRDF(output, models, user, function (error) {
                                                job.running = false
                                                job.executed = true;
                                                done.push(current_id);
                                                if(toBePublished) {
                                                    var context = util.generatePublishContext(output, publishTitle);
                                                    publisher.publishToLDF(context);
                                                }
                                            });
                                        }
                                    } else {
                                        output.mapping_id = mappingsFromFile[0].mapping_id;
                                        saver.saveRDF(output, models, user, function (err) {
                                            job.running = false
                                            job.executed = true;
                                            done.push(current_id);
                                            if(toBePublished) {
                                                var context = util.generatePublishContext(output, publishTitle);
                                                publisher.publishToLDF(context);
                                            }
                                        });
                                    }
                                });
                            }

                        } else {

                        }
                    });

                });
            });

            if(job == undefined) {
                res.send(new Error('Invalid date'),400)
                return;
            }

            util.retrieveFile(mappingsFromFile[0], models.Mapping, function(mapping) {
                try {
                    job.mappingFileName = mapping.filename;
                    if (triples.length == 0) {
                        job.amountTriples = mapping.parsedObject.mappingDefinitions.length;
                    } else {
                        job.amountTriples = triples.length;
                    }
                    if (mappingsFromFile.length > 1) {
                        res.send(new Error('Not supported yet').message, 400);
                    } else {
                        schedules.push(job);
                        res.send(200);
                    }
                } catch(err) {
                    throw err
                    res.send(new Error('Scheduling failed'),400);
                }
            });

            job.running = false;
            job.title = req.body.name;
            job.date = moment(date).format('MMMM Do YYYY, h:mm:ss a');
            job.description = req.body.description;
            job.user = req.user;
            job._id = mongoose.Types.ObjectId();
            job.amountMapping = mappingsFromFile.length;
            job.publishing = toBePublished;

            job.executed = false;

        } catch(err) {
            throw err
            res.send(409);
        }
    },

    getSchedules: function(req, res) {
        try {
            console.log('[WORKBENCH LOG] Retrieving schedules..');
            var response = [];
            for (var i = 0; i < schedules.length; i++) {
                if (schedules[i].user._id === req.user._id) {
                    response.push(schedules[i]);
                }
            }
            res.send(schedules);
        } catch(err) {

            res.send(409);
        }
    },

    cancelJob: function(req, res) {
        try {
            console.log('[WORKBENCH LOG] CANCELING JOB..');
            for (var i = 0; i < schedules.length; i++) {
                console.log(req.body.schedule_id);
                console.log(schedules[i]._id);
                if (req.body.schedule_id == schedules[i]._id) {
                    schedules[i].cancel();
                    schedules.splice(i, 1);
                }
            }
            res.send(200);
        } catch(err) {

            res.send(409);
        }
    },

    isNewlyExecuted: function(req,res) {

        var isDone = false;
        var hasStarted = false;

        for(var i = 0; i < done.length; i++) {

            if(done[i].equals(req.user._id)) {
                isDone = true;
                done.splice(i,1);
                break;
            }
        }
        for(var i = 0; i < started.length;i++) {
            if(started[i].equals(req.user._id)) {
                hasStarted=true;
                started.splice(i,1);
                break;
            }
        }
        var post = {
            done: isDone,
            started: hasStarted
        }
        res.send(post);
    },

    updateMapping: function(req, res) {
        var triples = req.body.triples;
        util.retrieveFile(req.body.mapping_id, req.app.db.models.Mapping, function(mapping) {
            tripleParser.updateMappingObject(mapping.parsedObject, triples,function(mappingObject) {
                saver.updateMappingObject(req.app.db.models, mappingObject, req.body.mapping_id, function (err) {
                    if (err) {
                        res.send(err.message,409);
                    } else {
                        res.send(mappingObject,200);
                    }
                });
            });
        })

    },


    /**
     *
     * Logical Sources
     *
     */

    updateLogicalSource: function(req, res) {
        try {
            tripleParser.updateLogicalSource(req.body.mappingObject,function(mappingObject) {
                saver.updateMappingObject(req.app.db.models, mappingObject, req.body.mappingID, function (err) {
                    if (err) {
                        res.send(err.message,409);
                    } else {
                        res.send(mappingObject,200);
                    }
                });
            });

        } catch(err) {
            throw err;
            res.send(err.message,500);
        }

    },

    /**
     *
     * Data Sources
     *
     */

    updateDataSource: function(req, res) {
        try {
            var mappingObject = tripleParser.updateDataSource(req.body.mappingObject, function (mappingObject) {
                saver.updateMappingObject(req.app.db.models, mappingObject, req.body.mappingID, function (err) {
                    if (err) {
                        res.send(409);
                    } else {
                        res.send(mappingObject,200);
                    }
                });
            });

        } catch(err) {

            res.send(409);
        }

    },


    /**
     *
     * Mapping definitions
     *
     */

    updateMappingDefinition: function(req, res) {
        try {
            var mappingObject = tripleParser.updateMappingDefinition(req.body.mappingObject,function() {
                saver.updateMappingObject(req.app.db.models, mappingObject, req.body.mappingID, function (err) {
                    if (err) {
                        res.send(409);
                    } else {
                        res.send(mappingObject);
                    }
                });
            });

        } catch(err) {

            res.send(409);
        }

    },

    /**
     * Clearing (does not destroy individual data in the db, only the reference will be deleted)
     **/

    //clear all data of the user
    clearAll: function(req, res) {
        clearer.clearAll(req.user, req.app.db.models, function() {
            res.send(200);
    })
    },

    //clear all sources of the user
    clearAllSources: function(req, res) {
        clearer.clearAllSources(req.user, req.app.db.models, function() {
            res.send(200);
    })
    },

    //clear all sources of the user
    clearSources: function(req, res) {
        clearer.clearSources(req.user, req.app.db.models, req.body.sources, function() {
            res.send(200);
    })
    },

    //clear all mappings
    clearAllMappings: function(req, res) {
        clearer.clearAllMappings(req.user, req.app.db.models, function() {
            res.send(200);
    })
    },

    //clear all mappings of the user
    clearMappings: function(req, res) {
        clearer.clearMappings(req.user, req.app.db.models, req.body.mappings, function() {
            res.send(200);
    })
    },

    //clear all rdfs
    clearAllRdf: function(req, res) {
        clearer.clearAllRdf(req.user, req.app.db.models, function() {
            res.send(200);
    })
    },

    //clear all rdf of the user
    clearRdf: function(req, res) {
        clearer.clearRdf(req.user, req.app.db.models, req.body.rdf, function() {
            res.send(200);
    })
    },

    //clear all rdfs
    clearAllDescriptions: function(req, res) {
        clearer.clearAllDescriptions(req.user, req.app.db.models, function() {
            res.send(200);
    })
    },

    //clear all rdf of the user
    clearDescription: function(req, res) {
        clearer.clearDescription(req.user, req.app.db.models, req.body.description_id, function() {
            res.send(200);
    })
    },
    //clear all rdfs
    clearAllLogicals: function(req, res) {
        clearer.clearAllLogicals(req.user, req.app.db.models, function() {
            res.send(200);
        })
    },

    //clear all rdf of the user
    clearLogical: function(req, res) {
        clearer.clearLogical(req.user, req.app.db.models, req.body.logical_id, function() {
            res.send(200);
        })
    },


    /**
     * Getting
     **/

    //get sourcefiles from database by id
    getInputs: function(req, res) {
        var sourceschema = req.app.db.models.Source;


      var idsources = [req.query.idsources];

      if (!idsources[0]) {
        idsources = req.user.sourcefiles;
      }

        console.log('[WORKBENCH LOG] Retrieving sources of ' + req.user.username + '...');
        util.retrieveFiles(idsources, sourceschema, function(sources) {
            console.log('[WORKBENCH LOG] Retrieving sources successful!');
            res.send(sources);
      })
    },

    //get sources files from database used by a given mapping
    getInputsFromMapping: function(req, res) {
      var mappingschema = req.app.db.models.Mapping;
      var sourceschema = req.app.db.models.Source;
      var idmapping = req.query.idmapping;

      util.retrieveFile(idmapping, mappingschema, function(mapping) {
        console.log('[WORKBENCH LOG] Retrieving mappings successful!');

        util.getSourceTitlesAndFormat(mapping, function(results) {
          var sources = [];
          var i = 0;

          function recursive() {
            if (i < results.length) {
              util.getSourceIDByTitle(results[i].title, sourceschema, function (source) {
                source = source.toObject();
                source.format = results[i].format;
                sources.push(source);
                i++;

                recursive();
              });
            } else {
              res.send(sources);
            }
          }

          recursive();
        });
      });
    },

    //get mappingfiles from database by id
    getMappings: function(req, res) {
        var mappingschema = req.app.db.models.Mapping;
        var idmappings = [req.query.idmappings];

        if (!idmappings[0]) {
          idmappings = req.user.mappingfiles;
        }

        console.log(idmappings);
        console.log('[WORKBENCH LOG] Retrieving mappings of ' + req.user.username + '...');
        util.retrieveFiles(idmappings, mappingschema, function(mappings) {
            console.log('[WORKBENCH LOG] Retrieving mappings successful!');
            res.send(mappings);
        });
    },

    //get rdffiles from database by id
    getRdf: function(req, res) {
        var rdfschema = req.app.db.models.RDF;
        var idrdf = req.user.rdffiles;
        console.log('[WORKBENCH LOG] Retrieving rdf (' + idrdf.length + ') of ' + req.user.username + '...');
        util.retrieveFiles(idrdf, rdfschema, function(rdf) {
            console.log('[WORKBENCH LOG] Retrieving rdf successful!');
            res.send(rdf);
        });
    },

    /**
     * Provenance
     */

    createProvenance: function(req, res) {

    }
    
        

};
