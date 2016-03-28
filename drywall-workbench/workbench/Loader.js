'use strict'

var mongoose = require('mongoose');

exports = module.exports = {  
    
    
    //loads endpoints of a user
    loadEndpoints : function(user, models, callback) {
        models.User.findOne({_id : user._id}, (err, user) => {
            if(err) throw err;
            callback(user.endpoints);
        });
    } 
     
    
}