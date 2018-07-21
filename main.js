const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require('electron');

const fs = require('fs');

const path = require('path');
const url = require('url');

var child = require('child_process').execFile;

var exec = require('child_process').exec;

//process.env.NODE_ENV = 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

let json;



const mainMenuTemplate = [{
  label: 'File',
  submenu: [{
    label: 'Quit',
    accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
    click() {
      app.quit();
    }
  }, {
    label: 'Open Config',
    click() {
      exec(getCommandLine() + ' ' + url.format({
        pathname: path.join(__dirname, '/config/config.json'),
        protocol: 'file:',
        slashes: true
      }));
    }
  }]
}];

// If Mac, add empty object to menu
if (process.platform == 'darwin')
  mainMenuTemplate.unshift({});

// Add developer tools item if not in prod
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [{
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}


function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({show: false});

  // show when ready
  win.once('ready-to-show', () => {
    win.show()
  })

  // sets kiosk mode
  win.setKiosk(true);


  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });

  //removes top menu
  win.setMenuBarVisibility(false);
  win.setAutoHideMenuBar(true);


  // Once the window is loaded
  win.webContents.on('dom-ready', () => {

    // read json config file
    fs.readFile("./config/config.json", "utf8", (err, data) => {
      if (err) throw err;

      // parse
      json = JSON.parse(data);

      // set background
      if (json.background)
        win.webContents.send('setbackground', json.background);

      // set global css
      if (json.css)
        Object.keys(json.css).forEach((key, index) => {
          win.webContents.send('item:setcss', '#container', key, json.css[key]);
        });

      // add elements
      if (json.elements)
        json.elements.forEach((element, index) => {
          win.webContents.send('item:add', index, element.printName ? element.printName : "MissingName");
          // set item css
          if (element.css)
            Object.keys(element.css).forEach((key, css_index) => {
              win.webContents.send('item:setcss', '#item_' + index, key, element.css[key]);
            });
        });
    });
  });
}

// hover in
ipcMain.on('item:hoverIn', function (e, id) {
  var i = parseInt(id.replace('item_', ''));
  if (json.elements && json.elements[i] && json.elements[i].hoverIn) {
    var el = json.elements[i].hoverIn;
    if (el.css)
      Object.keys(el.css).forEach((key, css_index) => {
        win.webContents.send('item:setcss', '#' + id, key, el.css[key]);
      });
    if (el.js)
      el.js.forEach((code, index) => {
        win.webContents.send('runJS', code);
      });
  }
});

// hover out
ipcMain.on('item:hoverOut', function (e, id) {
  var i = parseInt(id.replace('item_', ''));
  if (json.elements && json.elements[i] && json.elements[i].hoverOut) {
    var el = json.elements[i].hoverOut;
    if (el.css)
      Object.keys(el.css).forEach((key, css_index) => {
        win.webContents.send('item:setcss', '#' + id, key, el.css[key]);
      });
    if (el.js)
      el.js.forEach((code, index) => {
        win.webContents.send('runJS', code);
      });
  }
});

// click
ipcMain.on('item:click', function (e, id) {
  var i = parseInt(id.replace('item_', ''));
  if (json.elements && json.elements[i] && json.elements[i].click) {
    var el = json.elements[i].click;
    if (el.css)
      Object.keys(el.css).forEach((key, css_index) => {
        win.webContents.send('item:setcss', '#' + id, key, el.css[key]);
      });
    if (el.js)
      el.js.forEach((code, index) => {
        win.webContents.send('runJS', code);
      });
    if (el.externalApp && el.externalApp.appUrl) {
      var executablePath = el.externalApp.appUrl;
      var parameters = el.externalApp.appParam ? el.externalApp.appParam : [];

      child(executablePath, parameters, function (err, data) {
        console.log(err)
        console.log(data.toString());
      });
    }
    if (el.externalFile) {
      el.externalFile.forEach((file, index) => {
        if (fs.existsSync(file))
          exec(getCommandLine() + ' ' + file);
        else
          exec(getCommandLine() + ' ' + url.format({
            pathname: path.join(__dirname, file),
            protocol: 'file:',
            slashes: true
          }));
      });
    }
  }
});


function getCommandLine() {
  switch (process.platform) {
    case 'darwin':
      return 'open';
    case 'win32':
      return 'start';
    case 'win64':
      return 'start';
    default:
      return 'xdg-open';
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});