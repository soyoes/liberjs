/**
 * @author soyoes 
 * @Copywrite (c) 2013, Liberhood, http://liberhood.com 
 * @URL : https://github.com/soyoes/liberjs
 * @license : MIT License
 *
 * TODO : unbind
 * 
 */

var __packages = "",
	$this,//current view;
	$conf=$conf||{},
	__layerIDX=0,
	__layers=[],
	__args=null,
	__runtimeIdx=0,
	__={},/**runtimes variables will be deleted in ?ms */
	__set=function(k,v,ms){__[k] = v;ms=ms||300;$.setTimeout(function(key){delete __[key];}, ms, k);},
	__clear=function(){__={};},
	__eventMatchers = {
		'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
		'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
	},
	__eventDefaultOptions = {
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
	preventDefault = function(e) {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    },
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
	    //if(isSM){$.include("liber.sm");}
	    var browser = {name:M[0], version:parseInt(M[1]), device:isSM?"smartphone":"pc"};
	    /*
	     * with(document.createElement("b")){id=7;while(innerHTML="<!--[if gt IE "+ (++id)+"]>1<![endif]-->",innerHTML>0);browser.version=id>8?+id:0}
	     * if(browser.name=="MSIE"&&browser.version<9&&_IE_VER&&9==_IE_VER)
	    	browser.version = 9;
	    */
	    var av=navigator.appVersion;
	    var osnames = {"Win":"windows","Mac":"mac","X11":"linux","Linux":"linux"};
	    for(var k in osnames){if(av.indexOf(k)>=0){browser.os = osnames[k]; break;}}
	    if(browser.name=="MSIE"&&ua.indexOf("Trident/5.0")>0){
	    	browser.version = 9;	
	    	if($conf.redirect_ie9)
	    		location.href=$conf.redirect_ie9;
	    }
	    if(!window.console){//window.console={log:function(v){}};
	    	var methods = [
	    	     'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error','exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
	    	     'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd','timeStamp', 'trace', 'warn'
	    	     ],dummy = function(){},len = methods.length,
	    	    console = (window.console = window.console || {});
	    	    for(var i=0;i<len;i++){
	    	    	if (!console[methods[i]]) {
    	           		console[methods[i]] = dummy;
    	           	}
	    	    }
	    }
	    return browser;
	})();
	
	
/* shot cuts */
// if(!$) //to support jquery
function $(query,each,allLayer){
	var res;
	if(allLayer == undefined) allLayer = $conf.query_all_layer==undefined?true:$conf.query_all_layer; 
	if(allLayer && query.indexOf(' ')<0){/* querySelectorAll is not as fast as we wish.*/
		if(query.charAt(0)=="#")
			return document.getElementById(query.replace("#",""));
		res = document.querySelectorAll(query);
	}else{
		//query=!allLayer?"#layer_"+(__layerIDX-1)+" "+query:query;//FIXME __layerIDX -> lastLayer.idx
		query=!allLayer?"#"+$this.id+" "+query:query;
		var qs = query.trim().split(" ");
		var lastq = qs[qs.length-1];
		res = document.querySelectorAll(query);
		if(lastq.charAt(0)=="#")return res[0];
	}
	if(each && res)
		res.each(each);
	return res;
}
function $id(domid, allLayer){
	if(allLayer==undefined)
		allLayer = $conf.query_all_layer?true:false; 
	return (allLayer) ? document.getElementById(domid):$("#"+domid,null,allLayer);
}
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
    	return obj instanceof HTMLElement;
	}catch(e){
		return (typeof obj==="object") &&
			(obj.nodeType===1) && (typeof obj.style === "object") &&
			(typeof obj.ownerDocument ==="object");
  	}
}
$.isNumber = function(n) {return !isNaN(parseFloat(n)) && isFinite(n);}
$.keys=function(obj){
	var s = [];for(var k in obj){s.push(k);}return s;
};
$.values=function(obj){
	var s = [];for(var k in obj){s.push(obj[k]);}return s;
};
$.firstKey=function(obj){
	for(var k in obj)return k;
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
//sort arr
$.sort = function(arr,col){
	if(!arr)return false;
	return arr.sort(function(a,b){
		if(!col)return b>a?-1:(b==a?0:1);
		else
			return b[col]>a[col]?-1:(b[col]==a[col]?0:1);
	});
}


/**
* @param : get JS params
*/
$.getArguments = function(){
	if(__args)return __args;
	var scripts = document.getElementsByTagName("script");
	__args = {};
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
					__args[parts[0]] = parts[1];
				}
			}
			return __args;
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

$.serializeForm = function (form) {
    var obj = {};
    var elements = form.querySelectorAll("input, select, textarea");
    for( var i = 0; i < elements.length; ++i ) {
        var element = elements[i];
        var name = element.name;
        var value = element.value;

        if (name) {
            if (obj[name]) {
                if (!$.isArray(obj[name]))
                    obj[name] = [obj[name]];
                obj[name].push(value);
            } else
            obj[name] = value;
        }
    }
    return obj;
};

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
$.setTimeout = function(func, delay, params){
	if ($browser.name=="Firefox"){
		var timefunc = func;
		setTimeout(timefunc,delay, params);
	} else if($browser.name=="MSIE"){
		setTimeout( (function(params) {
		    return function() {
		        func(params);
		    };
		})(params) , delay);
	}else
		setTimeout(func, delay,params);
};
$.keyCode = function(e){
	if(document.all)
    	return e.keyCode;
	else if($id)
    	return (e.keyCode)? e.keyCode: e.charCode;
	else if(document.layers)
    	return e.which;
}

$.empty = function(o) {
	if(!o)return true;
	if(o.length && o.length==0)return false;
	if (typeof(o) === "object"){
		for(var _p in o) {
			return false;
		}
		return true;
	}
	return false;
}
$.clone = function(o){
	if(typeof(o)=="object"){
		var ob = {};
		for(var k in o)ob[k]=o[k];
		return ob;
	}else if($.isArray(o)){
		return o.slice(0);
	}
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
			//console.log("load "+t.src);
			
			if(e.type=="error"){
				//console.log("ERROR : Failed to load "+t.src);
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

$.archivePath = function(id, devider){
	var res = parseInt(id)%parseInt(devider);
	return [res,id].join("/");
}
$.extend = function(destination, source) {
    for (var property in source)
      if(!(property in destination)) destination[property] = source[property];
    return destination;
}

$.fire = function(el, eventName){
	el = typeof(el)=="string" ? $id(el):el;
	if(el == undefined)
		return;
    var options = $.extend(__eventDefaultOptions, arguments[2] || {});
    	oEvent=null, eventType = null;
    for (var name in __eventMatchers){
        if (__eventMatchers[name].test(eventName)) { eventType = name; break; }
    }
    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
    if(el[eventName]){
    	el[eventName]();
    }else if (document.createEvent){
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents'){
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }else{
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            		options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            		options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, el);
        }
        el.dispatchEvent(oEvent);
    }else{
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = $.extend(evt, options);
        el.fireEvent('on' + eventName, oEvent);
    }
    return el;
}
/**
 * send log to dummy url log.html. for apache log analyzing.
 * 
 * $conf.log_url = "/log.php"
 * $.log("my_action"); => /log.php?action=my_view:$UID:my_action
 *  
 */
$.log = function(action){
	if(!$conf.log_url)return;
	var uid=$app.userId || "0";
	action=[$this.name, uid, action].join(":");
	if($http)
		$http.get([log_url+"?action=",action].join(""));
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

var $html = {
	entityMap: {
		escape:   { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' },
		unescape: { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'" }
    },
    escape: function(str) {
    	if (str === null || str === undefined) return '';
    	var _this = this;
    	var regexp = new RegExp('[' + $.keys(_this.entityMap.escape).join('') + ']', 'g');
    	return ("" + str).replace(regexp, function(m) { return _this.entityMap.escape[m]; });
    },
    unescape: function(str) {
    	if (str === null || str === undefined) return '';
    	var _this = this;
    	var regexp = new RegExp('(' + $.keys(_this.entityMap.unescape).join('|') + ')', 'g');
    	return ("" + str).replace(regexp, function(m) { return _this.entityMap.unescape[m]; });
    }
};

var $app = {
	start : function(start_view){
		var __default = {
			modules : [],
			liber_path : "/js/"
		};
		$app.start_view = start_view;
		for(var i in __default){
			if(!$conf[i])$conf[i]=__default[i];
		}
		var lo = ($conf.layout)?$conf.layout:($browser.device=="smartphone"?"grids":"overlay");
		$conf.modules.push("liber.layout."+lo);
		
		var images = $conf.preload_images?$conf.preload_images:[];

		var loadFiles = $conf.modules.length+images.length, loadedFiles=0;
		var step = function(){
			loadedFiles++;
			var progress = parseInt(loadedFiles*100/loadFiles);
			if($app.progressBar && $app.progressBar.update)
				$app.progressBar.update(progress);
			if(progress>=100){
				$app.preloaded();
			}
		}; 
		for(var i in $conf.modules){
			$.include($conf.modules[i], step, $conf.modules[i]);
		}
		if(images.length>0){
			$.preload(images, step, step);
		}
		
	},
	
	preloaded : function(){
		if($app.layout)
			$app.layout.init(document.body, $app, $conf.layout_options||{});
		if($app.onload)
			$app.onload();
		else{
			$app.loaded();
		}
	},
	loaded : function(){
		var v = (typeof($app.start_view)=="string")?$app.start_view: $conf.default_view;
		$app.loadView(v, true);
	},
	handle : function(type, data){
		switch(type){
			case "loaded":
				$app.drawView();
				break;
			case "redirect":
				$app.loadView(data,true);
				break;
			default:
				break;
		}
	},
	trans : function(e){
		e = e||window.event;
		var target = e.target||e.srcElement;
		if(target){
			var url = target.getAttribute("url");
			if(url){
				$app.loadView(url, target.tagName!="a");
			}
		}
	},
	loadView : function(url, updateHistory){
		url = url || $conf.default_view;
		if(url){
			if(url.indexOf("http:")==0 || url.indexOf("https:")==0){
				location.href = url;
				return;
			}else{
				var params = $.unserialize(url);
				var viewname = url.split("?")[0];
				$app.view = viewname;
				var view = $controller.enhance(viewname);
				if(!view){
					throw new Error("100 : "+viewname+" does not exist");
					return;
				}
				$this = view;
				var loc = location.href.toString();
				if(updateHistory && ( loc.indexOf("#"+url, loc.length - url.length-1) !== -1 ) )
					$history.push(url);
				view.params = params;
				if(view.onload){
					view.onload(params);
				}else{
					view.loaded();//$controller.loaded
				}
			}
		}
	},
	
	drawView : function(view){
		view = view || $app.view;
		view = typeof(view)=="string" ? window[view]:view;
		if(!view){
			$app.closeView($app.view);
			return;
		}
		$app.layout.drawView(view);
	},
	closeView : function(view){
		view = view || $this;
		if(typeof(view)=="string") view = window[view];
		if(!view)return;
		$app.view = undefined;
		if($history.views.length>1){
			$history.views.pop();
		}
		var vname = ($history.views.length>1)?$history.views.pop():$history.views[0];
		$app.view = vname;
		$this = window[vname];
		if(view.onclose)
			view.onclose();
		$app.layout.closeView(view);
	}
};

var $controller = {
	loaded : function(){
		$app.handle("loaded");
	},
	close : function(){
		$app.closeView($this);
	},
	redirect : function(view){
		$app.handle("redirect", view);
	},
	enhance:function(view){
		var vname;
		if(typeof(view)=="string"){
			vname = view;
			view = window[vname];
		}
		if(!view){
			throw new Error("101 :no view to enhance");
			return;
		}else{
			view.name = view.name|| vname;
		}
		if(!view.__enhanced){
			$.extend(view, $controller);
			delete view["enhance"];
			view.__enhanced = true;
		}
		return view;
	}	
};

/*//console.log("browser",$browser.name,"-",$browser.version);*/

var $history = {
	views:[],
	push : function(url){
		$history.views.push(url.split("?")[0]);
		$.fire($a({href:"#"+url, html:"_"}), "click");
	},
	init: function(){
		window.onhashchange = function () {
			var hash = window.location.hash.replace(/^#/,"");
			//console.log("hash",hash);
			if(hash.match(/^~/)){
				var func = hash.replace(/^~/,"");
				try{
					eval(func+"()");
				}catch(ex){}
			}else{
				$app.loadView(hash,false);
			}
		};
	}
};
$history.init();

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
	var len = 0;
	var str = escape(this);
	for (var i=0; i<str.length; i++, len++) {
		if (str.charAt(i) == "%") {
			if (str.charAt(++i) == "u") {
				i += 3;
				len++;
			}
			i++;
		}
	}
	return len;
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
		
	addClass : function(cls) {
	    if(this.className.indexOf(cls)<0){this.className += " "+cls;}
	    return this;
	},
	
	removeClass : function(cls) {
		if(!cls)return this;
		cls = cls.trim();
		this.className = this.className.replace(new RegExp("\\s+"+cls+"\\s+","gm")," ").replace(new RegExp("^"+cls+"\\s+","gm"),"").replace(new RegExp("\\s+"+cls+"$","gm"),"");
	    return this;
	},
	
	css : function(arg1,arg2){
		if(typeof(arg1)=="string"){
			if(arg2!=undefined){
				if(arg1.indexOf("background")>=0 && arg2.indexOf("url(")>=0 && $conf.image_path && arg2.indexOf("data:image")<0 && arg2.indexOf("http")<0){
					arg2 = arg2.replace("url(", "url("+$conf.image_path);
				}
				this.style[arg1] = arg2;
			}else 
				return this.style[arg1];
		}else if(typeof(arg1)=="object" && !arg2){
			for(var f in arg1){
				//this.style[f] = arg1[f];
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
			if(arg1=="class"||arg1=="classname")
				arg1 = "className";
			if(arg1=="url" && typeof(arg2)=="string"){
				this.bind("click", $app.trans);
			}
			if(arg2!=undefined){
				if(this.tagName.toUpperCase() == "IMG" && arg1.toLowerCase()=="src"){
					this[arg1] = $conf.image_path && arg2.indexOf("data:image")<0 && arg2.indexOf("http")!=0? $conf.image_path+arg2:arg2;
				}else{
					this[arg1] = arg2;
				}
				if(typeof(arg2)!="function" && !$.isBool(arg2)){
					if(this.tagName == "INPUT"){
						/*IE8 doeesn't support input.name=xxx*/
						if($browser.name=="MSIE" && $browser.version<9 && (arg1=="type"||arg1=="name"))
							return this;
						/*IE9 doeesn't support input.placeHolder=xxx*/
						if($browser.name=="MSIE" && $browser.version<10 && arg1=="placeHolder"){
							this.setAttribute(arg1,arg2);
							if(!this.value || this.value==""){
								this.value = arg2;
								////console.log("value-",this.value);
								this.style.color = "#999";
								this.attachEvent("onfocus",function(e){
									 e = e||window.event;
									 var ipt = event.srcElement;
									 ipt.style.color = "#333";
						             if (ipt.value == ipt.attr('placeHolder')) {
						                 ipt.value = "";
						             }
						        });
								this.attachEvent("onblur",function(e){
									e = e||window.event;
									var ipt = event.srcElement;
									if (ipt.value == '' || ipt.value == ipt.attr('placeHolder')) {
						                ipt.value = ipt.attr('placeHolder');
						                ipt.style.color = "#999";
						            }else{
						            	ipt.style.color = "#333";
						            }
						        });
							}
						}
					}
					/*
					if(!this.hasOwnProperty(arg1)){
						this.setAttribute(arg1,arg2);	
					}
					*/
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
	
	bind : function(arg1, arg2){
		if(typeof(arg1)=="string"){
			if(arg2){
				arg1 = arg1.replace(/^on/,'');
				if (this.addEventListener)  /* W3C */
					this.addEventListener(arg1,arg2,false);
				else if (this.attachEvent) { /* IE */
					if(typeof(arg2)=="function")
						this.attachEvent("on"+arg1,arg2);
					else if(typeof(arg2)=="string")
						this.setAttribute("on"+arg1,arg2);
				}else {
					this["on"+arg1] = arg2;
				}
			}
		}else if(typeof(arg1)=="object" && !arg2){
			for(var f in arg1){
				f = f.replace(/^on/,'');
				if (this.addEventListener)  /* W3C */
					this.addEventListener(f,arg1[f],false);
				else if (this.attachEvent) { /* IE */
					this.attachEvent("on"+f,arg1[f]);
					if(typeof(arg1[f])=="function")
						this.attachEvent("on"+f,arg1[f]);
					else if(typeof(arg1[f])=="string")
						this.setAttribute("on"+f,arg1[f]);
				}else {
					this["on"+f] = arg1[f];
				}
			}
		}
		return this;
	},
	
	height : function(){
		return $ui.height(this);
	},
	width : function(){
		return $ui.width(this);
	},

	hide : function(){$ui.hide(this);return this;},
	show : function(){$ui.show(this);return this;},
	unselectable:function(){$ui.unselectable(this);return this;},
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
			$.setTimeout(function(arg){
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
				else return preventDefault()&&false;
			}});
		}
		if(out){
			this.attr({"__out":"("+out.toString()+")"});
			this.bind({mouseout:function(e){
				e = e||window.event;
				var t=e.target||e.srcElement;
				var rect = $ui.rect(t);
				if($ui.inRect($ui.cursor(e),rect)){
					return preventDefault()&&false;	
				}else{
					var out = eval(t.attr("__out"));
					if(out){t.attr({"__exec":"no"});out(e,t);}
				}
			}});
		}
		return this;
	}
};

if($browser.name=="MSIE" &&  $browser.version<9){
	$.include("liber.ie8");
}else{
	if (typeof Element.prototype.animate == 'function') Element.prototype.animate = __element.animate;
	$.extend(Element.prototype,__element);
}

/* DOM functions */
//var $_runtime;
var $e = function(type, args, target){
	var _el = document.createElement(type);
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
			////console.log("draw array");
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
							////console.log(res,_el);
							thisEl.appendChild(res);
						}
						_el = thisEl;
					}else{
						////console.log("ERROR : can not append child ",args[i]);
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
Override : "style" -> use $rules(rules, target) instead

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
 "form","fieldset","legend","input","label","textarea",

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
 'altglyph','altglyphdef','altglyphitem','animate','animatecolor','animatemotion','animatetransform',
 'circle','clippath','color_profile','cursor','defs','desc','ellipse',
 'feblend','fecolormatrix','fecomponenttransfer','fecomposite','feconvolvematrix','fediffuselighting','fedisplacementmap','fedistantlight','feflood','fefunca','fefuncb','fefuncg','fefuncr','fegaussianblur','feimage','femerge','femergenode','femorphology','feoffset','fepointlight','fespecularlighting','fespotlight','fetile','feturbulence',
 'filter','font','font_face','font_face_format','font_face_name','font_face_src','font_face_uri','foreignobject',
 'g','glyph','glyphref','hkern','image','line','lineargradient','marker','mask','metadata','missing_glyph',
 'mpath','path','pattern','polygon','polyline','radialgradient','rect','script','set','stop','style','svg','switch','symbol','text','textpath','tref','tspan','use','view','vkern'

];

for(var i=0;i<__tags.length;i++){
	var tag=__tags[i];
	eval(["window.$" , tag ,"=",tag.toUpperCase(), "= function(args,target){ return $e('" , tag,  "', args,target); };"].join(''));
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
		drawOpt = attrs.drawOption;
	for(var v in options){
		var surfix = (isMulti)?((valuestr.indexOf('#'+v+"#")>=0)?" on":""): ((attrs.value == v)?" on":"");
		var lOpt = attrs.noLabel==true ? {className:attrs.labelClass?attrs.labelClass+surfix:surfix,html:"&nbsp;"}:{className:attrs.labelClass?attrs.labelClass+surfix:surfix,html:options[v]};
		var opt = $li([$div(lOpt)],list)
			.attr({name:attrs.id, value:v,idx:idx, multiple:isMulti?1:0,className:attrs.optionClass?attrs.optionClass+surfix:surfix}).bind("click", window._sel_handler);
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
 * @param rules = {
 * 	".myClass" : {width:30, height:"40px"},
 *  "#myId" : {width:30, height:"40px"},
 * 	...
 * }
 * 
 * @return new style tag id;
 * */
var $rules=function(rules,target){
	target = target||document.body;
	var sid = "runtime_rule_"+(++__runtimeIdx),
		cs = $e('style',{type:"text/css",id:sid},target);
	var tn = document.createTextNode("");
	for(var k in rules){
		var v = typeof(rules[k])=="string"?rules[k] : $.serialize(rules[k], ";", ":");
		tn.appendData([k, "{", v, "}\n"].join(""));
	}
	cs.appendChild(tn);
	return sid;
};

/**
 * $slider({max:20,min:1,value:5,step:1,name:"my",id:"myk",
 * 			maxLabel:true,minLabel:false,
 * },target)
 * @styles 
 * 	.slider{}	//frame style
 * 	.slider .min-label{}	//label left style
 *  .slider .max-label{}	//label left style
 * 	.slider input{} //bar style
 * 
 * */
var $slider=function(opt,target){
	opt = opt||{};
	opt = $.extend({min:1,max:100,type:"range"},opt);
	var ipt = $input(opt);
	var frame = $div({"className":"slider"},target).css({overflow:"hidden"});
	if(opt.minLabel){
		$label({html:opt.min,"class":"min-label"},frame);
	}
	if(opt.maxLabel){
		ipt.bind("change",function(e){
			e = e||window.event;
			var t = e.srcElement||e.target,v=t.value;
			while(t.tagName.toUpperCase()!="LABEL")t=t.nextSibling;
			t.innerHTML = v;
		});
		frame.appendChild(ipt);
		$label({html:opt.value,"class":"max-label"},frame);
	}else{
		frame.appendChild(ipt);
	}
	return frame;
};

var $autocomplete = function(datas,opt,target){
	opt = opt||{};datas=datas||[];
	if(!opt.id)opt.id="ac-"+(++__runtimeIdx);
	opt = $.extend({list:"datalist-"+opt.id}, opt);
	var ipt = $input(opt,target);
	if($browser.name.toLowerCase()=="safari"){
		$.include("liber.safari",$_autocomplete,{input:ipt,datas:datas});
	}else{
		var l = $e("datalist",{id:"datalist-"+opt.id},target);
		datas.forEach(function(d,idx){
			$e("option",{value:d},l);
		});
	}
	return ipt;
}


var $ui = {
	hide : function(args){
		if(!args)return;
		if(typeof(args)=="object"&&args.style){
			args.style.display = "none";
			return;
		}
		args = (typeof(args)=="string") ? [args]:args;
		for(var i in args){
			var d = $id(args[i]);
			if(d)d.style.display = "none";
		}
	},
	show : function(args){
		if(!args)return;
		if(typeof(args)=="object"&&args.style){
			if(args.className)
				args.className = args.className.replace("hidden","");
			args.style.display = "block";
			return;
		}
		args = (typeof(args)=="string") ? [args]:args;
		for(var i in args){
			var d = $id(args[i]);
			if(d)d.style.display = "block";
		}
	},
	toggle : function(args){
		if(!args)return;
		if(typeof(args)=="object"&&args.style){
			args.style.display = args.style.display== "none"?"block":"none";
			return;
		}
		args = (typeof(args)=="string") ? [args]:args;
		for(var i in args){
			var d= $id(args[i]);
			if(d){
				if(d.className.indexOf("hidden")>=0){
					d.className  = d.className.replace("hidden","");
				}else{
					d.style.display = (d.style.display=="none") ? "block":"none";	
				}
			}
		}	
	},
	remove : function(el){
		if(!el)return;
		var type = typeof(el);
		if(type == "function")
			return;
		if(type=='string')
			el = $id(el);
		if(el && el.parentNode)
			el.parentNode.removeChild(el);
	},
	insertBefore : function(el, target) {
		el     = $.isElement(el)     ? el     : $id(el);
		target = $.isElement(target) ? target : $id(target);
		target.parentNode.insertBefore(el, target);
	},
	insertAfter : function(el, target) {
		el     = $.isElement(el)     ? el     : $id(el);
		target = $.isElement(target) ? target : $id(target);
		target.parentNode.insertBefore(el, target.nextSibling);
	},
	unselectable : function(el){
		el.attr({"unselectable":"on"}).bind("selectstart",function(e){return preventDefault(e);}).css({"-moz-user-select": "none", "-webkit-user-select": "none", "-ms-user-select":"none", "user-select":"none"});
	},
	documentHeight : function() {
	    var d = document.documentElement ? document.documentElement:document.body;
	    return Math.max(d.scrollHeight, d.offsetHeight,d.clientHeight);
	},
	screenWidth :function(){
		return  window.innerWidth|| document.documentElement.clientWidth|| document.getElementsByTagName('body')[0].clientWidth;
	},
	screenHeight : function(){
	    return  window.innerHeight|| document.documentElement.clientHeight|| document.getElementsByTagName('body')[0].clientHeight;
	},
	
	rect : function(el){
		var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop,
			scrollLeft = (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;
		if(el.getBoundingClientRect){
			var r = el.getBoundingClientRect();//Read only
			return {top:r.top+scrollTop, width:r.width, left:r.left+scrollLeft, height: r.height};
		}	
			
		var _x = 0,
	    	_y = 0,
	    	w = $ui.width(el),
	    	h = $ui.height(el);
	    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
	        _x += el.offsetLeft - el.scrollLeft;
	        _y += el.offsetTop - el.scrollTop;
	        el = el.offsetParent;
	    }
	    //offsetWidth (includes padding...)
	    return { top: _y+scrollTop, left: _x+scrollLeft,width:w,height:h};			
	},
	
	height : function(el){
		return el? Math.max(el.clientHeight||0,el.scrollHeight||0,el.offsetHeight||0):0;
	},
	width : function(el){
		return el?Math.max(el.clientWidth||0,el.scrollWidth||0,el.offsetWidth||0):0;
	},
	/**
	* return mouse position;
	*/
	cursor : function(e,target){
		$ui.mouseX=0;$ui.mouseY=0;
		if (e.pageX || e.pageY) { 
			$ui.mouseX = e.pageX;
			$ui.mouseY = e.pageY;
		} else { 
			$ui.mouseX = e.clientX + document.body.scrollLeft; 
			$ui.mouseY = e.clientY + document.body.scrollTop; 
		} 
		return {x:$ui.mouseX,y:$ui.mouseY};
	},
	inRect : function(point, rect){
		return point.x>=rect.left && point.x<=rect.left+rect.width
				&& point.y>=rect.top && point.y<=rect.top+rect.height;
	},
	title:function(str){//set document title
		if(str)document.title = str;
		return document.title;
	},
	addLayer : function(oncreate, params, dontHideOthers){
		if(!dontHideOthers){
			for(var i in __layers){
				$ui.hide(__layers[i]);
			}
		}
		var layer = document.createElement("div");
		layer.id = "layer_"+__layerIDX;
		layer.setAttribute("layer",__layerIDX);
		layer.className = "layer";
		layer.style.height = $ui.documentHeight();
		__layers.push(layer);
		__layerIDX ++;
		document.body.appendChild(layer);
		layer.css({
			width: "100%",height: "100%",zIndex:100+__layerIDX,position: "absolute",
			top:'0px',left:'0px',right:'0px',bottom:'0px',margin:'0px',border:'0px',padding:'0px',textAlign:"center"
		});
		if(oncreate){
			oncreate(layer,params);
		}
	},
	
	removeLayer : function(view){
		var layer = null;
		if(view){
			layer = view.layer;
			if(!layer)
				return;
			while(__layers.length>0){
				var l = __layers.pop();	
				if(l.id == layer.id){
					layer.parentNode.removeChild(layer);
					break;
				}else if("message"==l.attr("layer-type")){
					l.parentNode.removeChild(l);
				}
			}
		}else{
			layer = __layers.pop();	
			if(layer){
				layer.parentNode.removeChild(layer);
			}
		}
		$ui.showLastLayer();
	},
	
	showLastLayer : function(){
		var len = __layers.length;
		if(len>0){
			var last = __layers[len-1];
			if("message"==last.attr("layer-type")){
				__layers.pop();
				return $ui.showLastLayer();
			}
			if($id(last.id,true)){
				$ui.show(last);
				$this = window[last.attr("view")];
			}else{
				__layers.pop();
				return $ui.showLastLayer();
			}
		}else{
			if($conf.default_view){
				$app.loadView($conf.default_view);
			}else{
				window.location = window.location;
			}
		}
	},
	
	bringLayerToFront : function(layer){
		var layers = [];
		for(var i in __layers){
			var l = __layers[i];
			if(l.attr("layer")!=layer.attr("layer")){
				layers.push(l);
			}
		}
		layers.push(layer);
		layer.id = "layer_"+__layerIDX;
		layer.setAttribute("layer",__layerIDX);
		layer.style.display = "block";
		layer.style.zIndex = 100+__layerIDX;
		__layerIDX ++;
		__layers = layers;
	},
	
	/*
	* @param content: DOMElement || string
	* @param params: {
	* 	width:
	* 	top:	
	* 	style:	// message-box class name
	* 	onDraw: function(popup, params)
	* } 
	* 
	* CSS
	* 	.layer-popup
	* 	#popup
	* 
	* examples: 
	*	$ui.popup ("please wait", function(re){blah, blah ...}, {param:1})
	*	$ui.popup ($div($h1("Message Window")), 2000) // close after 2000ms
	*/
	popup : function(content, params){
		params = params||{};
		/*show message*/
		$ui.addLayer(function(layer,params){
			layer.attr("layer-type","message");
			layer.className = "layer-popup";
			var box = $id("popup");
			var mtop = 240||params.top;
			var mw = 600||params.width;
			layer.style.top = "0px";
			layer.style.height = Math.max($ui.screenHeight(), $ui.height(document.body))+"px";
			if(!box)box = $div(content,layer)
				.attr({id:"popup","class":params.style||""})
				.css({"top":mtop+"px", "position":"fixed", width:mw+"px", left:"50%", marginLeft:"-"+(mw/2)+"px",overflow:"hidden"});
			var func = params.onDraw;
			if(func && typeof(func)=="function")
				func(box,params);
			else{
				var time = parseInt(func);
				if(time>0){
					$.setTimeout($ui.popupClose,time);
				}
			}
		},params,true);
	},
	popupClose : function(time){
		var box = $id("popup");
		if(box){
			if(box.parentNode.getAttribute("layer")){
				$ui.removeLayer();
			}else
				$ui.remove(box);
		}	
	},
	/**
	 * show file/image upload window
	 * example:
	 * */
	uploadWindow : function(callback,multiple){
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
			$.setTimeout(function(){
				$id(fname,true).style.display = "none";
			},100);
		}
	}
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
	  							//console.log(res);
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
	  			}
    		}
  		};
  		var userdata = '';
  		if(params){
  			var datas = [];
  			for (var key in params){
  				key = key.replace(/\//g,'%2F').replace(/\s/g,'%20');
  				var value = params[key]+"";
  				value =!isFile ? value.replace(/\//g,'%2F').replace(/\s/g,'%20'):value;
  				datas.push(key+'='+value);
  			}
  			userdata = datas.join('&');
  			if(method == 'GET'){
  				var prefix = url.indexOf('?')>0 ? '&':'?';
  				url += prefix + userdata;
  			}
  		}
  		method =method.toUpperCase();  
  		//console.log('http send ',method,url,userdata);
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

