const gulp = require('gulp');
const webserver = require('gulp-webserver');
const pug = require('gulp-pug');
const htmlclean = require('gulp-htmlclean');
const htmlreplace = require('gulp-html-replace');
const sass = require('gulp-sass');
      sass.compiler = require('node-sass');
const cleanCSS = require('gulp-clean-css');
const critical = require('critical');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const clean = require('gulp-clean');
const ghPages = require('gulp-gh-pages');

const paths = {
    src: 'dev/',
    srcPug: 'dev/views/*.pug',
    srcHTML: 'dev/*.html',
    srcSass: 'dev/css/**/*.+(scss|sass)',
    srcCSS: 'dev/css/**/*.css',
    srcJS: 'dev/js/**/*.js',
    srcIMG: 'dev/img/**/*.+(png|jpg|svg)',
    srcFonts: 'dev/fonts/**/*.*',
    srcCompiledFiles: 'dev/**/*.+(html|css)',
    dist: 'dist/',
    distPug: 'dev/',
    distHTML: 'dist/',
    distSass: 'dev/css/',
    distCSS: 'dist/css/',
    distJS: 'dist/js/',
    distIMG: 'dist/img/',
    distFonts: 'dist/fonts/',
    distFolders: 'dist/**/*',
};

const browsers = [
    'ie >= 11',
    'edge >= 16',
    'ff >= 52',
    'chrome >= 57',
    'safari >= 10.1',
    'opera >= 44',
    'ios >= 10.3',
    'android >= 5',
];

gulp.task('buildPug', function () {
  return gulp.src(paths.srcPug)
  .pipe(pug())
  .pipe(gulp.dest(paths.distPug));
});

gulp.task('buildPug:watch', function () {
  gulp.watch(paths.srcPug, gulp.series('buildPug'));
});

gulp.task('buildHTML', function () {
  return gulp.src(paths.srcHTML)
    .pipe(htmlreplace({
      'css': 'css/style.min.css',
      'js': 'js/bundle.min.js'
    }))
    .on('error', function(err) { log.error(err.message); })
    .pipe(htmlclean())
    .pipe(gulp.dest(paths.distHTML));
});

gulp.task('buildSass', function () {
  return gulp.src(paths.srcSass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.distSass));
});

gulp.task('buildSass:watch', function () {
  gulp.watch(paths.srcSass, gulp.series('buildSass'));
});

gulp.task('buildCSS', gulp.series('buildSass', function () {
  return gulp.src(paths.srcCSS)
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({browsers: browsers}))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.distCSS))
}));

gulp.task('buildCritical', function () {
  return gulp.src(paths.distHTML + 'index.html')
      .pipe(critical({
        base: paths.dist,
        dest: 'index.html',
        inline: true,
        minify: true,
        css: [paths.distCSS + 'style.min.css'],
        ignore: ['@font-face',/url\(/]
      }))
      .on('error', function(err) { log.error(err.message); })
      .pipe(gulp.dest(paths.dist));
});

gulp.task('buildJS', function () {
  return gulp.src(paths.srcJS)
    .pipe(concat('bundle.min.js'))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.distJS));
});

gulp.task('buildIMG', function(){
  return gulp.src(paths.srcIMG)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.distIMG));
});

gulp.task('buildFONT', function(){
  return gulp.src(paths.srcFonts)
    .pipe(gulp.dest(paths.distFonts));
});

gulp.task('cleanSrc', function() {
  return gulp.src(paths.srcCompiledFiles, {read: false})
    .pipe(clean());
});

gulp.task('cleanDist', function () {
  return gulp.src(paths.distFolders, {read: false})
    .pipe(clean());
});

gulp.task('build', gulp.series('buildPug', 'buildHTML', 'buildSass', 'buildCSS', 'buildCritical', 'buildJS', 'buildIMG', 'buildFONT'));

gulp.task('serveSrc', gulp.parallel('buildPug:watch', 'buildSass:watch', function () {
  return gulp.src(paths.src)
    .pipe(webserver({
      port: 3000,
      livereload: true
  }));
}));

gulp.task('serveDist', gulp.series('build', function () {
  return gulp.src(paths.dist)
    .pipe(webserver({
      port: 3000,
      livereload: true
  }));
}));

gulp.task('deploy:gh-pages', gulp.series('cleanDist', 'build', function() {
  return gulp.src(paths.distFolders)
    .pipe(ghPages());
}));
