/**
 * Created by Pieter Heyvaert on 15.01.16.
 */

APPLICATION_CONFIG = {
  rmlprocessor: {
    url: "http://localhost:4000"
  },
  validator: {
    url: "http://monn.elis.ugent.be:10300"
  },
  enableValidation: true,
  enableVerification: true,
  enableCompletion: true,
  graph: {
    detailLevels: {
      LOW: 10
    }
  }
};
/*
require.config({
  paths: {
    "components": "../bower_components",
    "jquery": "../bower_components/jquery/dist/jquery"
  }
});

require(['main'], function() {
  console.log('main.js loaded')
});
*/
