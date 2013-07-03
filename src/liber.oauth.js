/**
 * 
 * @Confs
 * $conf.oauth_callback_path = "/test";
 * 
 * @Delegate methods
 * 
 * this.makeTokenParams()	//required
 * this.tokenMethod()	//optional
 * this.makeCodeParams() 	//optional
 * 
 * this.apiWrapper (data) //optional
 * 
 * */

var OAuthClient = function(platform){
	this.platform = platform;
	this.app_id = null;//=client id
	this.app_sec = null;
	this.app_key = null;//for google
	this.code = null;
	this.token = null;
	var def = _oauth_platforms[platform];
	if(def){
		this.code_url = def.code_url;
		this.token_url = def.token_url;
		this.api_url = def.api_url;
		this.prefix = def.prefix;
		this.host = location.port!=80? location.protocol + '//' + location.hostname+":"+location.port:
					location.protocol + '//' + location.hostname;
		this.path = $conf.oauth_callback_path ? $conf.oauth_callback_path:"/";
		this.oauth_code_callback = this.host+this.path+"?oauth_callback="+this.prefix+"_oauth";
		this.oauth_token_callback = this.host+this.path+"?oauth_callback="+this.prefix+"_oauth_token";
		this.scope = def.scope||null;
	}
	
	var _this = this;
	
	this.init = function(opts){
		for(var k in opts){
			var v = opts[k];
			if(typeof(v)!="function"){
				_this[k] = v;
			}
		}
		var prf = _this.prefix;
		this.token = localStorage[prf+"_token"]||null;
		var paramStr = location.href.indexOf("#")>0?location.href.split("#")[1]:location.href;
		var params = $utils.unpackParams(paramStr);
		console.log("params",params);
		if(!params.access_token && params.code){
			//Get token
			_this.code = params.code;
			return _this.getToken();
		}else if(params.access_token){
			//Do request with token
			_this.token = params.access_token;
			var expAt = parseInt(new Date().getTime()/1000)+parseInt(params.expires_in);
			localStorage[prf+"_token"] = params.access_token;
			localStorage[prf+"_exp"] = expAt;
			if(localStorage[prf+"_call"]){
				var met = localStorage[prf+"_method"];
				if(met)
					_this[met](localStorage[prf+"_call"]);
				localStorage.removeItem(prf+"_call");
				localStorage.removeItem(prf+"_method");
			}
		}
	};
	
	//common methods
	this.getToken = function(){
		if(_this.code_url && _this.makeCodeParams){
			var params = _this.makeCodeParams();
			params+="&redirect_uri="+_this.oauth_code_callback;
			location.href = _this.code_url + params;
		}else if(_this.makeTokenParams){
			var method = _this.tokenMethod?_this.tokenMethod():"get";
			var params = _this.makeTokenParams();
			if(method=="get"){
				location.href = _this.token_url + params + "&redirect_uri="+_this.oauth_token_callback;
			}else{
				params.redirect_uri = _this.oauth_token_callback;
				var form = $e("form",{
					method:"POST", action:_this.token_url
				});
			    for(var key in params) {
			        if(params.hasOwnProperty(key)) {
			        	$input({type:"hidden",name:key, value:params[key]},form);
			         }
			    }
			    document.body.appendChild(form);
			    form.submit();
			}
		}
	};
	
	this._call = function(method, uri, data, success){
		if(!_this.token){
			localStorage[_this.prefix+"_call"] = uri;
			localStorage[_this.prefix+"_method"] = method;
			return _this.getToken();
		}else if(localStorage[_this.prefix+"_exp"]){
			if(new Date().getTime() >= parseInt(localStorage[_this.prefix+"_exp"])*1000){
				localStorage[_this.prefix+"_call"] = uri;
				localStorage[_this.prefix+"_method"] = method;
				localStorage.removeItem(_this.prefix+"_token");
				return _this.getToken();
			}
		}
		
		data = (typeof(data)=="function"||!data)?{}:data;
		console.log(_this.token,_this.api_url);
		data.access_token = _this.token;
		if(_this.apiWrapper)_this.apiWrapper(data);
		success = (typeof(data)=="function")?data:success;
		var func =$http[method.toLowerCase()];
		func(_this.api_url+uri,data,function(res){
			console.log("oauth res",res);
			if(success)
				success(res);
		});
	},
	this.get = function(uri, success){return _this._call("get",uri,{},success);},
	this.post = function(uri,data, success){return _this._call("post",uri,data,success);}
	
};




/**
 * $fb.init({
		appId : "193560298133",
		appSec : "07cbf61df779e387faa8e5df1753081f",
	});
	$div("mybutton").bind({"click", function(e){
		$fb.get("me", function(me){
			if(me){
				//register / login logic
			}
		})
	}})
 * 
 * TODO : invited
 * TODO : share / like
 * */
var $fb = new OAuthClient("facebook"); 
$fb.makeTokenParams = function(){
	var uri= "?client_id="+this.app_id+"&response_type=code%20token";
	if(this.scope)
		uri += "&scope="+this.scope;
	return uri;
};
$fb.me = function(callback){
	this.get("me",callback);
};
$fb.friends = function(callback){
	//show thumb by http://graph.facebook.com/FREND_ID/picture
	return this.get("me/friends",callback);
};
$fb.invite = function(msg,redirectUri){
	location.href="https://www.facebook.com/dialog/apprequests?app_id="+_this.app_id+"&message="+msg+"&redirect_uri="+this.host+redirectUri;
};

/**
 * Google +
 * 
 * $gg.init({
		app_id : "513500027229-g7i4gv9tqmcp7pt4bvq28suc1ugejg4s.apps.googleusercontent.com",
		app_key : "AIzaSyDN3ZlNMJ4rNukbQN58dyLlP_ux0TVIO7Y"
	});
	$div("mybutton").bind({"click", function(e){
		$gg.get("people/me", function(me){
			if(me){
				//register / login logic
			}
		})
	}})
 * TODO : +1
 * */
var $gg = new OAuthClient("google");
$gg.makeTokenParams = function(){
	return "?client_id="+this.app_id+"&response_type=token&scope="+this.scope;
};
$gg.apiWrapper = function(data){
	data.key = this.app_key;
};
$gg.me = function(callback){
	this.get("people/me",callback);
};
$gg.friends = function(callback){
	return this.get("people/me/people/visible",callback);
};

/**
 * linkedin
 * */
var $ln = new OAuthClient("linkedin");
$ln.makeCodeParams = function(){
	var uri = "?response_type=code&client_id="+_this.app_id+"&state=STATE";
	if(_this.scope) uri+="&scope="+_this.scope;
	return uri;
};
$ln.tokenMethod = function(){return "post";};
$ln.makeTokenParams = function(){
	return {
		grant_type : "authorization_code",
        code : _this.code,
        client_id : _this.app_id,
        client_secret : _this.app_sec
	};
};
