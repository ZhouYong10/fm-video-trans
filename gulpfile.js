const {watch, series} = require("gulp");
const nodemon = require("gulp-nodemon");

function start(cb) {
    nodemon({
        watch: "src",
        script: "src/index.js",
        ext: "js",
        env: {"NODE_ENV": "development"},
        done: cb
    });
}

function change(cb) {
    watch("src/**/*.js");
    cb();
}

exports.default = series(change, start);
