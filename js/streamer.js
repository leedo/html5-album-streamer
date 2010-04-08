var Streamer = Class.create({
  initialize: function (element) {
    this.playlist_url = element.getAttribute("rel");
    this.element = element;
    this.songs = [];
    this.activeSong;
    this.progressTimer;
    this.refreshPlaylist();
    this.clickHandlers = [
      [ ".streamersong", function(e){this.changeSong(e)} ],
      [ ".play", function(e){this.togglePlay(e)} ],
      [ ".stop", this.stop ],
      [ ".next", this.next ],
      [ ".previous", this.previous ]
    ];
    this.element.observe("click", function (event) {
      this.clickHandlers.each(function (handler) {
        var elem = event.findElement(handler[0]);
        if (elem) {
          event.stop();
          handler[1].call(this, elem);
        }
      }.bind(this));
    }.bind(this));
  },
  changeSong: function (elem) {
    this.stop();
    this.updateProgress();
    var a = elem.down('a');
    var mime = Streamer.getMime(a.href);
    if (Streamer.canPlayType(mime)) {
      elem.addClassName("active");
      this.activeSong = document.createElement('audio');
      this.activeSong.src = a.href;
      this.activeSong.observe("ended", this.next.bind(this));
      this.element.down(".title").innerHTML = a.innerHTML;
      this.play();
    }
    else {
      this.displayError("Your browser can not play "+mime+" files");
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
    else if (active.next()) {
      this.changeSong(active.next());
    }
    else {
      this.stop();
    }
  },
  previous: function () {
    var active = this.element.down(".active");
    if (active && active.previous())
      this.changeSong(active.previous());
  },
  play: function () {
    if (!this.activeSong)
      this.changeSong(this.element.down(".streamersong"));
    if (this.activeSong) {
      this.activeSong.play();
      this.element.down(".play").addClassName("pause");
      this.progressTimer = setInterval(this.updateProgress.bind(this), 500);
    }
  },
  pause: function () {
    if (this.activeSong) this.activeSong.pause();
    this.element.down(".play").removeClassName("pause");
    clearInterval(this.progressTimer);
  },
  stop: function () {
    if (this.activeSong) {
      this.element.down(".active").removeClassName("active");
      this.element.down(".title").innerHTML = "";
      this.pause();
      if (this.activeSong.currentTime) this.activeSong.currentTime = 0;
      this.activeSong = undefined;
      this.updateProgress();
    }
    clearInterval(this.progressTimer);
  },
  updateProgress: function () {
    var width = 0;
    if (this.activeSong)
      width = (this.activeSong.currentTime / this.activeSong.duration) * 250;
    this.element.down(".progress").setStyle({
      width: width + "px"
    });
  },
  refreshPlaylist: function () {
    new Ajax.Request("/playlist", {
      method: "get",
      parameters: {url: this.playlist_url},
      onSuccess: function (response) {
        this.parsePlaylist(response.responseText);
        this.initPlayer();
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
    for (var i=0; i < urls.length; i++) {
      var url = urls[i].match(/<location>(.*?)<\/location>/);
      var title = titles[i].match(/<title>(.*?)<\/title>/);
      this.songs.push({url: url[1], title: (i+1)+". "+title[1]});
    }
  },
  initPlayer: function () {
    this.element.insert({top: "<div class=\"bar\"><div class=\"progress\"></div><div class=\"controls\"><span class=\"previous\"></span><span class=\"stop\"></span><span class=\"play\"></span><span class=\"next\"></span></div><div class=\"title\"></div></div>"});
    if (this.image)
      this.element.insert("<img src=\""+this.image+"\" />");
    this.element.insert("<ol></ol>");
    var list = this.element.down("ol");
    this.songs.each(function (song) {
      list.insert(Streamer.songTemplate.evaluate(song));
    }.bind(this));
    if (!Streamer.canPlayAudio())
      this.displayError("The &lt;audio&gt; element is not supported by your browser");
  },
  displayError: function (err) {
    this.element.down(".title").innerHTML = "<span class=\"error\">"+err+" :-(</span>";
  }
});

Object.extend(Streamer, {
  songTemplate: new Template("<li class=\"streamersong\"><a href=\"#{url}\">#{title}</a></li>"),
  mimeMap: {
    mp3: "audio/mpeg3",
    ogg: "audio/ogg",
    oga: "audio/ogg",
    wav: "audio/x-wav",
    flac: "audio/flac"
  },
  canPlayType: function (mime) {
    var elem = document.createElement('audio');
    if (elem.canPlayType) {
      var r = elem.canPlayType(mime);
      return r == 'maybe' || r == 'probably';
    }
    return false;
  },
  canPlayAudio: function () {
    var elem = document.createElement('audio');
    return !!elem.canPlayType;
  },
  getMime: function (href) {
    var ext = href.match(/.*\.(.+?)(?:$|\?)/);
    if (ext) {
      return Streamer.mimeMap[ext[1]];
    }
  },
});

document.observe("dom:loaded", function () {
  $$(".streamer").each(function (item) {
    new Streamer(item);
  })
});
