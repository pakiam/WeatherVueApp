var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    fileinclude = require('gulp-file-include'),
    gulpRemoveHtml = require('gulp-remove-html'),
    bourbon = require('node-bourbon'),
    ftp = require('vinyl-ftp');

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: 'dev'
        },
        notify: false
    });
});

gulp.task('sass', ['headersass'], function() {
    return gulp.src('dev/sass/**/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(rename({suffix: '.min', prefix : ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dev/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('headersass', function() {
    return gulp.src('dev/header.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(rename({suffix: '.min', prefix : ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dev'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('libs', function() {
    return gulp.src([
        // 'dev/libs/material/material.min.js'
        // 'app/libs/magnific-popup/magnific-popup.min.js'
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dev/libs'));
});

gulp.task('watch', ['sass', 'libs', 'browser-sync'], function() {
    gulp.watch('dev/header.sass', ['headersass']);
    gulp.watch('dev/sass/**/*.sass', ['sass']);
    gulp.watch('dev/*.html', browserSync.reload);
    gulp.watch('dev/js/**/*.js', browserSync.reload);
});

gulp.task('imagemin', function() {
    return gulp.src('dev/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('assets/img'));
});

gulp.task('buildhtml', function() {
    gulp.src(['dev/*.html'])
        .pipe(fileinclude({
            prefix: '@@'
        }))
        .pipe(gulpRemoveHtml())
        .pipe(gulp.dest('assets/'));
});

gulp.task('removedist', function() { return del.sync('assets'); });

gulp.task('build', ['removedist', 'buildhtml', 'imagemin', 'sass', 'libs'], function() {

    var buildCss = gulp.src([
        'dev/css/style.min.css'
    ]).pipe(gulp.dest('assets/css'));

    var buildFiles = gulp.src([
        'dev/.htaccess'
    ]).pipe(gulp.dest('assets'));

    var copyLbs=gulp.src([
        'dev/libs/**/*'
    ]).pipe(gulp.dest('assets/libs'));

    var buildJs = gulp.src('dev/js/**/*').pipe(gulp.dest('assets/js'));

});

gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);