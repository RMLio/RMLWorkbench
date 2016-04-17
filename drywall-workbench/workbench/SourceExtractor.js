var fs = require('fs');

/*
*   Set of function to parse sources of a mapping file
*/

var exports = module.exports = {
    
    parseMappingForSources : function(mapping) {
        return parseForSources(mapping.data);        
    },
    
    parseForSources : function(data) {        
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
                        switch(prefixes[prefixIndex].prefix) {
                            case 'dcat':                                
                                description = { type: 'dcat',
                                    data: getCurrentDiscription(startDescription, content)};
                                descriptions.push(description);
                                break;
                            case 'hydra':
                                description = { type: 'hydra', 
                                    data: getCurrentDiscription(startDescription, content)};
                                descriptions.push(description);
                                break;
                            case 'd2rq':
                                description = { type: 'd2rq', 
                                    data: getCurrentDiscription(startDescription, content)};
                                descriptions.push(description);
                                break;
                            case 'sd':
                                description = { type: 'sd', 
                                    data: getCurrentDiscription(startDescription, content)};
                                descriptions.push(description);
                                break;
                            case 'csvw':
                                description = { type: 'csvw',
                                    data: getCurrentDiscription(startDescription, content)};
                                descriptions.push(description);
                                break;  
                        }                            
                            
                    }                
                                                
                }
            }
            
        }
        return descriptions;
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

var indexNextCharacter = function(i, content) {
    var j = i +1;
    while(content[j] == ' ') {
        j++;
    }
    return j;
};

var getCurrentDiscription = function(start, content) {
    var i = start +1;
    var description = content[start];    
    while(content[i].substring(content[i].length-1,content[i].length) !== '.') {                              
        description = description + ' ' + content[i];
        i++;
    }       
    return description + ' ' + content[i];
};

fs.readFile('./test.txt', 'utf8', (err, data) => { //using arrow function, this has no 'this'
        if (err) throw err;        
        console.log(exports.parseForSources(data));   
});