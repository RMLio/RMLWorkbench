'use strict'

var request = require('request')
var SparqlHttp = require('sparql-http-client')
var SparqlGenerator = require('sparqljs').Generator;
var generator = new SparqlGenerator();
var saver = require('./Saver');
var clearer = require('./Clearer');
var loader = require('./Loader');
 
// use the request module for all requests
SparqlHttp.request = SparqlHttp.requestModuleRequest(request)
 
exports = module.exports = {

    //add a sparql endpoint the users collection
    addSparqlEndpoint: function(endpoint, user, models, callback) {
        saver.saveEndpoint(endpoint, user, models, () => {
            console.log('[WORKBENCH LOG] Sparql endpoint added.');
            callback();            
        });
    },

    //remove a sparql endpoint form the users collection 
    removeSparqlEndpoint: function(endpoint, user, models, callback) {
        clearer.clearEndpoint(endpoint, user, models, () => {
            console.log('[WORKBENCH LOG] Sparql endpoint removed.');
            callback(); 
        });
    },    

    //execute a query in normal/json format
    executeQuery: function(query, url, isJson, callback) {
        if(isJson) query = generateQueryFromJson(query);
        var endpoint = endpoint(url);
        endpoint.selectQuery(query, (err, response) => {
            if(err) throw err;
            console.log('[WORKBENCH LOG] Sparql query executed.');
            callback(response);
        });    
    },
    
    //execute multiple queries in normal/json format
    executeQueries: function(queries, url, isJson, callback) {
        var query;
        var endpoint = endpoint(url);   
        var done = 0;
        var responses = [];
        for(var i = 0; i < queries.length; i++) {
            query = queries[i];
            if(isJson) query = generateQueryFromJson(query);
            endpoint.selectQuery(query, (err, response) => {
                if(err) throw err;
                console.log('[WORKBENCH LOG] Sparql query executed.');
                responses.push(response);
                done++;
                if(done == queries.length) {
                    console.log('[WORKBENCH LOG] All queries done.');
                    callback(responses);
                }
            })
        }        
    }, 

    //returns all endpoints from a user
    getEndpoints: function(user, models, callback) {
        loader.loadEndpoints(user, models, (endpoints) => {
            callback(endpoints);
        });
    },
    
    //clears all endpoints
    clearEndpoints: function(user, models, callback) {
        clearer.clearEndpoints(user, models, () => {
            callback();
        });
    }       
            
}

//return a new Sparqlendpoint
var endpoint = function(url) {
    return new SparqlHttp({ endpointUrl: url });
};

//return a query from json 
var generateQueryFromJson = function(query) {
    return generator.stringify(query);
};