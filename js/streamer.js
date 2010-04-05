var Streamer = Class.create({
  initialize: function (element) {
    this.playlist_url = element.getAttribute("rel");
    this.element = element;
    this.songs = [];
    this.activeSong;
    this.progressTimer;
    this.songTemplate = new Template("<li class=\"streamersong\"><a href=\"#{url}\">#{title}</a></li>");
    this.refreshPlaylist();
    document.observe("click", function (event) {
      var song = event.findElement(".streamersong");
      if (song && song.descendantOf(this.element)) {
        event.stop();
        this.changeSong(song);
        return;
      }
      var play = event.findElement(".play");
      if (play && play.descendantOf(this.element)) {
        event.stop();
        this.togglePlay(play);
        return;
      }
      var stop = event.findElement(".stop");
      if (stop && stop.descendantOf(this.element)) {
        event.stop();
        this.stop();
        return;
      }
      var next = event.findElement(".next");
      if (next && next.descendantOf(this.element)) {
        event.stop();
        this.next();
        return;
      }
      var prev = event.findElement(".previous");
      if (prev && prev.descendantOf(this.element)) {
        event.stop();
        this.previous();
        return;
      }
    }.bind(this));
  },
  changeSong: function (elem) {
    this.stop();
    elem.addClassName("active");
    this.updateProgress();
    this.activeSong = new Audio(elem.down("a").href);
    this.activeSong.observe("ended", this.next.bind(this));
    this.element.down(".title").innerHTML = elem.down("a").innerHTML;
    this.play();
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
    else {
      this.changeSong(active.next());
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
    this.activeSong.play();
    this.element.down(".play").addClassName("pause");
    this.progressTimer = setInterval(this.updateProgress.bind(this), 500);
  },
  pause: function () {
    if (this.activeSong) this.activeSong.pause();
    this.element.down(".pause").removeClassName("pause");
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
    console.log(this.playlist_url);
    new Ajax.Request("/playlist", {
      method: "get",
      parameters: {url: this.playlist_url},
      onSuccess: function (response) {
        this.songs = this.parsePlaylist(response.responseText);
        this.initPlayer();
      }.bind(this),
      onFailure: function (response) {
        //console.log("error");
      }
    })
  },
  parsePlaylist: function (xml) {
    var urls = xml.match(/<location>.*?<\/location>/g);
    var titles = xml.match(/<title>.*?<\/title>/g);
    titles.shift(); // get rid of feed title
    var ret = [];
    for (var i=0; i < urls.length; i++) {
      var url = urls[i].match(/<location>(.*?)<\/location>/);
      var title = titles[i].match(/<title>(.*?)<\/title>/);
      ret.push({url: url[1], title: (i+1)+". "+title[1]});
    }
    return ret;
  },
  initPlayer: function () {
    this.element.insert({top: "<div class=\"bar\"><div class=\"progress\"></div><div class=\"controls\"><span class=\"previous\"></span><span class=\"stop\"></span><span class=\"play\"></span><span class=\"next\"></span></div><div class=\"title\"></div></div>"});
    this.element.insert("<ol></ol>");
    var list = this.element.down("ol");
    this.songs.each(function (song) {
      list.insert(this.songTemplate.evaluate(song));
    }.bind(this));
  }
});

document.observe("dom:loaded", function () {
  $$(".streamer").each(function (item) {
    new Streamer(item);
  })
});