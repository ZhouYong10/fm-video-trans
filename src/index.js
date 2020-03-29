const express = require("express");
const expressWs = require("express-ws");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ffmpeg = require("fluent-ffmpeg");
const webSocketStream = require("websocket-stream");
const path = require("path");


ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const app = express();
app.use(express.static(path.join(__dirname, "../public")));
expressWs(app, null, {
    perMessageDeflate: false
});

app.ws("/rtsp/:id", (ws, req) => {
    console.log("rtsp request handle", req.query);
    console.log("rtsp request handle", req.params);
    const url = req.query.url;
    const stream = webSocketStream(ws);
    let localUrl = path.join(__dirname, "../public/demo1.mp4");
    let hikUrl = "rtsp://110.185.107.33:554/openUrl/Ar7cHxC";
    try {
        ffmpeg(hikUrl)
            .inputOptions([
                "-rtsp_transport tcp",
                // "-analyzeduration 3000",
                // '-max_delay 3000',
                // "-buffer_size 3000"
            ])
            // .addInputOption("-rtsp_transport", "tcp")  // 这里可以添加一些 RTSP 优化的参数
            .on("start", function () {
                console.log(url, "Stream started.");
            })
            .on("codecData", function () {
                console.log(url, "Stream codecData.")
                // 摄像机在线处理
            })
            .on("progress", (progress) => {
                console.log("ffmpeg progress: " + progress.frames, progress.currentFps, progress.currentKbps, progress.targetSize, progress.timemark);
            })
            .on("error", function (err) {
                console.log(url, "An error occured: ", err.message);
            })
            .on("end", function () {
                console.log(url, "Stream end!");
                // 摄像机断线的处理
            })
            .noAudio()
            // .videoBitrate('1000k', true)
            // .fps(1000)
            // .outputOptions([
            //     // "-rtsp_transport tcp",
            //     '-tune zerolatency',
            //     '-preset ultrafast',
            //     "-analyzeduration 3000",
            //     '-max_delay 3000',
            //     "-buffer_size 3000"
            // ])
            // .videoCodec("libx264")
            // .size('720x?')
            .videoCodec("copy")
            .outputFormat("flv").pipe(stream);
    } catch (error) {
        console.log(error);
    }
});


app.listen(8000, () => {
    console.log("app listened at: localhost:8000");
});

