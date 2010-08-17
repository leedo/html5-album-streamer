var Streamer = Class.create({

  initialize: function (element) {
    this.playlist_url = element.getAttribute("rel");
    this.element = element;
    this.volume = 100;
    this.songs = [];
    this.activeSong;
    this.progressTimer;

    // check if the url is just a link to a single
    // audio file and not a playlist

    if (Streamer.isAudioURL(this.playlist_url)) {
      var filename = Streamer.extractFilename(this.playlist_url);
      this.songs = [{url: this.playlist_url, title: filename}];
      this.buildPlayer();
    } else {
      this.downloadPlaylist();
    }

    // setup handlers for play/pause/stop buttons

    this.clickHandlers = [
      [ ".play", function(e){this.togglePlay(e)} ],
      [ ".stop", this.stop ],
      [ ".next", this.next ],
      [ ".previous", this.previous ],
      [ ".volume", this.updateVolume ]
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
  },

  changeSong: function (elem) {
    this.stop();
    this.updateProgress();
    var a = elem.down('a');

    if (this.activeSong)
      soundManager.destroySound(this.activeSong.sID);

    if (soundManager.canPlayLink(a)) {
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
    var active = this.element.down(".active");
    if (!active)
      this.play();
    else if (active.next())
      this.changeSong(active.next());
    else
      this.stop();
  },

  previous: function () {
    var active = this.element.down(".active");
    if (active && active.previous())
      this.changeSong(active.previous());
  },

  play: function () {
    if (!this.activeSong) {
      this.changeSong(this.element.down(".streamersong"));
    }
    else {
      soundManager.play(this.activeSong.sID);
      this.element.down(".play").addClassName("pause");
      this.progressTimer = setInterval(this.updateProgress.bind(this), 500);
    }
  },

  pause: function () {
    if (this.activeSong)
      soundManager.pause(this.activeSong.sID);

    this.element.down(".play").removeClassName("pause");
    clearInterval(this.progressTimer);
  },

  stop: function () {
    if (this.activeSong) {
      this.element.down(".active").removeClassName("active");
      this.element.down(".title").innerHTML = "";
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

  downloadPlaylist: function () {
    new Ajax.Request("/playlist", {
      method: "get",
      parameters: {url: this.playlist_url},
      onSuccess: function (response) {
        this.parsePlaylist(response.responseText);
        this.buildPlayer();
      }.bind(this),
      onFailure: function (response) {
        this.displayError("Could not get the playlist");
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
      this.songs.push({url: url[1], title: (i+1)+". "+title[1]});
    }
  },

  progressWidth: function () {
    if (!this._progressWidth)
      this._progressWidth = this.element.down(".bar").getWidth() - this.element.down(".controls").getWidth();
    return this._progressWidth;
  },

  buildPlayer: function () {
    this.element.innerHTML = "";
    this.element.insert({top: '<div class="bar"><div class="progress"></div><div class="controls"><span class="previous"></span><span class="stop"></span><span class="play"></span><span class="next"></span></div><div class="title"></div><div class="volume"><div class="volume_bg"></div></div></div>'});
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
      this.element.down(".title").innerHTML = this.songs[0].title;
      this.element.addClassName("singlesong");
      list.hide();
    }

    soundManager.onerror = function() {
      this.displayError("The &lt;audio&gt; element is not supported by your browser");
    };
  },

  displayError: function (err) {
    this.element.down(".title").innerHTML = "<span class=\"error\">"+err+" :-(</span>";
  },

  updateVolume: function (elem, event) {
    var x = event.clientX;
    var offset = elem.cumulativeOffset().left;
    var vol = x - offset;
    elem.down(".volume_bg").setStyle({width: vol+"px"});
    this.volume = (vol / 17) * 100;
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
