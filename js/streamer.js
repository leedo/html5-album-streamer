var Streamer = Class.create({
  initialize: function (element) {
    this.playlist_url = element.getAttribute("rel");
    this.element = element;
    try { new Audio(); }
    catch (err) {
      this.displayError("The &lt;audio&gt; element is not supported by your browser :-(");
      return;
    };
    this.songs = [];
    this.activeSong;
    this.progressTimer;
    this.songTemplate = new Template("<li class=\"streamersong\"><a href=\"#{url}\">#{title}</a></li>");
    this.refreshPlaylist();
    this.clickHandlers = [
      { select: ".streamersong", action: function (song) {this.changeSong(song)} },
      { select: ".play", action: function (song) {this.togglePlay(song)} },
      { select: ".stop", action: this.stop },
      { select: ".next", action: this.next },
      { select: ".previous", action: this.previous }
    ];
    this.element.observe("click", function (event) {
      for (var i=0; i < this.clickHandlers.length; i++) {
        var handler = this.clickHandlers[i];
        var elem = event.findElement(handler.select);
        if (elem) {
          event.stop();
          handler.action.call(this, elem);
          return;
        }
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
    this.activeSong.play();
    this.element.down(".play").addClassName("pause");
    this.progressTimer = setInterval(this.updateProgress.bind(this), 500);
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
    console.log(this.playlist_url);
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
      list.insert(this.songTemplate.evaluate(song));
    }.bind(this));
  },
  displayError: function (err) {
    this.element.innerHTML = "<div class=\"bar\"><div class=\"title error\">"+err+"</div></div>";
  }
});

document.observe("dom:loaded", function () {
  $$(".streamer").each(function (item) {
    new Streamer(item);
  })
});
