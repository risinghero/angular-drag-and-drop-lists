var gulp = require('gulp');
var ts = require('gulp-typescript');
var minify = require('gulp-minify');
var concat = require('gulp-concat');
var webserver = require('gulp-webserver');

gulp.task('demo', function () {
    gulp.src('.')
        .pipe(webserver({
            livereload: true,
            open:'demo/index.html',
        }));
});

gulp.task('compile', function () {
    var tsProject = ts.createProject('tsconfig.json');

    var tsResult = tsProject.src().pipe(tsProject());

    return tsResult.js.pipe(concat('angular-drag-and-drop-lists.js')).pipe(minify({
        ext: {
            src: '.js',
            min: '.min.js'
        },
        ignoreFiles: ['.min.js']
    })).pipe(gulp.dest('release'));
});

gulp.task('watch', function () {
    return gulp.watch('sources/**/*.ts', gulp.series('compile'));
});

gulp.task('default', gulp.series('compile','watch'));