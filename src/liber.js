/**
 * @author soyoes 
 * @Copywrite (c) 2013, Liberhood, http://liberhood.com 
 * @URL : https://github.com/soyoes/liberjs
 * @license : MIT License
 * 
 */


$conf=$conf||{};
/**
 * @return {
 * 	name:
 * 	version:float
 * 	device: smartphone|pc
 * 	os: windows|mac|linux 
 * }
 * */
$browser = (function(){
    var N= navigator.appName, ua= navigator.userAgent, tem;
    var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    M= M? [M[1], M[2]]: [N, navigator.appVersion, 0];
    var isSM = ua.match(/(iPhone|iPod|Android)/i);//TODO : blackberry
    var browser = {name:M[0], version:parseInt(M[1]), device:isSM?"smartphone":"pc"};
    var av=navigator.appVersion;
    var osnames = {"Win":"windows","Mac":"mac","X11":"linux","Linux":"linux"};
    for(var k in osnames){if(av.indexOf(k)>=0){browser.os = osnames[k]; break;}}
    if(browser.name=="MSIE"&&!window.atob){ //IE ver<=9, TODO add other browser check
    	if($app.onError)
    		$app.onError("unsupported_error");
    }
    //TODO remove these. since we do not support IE9 anymore.
    // if(!window.console){//window.console={log:function(v){}};
    // 	var methods = [
    // 	     'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error','exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    // 	     'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd','timeStamp', 'trace', 'warn'
    // 	     ],dummy = function(){},len = methods.length,
    // 	    console = (window.console = window.console || {});
    // 	    for(var i=0;i<len;i++){
    // 	    	if (!console[methods[i]]) {
	   //         		console[methods[i]] = dummy;
	   //         	}
    // 	    }
    // }
    return browser;
})();

function $id(domid){
	var usingView = ($app.status === "loaded" && $this && $this.layer);
	return (usingView) ? $this.layer.find("#"+domid):document.getElementById(domid);
}
/* shot cuts */
// if(!$) //to support jquery
$ = function(query,each){
	var usingView = ($app.status === "loaded" && $this && $this.layer);
	var res = usingView? $this.layer.find(query):document.querySelectorAll(query);
	if(res){
		if(each) res.each(each);
		var qs=query.split(" "),qu=qs[qs.length-1];
		res = qu.indexOf("#")==0? res[0]:res;
	}
	return res;
}

$.args=null,
$.__runtimeIdx=0,
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
$.__HTML_ESC={ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
$.__HTML_UESC={ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'" };

__={},/**runtimes variables will be deleted in ?ms */
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
$.keyCode = function(e){
	if(document.all)
    	return e.keyCode;
	else if($id)
    	return (e.keyCode)? e.keyCode: e.charCode;
	else if(document.layers)
    	return e.which;
}

$.clone = function(o){
	if(typeof(o)==="object")
		return JSON.parse(JSON.stringify(o));
	else if($.isArray(o))
		return o.slice(0);
	return o;
}
$.include = function(src, callback,params){
	if(src.indexOf(".js")<0)
		src+=".js";
	if(src.indexOf("/")<0)
		src = $conf.liber_path+src;
	var jsId = src.split("/");
	jsId = jsId[jsId.length-1].replace(/\./g,"_");
	var time = new Date().getTime();
	if(!$id(jsId,true)){
		var cb = callback;
		var cbprm = params;
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
			if(cb)cb(cbprm);
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

// $.fire = function(el, eventName){
// 	el = typeof(el)=="string" ? $id(el):el;
// 	if(el == undefined)
// 		return;
//     var opt = $.extend($.__eventOpts, arguments[2] || {});
//     	oe=null, etype = null;
//     for (var name in $.__events){
//         if ($.__events[name].test(eventName)) { etype = name; break; }
//     }
//     if (!etype){
//     	if($app.onError)$app.onError("event_fire_error",{name:eventName});
//     	throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
//     }
//     if(el[eventName]){
//     	el[eventName]();
//     }else if (document.createEvent){
//         oe = document.createEvent(etype);
//         if (etype == 'HTMLEvents'){
//             oe.initEvent(eventName, opt.bubbles, opt.cancelable);
//         }else{
//             oe.initMouseEvent(eventName, opt.bubbles, opt.cancelable, document.defaultView,
//             		opt.button, opt.pointerX, opt.pointerY, opt.pointerX, opt.pointerY,
//             		opt.ctrlKey, opt.altKey, opt.shiftKey, opt.metaKey, opt.button, el);
//         }
//         el.dispatchEvent(oe);
//     }else{
//         opt.clientX = opt.pointerX;
//         opt.clientY = opt.pointerY;
//         var evt = document.createEventObject();
//         oe = $.extend(evt, opt);
//         el.fireEvent('on' + eventName, oe);
//     }
//     return el;
// }
/**
 * send log to dummy url log.html. for apache log analyzing.
 * 
 * $conf.log_path = "/log.php"
 * $.log("my_action"); => /log.php?action=my_view:$UID:my_action
 *  
 */
$.log = function(action){
	if(!$conf.log_path)return;
	var uid=$app.userId || "0";
	action=[$this.name, uid, action].join(":");
	if($http)
		$http.get([log_path+"?action=",action].join(""));
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
		/*evType = $browser.name=="MSIE"&&$browser.version<9 ? "focus":"change";*/
		ipt.bind("change",callback);
		$.fire(ipt,"click");
	}else{
		imgform.style.display = "block";
		$.fire(iname,"click");
		setTimeout(function(){
			$id(fname,true).style.display = "none";
		},100);
	}
}


var $app = {
	status : "normal",
	viewIdx : 1,
	views : [],
	start : function(start_view){
		if($app.status=="stopped")
			throw new Error("This app has been stopped for some reason.");
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
		if($app.onload) $app.onload();
		else $app.loaded();
	},
	loaded : function(){
		$app.status = "loaded";
		// console.log("loaded:",$app.start_view);
		$app.openView($app.start_view);
	},
	handle : function(type, view){
		switch(type){
			case "stop":
				return $app.stop();
			case "loaded":
				return $app.drawView(view);
			case "close":
				return $app.closeView(view);
			case "front":
				return $app.bringViewToFront(view);
			default:
				break;
		}
	},
	trans : function(e){
		e = e||window.event;
		var target = e.target||e.srcElement;
		var url = target.getAttribute("url");
		if(url && $.isString(url)){
			// console.log(url, target.tagName);
			if(url.match(/@\?*/g)) //is popup
				$app.openView(url.replace('@?','?'), true);
			else {
				if(target.tagName!="A")
					$a({href:"#"+url, html:"_"},document.body).css({opacity:0}).fire("click");
					// .onload = function(e){
					// 	e = e||window.event;var t=e.target||e.srcElement;
					// 	console.log("a.onload",t);
					// 	t.fire("click");
					// };
				else
					target.fire("click");	
			}
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
				}
				view.params = params;
				if(popup && opener)
					view.opener = opener.name;
				$this = view;
				$app.views.push(vname);	
				if(opener && opener.onInactive) 
					opener.onInactive.call(opener,view);
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
			$app.bringViewToFront(view);
			if(view.onActive) {
				view.onActive.call(view,$app.last_view? window[$app.last_view]:null);
				$app.last_view = null;
			}
		}else{
			if(!view.opener)
				$app.hideOthers(view);
			view.drawView.call(view, $app.viewIdx++);
		}
	},
	closeView : function(view){
		// console.log("app::closeView",view.name);
		if(view.onClose)
			view.onClose();
		if(view.layer)
			view.layer.remove();
		$app.views.pop();
		if(view.opener){
			view.opener = false;
			$app.last_view = view.name;
		}else{
			var lv;
			for(var i=$app.views.length-1;i>=0;i--){
				var v = window[$app.views[i]];
				if(v.layer && v.layer.style.display=="none"){
					lv = v; break;
				}
			}
			lv = lv || window[$app.start_view];
			lv.layer.show();
		}

		$this =($app.views.length>=1)? window[$app.views.pop()]:window[$app.start_view];

		if($this && $this.onActive){
			$this.onActive.call($this,$app.last_view? window[$app.last_view]:null);
			$app.last_view = null;
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
			if($app.views[i]!=view.name)
				//console.log("hide:",v.layer);
				v.layer.hide();
		}
	}
};

var $controller = {
	loaded : function(){
		// console.log("controller::loaded");
		$app.handle("loaded",$this);
	},
	close : function(){
		// console.log("controller::close");
		$app.handle("close",$this);
	},
	drawView : function(idx){
		// console.log("controller::drawView");
		var view = this;
		var layer = $article({idx:idx,"class":view.opener?"view popup "+view.name:"view "+view.name,view:view.name},document.body);
		//FIXME
		layer.css({
			width: "100%",height: "100%",zIndex:100+idx,position: "absolute",
			top:'0px',left:'0px',right:'0px',bottom:'0px',margin:'0px',border:'0px',padding:'0px',textAlign:"center"
		});

		if(!view.noHeader){
			var h = $header({},layer);
			h =  view.drawHeader? view.drawHeader.call(view,h,layer):($app.drawHeader? $app.drawHeader(h):h);
		}

		var c = $section({},layer);
		if(view.drawContent){
			if(view.layer)
				view.layer.remove();
			view.layer = layer;
			view.content = c;
			view.drawContent.call(view, c, layer);
		}
		if(!view.noFooter){
			var f = $footer({},layer);
			f =  view.drawFooter? view.drawFooter.call(view,f,layer):($app.drawFooter? $app.drawFooter(f):f);
		}
	},

	bringToFront : function(){
		$app.handle("front",$this);
	},
};

// var $history = {
// 	views:[],
// 	push : function(url){
// 		$history.views.push(url.split("?")[0]);
// 		$.fire($a({href:"#"+url, html:"_"}), "click");
// 	},
// 	init: function(){
// 		window.onhashchange = function () {
// 			var hash = window.location.hash.replace(/^#/,"");
// 			if(hash.match(/^~/)){
// 				var func = hash.replace(/^~/,"");
// 				try{
// 					eval(func+"()");
// 				}catch(ex){}
// 			}else{
// 				$app.openView(hash,false);
// 			}
// 		};
// 	}
// };
// $history.init();

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
		var n = escape(this.charAt(i));
		if (n.length < 4) count++; else count+=2;
	}
	return count;
};
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.CJKLength = function() {
	var str = escape(this).replace(/%u.{4}/gm,"1");
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

String.prototype.escape = function() {
    var regexp = new RegExp('[' + $.keys($.__HTML_ESC).join('') + ']', 'g');
    return this.replace(regexp, function(m){return $.__HTML_ESC[m];});
},

String.prototype.unescape = function() {
    var regexp = new RegExp('(' + $.keys($.__HTML_UESC).join('|') + ')', 'g');
    return this.replace(regexp, function(m){return $.__HTML_UESC[m];});
},


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
			if(this.className.indexOf(cls)<0){this.className += " "+cls;}	
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
                    this.style.setProperty(arg1, arg2);
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

	find : function(q){var qs=q.split(" "),qu=qs[qs.length-1];var r=this.querySelectorAll(q);return qu.indexOf("#")==0?r[0]:r;},
	
	bind : function(arg1, arg2){
		if(typeof(arg1)=="string"){
			//if(arg1=="click"&&$browser.device=="smartphone")arg1=this.getAttribute("touch")||"touchstart";
			if(arg2){
				arg1 = arg1.replace(/^on/,'');
				this.addEventListener(arg1,arg2,false); //NO IE8 support any longer
			}
		}else if(typeof(arg1)=="object" && !arg2){
			for(var f in arg1){
				f = f.replace(/^on/,'');
				this.bind(f,arg1[f]);
			}
		}
		return this;
	},

	unbind : function(evname){
		if(this.removeEventListener){
			//TODO
		}
	},

	/**
	 * clone a element including childs and append to target.
	 * @param  target:optional, target to append to 
	 * @return cloned DOMElement.
	 */
	clone : function(target){var c=this.cloneNode(true);if(target)target.appendChild(c);return c;},
	
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
		if(this.style.display) this.attr("__orgDisplay",this.style.display);
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
				if(f && "no"===t.attr("__exec")){t.attr("__exec","yes");f(e,t);}
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
					if(out){t.attr({"__exec":"no"});out(e,t);}
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
			for(var i in args){
				if(args[i]!=null){
					if($.isElement(args[i])){
						_el.appendChild(args[i]);
					}else if($.isFunc(args[i])){
						var thisEl = _el;
						var res = args[i]();
						if($.isArray(res)){
							for(var _i in res){
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
Override : "title" -> use $ui.title(str) instead
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
 * checkbox / select-option / radiobox
 * 
 * @params options : {value:label, value:label ...}
 * @params attrs : {
 * 			id:xxxx ,//required 
 * 			name:xxxx, //required name of form item
 * 			multiple : 1|0 //1 :select(multi) || checkbox, 0:radio||select(single)
 * 			optionClass: classname of li
 * 			labelClass: classname of li.div
 *			formId : optional 	
 *			eventType : touchstart | touchend | mouseup | click		
 * 			noLabel:true|false //default=false, hide label text
 * 			drawOption:function(optLI,idx)
 * 		}
 * @params target //which dom to insert
 * 
 * */
var $sel = function(options,attrs,target){
	//var opts = [];
	if(!window._sel_handler)
	window._sel_handler = function(e){
		e = e || window.event;
		var lb = e.target || e.srcElement,
			li = lb.tagName.toUpperCase()=="LI"?lb: lb.parentNode;
		lb = li.childNodes[0];
		var id = li.name,
			ipt = $id(id+"-input"),
			tv = li.attr("value"),
			isMulti = 1==li.attr("multiple");
		if(isMulti){
			if(li.className.match(/\son$/)){
				li.className = li.className.replace(/\son$/g,'');
				lb.className = lb.className.replace(/\son$/g,'');
			}else{
				li.className += " on";
				lb.className += " on";
			}
			var vs = [];
			$("#"+id+"-list .on",function(el){
				if(el.tagName.toUpperCase()=="LI")
					vs.push(el.getAttribute("value"));
			});
			ipt.value = vs.join(',');
		}else{
			if(tv == ipt.value){
				ipt.value = "";
			}else{
				$("#"+id+"-list .on", function(el){el.className = el.className.replace(/\son$/,'');});
				li.className+=" on";
				li.childNodes[0].className+=" on";
				ipt.value = tv;
			}
		}
	};
	var valuestr = attrs.value && attrs.multiple? "#"+ attrs.value.split(',').join('#,#') + "#" : attrs.value||"",
		isMulti = 1==attrs.multiple||true==attrs.multiple,
		container = $div({id:attrs.id},target),
		list = $ul({id:attrs.id+"-list"},container),
		idx = 0,
		eventType = attrs.eventType||"click",
		drawOpt = attrs.drawOption;
	for(var v in options){
		var surfix = (isMulti)?((valuestr.indexOf('#'+v+"#")>=0)?" on":""): ((attrs.value == v)?" on":"");
		var lOpt = attrs.noLabel==true ? {className:attrs.labelClass?attrs.labelClass+surfix:surfix,html:"&nbsp;"}:{className:attrs.labelClass?attrs.labelClass+surfix:surfix,html:options[v]};
		var opt = $li([$div(lOpt)],list)
			.attr({name:attrs.id, value:v,idx:idx, multiple:isMulti?1:0,className:attrs.optionClass?attrs.optionClass+surfix:surfix}).bind(eventType, window._sel_handler);
		if(drawOpt)drawOpt(opt,idx);
		idx++;
	}
	$input({name:attrs.name, id:attrs.id+"-input", className:attrs.formId?'form-item-'+attrs.formId:"", type:'hidden',value:attrs.value?attrs.value:''},container);
	return container;
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
	if($browser.name=="MSIE" && $browser.version<9 && attrs.name ){
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
	var sid = id?id: "runtime_rule_"+(++$.__runtimeIdx),
		cs = $e('style',{type:"text/css",id:sid},target);
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
	
	ajax : function(method, url, params, callback, format, onprogress){
		url = $conf.http_host && url.indexOf("http")!=0 ? $conf.http_host+url : url;
		var xhr = $http.getRequest();
		if(!format) format = "json";
		xhr.runtimeParams = {
			callback : callback,
			format : format
		}; 
		if(onprogress)
			xhr.runtimeParams.onprogress = onprogress;

		var isFile = false;
		if(method == "UPLOAD"){
			method = "POST";
			isFile = true;
			xhr.upload.addEventListener("progress", function(e) {
				var pc = parseInt(100 - (e.loaded / e.total * 100));
				if(xhr.runtimeParams.onprogress)
					xhr.runtimeParams.onprogress(pc);
			}, false);
		}
		xhr.onreadystatechange=function(){
  			if (xhr.readyState==4 ){
  				if(xhr.status==200){
  					if(xhr.runtimeParams.callback){
	  					var res = xhr.responseText;
	  					if (xhr.runtimeParams.format == 'json') {
	  						try{
	  							res = JSON.parse(res);
	  						}catch(ex){
	  							if($app.onError)$app.onError("http_parse_error",{data:res});
	  							return xhr.runtimeParams.callback(null,{message:"json_error", data:res});
	  						}
	  					}
	    				xhr.runtimeParams.callback(res);
    				}	
  				}else{
  					var errors = {
	    				code : xhr.status,
	    				message : xhr.getResponseHeader("ERROR_MESSAGE")
	    			};
  					if(xhr.runtimeParams.callback)
  						xhr.runtimeParams.callback(null, errors);	
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
  		if(method == 'POST' || method == 'PUT' || method == 'DELETE'){
  			xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  			xhr.send(userdata);
  		}else
  			xhr.send();
	},
	
	get : function(url, params, callback, format){
		$http.ajax('GET',url,params,callback,format);
	},
	
	post : function(url, params, callback, format){
		$http.ajax('POST',url,params,callback,format);
	},
	put : function(url, params, callback, format){
		$http.ajax('PUT',url,params,callback,format);
	},
	del : function(url, params, callback, format){
		$http.ajax('DELETE',url,params,callback,format);
	},
	upload : function(url, params, callback, format, onprogress){
		$http.ajax('UPLOAD',url,params,callback,format,onprogress);
	}
};

