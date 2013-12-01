/**
 * @author soyoes 
 * @Copywrite (c) 2013, Liberhood, http://liberhood.com 
 * @URL : https://github.com/soyoes/liberjs
 * @license : MIT License
 */
window._params = undefined;

var __packages = "";
var $this;//current view;
if(!$conf) var $conf={};
var $browser = (function(){
    var N= navigator.appName, ua= navigator.userAgent, tem;
    var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    M= M? [M[1], M[2]]: [N, navigator.appVersion, 0];
    var isSM = ua.match(/(iPhone|iPod|Android)/i);//TODO : blackberry
    //if(isSM){$utils.include("liber.sm");}
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
    
    if(!console){window.console={log:function(v){}};}
    return browser;
})();
var $app = {
	_view : undefined,
	layers : [],
	_histories : [],
	
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
		
		
		
		var progbar = $ui.progressBar(document.body, $conf.modules.length+images.length, {
			update:function(progress, f){/*console.log("Preload : ",progress+"%",f);*/},
			finish:function(progress, f){/*console.log("Preload DONE");*/$app.preloaded();}
		});
		var loadFunc = function(v){progbar.update(v);};
		for(var i in $conf.modules){
			$utils.include($conf.modules[i], loadFunc, $conf.modules[i]);
		}
		if(images.length>0){
			$utils.preload(images, loadFunc, loadFunc);
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
				var params = $utils.unpackParams(url);
				var viewname = url.split("?")[0];
				$app.view = viewname;
				var view = $controller.enhance(window[viewname]);
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
					view.loaded();
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
		if($app._histories.length>1){
			$app._histories.pop();
		}
		$this = ($app._histories.length>1)?$app._histories.pop():$app._histories[0];
		$app.view = $this;
		if(view.onclose)
			view.onclose();
		$app.layout.closeView(view);
		////console.log($app._histories,$this);
		
	}
};

/**runtimes variables will be deleted in ?ms */
var __={};
__set=function(k,v){__[k] = v;$utils.setTimeout(function(key){delete __[key];}, 300, k);};
__clear=function(){__={};};

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
		if(!view){
			throw new Error("101 :no view to enhance");
			return;
		}
		if(!view.__enhanced){
			$utils.extend(view, $controller);
			delete view["enhance"];
			view.__enhanced = true;
		}
		return view;
	}	
};

/*//console.log("browser",$browser.name,"-",$browser.version);*/

var $history = {
	push : function(url){
		//var path = url.replace(/\?/g,'#'); 
		$utils.fire($a({href:"#"+url, html:"_"}), "click");
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


var $utils = {
	/**
	* @param : get JS params
	*/
	_params : function(){
		if(_params)
			return _params;
		var scripts = document.getElementsByTagName("script");
		_params = {};
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
						_params[parts[0]] = parts[1];
					}
				}
				return _params;
			}
		}
	},
	inArray : function (elem, arr) {
		return arr && arr.indexOf(elem)>=0;
	},
	getCookie : function(key){
		if(document.cookie){
			var kvs = $utils.unpackParams(document.cookie,";");
			return kvs[key];
		}
		return null;
	},
	unpackParams : function(paramStr,spliter){
		if(!paramStr) return null;
		if(!spliter) spliter = '&';
		paramStr = paramStr.replace(/(.*)\?/i,'');
		var parts = paramStr.split(spliter);
		var params = {};
		for(var i in parts){
			 var ps = parts[i].split('=');
			 if(ps.length==2)
			    params[ps[0].trim()] = ps[1];
		}
		return params;
	},
	packParams : function(params,spliter) {
		var pairs = [];
		if(!spliter) spliter = '&';
		for (var prop in params) {
		   pairs.push([prop,params[prop]].join('='));
		}
		return pairs.join(spliter);
	},
	/**
	 * preload image list (or css|font)
	 * */
	preload : function(files, onfileLoad, onfileError){
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
	},
	keyCode : function(e){
		if(document.all)
	    	return e.keyCode;
		else if($id)
	    	return (e.keyCode)? e.keyCode: e.charCode;
		else if(document.layers)
	    	return e.which;
	},
	isArray : function(v){
		return Object.prototype.toString.call(v) === '[object Array]';
	},
	isFunction : function(f) {
		var getType = {};
		return f && getType.toString.call(f) === '[object Function]';
	},
	isBool : function(va){
		return va===true || va===false;
	},
	isElement : function(obj) {
		try {
	    	return obj instanceof HTMLElement;
		}catch(e){
			return (typeof obj==="object") &&
				(obj.nodeType===1) && (typeof obj.style === "object") &&
				(typeof obj.ownerDocument ==="object");
	  	}
	},
	empty : function(o) {
		if(!o)return true;
		if(o.length && o.length==0)return false;
		if (typeof(o) === "object"){
			for(var _p in o) {
				return false;
			}
			return true;
		}
		return false;
	},
	clone : function(o){
		if(typeof(o)=="object"){
			var ob = {};
			for(var k in o)ob[k]=o[k];
			return ob;
		}else if($utils.isArray(o)){
			return o.slice(0);
		}
		return o;
	},
	include : function(src, callback,params){
		if(src.indexOf(".js")<0)
			src+=".js";
		if(src.indexOf("/")<0)
			src = $conf.liber_path+src;
		var jsId = src.split("/");
		jsId = jsId[jsId.length-1].replace(/\./g,"_");
		var time = new Date().getTime();
		if(!$id(jsId)){
			var cb = callback;
			var cbprm = params;
			var included = function(e){
				
				if(!$utils.__included)
					$utils.__included = [];
				e=e||window.event;
				var t=e.target||e.srcElement;
				
				if(t.readyState == "loading")
					return;
				//console.log("load "+t.src);
				
				if(e.type=="error"){
					//console.log("ERROR : Failed to load "+t.src);
				}
				t.onload = t.onreadystatechange = null;
				$utils.__included.push(t.id);
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
			//$utils.package(jsId);
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
	},
	setTimeout : function(func, delay, params){
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
	},
	archivePath : function(id, devider){
		var res = parseInt(id)%parseInt(devider);
		return [res,id].join("/");
	},
	extend : function(destination, source) {
	    for (var property in source)
	      destination[property] = source[property];
	    return destination;
	},
	_eventMatchers : {
		'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
		'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
	},
	_eventDefaultOptions : {
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
	fire : function(el, eventName){
		el = typeof(el)=="string" ? $id(el):el;
		if(el == undefined)
			return;
	    var options = $utils.extend($utils._eventDefaultOptions, arguments[2] || {});
	    var oEvent, eventType = null;
	    for (var name in $utils._eventMatchers){
	        if ($utils._eventMatchers[name].test(eventName)) { eventType = name; break; }
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
	        oEvent = $utils.extend(evt, options);
	        el.fireEvent('on' + eventName, oEvent);
	    }
	    return el;
	},
	//get min, max value
	range : function(arr,col){
		if(!arr)return false;
		var min,max,v,i;
		for(i=0;i<arr.length;i++){
			v = col? arr[i][col]:arr[i];
			if(!min){min=v;max=v;}
			if(min>v)min=v;
			if(max<v)max=v;
		}
		return [min,max];
	},
	//sort arr
	sort : function(arr,col){
		if(!arr)return false;
		return arr.sort(function(a,b){
			if(!col)return b>a?-1:(b==a?0:1);
			else
				return b[col]>a[col]?-1:(b[col]==a[col]?0:1);
		});
	},
	
	/**
	 * send log to dummy url log.html. for apache log analyzing. 
	 */
	log: function(action){
		action= (_viewer_id) ?[_viewer_id,action].join(":"):"0:"+action;
		if($http)
			$http.get(["/log.php?action=",action].join(""));
	},
	rand : function(min, max) {
		var argc = arguments.length;
		if (argc === 0) {
			min = 0;
			max = 2147483647;
		} else if (argc === 1) {
			max = min;
			min = 1;
		}
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
};

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
	"addClass" : function(cls) {
	    if(this.className.indexOf(cls)<0){
	    	this.className += " "+cls;
	    }
	    return this;
	},
	"removeClass" : function(cls) {
		if(!cls)return this;
		cls = cls.trim();
	    if(this.className.indexOf(cls)>=0){
	    	var clss = this.className.split(" ");
	    	var classes =[];
	    	for(var i in clss){
	    		var c = clss[i].trim();
	    		if(c!=cls && c.length>0)
	    			classes.push(c);
	    	}
	    	this.className = classes.join(" ");
	    }
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
			if(arg1=="html")
				arg1 = "innerHTML";
			if(arg1=="class")
				arg1 = "className";
			if(arg1=="url" && typeof(arg2)=="string"){
				this.bind("click", $app.trans);
				return this.attr("url",arg2);
			}
			if(arg2!=undefined){
				if(this.tagName.toUpperCase() == "IMG" && arg1.toLowerCase()=="src"){
					this[arg1] = $conf.image_path && arg2.indexOf("data:image")<0 && arg2.indexOf("http")!=0? $conf.image_path+arg2:arg2;
				}else{
					this[arg1] = arg2;
				}
				if(typeof(arg2)!="function" && !$utils.isBool(arg2)){
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
	
	/*
	var __html = function(opts){
		if(!opts) return this.innerHTML;
		else this.innerHTML = opts;
		return this;
	};
	*/
	hide : function(){$ui.hide(this);return this;},
	show : function(){$ui.show(this);return this;},
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
			$utils.setTimeout(function(arg){
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
		
		
		/*
		 * 
		 var animeFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        				window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		var cancel= window.webkitCancelAnimationFrame||window.cancelAnimationFrame||window.mozCancelAnimationFrame||window.msCancelAnimationFrame;
		var fstep = function(time){
			var timePassed=Date.now()-start;
			var progress = timePassed / opts.duration;
			if (progress > 1) progress = 1;
			var delta = $deltas[opts.delta];
			if(opts.style){
				if(opts.style=="easeOut") delta = $deltas.easeOut(delta);
				if(opts.style=="easeInOut") delta = $deltas.easeInOut(delta);
			}
			var delta_value = delta(progress);
			//console.log(time,timePassed, progress, delta_value);
			opts.step(ele, delta_value);
			if(progress>=1){
				cancel(animeID);
			}else{
				fstep();
			}

		};
		
		var animeID = animeFrame(fstep);
		//console.log("anime",animeID);
		*/
		
		
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
	}
};

if($browser.name=="MSIE" &&  $browser.version<9){
	$utils.include("liber.ie8");
}else{
	$utils.extend(Element.prototype,__element);
}


/* DOM functions */
var $_runtime
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
		}else if($utils.isArray(args)){
			////console.log("draw array");
			for(var i in args){
				if(args[i]!=null){
					if($utils.isElement(args[i])){
						_el.appendChild(args[i]);
					}else if($utils.isFunction(args[i])){
						var thisEl = _el;
						var res = args[i]();
						if($utils.isArray(res)){
							for(var _i in res){
								if($utils.isElement(res[_i]))
									thisEl.appendChild(res[_i]);
							}
						}else if($utils.isElement(res)){
							////console.log(res,_el);
							thisEl.appendChild(res);
						}
						_el = thisEl;
					}else{
						////console.log("ERROR : can not append child ",args[i]);
					}
				}
			}
		}else if($utils.isElement(args)){
			_el.appendChild(args);
		}else if($utils.isFunction(args)){
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

var TAGS = ["table","tr","th","td","div","img","ul","lo","li","p","a","b","strong","textarea","br","hr","form","input","span","label","h1","h2","h3","canvas"];
for(var i in TAGS){
	if(typeof(TAGS[i])=="function")continue;
	eval(["var " , TAGS[i].toUpperCase() , "= function(args,target){ return $e('" , TAGS[i],  "', args,target); };"].join(''));
	eval(["var $" , TAGS[i] , "= function(args,target){ return $e('" , TAGS[i],  "', args,target); };"].join(''));
}

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
		var lb = e.target || e.srcElement;
		var li = lb.tagName.toUpperCase()=="LI"?lb: lb.parentNode;
		lb = li.childNodes[0];
		var id = li.name;
		var ipt = $id(id+"-input");
		var tv = li.attr("value");
		var isMulti = 1==li.attr("multiple");
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
	var valuestr = attrs.value && attrs.multiple? "#"+ attrs.value.split(',').join('#,#') + "#" : attrs.value||"";
	var isMulti = 1==attrs.multiple||true==attrs.multiple;
	var container = $div({id:attrs.id},target);
	var list = $ul({id:attrs.id+"-list"},container);
	var idx = 0;
	var drawOpt = attrs.drawOption;
	for(var v in options){
		var surfix = (isMulti)?((valuestr.indexOf('#'+v+"#")>=0)?" on":""): ((attrs.value == v)?" on":"");
		var opt = $li([$div({className:attrs.labelClass?attrs.labelClass+surfix:surfix,html:options[v]})],list)
			.attr({name:attrs.id, value:v,idx:idx, multiple:isMulti?1:0,className:attrs.optionClass?attrs.optionClass+surfix:surfix}).bind("click", window._sel_handler);
		if(drawOpt)drawOpt(opt,idx);
		idx++;
	}
	$input({name:attrs.name, id:attrs.id+"-input", type:'hidden',value:attrs.value?attrs.value:''},container);
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
	if($utils.isArray(values)){
		for(var i in values)$e("option",{value:values[i],html:values[i]}, sele);
	}else{
		for(var v in values)$e("option",{value:v,html:values[v]}, sele);
	}
	if(attrs.value)
		sele.value = attrs.value;
	return sele;
};
window.SELECT = $select;
	

/* shot cuts */

window._layerIDX =0;
window._layers = [];

function $(query,each,thisLayer){
	var res = [];
	if(!thisLayer && query.indexOf(' ')<0){/* querySelectorAll is not as fast as we wish.*/
		if(query.charAt(0)=="#")
			return document.getElementById(query.replace("#",""));
		if(query.charAt(0)=="." && document.getElementsByClassName)
			res = document.getElementsByClassName(query.replace(".",""));
		if(/^[a-zA-Z]+$/.test(query))
			res = document.getElementsByTagName(query);
	}else{
		query=thisLayer?"#layer_"+window._layerIDX+" "+query:query;
		var qs = query.trim().split(" ");
		var lastq = qs[qs.length-1];
		res = document.querySelectorAll(query);
		if(lastq.charAt(0)=="#")return res[0];
	}
	var arr=[], l=res.length>>>0;
	for( ; l--; arr[l]=res[l] );//We HAVE TO change NodesList to Array. or nodelist will change it self dynamically 
	if(each){
		var len = arr.length;
		for(var i=0;i<len;i++){
			var dm=arr[i];
			var type = typeof(dm);
			if(type != "string" && type!="function" && type!="number"){
				each(dm,i);
			}
		}
	}
	return arr;
}
function $id(domid){return document.getElementById(domid);}




/***
 * MessageCenter
 * ***/

var $msg = {
	messages : {},
	register : function (targetId, msg, func, params){
		$msg.messages[targetId]={};
		$msg.messages[targetId][msg] = {'params':params, 'func':func};
	},
	call : function(targetId, msg, withData){
		if($msg.messages[targetId][msg]){
			var m = $msg.messages[targetId][msg];
			var params = m.params;
			if(!params)
				params={};
			if(withData)
				for(k in withData){
					params[k] = withData[k];
				}
			m.func(params);
		}
	},
	trigger : function(e){
		e = e || window.event;
		if(e && (e.target || e.srcElement)){
			var target = e.target || e.srcElement;
			/*TODO get message from dom.attr*/
			$msg.call(target.id,event.type);
		}
	}
};

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
		var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		var scrollLeft = (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft; 
		if(el.getBoundingClientRect){
			var r = el.getBoundingClientRect();//Read only
			return {top:r.top+scrollTop, width:r.width, left:r.left+scrollLeft, height: r.height};
		}	
			
		var _x = 0;
	    var _y = 0;
	    var w = el.clientWidth;
	    var h = el.clientHeight;
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

	preventDefault : function(e) {
        e = e || window.event;
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.returnValue = false;
    },
    
	addLayer : function(oncreate, params, dontHideOthers){
		if(!dontHideOthers){
			for(var i in window._layers){
				$ui.hide(window._layers[i]);
			}
		}
		var layer = document.createElement("div");
		layer.id = "layer_"+window._layerIDX;
		layer.setAttribute("layer",window._layerIDX);
		layer.className = "layer";
		layer.style.height = $ui.documentHeight();
		window._layers.push(layer);
		window._layerIDX ++;
		document.body.appendChild(layer);
		layer.css({
			width: "100%",height: "100%",zIndex:100+window._layerIDX,position: "absolute",
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
			while(window._layers.length>0){
				var l = window._layers.pop();	
				if(l.id == layer.id){
					layer.parentNode.removeChild(layer);
					break;
				}else if("message"==l.attr("layer-type")){
					l.parentNode.removeChild(l);
				}
			}
		}else{
			layer = window._layers.pop();	
			if(layer){
				layer.parentNode.removeChild(layer);
			}
		}
		$ui.showLastLayer();
	},
	
	showLastLayer : function(){
		var len = window._layers.length;
		if(len>0){
			var last = window._layers[len-1];
			if("message"==last.attr("layer-type")){
				window._layers.pop();
				return $ui.showLastLayer();
			}
			if($id(last.id))
				$ui.show(last);
			else{
				window._layers.pop();
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
		for(var i in window._layers){
			var l = window._layers[i];
			if(l.attr("layer")!=layer.attr("layer")){
				layers.push(l);
			}
		}
		layers.push(layer);
		layer.id = "layer_"+window._layerIDX;
		layer.setAttribute("layer",window._layerIDX);
		layer.style.display = "block";
		layer.style.zIndex = 100+window._layerIDX;
		window._layerIDX ++;
		window._layers = layers;
	},
	
	/*
	* 2nd param: mixed , time | callback function
	* examples: 
	*	$ui.showMessage ("please wait", function(re){blah, blah ...}, {param:1})
	*	$ui.showMessage ("please wait", 200) // close after 200ms
	*/
	showMessage : function(msg, func, params){
		/*show message*/
		$ui.addLayer(function(layer,params){
			layer.attr("layer-type","message");
			//mask = $div({className:"layer-black"},layer);
			layer.className = "layer-black";
			if (window.addEventListener) {
            	window.addEventListener('DOMMouseScroll', $ui.preventDefault, false);
        	}
			
        	window.onmousewheel = $ui.preventDefault;
        	if(document.onmousewheel)
        		document.onmousewheel = $ui.preventDefault;
			/*show message window*/
			var box = $id("messageBox");
			var msgtop = 240;
			layer.style.top = document.body.scrollTop+"px";
			if(!box)box = $div({id:"messageBox",html:msg},layer).css("marginTop",msgtop+"px");
			if(func && typeof(func)=="function")
				func(params,box);
			else{
				var time = parseInt(func);
				if(time>0){
					$utils.setTimeout($ui.hideMessage,time);
				}
			}
		},params,true);
	},
	updateMessage : function(msg,time,append){
		var box = $id("messageBox");
		if(!box)return;
		if(append)
			box.innerHTML += msg;
		else
			box.innerHTML = msg;
		if(time>0){
			$utils.setTimeout($ui.hideMessage,time);
		}
	},
	hideMessage : function(time){
		var box = $id("messageBox");
		if(box){
			if (window.removeEventListener) {
            	window.removeEventListener('DOMMouseScroll', $ui.preventDefault, false);
        	}
			window.onmousewheel = document.onmousewheel = null;
			if(box.parentNode.getAttribute("layer")){
				$ui.removeLayer();
			}else
				$ui.remove(box);
		}	
	},
	/**
	 * opts = {
	 * 	width : 240
	 * 	height : 18
	 *  label : "Loading ... "
	 *  labelStyle : {}
	 *  strokeColor : #ccc
	 *  bgColor : #666 
	 *  update : function(progress, params)
	 *  finish : function()
	 * }
	 * 
	 * css : {
	 * 	#progress-bar-frame
	 *  #progress-bar-label
	 * }
	 * 
	 * */
	progressBar :function(target,max,opts){
		var ProgressBar = function(target,max,opts){
			opts = opts||{};
			var barWidth = opts.width || 240;
			var barHeight = opts.height || 3;
			var maxValue = max;
			var value = 0;
			var labelPrefix = opts.label || "Loading ... ";
			var barFrame = $div({id:"progress-bar-frame"},target).css({margin:"300px auto auto auto",position:"relative",width:barWidth+"px",height:barHeight+"px",padding:"2px",border:"1px solid #666",borderRadius:"3px",fontSize:"0pt"});
			var canv = $canvas({width:barWidth,height:barHeight},barFrame);
			var barLabel = $span({id:"progress-bar-label",html:labelPrefix+"0%"},document.body).css(opts.labelStyle||{position:"absolute",top:310+barHeight+"px",width:"100%",height:"20px",zIndex:100,color:"#333",textAlign:"center",fontFamily:"impact"});
			var ctx = canv.getContext? canv.getContext("2d"):null;
			var onUpdate = opts.update||null;
			var onFinish = opts.finish||null;
			if(ctx){
				ctx.fillStyle = opts.bgColor|| "#666";
			    ctx.strokeStyle = opts.strokeColor||"#CCC";
			    ctx.lineWidth = 10;
			}
		    this.update = function(param){
		    	value++;
				var progress = parseInt(value*100/maxValue);
				if(onUpdate){onUpdate(progress,param);}
				if(ctx){
					canv.attr({"value":progress});
					canv.animate({
		    	        duration:300,
		    	        step:function(el,delta){
		    	        	var v=el.attr("value");
		    	        	var w = delta*v/100*barWidth;
		    	           	ctx.fillRect(0, 0, w, barHeight);
		    	        }
		    	    });
				}
				barLabel.innerHTML=labelPrefix+progress+"%";
	    		if(progress>=100){
	    			$ui.remove("progress-bar-frame");
	    			$ui.remove("progress-bar-label");
	    			if(onFinish){onFinish();}
	    		}
			};
		};
		
		return new ProgressBar(target,max,opts);
	},
	showAlertWindow : function(msg, data, onOK, onCancel){
		$ui.showMessage(msg,function(params,box){
			//change box style
			box.addClass("alert-window");
			$div([
				$a({className:"button orange",html:"OK","data":params.data,onclick:params.ok}),
				$a({className:"button gray",html:"Cancel",onclick:function(e){
					$ui.hideMessage();
					if(params.cancel)
						params.cancel(e);
				}})
			],box).attr("class","button-bar buttons");
		},{ok:onOK,cancel:onCancel,data:data});

	},
	
	/** 
	* @param property : top, left, width, height

	getSize : function(dom, property){
		if(typeof(dom)=="string")
			dom = $id(dom);
		if(!dom)return 0;
		v = (dom.currentStyle)? dom.currentStyle[property]:
			document.defaultView.getComputedStyle(dom,"").getPropertyValue(property);
		if(v){
			return parseInt(v.replace('px',''));
		}return 0;
	},
	*/
	imageUploadWindow : function(callback,multiple){
		var imgform = $id('tempImages');
		if(imgform==undefined){
			imgform = $form({id:"tempImages", enctype:"multipart/form-data"}, document.body).css({border:'0px',height:'0px',width:'0px',display:"none"});
			var params = {id:"tempImage",type:"file", name:"tempImage"};
			if(multiple) params["multiple"] = "multiple";
			var ipt = $input(params,imgform);
			/*evType = $browser.name=="MSIE"&&$browser.version<9 ? "focus":"change";*/
			ipt.bind("change",callback);
			$utils.fire(ipt,"click");
		}else{
			imgform.style.display = "block";
			$utils.fire('tempImage',"click");
			$utils.setTimeout(function(){
				$id('tempImages').style.display = "none";
			},100);
		}
	},
	loading:function(target, styles){
		var frame = $div({id:"loading"},target).css({width:"50px"});
		if(styles){
			frame.css(styles);	
		}
		var canv = $e("canvas",{id:"canv", width:"50px",height:"20px"},frame);
		var ctx = canv.getContext("2d");
	    var copt = {
	        	frame:60,
	        	duration:400,
	        	step:function(el,delta){
	        		ctx.clearRect(0,0,70,25);
	        		var times = parseInt(delta/0.2)+1;
	        		if(times>5)times=5;
	        		for(var i=0;i<times;i++){
	        			ctx.fillStyle = "rgb("+(180-i*32)+","+(180-i*32)+","+(180-i*32)+")";
	        			ctx.fillRect(i*10, 10-i, 7, 10+i);
	        		}
	        		if(delta>=1){
	        			canv.animate(copt);
	        		}
	        	}
	     };
	    canv.animate(copt);
	    return frame;
	},
	_view : undefined
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
	  							xhr.runtimeParams.callback(null,{message:"json_error", data:res});
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
	upload : function(url, params, callback, onprogress,format){
		$http.ajax('UPLOAD',url,params,callback,format,onprogress);
	}
};

