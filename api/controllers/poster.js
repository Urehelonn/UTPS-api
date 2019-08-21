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
var defaultLog    = require('../../logger');



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
  // _.assignIn(query, { '_schemaName': 'Posters', validation: true });  // future feature
  try{
    var data =  await utils.runDataQuery('Posters',
    query,
    fields, // Fields
    sort, // sort
    false,
    false,
    true);
    // console.log('data', data);
    utils.recordAction('Get', 'Poster', 'public');
    return actions.sendResponse(res, 200, data);
  }
  catch(error){
    defaultLog.errorLog.info( 'Error: ', error);
    return actions.sendResponse(res, 400, error)
  }
  
}

//  Create a new RecentActivity
exports.newPost = async function (args, res, next) {
  console.log('poster', args.swagger.params);
  var obj = args.swagger.params.Poster.value;
  defaultLog.accessLog.info("Incoming new object:", obj);

  var Poster = mongoose.model("Posters");
  delete obj._id;
  var newPoster = new Poster(obj);
  // Define security tag defaults.  Default public and sysadmin. // future feature plc holder

  // if (poster.validation) {
  //   newPoster.read = ['sysadmin', 'public'];
  // } else {
  //   newPoster.read = ['sysadmin'];
  // }

  newPoster.dateAdded = new Date();
  // recentActivity._addedBy = args.swagger.params.auth_payload.preferred_username;
  try {
    var rec = await newPoster.save();
    // args.swagger.params.auth_payload.preferred_username
    utils.recordAction('Post', 'newPoster', 'Billy', rec._id);
    defaultLog.info('Saved new Posyer object:', rec);
    return actions.accessLog.sendResponse(res, 200, rec);
  } catch (e) {
    defaultLog.errorLog.info('Error:', e);
    return actions.sendResponse(res, 400, e);
  }
};