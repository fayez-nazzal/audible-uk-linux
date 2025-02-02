const { app, BrowserWindow, Menu, shell } = require('electron')
const fs = require('fs');

const appName = 'Audible'

if (process.env.SNAP_USER_COMMON) {
  const localeFile = process.env.SNAP_USER_COMMON + '/locale';
  if (!fs.existsSync(localeFile)) {
    fs.writeFileSync(localeFile, app.getLocaleCountryCode());
  }
  locale = fs.readFileSync(localeFile).toString().substring(0, 2).toUpperCase();
}
else {
  locale = app.getLocaleCountryCode();
}

// https://audible.custhelp.com/app/answers/detail/a_id/7267/~/what-is-an-audible-marketplace-and-which-is-best-for-me%3F

appUrl = 'https://www.audible.co.uk/library'
signInUrl = 'https://www.audible.co.uk/sign-in'

const customCss =
  '.topSlot {display: none !important;}' +
  '.bottomSlot {display: none !important;}' +
  '.bc-button-secondary {display: none !important;}' +
  '.bc-size-caption1 {display: none !important;}'

function createWindow() {
  Menu.setApplicationMenu(null)

  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 655,
    title: appName
  })
  mainWindow.loadURL(appUrl + '?ipRedirectOverride=true')

  mainWindow.webContents.on('will-navigate', function (event, url) {
    if (!url.startsWith(appUrl) && !url.startsWith(signInUrl) && !url.includes('/ap/signin')) {
      event.preventDefault()
      shell.openExternal(url)
    }
  });

  mainWindow.webContents.on('did-navigate', function () {
    mainWindow.webContents.insertCSS(customCss)
  });

  mainWindow.webContents.on('page-title-updated', function () {
    mainWindow.webContents.insertCSS(customCss)
    mainWindow.setTitle(appName);
  });

  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
    event.preventDefault()
    if (mainWindow.webContents.getURL().includes('signin?')) {
      shell.openExternal(url)
    }
    else {
      const subWindow = new BrowserWindow({
        width: 450,
        height: 750,
        title: appName
      })
      subWindow.loadURL(url)

      subWindow.webContents.on('page-title-updated', function () {
        subWindow.setTitle(appName);
      });
    }
  })
}

app.on('widevine-ready', () => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
