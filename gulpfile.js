var gulp = require('gulp');

// Dependencies for gulp
var sass         = require('gulp-sass');
var browserSync  = require('browser-sync').create();
var useref       = require('gulp-useref');
var uglify       = require('gulp-uglify');
var gulpIf       = require('gulp-if');
var imagenin     = require('gulp-imagemin');
var cssnano      = require('gulp-cssnano');
var cache        = require('gulp-cache');
var del          = require('del');
var runSequence  = require('run-sequence');

// Supported browsers
var supported = [
  'last 2 versions',
  'safari >= 8',
  'ie >= 10',
  'ff >= 20',
  'ios 6',
  'android 4'
];

// MUST HAVE
// ---------
// - Live reloading
// - SCSS compiling
gulp.task('browserSync', function () {
  browserSync.init({
    proxy: 'localhost/iligy/app'
  });
});

gulp.task('sass', function () {
  return gulp.src('app/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

// WATCHING
// --------
gulp.task('watch', function () {
  gulp.watch('app/scss/**/*.scss', ['sass']);
  // Reload when html or js file changes too
  gulp.watch('app/**/*.html', browserSync.reload);
  gulp.watch('app/**/*.php', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});


// Optimizing JS and CSS
gulp.task('useref', function () {
  return gulp.src('app/**/*.php')
    .pipe(useref())
    // Minifies if it's a JavaScript file
    .pipe(gulpIf('*.js', uglify()))
    // Minifies if it's a CSS file
    .pipe(gulpIf('*.css', cssnano({
      autoprefixer: { browsers: supported, add: true }
    })))
    .pipe(gulp.dest('dist'))
});

// Optimizing images
gulp.task('images', function () {
  return gulp.src('app/img/**/*.+(png|jpg|gif|svg|ico)')
    .pipe(cache(imagenin({
      interlaced: true
    })))
    .pipe(gulp.dest('dist/img'))
});

// CLEANING UP
// -----------
gulp.task('clean', function () {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:dist', function () {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// BUILDING
// --------
gulp.task('default', function (callback) {
  runSequence(['sass', 'browserSync'], 'watch',
    callback
  )
});

gulp.task('build', function (callback) {
  runSequence(
    'clean:dist',
    'sass',
    ['useref', 'images'],
    callback
  )
});
