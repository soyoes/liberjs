
/**
 * 
 * delegate attributes
 * 	$this.formItems{
 * 		type : text|password|radio|checkbox|select|textarea|html|hidden
 * 		name : 
 * 		validate : email|zipcode_jp|phone_jp|url|len:N
 * 		options : [{},{}]
 * 	}
 * 	$this.formURL
 * 	$this.formMethod
 * 	$this.formData : form userdata.
 * 	
 *
 * delegate methods
 * 	$this.onFormSubmited
 * 	$this.onFormError
 *
 *
 * CSS
 	form {}	  //outer frame
 	form ul{} //inner frame
 	form li{} //rows
 	form h4{} //title of each row
 	form li > div{} //value frame 
 	form input[type='text']{}
 	form input[type='password']{}
 	form select{}
 	form textarea{}
 	form i{} //error message
 	form .error {} //error item's frame(div)
 	form .error input[type="text"],
 	form .error input[type="password"],
 	form .error textarea{}
 	form .error select{}
 	form .error + input[type="checkbox"]{}
 	form .error + input[type="radio"]{}
 	
 	
 * 
 * @type {Object}
 */
var $form_view ={

	drawForm : function(target){
		var form = $form({},target);
		var list = $ul({},form);
		var userdata = $this.formData||{};

		for(var i=0,o;o=$this.formItems[i];i++){
			
			if(typeof(o)==="function")continue;
			o.type = o.type||"text";

			var name = o.name||"";
			var row = $li({name:name,type:o.type,"class":o.required?"required":""},list);

			if(name.endsWith("*")){
				name = name.substring(0,name.length-1);
				o.required = true;
			}
			
			//draw title
			var title = $h4(o.title||"",row);

			var val = userdata[name] || o.default || "";
			var cell = $div({},row);

			if(o.type==="html"){
				cell.innerHTML = o.html;
			}else if(o.type=="textarea"){
				$textarea($.extend({name:name,value:val},o), cell);
			}else if(["text","password","hidden"].indexOf(o.type)>=0){
				console.log($.extend({name:name,value:val},o));
				$input($.extend({name:name,value:val},o), cell);
				if(o.type=="hidden")
					row.style.display="none";
			}else{//checkbox|radio|select|textarea|  customTags : mytags,myradios...
				var func = window["$"+o.type];
				if($.isFunc(func))
					func(o.options, $.extend({name:name,value:val},o), cell);
			}

			var errors = $i({name:"error-"+name},row).css({opacity:0});
		}

		$this.form = form;
	},

	formSubmit : function(){
		if(!$this.formURL||!$this.formItems)return;//TODO $app.onError
		//remove errs
		$this.form.find("i",function(err){err.attr({html:""}).css({opacity:1});});
		$this.form.find(".error",function(el){el.removeClass("error");});

		//serialize form
		var params = {};
		var errors = 0;
		for(var i=0,o;o=$this.formItems[i];i++){
			// if(name=="html")continue;
			var name = o.name,
				v = $this.form[name]||false;
			if(o.type=="checkbox"){
				v = [];
				$this.form.find("input[name='"+name+"']:checked",function(el){v.push(el.value)});
			}else
				v = v?v.value:false;
			console.log(o.type, v);
			if(o.validate){
				var mx,mn;
				if(o.validate.startsWith("len")){
					var ps = o.validate.split(":");
					mn = ps[1]?parseInt(ps[1]):-1;
					mx = ps[2]?parseInt(ps[2]):0;
				}
				if(o.validate){
					var wrong=false;
					if($.isString(v))
						wrong = !v.validate(o.validate);
					else if(mn||mx)
						wrong = (mn>=0 && v.length<mn) || mx&&v.length>mx;
					console.log(name,wrong,v,mn,mx);
					if(wrong){
						errors++;
						//FIXME!!!!
						if($this.onFormError) 
							$this.onFormError.call($this,name,o.validate);
						else{
							var el = $this.form.find1st("i[name='error-"+name+"']");
							var msg = o.validate;
							if(mn>=0) msg = "length must "+(mx?"between "+mn+"~"+mx:">"+mn);
							if(el) el.attr({html:"ERR:invalide "+msg}).show();
							el.parentNode.addClass("error");
						}	
					}
				}
			}
			if(v) params[name]=v;
		}
		if(!errors){
			var method = ($this.formMethod||"post").toLowerCase();
			$http[method]($this.formURL, params, $this.onFormSubmited ,"json");	
		}
		
	},

	formReset : function(){
		$this.form.find("i",function(err){err.attr({html:""}).css({opacity:1});});
		$this.form.find(".error",function(el){el.removeClass("error");});
		for(var i=0,o;o=$this.formItems[i];i++){
			var name=o.name, v = $this.form[name]||false;
			if(o.type=="checkbox"||o.type=="radio"){
				$this.form.find("input[type='"+o.type+"']",function(el){el.checked=false;})
			}else
				$this.form[name].value = "";
		}
	},


}
