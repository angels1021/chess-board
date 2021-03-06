'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const uglify = require('gulp-uglifyjs');
const uglifyCss = require('gulp-uglifycss');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const bowerFiles = require('main-bower-files');
const inject = require('gulp-inject');

const dirs = {
    src: './app/src',
    dest: './app/dist'
};

const ext = {
    sass:'/**/*.scss',
    js:'/**/*.js',
    html: '/**/*.html'
};

const paths = {
    sass:`${dirs.src}${ext.sass}`,
    js:`${dirs.src}${ext.js}`,
    html: `${dirs.src}${ext.html}`,
    dest: `${dirs.dest}/`
};

gulp.task('clean-html', ()=>{
    return gulp.src(`${paths.dest}${ext.html}`)
        .pipe(clean({force:true}))
});

gulp.task('clean-style', ()=>{
    return gulp.src(`${paths.dest}/**/**.css`)
        .pipe(clean({force:true}))
});

gulp.task('clean-scripts', ()=>{
    return gulp.src([`${paths.dest}${ext.js}`, `!${paths.dest}/vendor.js`])
        .pipe(clean({force:true}))
});

gulp.task('styles', ['clean-style'], () => {
    return gulp.src(paths.sass)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({ browsers: ['last 2 versions', '> 1%'] }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dest));
});

gulp.task("lint", ['clean-scripts'], () => {
    return gulp.src(paths.js)
        .pipe(jshint({
            esversion:6,
            eqeqeq: true,
            freeze: true,
            futurehostile: true,
            strict:true,
            latedef:true,
            //undef: true,
            //unused: true,
            notypeof: true,
            jquery: true,
            node:true
        }))
        .pipe(jshint.reporter(stylish))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(paths.dest));
});


gulp.task('uglify', () => {
    gulp.src([`${paths.dest}/**/*.css`, `!${paths.dest}/**/*.min.css`])
        .pipe(concat('all.js'))
        .pipe(uglifyCss({
            "maxLineLen": 300
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dest));

    return gulp.src([`${paths.dest}**/*.js`, `!${paths.dest}**/*.min.js`])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dest));
});

gulp.task('index', ["lint"], ()=>{
    var sources = gulp.src(paths.js, {read: false});
    return gulp.src(`${dirs.src}/index.html`)
        .pipe(inject(gulp.src(bowerFiles(), {read: false}), {
            name: 'bower',
            ignorePath: 'bower_components',
            addPrefix: "lib"}))
        .pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest(`${dirs.src}/`))
});

gulp.task('copyIndex', ()=>{
    return gulp.src(`${paths.dest}index.html`)
        .pipe(clean({force:true}))
        .pipe(gulp.src(`${dirs.src}/index.html`))
        .pipe(gulp.dest(paths.dest));
});

gulp.task('copy', ['clean-html'], () => {
    return gulp.src(paths.html)
        .pipe(gulp.dest(paths.dest));
});

gulp.task('watch', () => {
    gulp.watch(paths.html, ['copy']);
    gulp.watch(paths.media, ['media']);
    gulp.watch(paths.lang, ['lang']);
    gulp.watch(paths.js, ['index', 'copyIndex']);
    gulp.watch('./bower.json', ['index', 'copyIndex']);
    return gulp.watch(paths.sass, ['styles']);
});

gulp.task('build', ()=>{
    gulp.start('styles');
    gulp.start('index');
    return gulp.start('copy');
});

gulp.task('default', ['build'], ()=>{
    return gulp.start('watch');
});

gulp.task('dist', ['build'], ()=>{
    gulp.start('uglify');
});

