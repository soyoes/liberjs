$utils.package("core.ui.ext");


var Calendar = function(attrs,onclick){
	d =new Date();
	this.year = d.getFullYear();
	this.month = d.getMonth();
	this.wday = d.getDay();
	this.day = d.getDate();
	this.opts = attrs;
	this.onclick = onclick;

	this.dom = undefined;

	var _this = this;

	this.daysOfMonth = function(y,m){return 32 - new Date(y, m, 32).getDate();};	

	this.daysOfLastMonth = function(y,m){
		_1st_wday =  new Date(y,m,1).getDay();
		if(_1st_wday==0)
			return [];
		last_m = m==0?11:m-1;
		last_y = m==0?y-1:y;
		last_m_days = this.daysOfMonth(last_y, last_m);
		res = [];
		for(i = last_m_days-_1st_wday+1; i<=last_m_days;i++)
			res.push(i);
		return res;
	};

	this.calDays = function(y,m){
		days = this.daysOfLastMonth(y,m);

		currentDays = this.daysOfMonth(y,m);
		for(i=1;i<=currentDays;i++){
			days.push(i);
		}
		lastwday = days.length%7;

		if(lastwday>0){
			for(i=1;i<=7-lastwday;i++)
				days.push(i);	
		}
		return days;
	};

	this.nextMonth = function(e){
		cal = $id("calendar");
		cal.innerHTML="";
		m = _this.month;
		y = _this.year;
		_this.month = m==11?0:m+1;
		_this.year = m==11?y+1:y;
		_this.draw();
		e.preventDefault();
	};
	this.prevMonth = function(e){
		cal = $id("calendar");
		cal.innerHTML="";
		m = _this.month;
		y = _this.year;
		_this.month = m==0?11:m-1;
		_this.year = m==0?y-1:y;
		_this.draw();
		e.preventDefault();
	};


	this.draw = function(){
		attrs = this.opts?this.opts:{};
		attrs["id"] = "calendar";
		frame = $id("calendar");
		if(!frame){
			frame = $div(attrs);
		}
		//frame.id = "calendar";
		_this.dom = frame;
		/* year - month row */

		monstrs = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		title = $div([
			$div([
				$a({href:"#",html:"◀",onclick:_this.prevMonth}),
				$label({html:monstrs[_this.month]+", "+this.year}),
				$a({href:"#",html:"▶",onclick:_this.nextMonth}),
			]).css("minWidth",'100px').attr({"class":"titleWrapper"}),
		],frame).attr({"class":"title"}),
				
		wdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
		subtitle = $ul((function(){
			lis = [];
			for(wd in wdays)
				lis.push($li(wdays[wd]));
			return lis;
		})(),frame).attr({"class":"subtitle"}),

		days = _this.calDays(_this.year, _this.month);
		row = null;
		thismon = false;	
		for(d in days){
			if(d%7==0) row = $ul({"class":"days"},frame);
			day = days[d];
			if(!thismon && day==1) thismon = true;
			else if(thismon && day==1) thismon = false;
			cls = !thismon?(d<7?"other lastmonth":"other nextmonth"):((d%7==0)?"sun":(d%7==6?"sat":""));
			cell = $li({html:day,"class":cls,"date":[_this.year,_this.month+1,day].join("-")},row);
			cell.onclick = _this.onclick;
		}
	};
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
					$radio(_item.options, {id:domId,name:itemId,value:_item.value,className:formItemClass}, cell);
					break;
				case 'checkbox':
					$checkbox(_item.options, {id:domId,name:itemId,value:_item.value,className:formItemClass}, cell);
					break;
				case 'select':
					$select(_item.options, {id:domId,name:itemId,value:_item.value,className:formItemClass}, cell);
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


/**
 * UIKit extensions
 * 
 * */

