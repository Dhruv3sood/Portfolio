var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// Compiles SCSS files from /scss into /css
function compileSass() {
  return gulp.src('scss/resume.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

// Minify compiled CSS
function minifyCss() {
  return gulp.src([
    'css/resume.css',
    '!css/resume.min.css'
  ])
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

// Minify custom JS
function minifyJs() {
  return gulp.src([
    'js/resume.js',
    '!js/resume.min.js'
  ])
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

// Copy vendor files from /node_modules into /vendor
function copy() {
  return Promise.all([
    gulp.src([
      'node_modules/bootstrap/dist/**/*',
      '!**/npm.js',
      '!**/bootstrap-theme.*',
      '!**/*.map'
    ])
      .pipe(gulp.dest('vendor/bootstrap')),

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
      .pipe(gulp.dest('vendor/jquery')),

    gulp.src(['node_modules/jquery.easing/*.js'])
      .pipe(gulp.dest('vendor/jquery-easing')),

    gulp.src([
      'node_modules/font-awesome/**',
      '!node_modules/font-awesome/**/*.map',
      '!node_modules/font-awesome/.npmignore',
      '!node_modules/font-awesome/*.txt',
      '!node_modules/font-awesome/*.md',
      '!node_modules/font-awesome/*.json'
    ])
      .pipe(gulp.dest('vendor/font-awesome')),

    gulp.src([
      'node_modules/devicons/**/*',
      '!node_modules/devicons/*.json',
      '!node_modules/devicons/*.md',
      '!node_modules/devicons/!PNG',
      '!node_modules/devicons/!PNG/**/*',
      '!node_modules/devicons/!SVG',
      '!node_modules/devicons/!SVG/**/*'
    ])
      .pipe(gulp.dest('vendor/devicons')),

    gulp.src(['node_modules/simple-line-icons/**/*', '!node_modules/simple-line-icons/*.json', '!node_modules/simple-line-icons/*.md'])
      .pipe(gulp.dest('vendor/simple-line-icons'))
  ]);
}

// Watch files
function watchFiles() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  gulp.watch('scss/**/*.scss', compileSass);
  gulp.watch('css/resume.css', minifyCss);
  gulp.watch('js/resume.js', minifyJs);
  gulp.watch('*.html').on('change', browserSync.reload);
}

// Define tasks
gulp.task('sass', compileSass);
gulp.task('minify-css', gulp.series('sass', minifyCss));
gulp.task('minify-js', minifyJs);
gulp.task('copy', copy);
gulp.task('default', gulp.parallel(gulp.series('sass', 'minify-css'), 'minify-js', 'copy'));
gulp.task('build', gulp.series('default'));
gulp.task('dev', gulp.series('default', watchFiles));
