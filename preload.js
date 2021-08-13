// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type])
//   }
// })
const { ipcRenderer, contextBridge } = require('electron');

window.onload = function () {
  ipcRenderer.on("uuid", (event, data) => {
    // document.getElementById("code").innerHTML = data;
  })
}

function startShare() {
  ipcRenderer.send("start-share", {});
  document.getElementById("start").style.display = "none";
  document.getElementById("stop").style.display = "block";
}

function stopShare() {
  ipcRenderer.send("stop-share", {});
  document.getElementById("stop").style.display = "none";
  document.getElementById("start").style.display = "block";
}

function connect2client(clientid) {
  ipcRenderer.send("connect-client", { clientid: clientid });
  // document.getElementById("stop").style.display = "none";
  // document.getElementById("start").style.display = "block";
}

contextBridge.exposeInMainWorld(
  'electron',
  {
    startShare: () => startShare(),
    stopShare: () => stopShare(),
    connect2client: (clientid) => connect2client(clientid),
  }
)