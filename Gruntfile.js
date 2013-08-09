module.exports = function(grunt) {

  var js, min, version, path, license, nastyFiles = {};

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');

  
  // USAGE:
  //
  //   grunt build --target=0.1.0
  //
  // Where "0.1.0" is the directory name in /dist that
  // files will be built to. If no "--target" is specified
  // then files will be built to dist/Master.
  grunt.registerTask('build', ['jshint', 'uglify:nasty', 'concat', 'compress:gz']);


  js = 'backbone.trackit.js';
  min = 'backbone.trackit.min.js';
  version = grunt.option('target') || 'Master';
  path = 'dist/' + version + '/';
  nastyFiles[path + min] = [js];
  license = '//\n' +
                '// backbone.trackit - '+version+'\n' +
                '// The MIT License\n' +
                '// Copyright (c) 2013 The New York Times, CMS Group, Matthew DeLambo <delambo@gmail.com> \n' +
                '//\n';

  grunt.initConfig({

    jshint: {
      src: [js],
      options: {
        browser: true,
        indent: 2,
        white: false,
        evil: true,
        regexdash: true,
        wsh: true,
        trailing: true,
        eqnull: true,
        expr: true,
        boss: true,
        node: true
      }
    },

    concat: {
      options: {
        stripBanners: true,
        banner: license
      },
      dist: {
        src: js,
        dest: path + js
      }
    },

    uglify: {
      options: {
        banner: license
      },
      nasty: {
        options: {
          preserveComments: false
        },
        files: nastyFiles
      }
    },

    compress: {
      gz: {
        options: {
          mode: 'gzip'
        },
        expand: true,
        src: [path + min]
      }
    }
  });

};
