/**
 * TYPE 'gulp tutorial' to the terminal to learn how to use' 
 */

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const terser = require('gulp-terser');

const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
var clean = require('gulp-clean');

function min_js_all() {
	console.log(`Minifying JS files...`)
	return gulp.src('js/*.js')
		.pipe(rename(function(path) {
			// path.basename += `_${time_stamp}`;
			path.extname = ".min.js";
        }))
        .pipe(sourcemaps.init())
        .pipe(terser())
        .pipe(sourcemaps.write())
		.pipe(gulp.dest(`js/`));
}
exports.min_js_all = min_js_all

function min_css_all(){
    return gulp.src('css/*.css')
        .pipe(rename(function(path) {
            path.extname = ".min.css";
        }))
        .pipe(sourcemaps.init())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
		.pipe(gulp.dest(`css/`));
}
exports.min_css_all = min_css_all

async function delete_minified(){
    return gulp.src(['js/*.min.js', 'css/*.min.css'], {read: false})
                .pipe(clean());
}
exports.delete_minified = delete_minified

exports.tutorial = (done) => {
	console.log(`All available commands:`)
	console.log(`gulp delete_minified`)
	console.log(`gulp min_js_all`)
	console.log(`gulp min_css_all`)
	done()
}