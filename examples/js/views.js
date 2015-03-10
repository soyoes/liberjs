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

$app.onError = function(er,d){
	console.log("ERR",er,d);
}



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
		var list = $ol({id:"examples"},wrapper);
		for(var i=0,d;d=examples[i++];){
			$li([
				$label(d.name),
			],list).attr({url:d.view+"@"});
		}
	},

	/**
		drawFooter : [Optional], delegate method
		To customize the footer of a certain view.
		Without this method, $app.drawFooter will be called instead.
		@param footer : a <footer> tag DOMElement object.
		*/
	drawFooter : function(footer){
		$app.drawFooter(footer);
	},
	onActive: function(popup,data){
		console.log("onActive",popup.name,data,$this.name);
	},
	onInactive: function(popup,data){
		console.log("onInactive",popup.name,data,$this.name);
	},
};

var form_view = {

	name : "form_view",

	extend : "$form_view",

	formURL		:".",
	formMethod	:"POST",
	formData 	:null,
	formItems	:[
		{
			name 	: "email",
			type 	: 'text',
			title 	: "Email:",
			validate: 'email',
		},
		{
			name 	: "name",
			type 	: 'text',
			title 	: "Name:",
			validate: 'len:5',
		},
		{
			name 	: "pass",
			type 	: 'password',
			title 	: "Password:",
			validate: 'len:5',
		},
		{
			name 	: "gender",
			type 	: 'radio',
			title 	: "Gender:",
			options : [{label:"Male",value:1},{label:"Female",value:2}],
			validate: 'len:1',
		},
		{
			name 	: "favorite",
			type 	: 'checkbox',
			title 	: "Favorite:",
			options : [{label:"Apple",value:1},{label:"Pinapple",value:2},{label:"Banana",value:3},{label:"Kiwi",value:4}],
			validate: 'len:1:2',
		},
		{
			name 	: "country",
			type 	: 'custom_radio',
			title 	: "Country:",
			options : [{label:"Japan",value:1},{label:"China",value:2},{label:"France",value:3},{label:"America",value:4}],
		},
		{
			name 	: "desc", 
			type 	: 'textarea',
			title 	: "Description:",
		}
	],
	
	drawHeader : function(h){
		
		$h1("FormView example",h);
	},

	drawContent : function(wrapper, layer){
		console.log("drawContent");
		$this.drawForm(wrapper);
	},

	drawFooter : function(f){
		$a({href:"./examples.html",html:"back"},$div({},f));
		$button("保存", f).bind("click", $this.submitForm);
		$button("クリア", f).bind("click", $this.resetForm);

	}
}

