/**
 * @author soyoes 
 * @Copywrite (c) 2013, Liberhood, http://liberhood.com 
 * @URL : https://github.com/soyoes/liberjs
 * @license : MIT License
 * 
 */

var $conf=$conf||{};
var $ui={},TEXTS=TEXTS||{};
const LOCALES = ['af_ZA','ar_AR','az_AZ','be_BY','bg_BG','bn_IN','bs_BA','ca_ES','cs_CZ','cy_GB','da_DK','de_DE','el_GR','en_GB','en_PI','en_UD','en_US','eo_EO','es_ES','es_LA','et_EE','eu_ES','fa_IR','fb_LT','fi_FI','fo_FO','fr_CA','fr_FR','fy_NL','ga_IE','gl_ES','he_IL','hi_IN','hr_HR','hu_HU','hy_AM','id_ID','is_IS','it_IT','ja_JP','ka_GE','km_KH','ko_KR','ku_TR','la_VA','lt_LT','lv_LV','mk_MK','ml_IN','ms_MY','nb_NO','ne_NP','nl_NL','nn_NO','pa_IN','pl_PL','ps_AF','pt_BR','pt_PT','ro_RO','ru_RU','sk_SK','sl_SI','sq_AL','sr_RS','sv_SE','sw_KE','ta_IN','te_IN','th_TH','tl_PH','tr_TR','uk_UA','vi_VN','zh_CN','zh_HK','zh_TW'];

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

$.__HTML_ESC = {"nbsp":" ","iexcl":"¡","cent":"¢","pound":"£","curren":"¤","yen":"¥","brvbar":"¦","sect":"§","uml":"¨","copy":"©","ordf":"ª","laquo":"«","not":"¬","reg":"®","macr":"¯","deg":"°","plusmn":"±","sup2":"²","sup3":"³","acute":"´","micro":"µ","para":"¶","middot":"·","cedil":"¸","sup1":"¹","ordm":"º","raquo":"»","frac14":"¼","frac12":"½","frac34":"¾","iquest":"¿","Agrave":"À","Aacute":"Á","Acirc":"Â","Atilde":"Ã","Auml":"Ä","Aring":"Å","AElig":"Æ","Ccedil":"Ç","Egrave":"È","Eacute":"É","Ecirc":"Ê","Euml":"Ë","Igrave":"Ì","Iacute":"Í","Icirc":"Î","Iuml":"Ï","ETH":"Ð","Ntilde":"Ñ","Ograve":"Ò","Oacute":"Ó","Ocirc":"Ô","Otilde":"Õ","Ouml":"Ö","times":"×","Oslash":"Ø","Ugrave":"Ù","Uacute":"Ú","Ucirc":"Û","Uuml":"Ü","Yacute":"Ý","THORN":"Þ","szlig":"ß","agrave":"à","aacute":"á","acirc":"â","atilde":"ã","auml":"ä","aring":"å","aelig":"æ","ccedil":"ç","egrave":"è","eacute":"é","ecirc":"ê","euml":"ë","igrave":"ì","iacute":"í","icirc":"î","iuml":"ï","eth":"ð","ntilde":"ñ","ograve":"ò","oacute":"ó","ocirc":"ô","otilde":"õ","ouml":"ö","divide":"÷","oslash":"ø","ugrave":"ù","uacute":"ú","ucirc":"û","uuml":"ü","yacute":"ý","thorn":"þ","yuml":"ÿ","fnof":"ƒ","Alpha":"Α","Beta":"Β","Gamma":"Γ","Delta":"Δ","Epsilon":"Ε","Zeta":"Ζ","Eta":"Η","Theta":"Θ","Iota":"Ι","Kappa":"Κ","Lambda":"Λ","Mu":"Μ","Nu":"Ν","Xi":"Ξ","Omicron":"Ο","Pi":"Π","Rho":"Ρ","Sigma":"Σ","Tau":"Τ","Upsilon":"Υ","Phi":"Φ","Chi":"Χ","Psi":"Ψ","Omega":"Ω","alpha":"α","beta":"β","gamma":"γ","delta":"δ","epsilon":"ε","zeta":"ζ","eta":"η","theta":"θ","iota":"ι","kappa":"κ","lambda":"λ","mu":"μ","nu":"ν","xi":"ξ","omicron":"ο","pi":"π","rho":"ρ","sigmaf":"ς","sigma":"σ","tau":"τ","upsilon":"υ","phi":"φ","chi":"χ","psi":"ψ","omega":"ω","thetasym":"ϑ","upsih":"ϒ","piv":"ϖ","bull":"•","hellip":"…","prime":"′","Prime":"″","oline":"‾","frasl":"⁄","weierp":"℘","image":"ℑ","real":"ℜ","trade":"™","alefsym":"ℵ","larr":"←","uarr":"↑","rarr":"→","darr":"↓","harr":"↔","crarr":"↵","lArr":"⇐","uArr":"⇑","rArr":"⇒","dArr":"⇓","hArr":"⇔","forall":"∀","part":"∂","exist":"∃","empty":"∅","nabla":"∇","isin":"∈","notin":"∉","ni":"∋","prod":"∏","sum":"∑","minus":"−","lowast":"∗","radic":"√","prop":"∝","infin":"∞","ang":"∠","and":"∧","or":"∨","cap":"∩","cup":"∪","int":"∫","there4":"∴","sim":"∼","cong":"≅","asymp":"≈","ne":"≠","equiv":"≡","le":"≤","ge":"≥","sub":"⊂","sup":"⊃","nsub":"⊄","sube":"⊆","supe":"⊇","oplus":"⊕","otimes":"⊗","perp":"⊥","sdot":"⋅","lceil":"⌈","rceil":"⌉","lfloor":"⌊","rfloor":"⌋","lang":"〈","rang":"〉","loz":"◊","spades":"♠","clubs":"♣","hearts":"♥","diams":"♦","quot":'"',"amp":"&","lt":"<","gt":">","OElig":"Œ","oelig":"œ","Scaron":"Š","scaron":"š","Yuml":"Ÿ","circ":"ˆ","tilde":"˜","ndash":"–","mdash":"—","lsquo":"‘","rsquo":"’","sbquo":"‚","ldquo":"“","rdquo":"”","bdquo":"„","dagger":"†","Dagger":"‡","permil":"‰","lsaquo":"‹","rsaquo":"›","euro":"€"};

IE_RESERVED_ATTRS = ["type","method"];

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
$.isGenerator = function(fn){return fn&&fn.constructor&&fn.constructor.name==='GeneratorFunction'};
$.keys=function(obj){
	var s = [];if($.isObject(obj))for(var k in obj){s.push(k);}return s;
};
$.values=function(obj){
	var s = [];for(var k in obj){s.push(obj[k]);}return s;
};
$.unique=function(arr){
	var a = [];for(var i in arr){if(!$.isFunc(arr[i])&&a.indexOf(arr[i])<0)a.push(arr[i]);} return a;
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
 * @example:
 * var c = $.sync(function*(){
 * 	var a = yield (()=>{setTimeout(()=>{console.log("aaaa");return 1},2000)})(),
 *  console.log("a finished",a);
 *  var b = yield (()=>{setTimeout(()=>{console.log("aaaa");return 1},2000)})(),
 *  console.log("b finished",b);
 *  return 3;
 * })
 * console.log("c=",c);
 */
$.sync = function(g){
    var it = g(), ret;
    (function iterate(val){// asynchronously iterate over generator
        ret = it.next(val);
        if (!ret.done) {
            // poor man's "is it a promise?" test
            if (typeof(ret.value) === 'object' && "then" in ret.value) {// wait on the promise
                ret.value.then( iterate );
            }else {// immediate value: just send right back in
                setTimeout( function(){// avoid synchronous recursion
                    iterate( ret.value );
                }, 0 );
            }
        }
    })();
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

$.send = function(target,msg,data){
	if(!$.isString(msg))return;
	var fo = 'on'+msg.split(/[\-_]+/g).map(e=>e.ucfirst()).join('');
	fn = $.isFunc(target[fo])? fo : ($.isFunc(target.onMessage)?'onMessage':false);
	console.log("Fire:"+(target.name||'??'),fo,fn);
	if(target && fn){
		var func = target[fn];
		var args = Array.from(arguments);
		console.log(args);
		args = fn=='onMessage'?args.slice(1):args.slice(2);
		//func.call(target,msg,data);
		return func.apply(target,args);
	}
	return false;
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
	if(typeof(o)==="object" || $.isArray(o))
		return JSON.parse(JSON.stringify(o));
	else if($.isArray(o)){
		return o.slice(0)
	} 
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

/**
 * kanji num => 0-9 form number
 *  s = "五万九千八百零一"
    s = "五百四十一万九千八百三十一"
    s = "伍陌萬弐陌卌壱"
*/
$.text2num = function(s){
    var v = 0,n = 0;
    var nmap = {'一':1,'壱':1,'壹':1,'弌':2,'二':2,'弐':2,'貳':2,'貮':2,'贰':2,'三':3,'参':3,'參':3,'弎':3,'叁':3,'叄':3,'四':4,'肆':4,'五':5,'伍':5,'六':6,'陸':6,'陸':6,'七':7,'漆':7,'柒':7,'八':8,'捌':8,'九':9,'玖':9}
    var bmap = {'十':10,'拾':10,'廿':20,'卄':20,'卅':30,'丗':30,'卌':40,'百':100,'陌':100,'千':1000,'阡':1000,'仟':1000}
    var b4map = {'万':10000,'萬':10000,'億':100000000,'兆':1000000000000}
    s = s.replace(/[０-９]/g, function(s) { //０−９ => 0-9
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    var ns = "";
    for(var x=0,c;c=s.charAt(x);x++){
        if(c.match(/[0-9]/)){
            ns+=c;
            n = parseInt(ns);
        }else if(c in nmap){
            n=nmap[c];
        }else if(c in bmap){
            v+=n*bmap[c];
            n=0;
            ns="";
        }else if(c in b4map){
            if(n>0)v+=n;
            v*=b4map[c];
            n=0;
            ns="";
        }
    }
    if(n>0)v+=n;
    // console.log(v)
    return v;
}

/**
 * include js files
 * @example:
 * 	$.include('test_view', callback, 'param1', 'param2')
 *  when its loaded: callback('param1','param2') will be executed.
 */
$.include = function(src, callback){
	if(src.indexOf(".js")<0)
		src+=".js";
	if(src.charAt(0)!='/' && !src.match(/^https*:\//))
		src = $conf.liber_path+src;
	var jsId = src.split("/");
	jsId = jsId[jsId.length-1].replace(/\./g,"_");
	var time = new Date().getTime();
	var cb = callback?($.isString(callback)?window[callback]:callback):null;
	var args = [];//user parameters
	for(let i=2;i<arguments.length;i++)
		args.push(arguments[i]);
	var se = $(`script#${jsId}`,true);
	var included = function(e){
		if(!$app.__included)
			$app.__included = [];
		var t=e.target||e.srcElement;
		if(t.readyState == "loading")
			return;
		if(e.type=="error"){
			if($app.onError)$app.onError("app_include_error",t.src);
			throw new Error("ERROR : Failed to load "+t.src);
		}
		t.onload = t.onreadystatechange = null;
		$app.__included.push(t.id);
		if(cb){cb.apply(window,args)}
	};
	if(!se||!se.length){
		se = document.createElement("script");
		se.id= jsId;
		se.type = "text/javascript";
		se.onload = se.onreadystatechange = included;
		se.onerror = included;
		var head = document.head?document.head: document.getElementsByTagName('head')[0];
		se.src = $conf.mode=='Developing'?src+"?v="+time : src+"?v="+($conf.app_ver||'');
		head.appendChild(se)
	}else{
		se = se[0];
		if(se.readyState=='loading'){
			se.onload = se.onreadystatechange = included;
		}else
			included({target:se,type:'loaded'});
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

$.hover = function(el,in_func,out_func){
	if(!in_func)return;
	el.bind('mouseover',function(e) {
		console.log("in",new Date().getTime())
		in_func.call(e.target,e);
	});
	el.bind('mouseover',function(e) {
		console.log("out",new Date().getTime())
		if(!out_func)return;
		var pt = $.cursor(e);
		var rect = $.rect(this);
		if(!$.inRect(pt,rect)){
			out_func.call(e.target,e);
		}	
	});
}
$.insertChar = function(ipt,char){
	if (ipt.selectionStart || ipt.selectionStart == '0') {
		var startPos = ipt.selectionStart;
		var endPos = ipt.selectionEnd;
		ipt.value = ipt.value.substring(0, startPos)
			+ char
			+ ipt.value.substring(endPos, ipt.value.length);
		ipt.selectionStart = startPos+char.length;
		ipt.selectionEnd = endPos+char.length;
	} else {
		ipt.value += char;
	}
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
 * @param r1 : rect1
 * @param r2 : rect2
 */
$.overlay = function(r1, r2){
	if(!r1||!r2)return false;
	if($.isElement(r1)&&$.isElement(r2))
		return $.overlay($.rect(r1),$.rect(r2))
	var l1 = r1.left, l2 = r2.left,
		t1 = r1.top, t2 = r2.top,
		b1 = t1+r1.height, b2 = t2+r2.height,
		rt1 = l1+r1.width, rt2 = l2+r2.width;
	return !(rt1 < l2 || l1 > rt2 || b1 < t2 || t1 > b2);
}

/**
 * show file/image upload window
 * example:
 * */
$.uploadWindow = function(callback,multiple,types,withsize){
	var fname = "__tmpFileForm";
	//, iname="__tmpFileBtn";
	// var imgform = $id(fname,true);
	// if(imgform==undefined){
	$.remove($id(fname,true))
	var imgform = $form({id:fname, enctype:"multipart/form-data" }, document.body).css({border:'0px',height:'0px',width:'0px',display:"none"});
	var params = {type:"file", name:"tempfile"};
	if(multiple) params["multiple"] = "multiple";
	if(types) params.accept = types;
	var ipt = $input(params,imgform);
	ipt.bind("change",function(e){
		if(!this.value)return;
		var ext = this.value.match(/\.([^\.]+)$/)[1]||'';
		ext = ext.toLowerCase();
		if(["jpg","png","gif","bmp", "jpeg"].indexOf(ext)>=0){
			$.imagesData(this.files, function(fs){
				if(callback) callback(fs);
				$.remove($id(fname,true))
			},withsize)
		}
	});
	ipt.fire("click");
	return imgform;
}

/**
 * local files to Base64 src data list
 * @param {*} fs : local File list
 * @param {*} cb : callback func
 */
$.imagesData = function(fs, cb, withsize){
	var len = fs.length, files = [];
	//TODO filter images
	// if(["jpg","png","gif","bmp", "jpeg"].indexOf(ext)>=0){
	for(var i=0,f; f=fs[i++]; i){
		var reader = new FileReader();
		reader.file = f;
		reader.onload = function (e2) {
			var src = e2.target.result;
			if(withsize){
				var file = this.file;
				var im = new Image();
				im.onload = function(e3){
					files.push({file:file,src:src,width:this.width,height:this.height,size:file.size,type:file.type});
					if(files.length>=len){
						cb(files);
					}
				}
				im.src = src;
			}else{
				files.push({file:this.file,src:src});
				if(files.length>=len){
					cb(files);
				}
			}
		};
		reader.readAsDataURL(f);	
	}
}

/**
 * update all elements with the same classname
 * with the specified value under `dom`
 */
$.updateChain = function(cls,v,dom){
	if(!cls||!v)return;
	var ipt = this;//the original input item
	dom = dom||($this?$this.layer:document.body);
	dom.find(`.${cls}`,(el,i)=>{
		if(['INPUT','TEXTAREA','SELECT'].indexOf(el.tagName)>=0){
			el.value = v;
		}else if(el.chain && $.isString(el.chain)){
			if(el.chain.startsWith('style.')){
				var c = el.chain.replace('style.','');
				if(el.style.hasOwnProperty(c))
					el.style[c] = c=='backgroundImage'?`url(${v})`: v;
			}else el[el.chain]=v;
		}else if(el.chain && $.isFunc(el.chain)){
			el.chain.call(el,v,i,ipt);
		}else
			el.innerHTML = (v+"").split('\n').join('<BR>');
	});
}
$.md5 = function(str) {
	if(!str)return '';
	var xl;
	var rotateLeft = function(lValue, iShiftBits) {
		return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
	};

	var addUnsigned = function(lX, lY) {
		var lX4, lY4, lX8, lY8, lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
	};

	var _F = function(x, y, z) {
		return (x & y) | ((~x) & z);
	};
	var _G = function(x, y, z) {
		return (x & z) | (y & (~z));
	};
	var _H = function(x, y, z) {
		return (x ^ y ^ z);
	};
	var _I = function(x, y, z) {
		return (y ^ (x | (~z)));
	};

	var _FF = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};

	var _GG = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};

	var _HH = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};

	var _II = function(a, b, c, d, x, s, ac) {
		a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
		return addUnsigned(rotateLeft(a, s), b);
	};

	var convertToWordArray = function(str) {
		var lWordCount;
		var lMessageLength = str.length;
		var lNumberOfWords_temp1 = lMessageLength + 8;
		var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
		var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
		var lWordArray = new Array(lNumberOfWords - 1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while (lByteCount < lMessageLength) {
			lWordCount = (lByteCount - (lByteCount % 4)) / 4;
			lBytePosition = (lByteCount % 4) * 8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (str
					.charCodeAt(lByteCount) << lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount - (lByteCount % 4)) / 4;
		lBytePosition = (lByteCount % 4) * 8;
		lWordArray[lWordCount] = lWordArray[lWordCount]
				| (0x80 << lBytePosition);
		lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
		lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
		return lWordArray;
	};

	var wordToHex = function(lValue) {
		var wordToHexValue = "", wordToHexValue_temp = "", lByte, lCount;
		for (lCount = 0; lCount <= 3; lCount++) {
			lByte = (lValue >>> (lCount * 8)) & 255;
			wordToHexValue_temp = "0" + lByte.toString(16);
			wordToHexValue = wordToHexValue
					+ wordToHexValue_temp.substr(
							wordToHexValue_temp.length - 2, 2);
		}
		return wordToHexValue;
	};

	var x = [], k, AA, BB, CC, DD, a, b, c, d, S11 = 7, S12 = 12, S13 = 17, S14 = 22, S21 = 5, S22 = 9, S23 = 14, S24 = 20, S31 = 4, S32 = 11, S33 = 16, S34 = 23, S41 = 6, S42 = 10, S43 = 15, S44 = 21;

	str = str.utf8_encode();
	x = convertToWordArray(str);
	a = 0x67452301;
	b = 0xEFCDAB89;
	c = 0x98BADCFE;
	d = 0x10325476;

	xl = x.length;
	for (k = 0; k < xl; k += 16) {
		AA = a;
		BB = b;
		CC = c;
		DD = d;
		a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
		d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
		c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
		b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
		a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
		d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
		c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
		b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
		a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
		d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
		c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
		b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
		a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
		d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
		c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
		b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
		a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
		d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
		c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
		b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
		a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
		d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
		c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
		b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
		a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
		d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
		c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
		b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
		a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
		d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
		c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
		b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
		a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
		d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
		c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
		b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
		a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
		d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
		c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
		b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
		a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
		d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
		c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
		b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
		a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
		d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
		c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
		b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
		a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
		d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
		c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
		b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
		a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
		d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
		c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
		b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
		a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
		d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
		c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
		b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
		a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
		d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
		c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
		b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
		a = addUnsigned(a, AA);
		b = addUnsigned(b, BB);
		c = addUnsigned(c, CC);
		d = addUnsigned(d, DD);
	}

	var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

	return temp.toLowerCase();
};

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
	hashData : null,//data for view transition
	start : function(start_view){
		if($app.status=="stopped")
			throw new Error("This app has been stopped for some reason.");
		var ps = window.location.href.split("#");
		$app.page_prefix = new Date().getTime()+"_";//for localStorage conflict
		$app.start_view = ps[1]||($.isString(start_view)?start_view:$conf.default_view);
		if(!$app.start_view){
			if($app.onError)$app.onError("no_start_view_error");
			throw new Error("No start view");
		}
		$conf.modules=$conf.modules||[];
		$conf.view_path=$conf.view_path||'/js/views/';
		if(!window[$app.start_view])$conf.modules.push($conf.view_path+$app.start_view);
		$conf.liber_path=$conf.liber_path||'/js/';
		$app.legacy = $conf.modules.indexOf("liber.legacy")>=0;
		//preload
		var images = $conf.preload_images?$conf.preload_images:[];
		var load = $conf.modules.length+images.length, loaded=0;
		if(!load)
			return $app.preloaded();
		var step = function(){
			loaded++;
			var progress = parseInt(loaded*100/load);
			if($app.onLoadProgress)
				$app.onLoadProgress(progress);
			if(loaded>=load)
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
		$("body > main.layer", function(a){a.parentNode.removeChild(a);})
	},
	preloaded : function(){
		$app.onLoad=$app.onLoad||$app.onload;
		if($app.onLoad) $app.onLoad();
		else $app.loaded();
	},
	loaded : function(){
		$app.status = "loaded";
		$app.hash = window.location.hash;
		$app.views.push($app.start_view);
		$app.openView($app.start_view,{},true);
		//setInterval($app.onUrlChanged, 50);
		window.addEventListener('popstate',$app.onUrlChanged);
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
	onUrlChanged : function(e) {
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
					vname = vname.replace(/[@#]/,'');
					var data = $app.hashData || {};
					if(window[vname] && window[vname].drawContent){
						var chash = $app.hash?$app.hash.replace(/#/g,''):'';
						if($this&&$this.isPopup&&$this.opener&&$this.opener.name==chash){
							//window.history.forward();
							history.pushState({}, chash, location.href.replace(/#.*/,'')+"#"+chash);
							$app.closeView($this);
							// e.preventDefault();
							// e.stopPropagation();
							// return false;
						}else{
							$app.openView(hash,data,true);
						}
					}		
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
	 * @param  {[type]} !noTrans [whether appends anchor url (#name_of_the_view) to current one]
	 */
	openView : function(url, args, noTrans, included){
		if(!url)return;
		var vname = url.split("?")[0];
		if(vname.endsWith("@")) {
			noTrans = true;
			vname = vname.replace(/[#@]/,'');
		}
		if(!included&&!window[vname] && !$(`script#${vname.split('.').join('_')}`).length){
			var surf = $conf.mode=='Product'?'':"?ver="+(new Date().getTime());
			return $.include(($conf.view_path||'/js/')+vname+".js"+surf,$app.openView,url,args,noTrans,true)
		}
		if(!noTrans){
			//console.log("$app.openView:",url,"transition");
			var canTrans = ($this && $this.onTransition)?$this.onTransition.call($this,url,args,false):true;
			if(canTrans===false)return;
			$app.closeView($this);
			// if($app.views.last()!=vname)
			// 	$app.views.push(vname);	
			$app.hashData = args||{};
			history.pushState(args||{},T(vname), location.href.replace(/#.*/,'')+"#"+vname);
			// console.log("history",his)
		}
		// }else
		// 	delete $app["hashData"];
		$app.views.push(vname);	
		//console.log("$app.openView:",url,"popup");
		var params = $.extend(args||{} , $.unserialize(url)||{});
		
		$app.initView(vname, function(view){
			if(!noTrans)view.history_index = (noTrans)?-1:history.length-1;

			view.params = params;
			if(noTrans){
				view.opener = $this;
				view.isPopup = true;
				var oia = view.opener?view.opener.onInactive||$app.onInactive:null;
				if(view.opener && oia) 
					oia.call(view.opener,view);
			}
			$this = view;
			if(view.onload)view.onLoad = view.onload;
			if(view.onLoad)
				view.onLoad.call(view,params);
			else
				view.loaded.call(view);//$controller.loaded
		});
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
	openSubview : function(view_name, params, header, content, footer, included){
		var vname = view_name.replace(/[#@\?].*/,'');
		var v = window[vname];
		if(!included&&!v&&!$(`script#${vname.split('.').join('_')}`).length){
			var surf = $conf.mode=='Product'?'':"?ver="+(new Date().getTime());
			return $.include(($conf.view_path||'/js/')+vname+".js"+surf,$app.openSubview,view_name,params,header,content,footer,true);
		}
		if(!v)return;
		v.parentView = $this?$this.name:null;
		if(!v.close || !v.loaded){
			$.extend(v, $controller);
			if($.isString(v.extend) && $.isObject(window[v.extend])){
				$.extend(v, window[v.extend]);
			}
		}
		if(header){v.header=header}
		else if(header===false){v.noHeader=true;}
		if(content){content.innerHTML="";v.content=content;}
		if(footer){v.footer=footer;}
		else if(footer===false){v.noFooter=true;}
		//$this = v;
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
		view.history_index=-1;
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
		if(v.history_index>=0){
			if(history.length>v.history_index){
				history.go(v.history_index);
			}
			v.layer.css({display:"block",zIndex:100+($app.viewIdx++)});//.attr({idx:"layer_"+idx});
		}
		// var views = [];
		// for(var i=0;i<$app.views.length;i++)
		// 	if(v.name != $app.views[i]);
		// 		views.push($app.views[i]);
		// views.push(v.name);
		// $app.views = views;
		
	},
	hideOthers : function(view){
		for(var i=0;i<$app.views.length;i++){
			var v = window[$app.views[i]];
			if($app.views[i]!=view.name && v && v.layer)
				//console.log("hide:",v.layer);
				v.layer.hide();
		}
	},

	initView : function(view, callback){
		var vname = view;
		if($.isString(view)){
			view = window[vname];
		}
		if(!view){
			if($app.onError)$app.onError("view_not_exists_error", {name:vname});
			throw new Error("Error :no view("+vname+") to enhance");
		}
		if(view && (!view.close || !view.loaded)){
			view.name = view.name|| vname;
			view = $.extend(view, $controller);
			if($.isString(view.extend) && $.isObject(window[view.extend])){
				view = $.extend(view, window[view.extend]);
			}
			if(view.path){//preload parent views
				let ps = view.path.split('.'), loaded=0;
				var step = function(n){
					$app.initView(n);
					if(++loaded>=ps.length){
						if($.isFunc(callback))callback(view);
					}
				}
				for(let i=0,p;p=ps[i];i++){
					if(!window[p] && !$(`script#${p}`).length){
						$.include($conf.view_path+p+".js",step,p);
					}else step(p);
				}
			}else
				if($.isFunc(callback))callback(view);
		}else
			if($.isFunc(callback))callback(view);
	},

	callView : function(to_view,msg,data){
		$app.initView(function(to_view){
			if(to_view && $.isFunc(to_view.onMessage)){
				to_view.onMessage.call(to_view,msg,data);
			}
		});
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
		var func_v = "$"+($conf.view_tag||"article");
		var func_m = "$"+($conf.view_content_tag||"main");
		var layer = window[func_v]({idx:idx,"class":view.isPopup?"view "+view.name:"view "+view.name,view:view.name},document.body);
		view.layer = layer.css({
			width: "100%",height: "100%",zIndex:100+idx,position: "fixed",
			top:'0px',left:'0px',right:'0px',bottom:'0px',margin:'0px',border:'0px',padding:'0px',textAlign:"center"
		});

		view.header = view.noHeader?$header({}):$header({},layer);
		view.content = window[func_m]({},layer);
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
			if(this.drawHeader) 
				this.drawHeader.call(this,header,layer);
			else if($app.drawHeader)
				$app.drawHeader(header,layer);
		}

		if($app.drawContent)
			$app.drawContent(content, layer);

		if(this.drawContent)
			this.drawContent.call(this, content, layer);

		if(!this.noFooter && footer){
			if(this.drawFooter) 
				this.drawFooter.call(this,footer,layer);
			else if($app.drawFooter)
				$app.drawFooter(footer,layer);
		}
		// if(this.parentView){
		// 	$this = window[this.parentView];
		// }
		// this.parentView=null;
	},

	/**
	 * send a msg to view($controller) object
	 */
	call : function(to_view, msg, data){
		$app.callView(to_view,msg,data)
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
    formatString = formatString.replace("YYYY",YYYY).replace("YY",YY).replace("MMMM",MMMM).replace("MMM",MMM).replace("MM",MM).replace("M",M).replace("DDDD",DDDD).replace("DDD",DDD).replace("DD",DD).replace("D",D).replace("th",th).replace("W",W);

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
String.prototype.formatNumber = function(){
	var a = this;
	var a = a.replace(new RegExp("^(\\d{" + (a.length%3?a.length%3:0) + "})(\\d{3})", "g"), "$1 $2").replace(/(\d{3})+?/gi, "$1 ").trim();
    return a.replace(/\s/g,',');
}
String.prototype.toHex = function(){
	var str = [],len = this.length;
	for (var i=0; i < len; i += 1) {
	    var c = this.charCodeAt(i);
	    str.push(c.toString(16));
	}
	return str.join('');
};
String.prototype.fromHex = function(){
	var arr = [];
	for (var i = 0; i < this.length; i +=2) {
		arr.push(String.fromCharCode(parseInt(this.substr(i, 2), 16)));
	}
	return arr.join('');
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
String.prototype.halfWidth=function(){
	return this.replace(/[\uff01-\uff5e]/g,function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xfee0); });
}

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(prefix) { return this.slice(0, prefix.length) == prefix; };
} 
if (typeof String.prototype.endsWith != 'function') {
	String.prototype.endsWith = function(suffix) { return this.slice(-suffix.length) == suffix; };
}

String.prototype.validate = function(type){ 
	var val;
	if(type.indexOf(":")) {
		var parts = type.split(":");
		type = parts[0]; val = parts[1];
		if (parts[2]) var val2 = parts[2];
	}
	switch(type){
		case "is-same":
			var e1=$('input[name="'+val+'"]'),e2=$('input[name="'+val2+'"]');
			return e1&&e2&&e1.length>0&&e2.length>0&&e1[0].value === e2[0].value;
		case "kanji":
			return this.match(/^[一-龯]+$/);
		case "katakana":
			return this.match(/^[ァ-ヺ\s　ー]*$/);
		case "hirakana":
			return this.match(/^[ぁ-ん\s　]*$/);
		case "number":
			return this.match(/^[\d\.]+$/);
		case "email":
			return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(.+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this);
		case "phone-jp":
    		return /^\d{2,4}[\-ー−]*\d{3,4}[\-ー−]*\d{3,4}$/.test(this);
		case "zipcode-jp":
    		return /^\d{3}[\-ー−]*\d{4}$/.test(this);
    	case "url":
    		return /^\//.test(this) || /^((http|https|ftp)\:\/\/)*([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|xyz|link|[a-zA-Z]{2,6}))(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\?\'\\\+&;%\$#\=~_\-@:+!\(\)]+))*$/.test(this);
    	case "len":
    		var min = parseInt(parts[1]);
			var max = parts.length>=3 ? parseInt(parts[2]):Number.MAX_SAFE_INTEGER;
			return this.length>=min && this.length<=max;
		case "Ymd":
    		return /[12]\d{3}[\-ー年\.−]*\d{1,2}[\-ー月\.−]*\d{1,2}/.test(this);
		case "Ym":
    		return /[12]\d{3}[\-ー年\.−]*\d{1,2}/.test(this);
		case "Ymdhi":
    		return /[12]\d{3}[\-ー年\.−]*\d{1,2}[\-ー月\.−]*\d{1,2}\s+(午前|午後|am|pm)*\d{1,2}[時:]\d{1,2}/.test(this);
		case "hi":
			return /^(午前|午後|am|pm)*\d{1,2}[時:]\d{1,2}/.test(this);
		case "name":
			return this.match(/^([\u00c0-\u01ffa-zA-Z'\-ァ-ヺー・ぁ-ん一-龯\u4e00-\u9a05])+([\s　]*[\u00c0-\u01ffa-zA-Z'-ァ-ヺー・ぁ-ん一-龯\u4e00-\u9a05]+)*/i);
		case "line"	://line id
			return this.match(/^([.\-_0-9a-z]+)$/i);
		case "age"	://
			return this.match(/^[0-9一二三四五六七八九十百零\s　]+(years\b|yrs*\b|歳|才|岁)*$/);
		case "price"://
			return this.match(/^([0-9\.一壱壹弌二弐貳貮贰三参參弎叁叄四肆五伍六陸陸七漆柒八捌九玖拾廿卄卅丗卌百十陌千阡仟萬億兆零\s　]+(.*(ドル|ヲン|ユーロ|€|＄|£|㌦|㍀|\$|¥|￥)|.*[円元鎊株币圓角块塊分刀毛]|yen|jpy|usd|cny|fr|eur|bgp|\bb\b|\bm\b|\bk\b|billiions*|millions*|hundreds*|thousands*)*)+$/i);
		case "az09"://
			return this.match(/^([0-9a-z]+)$/);
 	}
	return true;
};
String.prototype.utf8_encode = function() {
	var string = this;
	var utftext = '', start, end, stringl = 0;

	start = end = 0;
	stringl = string.length;
	for ( var n = 0; n < stringl; n++) {
		var c1 = string.charCodeAt(n);
		var enc = null;

		if (c1 < 128) {
			end++;
		} else if (c1 > 127 && c1 < 2048) {
			enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
		} else {
			enc = String.fromCharCode((c1 >> 12) | 224,
					((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
		}
		if (enc !== null) {
			if (end > start) {
				utftext += string.slice(start, end);
			}
			utftext += enc;
			start = end = n + 1;
		}
	}

	if (end > start) {
		utftext += string.slice(start, stringl);
	}

	return utftext;
};

Array.prototype.last = function(){
    return this.length>1?this[this.length - 1]:null;
};

NodeList.prototype.each = function(func){
	if(func && $.isFunc(func)) for(var i=0;i<this.length;i++)
		func.call(this,this[i],i);
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
NodeList.prototype.remove = function(k,v){return this.callfunc("remove");};
NodeList.prototype.bind = function(k,v){return this.callfunc("bind",k,v);};
//NodeList.prototype.unbind = function(k){return this.callfunc("unbind",k);};
NodeList.prototype.hide = function(k){return this.callfunc("hide",k);};
NodeList.prototype.show = function(k){return this.callfunc("show",k);};
NodeList.prototype.addClass = function(v){return this.callfunc("addClass",v);};
NodeList.prototype.removeClass = function(v){return this.callfunc("removeClass",v);};
NodeList.prototype.animate = function(o){return this.callfunc("animate",o);};
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
		var cn = this.isSvg()? (this.getAttribute("class")||""):this.className;
		cn = cn.split(/\s+/g).filter(c=>c!=cls);
		cn.push(cls);
		if(this.isSvg())
			this.setAttribute("class",cn.join(' '));
		else
			this.className=cn.join(' ');
		return this;
	},
	
	removeClass : function(cls) {
		if(!cls)return this;
		cls = cls.trim();
		var iS = this.isSvg();
		var cn = iS?this.getAttribute("class"):this.className;
		cn = cn.split(/\s+/g).filter(c=>c!=cls);
		cn = cn.join(' ');
		if(iS)
			this.setAttribute('class',cn);
		else 
			this.className = cn;
	    return this;
	},

	hasClass : function(cls){
		var iS = this.isSvg();
		var cn = (iS?this.getAttribute("class"):this.className)||'';
		return cn.split(/\s+/g).filter(c=>c==cls).length>0;
	},
	
	css : function(arg1,arg2){
		if(typeof(arg1)=="string"){
			if(arg2!==undefined){
				if(arg1.indexOf("background")>=0 && arg2.indexOf("url(")>=0 && $conf.image_path && arg2.indexOf("data:image")<0 && arg2.indexOf("http")<0&& !arg2.match(/^url\(\//)){
					arg2 = arg2.replace("url(", "url("+$conf.image_path);
				}
                if ($browser.name == "Firefox")
                    this.style.setProperty(arg1.replace(/[A-Z]/g,function(v){return "-"+v.toLowerCase();}), arg2);
                else
                    this.style[arg1] = arg2;
				return this;
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

			if(arg1=="url" && typeof(arg2)=="string" && ["INPUT","SELECT","TEXTAREA"].indexOf(this.tagName)<0)
				this.bind("click", $app.trans);
			
			if(arg2!=undefined){//set
				var vv;
				if(this.tagName.toUpperCase() == "IMG" && arg1.toLowerCase()=="src"){
					vv = $conf.image_path && arg2.indexOf("data:image")<0 && arg2.indexOf("http")!=0? $conf.image_path+arg2:arg2;
				}else{
					vv = arg2;
				}
				//if($browser.name=="msie" && (IE_RESERVED_ATTRS.indexOf(arg1)>=0||(this.hasOwnProperty&&this.hasOwnProperty(arg1)))){
				if($browser.name=="msie" && IE_RESERVED_ATTRS.indexOf(arg1)>=0){
					this.setAttribute(arg1, vv);
				}else
					this[arg1] = ['innerHTML','textContent'].indexOf(arg1)>=0&&`${vv}`.charAt(0)=='@'?(vv.charAt(1)=='.'?T(this.tagName.toLowerCase()+vv.substring(1)):T(vv)): vv;
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

	find : function(q,f){
		if(!q)return false;
		q = q.replace(/\?.*/g,'');
		var qs=q.split(/\s+/),qu=qs[qs.length-1];
		var r=this.querySelectorAll(q);
		if($.isFunc(f)) for(var i=0,el;el=r[i];i++) f(el,i);
		return qu.indexOf("#")==0?r[0]:r;
	},
	
	find1st : function(q){var qs=q.split(" "),qu=qs[qs.length-1];var r=this.querySelectorAll(q);return r?r[0]:null;},

	/**
	 * find text node only with specified "text",
	 * @param text : [Optional] null means all nodes text node that .nodeValue.trim().length>1
	 * 			   : someTextValue means query condition
 	 * @param excludeTags : [optional] exclude these tagnames of lowercase
	 * @example : dom.findByText : (null, ["option","body"])
	 * @example : dom.findByText : ("mytext")
	 */
	findByText : function(text, excludeTags){
		var filter = {
			acceptNode: function(node){
				if(node.nodeType === document.TEXT_NODE && 
					(text&&node.nodeValue.includes(text)||!text&&node.nodeValue.trim().length>0)){
					return NodeFilter.FILTER_ACCEPT;
				}
				return NodeFilter.FILTER_REJECT;
			}
		}
		var nodes = [];
		var walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT, filter, false);
		while(walker.nextNode()){
			var n = walker.currentNode.parentNode;
			if(!excludeTags || (excludeTags&&excludeTags.indexOf(n.nodeName.toLowerCase())<0))
				nodes.push(n);
		}
		return nodes;
	},

	/**
	 * return depth level of a dom element
	 * @param child : eturns depth of this element.
	 */
	depth : function(){
		var i = 0,
			child = this;
		while (child = child.parentNode)
			i++;
		return i;
	},

	bind : function(arg1, arg2){
		if(typeof(arg1)=="string"){
			if(arg2){
				if(arg1.match(/\s+/)){
					let es = arg1.split(/\s+/);
					var el = this;
					es.forEach(e=>el.bind(e, arg2))
				}else{
					arg1 = arg1.replace(/^on/,'');
					if(!$browser.mobile && arg1.indexOf("touch")==0) 
						arg1 = {"touchstart":"click","touchmove":"mousemove","touchend":"mouseup"}[arg1];
						this.addEventListener(arg1, arg2, false);
				}
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

	onKeyup : function(code, cb){
		if(!cb||(this.tagName!='INPUT'&&this.tagName!='TEXTAREA'))return this;
		return this.bind('keydown',function(e){
			var c = e.which || e.keyCode;
			if(code)
            	if(c==code) e.preventDefault();
            if(c==27) {//esc, cancel
                this.blur();
            }
			if(c==229) this.attr("ja",1);
			else this.removeAttribute("ja");
			if(c==18)this.attr('alt',1);
        })
        .bind('keyup',function(e){
            var c = e.which || e.keyCode;
			var ja = this.attr("ja")==1;
			if(ja&&c==32){
                e.preventDefault();
            }
			if(!ja && ((code&&c==code&&cb) || !code)){
				cb.call(this,e);
			}	
		})
	},

	onEnterKey : function(cb){
		return this.onKeyup(13,cb);
	},

	/**
	 * link a form item to another element.property
	 * @param {Element} tar : target element
	 * @param {string|function} att : target attr name string or callback function
	 */
	sync : function(tar,att){
		if(tar && att && $.isElement(tar) && ['INPUT','TEXTAREA','SELECT','DATALIST'].indexOf(this.tagName)>=0){
			this.addEventListener('change',function(e){
				var v = this.value;
				if(this.tagName=='INPUT' && (this.type=='checkbox'||this.type=='radio')){
					var vs = document.body.find(`input[name='${this.name}']:checked`);
					v = vs.join(',');
				}
				if($.isFunc){
					att.call(tar,v);
				}else
					tar.attr(att,v);
			});
		}
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
		// var disp = window.getComputedStyle(this).getPropertyValue("display");
		// console.log("HIDE", disp, this);
		// if(disp=='none')return;
		// if(!this.attr('__orgDisplay'))
		// 	this.attr('__orgDisplay',disp);
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
		// if(!this.attr("__orgDisplay"))
		// 	this.attr('__orgDisplay', window.getComputedStyle(this).getPropertyValue("display"));
		// var disp = this.attr("__orgDisplay")!='none'?(this.attr("__orgDisplay")||"block"):"block";
		if(time>0){
			this.css({"opacity":0}).animate({duration:time,style:"easeOut",step:function(el,delta){
				el.style.opacity=delta;
			}});
			this.style.removeProperty("display");
		}else{
			this.style.removeProperty("display");
		}
		// setTimeout(function(){this.style.removeProperty('display')},time+100);
		return this;
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
	fire : function(eventName, option){
		var opt = $.extend(option||{}, $.__eventOpts),
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
	args = args||{};
	var clss, ids;
	if(type && $.isString(type)){
		clss = type.match(/\.([a-z0-9\-_]+)/gi);
		if(clss&&clss.length) clss=clss.map(function(e){return e.replace('.','')}).join(' ');
		ids = type.match(/#([a-z0-9\-_]+)/i);
		if(ids&&ids.length)ids=ids[0].replace('#','');
		type = type.split(/[#\.]+/)[0];
	}
	var _el = $.isString(type)? (namespace? document.createElementNS(namespace,type):document.createElement(type)) : ($.isElement(type)?type:null);
	if(!_el) throw new Error("ERROR : $e wrong parameters ");
	if(clss)_el.className=clss;
	if(ids)_el.id=ids;
	if($.isString(target))
		target = document.getElementById(target);
	if(args){
		if($.isString(args)){
			switch(type){
				case "img" : _el.src = $conf.image_path && args.indexOf("data:image")<0 && args.indexOf("http")<0 && !args.match(/^url\(\//)? $conf.image_path+args:args;
					break;
				case "a" : _el.href = args;
					break;
				default :
					var lb = `${args}`.charAt(0)=='@'?(args.charAt(1)=='.'?T(_el.tagName.toLowerCase()+args.substring(1)):T(args.substring(1))): args;
					if(lb.match(/<.*?>/))
						_el.innerHTML = lb;
					else{
						//_el.textContent = args;
						_el.appendChild(document.createTextNode(lb));
					}
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
NOT IN USE (uncommon) : ,"dialog","bdi","command","menu","track","wbr"
NOT IN USE (Others) : "object"-"param","noscript",

NOT IN USE (Duplicated) : "del" -> "s", "blockquote" -> "q", "ins" -> "u"

Override : "select"(with TODO:"optgroup","option") -> use $select() instead
Override : "style" -> use $styles(rules, target) instead

TODO datalist -> for safari

TODO : "keygen" for IE //http://www.w3schools.com/tags/tag_keygen.asp
TODO : "meter" for IE //http://www.w3schools.com/tags/tag_meter.asp
TODO : "output" for IE http://www.w3schools.com/tags/tag_output.asp TODO input-range, input-number;

Layout example :
<artile>
	<header> 	: header
	<nav>		: navigator
	<aside>		: sidemenu
		<details>		: sidemenu group item
			<summary> 	: sidemenu group title
			<p>			: sidemenu items under group
			<p>
	<main>			: main content
		<section>	: content
		<section>	: content
		...
	<footer>	:


*/
var __tags = [ 
 //Struct Common
 "div","p","span","br","hr",
 "ul","ol","li","dl","dt","dd",
 "main","article","section","aside","footer","header","nav",	//HTML5,main:IE>12
 
 //Table
 "table","caption","tbody","thead","tfoot","colgroup","col","tr","td","th",
 
 //Form
 "form","fieldset","legend","input","label","textarea","select","option",

 //Markup
 "b","h1","h2","h3","h4","h5","h6","cite","pre",
 "s","u","i","mark","q","small","sub","sup","abbr","bdo","ruby",
 "time","rp","rt",	//HTML5
 
 //Phrase - Maybe will be deprecated in the future
 "em","dfn","code","samp","strong","kbd","var",
 
 //Struct Image
 "map","area","figure","figcaption",
 
 //Resources, Objects, Tools
 "a","img","button",
 "progress",
 "address","base",
 "canvas","embed","audio","video","source","progress", //HTML5
 //uncommon tags,IE not supported
"details","summary",/* details > summary + p + p */
"meter",/* ie>13 similar with progress*/


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
 *			valueType : number(default)|text, if options[i] is string, use number idx or text as value
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
		var v = $.isObject(o)?o.value:('text'==attrs.valueType?o:i+1);
		if(drawFunc) drawFunc(lb,i);
		else{
			lb.attr({html:$.isObject(o)?o.label:o,class:o.class||''}).css({position:"relative","text-align":"left"});
			if(values.indexOf(v+"")>=0) lb.addClass('on');
			if(attrs.columns)lb.css({width:100/parseInt(attrs.columns)+"%"});
			$input({type:attrs.type, name:attrs.name, value:v, checked:values.indexOf(v+"")>=0?true:false},lb).css({display:"block",position:"absolute",left:0,top:"50%",transform:"translateY(-50%)"});
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
	var ats = {};
	for(var k in attrs)
		if(!$.isFunc(attrs[k])&&!$.isObject(attrs[k])&&!$.isArray(attrs[k]))
			ats[k] = attrs[k]
	var s = $e("select",ats,target);
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

/**
 * k > multi-lang text
 */
var T = function (key) {
	$.la = $.la || 0;
	var k = key.charAt(0)=='@'?key.substring(1):key;
    var t = TEXTS&&TEXTS[k]?(TEXTS[k][$.la]||TEXTS[k][0]):false;
	if(t && t.indexOf('%s')>=0){
		for(let i=1;i<arguments.length;i++){
			t = t.replace('%s', arguments[i]);
		}
	}
	return t||key;
}


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
	 * 	   .content_type : "Content-Type":"application/json"
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
		 	callback = opts.callback||null,
			content_type = opts.content_type||"text/plain;charset=UTF-8",
			auth = opts.authorization||false;

		var ks = Object.keys(params);
		for(var i=0,k;k=ks[i++];){
			if(params[k]===undefined)
				delete(params[k]);
		}
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
		var data = method == "UPLOAD"?new FormData():[];//GET does not support formdata
  		if(params){
			if(content_type.match(/application\/json/) && ($.isArray(params)||$.isObject(params)))
				data = JSON.stringify(params);
			else{
				for (var key in params){
					var v = params[key];
					var vs = $.isArray(v)?v:[v];
					var isf = false;
					for(var i=0,vi;vi=vs[i++];){
						if((method == "UPLOAD")&&$.isFile(vi)){
							var k_ = key.endsWith('[]')?key:key+'[]';
							data.append(k_,vi,vi.name);
							isFile=true;
							isf = true;
						}
					}
					if(!isf){
						if(method=="UPLOAD"){
						if($.isObject(v)||$.isArray(v))v=JSON.stringify(v)
							data.append(key,v);
							//data.push(encodeURIComponent(key)+'='+(v));
						}else{
							data.push(encodeURIComponent(key)+'='+encodeURIComponent(v));
						}	
					}
				}
				if(method == 'GET'){
					var prefix = url.indexOf('?')>0 ? '&':'?';
					url += prefix + data.join('&');
					data = null;
				}else if(method != "UPLOAD")
					data = data.join("&")
			}
  		}
		if(method == "UPLOAD"){
			//method = "POST";
			isFile = true;
			xhr.upload.addEventListener("progress", function(e) {
				var pc = parseInt(100 - (e.loaded / e.total * 100));
				if(xhr.runtime.onprogress)
					xhr.runtime.onprogress(pc);
			}, false);
		}
		
		return new Promise((resolve,reject)=>{
			xhr.onreadystatechange=function(){
				if (xhr.readyState==4 ){
					var res;
					if(xhr.status==200||xhr.status==205){
						res = xhr.responseText;
					var ctype = xhr.getResponseHeader('content-type') || "";
					if (xhr.runtime.format === 'json' && res && ctype.match(/(application\/json|text\/plain)/i)) {
						try{
							res = JSON.parse(res);
						}catch(ex){
							var err = $.extend({code:200,type:"json_error"},xhr.runtime);
							if($app.onError)$app.onError("http_parse_error",err);
							if(xhr.runtime.callback)
								xhr.runtime.callback(null,err)
							if(reject)reject(res,err);
						}
					}else if((xhr.runtime.format === 'js'||ctype.match(/application\/javascript/i)) && res){
						try{
							eval(res);
							if(resolve)return resolve(res);
						}catch(e){
							console.log("$http: JS eval error",e);
							if(reject)return reject(res,err);
						}
					}
					if(xhr.runtime.callback)
						return xhr.runtime.callback(res)
					if(resolve)return resolve(res);
					}else{
						var errors = $.extend({
							code : xhr.status,
							message : xhr.getResponseHeader("ERROR_MESSAGE"),
							data : xhr.responseText
						},xhr.runtime);
						if(xhr.runtime.callback)
							xhr.runtime.callback(null, errors);	
						if($app.onError)$app.onError("http_server_error",errors);	
						if(reject)reject(errors);
					}
				}
			};
			xhr.open(method == "UPLOAD"?'POST':method,url,true);
			//if(method=='GET')
			if(method!="UPLOAD")
				xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			if(content_type.match(/application\/json/)){
				xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
			}
			if(auth) xhr.setRequestHeader("Authorization", auth);
			xhr.send(data);
		})
  		
	},
	get : function(url, params, callback, format){
		return $http.ajax({url:url, method:"GET", params:params, callback:callback, format:format});
	},
	post : function(url, params, callback, format){
		return $http.ajax({url:url, method:"POST", params:params, callback:callback, format:format});
	},
	put : function(url, params, callback, format){
		return $http.ajax({url:url, method:"PUT", params:params, callback:callback, format:format});
	},
	del : function(url, params, callback, format){
		return $http.ajax({url:url, method:"DELETE", params:params, callback:callback, format:format});
	},
	upload : function(url, params, callback, format, onprogress){
		return $http.ajax({url:url, method:"UPLOAD", params:params, callback:callback, format:format, onprogress:onprogress});
	},
	postJSON : function(url,params,callback,format){
		return $http.ajax({url:url, method:"POST", params:params, callback:callback, format:format,
			'content_type':'application/json'
		});
	}
};

var empty = function(o){
	if(!o||o==='')return true;
	if($.isObject(o)&&Object.keys(o).length==0)return true;
	if($.isArray(o)&&o.length==0)return true;
	return false;
}
var parse_str = function(str){
	var rs={};
	str.replace(/^.*\?/,'').split('&').forEach(e=>{let es=e.split('=');rs[es[0]]=es[1]});
	return rs;
}

var htmlencode = function(str) {
	if(!$.isString(str)) return str;
	if(!$.__HTML_ESC_EXP){
		$.__HTML_ESC_REV=[];
		for(var k in $.__HTML_ESC)
			$.__HTML_ESC_REV[$.__HTML_ESC[k]]=k;
		$.__HTML_ESC_EXP = new RegExp("["+Object.keys($.__HTML_ESC_REV).join("")+"]","giu");
	}
	return str.replace($.__HTML_ESC_EXP,function(x){
		var v = $.__HTML_ESC_REV[x.substring(1,x.length-1)];
		return v?"&"+v+";":x;
	});
}

var htmldecode = function(str) {
	if(!$.isString(str)) return str;
	if(!$.__HTML_ESC_DEXP)
		$.__HTML_ESC_DEXP = new RegExp("&("+Object.keys($.__HTML_ESC).join("|")+");","giu");
	return str.replace($.__HTML_ESC_DEXP,function(x){
		return $.__HTML_ESC[x.substring(1,x.length-1)]||x;
	});
};

var is_safari_private_mode = function(cb){
    var storage = window.sessionStorage;
    try {
        storage.setItem("_test_key", "test");
        storage.removeItem("_test_key");
    } catch (e) {
		if (e.code === DOMException.QUOTA_EXCEEDED_ERR && storage.length === 0)
			return true;
	}
	return false;
}

//its just a wrapper of server side
var $cache = {
	init : function(){
		$cache.prefix = $cache.prefix||$app.page_prefix;
		if(!$cache.prefix) $app.page_prefix=$cache.prefix=new Date().getTime()+"_";
	},
	get : function(key){
		$cache.init();
		return localStorage.getItem($cache.prefix+key);
	},
	set : function(key,value){
		$cache.init();
		if(!is_safari_private_mode())
			localStorage.setItem($cache.prefix+key,value);
	},
	del : function(key){
		$cache.init();
		if(!is_safari_private_mode())
			localStorage.removeItem($cache.prefix+key);
	},
	incr : function(key,v){
		$cache.init();
		v = v||1;
		var x = $cache.get(key)||0;
		$cache.set(key,v+x);
	},
}


// var $push = {
// 	enabled : false,
// 	config : function(){
// 		if (!('showNotification' in ServiceWorkerRegistration.prototype))  
// 			return console.warn('Notifications aren\'t supported.');    
	
// 		if (Notification.permission === 'denied')
// 			return console.warn('The user has blocked notifications.');    
	
// 		if (!('PushManager' in window))
// 			return console.warn('Push messaging isn\'t supported.');    
	
// 		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
// 		// Do we already have a push message subscription?  
// 		serviceWorkerRegistration.pushManager.getSubscription()  
// 			.then(function(subscription) {  
// 				if (!subscription) {  
// 					// We aren't subscribed to push, so set UI  
// 					// to allow the user to enable push  
// 					return;  
// 				}
// 				// Keep your server in sync with the latest subscriptionId
// 				sendSubscriptionToServer(subscription);
// 			})  
// 			.catch(function(err) {  
// 				console.warn('Error during getSubscription()', err);  
// 			});  
// 		});  
// 	},
// 	subscribe : function(){
// 		if(!navigator.serviceWorker)return;
// 		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
// 			serviceWorkerRegistration.pushManager.subscribe()  
// 			  .then(function(subscription) {  
// 				$push.enabled = true;  
// 				// TODO: Send the subscription.endpoint to your server  
// 				// and save it to send a push message at a later date
// 				return sendSubscriptionToServer(subscription);  
// 			  })  
// 			  .catch(function(e) {  
// 				if (Notification.permission === 'denied') {  
// 				} else {  
// 				  console.error('Unable to subscribe to push.', e);  
// 				}  
// 			  });  
// 		  });  
// 	}
// }


/**
 * Firebase Clound Messaging
 */
var $fcm = {
	_project : false,
	_saveToken : false,
	_oauthToken : false,
	_oauthTokenURL : false,
	init : function(proj,f_save_token,oauth_token_url){
		$fcm._project = proj;
		$fcm._saveToken = f_save_token;
		$fcm._oauthTokenURL = oauth_token_url;
		const messaging = firebase.messaging();
        messaging.requestPermission()
        .then(function() {
            console.log('Notification permission granted.');
			// TODO(developer): Retrieve an Instance ID token for use with FCM.
			$fcm.getToken()
        })
        .catch(function(err) {
            console.log('Unable to get permission to notify.', err);
        });
	},

	getToken : function(){
		var cb = $fcm._saveToken||function(){}
		const messaging = firebase.messaging();
		messaging.getToken()
		.then(function(currentToken) {
			if (currentToken) {
				cb(currentToken);
				// $fcm.test(currentToken);
			} else {
				// Show permission request.
				console.log('No Instance ID token available. Request permission to generate one.');
				// Show permission UI.
				updateUIForPushPermissionRequired();
				cb(false);
			}
		})
		.catch(function(err) {
			console.log('An error occurred while retrieving token. ', err);
			cb(false);
		});

		messaging.onTokenRefresh($fcm.getToken);
	},
	
}