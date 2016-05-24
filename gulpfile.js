var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	header = require('gulp-header'),
	replace = require('gulp-replace'),
	webpack = require('webpack-stream');

var package = require('./package.json');

gulp.task('default', ['test']);

gulp.task('bundle', function() {
	return gulp.src('')
		.pipe(webpack(require('./webpack-config.js')))
		.pipe(replace('<%version%>', 'v' + package.version))
		.pipe(gulp.dest(''));
});

gulp.task('release', ['bundle'], function() {
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

gulp.task('test_run_server', function() {
	require('./test/test.js');
});