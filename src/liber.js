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
	var usingView = ($app.status === "loaded" && $this && $this.layer);
	return (usingView) ? $this.layer.find("#"+domid):document.getElementById(domid);
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
	return Object.prototype.toString.call(v) === '[object Array]';
}
$.isFunc = function(f) {
	var getType = {};
	return f && getType.toString.call(f) === '[object Function]';
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
	for(var i in parts){
		 var ps = parts[i].split(kvSpliter);
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
		if(document.head){
			head.appendChild(se);
			se.src = src.indexOf("liber.")>=0 ? src+"?v="+time:src;
		}else{
			se.src = src.indexOf("liber.")>=0 ? src+"?v="+time:src;
			head.appendChild(se);
		}
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
$.remvoe = function(el){
	if(el&&el.remove)el.remove();
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

		//init history handler
		window.onhashchange = function (e) {
			var hash = window.location.hash;;
			// console.log("History:",hash);
			if(hash.startsWith("#")){
				hash = hash.replace(/^#/,"");
				if(hash.match(/^~/)){
					var func = hash.replace(/^~/,"");
					try{eval(func+"()");}catch(ex){
						if($app.onError) $app.onError("wrong_func_url_error");
					}	
				}else{
					var vname = hash.split("?")[0];
					if(window[vname] && window[vname].drawContent)
						$app.openView(hash);
				}
			}
		};

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
		for(var i in $conf.modules)
			$.include($conf.modules[i], step, $conf.modules[i]);
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
		// console.log("loaded:",$app.start_view);
		$app.openView($app.start_view);
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
		if(url && $.isString(url)){
			if(url.match(/@\?*/)) //is popup
				$app.openView(url.replace('@?','?'), true);
			else {
				var isSM = $browser.mobile && !$browser.simulator;
				var evName = isSM?"touchstart":"click";
				//FIXME!!!:: check if this element has touchstart event.
				if(this.tagName!="A")
					$a({href:"#"+url, html:"_"},document.body).css({opacity:0}).fire(evName);
				else
					this.fire(evName);	
			}
			e = e||window.event;
			e.stopPropagation();
		}
	},
	openView : function(url, popup){
		// console.log("openview",url);
		if(url && $.isString(url)){
			if(url.indexOf("http:")==0 || url.indexOf("https:")==0){
				return location.href = url;
			}else{//init view 
				var params = $.unserialize(url),
					vname = url.split("?")[0],
					opener = $this;
				if(vname.endsWith("@")) {
					popup = true;
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
				if(opener && opener.onInactive) 
					opener.onInactive.call(opener,view);
				if(popup)
					view.isPopup = true;
				
				$app.views.push(vname);	
				
				$this = view;

				if(view.onload)view.onLoad = view.onload;
				if(view.onLoad)
					view.onLoad.call(view,params);
				else
					view.loaded();//$controller.loaded
			}
		}else{
			if($app.onError)$app.onError("unsupported_url_type_error",{url:url});
			throw new Error("ERROR : $app.openView requires string type url");			
		}
	},
	drawView : function(view){
		if(!view) return; //FIXME
		if(view.reusable && view.layer){//FIXME
			if(view.layer && !view.layer.parentNode)
				document.body.appendChild(view.layer);
			$app.bringViewToFront(view);
			if(view.onActive) {
				view.onActive.call(view);
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
		if($this && $this.onActive){
			$this.onActive.call($this,view,data);
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

var $controller = {
	loaded : function(){
		$app.handle("loaded",$this);
	},
	close : function(data){
		// console.log("controller::close");
		$app.handle("close",$this,data);
	},
	reload : function(params){
		this.params = params || this.params;
		if(this.onLoad)this.onLoad.call(this,this.params);
		else this.loaded();
	},
	drawView : function(idx){
		// console.log("controller::drawView");
		var view = this;
		var layer = $article({idx:idx,"class":view.isPopup?"view popup "+view.name:"view "+view.name,view:view.name},document.body);
		//FIXME
		layer.css({
			width: "100%",height: "100%",zIndex:100+idx,position: "fixed",
			top:'0px',left:'0px',right:'0px',bottom:'0px',margin:'0px',border:'0px',padding:'0px',textAlign:"center"
		});
		if(!view.noHeader){
			view.header = $header({},layer);
			if(view.drawHeader) 
				view.drawHeader.call(view,view.header,layer);
			else if($app.drawHeader)
				$app.drawHeader(view.header);
		}

		var c = $section({},layer);
		if(view.drawContent){
			if(view.layer)
				view.layer.remove();
			view.layer = layer;
			view.content = c;
			if($app.legacy)
				view.wrapper=c;
			view.drawContent.call(view, c, layer);
		}
		if(!view.noFooter){
			view.footer = $footer({},layer);
			if(view.drawFooter) 
				view.drawFooter.call(view,view.footer,layer);
			else if($app.drawFooter)
				$app.drawFooter(view.footer);
		}
	},

	bringToFront : function(){
		$app.handle("front",$this);
	},
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
	}
	switch(type){
		case "email":
			return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(.+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this);
		case "phone-jp":
    		return /^[a-zA-Z0-9\-().\s]{8,15}$/.test(this);
    	case "zipcode-jp":
    		return /^\d{5}(-\d{4})?$/.test(this);
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


NodeList.prototype.each = function(func){
	if(func) for(var i=0;i<this.length;i++)
		func(this[i],i);
	return this;
};

NodeList.prototype.callfunc = function(func,k,v){
	var f = (func && (typeof func == 'string' || func instanceof String))?
		Element.prototype[func]:false;
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
			if(this.className.indexOf(cls)<0){this.className = this.className+" "+cls;}    
		return this;
	},
	
	removeClass : function(cls) {
		if(!cls)return this;
		cls = cls.trim();
		var iS = this.isSvg();
		var cn = iS?this.getAttribute("class"):this.className;
		cn = cn.replace(new RegExp("\\b"+cls+"\\b","g"),"").replace(/\s+/g," ");
		if(iS)
			this.setAttribute('class',cn);
		else 
			this.className = cn;
	    return this;
	},

	hasClass : function(cls){
		var iS = this.isSvg();
		var cn = iS?this.getAttribute("class"):this.className;
		return cn&&new RegExp("\\b"+cls+"\\b","g").test(cn);
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
			
			if(arg2!=undefined){
				if(this.tagName.toUpperCase() == "IMG" && arg1.toLowerCase()=="src"){
					this[arg1] = $conf.image_path && arg2.indexOf("data:image")<0 && arg2.indexOf("http")!=0? $conf.image_path+arg2:arg2;
				}else{
					this[arg1] = arg2;
				}
				if(typeof(arg2)!="function" && !$.isBool(arg2)){
					if(arg1!="innerHTML"&&arg1!="className"&&arg1!="src") //FIXME check if element has this property
						this.setAttribute(arg1,arg2);	
				}
			}else{
				//return this[arg1]?this[arg1]:this.getAttribute(arg1);
				return this.getAttribute(arg1);
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
	before : function(target) {
		if($.isElement(target) && target.parentNode)
			target.parentNode.insertBefore(this,target);
		//else TODO $app.onError
		return this;
	},
	after : function(target) {
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
//var $_runtime;
var $e = function(type, args, target, namespace){
	type = namespace? type.replace(/_/g, "-"):type;
	var _el = namespace? document.createElementNS(namespace,type):document.createElement(type);
	if(target && typeof(target)=="string")
		target = $id(target);
	if(args){
		var dataType = typeof(args);
		if(dataType=="string"){
			switch(type){
				case "img" : _el.src = $conf.image_path && args.indexOf("data:image")<0 && args.indexOf("http")<0? $conf.image_path+args:args;
					break;
				case "a" : _el.href = args;
					break;
				default : _el.innerHTML = args;
					break;
			}
		}else if($.isArray(args)){
			for(var i=0;i<args.length;i++){
				var o = args[i];
				if(o!=null){
					if($.isElement(o)){
						_el.appendChild(o);
					}else if($.isFunc(o)){
						var thisEl = _el;
						var res = o();
						if($.isArray(res)){
							for(var _i=0;_i<res.length;_i++){
								if($.isElement(res[_i]))
									thisEl.appendChild(res[_i]);
							}
						}else if($.isElement(res)){
							thisEl.appendChild(res);
						}
						_el = thisEl;
					}else{
						if($app.onError)$app.onError("invalid_child_error");
					}
				}
			}
		}else if($.isElement(args)){
			_el.appendChild(args);
		}else if($.isFunc(args)){
			return $e(type, args(), target);
		}else if(dataType=="object"){
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
	var values = attrs.value||[];
	if($.isString(values))
		values = values.split(",");
	var drawFunc = $.isFunc(attrs.drawOption)?attrs.drawOption:null;
	for(var i=0,o;o=options[i];i++){
		var lb = $label({},target);
		if(drawFunc) drawFunc(lb,i);
		else{
			lb.attr({html:o.label}).css({position:"relative","padding-left":"20px","text-align":"left"});
			$input({type:attrs.type, name:attrs.name, value:o.value, checked:values.indexOf(o.value)>=0?true:false},lb)
				.css({display:"block",position:"absolute",left:0,top:"50%",transform:"translateY(-50%)"});
			if(onclick) dd.bind("click",onclick);
		}
			
	}

};

var $radio = function(options,attrs,target){
	delete attrs["multiple"];
	return $sel(options,attrs,target);
};
//window.RADIO = $radio;

var $checkbox = function(options,attrs,target){
	attrs["multiple"]=1;
	return $sel(options,attrs,target);
};
//window.CHECKBOX = $checkbox;

var $select = function(values,attrs,target){
	if($browser.name=="MSIE" && $browser.ver<9 && attrs.name ){
		var sele = document.createElement(["<select name=", attrs.name, "></select>"].join("\'"));
		sele.attr(attrs);
		if(target)
			target.appendChild(sele);
	}else{
		sele = $e("select",attrs,target);
	}
	if($.isArray(values)){
		for(var i in values)$e("option",{value:values[i],html:values[i]}, sele);
	}else{
		for(var v in values)$e("option",{value:v,html:values[v]}, sele);
	}
	if(attrs.value)
		sele.value = attrs.value;
	return sele;
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
			tn.appendData([k, "{", v, "}\n"].join(""));
		}
	}
	cs.appendChild(tn);
	return sid;
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
  		var userdata = '';
  		if(params){
  			var datas = [];
  			for (var key in params){
                var value = params[key]+"";
  				key = encodeURIComponent(key);
                value =!isFile ? encodeURIComponent(value) :value;
  				datas.push(key+'='+value);
  			}
  			userdata = datas.join('&');
  			if(method == 'GET'){
  				var prefix = url.indexOf('?')>0 ? '&':'?';
  				url += prefix + userdata;
  			}
  		}
  		method =method.toUpperCase();  
  		xhr.open(method,url,true);
  		console.log(url,method);
  		if(method == 'POST' || method == 'PUT' || method == 'DELETE'){
  			xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  			xhr.send(userdata);
  		}else
  			xhr.send();
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

