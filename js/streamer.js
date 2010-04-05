var Streamer = Class.create({
  initialize: function (element) {
    this.playlist_url = element.getAttribute("rel");
    this.element = element;
    this.songs = [];
    this.activeSong;
    this.progressTimer;
    this.pauseText = "&#10074;&#10074;";
    this.playText = "&#9658;";
    this.songTemplate = new Template("<li><a class=\"streamersong\" href=\"#{url}\">#{title}</a></li>");
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
    }.bind(this));
  },
  changeSong: function (elem) {
    this.stop();
    elem.addClassName("active");
    this.updateProgress();
    this.activeSong = new Audio(elem.href);
    this.element.down(".title").innerHTML = elem.innerHTML;
    this.play();
  },
  togglePlay: function (elem) {
    if (!this.activeSong || (this.activeSong && this.activeSong.paused))
      this.play();
    else
      this.pause();
  },
  play: function () {
    if (!this.activeSong)
      this.changeSong(this.element.down("a.streamersong"));
    this.activeSong.play();
    this.element.down(".play").innerHTML = this.pauseText;
    this.progressTimer = setInterval(this.updateProgress.bind(this), 500);
  },
  pause: function () {
    if (this.activeSong) this.activeSong.pause();
    this.element.down(".play").innerHTML = this.playText;
    clearInterval(this.progressTimer);
  },
  stop: function () {
    if (this.activeSong) {
      this.element.down(".active").removeClassName("active");
      this.pause();
      if (this.activeSong.currentTime) this.activeSong.currentTime = 0;
    }
    clearInterval(this.progressTimer);
  },
  updateProgress: function () {
    var width = 0;
    if (this.activeSong)
      width = (this.activeSong.currentTime / this.activeSong.duration) * 100;
    this.element.down(".progress").setStyle({
      width: width + "%"
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
    this.element.insert({top: "<div class=\"bar\"><div class=\"progress\"></div><div class=\"controls\"><span class=\"play\">&#9658;</span></div><div class=\"title\"></div></div>"});
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