require('module-alias/register');

var generators = require('yeoman-generator');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var os = require('os');

var ifNotDatabase = require('/utils/if-not-database');
var writeScript = require('/utils/write-script');
var sharedInput = require('/utils/shared-input');

module.exports = generators.Base.extend({

  constructor: function() {
    generators.Base.apply(this, arguments);

    this.argument('tablename', { type: String, required: false });

    this.option('inherits');
    this.option('like');
    this.option('fk');

    this.props = {
      columns: [],
      like: false,
      inherits: false,
      foreignkeys: []
    };

    ifNotDatabase(this, 'table');

    if (this.options.inherits && this.options.like) {
      this.env.error('You cannot use both --inherits and --like for CREATE TABLE.');
    }

    if (this.tablename !== undefined) {
      this.tablename = _.snakeCase(this.tablename);
    }
  },

  prompting: function() {
    return this._askTableData();
  },

  _askTableData: function() {
    var that = this;
    return this.prompt([
      sharedInput.entityName('table', this.tablename),
      sharedInput.useSchema('table'),
      sharedInput.schemaName
    ]).then(function(props) {
      that.props.tablename = props.tablename;
      that.props.useschema = props.useschema;
      that.props.schemaname = props.schemaname;
      that.props.dbname = that.config.get('dbname');
      if (!that.options.like) {
        that.log('');
        that.log('You will now define the columns of this table. Once you are done, '
          + 'simply press ENTER without entering a column name.');
        that.log('');
      }
      return that._askColumn();
    });
  },

  _askColumn: function(cb) {
    if (!this.options.like) {
      var that = this;
      cb = cb || this.async();

      return this.prompt([{
        type: 'input',
        name: 'column',
        message: 'Add a column with its data type:'
      }]).then(function(props) {
        if (props.column !== '') {
          that.props.columns.push(props.column);
          return that._askColumn(cb);
        } else {
          return that._askInheritance();
        }
      });
    } else {
      return this._askLike();
    }
  },

  _askInheritance: function() {
    var that = this;
    if (this.options.inherits && !this.options.like) {
      this.log('');
      return this.prompt([{
        type: 'input',
        name: 'inherits',
        message: function(response) {
          return 'From which table(s) must "' + that.props.tablename + '" inherit?';
        },
        default: typeof this.options.inherits === 'string' ? this.options.inherits : undefined,
        validate: function(inherits) {
          return inherits !== '' || 'A table or list of tables must be provided.';
        }
      }]).then(function(props) {
        that.props.inherits = props.inherits;
      });
    } else {
      this.props.inherits = false;
      return this._askLike();
    }
  },

  _askLike: function() {
    var that = this;
    if (this.options.like && !this.options.inherits) {
      this.log('');
      return this.prompt([{
        type: 'input',
        name: 'like',
        message: function(response) {
          return 'To which table is "' + that.props.tablename + '" like?';
        },
        default: typeof this.options.like === 'string' ? this.options.like : undefined,
        validate: function(like) {
          return like !== '' || 'A table name must be provided.';
        }
      }]).then(function(props) {
        that.props.like = props.like;
      });
    } else {
      this.props.like = false;
      return this._askPrimaryKey();
    }
  },

  _askPrimaryKey: function() {
    var that = this;
    if (!this.options.like) {
      this.log('');
      return this.prompt([
        {
          type: 'input',
          name: 'pkcolumns',
          message: 'Which column(s) conform the primary key?',
          validate: function(pkcolumns) {
            var columns = that.props.columns;
            return pkcolumns.replace(/ /g, '').split(',').every(function(pk) {
              return columns.join(',').indexOf(pk) > -1;
            }) || 'Primary key must contain columns defined in the table.';
          },
        },
        {
          type: 'input',
          name: 'pkname',
          message: 'What is the PK constraint name?',
          default: 'pk_' + that.props.tablename
        }
      ]).then(function(props) {
        that.props.pkname = props.pkname;
        that.props.pkcolumns = props.pkcolumns;
        return that._askForeignKey();
      });
    } else {
      return that._askForeignKey();
    }
  },

  _askForeignKey: function(cb) {
    var that = this;

    this.log('');

    if (this.options.fk) {
      cb = cb || this.async();
      return this.prompt([
        {
          type: 'input',
          name: 'fksource',
          message: 'Which are this foreign key\'s referencing columns?',
          validate: function(pkcolumns) {
            var columns = that.props.columns;
            return pkcolumns.replace(/ /g, '').split(',').every(function(pk) {
              return columns.join(',').indexOf(pk) > -1;
            }) || 'Foreign key must contain columns defined in the table.';
          }
        },
        {
          type: 'input',
          name: 'fktable',
          message: 'In which table are this foreign key\'s referenced columns?'
        },
        {
          type: 'input',
          name: 'fkdestination',
          message: 'Which are this foreign key\'s referenced columns?'
        },
        {
          type: 'input',
          name: 'fkname',
          message: 'What is the name of this foreign key?',
          default: function(response) {
            return 'fk_' + that.props.tablename + '_' + response.fktable;
          }
        },
        {
          type: 'confirm',
          name: 'anotherfk',
          message: 'Add another foreign key?',
          default: false
        }
      ]).then(function(props) {
        that.props.foreignkeys.push({
          name: props.fkname,
          table: props.fktable,
          sourcecolumns: props.fksource.replace(/ /g, '').split(','),
          destinationcolumns: props.fkdestination.replace(/ /g, '').split(',')
        });
        if (props.anotherfk) {
          that._askForeignKey(cb);
        } else {
          cb();
        }
      });
    } else {
      this.props.foreignkeys = [];
    }
  },

  writing: function() {
    writeScript(this, {
      databaseName: this.props.dbname,
      entityCollection: 'tables',
      useSchema: this.props.useschema,
      schemaName: this.props.schemaname,
      entityName: this.props.tablename,
      scriptType: 'sql',
      templateName: 'create_table'
    });
  }
})
