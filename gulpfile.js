// Node 모듈(Modules)
var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    browserify = require('gulp-browserify'),
    compass    = require('gulp-compass'),
    connect    = require('gulp-connect'),
    gulpif     = require('gulp-if'),
    uglify     = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    concat     = require('gulp-concat');
    path       = require('path');

// 환경변수
var env = 'development',
    jsSources,
    sassSources,
    htmlSources,
    outputDir,
    sassStyle;

// env 변수 설정 값에 따라 개발용(Dev)/배포용(Pro) 조건 처리
if (env === 'development') {
  outputDir = 'builds/development/';
  sassStyle = 'expanded'; } 
else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed'; }

// Scripts 컴포넌트 리소스
jsSources = [
  'components/scripts/jqloader.js',
  'components/scripts/TweenMax.min.js',
  'components/scripts/jquery.scrollmagic.min.js',
  'components/scripts/script.js'
];
// Sass 컴포넌트 리스스
sassSources = ['components/sass/style.scss'];
// HTML 리소스
htmlSources = [outputDir + '*.html'];

// Gulp 테스크 - HTML
gulp.task('html', function() {
  gulp.src('builds/development/*.html')
    .pipe(gulpif(env === 'production', minifyHTML()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload())
});

// Gulp 테스크 - Compass
gulp.task('compass', function() {
  gulp.src(sassSources)
    .pipe(compass({
      sass: 'components/sass',
      css: outputDir + 'css',
      image: outputDir + 'images',
      style: sassStyle,
      require: ['susy', 'breakpoint']
    })
    .on('error', gutil.log))
//    .pipe(gulp.dest( outputDir + 'css'))
    .pipe(connect.reload())
});

// Gulp 테스크 - JS
gulp.task('js', function() {
  gulp.src(jsSources)
    .pipe(concat('script.js'))
    .pipe(browserify())
    .on('error', gutil.log)
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js'))
    .pipe(connect.reload())
});

// Gulp 테스크 - Watch
gulp.task('watch', function() {
  gulp.watch(jsSources, ['js']);
  gulp.watch(['components/sass/*.scss', 'components/sass/*/*.scss'], ['compass']);
  gulp.watch('builds/development/*.html', ['html']);
});

// Gulp 테스크 - Connect
gulp.task('connect', function() {
  connect.server({
    root: outputDir,
    livereload: true
  });
});

// Gulp 테스크 - images 폴더 배포용(Pro) 폴더 내부로 복사
gulp.task('move', function() {
  gulp.src('builds/development/images/**/*.*')
  .pipe(gulpif(env === 'production', gulp.dest(outputDir+'images')))
});


// Gulp 테스크 기본(Default) 설정
gulp.task('default', ['watch', 'html', 'js', 'compass', 'move', 'connect']);
