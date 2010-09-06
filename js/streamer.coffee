class Streamer
  constructor: (element) ->
    @playlist_url = element.getAttribute("rel")
    @element = element
    @volume = 100
    @songs = []

    if Streamer.isAudioURL @playlist_url
      @songs = [{
        url: @playlist_url,
        title: Streamer.extractFilename @playlist_url
      }]
      @buildPlayer()
    else
      @downloadPlaylist()

    @clickHandlers = [
      [ ".play", (e) => @togglePlay(e) ],
      [ ".stop", => @stop() ],
      [ ".next", => @next() ],
      [ ".previous", => @previous() ],
      [ ".volume", => @updateVolume() ]
    ]

    @element.observe "click", (e) =>
      for handler in @clickHandlers
        if elem = e.findElement handler[0]
          e.stop()
          handler[1].call elem, e

    @element.observe "click", (e) =>
      return unless a = e.findElement ".streamersong a"
      li = a.up "li"
      if soundManager.canPlayLink a
        e.stop()
        @changeSong li

  changeSong: (elem) ->
    @stop()
    @updateProgress()
    a = elem.down "a"

    soundManager.destroySound @activeSong.sID if @activeSong

    if soundManager.canPlayLink a
      elem.addClassName "active"
      @activeSong = soundManager.createSound {
        id: a.href,
        url: a.href,
        onfinish: => @next()
      }
      soundManager.setVolume @activeSong.sID, @volume
      @element.down(".title").innerHTML = a.innerHTML
      @play()
    else
      @displayError "Your browser can not play this audio flie"

  togglePlay: (elem) ->
    if !@activeSong or @activeSong.paused
      @play()
    else
      @pause()

  next: ->
    active = @element.down ".active"
    if !active
      @play()
    else if active.next()
      @changeSong active.next()
    else
      @stop()

  previous: ->
    active = @element.down ".active"
    if active and active.previous()
      @changeSong active.previous()

  play: ->
    if !@activeSong
      @changeSong @element.down(".streamersong")
    else
      soundManager.play @activeSong.sID
      @element.down(".play").addClassName "pause"
      @progressTimer = setInterval (=> @updateProgress), 500

  pause: ->
    if @activeSong
      soundManager.pause @activeSong.sID

    @element.down(".play").removeClassName "pause"
    clearInterval @progressTimer

  stop: ->
    if @activeSong
      @element.down(".active").removeClassName "active"
      @element.down(".title").innerHTML = ""
      @pause()
      soundManager.destroySound @activeSong.sID
      @activeSong = undefined
      @updateProgress()

    clearInterval @progressTimer

  updateProgress: ->
    width = 0
    if @activeSong
      width = (@activeSong.position / @activeSong.duration) / @progressWidth()

    @element.down(".progress").setStyle {width: width+"px"}

  downloadPlaylist: ->
    new Ajax.Request "playlist", {
      method: "get",
      parameters: {url: @playlist_url},
      onSuccess: (response) =>
        @parsePlaylist response.responseText
        @buildPlayer()
      onFailure: (response) =>
        @buildPlayer()
        @displayError "Could not get the playlist"
    }

  parsePlaylist: (xml) ->
    urls = xml.match /<location>.*?<\/location>/g
    titles = xml.match /<title>.*?<\/title>/g
    image = xml.match /<image>(.*?)<\/image>/

    @image = image[1] if image

    titles.shift()
    @songs = []
    for i in [0 .. urls.length - 1]
      url = urls[i].match /<location>(.*?)<\/location>/
      title = titles[i].match /<title>(.*?)<\/title>/
      @songs.push {url: url[1], title: "#{i+1}. #{title[1]}"}

  progressWidth: ->
    unless @_progressWidth
      @_progressWidth = @element.down(".bar").getWidth() - @element.down(".controls").getWidth()

    return @_progressWidth

  buildPlayer: ->
    @element.innerHTML = ""
    @element.insert {top: '<div class="bar"><div class="progress"></div><div class="controls"><span class="previous"></span><span class="stop"></span><span class="play"></span><span class="next"></span></div><div class="title"></div><div class="volume"><div class="volume_bg"></div></div></div>'}

    @element.insert "<img src=\"#{@image}\" />" if @image
    @element.insert "<ol></ol>"

    list = @element.down "ol"
    list.addClassName "noimage" unless @image
    list.addClassName "iphone" if Prototype.Browser.MobileSafari

    for song in @songs
      list.insert Streamer.songTemplate.evaluate song

    if @songs.length <= 1 and !@image
      @element.down(".title").innerHTML = @songs[0].title if @songs[0]
      @element.addClassName "singleSong"
      list.hide()

    soundManager.onerror = => @displayError "your browser can not play this file"

  displayError: (err) ->
    @element.down(".title").innerHTML = "<span class=\"error\">#{err} :-(</span>"

  updateVolume: (elem, event) ->
    x = event.clientX
    offset = elem.cumulativeOffset().left
    vol = x - offset
    elem.down(".volume_bg").setStyle {width: vol+"px"}
    @volume = (vol / 17) * 100

    soundManager.setVolume(@activeSong.sID, @volume) if @activeSong

Object.extend Streamer, {
  songTemplate: new Template('<li class="streamersong"><a href="#{url}" target="_blank">#{title}</a></li>'),
  mimeMap: {
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    mp4: "audio/mp4",
    ogg: "audio/ogg",
    oga: "audio/ogg",
    wav: "audio/x-wav",
    flac: "audio/flac"
  },
  extractFilename: (url) ->
    file = url.match(/([^\/]*)\.[\w\d]{3,4}$/)
    return file[1] if file
    return url

  isAudioURL: (url) ->
    Object.keys(Streamer.mimeMap).any (ext) ->
      re = new RegExp(".#{ext}$","i")
      return url.match(re)
}

document.observe "dom:loaded", ->
  for item in $$(".streamer")
    new Streamer item
