'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var utils         = require('../helper/utils');
var mongoose      = require("mongoose");
var actions       = require('../helper/actions');
var _             = require('lodash');
var defaultLog = require('winston').loggers.get('default');



exports.protectedOptions = function (args, res, rest) {
  res.status(204).send();
}

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
exports.publicGet = async function (req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var fields = ['_schemaName',
    'dateAdded',
    'location',
    'pictures',
    'content'];
  var poster = mongoose.model("Posters");
  var query = {};
  var sort = {
    dateAdded: -1
  };
  _.assignIn(query, { '_schemaName': 'Posters'});
  try{
    var data =  await utils.runDataQuery('Posters',
    query,
    fields, // Fields
    sort, // sort
    false,
    false,
    true);
    console.log('data', data);
    utils.recordAction('Get', 'Poster', 'public');
    return actions.sendResponse(res, 200, data);
  }
  catch(error){
    defaultLog.info( 'Error: ', error);
    return actions.sendResponse(res, 400, error)
  }
  
}