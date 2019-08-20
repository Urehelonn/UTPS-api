'use strict';

var _               = require('lodash');
var mongoose        = require('mongoose');
var MAX_LIMIT       = 1000;

var DEFAULT_PAGESIZE  = 100;

exports.buildQuery = function (property, values, query) {
    var oids = [];
    if (_.isArray(values)) {
        _.each(values, function (i) {
          oids.push(mongoose.Types.ObjectId(i));
        });
    } else {
        oids.push(mongoose.Types.ObjectId(values));
    }
    return _.assignIn(query, { [property]: {
        $in: oids
      }
    });
};


exports.getSkipLimitParameters = function (pageSize, pageNum) {
    const params = {};

    var ps = DEFAULT_PAGESIZE; // Default
    if (pageSize && pageSize.value !== undefined) {
      if (pageSize.value > 0) {
        ps = pageSize.value;
      }
    }
    if (pageNum && pageNum.value !== undefined) {
      if (pageNum.value >= 0) {
        params.skip = (pageNum.value * ps);
        params.limit = ps;
      }
    }
    return params;
};

exports.recordAction = async function (action, meta, payload, objId = null){
  var Audit = mongoose.model('Audit');
  var audit = new Audit({
    _objectSchema: 'Query',
    action: action,
    meta: meta,
    objId: objId,
    performedBy: payload
  });
  return await audit.save();
}

exports.runDataQuery = async function (modelType, query, fields, sort, populateProponent = false, postQueryPipelineSteps = false, populateProject = false) {
    return new Promise(async function (resolve, reject) {
        var theModel = mongoose.model(modelType);
        var projection = {};

        // Fields we always return
        var defaultFields = ['_id',
                            'code',
                            'proponent',
                            'tags',
                            'read'];
        _.each(defaultFields, function (f) {
            projection[f] = 1;
        });

        // Add requested fields - sanitize first by including only those that we can/want to return
        _.each(fields, function (f) {
            projection[f] = 1;
        });

        var aggregations = _.compact([
        {
            '$match': query
        },
        {
            '$project': projection
        },
        populateProponent && {
          '$lookup': {
            "from": "utpsdb",
            "localField": "proponent",
            "foreignField": "_id",
            "as": "proponent"
          }
        },
        populateProponent && {
          "$unwind": "$proponent"
        },
        populateProject && {
          '$lookup': {
            "from": "utpsdb",
            "localField": "project",
            "foreignField": "_id",
            "as": "project"
          }
        },
        populateProject && {
          "$unwind": {
            "path": "$project",
            "preserveNullAndEmptyArrays": true
          }
        },
        // postQueryPipelineSteps,
        // {
        //   $redact: {
        //     $cond: {
        //       if: {
        //         // This way, if read isn't present, we assume public no roles array.
        //         $and: [
        //           { $cond: { if: "$read", then: true, else: false } },
        //           {
        //             $anyElementTrue: {
        //               $map: {
        //                 input: "$read",
        //                 as: "fieldTag",
        //                 in: { $setIsSubset: [["$$fieldTag"], role] }
        //               }
        //             }
        //           }
        //         ]
        //       },          
        //     then: "$$KEEP",
        //       else: {
        //         $cond: { if: "$read", then: "$$PRUNE", else: "$$DESCEND" }
        //       }
        //     }
        //   }
        // },
        !_.isEmpty(sort) ? { $sort: sort } : null,

        sort ? { $project: projection } : null, // Reset the projection just in case the sortWarmUp changed it.

        // Do this only if they ask for it.
        ]);

        let collation = {
            locale: 'en',
            strength: 2
        };
        console.log('aggregation', aggregations);
        theModel.aggregate(aggregations)
        .collation(collation)
        .exec()
        .then(resolve, reject);
    });
};