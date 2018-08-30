/**
 * Nextcloud - Tasks
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Bernhard Posselt <dev@bernhard-posselt.com>
 * @copyright Bernhard Posselt 2012, 2014
 *
 * @author Georg Ehrke
 * @copyright 2017 Georg Ehrke <oc.list@georgehrke.com>
 *
 * @author Raimund Schlüßler
 * @copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>
 */

/*jslint node: true */
'use strict';

// get plugins
const gulp = require('gulp'),
	svgSprite = require('gulp-svg-sprite'),
	webpackStream = require('webpack-stream'),
	webpackDevelopmentConfig = require('./webpack.dev.js'),
	webpackProductionConfig = require('./webpack.prod.js');

// configure
const destinationFolder = __dirname + '/js/';

const svgConfig = {
	shape: {
		transform: []
	},
	mode: {
		css: {		// Activate the «css» mode
			bust: false,
			common: 'icon',
			dimensions: '',
			prefix: '.icon-%s',
			sprite: '../img/sprites.svg',
			render: {
				scss: {
					dest: 'src/sprites.scss'
				}
			}
		}
	}
};

// tasks

gulp.task('default', ['build']);

gulp.task('build', ['svg_sprite'], function(callback) {
	return webpackStream(webpackProductionConfig, require('webpack'))
	.pipe(gulp.dest(destinationFolder));
});

gulp.task('development', ['svg_sprite'], function(callback) {
	return webpackStream(webpackDevelopmentConfig, require('webpack'))
	.pipe(gulp.dest(destinationFolder));
});

gulp.task('svg_sprite', () => {
	return gulp.src('**/*.svg', {cwd: 'img/src'})
		.pipe(svgSprite(svgConfig))
		.pipe(gulp.dest('.'));
});
