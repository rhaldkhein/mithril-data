var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	header = require('gulp-header'),
	webpack = require('webpack-stream');

gulp.task('default', ['test']);

gulp.task('bundle', function() {
	return gulp.src('mithril-data.js')
		.pipe(webpack(require('./webpack-config.js')))
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
			pkg: require('./package.json')
		}))
		.pipe(gulp.dest(''));
});

gulp.task('test', function() {
	require('./test');
});