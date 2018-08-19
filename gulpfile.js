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
	jshint = require('gulp-jshint'),
	concat = require('gulp-concat'),
	stylelint = require('gulp-stylelint'),
	svgSprite = require('gulp-svg-sprite'),
	webpackStream = require('webpack-stream'),
	webpackDevelopmentConfig = require('./webpack.common.js'),
	webpackProductionConfig = require('./webpack.prod.js');

// configure
const destinationFolder = __dirname + '/js/public/';
const scssBuildTarget = 'style.scss';
const scssDestinationFolder = __dirname + '/css/';

const jsSources = [
	'js/app/**/*.js'
];
const scssSources = [
	'css/src/*.scss'
];
const testSources = [
	'test/**/*.js'
];

const lintSources = jsSources.concat(testSources).concat(['*.js']);
const watchSources = jsSources.concat(['js/app/**/*.vue']);

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
			sprite: "../img/sprites.svg",
			render: {
				scss: {
					dest: "src/sprites.scss"
				}
			}
		}
	}
};

// tasks

gulp.task('default', ['build']);

gulp.task('build', ['lint', 'scssConcat'], function(callback) {
	return webpackStream(webpackProductionConfig, require('webpack'))
	.pipe(gulp.dest(destinationFolder));
});

gulp.task('development', ['lint', 'scssConcat'], function(callback) {
	return webpackStream(webpackDevelopmentConfig, require('webpack'))
	.pipe(gulp.dest(destinationFolder));
});

gulp.task('jsWatch', ['jslint'], function(callback) {
	return webpackStream(webpackDevelopmentConfig, require('webpack'))
	.pipe(gulp.dest(destinationFolder));
});

gulp.task('lint', ['jslint', 'scsslint']);

gulp.task('jslint', () => {
	return gulp.src(lintSources)
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('scsslint', () => {
	return gulp.src(scssSources)
		.pipe(stylelint ({
			reporters: [{
				formatter: 'string',
				console: true
			}]
		}));
});

gulp.task('scssConcat', ['svg_sprite'], () => {
	return gulp.src(scssSources)
		.pipe(concat(scssBuildTarget))
		.pipe(gulp.dest(scssDestinationFolder));
});

gulp.task('scssConcatWatch', ['scsslint'], () => {
	return gulp.src(scssSources)
		.pipe(concat(scssBuildTarget))
		.pipe(gulp.dest(scssDestinationFolder));
});

gulp.task('watch', () => {
	gulp.watch(watchSources, ['jsWatch']);
	gulp.watch(scssSources, ['scssConcatWatch']);
});

gulp.task('svg_sprite', () => {
	return gulp.src('**/*.svg', {cwd: 'img/src'})
		.pipe(svgSprite(svgConfig))
		.pipe(gulp.dest('.'));
});
