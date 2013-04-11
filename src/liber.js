/**
 * @author soyoes 
 * @Copywrite (c) 2013, Liberhood, http://liberhood.com 
 * @URL : https://code.google.com/p/liber-js/
 * @license : MIT License
 */
window._params = undefined;

var __packages = "";
var $this;//current view;
var $conf = $conf || {};
var $browser = (function(){
    var N= navigator.appName, ua= navigator.userAgent, tem;
    var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    M= M? [M[1], M[2]]: [N, navigator.appVersion, 0];
    return {name:M[0], version:parseInt(M[1])};
})();
var $app = {
	_view : undefined,
	layers : [],
	start : function(start_view){
		__default = {
			modules : [],
			liber_path : "/js/",
		};
		for(i in __default){
			if(!$conf[i])$conf[i]=__default[i];
		}
		if($conf.modules)
			for(i in $conf.modules){
				$utils.include($conf.modules[i]);
			}
		if(typeof(start_view)=="string")
			$app.loadView(start_view);
		else
			$app.loadView();
	},
	handle : function(type, data){
		switch(type){
			case "loaded":
				$app.drawView();
				break;
			case "redirect":
				$app.loadView(data);
				break;
			default:
				break;
		}
	},
	trans : function(e){
		e = e||window.event;
		target = e.target||e.srcElement;
		if(target){
			url = target.getAttribute("url");
			if(url){
				$app.loadView(url);
			}
		}
	},
	loadView : function(url){
		url = url || $conf.default_view;
		if(url){
			if(url.indexOf("http:")==0 || url.indexOf("https:")==0){
				location.href = url;
				return;
			}else{
				//try{
					params = $utils.unpackParams(url);
					viewname = url.split("?")[0];
					$app.view = viewname;
					view = $controller.enhance(window[viewname]);
					if(!view){
						throw new Error("100 : "+viewname+" does not exist");
						return;
					}
					$this = view;
					view.params = params;
					if(view.onload){
						view.onload(params);
					}else{
						view.loaded();
					}
					
				/*
				}catch(ex){
					if($this && $this.onerror)
						$this.onerror(ex,"load");
					console.log("EXCEPTION:",ex.type,"-",ex.message);
					return;
				}
				*/
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
		
		if(view.reusable && view.layer){
			$ui.bringLayerToFront(view.layer);
			if(view.drawContent){
				view.drawContent(view.wrapper,view.layer);	
			}
			return;
		}
		//try{
			$ui.addLayer(function(layer, view){
				layer.attr("view", view.name);
				$ui._view = view;
				if(!view.noHeader){
					var header =  $app.drawHeader? $app.drawHeader(layer):$div({id:"header"},layer);
					if(view.drawHeader)
						view.drawHeader(header);	
				}

				var content = $div({id:"content"},layer);
				var wrapper = $div({"class":"wrapper",id:"wrapper",layer:layer.attr("layer")},content);

				if(view.drawContent){
					if(view.layer)
						$ui.remove(view.layer);
					view.layer = layer;
					view.wrapper = wrapper;
					view.drawContent(wrapper,layer);	
				}

				if(!view.noFooter){
					var footer =  $app.drawFooter? $app.drawFooter(layer):$div({id:"footer"},layer);
					if(view.drawFooter)
						view.drawFooter(footer);
				}
			},view);
		/*
		}catch(ex){
			if($this.onerror)
				$this.onerror(ex,"render");
			console.log("EXCEPTION:",ex);
		}
		*/
	},
	closeView : function(view){
		view = view || $this;
		if(typeof(view)=="string") view = window[view];
		if(!view)return;
		$this = $app.view = undefined;
		if(view.onclose)
			view.onclose();
		$ui.removeLayer(view);
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
		if(!view){
			throw new Error("101 :now view to enhance");
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

/*console.log("browser",$browser.name,"-",$browser.version);*/

var $history = {
	stack : [],
	change : function(e){
		anc = history.state || location.hash;
		console.log("history.change", anc);
		if(!anc || anc==""){
			window.location = window.location;			
		}else {
			if($history.stack.length>0){
				last = $history.stack.length>1 ? $history.stack[$history.stack.length-2] : null;
				console.log("last", last);
				if(last && last == anc){
					$history.stack.pop();
					$history.stack.pop();
					console.log("remove layer");
					$ui.removeLayer();
				}else{
					if($history.stack[$history.stack.length-1]!=anc)
						$history.stack.push(anc);
				}
			}else{
				$history.stack.push(anc);
			}
		}
	},

	push : function(anchor){
		if(typeof(anchor)!="string" && anchor.attr){
			href = anchor.attr("href");
			if(href)
	    		anchor = href;
			else
				return;
		}
		if(anchor != "#"){
			if(history.pushState){
				history.pushState({},anchor, anchor);
			}else{
				lk = $a({href:anchor},document.body);
				$utils.fire(lk, "click");
			}
			$history.stack.push(anchor);
		}
	},
	init : function(){
		if(window.onpopstate){
			window.onpopstate = $history.change;
		}else{
			window.onhashchange = $history.change;
		}
	}
};
$history.init();

/* Prototypes */
/*
#YYYY#     4-digit year             1999
#YY#       2-digit year             99
#MMMM#     full month name          February
#MMM#      3-letter month name      Feb
#MM#       2-digit month number     02
#M#        month number             2
#DDDD#     full weekday name        Wednesday
#DDD#      3-letter weekday name    Wed
#DD#       2-digit day number       09
#D#        day number               9
#th#       day ordinal suffix       nd
#hhh#      military/24-based hour   17
#hh#       2-digit hour             05
#h#        hour                     5
#mm#       2-digit minute           07
#m#        minute                   7
#ss#       2-digit second           09
#s#        second                   9
#ampm#     "am" or "pm"             pm
#AMPM#     "AM" or "PM"             PM

now.customFormat( "#DD#/#MM#/#YYYY# #hh#:#mm#:#ss#" )
*/
Date.prototype.customFormat = function(formatString){
    var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
    var dateObject = this;
    YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
    MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
    MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
    DD = (D=dateObject.getDate())<10?('0'+D):D;
    DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
    th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
    formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

    h=(hhh=dateObject.getHours());
    if (h==0) h=24;
    if (h>12) h-=12;
    hh = h<10?('0'+h):h;
    AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
    mm=(m=dateObject.getMinutes())<10?('0'+m):m;
    ss=(s=dateObject.getSeconds())<10?('0'+s):s;
    return formatString.replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
};
String.prototype.validate = function(type){ 
	parts = [];
	if(type.indexOf("len:")==0 || type.indexOf("id:")==0) {
		parts = type.split(":");
		type = parts[0];
	}

	switch(type){
		case "email":
			return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(.+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this);
		case "phone":
    		return /^[a-zA-Z0-9\-().\s]{8,15}$/.test(this);
    	case "zip_code":
    		return /^\d{5}(-\d{4})?$/.test(this);
    	case "address":
    		return /^[a-z0-9\s,\.'-]*$/i.test(this);
    	case "url":
    		re = new RegExp(
        	    "^((http|https|ftp)\://)*([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    		return re.test(this);
    	case "len":
    		min = parseInt(parts[1]);
			max = parts.length==3 ? parseInt(parts[2]): 0;
 			return (max>0) ?this.length>=min && this.length<=max : this.length>=min;
 		case "id":
 			targetId = parts[1];
 			return $id(targetId).value == this;
 	}
	return true;
};
String.prototype.ucfirst = function(){
	return this.charAt(0).toUpperCase()+this.substring(1);
};
String.prototype.toHex = function(){
	var str = [],
    len = this.length;
	for (i=0; i < len; i += 1) {
	    c = this.charCodeAt(i);
	    str.push(c.toString(16));
	}
	return str.join('');
};
String.prototype.getByte=function(){
	count = 0;
	for (i=0; i<this.length; i++){
		n = escape(this.charAt(i));
		if (n.length < 4) count++; else count+=2;
	}
	return count;
};
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
};


var $utils = {
	/**
	* @param : get JS params
	*/
	_params : function(){
		if(_params)
			return _params;
		scripts = document.getElementsByTagName("script");
		_params = {};
		for(i in scripts){
			sc = scripts[i];
			if(sc.src.indexOf('liber.js')>=0){
				pstrs = sc.src.split('liber.js');
				pstr = pstrs[1];
				if(pstr.indexOf("?")==0){
					pstr= pstr.replace("?","");
					pstrs = pstr.split('&');
					for(j in pstrs){
						parts = pstrs[j].split('=');
						_params[parts[0]] = parts[1];
					}
				}
				return _params;
			}
		}
	},
	inArray : function (needle, haystack, argStrict) {
		var key = '',
		strict = !! argStrict;

		if (strict) {
			for (key in haystack) {
				if (haystack[key] === needle) return true;
		    }
		}else {
			for (key in haystack) {
		    	if (haystack[key] == needle) return true;
			}
		}
		return false;
	},
	empty : function(mixed_var) {
		var undef, key, i, len;
		var emptyValues = [undef, null, false, 0, "", "0"];
		for (i = 0, len = emptyValues.length; i < len; i++) {
			if (mixed_var === emptyValues[i])return true;
		}
	  	if (typeof mixed_var === "object") {
			for (key in mixed_var) {
				return false;
			}
			return true;
		}
		return false;
	},
	clone : function(arg){
		if(typeof(arg)=="object"){
			o = {};
			for(i in arg){
				o[i] = arg;
			}
			return o;
		}
		return arg;
	},
	getCookie : function(key){
		//console.log(document.cookie);
		if(document.cookie){
			kvs = $utils.unpackParams(document.cookie,";");
			//console.log(kvs,key,kvs[key]);
			return kvs[key];
		}
		return null;
	},
	unpackParams : function(paramStr,spliter){
		if(!paramStr)return null;
		if(!spliter) spliter = '&';
		paramStr = paramStr.replace(/(.*)\?/i,'');
		parts = paramStr.split(spliter);
		params = {};
		for(i in parts){
			 ps = parts[i].split('=');
			 if(ps.length==2)
			    params[ps[0].trim()] = ps[1];
		}
		return params;
	},
	packParams : function(params,spliter) {
		var pairs = [];
		if(!spliter) spliter = '&';
		for (prop in params) {
		   pairs.push([prop,params[prop]].join('='));
		}
		return pairs.join(spliter);
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
		return Object.prototype.toString.call( v ) === '[object Array]';
	},
	isFunction : function(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
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
	include_old : function(src,id,force){
		var js,fjs=document.getElementsByTagName("script")[0];
		if(force){
			tag = $id(id);
			if(tag)
				$ui.remove(tag);
		}

		if(!$id(id)){
			js=document.createElement("script");
			if(id)
				js.id=id;
			js.src=src;
			fjs.parentNode.insertBefore(js,fjs);
			$utils.__includeInterval = setInterval();
		}
	},
	include : function(src, callback,params){
		if(src.indexOf(".js")<0)
			src+=".js";
		if(src.indexOf("/")<0)
			src = $conf.liber_path+src;
		var jsId = src.split("/");
		jsId = jsId[jsId.length-1].replace(/\./g,"_");
		var packageName = jsId.replace("_js","");
		if(!$id(jsId)){
			$e("script",{id:jsId,src:src},document.head);
			if(!$utils.__include)
				$utils.__include = {};
			$utils.__include[jsId] = {
				"interval" : setInterval(function(){
					if($utils.included(packageName)){
						clearInterval($utils.__include[jsId].interval);
						if($utils.__include[jsId].callback)
							$utils.__include[jsId].callback($utils.__include[jsId].params);
						console.log("Included-times",$utils.__include[jsId].times+1);
						delete $utils.__include[jsId];
					}else{
						$utils.__include[jsId].times = $utils.__include[jsId].times+1;
						if($utils.__include[jsId].times>50){
							clearInterval($utils.__include[jsId].interval);
							delete $utils.__include[jsId];
							console.log("Include timeover");
						}
					}
				},10),
				"callback" : callback,
				"times" : 0,
				"params":params
			}
		}else{
			if(callback)
				callback(params);
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
		res = parseInt(id)%parseInt(devider);
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
	
	/**
	 * send log to dummy url log.html. for apache log analyzing. 
	 */
	log: function(action){
		action= (_viewer_id) ?[_viewer_id,action].join(":"):"0:"+action;
		if($http)
			$http.get(["/log.php?action=",action].join(""));
	},
	
	screenWidth :function(){
	    xWidth = null;
		if (window.screen != null)
			xWidth = window.screen.availWidth;
		if (window.innerWidth != null)
			xWidth = window.innerWidth;
		if (document.body != null)
			xWidth = document.body.clientWidth;
		return xWidth;
	},
	screenHeight : function(){
		xHeight = null;
		if (window.screen != null)
			xHeight = window.screen.availHeight;
		if (window.innerHeight != null)
			xHeight = window.innerHeight;
		if (document.body != null)
			xHeight = document.body.clientHeight;
		return xHeight;
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
	},
	"package" : function(str){
		__packages = __packages.split(",");
		__packages.push(str.replace(/_/g,"."));
		__packages = __packages.join(",");
	} ,
	"included" : function(str){
		return __packages.indexOf(str.replace(/_/g,"."))>=0;
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
		}
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
		}
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
	    	clss = this.className.split(" ");
	    	var classes =[];
	    	for(i in clss){
	    		c = clss[i].trim();
	    		if(c!=cls && c.length>0)
	    			classes.push(c);
	    	}
	    	this.className = classes.join(" ");
	    }
	    return this;
	},
	
	css : function(arg1,arg2){
		if(typeof(arg1)=="string"){
			if(arg2!=undefined)
				this.style[arg1] = arg2;
			else 
				return this.style[arg1];
		}else if(typeof(arg1)=="object" && !arg2){
			for(f in arg1){
				this.style[f] = arg1[f];
			}
		}
		return this;
		
	},

	attr : function(arg1,arg2){
		if(typeof(arg1)=="string"){
			if(arg1=="html")
				arg1 = "innerHTML";
			if(arg1=="class")
				arg1 = "className";
			if(arg2!=undefined){
				this[arg1] = arg2;
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
								//console.log("value-",this.value);
								this.style.color = "#999";
								this.attachEvent("onfocus",function(e){
									 e = e||window.event;
									 ipt = event.srcElement;
									 ipt.style.color = "#333";
						             if (ipt.value == ipt.attr('placeHolder')) {
						                 ipt.value = "";
						             }
						        });
								this.attachEvent("onblur",function(e){
									e = e||window.event;
									ipt = event.srcElement;
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
					if(arg1!="innerHTML"&&arg1!="className")
						this.setAttribute(arg1,arg2);
				}
			}else{
				//return this[arg1]?this[arg1]:this.getAttribute(arg1);
				return this.getAttribute(arg1);
			}
		}else if(typeof(arg1)=="object" && !arg2){
			for(_f in arg1){
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
			for(f in arg1){
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
				//this["on"+f] = arg1[f];
				//this.addEventListener(f.replace(/^on/,''),arg1[f]);
			}
		}
		return this;
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
			delay = parseInt(opts.delay);
			delete opts["delay"];
			$utils.setTimeout(function(arg){
				if(arg.ele)
					arg.ele.animate(arg.opts);
			}, delay, {ele:ele, opts:opts});
			return ele;
		}
		var start = new Date();
		opts.duration = opts.duration||1000;
		opts.frame = opts.frame || 50;
		opts.interval = 1000/opts.frame;
		opts.delta = opts.delta || "linear";
		
		var inter = setInterval(function() {
			var timePassed = new Date - start;
			var progress = timePassed / opts.duration;
			if (progress > 1) progress = 1;
			delta = $deltas[opts.delta];
			if(opts.style){
				if(opts.style=="easeOut") delta = $deltas.easeOut(delta);
				if(opts.style=="easeInOut") delta = $deltas.easeInOut(delta);
			}
			var delta_value = delta(progress); 
			opts.step(ele, delta_value);
			if (progress == 1) {
				clearInterval(inter);
			}
		}, opts.interval);
		return this;
	}
} 

if($browser.name!="MSIE" && $browser.version>=9){
	$utils.extend(Element.prototype,__element);
}else{
	$utils.include("liber.ie8", ie8_enhance);
}


/* DOM functions */
var $e = function(type, args, target){
	_el = document.createElement(type);
	if(target && typeof(target)=="string")
		target = $id(target);
	if(args){
		dataType = typeof(args);
		if(dataType=="string"){
			switch(type){
				case "img" : _el.src = args;
					break;
				case "a" : _el.href = args;
					break;
				default : _el.innerHTML = args;
					break;
			}
		}else if($utils.isArray(args)){
			//console.log("draw array");
			for(_argIdx in args){
				if(args[_argIdx]!=null){
					if($utils.isElement(args[_argIdx])){
						_el.appendChild(args[_argIdx]);
					}else{
						//console.log("ERROR : can not append child ",args[_argIdx]);
					}
				}
			}
		}else if($utils.isElement(args)){
			_el.appendChild(args);
		}else if($utils.isFunction(args)){
			return $e(type, args(), target);
		}else if(dataType=="object"){
			for(_k in args){
				_v = args[_k];
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
}
var TAGS = ["table","tr","th","td","div","img","ul","lo","li","p","a","b","strong","textarea","br","hr","form","input","span","label","h1","h2","h3"];
for(i in TAGS){
	if(typeof(TAGS[i])=="function")continue;
	eval(["var " , TAGS[i].toUpperCase() , "= function(args,target){ return $e('" , TAGS[i],  "', args,target); };"].join(''));
	eval(["var $" , TAGS[i] , "= function(args,target){ return $e('" , TAGS[i],  "', args,target); };"].join(''));
}
/**
 * options : {m:'male',f:'female'}
 * */
var $radio = function(options,attrs,target){
	opts = [];
	oncheck = function(event){
		
		event = event || window.event;
		target = event.target || event.srcElement;
		//.log("click", target.className);
		
		
		id = target.name.replace(/_options$/,"");
		ipt = $id(id);
		
		tv = target.attr("value");
		
		if(tv == ipt.value){
			ipt.value = "";
			target.className="icons radio";
		}else{
			$("."+id+" .on", function(el){el.className = "icons radio"});
			target.className="icons radio on";
			ipt.value = tv;
		}
		
	};
	for(v in options){
		opt = $div({className:'radio-option '+attrs.id},target);
		ra = $span({className:'icons radio ',name:attrs.id+"_options", value:v, html:options[v], onclick:oncheck},opt);
		if(attrs.value == v){
			//ra.checked = true;
			ra.className="icons radio on ";
		}
		opts.push(opt);
	}
	opts.push($input({name:attrs.name, id:attrs.id, type:'hidden',className:attrs.className,value:attrs.value?attrs.value:''},target));
	return opts;
};
window.RADIO = $checkbox;
/**
 * options : {m:'male',f:'female'}
 * */
var _checkbox_handler = function(event){
	event = event || window.event;
	target = event.target || event.srcElement;
	id = target.name.replace(/_options$/,'');
	ipt = $id(id);
	//opts = $("."+target.name);
	vs = [];
	target.className = target.className.indexOf("check on")>0?"icons check":"icons check on";
	$("."+id+" .on",function(el){
		vs.push(el.getAttribute("value"));
	});
	ipt.value = vs.join(',');
};

var $checkbox = function(options,attrs,target){
	opts = [];
	valuestr = attrs.value? "#"+ attrs.value.split(',').join('#,#') + "#" : "";
	for(v in options){
		opt = $div({className:'check-option '+attrs.id},target);
		//var chk = $input({name:attrs.id+"_options", type:'checkbox', value:v, className:attrs.id+"_options"},opt);
		chk = $span({className:'icons check '+attrs.id+"_options",name:attrs.id+"_options", value:v, html:options[v]},opt);
		if(! attrs.onchange){
			chk.bind("click",_checkbox_handler);
		}else{
			chk.onchange = attrs.onchange;
		}
		if(valuestr.indexOf('#'+v+"#")>=0){
			chk.className="icons check on ";
		}
		//$span(options[v],opt);
		opts.push(opt);
	}
	opts.push($input({name:attrs.name, id:attrs.id, type:'hidden',className:attrs.className,value:attrs.value?attrs.value:''},target));
	return opts;
};
window.CHECKBOX = $checkbox;

var $select = function(values,attrs,target){
	if($browser.name=="MSIE" && $browser.version<9 && attrs.name ){
		sele = document.createElement(["<select name=", attrs.name, "></select>"].join("\'"));
		sele.attr(attrs);
		if(target)
			target.appendChild(sele);
	}else{
		sele = $e("select",attrs,target);
	}
	if($utils.isArray(values)){
		for(i in values){
			$e("option",{value:values[i],html:values[i]}, sele);
		}
	}else{
		for(v in values){
			$e("option",{value:v,html:values[v]}, sele);
		}
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
	res = [];
	if(!thisLayer && query.indexOf(' ')<0){
		if(query.charAt(0)=="#")
			return document.getElementById(query.replace("#",""));
		if(query.charAt(0)=="." && document.getElementsByClassName)
			res = document.getElementsByClassName(query.replace(".",""));
		if(/^[a-zA-Z]+$/.test(query))
			res = document.getElementsByTagName(query);
	}/* querySelectorAll is not as fast as we wish.*/
	else{
		query=thisLayer?"#layer_"+window._layerIDX+" "+query:query;
		qs = query.trim().split(" ");
		lastq = qs[qs.length-1];
		res = document.querySelectorAll(query);
		if(lastq.charAt(0)=="#")
			return res[0]
	}
	if(each){
		for(i in res){
			dm = res[i];
			type = typeof(dm);
			if(type != "string" && type!="function" && type!="number"){
				each(dm);
			}
		}
	}
	return res;
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
			m = $msg.messages[targetId][msg];
			params = m.params;
			if(!params)
				params={};
			if(withData)
				for(k in withData){
					params[k] = withData[k];
				}
			m.func(params);
		}
	},
	/*
	send : function(target, msg, data){
		target = typeof(target)=="string"?window[target]:target;
		if(!target)
			return;//TODO do sth here
		if(target["on"+msg]){
			target["on"+msg](data);
		}else if(target.onevents){
			target.onevents({type:msg,data:data});
		}else if(target[msg]){
			target[msg](data);
		}
	},
	*/
	trigger : function(event){
		event = event || window.event;
		if(event && (event.target || event.srcElement)){
			target = event.target || event.srcElement;
			/*TODO get message from dom.attr*/
			$msg.call(target.id,event.type);
		}
	}
};


var UIKits = function(){
	var _this = this;
	this.hide = function(args){
		if(!args)return;
		args = (typeof(args)=="string") ? [args]:args;
		for(i in args){
			d = $id(args[i]);
			if(d)d.style.display = "none";
		}
	};

	this.show = function(args){
		if(!args)return;
		args = (typeof(args)=="string") ? [args]:args;
		for(i in args){
			d = $id(args[i]);
			if(d)d.style.display = "block";
		}
	};
	this.toggle = function(args){
		if(!args)return;
		args = (typeof(args)=="string") ? [args]:args;
		for(i in args){
			if(d = $id(args[i])){
				if(d.className.indexOf("hidden")>=0){
					d.className  = d.className.replace("hidden","");
				}else{
					d.style.display = (d.style.display=="none") ? "block":"none";	
				}
			}
		}	
	}
	
	this.remove = function(el){
		if(!el)return;
		type = typeof(el);
		if(type == "function")
			return;
		if(type=='string')
			el = $id(el);
		if(el && el.parentNode)
			el.parentNode.removeChild(el);
	};

	this.documentHeight =function() {
	    var d = document.documentElement ? document.documentElement:document.body;
	    return Math.max(d.scrollHeight, d.offsetHeight,d.clientHeight);
	};

	this.preventDefault = function(e) {
        e = e || window.event;
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.returnValue = false;
    };

	this.addLayer=function(oncreate, params, dontHideOthers){
		if(!dontHideOthers){
			for(i in window._layers)
				$ui.hide(window._layers[i]);	
		}
		layer = document.createElement("div");
		layer.id = "layer_"+window._layerIDX;
		layer.setAttribute("layer",window._layerIDX);
		layer.className = "layer";
		layer.style.height = this.documentHeight();
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
		
	};
	
	this.removeLayer=function(view){
		layer = null;
		if(view){
			layer = view.layer;
			if(!layer)
				return;
			while(window._layers.length>0){
				l = window._layers.pop();	
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
		this.showLastLayer();
	};
	
	this.showLastLayer = function(){
		len = window._layers.length;
		if(len>0){
			last = window._layers[len-1];
			if("message"==last.attr("layer-type")){
				window._layers.pop();
				return this.showLastLayer();
			}
			$ui.show(last);
		}else{
			if($conf.default_view){
				$app.loadView($conf.default_view);
			}else{
				window.location = window.location;
			}
		}
	}
	
	this.bringLayerToFront=function(layer){
		layers = [];
		for(i in window._layers){
			l = window._layers[i];
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
	};
	
	/*
	* 2nd param: mixed , time | callback function
	* examples: 
	*	$ui.showMessage ("please wait", function(re){blah, blah ...}, {param:1})
	*	$ui.showMessage ("please wait", 200) // close after 200ms
	*/
	this.showMessage = function(msg, func, params){
		/*show message*/
		$ui.addLayer(function(layer,params){
			layer.className="layer-black";
			layer.attr("layer-type","message");
			if (window.addEventListener) {
            	window.addEventListener('DOMMouseScroll', this.preventDefault, false);
        	}
			
        	window.onmousewheel = this.preventDefault;
        	if(document.onmousewheel)
        		document.onmousewheel = this.preventDefault;	
			/*show message window*/
			box = $id("messageBox");
			msgtop = document.body.scrollTop+240;
			if(!box)box = $div({id:"messageBox",html:msg},layer).css("marginTop",msgtop+"px");
			if(func && typeof(func)=="function")
				func(params,box);
			else{
				time = parseInt(func);
				if(time>0){
					$utils.setTimeout($ui.hideMessage,time);
				}
			}
		},params,true);
	};
	this.updateMessage = function(msg,time,append){
		box = $id("messageBox");
		if(!box)return;
		if(append)
			box.innerHTML += msg;
		else
			box.innerHTML = msg;
		if(time>0){
			$utils.setTimeout($ui.hideMessage,time);
		}
	};
	this.hideMessage = function(time){
		box = $id("messageBox");
		if(box){
			if (window.removeEventListener) {
            	window.removeEventListener('DOMMouseScroll', this.preventDefault, false);
        	}
			window.onmousewheel = document.onmousewheel = null;
			if(box.parentNode.getAttribute("layer")){
				$ui.removeLayer();
			}else
				$ui.remove(box);
		}	
	};
	this.showAlertWindow = function(msg, data, onOK, onCancel){
		$ui.showMessage(msg,function(params,box){
			//change box style
			box.addClass("alert-window");
			bar = $div([
				$a({className:"button orange",html:"OK","data":params.data,onclick:params.ok}),
				$a({className:"button gray",html:"Cancel",onclick:function(e){
					$ui.hideMessage();
					if(params.cancel)
						params.cancel(e);
				}})
			],box).attr("class","button-bar buttons");
		},{ok:onOK,cancel:onCancel,data:data});

	};
	this.countDown = function(domId,callback){
		if(domId)
			$ui.counterDomId = domId;
		if(callback)
			$ui.counterCallback = callback;
		setTimeout(function(){
			if($ui.counterDomId){
				dom = $id(_this.counterDomId);
				counter =parseInt(dom.innerHTML)-1;
				dom.innerHTML = counter;
				if(counter>0){
					$ui.countDown();
				}else{
					if($ui.counterCallback)
						$ui.counterCallback();
					$ui.counterDomId = null;
					$ui.counterCallback = null;
				}
			}
		},1000);
	};
	/** 
	* @param property : top, left, width, height
	
	this.getSize = function(dom, property){
		if(typeof(dom)=="string")
			dom = $id(dom);
		if(!dom)return 0;
		v = (dom.currentStyle)? dom.currentStyle[property]:
			document.defaultView.getComputedStyle(dom,"").getPropertyValue(property);
		if(v){
			return parseInt(v.replace('px',''));
		}return 0;
	}
	*/
	this.formView = function(args){
		$utils.include("liber.ui.ext",function(args){
			try{
				form = new FormView(args);
				form.draw();
			}catch(ex){
				
			}
		},args);
	};
	
	this.imageUploadWindow = function(callback,multiple){
		var imgform = $id('tempImages');
		if(imgform==undefined){
			imgform = $form({id:"tempImages", enctype:"multipart/form-data"}, document.body).css({border:'0px',height:'0px',width:'0px',display:"none"});
			params = {id:"tempImage",type:"file", name:"tempImage"};
			if(multiple) params["multiple"] = "multiple";
			ipt = $input(params,imgform);
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
	};
	
	
	this._view = undefined;

	this.calendar = function(target,attrs,onclick ){
		if(typeof(target)=="string")target = $id(target);
		if(!target)return;
		target.innerHTML="";
		dom = "";
		if ($ui._calendar){
			dom = $ui._calendar.dom;
			target.appendChild(dom);
		}else{
			var cbp = function(args){
				cal = new Calendar(args.attrs,args.onclick);
				cal.draw();
				$ui._calendar=cal;
				target.appendChild(cal.dom);
			};
			$utils.include("liber.ui.ext", cbp, {attrs:attrs, onclick:onclick});
		}
	};
	
};
var $ui = new UIKits;
/*
$ui.params();

*/

var HTTPKits = function(){
	this.getRequest = function(){
		return (window.XMLHttpRequest) ? new XMLHttpRequest()/*code for IE7+, Firefox, Chrome, Opera, Safari*/
		:new ActiveXObject("Microsoft.XMLHTTP"); /*ie5-6*/
	}
	
	this.ajax = function(method, url, params, callback, format, onprogress){
		var xhr = this.getRequest();
		if(!format) format = "json";
		xhr.runtimeParams = {
			callback : callback,
			format : format
		}; 
		if(onprogress)
			xhr.runtimeParams.onprogress = onprogress;

		isFile = false;
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
	  					res = xhr.responseText;
	  					if (xhr.runtimeParams.format == 'json') {
	  						res = JSON.parse(res);
	  					}
	    				xhr.runtimeParams.callback(res);
    				}	
  				}else{
  					errors = {
	    				code : xhr.status,
	    				message : xhr.getResponseHeader("ERROR_MESSAGE")
	    			}
	    			xhr.runtimeParams.callback(null, errors);		
	  			}
    		}
    			
  		}
  		var userdata = '';
  		if(params){
  			datas = [];
  			for (key in params){
  				key = key.replace(/\//g,'%2F').replace(/\s/g,'%20');
  				value = params[key]+"";
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
		
	};
	
	this.get = function(url, params, callback, format){
		this.ajax('GET',url,params,callback,format);
	};
	
	this.post = function(url, params, callback, format){
		this.ajax('POST',url,params,callback,format);
	};
	this.put = function(url, params, callback, format){
		this.ajax('PUT',url,params,callback,format);
	};
	this.del = function(url, params, callback, format){
		this.ajax('DELETE',url,params,callback,format);
	};
	this.upload = function(url, params, callback, onprogress,format){
		this.ajax('UPLOAD',url,params,callback,format,onprogress);
	};
};
var $http = new HTTPKits;

var _viewer_id = $utils.getCookie("tid");
//console.log("_viewer_id",_viewer_id);

