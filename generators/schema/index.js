var generators = require('yeoman-generator');
var _ = require('lodash');
var mkdirp = require('mkdirp');

module.exports = generators.Base.extend({

  constructor: function() {
    generators.Base.apply(this, arguments);

    this.argument('schemaname', { type: String, required: false });

    this.props = {};

    if (typeof this.config.get('dbname') === 'undefined') {
      this.log(_.repeat('-', 75));
      this.log('Apparently you have not run "yo pgsql" yet. A schema script cannot');
      this.log('be created, because with no database name, such script is useless.')
      this.log(_.repeat('-', 75));
      this.env.error('Schema script file cannot be created.')
    }

    if (this.schemaname !== undefined) {
      this.schemaname = _.snakeCase(this.schemaname);
    }
  },

  prompting: function() {
    var that = this;
    return this.prompt([
      {
        type: 'input',
        name: 'schemaname',
        message: 'What\'s the name of the schema?',
        default: this.schemaname,
        validate: function(schemaname) {
          return schemaname !== '' || 'A table name is required.';
        }
      }
    ]).then(function(props) {
      that.props = props;
      that.props.dbname = that.config.get('dbname');
      that.props.username = that.config.get('username');
    });
  },

  writing: function() {
    var schemascriptfile = this.props.dbname + '/schemas/' + this.props.schemaname + '.sql';
    var template = _.template(
      this.fs.read(this.templatePath('create_schema.ejs'))
    );

    mkdirp(this.destinationPath(this.props.dbname + '/schemas'));

    this.fs.write(this.destinationPath(schemascriptfile), template(this.props));
  }
})
