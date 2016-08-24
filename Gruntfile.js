module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  const banner = '/*!\n' +
          ' * Maybe v<%= pkg.version %>\n' +
          ' * (c) <%= pkg.author %> \n' +
          ' * License: <%= pkg.licenses[0].type %> (<%= pkg.licenses[0].url %>)\n' +
          ' */';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: ['dist/'],
    },
    babel: {
        options: {
            sourceMap: false,
            presets: ['es2015']
        },
        dist: {
            files: {
                'dist/maybe.js': 'src/maybe.js'
            }
        }
    },
    uglify: {
        dist: {
            files: {
              'dist/maybe.min.js': ['dist/maybe.js']
            }
        }
    },
    file_info: {
      dist: {
        src: ['dist/maybe.js', 'dist/maybe.min.js', 'src/maybe.js'],
        options: {
            stdout: 'maybe.js' + grunt.util.linefeed +
                    'src:      {{= Number(size(src[2])/1024).toFixed(2) }} kB' + grunt.util.linefeed +
                    'dist:     {{= Number(size(src[0])/1024).toFixed(2) }} kB' + grunt.util.linefeed +
                    'Minified: {{= Number(size(src[1])/1024).toFixed(2) }} kB' + grunt.util.linefeed
        }
      }
    },
    mochacli: {
        options: {
            //require: ['chai'],
            reporter: 'nyan',
            bail: true
        },
        dist: ['test/*.js']
    },
    watch: {
        src: {
          files: ['Gruntfile.js', 'test/*.js', 'src/*.js'],
          tasks: ['default'],
          options: {
            spawn: false,
          },
        },
    },
    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner: banner,
          linebreak: true
        },
        files: {
          dist: [ 'dist/*.js' ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-babel");
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-file-info');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-banner');

  grunt.registerTask('test', ['mochacli']);
  grunt.registerTask('build', ['clean:dist', 'babel', 'uglify', 'usebanner', 'file_info']);
  grunt.registerTask('default', ['build', 'test', 'watch']);
};
