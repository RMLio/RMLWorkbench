var fs = require('fs');

/*
*   Set of function to parse sources of a mapping file
*/

var exports = module.exports = {
    
    parseMappingForDescriptions : function(mapping) {
        return parseForDescriptions(mapping.data);        
    },
    
    parseForDescriptions : function(data) {       
         
        var content = data.replace(/(?:\r\n|\r|\n|\t)/g, ' ');
        content = content.split(" ");
        var prefixes = [];
        var descriptions = [];         
        findPrefixes(content, prefixes);                                                               
        
        //look for descriptions
        for(var i=0; i < content.length;i++) {                    
            var startDescription = i;         
            if(content[i].indexOf('>') > -1) {
                
                var t =i+1                
                while(content[t] !== 'a' && content[t] !== '.') {
                    t++;
                }                          
                 
                
                if(content[t] === 'a') {
                    var j = t+1
                    while(content[j] === ' ' || content[j]=== ':') {
                        j++;
                    } 
                    var prefix = content[j];
                    
                    if(prefix.indexOf(':') > -1) {
                        prefix = prefix.slice(0,prefix.indexOf(':'));        
                    }
                    
                    var prefixIndex;
                    for(var k = 0; k < prefixes.length; k++) {
                        if(prefixes[k].prefix === prefix) {
                            prefixIndex = k;   
                        }
                    }
                    
                    
                    
                    if(prefixIndex != undefined) {
                        var description;
                        switch(prefixes[prefixIndex].type) {
                            case 'dcat':                                
                                description = { type: 'dcat',
                                    data: getCurrentDiscription(startDescription, content),
                                    prefix: prefix,
                                    fullprefix: '@prefix ' + prefix +': <http://www.w3.org/ns/dcat#> .'
                                };                                    
                                descriptions.push(description);
                                break;
                            case 'hydra':
                                description = { type: 'hydra', 
                                    data: getCurrentDiscription(startDescription, content),
                                    prefix: prefix,
                                    fullprefix: '@prefix ' + prefix +': <http://www.w3.org/ns/hydra/core#> .'};
                                descriptions.push(description);
                                break;
                            case 'd2rq':
                                description = { type: 'd2rq', 
                                    data: getCurrentDiscription(startDescription, content),
                                    prefix: prefix,
                                    fullprefix: '@prefix ' + prefix +': <http://www.wiwiss.fu-berlin.de/suhl/bizer/D2RQ/0.1#> .'};
                                descriptions.push(description);
                                break;
                            case 'sd':
                                description = { type: 'sd', 
                                    data: getCurrentDiscription(startDescription, content),
                                    prefix: prefix,
                                    fullprefix: '@prefix ' + prefix +': <http://www.w3.org/ns/sparql-service-description#> .'};
                                descriptions.push(description);
                                break;
                            case 'csvw':
                                description = { type: 'csvw',
                                    data: getCurrentDiscription(startDescription, content),
                                    prefix: prefix,
                                    fullprefix: '@prefix ' + prefix +': <http://www.w3.org/ns/csvw#> .'};
                                descriptions.push(description);
                                break;  
                        }                            
                            
                    }                
                                                
                }
            }
            
        }
        return descriptions;
    },
    
    //add description to mapping file
    addDescriptionToMapping : function(description, mapping) {
        addPrefixToMapping(description.fullprefix,description.prefix, mapping);
        var content = mapping.data;
        content = content.split("\n");         
        var i = 0;
        //iterate through prefixes
        while(content[i].indexOf('@prefix') > -1 || content[i].indexOf('<') == -1) {
            i++;
        }
        
        //add the description to the mapping
        var data = '';
        for(var j =0; j < content.length; j++) {
            if(j == i) {
                data += description.data + '\n\n';
            }
            data += content[j] + '\n';        
        }
        mapping.data = data;
        return mapping;        
    },
    
    removeDescriptionFromMapping : function(description, mapping) {
              
    },
    
    
    parseDCAT : function(dcat) {
            
    },
    
    parseHydra : function(hydra) {
        
    },
    
    parseD2RQ : function(d2rq) {
        
    },
    
    parseSPARQLSD : function(sparqlsd) {
        
    },
    
    parseCSVW : function(csvw) {
        
    },
    
    parseLSD : function(lsd) {
        
    }
       
};

//private function for adding a prefixline to a mapping
var addPrefixToMapping = function(fullprefix, prefix, mapping) {
    var content = mapping.data.split('\n');
    var i = 0;
    //iterate through prefixes
    var contains = false;    
    while (content[i].indexOf('@prefix') > -1 || content[i].indexOf('<') == -1) {
        //console.log(content[i]);
        if(content[i].indexOf(prefix) > -1) {
            contains = true;    
        }
        i++;
    }   
    //add prefix
    var data = '';
    if(!contains) {
        for(var j = 0; j < content.length; j++) {
            if(j == i) {
                data += fullprefix + '\n\n';    
            }
            data += content[j] + '\n';
        } 
        mapping.data = data;       
    }    
};

//private function to look for prefixes in a mapping file
var findPrefixes = function(content, prefixes) {
    
    //look for prefixes
        for(var i = 0; i < content.length; i++) {
            
            switch(content[i]) {
                case '<http://www.w3.org/ns/dcat#>':                                  
                    var prefix = { prefix: findPrefix(i, content),
                                    type: 'dcat'
                                };                                      
                    prefixes.push(prefix);
                    break;
                case '<http://www.w3.org/ns/hydra/core#>':
                    var prefix = { prefix: findPrefix(i, content),
                                    type: 'hydra'
                                }; 
                    prefixes.push(prefix);
                    break; 
                case '<http://www.wiwiss.fu-berlin.de/suhl/bizer/D2RQ/0.1#>':
                    var prefix = { prefix: findPrefix(i, content),
                                    type: 'd2rq'
                                }; 
                    prefixes.push(prefix);            
                    break; 
                case '<http://www.w3.org/ns/sparql-service-description#>': 
                    var prefix = { prefix: findPrefix(i, content),
                                    type: 'sd'
                                }; 
                    prefixes.push(prefix);            
                    break;
                case '<http://www.w3.org/ns/csvw#>':  
                    var prefix = { prefix: findPrefix(i, content),
                                    type: 'csvw'
                                }; 
                    prefixes.push(prefix);
                    break;                             
                                    
            }
        }
    
};

//look for prefix in description
var findPrefix = function(i, content) {
    var j = i-1;
    while(content[j] === ' ' || content[j] === ':') {
        j--;    
    }     
    var prefix = content[j];    
    
    //remove ':' 
    if(prefix.indexOf(':') > -1) {
        prefix = prefix.slice(0,prefix.length-1);
    }    
    return prefix;    
};

//get the index of the next character that is not a whitespace
var indexNextCharacter = function(i, content) {
    var j = i +1;
    while(content[j] == ' ') {
        j++;
    }
    return j;
};

//get the full description starting from the start index
var getCurrentDiscription = function(start, content) {
    var i = start +1;
    var description = content[start];    
    while(content[i].substring(content[i].length-1,content[i].length) !== '.') {                              
        description = description + ' ' + content[i];
        i++;
    }       
    return description + ' ' + content[i];
};

//testfunction
fs.readFile('./test.txt', 'utf8', (err, data) => { //using arrow function, this has no 'this'
        if (err) throw err;     
        var mapping = {};   
        mapping.data = data;
        descriptions = exports.parseForDescriptions(data);           
        exports.addDescriptionToMapping(descriptions[0], mapping);
        exports.addDescriptionToMapping(descriptions[2], mapping);
        exports.addDescriptionToMapping(descriptions[1], mapping); 
        var test = {
            type: 'd2rq', 
            data: '<#DB_source> a d2rq:Database; d2rq:jdbcDSN "jdbc:mysql://localhost/example";d2rq:jdbcDriver "com.mysql.jdbc.Driver";d2rq:username "user";d2rq:password "password" .',
            prefix: 'test',
            fullprefix: '@prefix ' + 'test' +': <http://www.wiwiss.fu-berlin.de/suhl/bizer/D2RQ/0.1#> .'    
        };
        exports.addDescriptionToMapping(test,mapping);
        
        console.log(mapping.data);       
});