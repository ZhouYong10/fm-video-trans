const express = require("express");
const expressWs = require("express-ws");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ffmpeg = require("fluent-ffmpeg");
const webSocketStream = require("websocket-stream");
const path = require("path");
// const liveCommands = new Map();
// const playbackCommands = new Map();



ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const app = express();
app.use(express.static(path.join(__dirname, "../public")));
expressWs(app, null, {
    perMessageDeflate: false
});

app.ws("/flv/playback", (ws, req) => {
    let rtspUrl = "rtsp://110.185.107.33:554/openUrl/F6rDDa0";
    player(rtspUrl, webSocketStream(ws), false);
});

app.ws("/flv/live", (ws, req) => {
    // let rtspUrl = "rtsp://182.150.24.194:9090/dss/monitor/param?cameraid=1000275$7&substream=2";

    let rtspUrl = unescape(req.query.path);
    player(rtspUrl, webSocketStream(ws));
});


function player(rtspUrl, stream, isAlive = true) {
    try {
        if (isAlive) {
            alive(rtspUrl, stream);
        } else {
            playback(rtspUrl, stream);
        }
    } catch (err) {
        console.log(`[ ${Date.now().toLocaleString()} ] An error occured: ${err.message}`)
    }
}

function playback(rtspUrl, stream) {
    // 回放(參數)
    let command = ffmpeg(rtspUrl)
        .inputOptions("-rtsp_transport tcp")
        .noAudio()
        .videoCodec("copy")
        .outputFormat("flv")
        .on("error", function (err) {
            stream.close();
            command.kill();
            console.log(`[ ${new Date().toLocaleString()} ] An error occured: ${err.message}`);
        });
    command.pipe(stream);
}

function alive(rtspUrl, stream) {
    // 直播(參數)
    let command = ffmpeg(rtspUrl)
        .inputOptions([
            "-rtsp_transport tcp",
            "-analyzeduration 300",
            '-max_delay 300',
            "-buffer_size 300"
        ])
        .noAudio()
        .videoBitrate('3000k', true)
        .fps(40)
        .outputOptions([
            "-rtsp_transport tcp",
            '-tune zerolatency',
            '-preset ultrafast',
            "-analyzeduration 300",
            '-max_delay 300',
            "-buffer_size 300",
        ])
        .videoCodec("libx264")
        // .videoCodec("copy")
        .size('1920x?')
        .aspect("16:9")
        // .videoFilters([
        //     'eq=contrast=1.5:brightness=0.1',
        //     // 'hqdn3d=luma_spatial=6.0:chroma_spatial=4.0:luma_tmp=8.0:chroma_tmp=30.0'
        // ])
        .outputFormat("flv")
        // .on('progress', (streamInfo) => {
        //     console.log(`[ ${new Date().toLocaleString()} ] ${rtspUrl}: Frames[${streamInfo.frames}], CurrentFps[${streamInfo.currentFps}], CurrentKbps[${streamInfo.currentKbps}], TargetSize[${streamInfo.targetSize}], TimeMark[${streamInfo.timemark}], Percent[${streamInfo.percent}]`);
        // })
        .on("error", function (err) {
            stream.socket.close();
            command.kill();
            console.log(`[ ${new Date().toLocaleString()} ] An error occured: ${err.message}`);
        });
    command.pipe(stream);
}

app.listen(8888, () => {
    console.log("app listened at: localhost:8888");
});

