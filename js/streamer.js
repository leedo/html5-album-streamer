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

  updatePosition: function (e) {
    if (!this.activeSong) return;

    var bar = this.element.down(".bar");
    var progress = bar.down(".progress");
    var offset = progress.cumulativeOffset().left;

    var position = e.pointerX() - offset;
    position = Math.max(0, position);
    position = Math.min(this.progressWidth(), position);
    progress.setStyle({width: position+"px"});

    var duration = this.activeSong.duration;
    this.activeSong.setPosition(duration * (position / this.progressWidth()));
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
    this.element.insert({top: '<div class="controls"><div class="button previous"></div><div class="button play"></div><div class="button next"></div><div class="title">Not playing</div><div class="button volume_toggle"><div class="volume_container"><div class="volume"><div class="volume_bg"><div class="slider"></div></div></div></div></div><div class="button playlist" title="toggle playlist"></div></div><div class="bar"><div class="progress"><div class="slider"></div></div></div>'});
    
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

document.observe("dom:loaded", function () {
  $$(".streamer").each(function (item) {
    new Streamer(item);
  })
});
