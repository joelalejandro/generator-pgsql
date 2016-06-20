var printf = require('printf');

module.exports = function(dbname, collection, schemaname, entityname, scripttype) {
  var pattern = '%(dbname)s/%(collection)s%(schemaname)s%(entityname)s.%(scripttype)s';
  var vars = {
    dbname: dbname,
    collection: collection !== undefined ? (collection + '/') : '',
    schemaname: schemaname !== undefined ? (schemaname + '/') : '',
    entityname: entityname,
    scripttype: scripttype
  };
  return printf(pattern, vars);
}
