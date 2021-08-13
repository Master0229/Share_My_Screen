// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const screenshot = require('screenshot-desktop');
var robot = require("robotjs");

var socket = require('socket.io-client')('http://192.168.1.10:5000');
var interval;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
socket.on("mouse-move", function (data) {
  var obj = JSON.parse(data);
  var x = obj.x;
  var y = obj.y;

  robot.moveMouse(x, y);
})

socket.on("mouse-click", function (data) {
  var obj = JSON.parse(data);
  robot.mouseClick();
})

socket.on("type", function (data) {
  console.log(data)
  var obj = JSON.parse(data);
  var key = obj.key;
  try {
    robot.keyTap(key);
  } catch (err) {
    console.log(err)
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on("start-share", function (event, arg) {

  var uuid = "test";//uuidv4();
  socket.emit("join-message", uuid);
  event.reply("uuid", uuid);

  interval = setInterval(function () {
    screenshot().then((img) => {
      var imgStr = new Buffer(img).toString('base64');

      var obj = {};
      obj.room = uuid;
      obj.image = imgStr;

      socket.emit("screen-data", JSON.stringify(obj));
    })
  }, 500)
})

ipcMain.on("stop-share", function (event, arg) {

  clearInterval(interval);
})
var clientid = null
ipcMain.on("connect-client", function (event, arg) {
  const remoteWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'connect.js')
    }
  })
  clientid = arg["clientid"]
  // and load the index.html of the app.
  remoteWindow.loadFile('display.html')
  // clearInterval(interval);
})

ipcMain.on("get-client-id", function (event, arg) {
  event.reply("client-id", clientid)
})
