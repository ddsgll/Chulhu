var
	gulp = require("gulp"),
	jade = require("gulp-jade"),
	stylus = require("gulp-stylus"),
	notify = require("gulp-notify"),
	csscomb = require("gulp-csscomb"),
	plumber = require("gulp-plumber"),
	autoprefixer = require("gulp-autoprefixer");


gulp.task('stylus', function() {

	gulp.src('source/stylus/main.styl')
		.pipe( plumber() )
		.pipe( stylus() )
		.pipe( autoprefixer() )
		.pipe( csscomb() )
		.pipe( gulp.dest('dev/css/') )
		.pipe( notify({title: "STYLUS", message: "Styles parsed successfully"}) );

});

gulp.task('jade', function() {

	gulp.src('source/jade/*.jade')
		.pipe( plumber() )
		.pipe( jade( {pretty: '    '} ) )
		.pipe( gulp.dest( 'dev/' ) )
		.pipe( notify({title: "JADE", message: "Jade parsed successfully"}) );

});

gulp.task('watch', function() {

	gulp.watch('source/stylus/*.styl', ['stylus']);
	gulp.watch('source/jade/*.jade',   ['jade'  ]);
	notify( {title: "GULP", message: "Wathig files.."} );

});

gulp.task('default', ['stylus', 'jade', 'watch']);