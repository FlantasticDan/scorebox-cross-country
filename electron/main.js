const { app, BrowserWindow } = require('electron')
const fetch = require('electron-fetch').default
require ('hazardous');
const path = require('path')
const randomString = require('randomstring')

const key = randomString.generate(12)

function createWindow () {
  const win = new BrowserWindow({
    width: 1120,
    height: 880,
    backgroundColor: '#121212',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  win.removeMenu()
  win.setTitle('ScoreBox')
  win.loadURL(`http://localhost:5000/setup?key=${key}`)
  win.webContents.openDevTools()

  win.on('close', (e) => {
    e.preventDefault()
    killPython()
    win.destroy()
  })

  win.webContents.session.on('will-download', (e, item, contents) => {
    item.setSaveDialogOptions({
      title: "Export Splits",
      filters: [{
        name: "CSV",
        extensions: ["csv"]
      }]
    })
  })
}

app.whenReady().then(createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

let flaskCore = null
function launchPython() {
    let flask = path.join(__dirname, "bundles", "flask", "main.exe")
    let unity = path.join(__dirname, "bundles", "unity", "Scorebox Cross Country Overlay.exe")
    flaskCore = require('child_process').spawn(flask, [key, '5000', unity])
}

async function killPython() {
    await fetch(`http://localhost:5000/terminate?key=${key}`).catch(e => {})
}
  
app.on('ready', launchPython)