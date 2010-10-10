document.observe("dom:loaded", function () {
  soundManager.useHTML5Audio = !FlashDetect.installed;
  soundManager.useFlashBlock = false;
  soundManager.html5Test = /^(probably|maybe)$/i;

  $$(".streamer").each(function (item) {
    new Streamer(item);
  })
});

var Streamer = Class.create({

  initialize: function (element) {
    this.playlist_url = element.getAttribute("rel");
    this.element = element;
    this.element.addClassName("collapsed");
    this.volume = 100;
    this.songs = [];
    this.activeSong;

    this.buildPlayer();
    this.displayMessage("Downloading playlist&hellip;");

    // check if the url is just a link to a single
    // audio file and not a playlist

    if (Streamer.isAudioURL(this.playlist_url)) {
      var filename = Streamer.extractFilename(this.playlist_url);
      this.songs = [{url: this.playlist_url, title: filename}];
      this.refreshPlayer();
    } else {
      this.downloadPlaylist();
    }

    // setup handlers for play/pause/stop buttons

    this.clickHandlers = [
      [ ".play", function(e){this.togglePlay(e)} ],
      [ ".next", this.next ],
      [ ".previous", this.previous ],
      [ ".playlist", this.togglePlaylist ]
    ];

    this.element.observe("click", function (event) {
      this.clickHandlers.each(function (handler) {
        var elem = event.findElement(handler[0]);
        if (elem) {
          event.stop();
          handler[1].call(this, elem, event);
        }
      }.bind(this));
    }.bind(this));

    // if the song can't be played just let the
    // click event pass, so the browser opens the 
    // .mp3 on it's own

    this.element.observe("click", function(e) {
      var a = e.findElement(".streamersong a");
      if (!a) return;

      var li = a.up('li');
      if (soundManager.canPlayLink(a)) {
        e.stop();
        this.changeSong(li);
      }
    }.bind(this));

    // volume slider setup
    this.updateVolumeHandler = this.updateVolume.bind(this);
    this.hideVolumeHandler = this.hideVolume.bind(this);

    this.element.down(".volume_toggle").observe("click", function (e) {
      if (e.element().hasClassName("volume_toggle")) this.toggleVolume();
    }.bind(this));

    // progress slider setup
    this.updatePositionHandler = this.updatePosition.bind(this);
    this.finishSeekHandler = this.finishSeek.bind(this);

    this.element.observe("mousedown", function(e) {
      var bar = e.findElement(".bar");
      if (bar) {
        this.wasPaused = this.activeSong.paused;
        if (!this.wasPaused) this.pause();
        
        this.updatePosition(e);

        document.observe("mousemove", this.updatePositionHandler);
        document.observe("mouseup", this.finishSeekHandler);
      }
    }.bind(this));
  },

  finishSeek: function (e) {
    if (!this.wasPaused) this.play();
    document.stopObserving("mousemove", this.updatePositionHandler);
    document.stopObserving("mouseup", this.finishSeekHandler);
  },

  changeSong: function (elem) {
    this.stop();
    this.updateProgress();
    var a = elem.down('a');

    if (this.activeSong)
      soundManager.destroySound(this.activeSong.sID);

    if (soundManager.canPlayLink(a)) {
      this.element.select("li.active").invoke("removeClassName","active");
      elem.addClassName("active");
      this.activeSong = this.createSound(a);
      soundManager.setVolume(this.activeSong.sID, this.volume);
      this.element.down(".title").innerHTML = a.innerHTML;
      this.play();
    }
    else {
      this.displayMessage("Your browser can not play this audio file");
    }
  },

  createSound: function (a) {
    var sound = soundManager.getSoundById(a.href);
    if (sound) return sound;

    return soundManager.createSound({
      id: a.href,
      url: a.href,
      onfinish: this.next.bind(this),
      whileloading: this.updateLoadProgress.bind(this),
      whileplaying: this.updateProgress.bind(this)
    });
  },

  togglePlay: function (elem) {
    if (!this.activeSong || this.activeSong.paused)
      this.play();
    else
      this.pause();
  },

  next: function () {
    var active = this.element.down("li.active");
    if (!active)
      this.play();
    else if (active.next())
      this.changeSong(active.next());
    else
      this.stop();
  },

  previous: function () {
    var active = this.element.down("li.active");
    if (active && active.previous())
      this.changeSong(active.previous());
  },

  play: function () {
    if (!this.activeSong) {
      this.changeSong(this.element.down(".streamersong"));
    }
    else {
      soundManager.play(this.activeSong.sID);
      this.element.down(".play").addClassName("active");
    }
  },

  pause: function () {
    if (this.activeSong)
      soundManager.pause(this.activeSong.sID);

    this.element.down(".play").removeClassName("active");
  },

  stop: function () {
    if (this.activeSong) {
      this.element.down("li.active").removeClassName("active");
      this.element.down(".title").innerHTML = "Not playing";
      this.pause();
      this.activeSong.setPosition(0);
      this.activeSong = undefined;
    }
    this.resetProgress();
  },

  duration: function () {
    if (!this.activeSong) return 1;
    return this.activeSong.loaded ? this.activeSong.duration
            : this.activeSong.durationEstimate;
  },

  updateLoadProgress: function () {
    var width = 0;
    if (this.activeSong) {
      width = (this.activeSong.bytesLoaded / this.activeSong.bytesTotal)
              * this.progressWidth();
    }
    this.element.down(".load_progress").setStyle({width: width+"px"});
  },

  updateProgress: function () {
    var width = 0;
    if (this.activeSong) {
      width = (this.activeSong.position / this.duration())
              * this.progressWidth();
    }
    this.element.down(".progress").setStyle({width: width+"px"});
  },

  resetProgress: function () {
    var width = 0;
    this.element.down(".progress").setStyle({width: "0px"});
  },


  updatePosition: function (e) {
    if (!this.activeSong) return;

    var bar = this.element.down(".bar");
    var progress = bar.down(".progress");
    var offset = progress.cumulativeOffset().left;

    var position = e.pointerX() - offset;
    position = Math.max(0, position);
    position = Math.min(this.progressWidth(), position);
    progress.setStyle({width: position+"px"});

    this.activeSong.setPosition(this.duration() * (position / this.progressWidth()));
  },

  downloadPlaylist: function () {
    new Ajax.Request("/playlist", {
      method: "get",
      parameters: {url: this.playlist_url},
      onSuccess: function (response) {
        this.parsePlaylist(response.responseText);
        this.refreshSongs();
        this.displayMessage("Not playing");
      }.bind(this),
      onFailure: function (response) {
        this.displayMessage("Could not get the playlist");
      }.bind(this)
    })
  },

  parsePlaylist: function (xml) {
    var urls = xml.match(/<location>.*?<\/location>/g);
    var titles = xml.match(/<title>.*?<\/title>/g);
    var image = xml.match(/<image>(.*?)<\/image>/);
    if (image)
      this.image = image[1];
    titles.shift(); // get rid of feed title
    this.songs = [];
    for (var i=0; i < urls.length; i++) {
      var url = urls[i].match(/<location>(.*?)<\/location>/);
      var title = titles[i].match(/<title>(.*?)<\/title>/);
      this.songs.push({url: url[1], title: title[1]});
    }
  },

  progressWidth: function () {
    if (!this._progressWidth) {
      var width = this.element.down(".bar").getStyle("width");
      width = width.replace("px", "");
      this._progressWidth = width;
    }
    return this._progressWidth;
  },

  buildPlayer: function () {
    this.element.update('<div class="controls"><div class="button previous"></div><div class="button play"></div><div class="button next"></div><div class="title">Not playing</div><div class="button volume_toggle"><div class="volume_container"><div class="volume"><div class="volume_bg"><div class="slider"><div class="grip"></div></div></div></div></div></div><div class="button playlist" title="toggle playlist"></div></div><div class="bar"><div class="load_progress"></div><div class="progress"><div class="slider"><div class="grip"></div></div></div></div>');
    
    soundManager.onerror = function() {
      this.displayMessage("The &lt;audio&gt; element is not supported by your browser");
    }.bind(this);
  },

  refreshSongs: function () {
    this.element.select("img").invoke("remove");
    this.element.select("ol").invoke("remove");

    if (this.image)
      this.element.insert("<img src=\""+this.image+"\" />");

    this.element.insert("<ol></ol>");
    var list = this.element.down("ol");

    if (!this.image)
      list.addClassName("noimage");

    if (Prototype.Browser.MobileSafari)
      list.addClassName("iphone");

    this.songs.each(function (song) {
      list.insert(Streamer.songTemplate.evaluate(song));
    });

    if (this.songs.length <= 1 && !this.image) {
      if (this.songs[0])
        this.element.down(".title").innerHTML = this.songs[0].title;
      this.element.addClassName("singlesong");
      list.hide();
    }

  },

  displayMessage: function (err) {
    this.element.down(".title").innerHTML = "<span class=\"error\">"+err+"</span>";
  },

  togglePlaylist: function() {
    if (this.element.hasClassName("collapsed")) {
      this.element.removeClassName("collapsed");
      this.element.down(".playlist").addClassName("active");
    } else {
      this.element.addClassName("collapsed");
      this.element.down(".playlist").removeClassName("active");
    }
  },

  toggleVolume: function () {
    var vol = this.element.down(".volume_toggle");
    if (vol.hasClassName("active")) {
      vol.removeClassName("active");
    } else {
      vol.addClassName("active");

      vol.down(".volume").observe("mousedown", function (e) {
        this.updateVolume(e);
        document.observe("mousemove", this.updateVolumeHandler);
      }.bind(this));

      document.observe("mouseup", this.hideVolumeHandler);
    }
  },

  hideVolume: function (e) {
    if (e.findElement(".volume")) this.updateVolume(e);

    this.element.down(".volume").stopObserving("mousedown");
    document.stopObserving("mousemove", this.updateVolumeHandler);
    document.stopObserving("mouseup", this.hideVolumeHandler);
    this.toggleVolume();
  },

  updateVolume: function (e) {
    var volume = this.element.down(".volume");
    var progress = volume.down(".volume_bg");
    var offset = volume.cumulativeOffset().top;
    var height = volume.getHeight();

    var position = height - (e.pointerY() - offset);
    position = Math.max(0, position);
    position = Math.min(height, position);

    progress.setStyle({height: position+"px"});

    this.volume = (progress.getHeight() / height) * 100;

    if (this.activeSong)
      soundManager.setVolume(this.activeSong.sID, this.volume);
  }
});

Object.extend(Streamer, {
  songTemplate: new Template("<li class=\"streamersong\"><a href=\"#{url}\" target=\"_blank\">#{title}</a></li>"),
  mimeMap: {
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    mp4: "audio/mp4",
    ogg: "audio/ogg",
    oga: "audio/ogg",
    wav: "audio/x-wav",
    flac: "audio/flac"
  },
  extractFilename: function (url) {
    var file = url.match(/([^\/]*)\.[\w\d]{3,4}$/);
    if (file) {
      return file[1];
    }
    return url;
  },
  isAudioURL: function (url) {
    return Object.keys(Streamer.mimeMap).any(function (ext) {
      var re = new RegExp("."+ext+"$","i");
      return url.match(re);
    })
  }
});

/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/
var FlashDetect = new function(){
    var self = this;
    self.installed = false;
    self.raw = "";
    self.major = -1;
    self.minor = -1;
    self.revision = -1;
    self.revisionStr = "";
    var activeXDetectRules = [
        {
            "name":"ShockwaveFlash.ShockwaveFlash.7",
            "version":function(obj){
                return getActiveXVersion(obj);
            }
        },
        {
            "name":"ShockwaveFlash.ShockwaveFlash.6",
            "version":function(obj){
                var version = "6,0,21";
                try{
                    obj.AllowScriptAccess = "always";
                    version = getActiveXVersion(obj);
                }catch(err){}
                return version;
            }
        },
        {
            "name":"ShockwaveFlash.ShockwaveFlash",
            "version":function(obj){
                return getActiveXVersion(obj);
            }
        }
    ];
    /**
     * Extract the ActiveX version of the plugin.
     * 
     * @param {Object} The flash ActiveX object.
     * @type String
     */
    var getActiveXVersion = function(activeXObj){
        var version = -1;
        try{
            version = activeXObj.GetVariable("$version");
        }catch(err){}
        return version;
    };
    /**
     * Try and retrieve an ActiveX object having a specified name.
     * 
     * @param {String} name The ActiveX object name lookup.
     * @return One of ActiveX object or a simple object having an attribute of activeXError with a value of true.
     * @type Object
     */
    var getActiveXObject = function(name){
        var obj = -1;
        try{
            obj = new ActiveXObject(name);
        }catch(err){
            obj = {activeXError:true};
        }
        return obj;
    };
    /**
     * Parse an ActiveX $version string into an object.
     * 
     * @param {String} str The ActiveX Object GetVariable($version) return value. 
     * @return An object having raw, major, minor, revision and revisionStr attributes.
     * @type Object
     */
    var parseActiveXVersion = function(str){
        var versionArray = str.split(",");//replace with regex
        return {
            "raw":str,
            "major":parseInt(versionArray[0].split(" ")[1], 10),
            "minor":parseInt(versionArray[1], 10),
            "revision":parseInt(versionArray[2], 10),
            "revisionStr":versionArray[2]
        };
    };
    /**
     * Parse a standard enabledPlugin.description into an object.
     * 
     * @param {String} str The enabledPlugin.description value.
     * @return An object having raw, major, minor, revision and revisionStr attributes.
     * @type Object
     */
    var parseStandardVersion = function(str){
        var descParts = str.split(/ +/);
        var majorMinor = descParts[2].split(/\./);
        var revisionStr = descParts[3];
        return {
            "raw":str,
            "major":parseInt(majorMinor[0], 10),
            "minor":parseInt(majorMinor[1], 10), 
            "revisionStr":revisionStr,
            "revision":parseRevisionStrToInt(revisionStr)
        };
    };
    /**
     * Parse the plugin revision string into an integer.
     * 
     * @param {String} The revision in string format.
     * @type Number
     */
    var parseRevisionStrToInt = function(str){
        return parseInt(str.replace(/[a-zA-Z]/g, ""), 10) || self.revision;
    };
    /**
     * Is the major version greater than or equal to a specified version.
     * 
     * @param {Number} version The minimum required major version.
     * @type Boolean
     */
    self.majorAtLeast = function(version){
        return self.major >= version;
    };
    /**
     * Is the minor version greater than or equal to a specified version.
     * 
     * @param {Number} version The minimum required minor version.
     * @type Boolean
     */
    self.minorAtLeast = function(version){
        return self.minor >= version;
    };
    /**
     * Is the revision version greater than or equal to a specified version.
     * 
     * @param {Number} version The minimum required revision version.
     * @type Boolean
     */
    self.revisionAtLeast = function(version){
        return self.revision >= version;
    };
    /**
     * Is the version greater than or equal to a specified major, minor and revision.
     * 
     * @param {Number} major The minimum required major version.
     * @param {Number} (Optional) minor The minimum required minor version.
     * @param {Number} (Optional) revision The minimum required revision version.
     * @type Boolean
     */
    self.versionAtLeast = function(major){
        var properties = [self.major, self.minor, self.revision];
        var len = Math.min(properties.length, arguments.length);
        for(i=0; i<len; i++){
            if(properties[i]>=arguments[i]){
                if(i+1<len && properties[i]==arguments[i]){
                    continue;
                }else{
                    return true;
                }
            }else{
                return false;
            }
        }
    };
    /**
     * Constructor, sets raw, major, minor, revisionStr, revision and installed public properties.
     */
    self.FlashDetect = function(){
        if(navigator.plugins && navigator.plugins.length>0){
            var type = 'application/x-shockwave-flash';
            var mimeTypes = navigator.mimeTypes;
            if(mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description){
                var version = mimeTypes[type].enabledPlugin.description;
                var versionObj = parseStandardVersion(version);
                self.raw = versionObj.raw;
                self.major = versionObj.major;
                self.minor = versionObj.minor; 
                self.revisionStr = versionObj.revisionStr;
                self.revision = versionObj.revision;
                self.installed = true;
            }
        }else if(navigator.appVersion.indexOf("Mac")==-1 && window.execScript){
            var version = -1;
            for(var i=0; i<activeXDetectRules.length && version==-1; i++){
                var obj = getActiveXObject(activeXDetectRules[i].name);
                if(!obj.activeXError){
                    self.installed = true;
                    version = activeXDetectRules[i].version(obj);
                    if(version!=-1){
                        var versionObj = parseActiveXVersion(version);
                        self.raw = versionObj.raw;
                        self.major = versionObj.major;
                        self.minor = versionObj.minor; 
                        self.revision = versionObj.revision;
                        self.revisionStr = versionObj.revisionStr;
                    }
                }
            }
        }
    }();
};
FlashDetect.JS_RELEASE = "1.0.4";

