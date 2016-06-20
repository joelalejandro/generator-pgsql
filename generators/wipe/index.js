var generators = require('yeoman-generator');
var _ = require('lodash');
var rmdir = require('rmdir');

module.exports = generators.Base.extend({

  prompting: function() {
    var that = this;
    return this.prompt([
      {
        type: 'confirm',
        name: 'delete',
        message: 'This will *delete ALL* of the workspace files. Proceed?',
        default: false
      }
    ]).then(function(props) {
      if (props.delete) {
        rmdir(that.config.get('dbname'));
        that.log(that.config.get('dbname') + ' destroyed.');
        that.config.delete('dbname');
        that.config.delete('username');
      } else {
        that.log('Nothing done.');
      }
    });
  }
  
})
