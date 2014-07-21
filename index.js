'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var typeScriptGenerator = require('./build/TypeScriptGenerator');
var typeScriptViewModelGenerator = require('./build/TypeScriptViewModelGenerator');

module.exports = function(options) {

  options = options || {
    typeScriptViewFileName: '{{templateName}}.ts',
    typeScriptViewModelFileName: 'I{{templateName}}Model.ts'
  };

  function getFileName(nameMatch, templateName) {
    return nameMatch.replace('{{templateName}}', templateName);
  }

  function generate(generatorType, templateContent, fileNameFormat, file) {
      var generator = new generatorType();
      var outputFile = file.clone();

      outputFile.contents = new Buffer(generator.generate(templateContent));
      outputFile.path = file.path.replace(path.basename(file.path), getFileName(fileNameFormat, generator.template.name));

      return outputFile;
  }

  var stream = through.obj(function(file, enc, callback) {
    if (file.isNull() || !file.contents || path.extname(file.path).toLowerCase() !== '.html') {
      this.push(file);
      callback();
      return;
    }

    var fileContent = file.contents.toString('utf8');
    var outputFile;

    // Build typescript view class.
    if (options.typeScriptViewFileName) {
      this.push(generate(typeScriptGenerator, fileContent, options.typeScriptViewFileName, file));
    }

    // Build typescript view model interface.
    if (options.typeScriptViewModelFileName) {
      this.push(generate(typeScriptViewModelGenerator, fileContent, options.typeScriptViewModelFileName, file));
    }

    callback();
  });

  return stream;
};
