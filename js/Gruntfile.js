/**
 * Nextcloud - Tasks
 *
 * @author Raimund Schlüßler
 * @copyright 2017 Raimund Schlüßler <raimund.schluessler@googlemail.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

module.exports = function(grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-wrap');
	// grunt.loadNpmTasks('grunt-karma');

	grunt.initConfig({
		meta: {
			pkg: grunt.file.readJSON('package.json'),
			version: '<%= meta.pkg.version %>',
			banner: '/**\n' + ' * <%= meta.pkg.description %> - v<%= meta.version %>\n' + ' *\n' + ' * Copyright (c) <%= grunt.template.today("yyyy") %> - ' + '<%= meta.pkg.author.name %> <<%= meta.pkg.author.email %>>\n' + ' *\n' + ' * This file is licensed under the Affero\
			 General Public License version 3 or later.\n' + ' * See the COPYING file\n' + ' *\n' + ' */\n\n',
			build: 'app/',
			production: 'public/'
		},
		concat: {
			"default": {
				options: {
					banner: '<%= meta.banner %>\n',
					stripBanners: {
						options: 'block'
					}
				},
				src: '<%= meta.build %>/**/*.js',
				dest: '<%= meta.production %>app.js'
			}
		},
		wrap: {
			"default": {
				src: '<%= meta.production %>app.js',
				dest: '',
				wrapper: ['(function(angular, $, oc_requesttoken, undefined){\n\n', '\n})(window.angular, window.jQuery, oc_requesttoken);']
			}
		},

		jshint: {
			files: [
				'Gruntfile.js',
				'<%= meta.build %>**/*.js'
			],
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			}
		},

		watch: {
			concat: {
				files: [
					'<%= meta.build %>**/*.js'
				],
				options: {
					livereload: true
				},
				tasks: ['js']
			}
		},
		karma: {
			unit: {
				configFile: 'config/karma.js'
			},
			continuous: {
				configFile: 'config/karma.js',
				singleRun: true,
				reporters: ['progress', 'junit'],
				junitReporter: {
					outputFile: 'test-results.xml'
				}
			}
		}
	});
	// grunt.registerTask('ci', ['karma:continuous']);
	grunt.registerTask('js', ['concat']);
	grunt.registerTask('default', 'js');
	grunt.registerTask('build', ['concat']);
};
