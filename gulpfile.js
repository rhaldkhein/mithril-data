var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	header = require('gulp-header'),
	replace = require('gulp-replace'),
	webpack = require('webpack-stream'),
	sequence = require('run-sequence');

var package = require('./package.json');

gulp.task('version', function() {
	return gulp.src('source/md.js')
		.pipe(replace(/v.+\/\/version/g, 'v' + package.version + '\';//version'))
		.pipe(gulp.dest('source'));
});

gulp.task('bundle', function() {
	return gulp.src('')
		.pipe(webpack(require('./webpack-config.js')))
		.pipe(gulp.dest(''));
});

gulp.task('minify', function() {
	return gulp.src('mithril-data.js')
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(header(['/**',
			' * <%= pkg.name %> v<%= pkg.version %>',
			' * <%= pkg.description %>',
			' * <%= pkg.homepage %>',
			' * (c) ' + new Date().getFullYear() + ' <%= pkg.authorName %>',
			' * License: <%= pkg.license %>',
			' */',
			''
		].join('\n'), {
			pkg: package
		}))
		.pipe(gulp.dest(''));
});

gulp.task('release', function(callback) {
	sequence('version', 'bundle', 'minify', callback);
});