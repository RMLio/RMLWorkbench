'use strict';

exports.init = function(req, res){
  if (req.isAuthenticated()) {
    res.redirect('/workbench/');
  } else {
    res.render('index');
  }
};
