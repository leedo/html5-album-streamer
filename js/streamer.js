var Streamer;
var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
Streamer = function(element) {
  this.playlist_url = element.getAttribute("rel");
  this.element = element;
  this.volume = 100;
  this.songs = [];
  if (Streamer.isAudioURL(this.playlist_url)) {
    this.songs = [
      {
        url: this.playlist_url,
        title: Streamer.extractFilename(this.playlist_url)
      }
    ];
    this.buildPlayer();
  } else {
    this.downloadPlaylist();
  }
  this.clickHandlers = [
    [
      ".play", __bind(function(e) {
        return this.togglePlay(e);
      }, this)
    ], [
      ".stop", __bind(function() {
        return this.stop();
      }, this)
    ], [
      ".next", __bind(function() {
        return this.next();
      }, this)
    ], [
      ".previous", __bind(function() {
        return this.previous();
      }, this)
    ], [
      ".volume", __bind(function() {
        return this.updateVolume();
      }, this)
    ]
  ];
  this.element.observe("click", __bind(function(e) {
    var _a, _b, _c, _d, elem, handler;
    _a = []; _c = this.clickHandlers;
    for (_b = 0, _d = _c.length; _b < _d; _b++) {
      handler = _c[_b];
      _a.push((function() {
        if (elem = e.findElement(handler[0])) {
          e.stop();
          return handler[1].call(elem, e);
        }
      })());
    }
    return _a;
  }, this));
  this.element.observe("click", __bind(function(e) {
    var a, li;
    if (!(a = e.findElement(".streamersong a"))) {
      return null;
    }
    li = a.up("li");
    if (soundManager.canPlayLink(a)) {
      e.stop();
      return this.changeSong(li);
    }
  }, this));
  return this;
};
Streamer.songTemplate = new Template('<li class="streamersong"><a href="#{url}" target="_blank">#{title}</a></li>');
Streamer.mimeMap = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  wav: "audio/x-wav",
  flac: "audio/flac"
};
Streamer.extractFilename = function(url) {
  var file;
  file = url.match(/([^\/]*)\.[\w\d]{3,4}$/);
  if (file) {
    return file[1];
  }
  return url;
};
Streamer.isAudioURL = function(url) {
  return Object.keys(Streamer.mimeMap).any(function(ext) {
    var re;
    re = new RegExp("." + (ext) + "$", "i");
    return url.match(re);
  });
};
Streamer.prototype.changeSong = function(elem) {
  var a;
  this.stop();
  this.updateProgress();
  a = elem.down("a");
  if (this.activeSong) {
    soundManager.destroySound(this.activeSong.sID);
  }
  if (soundManager.canPlayLink(a)) {
    elem.addClassName("active");
    this.activeSong = soundManager.createSound({
      id: a.href,
      url: a.href,
      onfinish: __bind(function() {
        return this.next();
      }, this)
    });
    soundManager.setVolume(this.activeSong.sID, this.volume);
    this.element.down(".title").innerHTML = a.innerHTML;
    return this.play();
  } else {
    return this.displayError("Your browser can not play this audio flie");
  }
};
Streamer.prototype.togglePlay = function(elem) {
  return !this.activeSong || this.activeSong.paused ? this.play() : this.pause();
};
Streamer.prototype.next = function() {
  var active;
  active = this.element.down(".active");
  if (!active) {
    return this.play();
  } else if (active.next()) {
    return this.changeSong(active.next());
  } else {
    return this.stop();
  }
};
Streamer.prototype.previous = function() {
  var active;
  active = this.element.down(".active");
  return active && active.previous() ? this.changeSong(active.previous()) : null;
};
Streamer.prototype.play = function() {
  if (!this.activeSong) {
    return this.changeSong(this.element.down(".streamersong"));
  } else {
    soundManager.play(this.activeSong.sID);
    this.element.down(".play").addClassName("pause");
    return (this.progressTimer = setInterval(__bind(function() {
      return this.updateProgress;
    }, this), 500));
  }
};
Streamer.prototype.pause = function() {
  if (this.activeSong) {
    soundManager.pause(this.activeSong.sID);
  }
  this.element.down(".play").removeClassName("pause");
  return clearInterval(this.progressTimer);
};
Streamer.prototype.stop = function() {
  if (this.activeSong) {
    this.element.down(".active").removeClassName("active");
    this.element.down(".title").innerHTML = "";
    this.pause();
    soundManager.destroySound(this.activeSong.sID);
    this.activeSong = undefined;
    this.updateProgress();
  }
  return clearInterval(this.progressTimer);
};
Streamer.prototype.updateProgress = function() {
  var width;
  width = 0;
  if (this.activeSong) {
    width = (this.activeSong.position / this.activeSong.duration) / this.progressWidth();
  }
  return this.element.down(".progress").setStyle({
    width: width + "px"
  });
};
Streamer.prototype.downloadPlaylist = function() {
  return new Ajax.Request("playlist", {
    method: "get",
    parameters: {
      url: this.playlist_url
    },
    onSuccess: __bind(function(response) {
      this.parsePlaylist(response.responseText);
      return this.buildPlayer();
    }, this),
    onFailure: __bind(function(response) {
      this.buildPlayer();
      return this.displayError("Could not get the playlist");
    }, this)
  });
};
Streamer.prototype.parsePlaylist = function(xml) {
  var _a, i, image, title, titles, url, urls;
  urls = xml.match(/<location>.*?<\/location>/g);
  titles = xml.match(/<title>.*?<\/title>/g);
  image = xml.match(/<image>(.*?)<\/image>/);
  if (image) {
    this.image = image[1];
  }
  titles.shift();
  this.songs = [];
  _a = [];
  for (i = 0; (0 <= urls.length - 1 ? i <= urls.length - 1 : i >= urls.length - 1); (0 <= urls.length - 1 ? i += 1 : i -= 1)) {
    _a.push((function() {
      url = urls[i].match(/<location>(.*?)<\/location>/);
      title = titles[i].match(/<title>(.*?)<\/title>/);
      return this.songs.push({
        url: url[1],
        title: ("" + (i + 1) + ". " + (title[1]))
      });
    }).call(this));
  }
  return _a;
};
Streamer.prototype.progressWidth = function() {
  if (!(this._progressWidth)) {
    this._progressWidth = this.element.down(".bar").getWidth() - this.element.down(".controls").getWidth();
  }
  return this._progressWidth;
};
Streamer.prototype.buildPlayer = function() {
  var _a, _b, _c, list, song;
  this.element.innerHTML = "";
  this.element.insert({
    top: '<div class="bar"><div class="progress"></div><div class="controls"><span class="previous"></span><span class="stop"></span><span class="play"></span><span class="next"></span></div><div class="title"></div><div class="volume"><div class="volume_bg"></div></div></div>'
  });
  if (this.image) {
    this.element.insert("<img src=\"" + (this.image) + "\" />");
  }
  this.element.insert("<ol></ol>");
  list = this.element.down("ol");
  if (!(this.image)) {
    list.addClassName("noimage");
  }
  if (Prototype.Browser.MobileSafari) {
    list.addClassName("iphone");
  }
  _b = this.songs;
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    song = _b[_a];
    list.insert(Streamer.songTemplate.evaluate(song));
  }
  if ((this.songs.length <= 1) && !this.image) {
    if (this.songs[0]) {
      this.element.down(".title").innerHTML = this.songs[0].title;
    }
    this.element.addClassName("singleSong");
    list.hide();
  }
  return (soundManager.onerror = __bind(function() {
    return this.displayError("your browser can not play this file");
  }, this));
};
Streamer.prototype.displayError = function(err) {
  return (this.element.down(".title").innerHTML = ("<span class=\"error\">" + (err) + " :-(</span>"));
};
Streamer.prototype.updateVolume = function(elem, event) {
  var offset, vol, x;
  x = event.clientX;
  offset = elem.cumulativeOffset().left;
  vol = x - offset;
  elem.down(".volume_bg").setStyle({
    width: vol + "px"
  });
  this.volume = (vol / 17) * 100;
  if (this.activeSong) {
    return soundManager.setVolume(this.activeSong.sID, this.volume);
  }
};
document.observe("dom:loaded", function() {
  var _a, _b, _c, _d, item;
  _a = []; _c = $$(".streamer");
  for (_b = 0, _d = _c.length; _b < _d; _b++) {
    item = _c[_b];
    _a.push(new Streamer(item));
  }
  return _a;
});