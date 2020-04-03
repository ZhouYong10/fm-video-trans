class FfmpegContianer {
    constructor() {
        this.ffmpegs = new Map()
    }

    setFfmpeg(name, ffmpeg) {
        return this.ffmpegs.set(name, ffmpeg);
    }

    getFfmpeg(name) {
        return this.ffmpegs.get(name);
    }

    hasFfmpeg(name) {
        return this.ffmpegs.has(name);
    }
}


module.exports = FfmpegContianer;
