var N3 = require('n3');
var n3parser = N3.Parser();
var n3util = N3.Util;
var fs = require('fs');

var exports = module.exports = {

    //parses triples and when finished gives the result as parameters in the callback
    parse: function(document, callback) {

        var triples =  [];

        n3parser.parse(document, function(err, triple, prefix) {

            if(err) throw err;

            if(triple) {
                triples.push(triple);
            } else {
                callback(triples, prefix);
            }

        });
    },

    //parses a mapping document
    parseRMLMapping: function(mapping, callback) {

        var mappingObject = {

            mappingDefinitions: [],
            logicalSources: [],
            inputSources: [],
            mappingDefinitionsTermMappings:[],
            prefixes: undefined

        };

        exports.parse(mapping, function(triples, prefixes) {

            mappingObject.triples = triples;
            mappingObject.prefixes = prefixes;

            lookUpNames(mappingObject);
            addDetails(mappingObject);

            callback(mappingObject);

        });

    },

    triplesToString: function(triples, prefixes, callback) {
        var writer = N3.Writer({prefixes: prefixes});
        for(var i = 0; i < triples.length; i++) {
            writer.addTriple(triples[i].subject, triples[i].predicate, triples[i].subject);
        }
        writer.end(function(err, data) { callback(data) });
    }

 };




/**
 *
 * Private methods
 *
 */

/**
 * Look for names of different triple types
 * @param mappingObject
 */
var lookUpNames = function(mappingObject) {


    for(var i = 0; i < mappingObject.triples.length; i++) {

        switch(mappingObject.triples[i].predicate) {

            case 'http://semweb.mmlab.be/ns/rml#source':
                mappingObject.logicalSources.push({ uri: mappingObject.triples[i].subject});
                break;

            case 'http://semweb.mmlab.be/ns/rml#logicalSource':
                mappingObject.mappingDefinitions.push({ uri: mappingObject.triples[i].subject});
                break;

            case 'http://www.w3.org/ns/r2rml#parentTriplesMap':
                mappingObject.mappingDefinitionsTermMappings.push( {uri: mappingObject.triples[i].subject} );

        }

        if(mappingObject.triples[i].predicate.match(/(.*)\#/) != null) {
            switch (mappingObject.triples[i].predicate.match(/(.*)\#/)[0]) {

                case 'http://www.w3.org/ns/dcat#':
                    mappingObject.inputSources.push({ uri: mappingObject.triples[i].subject});
                    break;

                case 'http://www.w3.org/ns/hydra/core#':
                    mappingObject.inputSources.push({ uri: mappingObject.triples[i].subject});
                    break;

                case 'http://www.wiwiss.fu-berlin.de/suhl/bizer/D2RQ/0.1#':
                    mappingObject.inputSources.push({ uri: mappingObject.triples[i].subject});
                    break;


                case 'http://www.w3.org/ns/sparql-service-description#':
                    mappingObject.inputSources.push({ uri: mappingObject.triples[i].subject});
                    break;

                case 'http://www.w3.org/ns/csvw#':
                    mappingObject.inputSources.push({ uri: mappingObject.triples[i].subject});
                    break;

            }
        }

    }

};



/**
 * Add details to all types
 * @param mappingObject
 */
var addDetails = function(mappingObject) {

    //mapping definitions
    for(var i = 0; i < mappingObject.mappingDefinitions.length; i++) {
        addTriples(mappingObject.mappingDefinitions[i], mappingObject);
    }

    //mapping definitions
    for(var i = 0; i < mappingObject.mappingDefinitionsTermMappings.length; i++) {
        addTriples(mappingObject.mappingDefinitionsTermMappings[i], mappingObject);
    }

    //logical sources
    for(var i = 0; i < mappingObject.inputSources.length; i++) {
        addTriples(mappingObject.inputSources[i], mappingObject);
    }

    //input sources
    for(var i = 0; i < mappingObject.logicalSources.length; i++) {
        addTriples(mappingObject.logicalSources[i], mappingObject);
    }


};

/**
 * Add triples to all wrappers
 * @param wrapper
 * @param mappingObject
 */
var addTriples = function(wrapper, mappingObject) {

    wrapper.triples = [];
    for(var i = 0; i < mappingObject.triples.length; i++) {
        if(mappingObject.triples[i].subject == wrapper.uri) {
            addReferencesRecursively(mappingObject.triples[i], wrapper, mappingObject);
        }
    }

};

/**
 * Add references (blank nodes) recursiveley to the wrapper
 * @param triple
 * @param wrapper
 * @param mappingObject
 * @constructor
 */
var addReferencesRecursively = function(triple, wrapper, mappingObject) {

    //add the triple
    wrapper.triples.push(triple);

    //if blank node is present
    if(n3util.isBlank(triple.object)) {
        for(var i = 0; i < mappingObject.triples.length; i++) {
            if(mappingObject.triples[i].subject == triple.object) {
                addReferencesRecursively(mappingObject.triples[i], wrapper, mappingObject);
            }
        }
    }
};

//testing
fs.readFile('mapping.rml.ttl', 'utf8', function(err, document) {


    exports.parseRMLMapping(document, function(mapping) {


        console.log(mapping.mappingDefinitionsTermMappings[0].triples);


    });



});
