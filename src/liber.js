/**
 * @author soyoes 
 * @Copywrite (c) 2013, Liberhood, http://liberhood.com 
 * @URL : https://github.com/soyoes/liberjs
 * @license : MIT License
 * 
 */

var $conf=$conf||{};
var $ui={};
/**
 * @return {
 * 	name:MSIE|Firefox|Chrome|Safari|Opera|iPhone|iPad|iPod|Android|BlackBerry|IEMobile
 * 	ver:float
 * 	os: Win|Mac|Linux|iPhone|iPod|iPad|Android|IEMobile|BlackBerry
 * 	osver : float //mobile only
 * 	osname : WinXP|Vista|Win7|Win8|Win8.1|Win10 //Windows only
 * 	mobile : true|false //Mobile only
 * 	simulator : true|false  //mobile only
 * }
 * */
var $browser = (function(){
	var ua=navigator.userAgent,u,p=navigator.platform,r={},
		n=ua.match(/(MSIE|Trident|Firefox|Chrome|Safari|Opera)[\/\s](\d+\.*\d*)/i);
	// console.log(i,n,p);
	r.name = n?n[1].toLowerCase():"unknown";
	r.ver = n?parseFloat(n[2]):0;
	if(r.name=="trident"){
		r.name = "msie";
		n = ua.match(/rv:(\d+\.?\d*)/);
		if(n) r.ver=parseFloat(n[1]);
	}
	if(r.name=="safari"){
		n = ua.match(/Version\/(\d+\.*\d*)/);
		if(n) r.ver=parseFloat(n[1]);
	}
	if( u = ua.match(/(iphone|ipad|ipod|android|iemobile|blackberry)/i) ){//mobile, supports iphone, android, mobileIE only.
		r.os = u?u[0].toLowerCase():"Unknown";
		var mptn = {'iphone':/^iphone/i,'ipad':/^ipad/i,'ipod':/^ipod/i,'android':/^linux\s(arm|i)/i,'iemobile':/win/i};
		r.simulator = !p.match(mptn[r.os]); //check its device or simulator
		if(u=ua.match(/(iPhone|iPad|iPod)\sOS\s([\d_]+)/i))
			r.osver=u[2].split("_").join(".");
		if(u=ua.match(/(Android|BlackBerry|Windows\sPhone\sOS)\s([\d\.]+)/i))
			r.osver=u[2];
		r.name = r.name=='unknown'? r.os:r.name;
		r.mobile = true;
	}else{ //pc
		u = p.match(/(x11|linux|mac|win)/i);
		r.os = u?(u[0].toLowerCase()=='x11'?"linux":u[0].toLowerCase()):"unknown";
		if(u=ua.match(/Mac\sOS\sX\s([\d_]+)/i)){
			r.osver=u[1].split("_").join(".");
		}
		if(u=ua.match(/Windows\sNT\s([\d\.]+)/i)){
			r.osver = u[1];
			r.osname = {'5.1':'WinXP','5.2':'WinXP','6.0':'Vista','6.1':'Win7','6.2':'Win8','6.3':'Win8.1','10.0':'Win10'}[r.osver];
		}
	}
	if((r.name=="Unknown"||r.os=="Unknown")&&$app.onError)
		$app.onError("unsupported_error");
    return r;
})();

function $id(domid){
	return document.getElementById(domid);
}
/* shot cuts */
// if(!$) //to support jquery
var $ = function(query,each){
	var usingView = ($app.status === "loaded" && $this && $this.layer);
	var res = usingView? $this.layer.find(query,each):document.querySelectorAll(query);
	if (!usingView && res) {
		if(each) res.each(each);
		var qs=query.split(" "),qu=qs[qs.length-1];
		res = qu.indexOf("#")==0? res[0]:res;
	}
	return res;
}

var TSX=0,TSY=0;
$.args=null,
$.__events = {
	'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
	'MouseEvents': /^(?:click|dblclick|touch(start|end|up|cancel)|mouse(?:down|up|over|move|out))$/
},
$.__eventOpts = {
	pointerX: 0,
	pointerY: 0,
	button: 0,
	ctrlKey: false,
	altKey: false,
	shiftKey: false,
	metaKey: false,
	bubbles: true,
	cancelable: true
},

$.__HTML_ESC = {"nbsp":" ","iexcl":"¡","cent":"¢","pound":"£","curren":"¤","yen":"¥","brvbar":"¦","sect":"§","uml":"¨","copy":"©","ordf":"ª","laquo":"«","not":"¬","reg":"®","macr":"¯","deg":"°","plusmn":"±","sup2":"²","sup3":"³","acute":"´","micro":"µ","para":"¶","middot":"·","cedil":"¸","sup1":"¹","ordm":"º","raquo":"»","frac14":"¼","frac12":"½","frac34":"¾","iquest":"¿","Agrave":"À","Aacute":"Á","Acirc":"Â","Atilde":"Ã","Auml":"Ä","Aring":"Å","AElig":"Æ","Ccedil":"Ç","Egrave":"È","Eacute":"É","Ecirc":"Ê","Euml":"Ë","Igrave":"Ì","Iacute":"Í","Icirc":"Î","Iuml":"Ï","ETH":"Ð","Ntilde":"Ñ","Ograve":"Ò","Oacute":"Ó","Ocirc":"Ô","Otilde":"Õ","Ouml":"Ö","times":"×","Oslash":"Ø","Ugrave":"Ù","Uacute":"Ú","Ucirc":"Û","Uuml":"Ü","Yacute":"Ý","THORN":"Þ","szlig":"ß","agrave":"à","aacute":"á","acirc":"â","atilde":"ã","auml":"ä","aring":"å","aelig":"æ","ccedil":"ç","egrave":"è","eacute":"é","ecirc":"ê","euml":"ë","igrave":"ì","iacute":"í","icirc":"î","iuml":"ï","eth":"ð","ntilde":"ñ","ograve":"ò","oacute":"ó","ocirc":"ô","otilde":"õ","ouml":"ö","divide":"÷","oslash":"ø","ugrave":"ù","uacute":"ú","ucirc":"û","uuml":"ü","yacute":"ý","thorn":"þ","yuml":"ÿ","fnof":"ƒ","Alpha":"Α","Beta":"Β","Gamma":"Γ","Delta":"Δ","Epsilon":"Ε","Zeta":"Ζ","Eta":"Η","Theta":"Θ","Iota":"Ι","Kappa":"Κ","Lambda":"Λ","Mu":"Μ","Nu":"Ν","Xi":"Ξ","Omicron":"Ο","Pi":"Π","Rho":"Ρ","Sigma":"Σ","Tau":"Τ","Upsilon":"Υ","Phi":"Φ","Chi":"Χ","Psi":"Ψ","Omega":"Ω","alpha":"α","beta":"β","gamma":"γ","delta":"δ","epsilon":"ε","zeta":"ζ","eta":"η","theta":"θ","iota":"ι","kappa":"κ","lambda":"λ","mu":"μ","nu":"ν","xi":"ξ","omicron":"ο","pi":"π","rho":"ρ","sigmaf":"ς","sigma":"σ","tau":"τ","upsilon":"υ","phi":"φ","chi":"χ","psi":"ψ","omega":"ω","thetasym":"ϑ","upsih":"ϒ","piv":"ϖ","bull":"•","hellip":"…","prime":"′","Prime":"″","oline":"‾","frasl":"⁄","weierp":"℘","image":"ℑ","real":"ℜ","trade":"™","alefsym":"ℵ","larr":"←","uarr":"↑","rarr":"→","darr":"↓","harr":"↔","crarr":"↵","lArr":"⇐","uArr":"⇑","rArr":"⇒","dArr":"⇓","hArr":"⇔","forall":"∀","part":"∂","exist":"∃","empty":"∅","nabla":"∇","isin":"∈","notin":"∉","ni":"∋","prod":"∏","sum":"∑","minus":"−","lowast":"∗","radic":"√","prop":"∝","infin":"∞","ang":"∠","and":"∧","or":"∨","cap":"∩","cup":"∪","int":"∫","there4":"∴","sim":"∼","cong":"≅","asymp":"≈","ne":"≠","equiv":"≡","le":"≤","ge":"≥","sub":"⊂","sup":"⊃","nsub":"⊄","sube":"⊆","supe":"⊇","oplus":"⊕","otimes":"⊗","perp":"⊥","sdot":"⋅","lceil":"⌈","rceil":"⌉","lfloor":"⌊","rfloor":"⌋","lang":"〈","rang":"〉","loz":"◊","spades":"♠","clubs":"♣","hearts":"♥","diams":"♦","\"":"quot","amp":"&","lt":"<","gt":">","OElig":"Œ","oelig":"œ","Scaron":"Š","scaron":"š","Yuml":"Ÿ","circ":"ˆ","tilde":"˜","ndash":"–","mdash":"—","lsquo":"‘","rsquo":"’","sbquo":"‚","ldquo":"“","rdquo":"”","bdquo":"„","dagger":"†","Dagger":"‡","permil":"‰","lsaquo":"‹","rsaquo":"›","euro":"€"};


var __={},/**runtimes variables will be deleted in ?ms */
__set=function(k,v,ms){__[k] = v;ms=ms||300;setTimeout(function(key){delete __[key];}, ms, k);},
__clear=function(){__={};};

var $this;//current view.


$.isArray = function(v){
	return v && Object.prototype.toString.call(v) === '[object Array]';
}
$.isFunc = function(f) {
	return f && Object.prototype.toString.call(f) === '[object Function]';
}
$.isFile = function(v){
	return Object.prototype.toString.call(v) === '[object File]';
}
$.isBool = function(va){
	return va===true || va===false;
}
$.isElement = function(obj) {
	try {
    	return obj instanceof HTMLElement || obj instanceof SVGElement;
	}catch(e){
		return (typeof obj==="object") &&
			(obj.nodeType===1) && (typeof obj.style === "object") &&
			(typeof obj.ownerDocument ==="object");
  	}
}
$.isNumber = function(n){return !isNaN(parseFloat(n)) && isFinite(n);}
$.isString = function(o){return typeof o == 'string' || o instanceof String;}
$.isObject = function(o){return typeof o === "object";}
$.keys=function(obj){
	var s = [];if($.isObject(obj))for(var k in obj){s.push(k);}return s;
};
$.values=function(obj){
	var s = [];for(var k in obj){s.push(obj[k]);}return s;
};
$.unique=function(arr){
	var a = [];for(var i in arr){if(a.indexOf(arr[i])<0)a.push(arr[i]);} return a;
};
$.trim=function(arr,func){
	var a = [];for (var i=0; i<arr.length;i++){
		var v = arr[i];if(func){
			if(func(v))a.push(v);
		}else if(v===0||(v!=null && v!=undefined && v!="")) 
			a.push(v);
	}return a;
};
$.empty =function(obj){
	return (!obj)||($.isArray(obj)&&obj.length<=0)||
		($.isObject(obj)&&Object.keys(obj).length<=0);
}
//get min, max value
$.range = function(arr,col){
	if(!arr)return false;
	var min,max,v,i;
	for(i=0;i<arr.length;i++){
		v = col? arr[i][col]:arr[i];
		if(!min){min=v;max=v;}
		if(min>v)min=v;
		if(max<v)max=v;
	}
	return [min,max];
}

/**
* @param : get JS params
*/
$.getArguments = function(){
	if($.args)return $.args;
	var scripts = document.getElementsByTagName("script");
	$.args = {};
	for(var i in scripts){
		var sc = scripts[i];
		if(sc.src.indexOf('liber.js')>=0){
			var pstrs = sc.src.split('liber.js');
			var pstr = pstrs[1];
			if(pstr.indexOf("?")==0){
				pstr= pstr.replace("?","");
				pstrs = pstr.split('&');
				for(var j in pstrs){
					var parts = pstrs[j].split('=');
					$.args[parts[0]] = parts[1];
				}
			}
			return $.args;
		}
	}
}

$.getCookie = function(key){
	if(document.cookie){
		var kvs = $.unserialize(document.cookie,";");
		return kvs[key];
	}
	return null;
}
$.unserialize = function(paramStr,rowSpliter,kvSpliter){
	if(!paramStr) return null;
	rowSpliter = rowSpliter||"&";
	kvSpliter = kvSpliter||"=";
	paramStr = paramStr.replace(/(.*)\?/i,'');
	var parts = paramStr.split(rowSpliter);
	var params = {};
	for(var i=0,p;p=parts[i];i++){
		 var ps = p.split(kvSpliter);
		 if(ps.length==2)
		    params[ps[0].trim()] = ps[1];
	}
	return params;
}
$.serialize = function(params,rowSpliter,kvSpliter) {
	var pairs = [];
	rowSpliter = rowSpliter||"&";
	kvSpliter = kvSpliter||"=";
	for (var k in params) {
	   pairs.push([k,params[k]].join(kvSpliter));
	}
	return pairs.join(rowSpliter);
}

/**
 * preload image list (or css|font)
 * */
$.preload = function(files, onfileLoad, onfileError){
	for(var i =0;i<files.length;i++){
    	var f = files[i];
    	if(f.indexOf("http")!=0&&$conf.preload_image_path){
			if(f.indexOf($conf.preload_image_path)!=0){
				f = $conf.preload_image_path + f;
			}
		}
    	var img = new Image();
    	if(onfileLoad)img.onload = function(e){e=e||window.event;var target=e.target||e.srcElement;onfileLoad(target.src);};
    	if(onfileError)img.onerror =function(e){e=e||window.event;onfileError(e.target||e.srcElement);};
    	img.src = f;
    }
}

$.clone = function(o){
	if(typeof(o)==="object")
		return JSON.parse(JSON.stringify(o));
	else if($.isArray(o))
		return o.slice(0);
	return o;
}

//link css files
$.link = function(filepath){
	if(!filepath)return;
	var id = filepath.replace(/[\/\.]/g,'_');
	if($("link#"+id).length>0)return;
	var link = document.createElement( "link" )
		.attr({id:id, href:filepath, type:"text/css", rel:"stylesheet"});
	document.getElementsByTagName( "head" )[0].appendChild(link);
}

//include js files
$.include = function(src, callback,params){
	if(src.indexOf(".js")<0)
		src+=".js";
	if(src.indexOf("/")<0)
		src = $conf.liber_path+src;
	var jsId = src.split("/");
	jsId = jsId[jsId.length-1].replace(/\./g,"_");
	var time = new Date().getTime();
	if(!$id(jsId,true)){
		var included = function(e){
			if(!$app.__included)
				$app.__included = [];
			e=e||window.event;
			var t=e.target||e.srcElement;
			if(t.readyState == "loading")
				return;
			if(e.type=="error"){
				if($app.onError)$app.onError("app_include_error",t.src);
				throw new Error("ERROR : Failed to load "+t.src);
			}
			t.onload = t.onreadystatechange = null;
			$app.__included.push(t.id);
			var cb = callback?($.isString(callback)?window[callback]:callback):null;
			if(cb)cb(params);
		};
		
		var se = document.createElement("script");
		se.id= jsId;
		se.type = "text/javascript";
		se.onload = se.onreadystatechange = included;
		se.onerror = included;
		var head = document.head?document.head: document.getElementsByTagName('head')[0];
		se.src = src.indexOf("liber.")>=0 ? src+"?v="+time:src;
		head.appendChild(se);
	}else{
		//$.package(jsId);
		if(callback){
			if(typeof(callback)=="function")
				callback(params);
			else if(typeof(callback)=="string"){
				callback = window[callback];
				if(callback)
					callback(params);
			}
				
		}
			
	}
}

$.extend = function(destination, source) {
    for (var f in source)
     	if(!(f in destination)) destination[f] = source[f];
    return destination;
}

/**
 * send log to dummy url log.html. for apache log analyzing.
 * 
 * $conf.log_path = "/log.php"
 * $.log("my_action"); => /log.php?action=my_view:$UID:my_action
 *  
 */
$.log = function(action,params){
	if(!$conf.log_path)return;
	var p = $.serialize(params);
	action=[$this.name, action].join("/");
	if($http)
		$http.get([log_path,"/",action,"?",p].join(""));
};
$.rand = function(min, max) {
	var argc = arguments.length;
	if (argc === 0) {
		min = 0;
		max = 2147483647;
	} else if (argc === 1) {
		max = min;
		min = 1;
	}
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
/**
 * generate key string with specified length, and character set.
 * @param  $len: length of the key
 * @param  $chars: charactor set string
 * @return a key string
 * @example
 *  keygen(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.;,-$%()!@")
 */
$.keygen = function(len,chars){
	len = len||16;
	chars = chars||"abcdefghijklmnopqrstuvwxyz0123456789_.;,-$%()!@";
	var keys=[],clen=chars.length;
	for(var i=0;i<len;i++){
		keys.push(chars[$.rand(0,clen-1)]);
	}
	return keys.join('');
}
/**
 * generate uuid 
 * @return {[type]} [description]
 */
$.uuid = function(){
	var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};


$.documentHeight = function() {
	var d = document.documentElement ? document.documentElement:document.body;
	return Math.max(d.scrollHeight, d.offsetHeight,d.clientHeight);
}
$.screenWidth = function(){
	return  window.innerWidth|| document.documentElement.clientWidth|| document.getElementsByTagName('body')[0].clientWidth;
}
$.screenHeight = function(){
    return  window.innerHeight|| document.documentElement.clientHeight|| document.getElementsByTagName('body')[0].clientHeight;
}
$.rect = function(el){
	return el&&el.rect?el.rect():{left:0,top:0,width:0,height:0};
}
$.remove = function(el){
	if(el&&!$.isString(el)&&el.remove)return el.remove();
	if($.isString(el)&&el.startsWith("#")){
		$.remove($id(el.replace("#","")));
	}
}
$.show = function(el){
	if(el&&el.show)el.show(); return el;
}
$.hide = function(el){
	if(el&&el.hide)el.hide(); return el;
}
$.fire = function(el){
	if(el&&el.fire)el.fire(); return el;
}

/**
 * timestamp to date string
 * @param  {long} time : timestamp, 14bit
 * @param  {string} locale : en-GB, en-US, ja-JP, zh-CN, ko-KR ...
 * @return {string} : the date time string
 */
$.time2str = function(time, locale){
	var str = time+"";
	if(str.length==11)time*=1000;
	str =  new Date(time).toLocaleDateString(locale);
	if(locale.match(/^(zh|ja)/)){
		var ps = str.split("/");
		for(var i=0,p;p=ps[i];i++){
			if(p.length==1)ps[i]="0"+p;
		}
		return ps.join("-");
	}else
		return str;
}

/**
* return mouse position;
*/
$.cursor = function(e,target){
	$.__mouseX=0;$.__mouseY=0;
	if (e.pageX || e.pageY) { 
		$.__mouseX = e.pageX;
		$.__mouseY = e.pageY;
	} else { 
		$.__mouseX = e.clientX + document.body.scrollLeft; 
		$.__mouseY = e.clientY + document.body.scrollTop; 
	} 
	return {x:$.__mouseX,y:$.__mouseY};
}
$.inRect = function(point, rect){
	return point.x>=rect.left && point.x<=rect.left+rect.width
			&& point.y>=rect.top && point.y<=rect.top+rect.height;
}


/**
 * show file/image upload window
 * example:
 * */
$.uploadWindow = function(callback,multiple){
	var fname = "__tmpFileForm", iname="__tmpFileBtn";
	var imgform = $id(fname,true);
	if(imgform==undefined){
		imgform = $form({id:fname, enctype:"multipart/form-data"}, document.body).css({border:'0px',height:'0px',width:'0px',display:"none"});
		var params = {id:iname,type:"file", name:"tempfile"};
		if(multiple) params["multiple"] = "multiple";
		var ipt = $input(params,imgform);
		ipt.bind("change",callback);
		ipt.fire("click");
	}else{
		imgform.style.display = "block";
		$id(iname).fire("click");
		setTimeout(function(){
			$id(fname,true).style.display = "none";
		},100);
	}
}

/* for bind */
// $.registerFunc = function(idx, type, f){

// }
// $.removeFunc = function(idx, type, f){
	
// }


var $app = {
	status : "normal",
	viewIdx : 1,
	views : [],
	legacy : false, //check if its liber.js 1.x
	hashData : {},//data for view transition
	start : function(start_view){
		if($app.status=="stopped")
			throw new Error("This app has been stopped for some reason.");
		var ps = window.location.href.split("#");
		if(ps[1] && window[ps[1]])
			$app.start_view = ps[1];
		else
			$app.start_view = $.isString(start_view)?start_view:$conf.default_view;
		if(!$app.start_view){
			if($app.onError)$app.onError("no_start_view_error");
			throw new Error("No start view"); return;
		}
		var __default = {
			modules : [],
			liber_path : "/js/"
		};
		for(var i in __default)
			if(!$conf[i])$conf[i]=__default[i];

		$app.legacy = $conf.modules.indexOf("liber.legacy")>=0;

		//preload
		var images = $conf.preload_images?$conf.preload_images:[];
		var loadFiles = $conf.modules.length+images.length, loadedFiles=0;
		if(loadFiles==0)
			return $app.preloaded();
		var step = function(){
			loadedFiles++;
			var progress = parseInt(loadedFiles*100/loadFiles);
			if($app.onLoadProgress)
				$app.onLoadProgress(progress);
			if(progress>=100)
				$app.preloaded();
		}; 
		for(var i=0,m;m=$conf.modules[i];i++)
			$.include(m, step, m);
		if(images.length>0)
			$.preload(images, step, step);
	},
	stop : function(){
		$app.status = "stopped";
		$("body > article.layer", function(a){a.parentNode.removeChild(a);})
	},
	preloaded : function(){
		if($app.onload)$app.onLoad=$app.onload;
		if($app.onLoad) $app.onLoad();
		else $app.loaded();
	},
	loaded : function(){
		$app.status = "loaded";
		$app.hash = window.location.hash;
		$app.openView($app.start_view,{},true);
		setInterval($app.onUrlChanged, 50);
	},
	handle : function(type, view, data){
		switch(type){
			case "stop":
				return $app.stop();
			case "loaded":
				return $app.drawView(view);
			case "close":
				return $app.closeView(view,data);
			case "front":
				return $app.bringViewToFront(view);
			default:
				break;
		}
	},
	trans : function(e){
		var url = this.getAttribute("url");
		e = e||window.event;
		e.stopPropagation();
		$app.openUrl(url);
	},
	onUrlChanged : function(argument) {
		if (window.location.hash != $app.hash) {
	        var hash = window.location.hash;
	        if(hash=="") hash="#"+$app.start_view;
	        if(hash.startsWith("#")){
				hash = hash.replace(/^#/,"");
				if(hash.match(/^~/)){
					var func = hash.replace(/^~/,"");
					try{eval(func+"()");}catch(ex){
						if($app.onError) $app.onError("wrong_func_url_error");
					}
				}else{
					var vname = hash.split("?")[0];
					var data = $app.hashData[vname] || {};
					if(window[vname] && window[vname].drawContent)
						$app.openView(hash,data,true);
				}
			}
			$app.hash = window.location.hash;
	    }
	},
	openUrl : function(url) {
		if(url && $.isString(url) && url.trim().length>0){
			if(url.indexOf("http:")==0 || url.indexOf("https:")==0){
				return location.href = url;
			}else{//init view 
				$app.openView(url,{},url.match(/@\?*/));
			}
		}else{
			if($app.onError)$app.onError("unsupported_url_type_error",{url:url});
			throw new Error("ERROR : $app.openView requires string type url");
		}
	},
	/**
	 * view transition logics
	 *
	 * #init
	 * start $app.onUrlChanged to listen URL hash change info.
	 *
	 * #manually open view
	 * A : if transition
	 * 	1 : create dummy <A> with url
	 * 	2 : fire click event against this <A>
	 * 	3 : url will be changed (by browser)
	 * 	4 : $app.onUrlChanged will do the rest things
	 *
	 * B : no transition 
	 *  1 : solve view name, params, opener
	 *  2 : handle onInactive of opener
	 *  3 : extend target view controller, if its not inited
	 *  4 : target view.onLoad
	 *  5 : target.loaded
	 *  6 : target.drawHeader
	 *  7 : target.drawContent
	 *  8 : target.drawFooter
	 * 
	 * @param  {[type]} !withoutTransition [whether appends anchor url (#name_of_the_view) to current one]
	 */
	openView : function(url, args, withoutTransition){
		if(!withoutTransition){
			var canTrans = ($this && $this.onTransition)?$this.onTransition.call($this,url,args,false):true;
			if(canTrans===false)return;
			//view transition : let $app.onUrlChanged to do the openView job
			var isSM = $browser.mobile && !$browser.simulator;
			//var evName = isSM?"touchend":"click";
			var evName = "click";
			var vname = url.replace(/^#/,'');
			vname = vname.split("?")[0];
			$app.hashData[vname] = args||{};
			var dm = $a({href:"#"+url, html:"_"},document.body).css({opacity:0}).fire(evName);
			setTimeout(function(){dm.remove();},10);
			return;
		}
		var params = $.extend(args||{} , $.unserialize(url)||{}),
			vname = url.split("?")[0],
			opener = $this;
		if(vname.endsWith("@")) {
			withoutTransition = true;
			vname = vname.substring(0,vname.length-1);
		}
		var view = window[vname];
		if(!view){
			if($app.onError)$app.onError("view_not_exists_error", {name:vname});
			throw new Error("Error :no view("+vname+") to enhance");
		}
		if(!view.close || !view.loaded){
			view.name = view.name|| vname;
			$.extend(view, $controller);
			// console.log("extend:",view.extend,window[view.extend]);
			if($.isString(view.extend) && $.isObject(window[view.extend])){
				console.log("extending:",view.extend);
				$.extend(view, window[view.extend]);
			}
		}

		view.params = params;
		if(opener)
			view.opener = opener;
		var oia = opener?opener.onInactive||$app.onInactive:null;
		if(opener && oia) 
			oia.call(opener,view);
		// if($this.opener && url===$this.opener.name){
		// 	console.log("this.close");
		// 	return $this.close();
		// }
		if(withoutTransition)
			view.isPopup = true;//FIXME
		$app.views.push(vname);	
		$this = view;

		if(view.onload)view.onLoad = view.onload;
		if(view.onLoad)
			view.onLoad.call(view,params);
		else
			view.loaded.call(view);//$controller.loaded
	},
	/**
	 * open a view as a subview under another view controller
	 * @param  {[type]} view_name [description]
	 * @param  {[type]} params    [description]
	 * @param  {[type]} header    [description]
	 * @param  {[type]} content   [description]
	 * @param  {[type]} footer    [description]
	 * @param  {[type]} layer     [description]
	 * @return {[type]}           [description]
	 */
	openSubview : function(view_name, params, header, content, footer){
		var v = window[view_name];
		if(!v)return;
		v.parentView = $this?$this.name:null;
		if(!v.close || !v.loaded){
			$.extend(v, $controller);
			if($.isString(v.extend) && $.isObject(window[v.extend])){
				$.extend(v, window[v.extend]);
			}
		}
		if(header){header.innerHTML="";v.header=header}
		if(content){content.innerHTML="";v.content=content;}
		if(footer){footer.innerHTML="";v.footer=footer;}
		$this = v;
		if(v.onLoad) {	
			v.onLoad.call(v, params);
		}else{
			v.render.call(v, header, content, footer);
		}
	},
	drawView : function(view){
		if(!view) return; //FIXME
		if(view.reusable && view.layer){//FIXME
			if(view.layer && !view.layer.parentNode)
				document.body.appendChild(view.layer);
			$app.bringViewToFront(view);
			var oa = view.onActive||$app.onActive;
			if(oa) {
				oa.call(view);
				$app.last_view = null;
			}
		}else{
			if(!view.isPopup)
				$app.hideOthers(view);
			view.drawView.call(view, $app.viewIdx++);
		}
	},
	closeView : function(view,data){
		// console.log("app::closeView",view.name);
		if(view.onClose)
			view.onClose();
		if(view.layer)
			view.layer.remove();
		$app.views.pop();//popup itself
		$this = view.opener || window[$app.start_view];
		$this.layer.show();
		var oa = $this.onActive||$app.onActive;
		if(oa){
			oa.call($this,view,data);
		}
	},

	bringViewToFront : function(v){
		// console.log("app::bringViewToFront",view.name);
		var views = [];
		for(var i=0;i<$app.views.length;i++)
			if(v.name != $app.views[i]);
				views.push($app.views[i]);
		views.push(v.name);
		$app.views = views;
		v.layer.css({display:"block",zIndex:100+($app.viewIdx++)});//.attr({idx:"layer_"+idx});
	},
	hideOthers : function(view){
		// console.log("app::hideOthers",view.name);
		for(var i=0;i<$app.views.length;i++){
			var v = window[$app.views[i]];
			if($app.views[i]!=view.name && v.layer)
				//console.log("hide:",v.layer);
				v.layer.hide();
		}
	}
};


/**
 * view controller base class
 * 
 * properties you should specify
 * 	[string] name 	: the view's name
 * 	[bool] reuable : whether a view is reusable. (won't be removed when its going to the background)
 *
 * DON'T use these property names under $this | your_view
 * 	.parentView
 * 	.opener
 * 	.params
 * 	.render
 * 	
 * 
 * delegate methods
 * 	- onLoad 		: a view is on initilization process
 * 	- onActive 		: a view is going to forground
 * 	- onInactive 	: a view is going to background
 * 	- onTransition 	: a view is going to transit to another view
 * 	- onClose 		: a popup view is closing itself
 * 	- drawHeader 	: draw view's <header> tag
 * 	- drawContent 	: draw view's body <section> tag
 * 	- drawFooter 	: draw view's <footer> tag
 */
var $controller = {
	loaded : function(){
		if(this.parentView){
			this.render.call(this, this.header, this.content, this.footer);
		}else
			$app.handle("loaded",$this);
	},
	close : function(data){
		// console.log("controller::close");
		$app.handle("close",$this,data);
	},
	reload : function(params){
		this.params = params || this.params;
		if(this.onLoad)this.onLoad.call(this,this.params);
		else this.loaded.call(this);
	},
	drawView : function(idx){
		var view = this;
		if(view.layer)view.layer.remove();
		var layer = $article({idx:idx,"class":view.isPopup?"view popup "+view.name:"view "+view.name,view:view.name},document.body);
		view.layer = layer.css({
			width: "100%",height: "100%",zIndex:100+idx,position: "fixed",
			top:'0px',left:'0px',right:'0px',bottom:'0px',margin:'0px',border:'0px',padding:'0px',textAlign:"center"
		});

		view.header = view.noHeader?$header({}):$header({},layer);
		view.content = $section({},layer);
		view.footer = view.noFooter?$footer({}):$footer({},layer);
		if($app.legacy)
			view.wrapper=view.content;

		$controller.render.call(view, view.header, view.content, view.footer, view.layer);
	},

	bringToFront : function(){
		$app.handle("front",$this);
	},

	render : function(header, content, footer, layer){
		if(!this.noHeader && header){
			if($app.drawHeader)
				$app.drawHeader(header,layer);
			if(this.drawHeader) 
				this.drawHeader.call(this,header,layer);
		}

		if($app.drawContent)
			$app.drawContent(content, layer);

		if(this.drawContent)
			this.drawContent.call(this, content, layer);

		if(!this.noFooter && footer){
			if($app.drawFooter)
				$app.drawFooter(footer,layer);
			if(this.drawFooter) 
				this.drawFooter.call(this,footer,layer);
		}
		if(this.parentView){
			$this = window[this.parentView];
		}
		this.parentView=null;
	},

};


/*
YYYY     4-digit year             1999
YY       2-digit year             99
MMMM     full month name          February
MMM      3-letter month name      Feb
MM       2-digit month number     02
M        month number             2
DDDD     full weekday name        Wednesday
DDD      3-letter weekday name    Wed
W        1-kanji weekday name     金
DD       2-digit day number       09
D        day number               9
th       day ordinal suffix       nd
hhh      military/24-based hour   17
hh       2-digit hour             05
h        hour                     5
mm       2-digit minute           07
m        minute                   7
ss       2-digit second           09
s        second                   9
ampm     "am" or "pm"             pm
AMPM     "AM" or "PM"             PM

now.format( "YYYY-MM-DD hh:mm:ss (W)" ) = 2011-10-10 23:11:34 (金)
*/
Date.prototype.format = function(formatString){
	if(isNaN(this.getTime())) return "";
    var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,W,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
    var d = this;
    YY = ((YYYY=d.getFullYear())+"").slice(-2);
    MM = (M=d.getMonth()+1)<10?('0'+M):M;
    MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
    DD = (D=d.getDate())<10?('0'+D):D;
    DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]).substring(0,3);
    W = ["日","月","火","水","木","金","土"][d.getDay()];
    th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
    formatString = formatString.replace("YYYY",YYYY).replace("YY",YY).replace("MMMM",MMMM).replace("MMM",MMM).replace("MM",MM).replace("M",M).replace("DDDD",DDDD).replace("DDD",DDD).replace("DD",DD).replace("D",D).replace("th",th);

    h=(hhh=d.getHours());
    if (h==0) h=24;
    if (h>12) h-=12;
    hh = h<10?('0'+h):h;
    AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
    mm=(m=d.getMinutes())<10?('0'+m):m;
    ss=(s=d.getSeconds())<10?('0'+s):s;
    return formatString.replace("hhh",hhh).replace("hh",hh).replace("h",h).replace("mm",mm).replace("m",m).replace("ss",ss).replace("s",s).replace("ampm",ampm).replace("AMPM",AMPM);
};

String.prototype.ucfirst = function(){
	return this.charAt(0).toUpperCase()+this.substring(1);
};
String.prototype.toHex = function(){
	var str = [],len = this.length;
	for (var i=0; i < len; i += 1) {
	    var c = this.charCodeAt(i);
	    str.push(c.toString(16));
	}
	return str.join('');
};
String.prototype.getByte=function(){
	var count = 0;
	for (var i=0; i<this.length; i++){
		var n = htmlencode(this.charAt(i));
		if (n.length < 4) count++; else count+=2;
	}
	return count;
};
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.CJKLength = function() {
	var str = htmlencode(this).replace(/%u.{4}/gm,"1").replace(/%.{2}/gm,"1");
	return str.length;
};
String.prototype.splice = function( idx, len, sub ) {
    return (this.slice(0,idx) + sub + this.slice(idx + Math.abs(len)));
};
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(prefix) { return this.slice(0, prefix.length) == prefix; };
} 
if (typeof String.prototype.endsWith != 'function') {
	String.prototype.endsWith = function(suffix) { return this.slice(-suffix.length) == suffix; };
}

String.prototype.htmlencode = function() {
	if(!$.__HTML_ESC_EXP){
		$.__HTML_ESC_REV=[];
		for(var k in $.__HTML_ESC)
			$.__HTML_ESC_REV[$.__HTML_ESC[k]]=k;
		$.__HTML_ESC_EXP = new RegExp("["+Object.keys($.__HTML_ESC_REV).join("")+"]","g");
	}
	return this.replace($.__HTML_ESC_EXP,function(x){
		var v = $.__HTML_ESC_REV[x.substring(1,x.length-1)];
		return v?"&"+v+";":x;
	});
},

String.prototype.htmldecode = function() {
	if(!$.__HTML_ESC_DEXP)
		$.__HTML_ESC_DEXP = new RegExp("&("+Object.keys($.__HTML_ESC).join("|")+");","g");
	return this.replace($.__HTML_ESC_DEXP,function(x){
		return $.__HTML_ESC[x.substring(1,x.length-1)]||x;
	});
},

String.prototype.validate = function(type){ 
	var val;
	if(type.indexOf(":")) {
		var parts = type.split(":");
		type = parts[0]; val = parts[1];
		if (parts[2]) var val2 = parts[2];
	}
	switch(type){
		case "id":
			return /^[a-z\d]{6,14}$/.test(this);
		case "is-same":
			return $('input[name="'+val+'"]')[0].value === $('input[name="'+val2+'"]')[0].value ? true:false;
		case "katakana":
			return /^[ア-ン]+\s?[ア-ン]+$/.test(this);
		case "email":
			return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(.+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this);
		case "phone-jp":
    		return /^\d{2,4}[\-]*\d{3,4}[\-]*\d{3,4}$/.test(this);
    	case "zipcode-jp":
    		return /^\d{3}[\-]*\d{4}$/.test(this);
    	case "url":
    		var re = new RegExp(
        	    "^((http|https|ftp)\://)*([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    		return re.test(this);
    	case "len":
    		var min = parseInt(parts[1]);
			var max = parts.length==3 ? parseInt(parts[2]): 0;
 			return (max>0) ?this.length>=min && this.length<=max : this.length>=min;
 	}
	return true;
};

Array.prototype.last = function(){
    return this.length>1?this[this.length - 1]:null;
};

NodeList.prototype.each = function(func){
	if(func) for(var i=0;i<this.length;i++)
		func(this[i],i);
	return this;
};

NodeList.prototype.callfunc = function(func,k,v){
	var f = $.isString(func)? Element.prototype[func]:false;
	if(f) for (var i=0;i<this.length;i++)
		f.call(this[i], k, v);
	return this;
};

NodeList.prototype.attr = function(k,v){return this.callfunc("attr",k,v);};
NodeList.prototype.css = function(k,v){return this.callfunc("css",k,v);};
NodeList.prototype.bind = function(k,v){return this.callfunc("bind",k,v);};
//NodeList.prototype.unbind = function(k){return this.callfunc("unbind",k);};
NodeList.prototype.hide = function(k){return this.callfunc("hide");};
NodeList.prototype.show = function(){return this.callfunc("show");};
NodeList.prototype.addClass = function(v){return this.callfunc("addClass",v);};
NodeList.prototype.removeClass = function(v){return this.callfunc("removeClass",v);};
NodeList.prototype.forEach = Array.prototype.forEach;

var $deltas = {
	linear : function (progress) {
		return progress;
	},
	/** accelerator
	 * o > >> >>> >>>> >>>>>
	 * */
	quad : function (progress) {
		return Math.pow(progress, 2);
	},
	/** accelerator faster
	 * o > >>> >>>>> >>>>>>> >>>>>>>>>>>
	 * */
	quad5 : function (progress) {
		return Math.pow(progress, 5);
	},
	
	/** throwing 
	 * o >> > ... > >> >>> >>>>
	 * */
	circ : function (progress) {
		return 1 - Math.sin(Math.acos(progress));
	},
	/** bow - arrow 
	 * << < o > >> >>> >>>>
	 * */
	back : function (progress, x) {
		x = x||1.5;
		return Math.pow(progress, 2) * ((x + 1) * progress - x);
	},
	/**  
	 * < > < > < > o > >> >>> >>>>
	 * */
	bounce : function (progress) {
		for(var a = 0, b = 1, result; 1; a += b, b /= 2) {
			if (progress >= (7 - 4 * a) / 11) {
				return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
		    }
		}
	},
	/** 
	 * < > << >> <<< >>> o > >> >>> >>>>
	 * */
	elastic : function (progress, x) {
		x = x||0.1;
		return Math.pow(2, 10 * (progress-1)) * Math.cos(20*Math.PI*x/3*progress);
	},
	
	/**
	 * reverse
	 * example : easeOut('bounce')(progress);
	 * */
	easeOut : function (delta) {
		if(typeof(delta)=="string")
			delta = $deltas[delta];
		return function(progress){
			return 1 - delta(1 - progress);
		};
	},
	
	/**
	 * repeat 0~50% and reverse. 
	 * */
	easeInOut : function (delta) { 
		if(typeof(delta)=="string")
			delta = $deltas[delta];
		return function(progress){
			if (progress <= 0.5) { // the first half of the animation)
				return delta(2 * progress) / 2;
			} else { // the second half
				return (2 - delta(2 * (1 - progress))) / 2;
			}
		};
	}
};	

var __element = {

	isSvg : function(){
		window.__svgTagIndex = window.__svgTagIndex||__tags.indexOf('svg');
		return __tags.indexOf(this.tagName.toLowerCase())>=window.__svgTagIndex;
	},

	addClass : function(cls) {
		if(this.isSvg()){
			var c = this.getAttribute("class")||"";
			c=c.length>0?c+" ":"";
			this.setAttribute("class",c+cls);
		}else
			if(!this.hasClass()){this.className = this.className+" "+cls;}    
		return this;
	},
	
	removeClass : function(cls) {
		if(!cls)return this;
		cls = cls.trim();
		var iS = this.isSvg();
		var cn = iS?this.getAttribute("class"):this.className;
		cn = cn.replace(new RegExp("\\b"+cls+"\\b","g"),"").replace(/\s+/g," ").trim();
		if(iS)
			this.setAttribute('class',cn);
		else 
			this.className = cn;
	    return this;
	},

	hasClass : function(cls){
		var iS = this.isSvg();
		var cn = iS?this.getAttribute("class"):this.className;
		return cn&&cn.match(new RegExp("\\b"+cls+"\\b","g"));
	},
	
	css : function(arg1,arg2){
		if(typeof(arg1)=="string"){
			if(arg2!==undefined){
				if(arg1.indexOf("background")>=0 && arg2.indexOf("url(")>=0 && $conf.image_path && arg2.indexOf("data:image")<0 && arg2.indexOf("http")<0){
					arg2 = arg2.replace("url(", "url("+$conf.image_path);
				}
                if ($browser.name == "Firefox")
                    this.style.setProperty(arg1.replace(/[A-Z]/g,function(v){return "-"+v.toLowerCase();}), arg2);
                else
                    this.style[arg1] = arg2;
            } else
                return this.style[arg1];
		}else if(typeof(arg1)=="object" && !arg2){
			for(var f in arg1){
				this.css(f,arg1[f]);
			}
		}
		return this;
	},

	attr : function(arg1,arg2){
		if(typeof(arg1)=="string"){
			if(arg1=="var"){
				__set(arg2,this);
				return this;
			}
			if(arg1=="id"){
				this.id = arg2;
				__set(arg2,this);
				return this;
			}
			if(arg1=="html")
				arg1 = "innerHTML";

			if(!this.isSvg() && (arg1=="class"||arg1=="classname"))
				arg1 = "className";

			if(arg1=="url" && typeof(arg2)=="string")
				this.bind("click", $app.trans);
			
			if(arg2!=undefined){//set
				if(this.tagName.toUpperCase() == "IMG" && arg1.toLowerCase()=="src"){
					this[arg1] = $conf.image_path && arg2.indexOf("data:image")<0 && arg2.indexOf("http")!=0? $conf.image_path+arg2:arg2;
				}else{
					this[arg1] = arg2;
				}
				if(typeof(arg2)!="function" && !$.isBool(arg2)){
					if(arg1!="innerHTML"&&arg1!="className"&&arg1!="src") //FIXME check if element has this property
						this.setAttribute(arg1,arg2);	
				}
			}else{//get
				var v = this.getAttribute(arg1);
				return v && v.match(/^\d+$/)?parseInt(v):v;
			}
		}else if(typeof(arg1)=="object" && !arg2){
			for(var _f in arg1){
				if(typeof(arg1[_f])=="function"){
					this.bind(_f, arg1[_f]);
				}else{
					this.attr(_f,arg1[_f]);
				}
			}	
		}
		return this;
	},

	find : function(q,f){var qs=q.split(" "),qu=qs[qs.length-1];var r=this.querySelectorAll(q);
		if($.isFunc(f)) for(var i=0,el;el=r[i];i++) f(el,i);
		return qu.indexOf("#")==0?r[0]:r;
	},
	
	find1st : function(q){var qs=q.split(" "),qu=qs[qs.length-1];var r=this.querySelectorAll(q);return r?r[0]:null;},

	bind : function(arg1, arg2){
		if(typeof(arg1)=="string"){
			if(arg2){
				arg1 = arg1.replace(/^on/,'');
				if(!$browser.mobile && arg1.indexOf("touch")==0) 
					arg1 = {"touchstart":"click","touchmove":"mousemove","touchend":"mouseup"}[arg1];
				if($browser.mobile && arg1=='click'){
					var el = this;var handler = arg2;
					this.addEventListener('touchstart',function(e){
						TSX = e.changedTouches[0].screenX;
						TSY = e.changedTouches[0].screenY;
					});
					this.addEventListener('touchend', function(e){
						var x = e.changedTouches[0].screenX,y = e.changedTouches[0].screenY;
						if(Math.abs(x-TSX)>12||Math.abs(y-TSY)>12)return;
						handler.apply(el,e);
					}, false);
				}else
					this.addEventListener(arg1, arg2, false);
			}
		}else if(typeof(arg1)=="object" && !arg2){
			for(var f in arg1){
				this.bind(f,arg1[f]);
			}
		}
		return this;
	},

	unbind : function(){
		console.log("ERR : unbind is removed, since it will lead a performance problem. use lock,unlock instead.")
	},

	/**
	 * be careful this will unbind all
	 * @return {[type]} [description]
	 */
	lock : function(){
		var mirror=this.clone(false).attr("__clone","true");
		this.hide().attr("__lock","true");
		return mirror;
	},
	unlock : function(){
		var org = this.nextSibling;
		if(this.attr("__clone") && org&&org.attr("__lock","true")){
			this.remove();
			org.show().removeAttribute("__lock");
		}
		return org;
	},

	/**
	 * clone a element including childs and append to target.
	 * @param  replace:optional, insert the new clone obj before current one.and distory current one.
	 * FIXME : IE does not support cloneNode?
	 * @return cloned DOMElement.
	 */
	clone : function(replace){
		var c=this.cloneNode(true);
		if(replace && this.parentNode){
			this.parentNode.insertBefore(c, this);
			this.remove();
		}
		return c;
	},
	
	/**
	 * get the child numerical index in its parent node.
	 * @return {int} 0-N
	 */
	index : function(){
		var  i= 0;
    	while((elem=elem.previousSibling)!=null) ++i;
    	return i;
	},

	rect : function(){
		var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop,
			scrollLeft = (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;
		if(this.getBoundingClientRect){
			var r = this.getBoundingClientRect();//Read only
			return {top:r.top+scrollTop, width:r.width, left:r.left+scrollLeft, height: r.height};
		}	
		var _x = 0,_y = 0,w = this.width(),h = this.height();
		var el = this;
	    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
	        _x += el.offsetLeft - el.scrollLeft;
	        _y += el.offsetTop - el.scrollTop;
	        el = el.offsetParent;
	    }
	    //offsetWidth (includes padding...)
	    return { top: _y+scrollTop, left: _x+scrollLeft,width:w,height:h};			
	},
	
	height : function(){
		return Math.max(this.clientHeight||0,this.scrollHeight||0,this.offsetHeight||0);
	},
	width : function(){
		return Math.max(this.clientWidth||0,this.scrollWidth||0,this.offsetWidth||0);
	},

	hide : function(time){
		if(this.style.display!="none" && !this.attr("__orgDisplay")) 
			this.attr("__orgDisplay",this.style.display);
		if(time>0)
			this.animate({duration:time,style:"easeIn",step:function(el,delta){
				el.style.opacity=1-delta;
				if(delta>=1){el.style.opacity=1;el.style.display="none";}
			}});
		else
			this.style.display = "none";
		return this;
	},
	show : function(time){
		if(this.style.display!="none" && !this.attr("__orgDisplay")) 
			this.attr("__orgDisplay",this.style.display);
		if(time>0)
			this.css({"display":this.attr("__orgDisplay")||"block","opacity":0}).animate({duration:time,style:"easeOut",step:function(el,delta){
				el.style.opacity=delta;
				if(delta>=1){el.style.display=el.attr("__orgDisplay")||"block";}
			}});
		else
			this.style.display = this.attr("__orgDisplay")||"block";
		return this;
	},
	toggle : function(time){
		if(this.style.display=="none") return this.show(time);
		else return this.hide(time);
	},
	remove : function(el){
		if(this.parentNode)
			this.parentNode.removeChild(this);
	},
	left : function(target) {
		if($.isElement(target) && target.parentNode)
			target.parentNode.insertBefore(this,target);
		return this;
	},
	right : function(target) {
		if($.isElement(target) && target.parentNode)
			if(target.nextSibling)
				target.parentNode.insertBefore(this, target.nextSibling);
			else
				target.parentNode.appendChild(this);
		//else TODO $app.onError
		return this;
	},
	/**
	 * disable | enable selection of a node.
	 * @param  string v : none|all|text|element
	 * @return this node.
	 */
	selectable : function(v){
		v = v===false?"none":(v===true?"all":v);
		return this.bind("selectstart",function(e){return e.preventDefault();}).css({"-moz-user-select": v, "-webkit-user-select": v, "-ms-user-select":v, "user-select":v});
	},
	/**
	 * Animation refactored
		@delay : time wait to start
		@frame : how many frames per second. (1000ms) || 50
		@duration : The full time the animation should take, in ms. default = 1000ms
		@delta(progress) : A function name, which returns the current animation progress. @see $deltas
		@style : easeIn(default), easeOut, easeInOut
		@step(element, delta) : function. do the real job
		@examples:
		$id("img").animate({delta :"bounce",style : "easeOut",step: function(el, delta){
			el.style.marginTop = delta*600;
		}}).animate({delta :"quad",style :"easeOut",step:function(el, delta){
			el.style.marginLeft = delta*600;
			el.style.width = delta*24*10; 
		}});
		
	 * */
	animate : function (opts) {
		var ele = this;
		if(opts.delay){
			var delay = parseInt(opts.delay);
			delete opts["delay"];
			setTimeout(function(arg){
				if(arg.ele)
					arg.ele.animate(arg.opts);
			}, delay, {ele:ele, opts:opts});
			return ele;
		}
		var start = Date.now();
		opts.duration = opts.duration||1000;
		opts.frame = opts.frame || 60;
		opts.interval = 1000/opts.frame;
		opts.delta = opts.delta || "linear";
		var interv= setInterval(function() {
			var timePassed = new Date - start;
			var progress = timePassed / opts.duration;
			if (progress > 1) progress = 1;
			var delta = $deltas[opts.delta];
			if(opts.style){
				if(opts.style=="easeOut") delta = $deltas.easeOut(delta);
				if(opts.style=="easeInOut") delta = $deltas.easeInOut(delta);
			}
			var delta_value = delta(progress); 
			opts.step(ele, delta_value);
			if (progress == 1) {
				clearInterval(interv);
			}
		}, opts.interval);
		return this;
	},
	hover : function(over,out){
		if(over){
			this.attr({"__over":"("+over.toString()+")","__exec":"no"});
			this.bind({mouseover:function(e){
				e = e||window.event;var t=e.target||e.srcElement;
				var f = eval(t.attr("__over"));
				if(f && "no"===t.attr("__exec")){t.attr("__exec","yes");f.call(t,e);}
				else return e.preventDefault()&&false;
			}});
		}
		if(out){
			this.attr({"__out":"("+out.toString()+")"});
			this.bind({mouseout:function(e){
				e = e||window.event;
				var t=e.target||e.srcElement;
				var rect = t.rect();
				if($.inRect($.cursor(e),rect)){
					return e.preventDefault()&&false;	
				}else{
					var out = eval(t.attr("__out"));
					if(out){t.attr({"__exec":"no"});out.call(t,e);}
				}
			}});
		}
		return this;
	},
	fire : function(eventName, option){
		var opt = $.extend($.__eventOpts, option || {}),
    		oe=null, etype = null;
	    for (var name in $.__events){
	        if ($.__events[name].test(eventName)) { etype = name; break; }
	    }
	    if (!etype){
	    	if($app.onError)$app.onError("event_fire_error",{name:eventName});
	    	throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
	    }
	    if(this[eventName]){
	    	this[eventName]();
	    }else if (document.createEvent){//Webkit & FF
	        oe = document.createEvent(etype);
	        if (etype === 'HTMLEvents'){
	            oe.initEvent(eventName, opt.bubbles, opt.cancelable);
	        }else{
	            oe.initMouseEvent(eventName, opt.bubbles, opt.cancelable, document.defaultView,
	            		opt.button, opt.pointerX, opt.pointerY, opt.pointerX, opt.pointerY,
	            		opt.ctrlKey, opt.altKey, opt.shiftKey, opt.metaKey, opt.button, this);
	        }
	        this.dispatchEvent(oe);
	    }else{//IE
	        opt.clientX = opt.pointerX;
	        opt.clientY = opt.pointerY;
	        var evt = document.createEventObject();
	        oe = $.extend(evt, opt);
	        this.fireEvent('on' + eventName, oe);
	    }
		return this;
	}
};

if (typeof Element.prototype.animate == 'function') 
	Element.prototype.animate = __element.animate;
$.extend(Element.prototype,__element);


/* DOM functions */
var $e = function(type, args, target, namespace){
	type = namespace && $.isString(type)? type.replace(/_/g, "-"):type;
	var _el = $.isString(type)? (namespace? document.createElementNS(namespace,type):document.createElement(type)) : ($.isElement(type)?type:null);
	if(!_el) throw new Error("ERROR : $e wrong parameters ");
	if($.isString(target))
		target = document.getElementById(target);
	if(args){
		if($.isString(args)){
			switch(type){
				case "img" : _el.src = $conf.image_path && args.indexOf("data:image")<0 && args.indexOf("http")<0? $conf.image_path+args:args;
					break;
				case "a" : _el.href = args;
					break;
				default :
					if(args.match(/<.*>/))
						_el.innerHTML = args;
					else
						_el.textContent = args;
					break;
			}
		}else if($.isArray(args)){
			for(var i=0,o;o=args[i];i++){
				$e(_el,o,null,namespace);
			}
		}else if($.isElement(args)){
			_el.appendChild(args);
		}else if($.isFunc(args)){
			$e(_el, args(), null, namespace);
		}else if($.isObject(args)){
			for(var _k in args){
				var _v = args[_k];
				if(typeof(_v)=="function"){
					_el[_k] = _v;
				}else{
					_el.attr(_k, _v);
				}
			}
		}
	}
	if(target&&typeof(target)!="function")
		target.appendChild(_el);
	return _el;
};

/**
NOT IN USE : "html","script","link","iframe","head","body","meta",
NOT IN USE (Deprecated) : "acronym","applet","basefont","big","center","dir","font","frame","frameset","noframes","strike","tt"
NOT IN USE (uncommon) : "details"-"summary","dialog","bdi","command","menu","track","wbr"
NOT IN USE (Others) : "rp"-"rt"-"ruby","object"-"param","noscript",

NOT IN USE (Duplicated) : "del" -> "s", "blockquote" -> "q", "ins" -> "u"

Override : "select"(with TODO:"optgroup","option") -> use $select() instead
Override : "style" -> use $styles(rules, target) instead

TODO datalist -> for safari

TODO : "keygen" for IE //http://www.w3schools.com/tags/tag_keygen.asp
TODO : "meter" for IE //http://www.w3schools.com/tags/tag_meter.asp
TODO : "output" for IE http://www.w3schools.com/tags/tag_output.asp TODO input-range, input-number;

*/
var __tags = [ 
 //Struct Common
 "div","p","span","br","hr",
 "ul","ol","li","dl","dt","dd",
 "article","section","aside","footer","header","nav",	//HTML5
 
 //Table
 "table","caption","tbody","thead","tfoot","colgroup","col","tr","td","th",
 
 //Form
 "form","fieldset","legend","input","label","textarea","select","option",

 //Markup
 "b","h1","h2","h3","h4","h5","h6","cite","pre",
 "s","u","i","mark","q","small","sub","sup","abbr","bdo",
 "time",	//HTML5
 
 //Phrase - Maybe will be deprecated in the future
 "em","dfn","code","samp","strong","kbd","var",
 
 //Struct Image
 "map","area","figure","figcaption",
 
 //Resources, Objects, Tools
 "a","img","button",
 "progress",
 "address","base",
 "canvas","embed","audio","video","source","progress", //HTML5

 //SVG tags
 'svg','altglyph','altglyphdef','altglyphitem','animate','animateColor','animateMotion','animateTransform',
 'circle','clippath','color_profile','cursor','defs','desc','ellipse',
 'feblend','fecolormatrix','fecomponenttransfer','fecomposite','feconvolvematrix','fediffuselighting','fedisplacementmap','fedistantlight','feflood','fefunca','fefuncb','fefuncg','fefuncr','fegaussianblur','feimage','femerge','femergenode','femorphology','feoffset','fepointlight','fespecularlighting','fespotlight','fetile','feturbulence',
 'filter','font','font_face','font_face_format','font_face_name','font_face_src','font_face_uri','foreignobject',
 'g','glyph','glyphref','hkern','image','line','lineargradient','marker','mask','metadata','missing_glyph',
 'mpath','path','pattern','polygon','polyline','radialgradient','rect','script','set','stop','style','switch','symbol','text','textpath','tref','tspan','use','view','vkern'

];
var _ns = "";
for(var i=0;i<__tags.length;i++){
	var tag=__tags[i];
	if(tag=="svg") _ns = ",'http://www.w3.org/2000/svg'";
	eval(["window.$" , tag ,"=",tag.toUpperCase(), "= function(args,target){ return $e('" , tag,  "', args,target",_ns,"); };"].join(''));
};

//["table","tr","th","td","div","img","ul","lo","li","p","i","a","b","strong","textarea","br","hr","form","input","span","label","h1","h2","h3","canvas"].forEach();

/**
 * checkbox / radiobox
 * 
 * @params options : [{label:"label1",value:"value1"},{label:"label2",value:"value2"}}
 * @params attrs : {
 * 			name:xxxx, //required name of form item
 * 			type:checkbox|radio //required.
 * 			drawOption : function(el, i, attrs ){} //custom drawing,
 * 			             // el=<label>-<input> element, i=index, 
 * 			onclick : function(){},... //other events are also supported
 * 		}
 * @params target //which dom to insert
 * 
 * */
var $sel = function(options,attrs,target){
	var onclick = attrs.onclick;
	delete attrs["onclick"];
	var values = attrs.value===undefined? []:attrs.value+"";
	if($.isString(values))
		values = values.split(",");
	var drawFunc = $.isFunc(attrs.drawOption)?attrs.drawOption:null;
	var doms = [];
	for(var i=0,o;o=options[i];i++){
		var lb = $label({},target);
		var v = $.isObject(o)?o.value:i+1;
		if(drawFunc) drawFunc(lb,i);
		else{
			lb.attr({html:$.isObject(o)?o.label:o}).css({position:"relative","padding-left":"20px","text-align":"left"});
			if(attrs.columns)lb.css({width:100/parseInt(attrs.columns)+"%"});
			$input({type:attrs.type, name:attrs.name, value:v, checked:values.indexOf(v+"")>=0?true:false},lb)
				.css({display:"block",position:"absolute",left:0,top:"50%",transform:"translateY(-50%)"});
			if(onclick) lb.bind("click",onclick);
		}
		doms.push(lb);
	}
	return doms;
};

var $radio = function(options,attrs,target){
	attrs = attrs||{};
	delete attrs["multiple"];
	attrs.type='radio';
	return $sel(options,attrs,target);
};
//window.RADIO = $radio;

var $checkbox = function(options,attrs,target){
	attrs = attrs||{};
	attrs.multiple=1;
	attrs.type='checkbox';
	return $sel(options,attrs,target);
};
//window.CHECKBOX = $checkbox;

var $select = function(values,attrs,target){
	var s = $e("select",attrs,target);
	if($.isArray(values)){
		for(var i=0,v;v=values[i];i++)
			$e("option",{value:$.isObject(v)?v.value:i+1,html:$.isObject(v)?v.label:v}, s);
	}else{
		for(var k in values){
			var v = values[k];
			if(!$.isFunc(v)){
				$e("option",{value:$.isObject(v)?v.value:k,html:$.isObject(v)?v.label:v}, s);
			}
		}
	}
	if(attrs.value)
		s.value = attrs.value;
	return s;
};

/**
 * add css rules runtime.
 * 
 * @param rules : hash | css string 
 * @example
 * $styles({
 * 	".myClass" : {width:30, height:"40px"},
 *  "#myId" : {width:30, height:"40px"},
 * 	...
 * },document.head);
 *
 * @param target : where to insert
 * @param id : id of the style tag (optional)
 * 
 * @return new style tag id;
 * */
var $styles=function(rules,target,id){
	target = target||document.body;
	var opt = {type:"text/css"};
	if(id)opt.id = id;
	var cs = $e('style',opt,target);
	var tn = document.createTextNode("");
	if(typeof(rules)=="string"){
		tn.appendData(rules);
	}else{
		for(var k in rules){
			var v = typeof(rules[k])=="string"?rules[k] : $.serialize(rules[k], ";", ":");
			if($.isFunc(v))continue;
			tn.appendData([k, "{", v, "}\n"].join(""));
		}
	}
	cs.appendChild(tn);
	return tn;
};


var $http = {
	getRequest : function(){
		return (window.XMLHttpRequest) ? new XMLHttpRequest()/*code for IE7+, Firefox, Chrome, Opera, Safari*/
		:new ActiveXObject("Microsoft.XMLHTTP"); /*ie5-6*/
	},
	
	/**
	 * 
	 * @param  Object opts
	 *     .url
	 *     .method
	 *     .params
	 *     .callback
	 *     .format
	 *     .onprogress
	 * 
	 */
	ajax : function(opts){
		//ajax : function(method, url, params, callback, format, onprogress){
		if(!opts || !opts.url) throw "ERR: $http.ajax wrong params ";

		var url = $conf.http_host && opts.url.indexOf("http")!=0 ? $conf.http_host+opts.url : opts.url,
			xhr = $http.getRequest(),
			params = opts.params||{},
		 	format = opts.format||"json",
		 	method = opts.method||"GET",
		 	callback = opts.callback||null;

		xhr.runtime = {
			callback : callback,
			format : format,
			url : url,
			method : method,
			params : params
		};
		if(opts.onprogress)
			xhr.runtime.onprogress = opts.onprogress;

		var isFile = false;
		method =method.toUpperCase();
		var data = method==='GET'?[] : new FormData();//GET does not support formdata
  		if(params){
  			for (var key in params){
  				var v = params[key];
  				var vs = $.isArray(v)?v:[v];
  				var isf = false;
  				for(var i=0,vi;vi=vs[i++];){
  					if(method!='GET'&&$.isFile(vi)){
  						data.append(key,vi,vi.name);
  						isFile=true;
  						isf = true;
  					}
  				}
  				if(!isf){
  					if(method==='GET')
  						data.push(encodeURIComponent(key)+'='+encodeURIComponent(v));
  					else
  						data.append(key,v);
  				}
  			}
  			if(method == 'GET'){
  				var prefix = url.indexOf('?')>0 ? '&':'?';
  				url += prefix + data.join('&');
  				data = null;
  			}
  		}
		if(method == "UPLOAD"){
			method = "POST";
			isFile = true;
			xhr.upload.addEventListener("progress", function(e) {
				var pc = parseInt(100 - (e.loaded / e.total * 100));
				if(xhr.runtime.onprogress)
					xhr.runtime.onprogress(pc);
			}, false);
		}
		xhr.onreadystatechange=function(){
  			if (xhr.readyState==4 ){
  				if(xhr.status==200){
  					if(xhr.runtime.callback){
	  					var res = xhr.responseText;
	  					if (xhr.runtime.format === 'json') {
	  						try{
	  							res = JSON.parse(res);
	  						}catch(ex){
	  							var err = $.extend({code:200,type:"json_error"},xhr.runtime);
	  							if($app.onError)$app.onError("http_parse_error",err);
	  							return xhr.runtime.callback(null,err);
	  						}
	  					}
	    				xhr.runtime.callback(res);
    				}	
  				}else{
  					var errors = $.extend({
	    				code : xhr.status,
	    				message : xhr.getResponseHeader("ERROR_MESSAGE"),
	    				data : xhr.responseText
	    			},xhr.runtime);
  					if(xhr.runtime.callback)
  						xhr.runtime.callback(null, errors);	
  					if($app.onError)$app.onError("http_server_error",errors);	
	  			}
    		}
  		};
  		xhr.open(method,url,true);
  		if(method=='GET')
  			xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  		/*
  		var fd = {};
  		if(data)
  		for (var pair of data.entries()) {
  			if(!fd[pair[0]])
 		   		fd[pair[0]]=pair[1];
 		   	else if($.isArray(fd[pair[0]])){
 		   		fd[pair[0]].push(pair[1]);
 		   	}else{
 		   		fd[pair[0]] = [fd[pair[0]], pair[1]];
 		   	}
		}
  		console.log(url,method,fd);
  		*/
  		xhr.send(data);
	},
	get : function(url, params, callback, format){
		$http.ajax({url:url, method:"GET", params:params, callback:callback, format:format});
	},
	post : function(url, params, callback, format){
		$http.ajax({url:url, method:"POST", params:params, callback:callback, format:format});
	},
	put : function(url, params, callback, format){
		$http.ajax({url:url, method:"PUT", params:params, callback:callback, format:format});
	},
	del : function(url, params, callback, format){
		$http.ajax({url:url, method:"DELETE", params:params, callback:callback, format:format});
	},
	upload : function(url, params, callback, format, onprogress){
		$http.ajax({url:url, method:"UPLOAD", params:params, callback:callback, format:format, onprogress:onprogress});
	}
};

