/***
 * MessageCenter
 * ***/
//FIXME remove this
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


var FormView = function(params){
	
	var _this = this;
	
	this.params = params;
	
	this.serialize = function(form_id,errorHandler){
		var els = $('.form-item-'+form_id);
		validator = window[form_id+"_validator"]; /*FIXME window.xxxx_validator could have problems*/
//		console.log("el.len ",els.length," ",form_id);
		params = {};
		for(i in els){
			el = els[i];
			if(typeof(el)=="function")continue;
			v = el.value;
//				console.log("v ",v);
			if(validator && validator[el.name]){
				if((v==null||v==undefined||v.length==0) ||	/*empty*/
					(validator[el.name]["func"] && !v.validate(validator[el.name].func))){ /*not valid*/
					v = null;
					if(errorHandler)
						errorHandler(el.name);
					return false;
				}
			}
			if(el.name && v)
				params[el.name]=v;
		}
		return params;
	};
		
		
	/**
	@params:args{
		id			: required * form's dom id
		url			: required * post url
		target		: required * where to insert this node.
		title 		: option. outer title line
		data		: required * 
			{
				'title'		:{type:'titleline', desc:'New User Form'},
				'id'		:{type:'hidden', desc:'required A~Z', onkeyup:function(e){}, required:true},
				'name'		:{type:'text', size:20, desc:'required A~Z', label:'Nickname', onkeyup:function(e){}, required:true},
				'email'		:{type:'text', desc:'', label:'Email', required:true, validate:'email'},
				'pass'		:{type:'password', desc:'4~6 chars', label:'Password', onkeyup:function(e){}, required:true},
				'gender'	:{type:'radio', desc:'', label:'Gender', options:{m:'male',f:'female'}},	
				'interests'	:{type:'checkbox', desc:'Up to 3', label:'Interests', options:{d:'Driving',p:'Photograph',t:'Travel',r:'Reading'}},
				'country'	:{type:'select', desc:'', label:'Country', options:{us:'US',ca:'CA',jp:'JP'},default:1, onchange:function(){}},
				'price'		:{type:'label', label:'Price', desc:'ASK'}, 	// 2 cols
				'notice'	:{type:'label', desc:'* NOTICE: please remember your pass'},	// 1 cols without label
				'toolbar'	:{type:'bar', buttons:[{label:"OK", onclick:function(){}, attrs:{}, styles:{}}, {label:"Cancel", onclick:function(){}}]}
			}
		userdata	:{},	//fill items with these data
		styles		: option
		titleClasses :option
		contentClasses :option

		drawRow		: option, function(row,item,itemId){}

		drawForm	: option, function(formFrame, list);
		
		error 	: option, errorhandler

		submit	: option, function(){}
		cancel	: option, function(){}
		submited : option, function(res){}
		canceled : option, function(){}
	}
	
	
	@styles{
		.form
		.form .title-line
		.form .content-frame
		.form table{}
		.form th{}
		.form td{}
		.form .check-option{}
		.form .radio-option{}
		.form .description{}
		.form .titleline{}
		.form .button{}
		.form .bar{}
		.form .required{}
		.form .label{}
	}
	
	*/
	this.draw = function(){
		args = _this.params;
		var target = args.target;
		var formId = args.id;
		formClasses = args.formClasses? "form "+args.formClasses : "form";
		var formFrame = $div({className:formClasses,id:formId},target).css(args.styles);
		if(args.title){
			titleClass = args.titleClasses? args.titleClasses:"";
			$div({innerHTML:args.title, className:"title-line "+titleClass, id:formId+"-title-line"},formFrame);
		}

		contentClass = args.contentClasses? args.contentClasses:"";
		var contentFrame = $div({className:"content-frame "+contentClass, id:formId+"-content-frame"},formFrame);

		var list = $table("",contentFrame);
		var postURL = args.url;

		
		var validator = {};

		var setSelOpts = function(opts, uOpts){
			for(var k in uOpts){
				if(k!="id" && k!="options" && k!="name")
					opts[k] = uOpts[k];
			}
			return opts;
		}

		for(itemId in args.data){
			var row = $tr("",list);
			_item = args.data[itemId];
			if(_item.label){
				$th({innerHTML:_item.label, id:formId+'-label-'+itemId},row);
			}
			
			if(args.userdata && args.userdata[itemId])
				_item.value = args.userdata[itemId];

			var cell = $td({id:formId+'-cell-'+itemId},row);
			if(!_item.label){
				cell.colSpan = 3;
			}
			
			var formItemClass = 'form-item-'+formId;

			var domId = formId+"-"+itemId;

			switch(_item.type){
				case 'radio':
					$radio(_item.options, setSelOpts({id:domId,name:itemId,className:formItemClass},_item), cell);
					break;
				case 'checkbox':
					$checkbox(_item.options, setSelOpts({id:domId,name:itemId,className:formItemClass},_item), cell);
					break;
				case 'select':
					$select(_item.options, setSelOpts({id:domId,name:itemId,className:formItemClass},_item), cell);
					break;
				case 'textarea':
					ta = $textarea({id:domId,size:_item.size ? _item.size: 20, name:itemId, value:_item.value?_item.value:"",className:formItemClass}, cell);
					if(_item.onkeyup)
						ta.onkeyup = _item.onkeyup;
					break;
				case 'label':
					$div({className:'description', innerHTML:_item.desc},cell);
					break;
				case 'subtitle':
					$div({className:'subtitle', innerHTML:_item.desc},cell);
					break;
				case 'titleline':
					$div({className:'titleline', innerHTML:_item.desc},cell);
					break;
				case 'bar':
					bar = $div({className:'bar buttons'},cell);
					for(i in _item.buttons){
						btn = _item.buttons[i];
						if(btn.type == 'submit'){
							btnId = formId+"-submit";
							action = args.submit?args.submit:btn.onclick;
							if(args.submited)
								$msg.register(formId, 'submited', args.submited);
							var submit = function(mcp){
								errs = $(".errors");
								if(errs){
									for(j in errs){
										$ui.remove(errs[j]);	
									}
								}
								params = _this.serialize(mcp.formId, mcp.errorHandler);
								if(params==false){
									return;
								}
								if(mcp.action){
									mcp.action(params);
								}else{
									//console.log("before post",params);
									$http.post(mcp.postURL, params, function(res, errors){$msg.call(mcp.formId, 'submited', res?res:errors)},"json");
								}
							};
							$msg.register(btnId, 'click', submit, {'formId':formId,'postURL':postURL,action:action,'errorHandler':args.error});
							//input({type:'button',id:btnId,value:btn.label,onclick:mc.trigger,className:'button'},bar);
							$a({id:btnId,html:btn.label,className:'button blue',href:"#"},bar).bind("click",$browser.name=="MSIE" && $browser.version<9?"$msg.trigger();": $msg.trigger);
						}else if(btn.type == 'cancel'){
							btnId = formId+"-cancel";
							action = args.cancel?args.cancel:btn.onclick;
							if(!action){
								if($browser.name=="MSIE" && $browser.version<9){
									action ="$ui.removeLayer();";
								}else{
									cancel = function(formId){$ui.remove(formId);$ui.removeLayer();};
									$msg.register(btnId, 'click', cancel, formId);
									action = $msg.trigger;
								}
							}
							cbtn = $a({id:btnId,html:btn.label,className:'button blue',href:"#"},bar).bind("click",action);
						}else{
							$a({html:btn.label,className:'button blue',href:"#"},bar).bind("click",btn.onclick);
						}	
					}
					break;
				default : /*text/hidden/password*/
					ipt = $input({id:domId,size:_item.size ? _item.size: 20, name:itemId,  value:_item.value?_item.value:"", type:_item.type, className:formItemClass},cell);
					if(_item.onkeyup)
						ipt.onkeyup = _item.onkeyup;	
					if(_item.hint)
						if(ipt.type == "password"){
							$div({className:"hint",html:_item.hint},cell);
						}else
							ipt.attr("placeHolder",_item.hint);
					if(_item.type=="hidden") row.style.display = "none";
					break;
			}
			if(_item.underline){
				$div({innerHTML:_item.underline, className:'underLine'},cell);
			}
			if(_item.html){
				cell.innerHTML += _item.html;
			}

			rc = $td({id:formId+'-desc-'+itemId},row);
			if(_item.required) {
				rc.className = 'required'; 
				validator[itemId] = {value:null,func:_item.validate};
			} 
			if(args.drawRow)
				args.drawRow(row, _item, itemId);
		}
		if(args.drawForm){
			args.drawForm(contentFrame, list);
		}
		window[formId+"_validator"]=validator;
	};
};

$ui.formView = function(args){
	form = new FormView(args);
	form.draw();
};

