/**
 * Created by Pieter Heyvaert, Data Science Lab (Ghent University - iMinds) on 8/16/16.
 */
/**
 * Created by Pieter Heyvaert, Data Science Lab (Ghent University - iMinds) on 4/1/16.
 */

'use strict';

exports.init = function(req, res){
  res.render('editor/index', {mappingid: req.query.idmappings});
};