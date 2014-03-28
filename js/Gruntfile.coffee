###

ownCloud - Tasks

@author Raimund Schlüßler
@copyright 2013 

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
License as published by the Free Software Foundation; either
version 3 of the License, or any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU AFFERO GENERAL PUBLIC LICENSE for more details.

You should have received a copy of the GNU Affero General Public
License along with this library.  If not, see <http://www.gnu.org/licenses/>.

###


module.exports = (grunt) ->

	grunt.loadNpmTasks('grunt-contrib-concat')
	grunt.loadNpmTasks('grunt-contrib-watch')
	grunt.loadNpmTasks('grunt-contrib-coffee')
	grunt.loadNpmTasks('grunt-contrib-less')
	grunt.loadNpmTasks('grunt-coffeelint')
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-phpunit');
	grunt.loadNpmTasks('grunt-karma');

	grunt.initConfig

		meta:
			pkg: grunt.file.readJSON('package.json')
			version: '<%= meta.pkg.version %>'
			banner: '/**\n' +
				' * <%= meta.pkg.description %> - v<%= meta.version %>\n' +
				' *\n' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %> - ' +
				'<%= meta.pkg.author.name %> <<%= meta.pkg.author.email %>>\n' +
				' *\n' +
				' * This file is licensed under the Affero General Public License version 3 or later.\n' +
				' * See the COPYING file\n' +
				' *\n' +
				' */\n\n'
			build: 'build/'
			production: 'public/'
			
		coffee:
			default:
				expand: true
				cwd: "./app"
				src: ["**/*.coffee"]
				dest: "./build/app"
				ext: ".js"

		less:
			default:
				expand: true
				cwd: "../css"
				src: ["**/*.less"]
				dest: "../css"
				ext: ".css"

		concat:
			app:
				options:
					banner: '<%= meta.banner %>\n'
					stripBanners:
						options: 'block'
				src: [
						'<%= meta.build %>app/app.js'
						'<%= meta.build %>app/directives/*.js'
						'<%= meta.build %>app/controllers/*.js'
						'<%= meta.build %>app/services/**/*.js'
						'<%= meta.build %>app/filters/**/*.js'
					]
				dest: '<%= meta.production %>app.js'
		wrap:
			app:
				src: '<%= meta.production %>app.js'
				dest: ''
				wrapper: [
					'(function(angular, $, moment, undefined){\n\n'
					'\n})(window.angular, window.jQuery, window.moment);'
				]

		coffeelint:
			app: [
				'app/**/*.coffee'
				'tests/**/*.coffee'
			]
			options:
				'no_tabs':
					'level': 'ignore'
				'indentation':
					'level': 'ignore'
				'no_trailing_whitespace':
					'level': 'warn'


		watch:
			coffeescript:
				files: ['app/**/*.coffee']
				tasks: 'coffee'
			concat:
				files: [
					'<%= meta.build %>app/**/*.js'
					'<%= meta.build %>tests/**/*.js'
				]
				tasks: 'compile'
			less:
				files: ['../css/*.less']
				tasks: 'less'

		karma:
			unit:
				configFile: 'config/karma.js'
			continuous:
				configFile: 'config/karma.js'
				singleRun: true
				browsers: ['PhantomJS']
				reporters: ['progress', 'junit']
				junitReporter:
					outputFile: 'test-results.xml'
			unit_phantom:
				configFile: 'config/karma.js'
				browsers: ['PhantomJS']


		phpunit:
			classes:
				dir: '../tests'
			options:
				colors: true


	grunt.registerTask('run', ['watch:concat'])
	grunt.registerTask('compile', ['concat', 'wrap', 'coffeelint'])
	grunt.registerTask('ci', ['karma:continuous'])
	grunt.registerTask('testphp', ['watch:phpunit'])
	# grunt.registerTask('default', 'watch')
