/*---------------------------
 App level delegates
----------------------------*/
$app.onload = function(){
	//do your staff here
	$app.loaded();
};

$app.drawHeader = function(header){
	//draw common headers here
	$h1("LiberJS Examples", header);
};

$app.drawFooter = function(footer){
	//draw common headers here
	$span("copyright liberjs.org", footer);
};


/*---------------------------
 views 
----------------------------*/
var top_view = {

	/** 
		name : [Required], name of this view controller
		each view controller must have a name property. 
		and `name` must have the same value with this controller.*/
	name : "top_view",

	/**
		declares whether this view need to be redraw every time.
	*/
	reusable : true,

	/** 
		onload : [Optional], delegate method
		A view controller may have parameters while its initialization.
		e.g. $a({href:"top_view?name=John&gender=male"}, document.body);
		we can handle these params with this delegate method.
		!! you must call this.loaded() manually if there is onload method.
		@param params : a js object contains all parameters in URL.
		*/
	onLoad : function(params){
		this.loaded();
	},

	/**
		drawHeader : [Optional], delegate method
		To customize the header of a certain view.
		Without this method, $app.drawHeader will be called instead.
		@param header : a <header> tag DOMElement object.
		*/
	drawHeader : function(header){$app.drawHeader(header);},

	/**	
		drawContent : [Required], delegate method.
		draw main content of a view 
		@param wrapper : container(<section>) to draw the content.
		@param layer : container(<article>) of the whole view controller.
			each view/controller will be a "layer"
			each "layer" contains 1 header, 1 wrapper, & 1 footer.
			the default layout will be something like this.
			<artile> // <- the layer
				<header> // <- the header
				<section> // <- the wrapper
				<footer> // <- the footer
			</artile>
		*/
	drawContent : function(wrapper, layer){
		var datas = [
			{name:"Tokyo",country:"Japan"},
			{name:"London",country:"England"},
			{name:"New York",country:"USA"},
			{name:"Paris",country:"France"},
		];
		var list = $ul({id:"cities"},wrapper);
		for(var i=0,d;d=datas[i++];){
			var url = "city_view@?n="+d.name+"&c="+d.country;
			$li([
				$label({html:d.name,url:url}),
				$label({html:d.country,url:url}),
			],list);
		}
		var f = function(e){
			console.log("exec",e);
		};

		var ff = f.toString();
		console.log(ff);
		var vv = 1;
		eval("("+ff+")(vv)");

		console.log(JSON.stringify({"v":ff}));
	},

	/**
		drawFooter : [Optional], delegate method
		To customize the footer of a certain view.
		Without this method, $app.drawFooter will be called instead.
		@param footer : a <footer> tag DOMElement object.
		*/
	drawFooter : function(footer){
		$app.drawFooter(footer);
		var outer = $div("12345",footer).bind('click',function(e){
			console.log(this.tagName,e.target.tagName);
		});
		$label("9999",outer);
	},
	onActive: function(popup){
		console.log("onActive",popup.name);
	},
	onInactive: function(popup){
		console.log("onInactive",popup.name);
	},
};

var city_view = {
	name : "city_view",
	onLoad : function(params){
		this.city = params.n;
		this.country = params.c;
		this.loaded();
	},
	drawHeader : function(header){
		$label({html:"back"},header).bind('click', this.close);
	},
	drawContent : function(wrapper, layer){
		console.log(this.params);
		$h1("City : "+this.city,wrapper);
		$h1("Country : "+this.country,wrapper);
	}
};
