//===========================
//  Settings
//===========================
const port = 3001;
const php = false;
const mamp = true;
const dist = './dist';
const src = './src';
const phpFile = src + '/php/**/*.php';
const _phpFile = src + '/php/**/_*.php';
const sassFile = src + '/scss/**/*.scss';
const _sassFile = src + '/scss/**/_*.scss';
const jsFile = src + '/js/**/*.js';
const imagesFile = src + '/images/**';
//===========================
//  Require
//===========================
// Gulp
const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
// Sass
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
// JS
const webpackConfig = require('./webpack.config');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
// Browser
const browserSync = require('browser-sync');
const connect = require('gulp-connect-php');
//===========================
//  tasks
//===========================
// PHP
gulp.task('php', function (done) {
  gulp.src([phpFile, '!'+_phpFile])
    .pipe(gulp.dest(dist + '/'));
  done();
});
// Sass
gulp.task('sass', function(done) {
  gulp
    .src([sassFile, '!'+_sassFile])
    .pipe(plumber({
        errorHandler: function(err) {
          if (err.messageFormatted) {
            console.log(err.messageFormatted);
          }
          this.emit('end');
        }
      }))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(autoprefixer({
      cascade:false
    }))
    .pipe(gulp.dest(dist + '/'))
  done();
});
// JS
gulp.task('js', function(done){
  webpackStream(webpackConfig, webpack)
    .pipe(plumber({
      errorHandler: function(err) {
          if (err.messageFormatted) {
            console.log(err.messageFormatted);
          }
        this.emit('end');
      }
    }))
    .pipe(gulp.dest(dist + '/assets/js'));
  done();
});
// Images
gulp.task('images', function(done) {
  gulp.src(imagesFile)
    .pipe(gulp.dest(dist + '/assets/images/'));
  done();
});
// Browser
gulp.task('build-server', function (done) {
  if (php) {
    connect.server({
      port: port,
      base: dist
    }, function (){
      browserSync({
        proxy: 'http://localhost:'+port+'/'
      });
    });
  } else if (mamp) {
    browserSync.init({
      proxy: "http://localhost:8888/",
      reloadOnRestart: true,
    });
  } else {
    browserSync.init({
        server: {
            baseDir: dist
        }
    });
  }
  done();
  console.log('Server was launched');
});
gulp.task('browser-reload', function (done) {
  browserSync.reload();
  done();
  console.log('Browser reload completed');
});
// Build
gulp.task('build', gulp.parallel('php', 'sass', 'js', 'images'));
// Watch
gulp.task('watch', function() {
  gulp.watch(phpFile, gulp.series('php', 'browser-reload'));
  gulp.watch(sassFile, gulp.series('sass', 'browser-reload'));
  gulp.watch(jsFile, gulp.series('js', 'browser-reload'));
  gulp.watch(imagesFile, gulp.series('images', 'browser-reload'));
});
// Default
gulp.task('default', gulp.series('build', 'build-server', 'watch'));
