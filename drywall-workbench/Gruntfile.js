/////// parameters //////
var installEditor = false;
/////////////////////////

var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    gitclone: {
      your_target: {
        options: {
          repository: 'ssh://git@git.datasciencelab.ugent.be:4444/rmleditor/rml-editor-js.git',
          branch: 'int-wb',
          directory: 'public/editor'
        }
      }
    },
    exec: {
      editor_bower: 'cd public/editor; bower install --allow-root; rm -f index.html'
    },
    copy: {
      vendor: {
        files: [
          {
            expand: true, cwd: 'node_modules/nprogress/',
            src: ['nprogress.css','nprogress.js'], dest: 'public/vendor/nprogress/'
          },
          {
            expand: true, cwd: 'node_modules/noty/js/noty/packaged/',
            src: ['jquery.noty.packaged.min.js'], dest: 'public/vendor/noty/js/'
          },
          {
            expand: true, cwd: 'node_modules/bootstrap/',
            src: ['js/**', 'less/**'], dest: 'public/vendor/bootstrap/'
          },
          {
            expand: true, cwd: 'node_modules/backbone/',
            src: ['backbone.js'], dest: 'public/vendor/backbone/'
          },
          {
            expand: true, cwd: 'node_modules/font-awesome/',
            src: ['fonts/**', 'less/**'], dest: 'public/vendor/font-awesome/'
          },
          {
            expand: true, cwd: 'node_modules/html5shiv/dist/',
            src: ['html5shiv.js'], dest: 'public/vendor/html5shiv/'
          },
          {
            expand: true, cwd: 'node_modules/jquery/dist/',
            src: ['jquery.js'], dest: 'public/vendor/jquery/'
          },
          {
            expand: true, cwd: 'node_modules/jquery.cookie/',
            src: ['jquery.cookie.js'], dest: 'public/vendor/jquery.cookie/'
          },
          {
            expand: true, cwd: 'node_modules/jquery-form/',
            src: ['jquery.form.js'], dest: 'public/vendor/jquery-form/'
          },
          {
            expand: true, cwd: 'node_modules/moment/',
            src: ['moment.js'], dest: 'public/vendor/momentjs/'
          },
          {
            expand: true, cwd: 'node_modules/respond.js/src/',
            src: ['respond.js'], dest: 'public/vendor/respond/'
          },
          {
            expand: true, cwd: 'node_modules/underscore/',
            src: ['underscore.js'], dest: 'public/vendor/underscore/'
          },
          {
            expand: true, cwd: 'node_modules/eonasdan-bootstrap-datetimepicker/',
            src: ['build/js/**', 'build/css/**'], dest: 'public/vendor/eonasdan-bootstrap-datetimepicker/'
          },
          {
            expand: true, cwd: 'node_modules/bootstrap-select/',
            src: ['dist/js/**', 'dist/css/**'], dest: 'public/vendor/bootstrap-select/'
          }
        ]
      },
      editor: {
        files: [
          {
            expand: true, cwd: 'public/editor',
            src: ['images/**'], dest: 'public'
          },
          {
            expand: true,
            src: ['editor_config.js'], dest: 'public/editor/js/',
            rename: function(dest, src) {
              return dest + 'config.js';
            }
          }
        ]
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          ignore: [
            'node_modules/**',
            'public/**'
          ],
          ext: 'js'
        }
      }
    },
    watch: {
      clientJS: {
         files: [
          'public/layouts/**/*.js', '!public/layouts/**/*.min.js',
          'public/views/**/*.js', '!public/views/**/*.min.js'
         ],
         tasks: ['newer:uglify', 'newer:jshint:client']
      },
      serverJS: {
         files: ['views/**/*.js'],
         tasks: ['newer:jshint:server']
      },
      clientLess: {
         files: [
          'public/layouts/**/*.less',
          'public/views/**/*.less',
          'public/less/**/*.less'
         ],
         tasks: ['newer:less']
      },
      layoutLess: {
        files: [
          'public/layouts/**/*.less',
          'public/less/**/*.less'
        ],
        tasks: ['less:layouts']
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapName: function(filePath) {
          return filePath + '.map';
        }
      },
      layouts: {
        files: {
          'public/layouts/core.min.js': [
            'public/vendor/jquery/jquery.js',
            'public/vendor/jquery.cookie/jquery.cookie.js',
            'public/vendor/underscore/underscore.js',
            'public/vendor/backbone/backbone.js',
            'public/vendor/bootstrap/js/affix.js',
            'public/vendor/bootstrap/js/alert.js',
            'public/vendor/bootstrap/js/button.js',
            'public/vendor/bootstrap/js/carousel.js',
            'public/vendor/bootstrap/js/collapse.js',
            'public/vendor/bootstrap/js/dropdown.js',
            'public/vendor/bootstrap/js/modal.js',
            'public/vendor/bootstrap/js/tooltip.js',
            'public/vendor/bootstrap/js/popover.js',
            'public/vendor/bootstrap/js/scrollspy.js',
            'public/vendor/bootstrap/js/tab.js',
            'public/vendor/bootstrap/js/transition.js',
            'public/vendor/momentjs/moment.js',
            'public/layouts/core.js'
          ],
          'public/layouts/ie-sucks.min.js': [
            'public/vendor/html5shiv/html5shiv.js',
            'public/vendor/respond/respond.js',
            'public/layouts/ie-sucks.js'
          ],
          'public/layouts/admin.min.js': ['public/layouts/admin.js']
        }
      },
      views: {
        files: [{
          expand: true,
          cwd: 'public/views/',
          src: ['**/*.js', '!**/*.min.js'],
          dest: 'public/views/',
          ext: '.min.js'
        }]
      }
    },
    jshint: {
      client: {
        options: {
          jshintrc: '.jshintrc-client',
          ignores: [
            'public/layouts/**/*.min.js',
            'public/views/**/*.min.js'
          ]
        },
        src: [
          'public/layouts/**/*.js',
          'public/views/**/*.js'
        ]
      },
      server: {
        options: {
          jshintrc: '.jshintrc-server'
        },
        src: [
          'schema/**/*.js',
          'views/**/*.js'
        ]
      }
    },
    less: {
      options: {
        compress: true
      },
      layouts: {
        files: {
          'public/layouts/core.min.css': [
            'public/less/bootstrap-build.less',
            'public/less/font-awesome-build.less',
            'public/layouts/core.less'
          ],
          'public/layouts/admin.min.css': ['public/layouts/admin.less']
        }
      },
      views: {
        files: [{
          expand: true,
          cwd: 'public/views/',
          src: ['**/*.less'],
          dest: 'public/views/',
          ext: '.min.css'
        }]
      }
    },
    clean: {
      js: {
        src: [
          'public/layouts/**/*.min.js',
          'public/layouts/**/*.min.js.map',
          'public/views/**/*.min.js',
          'public/views/**/*.min.js.map'
        ]
      },
      css: {
        src: [
          'public/layouts/**/*.min.css',
          'public/views/**/*.min.css'
        ]
      },
      vendor: {
        src: ['public/vendor/**']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-newer');

  var defaultTasks =  ['copy:vendor', 'copy:editor', 'newer:uglify', 'newer:less', 'concurrent'];
  var buildTasks = ['copy:vendor', 'copy:editor', 'uglify', 'less'];

  if (installEditor && !grunt.file.exists('public/editor')) {
    defaultTasks.unshift('exec');
    defaultTasks.unshift('gitclone');
    buildTasks.unshift('exec');
    buildTasks.unshift('gitclone');
  }

  grunt.registerTask('default', defaultTasks);
  grunt.registerTask('build', buildTasks);
  grunt.registerTask('lint', ['jshint']);
};
