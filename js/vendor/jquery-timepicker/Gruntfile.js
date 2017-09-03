/*global module: false*/
/*jslint indent: 2*/

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      name: 'timepicker',
      banner: '/**\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * <%= pkg.description %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
        ' */\n' +
        '\n'
    },

    concat: {
      options: {
        banner: '<%= meta.banner %>',
        stripBanners: true
      },
      js: {
        src: ['jquery.<%= meta.name %>.js'],
        dest: 'dist/jquery.<%= meta.name %>.js'
      },
      css: {
        src: ['jquery.<%= meta.name %>.css'],
        dest: 'dist/jquery.<%= meta.name %>.css'
      },
      misc: {
        files: {
          'dist/LICENSE-GPL': 'LICENSE-GPL',
          'dist/LICENSE-MIT': 'LICENSE-MIT',
          'dist/README.md': 'README.md',
          'dist/CHANGELOG': 'CHANGELOG',
          'dist/AUTHORS': 'AUTHORS'
        }
      },
      plugin: {
        options: {
          banner: '',
          stripBanners: true
        },
        files: {
          '<%= pkg.name %>.jquery.json': ['package.json']
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        files: {
          'dist/jquery.<%= meta.name %>.min.js': ['<%= concat.js.dest %>']
        }
      }
    },

    cssmin: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['<%= concat.css.dest %>'],
        dest: 'dist/jquery.<%= meta.name %>.min.css'
      }
    },

    jshint: {
      options: {
        bitwise: true,
        curly: true,
        eqeqeq: true,
        forin: true,
        immed: true,
        sub: true,
        boss: true,
        eqnull: true,
        indent: 4,
        latedef: true,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        plusplus: true,
        quotmark: true,
        regexp: true,
        undef: true,
        unused: true,
        trailing: true,
        // relaxing options
        evil: false,
        regexdash: true,
        white: false,
        // environments
        browser: true,
        jquery: true
      },
      dist: {
        options: {
          globals: {
            jQuery: false,
            LazyLoad: false
          }
        },
        files: {
          src: ['Gruntfile.js', 'package.json', 'jquery.<%= meta.name %>.js']
        }
      },
      test: {
        options: {
          globals: {
            jQuery: false,
            LazyLoad: false,
            ok: false
          }
        },
        files: {
          src: ['test/test.js']
        }
      }
    },

    csslint: {
      dist: {
        src: ['jquery.<%= meta.name %>.css'],
        options: {
          'box-model': false,
          'box-sizing': false
        }
      }
    },

    copy: {
      legacy: {
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: ['jquery.<%= meta.name %>.min.js', 'jquery.<%= meta.name %>.min.css'],
            dest: '.'
          }
        ]
      }
    },

    compress: {
      zip: {
        options: {
          archive: 'build/<%= pkg.name %>-<%= pkg.version %>.zip'
        },
        files: [{expand: true, cwd: 'dist/', src: ['*']}]
      }
    },

    qunit: {
      all: {
        options: {
          urls: [
            // 'http://localhost:8000/test/index.html?jquery=1.3.2',
            // 'http://localhost:8000/test/index.html?jquery=1.4.2',
            'http://localhost:8000/test/index.html?jquery=1.4.3',
            'http://localhost:8000/test/index.html?jquery=1.5.1',
            'http://localhost:8000/test/index.html?jquery=1.6.2',
            'http://localhost:8000/test/index.html?jquery=1.6.4',
            'http://localhost:8000/test/index.html?jquery=1.7.1',
            'http://localhost:8000/test/index.html?jquery=1.7.2',
            'http://localhost:8000/test/index.html?jquery=1.8.3',
            'http://localhost:8000/test/index.html?jquery=1.9.0',
            'http://localhost:8000/test/index.html?jquery=1.9.1',
            'http://localhost:8000/test/index.html?jquery=1.10.1',
            'http://localhost:8000/test/index.html?jquery=1.10.2',
            'http://localhost:8000/test/index.html?jquery=1.11.0',
            'http://localhost:8000/test/index.html?jquery=1.11.1',
            'http://localhost:8000/test/index.html?jquery=2.0.0',
            'http://localhost:8000/test/index.html?jquery=2.0.1',
            'http://localhost:8000/test/index.html?jquery=2.0.2',
            'http://localhost:8000/test/index.html?jquery=2.0.3',
            'http://localhost:8000/test/index.html?jquery=2.1.0',
            'http://localhost:8000/test/index.html?jquery=2.1.1'
          ]
        }
      }
    },

    connect: {
      'default': {},
      'server': {
        options: {
          keepalive: true
        }
      }
    },

    clean: ['build/', 'dist/']
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.registerTask('lint', ['jshint', 'csslint']);
  grunt.registerTask('min', ['uglify', 'cssmin']);
  grunt.registerTask('build', ['copy:legacy', 'compress']);
  grunt.registerTask('default', ['lint', 'concat', 'min', 'build']);
  grunt.registerTask('test', ['default', 'connect:default', 'qunit']);
  grunt.registerTask('server', ['default', 'connect:server']);

};
