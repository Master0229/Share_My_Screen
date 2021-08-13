// const ipcRenderer = require('electron').ipcRenderer;
const io = require("socket.io-client");
const { ipcRenderer, contextBridge } = require('electron');
let socket
let room
window.onload = function () {
    ipcRenderer.send('get-client-id', {})
    ipcRenderer.on("client-id", (event, data) => {
        console.log(data)
        room = data
        socket = io.connect('http://192.168.1.10:5000');

        socket.emit("join-message", room);
        socket.on('screen-data', function (message) {
            // console.log(message)
            // document.getElementById("sharedScreen")[0].src = "data:image/png;base64," + message
            document.getElementsByTagName('img').item(0).src = "data:image/png;base64," + message
            // $("img").attr("src", "data:image/png;base64," + message);
        })


    })
}

function mousemove(e) {
    // document
    var img = document.getElementsByTagName('img').item(0)
    var posX = img.offsetLeft;
    var posY = img.offsetTop;

    var x = e.pageX - posX;
    var y = e.pageY - posY;

    var obj = { "x": x, "y": y, "room": room }
    socket.emit("mouse-move", JSON.stringify(obj));

}

function click(e) {
    var obj = { "room": room };
    socket.emit("mouse-click", JSON.stringify(obj));
}

contextBridge.exposeInMainWorld(
    'electron',
    {
        mousemove: (e) => mousemove(e),
        click: (e) => click(e),
        // connect2client: (clientid) => connect2client(clientid),
    }
)
// $(window).bind("keyup", function (e) {

//     var obj = { "key": e.key, "room": room };
//     socket.emit("type", JSON.stringify(obj));
// })
