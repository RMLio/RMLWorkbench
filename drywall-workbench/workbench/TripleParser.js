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
            prefixes: undefined,
            toString: ''
        };

        exports.parse(mapping, function(triples, prefixes) {

            mappingObject.triples = triples;
            mappingObject.prefixes = prefixes;

            lookUpNames(mappingObject);
            addDetails(mappingObject);
            mappingObject.toString = getFormattedMapping(mappingObject);
            callback(mappingObject);

        });

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
 * Convert a parsed document
 * @param triples
 * @param prefix
 * @returns {string}
 */
var convertParsedMappingObject = function(triples, prefixes, unique) {

    var pre = '';
    var output ='';
    pre = addPrefixes(output,prefixes);

    for(var i = 0 ; i < triples.length;i++) {

        if(!n3util.isBlank(triples[i].subject)) {
           output += convertBlockToString(triples[i], triples, 0, unique);
        }

    }

    output = convertUniqToString(unique)

    output = replaceWithPrefix(output, prefixes);

    output = pre + '\n\n\n\n\n' + output;

    return output;

};

/**
 * Adds prefixes to document
 * @param input
 * @param prefixes
 */
var addPrefixes = function(input,prefixes) {
    for(var prefix in prefixes){
        input+= '@prefix ' + prefix + ':\t\t\t<' + prefixes[prefix] + '>\n';
    }
    return input;
}

/**
 * Replaces prefixes
 * @param output
 * @param prefixes
 */
var replaceWithPrefix = function(input, prefixes) {
    var output=input;
    for(var prefix in prefixes) {
        var toBeReplaced = prefixes[prefix].replace(/[<>]+/g, '');
        output = output.replace(new RegExp(toBeReplaced, 'g'), prefix+':');
    }
    return output;
}

/**
 * WAAW
 * @param triple
 * @param triples
 */
var convertBlockToString = function(triple, triples, indent, uniq) {

    var string = '';
    if(!n3util.isBlank(triple.subject) && !n3util.isBlank(triple.object)) {

        string += addIndent(indent)  + converter(triple.predicate) + '   ' + converter(triple.object) + ' .';
        addToUniq(string,triple.subject,uniq);
    } else if(n3util.isBlank(triple.subject) && n3util.isBlank(triple.object)) {
        string += addIndent(indent) + converter(triple.predicate) + ' [ \n';
        var childs = [];
        for(var i = 0; i < triples.length; i++) {
            if(triple.object == triples[i].subject) {
                childs.push(triples[i]);
            }
        }
        for(var i = 0; i < childs.length; i++) {
            string += addIndent(indent + 1) + convertBlockToString(childs[i], triples, indent + 2);
            if(i == childs.length-1) {
                string += ' ] \n';
            } else {
                string += ' ; \n';
            }
        }
        return string;
    } else if(n3util.isBlank(triple.object)) {
        string += addIndent(indent) +  converter(triple.predicate) + ' [ \n';
        var childs = [];
        for(var i = 0; i < triples.length; i++) {
            if(triple.object == triples[i].subject) {
                childs.push(triples[i]);
            }
        }
        for(var i = 0; i < childs.length; i++) {
            string += addIndent(indent + 1) + convertBlockToString(childs[i], triples, indent + 2);
            if(i == childs.length-1) {
                string += ' ] \n';
            } else {
                string += ' ; \n';
            }
        }
        string += '.';
        addToUniq(string,triple.subject,uniq);
    } else if(n3util.isBlank(triple.subject)) {
        string += addIndent(indent) + converter(triple.predicate) + '   ' + converter(triple.object);
        return string;
    }

}

/**
 * Check for literal
 * @param literal
 * @returns {*}
 */
var converter = function(literal) {
    if(literal.charAt(0) !== '"' && literal.charAt(0) !== "'" ) {
        return '<' + literal + '>';
    } else {
        return literal;
    }
};

var addIndent =function(amount) {
    var string = '';
    for(var i = 0; i < amount ;i++) {
        string += '   ';
    }
    return string;
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

var notInUniq = function(subject, uniq) {
    for(var i = 0; i < uniq.length; i++) {
        if(uniq[i].head == subject) {
            return false;
        }
    }
    return true;
};

var addToUniq = function(string, subject, uniq) {
    for(var i = 0; i < uniq.length; i++) {
        if(uniq[i].head == subject) {
            uniq[i].tail.push(string);
        }
    }
};

var convertUniqToString = function(uniq) {
    var output = '';
    for(var i = 0; i < uniq.length; i++) {
        output += '<' + uniq[i].head + '>\n';
        for(var j = 0; j < uniq[i].tail.length; j++) {
            if(j != uniq[i].tail.length-1) {
                output += '   ' + uniq[i].tail[j].replaceAt(uniq[i].tail[j].lastIndexOf('.'), ';\n');
            } else {
                output += '   ' + uniq[i].tail[j] + '\n\n\n';
            }
        }
    }
    return output;
}

//replace method
String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}


var getFormattedMapping = function(mapping) {
    var uniq = [];
    for(var i = 0; i < mapping.triples.length; i++) {
        if(!n3util.isBlank(mapping.triples[i].subject) && notInUniq(mapping.triples[i].subject,uniq) ) {
            uniq.push({head:mapping.triples[i].subject,tail:[]});
        }
    }
    return convertParsedMappingObject(mapping.triples, mapping.prefixes, uniq).replace(/(\<)(\w*:\w*)(\>)/g,"$2");
}


//testing
fs.readFile('mapping.rml.ttl', 'utf8', function(err, document) {


    exports.parseRMLMapping(document, function(mapping) {

        console.log(getFormattedMapping(mapping));

    });



});
