var _ = require('lodash');

module.exports = function ifNotDatabase(generator, entityType) {
  if (typeof generator.config.get('dbname') === 'undefined') {
    generator.log(_.repeat('-', 75));
    generator.log('Apparently you have not run "yo pgsql" yet. A ' + entityType + ' script cannot');
    generator.log('be created, because with no database name, such script is useless.')
    generator.log(_.repeat('-', 75));
    generator.env.error('Error: ' + entityType + ' script file cannot be created.')
  }
}
