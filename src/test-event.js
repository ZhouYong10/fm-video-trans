const EventEmitter = require("events");
const nodeEvent = new EventEmitter();

nodeEvent.on("some", function () {
    new Array(1000).fill("222222222222222222222").forEach(item => {
        console.log(item);
    });
});

console.log("11111111111111111");
nodeEvent.emit("some");
console.log("3333333333333333333333333");
