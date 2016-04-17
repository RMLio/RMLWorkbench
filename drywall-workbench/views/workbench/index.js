'use strict';

exports.init = function(req, res){
  
  req.app.db.models.License.find({},function(err, ls) {
      res.render('workbench/index',{licenses : ls});
  });
};


