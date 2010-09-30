var Streamer = Class.create({

  initialize: function (element) {
    this.playlist_url = element.getAttribute("rel");
    this.element = element;
    this.element.addClassName("collapsed");
    this.volume = 100;
    this.songs = [];
    this.activeSong;
    this.progressTimer;

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
      [ ".volume_toggle", this.toggleVolume ],
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
    this.element.observe("mousedown", function(e) {
      var volume = e.findElement(".volume");
      if (volume) {
        var progress = volume.down(".volume_bg");
        var offset = volume.cumulativeOffset().top;
        var slider_offset = progress.down(".slider").getWidth() / 2;
        var height = volume.getHeight();

        var update = function(e) {
          var position = height - (e.pointerY() - offset - slider_offset);
          position = Math.max(0, position);
          position = Math.min(height, position);
          progress.setStyle({height: position+"px"});
        };

        update(e);
        document.observe("mousemove", update);
        document.observe("mouseup", function (e) {
          this.updateVolume(progress.getHeight() / height);
          document.stopObserving("mousemove");
          document.stopObserving("mouseup");
        }.bind(this));
      }
    }.bind(this));

    // progress slider setup

    this.element.observe("mousedown", function(e) {
      var bar = e.findElement(".bar");
      if (bar) {
        if (!this.activeSong) return;

        var progress = bar.down(".progress");
        var offset = progress.cumulativeOffset().left;
        var paused = this.activeSong.paused;
        var slider_offset = progress.down(".slider").getWidth() / 2;
        if (!paused) this.pause();

        var update = function (e) {
          var position = e.pointerX() - offset - slider_offset;
          position = Math.max(0, position);
          position = Math.min(this.progressWidth(), position);
          progress.setStyle({width: position+"px"});
        }.bind(this);

        update(e);

        document.observe("mousemove", update);
        document.observe("mouseup", function (e) {
          this.updatePosition(progress.getWidth() / this.progressWidth());
          if (!paused) this.play();
          document.stopObserving("mousemove");
          document.stopObserving("mouseup");
        }.bind(this));
      }
    }.bind(this));
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
      this.activeSong = soundManager.createSound({
        id: a.href,
        url: a.href,
        onfinish: this.next.bind(this)
      });
      soundManager.setVolume(this.activeSong.sID, this.volume);
      this.element.down(".title").innerHTML = a.innerHTML;
      this.play();
    }
    else {
      this.displayError("Your browser can not play this audio file");
    }
  },

  togglePlay: function (elem) {
    if (!this.activeSong || (this.activeSong && this.activeSong.paused))
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
      this.progressTimer = setInterval(this.updateProgress.bind(this), 500);
    }
  },

  pause: function () {
    if (this.activeSong)
      soundManager.pause(this.activeSong.sID);

    this.element.down(".play").removeClassName("active");
    clearInterval(this.progressTimer);
  },

  stop: function () {
    if (this.activeSong) {
      this.element.down("li.active").removeClassName("active");
      this.element.down(".title").innerHTML = "Not playing";
      this.pause();
      soundManager.destroySound(this.activeSong.sID);
      this.activeSong = undefined;
      this.updateProgress();
    }

    clearInterval(this.progressTimer);
  },

  updateProgress: function () {
    var width = 0;
    if (this.activeSong) {
      width = (this.activeSong.position / this.activeSong.duration)
              * this.progressWidth();
    }
    this.element.down(".progress").setStyle({width: width+"px"});
  },

  updatePosition: function (percentage) {
    if (this.activeSong) {
      var duration = this.activeSong.duration;
      this.activeSong.setPosition(duration * percentage);
    }
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
    if (!this._progressWidth)
      this._progressWidth = this.element.down(".bar").getWidth();
    return this._progressWidth;
  },

  buildPlayer: function () {
    this.element.innerHTML = "";
    this.element.insert({top: '<div class="controls"><button class="previous"></button><button class="play"></button><button class="next"></button><div class="title">Not playing</div><button class="volume_toggle"><div class="volume"><div class="volume_bg"><div class="slider"></div></div></div></button><button class="playlist" title="toggle playlist"></button></div><div class="bar"><div class="progress"><div class="slider"></div></div></div>'});
    
    this.refreshSongs();
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
    }
  },

  updateVolume: function (percent) {
    this.volume = percent * 100;
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

document.observe("dom:loaded", function () {
  $$(".streamer").each(function (item) {
    new Streamer(item);
  })
});
