$utils.package("core.net");

var SocketKits = function(args){/*FIXME*/
	if(!window.WebSocket)
		return false;
	var _this = this;
	this.connection = null;
	this.connect = function(args){
		_this.args = args;
		_this.connection = new WebSocket(args.url); 
		_this.connection.onopen = _this.onopen; 
		_this.connection.onclose = _this.onclose; 
		_this.connection.onmessage = _this.onmessage; 
		_this.connection.onerror = _this.onerror;
		console.log("init");
	};
	this.send = function(msg){
		console.log("send");
		_this.connection.send(msg);
	};
	this.close = function(){
		console.log("close");
		_this.connection.close();
	};
	this.onmessage = function(e){
		console.log("msg");
		if(e.data && _this.args.onmessage)
			_this.args.onmessage(e.data);
	};
	this.onerror = function(e){
		console.log("err");
		if(_this.args.onerror)
			_this.args.onerror(e.data);
	};
	this.onopen = function(e){
		console.log("open");
		if(_this.args.onopen)
			_this.args.onopen();
	};
	this.onclose = function(e){
		if(_this.args.onclose)
			_this.args.onclose();
	};
	if(args)
		this.connect(args);
	
};
$socket = new SocketKits();



