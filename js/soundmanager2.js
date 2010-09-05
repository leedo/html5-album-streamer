/*

 SoundManager 2: Javascript Sound for the Web
 --------------------------------------------
 http://schillmania.com/projects/soundmanager2/

 Copyright (c) 2007, Scott Schiller. All rights reserved.
 Code provided under the BSD License:
 http://schillmania.com/projects/soundmanager2/license.txt

 V2.96a.20100822+DEV
*/
(function(j){function ga(xa,ya){function ha(){if(b.debugURLParam.test(N))b.debugMode=true}this.flashVersion=8;this.debugFlash=this.debugMode=false;this.useConsole=true;this.waitForWindowLoad=this.consoleOnly=false;this.nullURL="about:blank";this.allowPolling=true;this.useFastPolling=false;this.useMovieStar=true;this.bgColor="#ffffff";this.useHighPerformance=false;this.flashLoadTimeout=1E3;this.wmode=null;this.allowFullScreen=true;this.allowScriptAccess="always";this.useHTML5Audio=this.useFlashBlock=
false;this.html5Test=/^probably$/i;this.audioFormats={mp3:{type:['audio/mpeg; codecs="mp3"',"audio/mpeg","audio/mp3","audio/MPA","audio/mpa-robust"],required:true},mp4:{related:["aac","m4a"],type:['audio/mp4; codecs="mp4a.40.2"',"audio/aac","audio/x-m4a","audio/MP4A-LATM","audio/mpeg4-generic"],required:true},ogg:{type:["audio/ogg; codecs=vorbis"],required:false},wav:{type:['audio/wav; codecs="1"',"audio/wav","audio/wave","audio/x-wav"],required:false}};this.defaultOptions={autoLoad:false,stream:true,
autoPlay:false,loops:1,onid3:null,onload:null,whileloading:null,onplay:null,onpause:null,onresume:null,whileplaying:null,onstop:null,onfinish:null,onbeforefinish:null,onbeforefinishtime:5E3,onbeforefinishcomplete:null,onjustbeforefinish:null,onjustbeforefinishtime:200,multiShot:true,multiShotEvents:false,position:null,pan:0,type:null,volume:100};this.flash9Options={isMovieStar:null,usePeakData:false,useWaveformData:false,useEQData:false,onbufferchange:null,ondataerror:null};this.movieStarOptions=
{onmetadata:null,useVideo:false,bufferTime:3,serverURL:null,onconnect:null};this.version=null;this.versionNumber="V2.96a.20100822+DEV";this.movieURL=null;this.url=xa||null;this.altURL=null;this.enabled=this.swfLoaded=false;this.o=null;this.movieID="sm2-container";this.id=ya||"sm2movie";this.swfCSS={swfDefault:"movieContainer",swfError:"swf_error",swfTimedout:"swf_timedout",swfUnblocked:"swf_unblocked",sm2Debug:"sm2_debug",highPerf:"high_performance",flashDebug:"flash_debug"};this.oMC=null;this.sounds=
{};this.soundIDs=[];this.isFullScreen=this.muted=false;this.isIE=navigator.userAgent.match(/MSIE/i);this.isSafari=navigator.userAgent.match(/safari/i);this.debugID="soundmanager-debug";this.debugURLParam=/([#?&])debug=1/i;this.didFlashBlock=this.specialWmodeCase=false;this.filePattern=null;this.filePatterns={flash8:/\.mp3(\?.*)?$/i,flash9:/\.mp3(\?.*)?$/i};this.baseMimeTypes=/^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i;this.netStreamMimeTypes=/^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i;this.netStreamTypes=
["aac","flv","mov","mp4","m4v","f4v","m4a","mp4v","3gp","3g2"];this.netStreamPattern=RegExp("\\.("+this.netStreamTypes.join("|")+")(\\?.*)?$","i");this.mimePattern=this.baseMimeTypes;this.features={buffering:false,peakData:false,waveformData:false,eqData:false,movieStar:false};this.sandbox={type:null,types:{remote:"remote (domain-based) rules",localWithFile:"local with file access (no internet access)",localWithNetwork:"local with network (internet access only, no local access)",localTrusted:"local, trusted (local+internet access)"},
description:null,noRemote:null,noLocal:null};this.hasHTML5=null;this.html5={usingFlash:null};this.ignoreFlash=false;var W,b=this,y,t=navigator.userAgent,N=j.location.href.toString(),k=this.flashVersion,ia,O,z=[],E=false,F=false,p=false,v=false,ja=false,G,q,ka,A,B,la,X,Y,w,ma,P,Q,H,Z,na,R,$,oa,pa,I,qa,J=null,aa=null,K,ba,L,S,ca,n,T=false,da=false,ra,sa,C=null,ta,U,x=false,M,u,ea,ua,va=t.match(/pre\//i),za=t.match(/(ipad|iphone)/i);t.match(/mobile/i);var fa=typeof document.hasFocus!=="undefined"?document.hasFocus():
null,D=typeof document.hasFocus==="undefined"&&this.isSafari,wa=!D;this._use_maybe=N.match(/sm2\-useHTML5Maybe\=1/i);this._overHTTP=document.location?document.location.protocol.match(/http/i):null;this.useAltURL=!this._overHTTP;if(za||va){b.useHTML5Audio=true;b.ignoreFlash=true}if(va||this._use_maybe)b.html5Test=/^(probably|maybe)$/i;this.supported=function(){return C?p&&!v:b.useHTML5Audio&&b.hasHTML5};this.getMovie=function(c){return b.isIE?j[c]:b.isSafari?y(c)||document[c]:y(c)};this.loadFromXML=
function(c){try{b.o._loadFromXML(c)}catch(a){I();return true}};this.createSound=function(c){function a(){f=S(f);b.sounds[e.id]=new W(e);b.soundIDs.push(e.id);return b.sounds[e.id]}var f=null,g=null,e=null;if(!p)throw ca("soundManager.createSound(): "+K("notReady"),arguments.callee.caller);if(arguments.length===2)c={id:arguments[0],url:arguments[1]};e=f=q(c);if(n(e.id,true))return b.sounds[e.id];if(U(e)){g=a();g._setup_html5(e)}else{if(k>8&&b.useMovieStar){if(e.isMovieStar===null)e.isMovieStar=e.serverURL||
(e.type?e.type.match(b.netStreamPattern):false)||e.url.match(b.netStreamPattern)?true:false;if(e.isMovieStar)if(e.usePeakData)e.usePeakData=false}g=a();if(k===8)b.o._createSound(e.id,e.onjustbeforefinishtime,e.loops||1);else{b.o._createSound(e.id,e.url,e.onjustbeforefinishtime,e.usePeakData,e.useWaveformData,e.useEQData,e.isMovieStar,e.isMovieStar?e.useVideo:false,e.isMovieStar?e.bufferTime:false,e.loops||1,e.serverURL,e.duration||null,e.totalBytes||null,e.autoPlay,true);if(!e.serverURL){g.connected=
true;e.onconnect&&e.onconnect.apply(g)}}}if(e.autoLoad||e.autoPlay)if(g)if(b.isHTML5){g.autobuffer="auto";g.preload="auto"}else g.load(e);e.autoPlay&&g.play();return g};this.createVideo=function(c){if(arguments.length===2)c={id:arguments[0],url:arguments[1]};if(k>=9){c.isMovieStar=true;c.useVideo=true}else return false;return b.createSound(c)};this.destroyVideo=this.destroySound=function(c,a){if(!n(c))return false;var f=b.sounds[c],g;f.stop();f.unload();for(g=0;g<b.soundIDs.length;g++)if(b.soundIDs[g]===
c){b.soundIDs.splice(g,1);break}a||f.destruct(true);delete b.sounds[c];return true};this.load=function(c,a){if(!n(c))return false;return b.sounds[c].load(a)};this.unload=function(c){if(!n(c))return false;return b.sounds[c].unload()};this.start=this.play=function(c,a){if(!p)throw ca("soundManager.play(): "+K("notReady"),arguments.callee.caller);if(!n(c)){a instanceof Object||(a={url:a});if(a&&a.url){a.id=c;return b.createSound(a).play()}else return false}return b.sounds[c].play(a)};this.setPosition=
function(c,a){if(!n(c))return false;return b.sounds[c].setPosition(a)};this.stop=function(c){if(!n(c))return false;return b.sounds[c].stop()};this.stopAll=function(){for(var c in b.sounds)b.sounds[c]instanceof W&&b.sounds[c].stop()};this.pause=function(c){if(!n(c))return false;return b.sounds[c].pause()};this.pauseAll=function(){for(var c=b.soundIDs.length;c--;)b.sounds[b.soundIDs[c]].pause()};this.resume=function(c){if(!n(c))return false;return b.sounds[c].resume()};this.resumeAll=function(){for(var c=
b.soundIDs.length;c--;)b.sounds[b.soundIDs[c]].resume()};this.togglePause=function(c){if(!n(c))return false;return b.sounds[c].togglePause()};this.setPan=function(c,a){if(!n(c))return false;return b.sounds[c].setPan(a)};this.setVolume=function(c,a){if(!n(c))return false;return b.sounds[c].setVolume(a)};this.mute=function(c){var a=0;if(typeof c!=="string")c=null;if(c){if(!n(c))return false;return b.sounds[c].mute()}else{for(a=b.soundIDs.length;a--;)b.sounds[b.soundIDs[a]].mute();b.muted=true}};this.muteAll=
function(){b.mute()};this.unmute=function(c){if(typeof c!=="string")c=null;if(c){if(!n(c))return false;return b.sounds[c].unmute()}else{for(c=b.soundIDs.length;c--;)b.sounds[b.soundIDs[c]].unmute();b.muted=false}};this.unmuteAll=function(){b.unmute()};this.toggleMute=function(c){if(!n(c))return false;return b.sounds[c].toggleMute()};this.getMemoryUse=function(){if(k===8)return 0;if(b.o)return parseInt(b.o._getMemoryUse(),10)};this.disable=function(c){if(typeof c==="undefined")c=false;if(v)return false;
v=true;for(var a=b.soundIDs.length;a--;)pa(b.sounds[b.soundIDs[a]]);G(c);j.removeEventListener&&j.removeEventListener("load",B,false)};this.canPlayMIME=function(c){var a;if(b.hasHTML5)a=M({type:c});return!C||a?a:c?c.match(b.mimePattern)?true:false:null};this.canPlayURL=function(c){var a;if(b.hasHTML5)a=M(c);return!C||a?a:c?c.match(b.filePattern)?true:false:null};this.canPlayLink=function(c){if(typeof c.type!=="undefined"&&c.type)if(b.canPlayMIME(c.type))return true;return b.canPlayURL(c.href)};this.getSoundById=
function(c){if(!c)throw Error("SoundManager.getSoundById(): sID is null/undefined");return b.sounds[c]};this.onready=function(c,a){if(c&&c instanceof Function){a||(a=j);ka(c,a);A();return true}else throw K("needFunction");};this.oninitmovie=function(){};this.onload=function(){};this.onerror=function(){};this.getMoviePercent=function(){return b.o&&typeof b.o.PercentLoaded!=="undefined"?b.o.PercentLoaded():null};this._wD=this._writeDebug=function(){};this._debug=function(){};this.reboot=function(){for(var c=
b.soundIDs.length;c--;)b.sounds[b.soundIDs[c]].destruct();try{if(b.isIE)aa=b.o.innerHTML;J=b.o.parentNode.removeChild(b.o)}catch(a){}J=aa=null;v=F=E=da=T=p=b.enabled=false;b.swfLoaded=false;b.soundIDs=[];b.sounds=[];b.o=null;for(c=z.length;c--;)z[c].fired=false;j.setTimeout(function(){b.beginDelayedInit()},20)};this.destruct=function(){b.disable(true)};this.beginDelayedInit=function(){ja=true;H();setTimeout(X,500);setTimeout(ma,20)};U=function(c){return(c.type?M({type:c.type}):false)||M(c.url)};M=
function(c){if(!b.useHTML5Audio||!b.hasHTML5)return false;var a,f=b.audioFormats;if(!u){u=[];for(a in f)if(f.hasOwnProperty(a)){u.push(a);if(f[a].related)u=u.concat(f[a].related)}u=RegExp("\\.("+u.join("|")+")","i")}a=typeof c.type!=="undefined"?c.type:null;c=typeof c==="string"?c.toLowerCase().match(u):null;if(!c||!c.length){if(!a)return false}else c=c[0].substr(1);if(c&&typeof b.html5[c]!=="undefined")return b.html5[c];else{if(!a)if(c&&b.html5[c])return b.html5[c];else a="audio/"+c;a=b.html5.canPlayType(a);
return b.html5[c]=a}};ua=function(){function c(l){var h,d,i=false;if(!a||typeof a.canPlayType!=="function")return false;if(l instanceof Array){h=0;for(d=l.length;h<d&&!i;h++)if(b.html5[l[h]]||a.canPlayType(l[h]).match(b.html5Test)){i=true;b.html5[l[h]]=true}return i}else return(l=a&&typeof a.canPlayType==="function"?a.canPlayType(l):false)&&(l.match(b.html5Test)?true:false)}if(!b.useHTML5Audio||typeof Audio==="undefined")return false;var a=typeof Audio!=="undefined"?new Audio:null,f,g={},e,o;e=b.audioFormats;
for(f in e)if(e.hasOwnProperty(f)){g[f]=c(e[f].type);if(e[f]&&e[f].related)for(o=0;o<e[f].related.length;o++)b.html5[e[f].related[o]]=g[f]}g.canPlayType=a?c:null;b.html5=q(b.html5,g)};P={};y=function(c){return document.getElementById(c)};K=function(){var c=Array.prototype.slice.call(arguments),a=c.shift();a=P&&P[a]?P[a]:"";var f,g;if(a&&c&&c.length){f=0;for(g=c.length;f<g;f++)a=a.replace("%s",c[f])}return a};S=function(c){if(k===8&&c.loops>1&&c.stream)c.stream=false;return c};ca=function(c,a){var f;
if(!a)return Error("Error: "+c);typeof console!=="undefined"&&typeof console.trace!=="undefined"&&console.trace();f="Error: "+c+". \nCaller: "+a.toString();return Error(f)};ia=function(){return false};pa=function(c){for(var a in c)if(c.hasOwnProperty(a)&&typeof c[a]==="function")c[a]=ia};I=function(c){if(typeof c==="undefined")c=false;if(v||c)b.disable(c)};qa=function(c){var a=null;if(c)if(c.match(/\.swf(\?\.*)?$/i)){if(a=c.substr(c.toLowerCase().lastIndexOf(".swf?")+4))return c}else if(c.lastIndexOf("/")!==
c.length-1)c+="/";return(c&&c.lastIndexOf("/")!==-1?c.substr(0,c.lastIndexOf("/")+1):"./")+b.movieURL};Y=function(){if(k!==8&&k!==9)b.flashVersion=8;var c=b.debugMode||b.debugFlash?"_debug.swf":".swf";if(b.flashVersion<9&&b.useHTML5Audio&&b.audioFormats.mp4.required)b.flashVersion=9;k=b.flashVersion;b.version=b.versionNumber+(x?" (HTML5-only mode)":k===9?" (AS3/Flash 9)":" (AS2/Flash 8)");if(k>8){b.defaultOptions=q(b.defaultOptions,b.flash9Options);b.features.buffering=true}if(k>8&&b.useMovieStar){b.defaultOptions=
q(b.defaultOptions,b.movieStarOptions);b.filePatterns.flash9=RegExp("\\.(mp3|"+b.netStreamTypes.join("|")+")(\\?.*)?$","i");b.mimePattern=b.netStreamMimeTypes;b.features.movieStar=true}else b.features.movieStar=false;b.filePattern=b.filePatterns[k!==8?"flash9":"flash8"];b.movieURL=(k===8?"soundmanager2.swf":"soundmanager2_flash9.swf").replace(".swf",c);b.features.peakData=b.features.waveformData=b.features.eqData=k>8};na=function(){return document.body?document.body:document.documentElement?document.documentElement:
document.getElementsByTagName("div")[0]};oa=function(c,a){if(!b.o||!b.allowPolling)return false;b.o._setPolling(c,a)};$=function(){function c(){f.left=j.scrollX+"px";f.top=j.scrollY+"px"}function a(g){g=j[(g?"add":"remove")+"EventListener"];g("resize",c,false);g("scroll",c,false)}var f=null;return{check:function(g){f=b.oMC.style;if(t.match(/android/i)){if(g){if(b.flashLoadTimeout)b._s.flashLoadTimeout=0;return false}f.position="absolute";f.left=f.top="0px";a(true);b.onready(function(){a(false);if(f)f.left=
f.top="-9999px"});c()}}}}();R=function(c,a){var f=a?a:b.url,g=b.altURL?b.altURL:f,e,o,l,h;c=typeof c==="undefined"?b.id:c;if(E&&F)return false;if(x){Y();b.oMC=y(b.movieID);O();F=E=true;return false}E=true;Y();b.url=qa(this._overHTTP?f:g);a=b.url;if(b.useHighPerformance&&b.useMovieStar&&b.defaultOptions.useVideo===true)b.useHighPerformance=false;b.wmode=!b.wmode&&b.useHighPerformance&&!b.useMovieStar?"transparent":b.wmode;if(b.wmode!==null&&!b.isIE&&!b.useHighPerformance&&navigator.platform.match(/win32/i)){b.specialWmodeCase=
true;b.wmode=null}if(k===8)b.allowFullScreen=false;g={name:c,id:c,src:a,width:"100%",height:"100%",quality:"high",allowScriptAccess:b.allowScriptAccess,bgcolor:b.bgColor,pluginspage:"http://www.macromedia.com/go/getflashplayer",type:"application/x-shockwave-flash",wmode:b.wmode,allowFullScreen:b.allowFullScreen?"true":"false"};if(b.debugFlash)g.FlashVars="debug=1";b.wmode||delete g.wmode;if(b.isIE){f=document.createElement("div");o='<object id="'+c+'" data="'+a+'" type="'+g.type+'" width="'+g.width+
'" height="'+g.height+'"><param name="movie" value="'+a+'" /><param name="AllowScriptAccess" value="'+b.allowScriptAccess+'" /><param name="quality" value="'+g.quality+'" />'+(b.wmode?'<param name="wmode" value="'+b.wmode+'" /> ':"")+'<param name="bgcolor" value="'+b.bgColor+'" /><param name="allowFullScreen" value="'+g.allowFullScreen+'" />'+(b.debugFlash?'<param name="FlashVars" value="'+g.FlashVars+'" />':"")+"<!-- --\></object>"}else{f=document.createElement("embed");for(e in g)g.hasOwnProperty(e)&&
f.setAttribute(e,g[e])}ha();g=L();if(e=na()){b.oMC=y(b.movieID)?y(b.movieID):document.createElement("div");if(b.oMC.id){e=b.oMC.className;b.oMC.className=(e?e+" ":b.swfCSS.swfDefault)+(g?" "+g:"");b.oMC.appendChild(f);if(b.isIE){g=b.oMC.appendChild(document.createElement("div"));g.className="sm2-object-box";g.innerHTML=o}F=true;$.check(true)}else{b.oMC.id=b.movieID;b.oMC.className=b.swfCSS.swfDefault+" "+g;g=l=null;b.useFlashBlock||(l=b.useHighPerformance?{position:"fixed",width:"8px",height:"8px",
bottom:"0px",left:"0px",overflow:"hidden"}:{position:"absolute",width:"6px",height:"6px",top:"-9999px",left:"-9999px"});if(t.match(/webkit/i))b.oMC.style.zIndex=1E4;h=null;if(!b.debugFlash)for(h in l)if(l.hasOwnProperty(h))b.oMC.style[h]=l[h];try{b.isIE||b.oMC.appendChild(f);e.appendChild(b.oMC);if(b.isIE){g=b.oMC.appendChild(document.createElement("div"));g.className="sm2-object-box";g.innerHTML=o}F=true}catch(d){throw Error(K("appXHTML"));}$.check()}}};n=this.getSoundById;q=function(c,a){var f=
{},g,e;for(g in c)if(c.hasOwnProperty(g))f[g]=c[g];g=typeof a==="undefined"?b.defaultOptions:a;for(e in g)if(g.hasOwnProperty(e)&&typeof f[e]==="undefined")f[e]=g[e];return f};Q=function(){if(x){R();return false}if(b.o)return false;b.o=b.getMovie(b.id);if(!b.o){if(J){if(b.isIE)b.oMC.innerHTML=aa;else b.oMC.appendChild(J);J=null;E=true}else R(b.id,b.url);b.o=b.getMovie(b.id)}typeof b.oninitmovie==="function"&&setTimeout(b.oninitmovie,1)};la=function(c){if(c)b.url=c;Q()};X=function(){if(T)return false;
T=true;if(D&&!fa)return false;var c;p||(c=b.getMoviePercent());setTimeout(function(){c=b.getMoviePercent();if(!p&&wa)if(c===null)if(b.useFlashBlock||b.flashLoadTimeout===0)b.useFlashBlock&&ba();else I(true);else b.flashLoadTimeout!==0&&I(true)},b.flashLoadTimeout)};L=function(){var c=[];b.debugMode&&c.push(b.swfCSS.sm2Debug);b.debugFlash&&c.push(b.swfCSS.flashDebug);b.useHighPerformance&&c.push(b.swfCSS.highPerf);return c.join(" ")};ba=function(){var c=b.getMoviePercent();if(b.supported()){if(b.oMC)b.oMC.className=
L()+" "+b.swfCSS.swfDefault+(" "+b.swfCSS.swfUnblocked)}else{if(C)b.oMC.className=L()+" "+b.swfCSS.swfDefault+" "+(c===null?b.swfCSS.swfTimedout:b.swfCSS.swfError);b.didFlashBlock=true;A(true);b.onerror instanceof Function&&b.onerror.apply(j)}};w=function(){if(fa||!D)return true;fa=wa=true;D&&j.removeEventListener("mousemove",w,false);T=false;setTimeout(X,500);if(j.removeEventListener)j.removeEventListener("focus",w,false);else j.detachEvent&&j.detachEvent("onfocus",w)};G=function(c){if(p)return false;
if(x){p=true;A();B();return true}b.useFlashBlock&&b.flashLoadTimeout&&!b.getMoviePercent()||(p=true);if(v||c){if(b.useFlashBlock)b.oMC.className=L()+" "+(b.getMoviePercent()===null?b.swfCSS.swfTimedout:b.swfCSS.swfError);A();b.onerror instanceof Function&&b.onerror.apply(j);return false}if(b.waitForWindowLoad&&!ja){if(j.addEventListener)j.addEventListener("load",B,false);else j.attachEvent&&j.attachEvent("onload",B);return false}else B()};ka=function(c,a){z.push({method:c,scope:a||null,fired:false})};
A=function(c){if(!p&&!c)return false;c={success:c?b.supported():!v};var a=[],f,g,e=!b.useFlashBlock||b.useFlashBlock&&!b.supported();f=0;for(g=z.length;f<g;f++)z[f].fired!==true&&a.push(z[f]);if(a.length){f=0;for(g=a.length;f<g;f++){a[f].scope?a[f].method.apply(a[f].scope,[c]):a[f].method(c);if(!e)a[f].fired=true}}};B=function(){j.setTimeout(function(){b.useFlashBlock&&ba();A();b.onload.apply(j)},1)};ta=function(){var c,a,f=!N.match(/usehtml5audio/i)&&!N.match(/sm2\-ignorebadua/i)&&b.isSafari&&t.match(/OS X 10_6_(3|4)/i)&&
t.match(/(531\.22\.7|533\.16|533\.17\.8)/i);if(t.match(/iphone os (1|2|3_0|3_1)/i)?true:false){b.hasHTML5=false;x=true;if(b.oMC)b.oMC.style.display="none";return false}if(b.useHTML5Audio){if(!b.html5||!b.html5.canPlayType){b.hasHTML5=false;return true}else b.hasHTML5=true;if(f){b.useHTML5Audio=false;b.hasHTML5=false;return true}}else return true;for(a in b.audioFormats)if(b.audioFormats.hasOwnProperty(a))if(b.audioFormats[a].required&&!b.html5.canPlayType(b.audioFormats[a].type))c=true;if(b.ignoreFlash)c=
false;x=b.useHTML5Audio&&b.hasHTML5&&!c;return c};O=function(){function c(){if(j.removeEventListener)j.removeEventListener("load",b.beginDelayedInit,false);else j.detachEvent&&j.detachEvent("onload",b.beginDelayedInit)}var a,f=[];if(p)return false;if(b.hasHTML5)for(a in b.audioFormats)b.audioFormats.hasOwnProperty(a)&&f.push(a+": "+b.html5[a]);if(x){if(!p){c();b.enabled=true;G()}return true}Q();try{b.o._externalInterfaceTest(false);if(b.allowPolling)oa(true,b.useFastPolling?true:false);b.debugMode||
b.o._disableDebug();b.enabled=true}catch(g){I(true);G();return false}G();c()};ma=function(){if(da)return false;R();Q();return da=true};H=function(){if(Z)return false;Z=true;ha();ua();b.html5.usingFlash=ta();C=b.html5.usingFlash;Z=true;la()};ra=function(c){if(!c._hasTimer)c._hasTimer=true};sa=function(c){if(c._hasTimer)c._hasTimer=false};this._setSandboxType=function(c){var a=b.sandbox;a.type=c;a.description=a.types[typeof a.types[c]!=="undefined"?c:"unknown"];if(a.type==="localWithFile"){a.noRemote=
true;a.noLocal=false}else if(a.type==="localWithNetwork"){a.noRemote=false;a.noLocal=true}else if(a.type==="localTrusted"){a.noRemote=false;a.noLocal=false}};this._externalInterfaceOK=function(){if(b.swfLoaded)return false;(new Date).getTime();b.swfLoaded=true;D=false;b.isIE?setTimeout(O,100):O()};this._onfullscreenchange=function(c){b.isFullScreen=c===1?true:false;if(!b.isFullScreen)try{j.focus()}catch(a){}};W=function(c){var a=this,f,g,e,o,l,h;this.sID=c.id;this.url=c.url;this._iO=this.instanceOptions=
this.options=q(c);this.pan=this.options.pan;this.volume=this.options.volume;this._lastURL=null;this.isHTML5=false;this.id3={};this._debug=function(){};this._debug();this.load=function(d){var i=null;if(typeof d!=="undefined"){a._iO=q(d);a.instanceOptions=a._iO}else{d=a.options;a._iO=d;a.instanceOptions=a._iO;if(a._lastURL&&a._lastURL!==a.url){a._iO.url=a.url;a.url=null}}if(a._iO.url===a.url&&a.readyState!==0&&a.readyState!==2)return a;a._lastURL=a.url;a.loaded=false;a.readyState=1;a.playState=0;if(U(a._iO)){i=
a._setup_html5(a._iO);i.load();a._iO.autoPlay&&a.play()}else try{a.isHTML5=false;a._iO=S(a._iO);if(k===8)b.o._load(a.sID,a._iO.url,a._iO.stream,a._iO.autoPlay,a._iO.whileloading?1:0,a._iO.loops||1);else{b.o._load(a.sID,a._iO.url,a._iO.stream?true:false,a._iO.autoPlay?true:false,a._iO.loops||1);a._iO.isMovieStar&&a._iO.autoLoad&&!a._iO.autoPlay&&a.pause()}}catch(m){b.onerror();b.disable()}return a};this.unload=function(){if(a.readyState!==0){a.readyState!==2&&a.setPosition(0,true);if(a.isHTML5){e();
if(h){h.pause();h.src=b.nullURL;h.load();h=a._audio=null}}else if(k===8)b.o._unload(a.sID,b.nullURL);else{a.setAutoPlay(false);b.o._unload(a.sID)}f()}return a};this.destruct=function(d){if(a.isHTML5){e();if(h){h.pause();h.src="about:blank";h.load();h=a._audio=null}}else{a._iO.onfailure=null;b.o._destroySound(a.sID)}d||b.destroySound(a.sID,true)};this.start=this.play=function(d){d||(d={});a._iO=q(d,a._iO);a._iO=q(a._iO,a.options);a.instanceOptions=a._iO;if(a._iO.serverURL)if(!a.connected){a.setAutoPlay(true);
return a}if(U(a._iO)){a._setup_html5(a._iO);o()}if(a.playState===1)if(d=a._iO.multiShot)a.isHTML5&&a.setPosition(a._iO.position);else return a;if(!a.loaded)if(a.readyState===0)if(a.isHTML5){a.load(a._iO);a.readyState=1}else{if(!a._iO.serverURL){a._iO.autoPlay=true;a.load(a._iO)}}else if(a.readyState===2)return a;if(a.paused&&a.position!==null)a.resume();else{a.playState=1;a.paused=false;if(!a.instanceCount||k>8&&!a.isHTML5)a.instanceCount++;a.position=typeof a._iO.position!=="undefined"&&!isNaN(a._iO.position)?
a._iO.position:0;a._iO=S(a._iO);a._iO.onplay&&a._iO.onplay.apply(a);a.setVolume(a._iO.volume,true);a.setPan(a._iO.pan,true);if(a.isHTML5){o();a._setup_html5().play()}else{k===9&&a._iO.serverURL&&a.setAutoPlay(true);b.o._start(a.sID,a._iO.loops||1,k===9?a.position:a.position/1E3)}}return a};this.stop=function(d){if(a.playState===1){a._onbufferchange(0);a.resetOnPosition(0);if(!a.isHTML5)a.playState=0;a.paused=false;a._iO.onstop&&a._iO.onstop.apply(a);if(a.isHTML5){if(h){a.setPosition(0);h.pause();
a.playState=0;a._onTimer();e();a.unload()}}else{b.o._stop(a.sID,d);a._iO.serverURL&&a.unload()}a.instanceCount=0;a._iO={}}return a};this.setAutoPlay=function(d){a._iO.autoPlay=d;b.o._setAutoPlay(a.sID,d);if(d)a.instanceCount||a.instanceCount++};this.setPosition=function(d){if(typeof d==="undefined")d=0;a._iO.position=a.isHTML5?Math.max(d,0):Math.min(a.duration,Math.max(d,0));a.resetOnPosition(a._iO.position);if(a.isHTML5){if(h){if(a.playState)try{h.currentTime=a._iO.position/1E3}catch(i){}if(a.paused){a._onTimer(true);
a._iO.useMovieStar&&a.resume()}}}else b.o._setPosition(a.sID,k===9?a._iO.position:a._iO.position/1E3,a.paused||!a.playState);return a};this.pause=function(d){if(a.paused||a.playState===0&&a.readyState!==1)return a;a.paused=true;if(a.isHTML5){a._setup_html5().pause();e()}else if(d||d===undefined)b.o._pause(a.sID);a._iO.onpause&&a._iO.onpause.apply(a);return a};this.resume=function(){if(!a.paused||a.playState===0)return a;a.paused=false;a.playState=1;if(a.isHTML5){a._setup_html5().play();o()}else b.o._pause(a.sID);
a._iO.onresume&&a._iO.onresume.apply(a);return a};this.togglePause=function(){if(a.playState===0){a.play({position:k===9&&!a.isHTML5?a.position:a.position/1E3});return a}a.paused?a.resume():a.pause();return a};this.setPan=function(d,i){if(typeof d==="undefined")d=0;if(typeof i==="undefined")i=false;a.isHTML5||b.o._setPan(a.sID,d);a._iO.pan=d;if(!i)a.pan=d;return a};this.setVolume=function(d,i){if(typeof d==="undefined")d=100;if(typeof i==="undefined")i=false;if(a.isHTML5){if(h)h.volume=d/100}else b.o._setVolume(a.sID,
b.muted&&!a.muted||a.muted?0:d);a._iO.volume=d;if(!i)a.volume=d;return a};this.mute=function(){a.muted=true;if(a.isHTML5){if(h)h.muted=true}else b.o._setVolume(a.sID,0);return a};this.unmute=function(){a.muted=false;var d=typeof a._iO.volume!=="undefined";if(a.isHTML5){if(h)h.muted=false}else b.o._setVolume(a.sID,d?a._iO.volume:a.options.volume);return a};this.toggleMute=function(){return a.muted?a.unmute():a.mute()};this.onposition=function(d,i,m){a._onPositionItems.push({position:d,method:i,scope:typeof m!==
"undefined"?m:a,fired:false});return a};this.processOnPosition=function(){var d,i;d=a._onPositionItems.length;if(!d||!a.playState||a._onPositionFired>=d)return false;for(d=d;d--;){i=a._onPositionItems[d];if(!i.fired&&a.position>=i.position){i.method.apply(i.scope,[i.position]);i.fired=true;b._onPositionFired++}}};this.resetOnPosition=function(d){var i,m;i=a._onPositionItems.length;if(!i)return false;for(i=i;i--;){m=a._onPositionItems[i];if(m.fired&&d<=m.position){m.fired=false;b._onPositionFired--}}};
this._onTimer=function(d){if(a._hasTimer||d)if(h&&(d||(a.playState>0||a.readyState===1)&&!a.paused)){a.duration=l();a.durationEstimate=a.duration;d=h.currentTime?h.currentTime*1E3:0;a._whileplaying(d,{},{},{},{});return true}else return false};l=function(){var d=h?h.duration*1E3:undefined;if(d)return!isNaN(d)?d:null};o=function(){a.isHTML5&&ra(a)};e=function(){a.isHTML5&&sa(a)};f=function(){a._onPositionItems=[];a._onPositionFired=0;a._hasTimer=null;a._added_events=null;h=a._audio=null;a.bytesLoaded=
null;a.bytesTotal=null;a.position=null;a.duration=null;a.durationEstimate=null;a.failures=0;a.loaded=false;a.playState=0;a.paused=false;a.readyState=0;a.muted=false;a.didBeforeFinish=false;a.didJustBeforeFinish=false;a.isBuffering=false;a.instanceOptions={};a.instanceCount=0;a.peakData={left:0,right:0};a.waveformData={left:[],right:[]};a.eqData=[];a.eqData.left=[];a.eqData.right=[]};f();this._setup_html5=function(d){d=q(a._iO,d);if(h){if(a.url!==d.url)h.src=d.url}else{a._audio=new Audio(d.url);h=
a._audio;a.isHTML5=true;g()}h.loop=d.loops>1?"loop":"";return a._audio};g=function(){function d(i,m,r){return h?h.addEventListener(i,m,r||false):null}if(a._added_events)return false;a._added_events=true;d("load",function(){if(h){a._onbufferchange(0);a._whileloading(a.bytesTotal,a.bytesTotal,l());a._onload(1)}},false);d("canplay",function(){a._onbufferchange(0)},false);d("waiting",function(){a._onbufferchange(1)},false);d("progress",function(i){if(!a.loaded&&h){a._onbufferchange(0);a._whileloading(i.loaded||
0,i.total||1,l())}},false);d("error",function(){h&&a._onload(0)},false);d("loadstart",function(){a._onbufferchange(1)},false);d("play",function(){a._onbufferchange(0)},false);d("playing",function(){a._onbufferchange(0)},false);d("timeupdate",function(){a._onTimer()},false);setTimeout(function(){a&&h&&d("ended",function(){a._onfinish()},false)},250)};this._whileloading=function(d,i,m,r){a.bytesLoaded=d;a.bytesTotal=i;a.duration=Math.floor(m);if(a._iO.isMovieStar){a.durationEstimate=a.duration;a.readyState!==
3&&a._iO.whileloading&&a._iO.whileloading.apply(a)}else{a.durationEstimate=parseInt(a.bytesTotal/a.bytesLoaded*a.duration,10);if(a.durationEstimate===undefined)a.durationEstimate=a.duration;a.bufferLength=r;if((a._iO.isMovieStar||a.readyState!==3)&&a._iO.whileloading)a._iO.whileloading.apply(a)}};this._onid3=function(d,i){var m=[],r,s;r=0;for(s=d.length;r<s;r++)m[d[r]]=i[r];a.id3=q(a.id3,m);a._iO.onid3&&a._iO.onid3.apply(a)};this._whileplaying=function(d,i,m,r,s){if(isNaN(d)||d===null)return false;
if(a.playState===0&&d>0)d=0;a.position=d;a.processOnPosition();if(k>8&&!a.isHTML5){if(a._iO.usePeakData&&typeof i!=="undefined"&&i)a.peakData={left:i.leftPeak,right:i.rightPeak};if(a._iO.useWaveformData&&typeof m!=="undefined"&&m)a.waveformData={left:m.split(","),right:r.split(",")};if(a._iO.useEQData)if(typeof s!=="undefined"&&s&&s.leftEQ){d=s.leftEQ.split(",");a.eqData=d;a.eqData.left=d;if(typeof s.rightEQ!=="undefined"&&s.rightEQ)a.eqData.right=s.rightEQ.split(",")}}if(a.playState===1){!a.isHTML5&&
a.isBuffering&&a._onbufferchange(0);a._iO.whileplaying&&a._iO.whileplaying.apply(a);if((a.loaded||!a.loaded&&a._iO.isMovieStar)&&a._iO.onbeforefinish&&a._iO.onbeforefinishtime&&!a.didBeforeFinish&&a.duration-a.position<=a._iO.onbeforefinishtime)a._onbeforefinish()}};this._onconnect=function(d){d=d===1;if(a.connected=d){a.failures=0;if(a._iO.autoLoad||a._iO.autoPlay)a.load(a._iO);a._iO.autoPlay&&a.play();a._iO.onconnect&&a._iO.onconnect.apply(a,[d])}};this._onload=function(d){d=d===1?true:false;a.loaded=
d;a.readyState=d?3:2;a._iO.onload&&a._iO.onload.apply(a)};this._onfailure=function(d){a.failures++;a._iO.onfailure&&a.failures===1&&a._iO.onfailure(a,d)};this._onbeforefinish=function(){if(!a.didBeforeFinish){a.didBeforeFinish=true;a._iO.onbeforefinish&&a._iO.onbeforefinish.apply(a)}};this._onjustbeforefinish=function(){if(!a.didJustBeforeFinish){a.didJustBeforeFinish=true;a._iO.onjustbeforefinish&&a._iO.onjustbeforefinish.apply(a)}};this._onfinish=function(){a._onbufferchange(0);a.resetOnPosition(0);
a._iO.onbeforefinishcomplete&&a._iO.onbeforefinishcomplete.apply(a);a.didBeforeFinish=false;a.didJustBeforeFinish=false;if(a.instanceCount){a.instanceCount--;if(!a.instanceCount){a.playState=0;a.paused=false;a.instanceCount=0;a.instanceOptions={};e()}if(!a.instanceCount||a._iO.multiShotEvents)if(a._iO.onfinish)a._iO.onfinish.apply(a);else a.isHTML5&&a.unload()}};this._onmetadata=function(d){if(!d.width&&!d.height){d.width=320;d.height=240}a.metadata=d;a.width=d.width;a.height=d.height;a._iO.onmetadata&&
a._iO.onmetadata.apply(a)};this._onbufferchange=function(d){if(a.playState===0)return false;if(d&&a.isBuffering||!d&&!a.isBuffering)return false;a.isBuffering=d===1?true:false;a._iO.onbufferchange&&a._iO.onbufferchange.apply(a)};this._ondataerror=function(){a.playState>0&&a._iO.ondataerror&&a._iO.ondataerror.apply(a)}};if(!b.hasHTML5||C)if(j.addEventListener){j.addEventListener("focus",w,false);j.addEventListener("load",b.beginDelayedInit,false);j.addEventListener("unload",b.destruct,false);D&&j.addEventListener("mousemove",
w,false)}else if(j.attachEvent){j.attachEvent("onfocus",w);j.attachEvent("onload",b.beginDelayedInit);j.attachEvent("unload",b.destruct)}else{V.onerror();V.disable()}ea=function(){if(document.readyState==="complete"){H();document.detachEvent("onreadystatechange",ea)}};if(document.addEventListener)document.addEventListener("DOMContentLoaded",H,false);else document.attachEvent&&document.attachEvent("onreadystatechange",ea);document.readyState==="complete"&&setTimeout(H,100)}var V=null;if(typeof SM2_DEFER===
"undefined"||!SM2_DEFER)V=new ga;j.SoundManager=ga;j.soundManager=V})(window);
