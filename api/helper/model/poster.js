var mongoose = require ('mongoose');
var Mixed = mongoose.Schema.Types.Mixed;
module.exports = require('../models')('Posters',{
    dateAdded           : { type: Date, default: Date.now() },
    // _addedBy            : { type: String, default: null },
    // _updatedBy          : { type: String, default: null },

    // pinned              : { type: Boolean, default: false }, top post?
    // comments            : { type: String, default: null },
    // user                : { type: 'ObjectId', ref: 'Users', default: null, index: true },
    location            : { type: String, default: null },
    // centroid            : [{ type: Mixed, default: 0.00}],
    pictures            : { type: String, default: null },
    content             : { type: String, default: null }, 

    // Permissions
    // read             : [{ type: String, trim: true, default: 'sysadmin' }],
    // write            : [{ type: String, trim: true, default: 'sysadmin' }],
    // delete           : [{ type: String, trim: true, default: 'sysadmin' }],
}, 'poster');