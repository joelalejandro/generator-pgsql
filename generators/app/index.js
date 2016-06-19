var generators = require('yeoman-generator');
var _ = require('lodash');
var mkdirp = require('mkdirp');

module.exports = generators.Base.extend({

  constructor: function() {
    generators.Base.apply(this, arguments);

    this.argument('dbname', { type: String, required: false });

    this.props = {};

    if (this.dbname !== undefined) {
      this.dbname = _.snakeCase(this.dbname);
    }
  },

  prompting: function() {
    var that = this;
    return this.prompt([
      {
        type: 'input',
        name: 'dbname',
        message: 'What\'s the name of the database?',
        default: this.dbname,
        validate: function(dbname) {
          return dbname !== '' || 'A database name is required.';
        }
      },
      {
        type: 'input',
        name: 'username',
        message: 'What\'s the username that will access the database?',
        default: function(response) {
          return 'dbo_' + response.dbname;
        },
        validate: function(username) {
          return username !== '' || 'A username is required.';
        }
      },
      {
        type: 'confirm',
        name: 'userexists',
        message: function(response) {
          return 'Does "' + response.username + '" exists already?';
        },
        default: false
      },
      {
        type: 'password',
        name: 'password',
        message: function(response) {
          return 'Give "' + response.username + '" a password:';
        },
        when: function(response) {
          return !response.userexists;
        },
        validate: function(password) {
          return password !== '' || 'A password is required.';
        }
      }
    ]).then(function(props) {
      that.props = props;
    });
  },

  writing: function() {
    var dbscriptfile = this.props.dbname + '/db.sql';
    var template = _.template(
      this.fs.read(this.templatePath('create_database_and_role.ejs'))
    );

    mkdirp(this.destinationPath(this.props.dbname));

    this.fs.write(this.destinationPath(dbscriptfile), template(this.props));

    this.config.set('dbname', this.props.dbname);
    this.config.set('username', this.props.username);
  }
})
