var mongoose = require('mongoose');
var fs = require('fs');
var mkdir = require('mkdirp');

var exports = module.exports = {


    launchProcessor: function(data, triples, files, outputName, callback) {

        //creating unique key
        var unique_key = mongoose.Types.ObjectId();
        var mappingFilename = 'input'+unique_key+'.rml';
        //writing mapping file
        fs.writeFile(mappingFilename, data, 'utf8', function(err) {
            if(err) {
                callback(err);
            } else {

                if(files.length == 0) {
                    console.log('[WORKBENC LOG] Starting processor...');
                    spawnRMLProcessor(mappingFilename, null, outputName, function (err, rdf) {
                        if (err) {
                            callback(err, rdf);
                        } else {
                            callback(err, rdf);
                        }
                    });

                } else {

                    //write source files, when last source file has been written, spawn mapper
                    var written = 0;

                    for (var i = 0; i < files.length; i++) {

                        var j = i; //async

                        fs.writeFile(files[i].filename, files[i].data, 'utf8', function (err) {

                            if (err) {

                                callback(err);

                            } else {

                                written++;

                                if (written == files.length) {

                                    spawnRMLProcessor(mappingFilename, triples, outputName, function (err, rdf) {
                                        callback(err,rdf);
                                    });

                                }

                            }

                        });
                    }
                }
            }
        });
    }
}

var spawnRMLProcessor = function(mappingFilename, triples, outputName, callback) {

    var triplecmd = '';

    if(triples) {
        triplecmd = '-tm ';
        for(var i = 0; i < triples.length; i++) {
            if(i != triples.length) {
                triplecmd += triples[i].uri.replace(/(.*)\#/, '') + ',';
            } else {
                triplecmd += triples[i].uri.replace(/(.*)\#/, '');
            }
        }
    }

    var unique_key = mongoose.Types.ObjectId();

    var command = 'java -jar ./workbench/rmlmapper/RML-Mapper.jar -m '+mappingFilename+' -o ./workbench/rmlmapper/tmp'+unique_key+'/output'+ unique_key +'.rdf ' + triplecmd;

    console.log(command);

    mkdir('./workbench/rmlmapper/tmp'+unique_key, function() {
        //map the file
        const spawner = require('child_process');
        const spawn = spawner.exec(command);

        var rmlprocessoroutput = '';
        //logging
        spawn.stdout.on('data', function(data) {
            //console.log(`stdout: ${data}`);
            rmlprocessoroutput += data;
        });
        spawn.stderr.on('data', function(data) {
            console.log(`stdout: ${data}`);
        });

        spawn.on('close', function() {


            fs.writeFile('mappinglog.txt', rmlprocessoroutput, 'utf8', function (err) {
                if(err) throw(err);
                console.log('[RMLPROCESSOR LOG] LOG WRITTEN TO "mappinglog.txt"!');
            });

            fs.readFile('./workbench/rmlmapper/tmp'+unique_key+'/output' + unique_key + '.rdf', 'utf8', function (err, data) { //using arrow function, this has no 'this'
                if (err) {
                    callback(err);
                } else {
                    result = {
                        filename: outputName + '.rdf',
                        data: data,
                        metadata: 'empty',
                        type: 'rdf',
                        _id: mongoose.Types.ObjectId()
                    };
                    console.log(result);
                    if (rmlprocessoroutput.indexOf('ERROR') > -1) {
                        console.log('[RMLPROCESSOR LOG] ERROR IN MAPPING!');
                        fs.writeFile('errormappinglog.txt', rmlprocessoroutput, 'utf8', function (err) {
                            console.log('[RMLPROCESSOR LOG] LOG WRITTEN TO "errormappinglog.txt"!');
                        });
                        callback(new Error('An error occurred in the processor'), result);
                    } else {
                        callback(null, result);
                    }
                }
            });

        });
    });




};
