'use strict';

exports.init = function(req, res){
  
  req.app.db.models.License.find({},function(err, ls) {
      var licenseCats = {}
      for (var key in ls) {         
         if (ls.hasOwnProperty(key)) {
            var cat = ls[key].category;
            if(cat in licenseCats){
                licenseCats[cat].push(ls[key])
            } else{
                licenseCats[cat] = [ls[key]]                
            }
         }
      }
      res.render('workbench/index',{licenses : licenseCats, inputs : req.user.sourcefiles});
  });
};
