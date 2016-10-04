'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wcquery = exports.vents = undefined;

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vents = exports.vents = {
  '!': function _(name, value) {
    return { name: name, value: { $ne: value } };
  },
  '>': function _(name, value) {
    return { name: name, value: { $gt: value } };
  },
  '<': function _(name, value) {
    return { name: name, value: { $lt: value } };
  },
  ']': function _(name, value) {
    return { name: name, value: { $gte: value } };
  },
  '[': function _(name, value) {
    return { name: name, value: { $lte: value } };
  },

  '@': function _(name, value) {
    return { name: name, value: { $in: value.split('|') } };
  },
  '#': function _(name, value) {
    return { name: name, value: { $nin: value.split('|') } };
  },
  '~': function _(name, value) {
    return { name: name, value: _sequelize2.default.where(_sequelize2.default.fn('LOWER', _sequelize2.default.col(name)), { $like: '%' + value.toLowerCase() + '%' })
    };
  }
}; /**
    * Convert http req to sequelize find object
    */
var wcquery = exports.wcquery = function wcquery(query) {
  // console.log(query);
  var limit = query.limit;
  var skip = query.skip;
  var order = query.order;

  var resp = {};
  // limit
  if (typeof limit !== 'undefined') {
    resp.limit = limit;
    delete query.limit;
  }
  // skip
  if (typeof skip !== 'undefined') {
    resp.offset = skip;
    delete query.skip;
  }
  // order
  if (typeof order !== 'undefined') {
    resp.order = order[0] === '-' ? [[order.slice(1), 'DESC']] : resp.order = [[order, 'ASC']];
    delete query.order;
  }

  // EQ
  Object.keys(query).forEach(function (name) {
    if (!resp.where) {
      resp.where = {};
    }
    var vent = vents[query[name][0]];
    if (vent) {
      var r = vent(name, query[name].slice(1));
      resp.where[r.name] = r.value;
    } else {
      resp.where[name] = query[name];
    }
  });
  return resp;
};

exports.default = wcquery;

