/**
 * Convert http req to sequelize find object
 */
import Sequelize from 'sequelize';

export const vents = {
  '!': (name, value) => ({ name, value: { $ne: value } }),
  '>': (name, value) => ({ name, value: { $gt: value } }),
  '<': (name, value) => ({ name, value: { $lt: value } }),
  ']': (name, value) => ({ name, value: { $gte: value } }),
  '[': (name, value) => ({ name, value: { $lte: value } }),

  '@': (name, value) => ({ name, value: { $in: value.split('|') } }),
  '#': (name, value) => ({ name, value: { $nin: value.split('|') } }),
  '~': (name, value) => ({ name, value: Sequelize.where(
    Sequelize.fn('LOWER', Sequelize.col(name)),
    { $like: `%${value.toLowerCase()}%` }),
    }),
};

export const wcquery = query => {
  // console.log(query);
  const { limit, skip, order } = query;
  const resp = {};
  // limit
  if (typeof(limit) !== 'undefined') {
    resp.limit = limit;
    delete query.limit;
  }
  // skip
  if (typeof(skip) !== 'undefined') {
    resp.offset = skip;
    delete query.skip;
  }
  // order
  if (typeof(order) !== 'undefined') {
    resp.order = (order[0] === '-')
    ? [[order.slice(1), 'DESC']]
    : resp.order = [[order, 'ASC']];
    delete query.order;
  }

  // EQ
  Object.keys(query).forEach(name => {
    if (!resp.where) { resp.where = {}; }
    const vent = vents[query[name][0]];
    if (vent) {
      const r = vent(name, query[name].slice(1));
      resp.where[r.name] = r.value;
    } else {
      resp.where[name] = query[name];
    }
  });
  return resp;
};

export default wcquery;
