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
    removeEndpoint: function(endpoint, user, models, callback) {
        clearer.clearEndpoint(endpoint, user, models, () => {
            console.log('[WORKBENCH LOG] Sparql endpoint removed.');
            callback(); 
        });
    },    
    
    //execute multiple queries in normal/json format
    executeQueries: function(queries, url, isJson, callback) {
        console.log('[WORKBENCH LOG] Executing queries (' + queries.length + '...');
        var query;
        var endpoint = new SparqlHttp({ endpointUrl: url });   
        var done = 0;
        var responses = [];        
        for(var i = 0; i < queries.length; i++) {
            query = queries[i];
            if(isJson) query = generator.stringify(query);
            console.log(isJson)
            console.log(query);
            endpoint.selectQuery(query, (err, response) => {
                if(err) throw err;                
                responses.push(response);
                done++;
                console.log('[WORKBENCH LOG] Sparql query executed. (' + done + ')');
                if(done == queries.length) {
                    console.log('[WORKBENCH LOG] All queries done.');
                    callback(responses);
                }
            })
        }     
        if(queries.length == 0) {
            console.log('[WORKBENCH LOG] No queries to be executed.');
            callback(null);
        }   
    }, 

    //returns all endpoints from a user
    getEndpoints: function(user, models, callback) {
        loader.loadEndpoints(user, models, (endpoints) => {
            callback(endpoints);
        });
    },
    
    //clears all endpoints
    removeEndpoints: function(user, models, callback) {
        clearer.clearEndpoints(user, models, () => {
            callback();
        });
    }       
            
}

