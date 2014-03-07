
/**
* name : schema name
* datas : [{},{},{},....]
* 
* e.g : 
* 	var master = $.addCache("skills",res);
	console.log("RES",master.query({"id":3}));
	console.log("RES",master.query({"group@{}":"33","name@?":"%jsp"}));
* 
*/

var __data_filters = {
	"=" 	: function(d,k,v){return d[k]==v;},
	"!" 	: function(d,k,v){return d[k]!=v;},
	"<" 	: function(d,k,v){return d[k]<v;},
	">" 	: function(d,k,v){return d[k]>v;},
	"<=" 	: function(d,k,v){return d[k]<=v;},
	">=" 	: function(d,k,v){return d[k]>=v;},
	"[]" 	: function(d,k,v){if(!v)return false;for(var i in v){if(v[i]==d[k])return true;}return false;},
	"![]" 	: function(d,k,v){if(!v)return true;for(var i in v){if(v[i]==d[k])return false;}return true;},
	"()" 	: function(d,k,v){return d[k]>=Math.min(v[0],v[1]) && d[k]<=Math.max(v[0],v[1]);},
	"!()" 	: function(d,k,v){return d[k]<Math.min(v[0],v[1]) || d[k]>Math.max(v[0],v[1]);},
	"?"  	: function(d,k,v){if(v.charAt(0)!="%")v="^"+v;if(v.charAt(v.length-1)!="%")v=v+"$";return d[k]!=null && new RegExp(v.replace(/%/g, "(.*)"),"ig").test(d[k]);},
	"!?"  	: function(d,k,v){if(v.charAt(0)!="%")v="^"+v;if(v.charAt(v.length-1)!="%")v=v+"$";return d[k]==null || !(new RegExp(v.replace(/%/g, "(.*)"),"ig").test(d[k]));},
	"{}" 	: function(d,k,v){v="(.*)(,*)"+v+"(,*)(.*)";return d[k]!=null && new RegExp(v,"ig").test(d[k]);}, //contains , e.g search "11" from "11,33,44"  
};


var DataSet = function(name,datas){
	if(!$.cache)$.cache = {};
	var _ds = {scheme:[], data:[]};
	
	
	this.name = name;
	var _setData = function(datas){
		if(datas){
			if($.isArray(datas)){
				var slen = 0
				for(var i in datas){
					if(slen==0)
						_ds.scheme = $.keys(datas[i]);
					_ds.data.push($.values(datas[i]));
				}
			}else{
				_ds = datas; 
			}
			$.cache[name] = _ds;
		}
	};
	this.setData = _setData;
	_setData(datas);
	
	/**
	 * 
	 * 
	 * @param opts
	 *  |  operatior | operator             
	 *  ----------------------------
	 * 	| =          | equals	   	        
	 *	| !          | not equals			
     *	| <          |          		    
	 *	| >          |
	 *	| <=         |
	 *	| >=         |
	 *	| []         | in
	 *	| ![]   	 | not in
	 *	| ?		     | like
	 *	| !?	     | not like
	 *	| () 	     | between
	 *	| !() 	    | not between
	 *	| {}		| contains, e.g search "11" from "11,33,44"
	 *	-----------------------------  
	 *  | order    	| order		e.g updAt
	 *	| sort 		| sort 		e.g desc/asc
	 *  | fields 	| fields 	e.g id,name...
	 * @examples
	 *  name:users
	 * 	opts={
	 * 		"name@!"		:"Obama", 
	 * 		"age@()"		:[15,25],
	 * 		"states@[]"		:["CA","NY"],
	 * 		"note@?"		:"%Student%",
	 * 		"@sort"			:"name",
	 * 		"@order"		:"desc",
	 * }// find user from "users" table, while his name!=Obama & age between 15~25 & lives in NY or CA and there is keyword of "Student" in his notes  
	 * 	// order by name desc
	 *
	 */
	var _query=function(opts,firstOnly){
		var _c = _buildQuery(opts);
		//console.log(_c);
		var res = [];
		for(var i in _ds.data){
			if(_filter(_c, _ds.data[i])){
				var v = _rebuild(_ds.data[i], opts["@fields"]);
				if(firstOnly) return v;
				else res.push(v);
			}
		}
		if(opts["@sort"])
			res = $.sort(res, opts["sort"]);
		return ("desc"==opts["@order"])?res.reverse():res;
	};
	
	var _buildQuery = function(opts){
		var _c = [];
		if(_ds.scheme){
			for(var i=0;i<_ds.scheme.length;i++)_c[i]={};
			//build filter function
			for(var k in opts){
				var v = opts[k],i,
					ps = k.split("@");
				if(ps.length==2&&ps[0]!=""&&ps[1]!=""){
					k = ps[0];i=_ds.scheme.indexOf(k);
					_c[i] = {func:__data_filters[ps[1]],value:v};
				}else if(ps.length==1){
					i=_ds.scheme.indexOf(k);
					_c[i] = {func:__data_filters["="],value:v};
				}
			}
		}
		return _c;
	};
	
	var _filter = function(_c, ds){
		//console.log("_filter",ds);
		for(var i = 0; i<_c.length;i++){
			if(_c[i].func && !_c[i].func(ds, i, _c[i].value))
				return false;
		}return true;
	}; 
	var _rebuild = function(ds,fields){
		var v = {};
		//console.log("ds.scheme",_ds.scheme);
		for(var j in _ds.scheme){
			if(!fields || fields.indexOf(_ds.scheme[j])>=0)
				v[_ds.scheme[j]] = ds[j];
		}
		return v;
	};
	var _this = this;
	this.query=_query;
	this.add=function(data){
		if(data && typeof data === 'object' && !$.isArray(data)){
			_ds.data.push($.values(data));
		}else if(data && $.isArray(data)){
			for(var i =0;i<data.length;i++)
				_ds.data.push($.values(data[i]));
		}else{
			console.log("LiberJS DataSet : Wrong data format.", data);
		}
		return _this;
	};
	
	this.size = function(){
		return _ds.data?_ds.data.length:0;
	}
	
	/**
	 * get by index;
	 * */
	this.get = function (idx){
		return _ds.data?_rebuild(_ds.data[idx]):null;
	}
	
	/**
	 * set value by index;
	 * */
	this.set = function (idx,value){
		//if(_ds.data)_ds.data[idx]=value;
		//TODO
	}
	
	
	/**
	 * delete from list with opts
	 * */
	this.del=function(opts){
		var _c = _buildQuery(opts);
		//console.log(_c);
		var res = [];
		for(var i in _ds.data){
			if(!_filter(_c, _ds.data[i])){
				res.push(_ds.data[i]);
			}
		}
		_ds.data = res;
		return _this;
	};
	
	this.map=function(func){
		if(!func)return _this;
		var res = [];
		for(var i=0;i<_ds.data.length;i++){
			var d = func(_ds.data[i]);
			res.push(d);
		}
		_ds.data = res;
		return _this;
	};
	/**
	 * data to json
	 * */
	this.json=function(){return JSON.stringify(_ds);};

	/**
	 * save to localStorage
	 * */
	this.save=function(){
		localStorage[_this.name] = _this.json;
	};

};
$.addCache = function(name, datas){
	return new DataSet(name,datas);
};

$.loadCache = function(name){
	if(localStorage[name]){
		return new DataSet(name, localStorage[name]);
	}else{
		return null;
	}
};

