var rainbowCommon = {

  prefs :  Components.classes['@mozilla.org/preferences-service;1']
           .getService(Components.interfaces.nsIPrefService)
           .getBranch("extensions.rainbows."),

  prefService : Components.classes['@mozilla.org/preferences-service;1']
             .getService(Components.interfaces.nsIPrefBranch2),

  storage : Components.classes["@rainbow.org/colorstorage;1"]
            .getService().wrappedJSObject,

  observers : Components.classes["@mozilla.org/observer-service;1"]
              .getService(Components.interfaces.nsIObserverService),

  wm : Components.classes["@mozilla.org/appshell/window-mediator;1"]
       .getService(Components.interfaces.nsIWindowMediator),

  toDate : function(date) {
    var dateStr = (new Date(date)).toDateString();
    var dateRegex = /^(.*?) (.*)$/;
    var result = dateStr.match(dateRegex);
    if(result)
      return result[2];
  },

  getFormattedColors : function(colors) {
    var format = rainbowCommon.prefs.getCharPref("format");
    var whole = rainbowCommon.prefs.getBoolPref("wholeNumbers");

    var formatted = [];
    for(var i = 0; i < colors.length; i++)
      formatted.push(colorCommon.formatColor(colors[i], format, whole));
    return formatted;
  },

  getFormattedColor : function(color, format) {
    if(!format)     
      format = rainbowCommon.prefs.getCharPref("format");
    var whole = rainbowCommon.prefs.getBoolPref("wholeNumbers");
    return colorCommon.formatColor(color, format, whole);
  },

  copyColor : function(color, format) {
    if(!format) {
      if(rainbowCommon.prefs.getBoolPref("copyDifferent"))
        format = rainbowCommon.prefs.getCharPref("copyFormat");
      else
        format = rainbowCommon.prefs.getCharPref("format");
    }
    var whole = false;
    rainbowCommon.copy(colorCommon.formatColor(color, format, whole));
  },

  copyColors : function(colors, format) { 
    if(!format) {
      if(rainbowCommon.prefs.getBoolPref("copyDifferent"))
        format = rainbowCommon.prefs.getCharPref("copyFormat");
      else
        format = rainbowCommon.prefs.getCharPref("format");
    }
    var whole = false;
    var formatted = [];
    for(var i = 0; i < colors.length; i++)
      formatted.push(colorCommon.formatColor(colors[i], format, whole));
    rainbowCommon.copy(formatted.join(","));
  },

  getFirefoxVersion : function() {
    var appinfo = Components.classes["@mozilla.org/xre/app-info;1"]
                  .getService(Components.interfaces.nsIXULAppInfo);
    return parseFloat(appinfo.version);   
  },

  getPlatform : function() {
    var runtime = Components.classes["@mozilla.org/xre/app-info;1"]
                  .getService(Components.interfaces.nsIXULRuntime);
    switch(runtime.OS) {
      case("WINNT"):
       return "Windows";
      case("Darwin"):
       return "Mac";
      default:
       return runtime.OS;
    }
  },

  copy : function(string) {
    var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
	                .getService(Components.interfaces.nsIClipboardHelper);
    clipboard.copyString(string);
  },
  
  getChromeWindow : function(win) {
     return win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
           .getInterface(Components.interfaces.nsIWebNavigation)
           .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
           .rootTreeItem
           .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
           .getInterface(Components.interfaces.nsIDOMWindow)
           .QueryInterface(Components.interfaces.nsIDOMChromeWindow);
  },

  getPixel : function(event) {
    var win = event.target.ownerDocument.defaultView;

    var pageX = event.clientX + win.scrollX;
    var pageY = event.clientY + win.scrollY;

    return rainbowc.getWindowPixel(win, pageX, pageY);
  },

  getWindowPixel : function(win, x, y) {
    var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    canvas.width = 1;
    canvas.height = 1;
    var context = canvas.getContext("2d");

    context.drawWindow(win, x, y, 1, 1, "white");
    var data = context.getImageData(0, 0, 1, 1).data;
    return "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
  },

  preventEvents : function (win, events) {
    for(var i = 0; i < events.length; i++)
      win.addEventListener(events[i], rainbowCommon.prevent, true); 
  },

  allowEvents : function(win, events) {
    for(var i = 0; i < events.length; i++)
      win.removeEventListener(events[i], rainbowCommon.prevent, true); 
  },

  prevent : function (event) {
    if(event.target.nodeName != "HTML") { // allow scroll
      event.preventDefault();
      event.stopPropagation();
    }
  },

  getStyleSheetByTitle : function(title) {
    var sheets = document.styleSheets;
    for(let i = 0; i < sheets.length; i++) {
      if(sheets[i].title == title)
        return sheets[i];
    }
  },

  registerSheet : function(sheet) {
    /* add a user style sheet that applies to all documents */
    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
              .getService(Components.interfaces.nsIStyleSheetService);
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
              .getService(Components.interfaces.nsIIOService);
    var uri = ios.newURI(sheet, null, null);
    if(!sss.sheetRegistered(uri, sss.AGENT_SHEET))
      sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET); 
  },

  unregisterSheet : function(sheet) {
    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
              .getService(Components.interfaces.nsIStyleSheetService);
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
              .getService(Components.interfaces.nsIIOService);
    var uri = ios.newURI(sheet, null, null);
    if(sss.sheetRegistered(uri, sss.AGENT_SHEET))
      sss.unregisterSheet(uri, sss.AGENT_SHEET);
  },

  /* inserts a rule for this tree cell property */
  addCellProperty : function(sheet, property, decl) {
    var rule = "treechildren::-moz-tree-cell(" + property + ")" + decl;
    sheet.insertRule(rule, 0);
  }
}

rainbowc = rainbowCommon;
rainbowc.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2); // for addObserver
