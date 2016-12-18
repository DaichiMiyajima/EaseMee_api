var 	gulp = require('gulp'),
	karma = require('gulp-karma'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename');



gulp.task('build', function(done) {
	return gulp.src('src/ngTouchstart.js')
		.pipe(uglify())
		.pipe(rename('ngTouchstart.min.js'))
		.pipe(gulp.dest('build'));
});


gulp.task('test', function () {
	return gulp.src('./foobar')
		.pipe(karma({
			configFile: 'karma.conf.js',
			action : 'run'
		}))
		.on('error', function (err) {
			console.log(err);
			this.emit('end');
		});
});
