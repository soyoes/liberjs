/**
 *
 * TODO:_cs column common wrapper
 * TODO : add master data such as lang level
 *
 * TODO listview footer ui
 *
 *
 */


/**
 * form view element
 * @param  Object opt : 
 *         url : [required][string] submit url (relative path)
 *         items : [required][array] form item list,
 *         		form item properties {
 *         			name : [required][string]
 *         			type : [required][string] 
 *         					normal types : (text|password|radio|checkbox|select|textarea|html|hidden)
 *         					extend types : (image|file|autocomplete|list|tree|switch|calendar|period)
 *         		    title : [optional][string] the title of this form item
 *         		   	required : [optional][bool] default =false
 *         		   	default : [optional][mixed] default value of this form item
 *         		    validate : [optional][string]
 *         		    		email|zipcode_jp|phone_jp|url|len:N|len:N1:N2
 *         		    placeholder : [optional][string] for text|password|textarea only
 *         		    options : [optional][array] for radio|checkbox|select only
 *         		    	e.g. : [{label1:value1},{label2:value2},{label3:value3}] OR [value1, value2, value3...](labelN will = valueN)
 *					chain : [string] bind other element's value|innerHTML|other properties to this input event.
 						e.g. : when an input changed, another element can change its innerHTML with the newest value of this input.
						to customize : the target element can specify a attr of 'chain',which can be either function or string.
						example 1 : $input({type:'text',chain:'myclass'})
									$h1({class:'myclass'})//the classname contains $input.chain
									then once input changes ,h1's innerHTML will be changed too
						example 2 : $input({type:'text',chain:'myclass'})
									$h2({class:'myclass',chain:'style.color'})//the classname contains $input.chain
									then once input changes ,h2.style.color will be changed too
						example 3 : $input({type:'text',chain:'myclass'})
									$h3({class:'myclass',chain:(v)=>{
										this.style.width = $.isNumber(v)?`${v}px`:v;
									}})//the classname contains $input.chain
									then once input changes ,h3's chain callback will be called, "this" means h3.
 *         		    @other_keys : [optional][mixed], the key name can be any string. the value can be any type
 *         		    		the value will be set as attributes of this form item tag.
 *         		}
 *         data : [optional][object] form data
 *         method : [optional][string] http method, default=post
 * 		   format : [optional][string] json|text|html,default=json
 * 		   withForm : default true (if create form element)
 * 		   htmlTag : default ul-li, could be tr-td
 *         drawItem : [optional][function] a function to custom drawing of a certain item. drawItem(rowDom,o) //o is item def
 *         onChange : [optional][function] a function triggers when form item's value changes
 *         onSubmit : [optional][function] function(params){ params = user input form data } you can use this to show loading indicator. 
 *         				or return false to stop submit.
 *         onSubmited : [optional][function] function(res){ res = server response data in json format } 
 *         onError : [optional][function] function(name,error){ name=form item name, error=error detail } 
 * 		   onStep  : [optional][function] function(o,this.stepIndex){return Promise.solve()/value}; execute after drawItem
 *         delegate : [optional] delegate object responses to these methods
 *         			delegate.onFormSubmit : alternative to opt.onSubmit,
 *         			delegate.onFormSubmited : alternative to opt.onSubmited,
 *         			delegate.onFormError : alternative to opt.onError,
 *         			delegate.onFormChange : alternative to opt.onChange,
 *         			delegate.drawFormItem: alternative to opt.drawItem,
 * @param  Element target : element object to append to
 * @return FormView instance
 *         public function dom() : return form element
 *         public function draw() : draw the form
 *         public function remove() : remove this form
 *         public function submit() : submit the form
 *         public function reset(clearData): clear all data and redraw the form, if clearData, the form data will be cleared too
 *         public function changes(): set or get changes, get:changes(), set:changes("myname","myvalue"), del:changes("myname",undefined);
 * 		   public function throwError(e) : throw an error, and call delegate.onError befor submit
 * 		   public function addItem(o,i) : add an item after form rendered
 * 		   public function removeItem(i) : remove an item by index
 */
function $form_view(opt, target){
	var formview = new FormView(opt,target);
	formview.draw.call(formview);
	return formview;
}

function FormView(opt, target){
	/*======== init ========*/
	var me = this;

	var delegate = opt.delegate||{};
	var drawItem = opt.drawItem||delegate.drawFormItem;
	var onSubmit = opt.onSubmit||delegate.onFormSubmit;
	var onSubmited = opt.onSubmited||delegate.onFormSubmited;
	var onError = opt.onError||delegate.onFormError;
	var onStep = opt.onStep||delegate.onFormStep;
	var onChange = opt.onChange||delegate.onFormChange;
	var htmlTags = $.isString(opt.htmlTag) && opt.htmlTag.indexOf('-')?opt.htmlTag.split('-'):['ul','li'];//ul-li | tr-td

	/*======== private properties ========*/
	var form = opt.form||false;
	var withForm = 'withForm' in opt?opt.withForm:true;
	var data = opt.data||{};
	var format = opt.format||'json';
	var changed = {};
	var items = opt.items;
	var v_items;
	var rendered=false;
	this.stepIndex = 0;
	
	/*======== public methods ========*/
	this.dom = function(){return withForm?form:v_items;}
	this.items = function(){return items}

	this.draw = function(){
		rendered=false;
		var nf = $form({method:opt.method||"POST", class:opt.className||"", action:opt.url||"", enctype:"multipart/form-data"});
		if(form){
			nf.left(form);
			form.remove();
		}else if(withForm){
			target.appendChild(nf);
		}
		form = nf;
		v_items = $e(htmlTags[0],{'data-id':`id_${data.id||0}`},withForm?form:target);
		if(onStep){
			this.drawStep();
		}else{
			for(var i=0,o;o=items[i];i++){
				me.addItem(o);
			}
			rendered=true;
		}
		return me;
	};

	this.drawStep = function(stay){
		if(stay)me.stepIndex--;
		var o = items[me.stepIndex];
		if(!o)return;
		$.sync(function *(){
			if(stay){//remove last
				$.remove(v_items.lastChild);
			}
			me.addItem(o);
			var rs = yield onStep(o,me.stepIndex++);
			if(rs){
				return me.drawStep();
			}
		})
	}

	this.addItem = function(o,i,tar){
		tar = tar||v_items;
		if($.isObject(o)){
			var v_item;
			if($.isArray(o.items)){
				v_item = $e(htmlTags[1],{type:"multiple",class:'form-item-multiple'});
				if(o.class)v_item.addClass(o.class);
				var tr = $dl({},v_item);
				for(var j=0,oi;oi=o.items[j];j++){
					if($.isElement(oi)){
						$dd(oi,tr);
					} else {
						oi.type = oi.type || "text";
						draw_item(oi,$dd({name:oi.name,type:oi.type,"class":(oi.class||'')+(oi.required?" required":"")},tr));
						if(j<o.items.length-1){
							$dd({class:(oi.class||'')+' space'},tr);//add place holder
						}
					}
				}
			}else{
				if($.isElement(o)){
					v_item = $e(htmlTags[1],o,tar);
					if(drawItem)drawItem(v_item, o);
				} else {
					o.type = o.type || "text";
					v_item = $e(htmlTags[1],{name:o.name,type:o.type,"class":o.required?"required":""},tar);
					draw_item(o,v_item);
				}
			}
			if($.isNumber(i)&&i<tar.childNodes.length-1){
				v_item.left(tar.childNodes[i+1]);
			}else
				tar.appendChild(v_item);
			if(rendered){//add to item def
				items.splice(i,0,o);
			}
			if(o.class)v_item.addClass(o.class);
			return v_item;
		}else{
			console.log("$form_view WARN : SKIP ",o);
		}
	};

	this.removeItem = function(i){
		if(v_items && v_items.childNodes.length>i){
			$.remove(v_items.childNodes[i]);
			//remove from items
			if(rendered)
				items.splice(i,1);
		}
	};

	/**
	 * update opt.items defination, for validation only.
	 */
	this.setOption = function(name,k,v){
		var o = k!==undefined&&v!==undefined?1:($.isObject(k)?k:null);
		if(!o)return;
		if(o==1){
			o = {};
			o[k]=v;
		}
		for(var i=0,e;e=items[i];i++){
			if(($.isString(name)&&e.name==name)||($.isNumber(name)&&name==i)){
				for(var k in o){
					if(!$.isFunc(o[k]))
						items[i][k]=o[k];
				}
			}
		}
		return me;
	};

	//set form items def with new one.
	this.setOptions = function (opts){
		items = opts;
		return me;
	}

	/**
	 * redraw the form,
	 * to update items|options use this.setOption() instead
	 * 
	 */
	this.update = function(userData){
		data = userData;
		return me.draw();
	};

	this.setData = function(d){
		data = d;
	}

	/**
	 * get form data and validate form items
	 * @return  null 		: validate error
	 * 			params obj	: validate successed
	 */
	this.serialize = function(){
		//serialize form
		var params = {};
		var errors = 0;
		// var its = [];

		var item_value = function(o){
			var name = o.name||o.attr("name"), v, hidden=false;
			if(params[name])return;
			var el = form[name];
			var cTag = htmlTags[1].toUpperCase();
			if(el instanceof NodeList){
				if(o.type=="checkbox" || o.type=="radio"){
					v = [];
					el.forEach(e=>{if(e.checked)v.push(e.value)});
					v = v.join(',');
				}else{
					var fs = [];
					for(let e of el){
						let parent = e;
						while (parent.tagName!=cTag)
							parent = parent.parentNode;
						var cs = getComputedStyle(parent);
						if(parent.className&&parent.className.replace(/\s*required\s*/,'')==o.class) {
							v = e.v; 
							if((o.type!='hidden'&&o.type!='file'&&o.type!='image')&&(cs.display=='none'||cs.height=='0px'))
								hidden = true;
							break;
						}
						if((o.type!='hidden'&&o.type!='file'&&o.type!='image')&&(cs.display=='none'||cs.height=='0px'))//remove duplicated item
							continue;
						if(o.type=='file'){
							if(e.files&&e.files.length>0)
								fs.push(e.files[0]);
						}else{
							v = e.value;break;
						}
					}
					if(fs.length)v=fs;
				}
			}else if(el instanceof Element){
				let parent = el;
				while (parent.tagName!=cTag)
					parent = parent.parentNode;
				var cs = getComputedStyle(parent);
				// console.log(o.name,cs.height,cs.display);
				if((o.type!='hidden'&&o.type!='file'&&o.type!='image')
					&&(cs.display=='none'||cs.height=='0px')){//remove duplicated item
					return;
				}
				v = el.value;
				if(o.type=='file'){
					v = [el.files[0]];
				}else if(o.type=='image'){
					v = el.src?htmlencode(el.src):"";
					if(el.src==DUMMY_SVG_SRC)v="";
				}else if(o.type=="period"){
					var pvs = v.split(',');
					if(parseInt(pvs[0])>parseInt(pvs[1]) && onError)
						return onError.call(form,name,"start>end");
				} else if(o.type=="checkbox" || o.type=="radio"){
					if(!el.checked){
						v = null;
					}
				}
				if($.isString(v))
					v=v.trim();
			}

			if(!hidden && (o.validate || o.required)){
				var vas = o.validate? o.validate.split(/;+/g):['len:1'];
				for(var j=0,va;va=vas[j];j++){
					var mx=0,mn=-1;
					if(va.startsWith("len")){
						var ps = va.split(":");
						mn = ps[1]?parseInt(ps[1]):-1;
						mx = ps[2]?parseInt(ps[2]):0;
					}
					if(va){
						var wrong=false;
						if($.isString(v)){
							if(o.multiple){
								var ps = v.split(",");
								for(var p of ps){
									if(!p.validate(va)){
										wrong=true;break;
									}
								}
							}else
								wrong = !v.validate(va);
							if(v.trim()==""&&!o.required){
								wrong=false;
							} else if(v.trim()==""&&o.required)
								va = 'required';
						}else if(mn||mx)
							wrong = (mn>=0 && v && v.length<mn) || mx&&v&&v.length>mx;
						if(wrong){
							errors++;
							// var li = form.find1st("li[name="+name+"]");
							// if(li)li.addClass("error")
							var msg = T(`err.validate.${va}`);
							if(va.startsWith("len")){
								msg = (mn>=0) ? "length must "+(mx?"between "+mn+"~"+mx:">"+mn) : 'Invalid '+va;
							}
							me.showError(name,msg)
							if(onError)
								onError.call(form,name,va);
							break;
						}
					}
				}
			}
			if(v || (v!==null&&data[name]&&v!=data[name]) || v==="") params[name]=v;
		}

		for(var o of items){
			if(!$.isObject(o)||$.isElement(o))continue;
			if(!o.name&&!o.items)continue;
			if($.isArray(o.items)){
				for(var oi of o.items)
					item_value(oi);
			}else
				item_value(o);
		}
		return errors>0?null:params;

	};

	this.submit=function(e){
		e = e||window.event;
		if(e && e.preventDefault)e.preventDefault();
		//remove errs
		//this.find("i",function(err){err.attr({html:""})});
		form.find(".error",function(el){el.removeClass("error");});

		//serialize form
		var params = me.serialize();
		if(params){
			var re = (onSubmit)?onSubmit(params, changed):true;
			if(re && (opt.url||this.url)){
			    var method = (opt.method||($.isString(e)?e:"post")).toLowerCase();
			    $http[method](opt.url||this.url, params, function(r,e){
					changed = {};
					var redraw = true;
					if(onSubmited)
			    		redraw = onSubmited(r,e);
					if(redraw!==false)me.draw();//redraw the form, since we removed hidden <li><td> tags
			    } ,format);
			}
		}
		return me;
	};

	this.reset=function(clearData){
		if(clearData) data={};
		return me.draw();
	};


	//trigger delegate onError method
	this.throwError = function(name, err){
		if(onError)onError.call(me,name,err);
	};

	/**
	 * show error msg upon UI
	 * @param name : name of the form item
	 * @param msg : err msg
	 * @param time : time to display, default = forever.
	 */
	this.showError = function(name, msg, time){
		// console.log("el",el,el.parentNode,me.gid,me.aid)
		time = time||0;
		form.find("cite.error-"+name,function(el){
			if(msg) el.textContent = msg;
			el.parentNode.addClass("error");
			el.show();	
			if(time>0){
				setTimeout(function(){
					me.hideError(name);
				},time)
			}
		})
	};
	this.hideError = function(name){
		form.find("cite.error-"+name,function(el){
			el.textContent = "";
			el.parentNode.removeClass("error");
			el.hide();	
		})
	};


	/**
	 * get/set changes of this form
	 * @example
	 *  set k->v : myform.set("mykey","myval");
	 *  set obj : myform.set({"key1":"val1","key2":"val2"});
	 *  get : var c = myform.changes()
	 */
	this.changes = function(k,v){
		me.hideError(k);
		if(arguments.length==0){
			return changed;
		}else if(arguments.length==1){
			if($.isObject(k))
				changed = $.extend(k,changed);
		}else if(arguments.length==2){
			if(v!==undefined)changed[k]=v;
			else {
				if(Object.keys(data).indexOf(k)>=0)
					changed[k]=null;
				else
					delete changed[k];
			}
		}
	}
	this.remove = function(){
		if(form)$.remove(form);
	}
	
	/*======== private methods ========*/
	var draw_item = function(o,v_item){
		if(o.name){
			v_item.addClass(`form-item-${o.name}`);
		}
		//draw title
		if(o.title) $h4(o.title,v_item);

		var val = data[o.name] || o.default || "";
		if(o.type.match(/^(textarea|text|password|autocomplete)$/) && typeof val == 'string')
			val = htmldecode(val);
		var v_cell = $div({},v_item);
		v_cell.addClass(`form-type-${o.type}`);
		var args = $.extend({name:o.name,value:val,class:'form-item'},o);
		var stop_prop = function(e){e.stopPropagation()}
		if(o.type==="html"){
			v_cell.innerHTML = o.html;
		}else if(o.type=='textarea'){
			$textarea(args, v_cell).bind('click',stop_prop).bind("input",item_changed).bind('paste',item_changed).bind('change',item_changed);
		}else if(o.type.match(/^(text|password|hidden|email|tel|number|url|date|datetime-local)$/)){
			$input(args, v_cell).bind('click',stop_prop).attr("type",o.type).bind("input",item_changed).bind('paste',item_changed).bind('change',item_changed);
		}else if(o.type.match(/^(checkbox|radio)$/)){
			window["$"+o.type](o.options,args,v_cell);
			v_cell.find('label',function(el,i){
				el.bind("click",function(e){
					e.stopPropagation();
					this.parentNode.find("label",function(el1,i){
						var sel = el1.childNodes[1];
						if(sel.checked)el1.addClass('on')
						else el1.removeClass("on");
					});
				});
			});
			v_cell.find("input",function(el,i){
				el.bind('click',stop_prop)
				el.bind("change",item_changed);
				if(o.chain)el.attr("chain",o.chain);
			})
		}else if(o.type=='select'){
			$dropdown(o.options, args, v_cell).bind('click',stop_prop).bind("change",item_changed); 
		}else if(o.type.match(/^(image|file|autocomplete|list|tree|switch|calendar|period|range|datetime|yymm|yymmdd|yymmddhhii)$/)){//extentions
			var ip_el = window["$form_item_"+o.type].call(me, args, v_cell);
			var ip_tar = ip_el||form;
			ip_tar.find("input[name="+args.name+"]",function(el,i){
				el.bind('click',stop_prop).bind("change",item_changed);
			});
		}else{//custom tags
			var func = window["$form_item_"+o.type];
			if($.isFunc(func)){
				func.call(me, args, v_cell);
			}
			if(args.name)
			form.find("input[name="+args.name+"]",function(el,i){
				el.bind('click',stop_prop).bind("change",item_changed);
			});
		}
		$b('',v_cell);
		//description
		$p({class:"desc-"+o.name+(o.desc?"":" empty"),html:o.desc||""},v_cell);
		//error msg
		$cite({class:"error-"+o.name},v_cell);
		if(drawItem)drawItem(v_item, o);
		return v_item;
	}

	var item_changed = function(e){
		var cTag = htmlTags[1].toUpperCase();
		form.find(".error",function(el){el.removeClass("error");});
		var v = this.value?this.value.trim():"";
		if(e.type=='paste' && v=='')
			v = e.clipboardData.getData("text/plain");
		if(this.tagName=="INPUT" && this.type=="checkbox"){//handle multiples
			var vs = [];
			var pa = this.parentNode;
			while (pa.tagName!='DD'&&pa.tagName!=cTag)
				pa = pa.parentNode;
			var ds = pa.find("input[name="+this.name+"]:checked");
			for(var i=0,d;d=ds[i];i++){
				vs.push(d.value);
			}
			v = vs.join(",");
		}
		me.changes(this.name,v.length>0?v:undefined);
		if(onChange) onChange.call(me,this.name,v,$.clone(changed),data,this);
		if(this.chain && $this){//chain update
			$.updateChain.call(this,this.chain,v);
		}
	}

	return me;
}


/**
 * TODO : test
 * TODO : change base64 to multipart-form
 * image upload item
 * @param  {[type]} o      [description]
 * @param  {[type]} args   [description]
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
const DUMMY_SVG_SRC = "data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg'><rect/></svg>";
function $form_item_image(attrs, target){
	var src = attrs.value||DUMMY_SVG_SRC,ipt;
	return $div([
		ipt = $input($.extend({type:"file",value:""},attrs))
		.bind("change",function(e){
			if(!this.value)return;
			var fn = this.value.split(/[\/\\]/);
			fn = fn[fn.length-1];
			var ext = fn.split(".");
			ext = ext.length>1? ext[ext.length-1].toLowerCase():"???";
			if(["jpg","png","gif","bmp", "jpeg"].indexOf(ext)>=0){
				var reader = new FileReader();
        		reader.onload = function (e2) {
        			ipt.nextSibling.src = e2.target.result;
					if($this){
						$.send($this,'image-changed',e2.target.result,1,attrs);
					}
        		};
        		reader.readAsDataURL(this.files[0]);
			}
		}),
		$img({src:src,name:attrs.name})
	],target).attr({class:"form-item-image"+(attrs.value?'':' default')})
	.bind("click",function(e){
		ipt.fire("click");
	});
}

/**
 * TODO : multiple files test
 * form file upload item
 * @param  {[type]} o      [description]
 * @param  {[type]} attrs  [description]
 * 		accept : .jpg,.jpeg,.png
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
var $form_item_file = function(attrs, target){
	var amount = parseInt(attrs.amount) || 1;
	var fr = $div({class:"form-item-file"},target);
	var i=0;
	var vs = attrs.value?($.isString(attrs.value)?attrs.value.split("\n"):attrs.value):[];
	delete attrs['value'];
	while(i++<amount){
		var sp;
		$div([
			sp = $span(""), //file ext or the [+] btn
			$u(""), //file name
			$input(Object.assign({type:"file",i:i},attrs)).bind("change",function(e){
				if(!this.value)return;
				e.stopPropagation();
				var t = this.parentNode;
				var i = this.i;
				var fn = this.value.split(/[\/\\]/);
				fn = fn[fn.length-1];
				var ext = fn.split(".");
				ext = ext.length>1? ext[ext.length-1].toLowerCase():"???";
				console.log("i=",i);
				if(["jpg","png","gif","bmp","jpeg"].indexOf(ext)>=0){
					var reader = new FileReader();
            		reader.onload = function (e2) {
            			t.childNodes[0].innerHTML="";
            			t.childNodes[0].style.backgroundImage = "url("+e2.target.result+")";
						if($this){
							$.send($this,'image-changed',e2.target.result,i,fn,attrs);
						}
            			t.childNodes[0].className="on";
						t.childNodes[1].innerHTML = fn;
            		};
            		reader.readAsDataURL(this.files[0]);
				}else{
					t.childNodes[0].style.backgroundImage ="url(/images/ico_plus_round_w.svg)";
					t.childNodes[0].innerHTML = ext.toUpperCase();
					t.childNodes[0].className="on";
					t.childNodes[1].innerHTML = fn;
				}
			})
		], fr)
		.bind('click',function(){
			var t = (this.tagName!='DIV')?this.parentNode:this;
			t.lastChild.fire("click");
		});
		if(vs[i-1]){
			sp.style.backgroundImage = "url("+vs[i-1]+")";
		}else{
			sp.style.backgroundImage = `${vs[i-1]||DUMMY_SVG_SRC}`;
			sp.parentNode.addClass('default')
		}
	}
		
	return fr;
}

/**
* custom switch box. 
* this function has to obey the rules of function(options, attrs, target)
*   @param options : an array of data.
*            [{label:"label1", value:"value1"},{label:"label2", value:"value2"}, ]
*   @param attrs : form item properties.
*            name:xxxx, //required name of form item
*   @param target : where to insert this dom element.
*/
var $form_item_switch = function(attrs, target){
	var ipt,b,div = $div([
    	ipt = $input($.extend({type:"hidden"},attrs)),
    	b = $b({class:'form-item-switch'},target).bind('click',function(e){
	    	if(this.hasClass('on')){
	    		this.previousSibling.value = 0;
	    		this.removeClass('on');
	    	}else{
	    		this.previousSibling.value = 1;
	    		this.addClass('on');
	    	}
	    	ipt.fire("change");
    	}),
    ],target);
    if(attrs.value==1||attrs.value=="1"){
    	b.addClass("on");
    }
    return div;
};

/**
 * autocomplete search box
 * @param  opts  : 
 * @param  attrs : {
 *     url : an url tells where to fetch json contents
 *     		autocomplete item will send GET request like url?keyword=value
 *     labelKey : property name of item label
 *     valueKey : property name of item value
 * 	   freeInput : bool , true means enable free input, use TAB key to seperate words
 * 	   menuStyle : auto(default),fixed(option menu won't dissapear)
 * 	   source : Array of options items
 * 	   emptyMessage|empty_message : show msg if items is empty
 * 	   onSelect : function, fire when option items are clicked.
 * 	   firstOption : [obj|str], will be show as the first option whatever there is any item matches
 *     lastOption :  [obj|str], will be show as the last option whatever there is any item hit
 * 	   group : {
 * 			'関東' : '東京,神奈川,千葉,埼玉,茨城,栃木,群馬',
 * 			'関西' : '大阪,京都,兵庫,奈良,三重,滋賀,和歌山',
 * 	   }
 * 	   onRemoveTag : function(v)//new value
 * }
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
var $form_item_autocomplete = function(attrs, target){
	var rowH = 40; 
	var ipt,iph,al,ac,gps;
	var _form = this;
	var items = attrs.source,
		vs=attrs.value?($.isArray(attrs.value)?attrs.value:(""+attrs.value).split(",")):[],
		multi=('multiple' in attrs)?attrs.multiple:true,
		groups = attrs.group,
		mstyle = attrs.menuStyle||'auto',
		lk = attrs.labelKey || 'label',
		vk = attrs.valueKey || 'value',
		api = attrs.url,
		emptyMsg = attrs.empty_message||attrs.emptyMessage,
		freeInput = attrs.freeInput,
		onSelect = attrs.onSelect,
		fopt = attrs.firstOption,
		lopt = attrs.lastOption,
		onRemoveTag=attrs.onRemoveTag;
	const uuid = $.uuid();
	
	var draw_tag = function(lb,v){
		if(!multi){
			var o=ipt;
			while(o=o.previousSibling)
				if(o.tagName=="SPAN")o.remove();
		}
		var sp = $span({html:htmlencode(lb),v:v}).left(ipt);
		$b({class:"cross",lb:lb,v:v},sp).bind("click",function(e){
			e.stopPropagation()
			remove_tag(this.attr("lb"));
			// var lb = this.attr("lb");
			// remove_tag($.isString(lb)?htmldecode(lb):lb);
		});
	}
	//remove tags that textContent=v
	var remove_tag = function(lb,withoutFire){
		var i=0,s,spans=ac.find("span");
		var ex = new RegExp(lb);
		for(;s=spans[i];i++){
			// fixed %C2%A0:  ' ' is %C2%A0  => ' ' is space
			var t=s.textContent?s.textContent.replace(/ /g,' '):s.textContent;
			if(t==lb){
				s.remove();
				vs.splice(i, 1);
				break;
			}
		}
		iph.value = vs.join(",");
		console.log("iph",vs,iph.value)
		if(!withoutFire)
			iph.fire("change");
		ipt.focus();
		if(onRemoveTag) onRemoveTag(iph.value);
	};
	var item_sel = function(lb,v){
		//$.remove(al);al=null;
		//lb=htmlencode(lb);
		ipt.value="";
		hide_options();
		if(multi){
			if(vs.indexOf(v)>=0)return;
			vs.push(v);
		}else{
			vs=[v];
		}
		iph.value = vs.join(",");
		draw_tag(lb,v);
		iph.fire("change");
	}
	var item_remove_last = function(){
		if(ipt.previousSibling){
			ipt.previousSibling.remove();
			vs.pop();
			ipt.value="";
			iph.value = vs.join(",");
			iph.fire("change");
		}
	}
	var show_options = function(v){
		if(api){
			$http.get(api, {keyword : v}, function(res, err){
				if(!err){				
					items = res;
					draw_options(items);
				}
			});//end http.get
		}else if(items){//show options with attrs.items
			console.log("v=",v)
			var its = v&&$.isString(v)&&v.trim().length>0?items.filter(function(e){let str=$.isObject(e)?e.label:e;return (str+"").match(new RegExp(v,'i'))?true:false}):items;
			draw_options(its);
		}
	}
	var draw_options = function(items){
		hide_options();
		if(fopt || lopt){
			if(!items)items = [];
			if(fopt&&items.indexOf(fopt)<0)items.unshift(fopt);
			if(lopt&&items.indexOf(lopt)<0)items.push(lopt);
		}
		if(items||attrs.empty_message){
			
			var rect = $.rect(ac);
			var rl = items?items.length:1;
			if(mstyle=='auto' || !al)
			al = $ul({id:"form-item-autocomplete",sz:rl,uuid:uuid,org_y:document.body.scrollTop},document.body)
			.css({left:rect.left+"px", top:rect.top+rect.height+"px", width:rect.width+'px', height:Math.min(5,rl)*rowH+"px", zIndex:999}).bind('mouseover',function(e){
				al.attr("over","yes");
			}).bind('mouseout',function(e){
				al.attr("over","no");
			})
			if(items && items.length){
				var item_clicked = function(e){
					if(this.attr("value")==""){//clicked on group title?? FIXME
						return e.preventDefault();
					}
					if(!onSelect || (onSelect && onSelect(e,ipt,this)))
						item_sel(this.textContent,this.attr('value'));
					else{
						hide_options();
					}
				}
				for(var i=0,r;r=items[i];i++){
					var isObj = $.isObject(r);
					$li({html:isObj&&lk?r[lk]:r,value:isObj&&vk?(r[vk]||''):r,i:i,name:iph.name,class:(isObj && 'class' in r)?r.class:''},al)
					.bind('click',function(e){
						item_clicked.call(this,e);
					})
				}
			}else{
				$li({html:emptyMsg,class:"empty_message"},al).bind('click',function(e){
					hide_options();
					if(onSelect) onSelect(e,ipt,lac);
				});
			}
			rowH = al.firstChild?al.firstChild.rect().height:40;
			//disable scroll
			// window.onwheel = window.onmousewheel = document.onmousewheel = window.ontouchmove = function(){
			// 	//console.log("scroll",$id("form-item-autocomplete"));
			// 	// console.log("scroll",document.body.scrollTop,al?al.attr("org_y"):-1);
			// 	if(!$browser.mobile && al && "yes"!=al.attr("over")){			
			// 		// hide_options();
			// 		window.onwheel = window.onmousewheel = document.onmousewheel = window.ontouchmove = null;
			// 	}
			// };
		}
	}
	var hide_options = function(_uuid){
		document.body.find("#form-item-autocomplete",function(e,i){
			// console.log("found",e.attr("uuid"),_uuid)
			if(!_uuid || e.attr('uuid') == _uuid)$.remove(e)
		});
		al=null;
	}
	//e :keyboard event
	var add_freeInput_tag = function(e){
		var ipt = e.target||e.srcElement;
		var v = ipt.value.trim();
		var ckr = onSelect?onSelect(e,ipt):true; //checker,give user a chance to validate 
		if(ckr){
			if(multi){
				if(vs.indexOf(v)<0){
					vs.push(v);
				}
			}else{
				if(vs.length)item_remove_last(vs[0]);
				vs = [v];
			}
		}
		ipt.value = "";
		iph.value = vs.join(",");
		iph.fire("change");
		draw_tag(v,v);
		if(!multi)
			hide_options(uuid);
	}
	var blur_ipt = function(e){
		lac = ipt.selectionStart;
		if(ac){
			ac.removeClass('on');
			ac.removeClass('error');
		}
		$.remove($id('#autocomplete_tmp_error'));
		if(listener){
			clearInterval(listener);listener=null;
		}
		if(!(al && "yes"==al.attr('over'))){
			setTimeout(function(){hide_options(uuid)},200);	
		}
		var v = ipt.value;
		if(v && v.length && freeInput){//put tmp data to tags for freeInput& no-source (items)
			add_freeInput_tag(e);
		}
	}
	var lav,listener,lac//last input cursor position;
	var h_attrs = $.extend({type:'hidden'},attrs)//for hidden input attrs
	delete h_attrs['source']
	ac = $div([
		ipt = $input({type:'text',autocomplete:'off',class:"autocomplete",placeholder:attrs.placeholder||"",target_name:attrs.name})
		.bind('keydown',function(e){//Japanese IMG
			var c = e.which || e.keyCode;
			if(c==9 && ((!freeInput&&this.value.length)||(freeInput&&multi)) ) e.preventDefault();//prevent tab key
			if(c==13) e.preventDefault();
			if(c==229) this.attr("ja",1);
			else this.removeAttribute("ja");
			this.attr("len",this.value?this.value.length:0);//solve backspace problem. save length first.
			//if($browser.mobile){
			var ip=this;
			if(!listener) 
			listener = setInterval(function(){
				v = ip.value.trim();
				if(v&&v!=lav){//user select a word from option list by tapping
					lav = v;
					if(api||items){
						show_options(api,v);
					}//end if api
				}
			},100);
			//remove empty msg
			$this.layer.find("#form-item-autocomplete li.empty_message",$.remove)
			//}
		})
		.bind('keyup',function(e){	
	    	var c = e.which || e.keyCode;
			var ja = this.attr("ja")==1;
	    	if(!$browser.mobile && ja && c!=13)return;
			//search events.
	    	var v = this.value.trim();
			ac.removeClass('error');
			$.remove($id('#autocomplete_tmp_error'));
			if(c==9){//prevent tab key if freeInput=true
				if(attrs.freeInput){
					if(v.length){
						e.preventDefault();//prevent jump
						add_freeInput_tag(e);
						return;
					}
				}else{
					if(v.length){//it must be selected from opts, yet it has free input text.
						ac.addClass('error');
						$.remove($id('#autocomplete_tmp_error'));
						$cite({html:T("err.validate.autocomplete.noFreeInput"),id:'autocomplete_tmp_error'}).right(this);
						return;
						// setTimeout(function(){$.remove(ct);ac.removeClass('error')},1000);
					}
				}
			}
			lav = v;
	    	var ipt = this;
	    	if(v.length==0 && 0===this.attr("len")){
	    		if(c==8)
	    			return item_remove_last();
				if(mstyle=='auto')//menuStyle
					return hide_options();
	    	}

			if(c==13&&!ja&&attrs.freeInput&&(!al|| al.attr("cursor")===null|| al.attr("cursor")===undefined)){//add this as tag
				// if(v.length)
					return ipt.blur();
			}
			
	    	if([16,17,91,37,39].indexOf(c)>=0)return;//ctrl, shift, cmd, left/right arrow events
	    	if(c==40||c==38||(!ja&&c==13)){//40:down 38:up 13:enter,arrow key selection events
				if(!al)return;
	    		al.childNodes.removeClass('on');
				var size = al.attr('sz');
	    		var cursor = al.attr("cursor");
	    		if(c==13){
	    			if(cursor==null)cursor=(c==38?size-1:0);
					if(al.childNodes[cursor]){
						var ckr = onSelect?onSelect(e,ipt,al.childNodes[cursor]):true; //checker,give user a chance to validate 
						if(ckr)
							item_sel(al.childNodes[cursor].textContent,al.childNodes[cursor].attr('value'));
						else{
							ipt.value="";
							hide_options();
						}
					}	
	    		}else{
	    			cursor = (cursor==null) ? (c==38?size-1:0):  Math.max(0,Math.min(size-1,cursor+(c==38?-1:1)));
					while(al.childNodes[cursor]&&al.childNodes[cursor].hasClass('group')){
						cursor+=(c==38?-1:1);
					}
					if(cursor>=0 && al.childNodes[cursor]){
						al.childNodes[cursor].addClass("on");
						var visibleRows = al.offsetHeight/rowH-1;
						al.scrollTop = Math.max(0,(cursor-visibleRows))*rowH;
						this.removeAttribute("ja");
						al.attr("cursor",cursor);
					}
	    		}
	    		return;
	    	}else if(api||items){
				show_options(v);
	    	}//end if api
		})
		.bind('click',function(e){
			if(!al)show_options(this.value)
		})
		.bind("focus",function(e){
			if(ac)ac.addClass('on');
		})
		.bind("blur",function(e){
			if(!al) blur_ipt.call(this,e);
			else{
				var le = this;
				setTimeout(function(){blur_ipt.call(le,e);},200);
			}
		}),//end $input
	    iph = $input(h_attrs)
    ],target).attr("className","form-item-autocomplete")
    .bind("click",function(e){
    	if(ipt!=document.activeElement){
    		ipt.focus();
    	}
		e.stopPropagation();
    });
	if(mstyle=='fixed'){
		ipt.bind('focus',function(e){show_options();});
	}
	if(attrs.disabled==true)
		ipt.disabled=true;

	if(groups){//draw shortcut groups
		//Object.keys(groups)
		var allks = [];
		for(var k in groups)
			allks = allks.concat(groups[k].split(','));
		gps = $sel(Object.keys(groups),{type:'checkbox',name:attrs.name+"_groups"},target);
		gps.forEach(function(el){
			el.childNodes[1].bind('change',function(e){
				var kws = [];
				var ds = target.find('input[name='+attrs.name+'_groups'+']:checked');
				for(var i=0,o;o=ds[i];i++){
					kws = kws.concat(groups[Object.keys(groups)[parseInt(o.value)-1]].split(','));
				}
				for(var j=0,o;o=allks[j];j++)
					remove_tag(o,j<allks.length-1);
				if(kws.length>0){
					$http.get(attrs.url,{keyword:kws.join(',')},function(r,err){
						for(var j=0,o;o=r[j];j++){
							if(vs.indexOf(o)<0){
								vs.push(o);
								console.log("vs",vs)
								draw_tag(o);
							}
						}
						iph.value = vs.join(',');
						iph.fire('change');
					});
				}
			});
		});
	}

    //draw initial values
    if(vs.length>0){
    	for(var i=0,v;v=vs[i++];){
			if(mstyle=='fixed' && !freeInput && items && items.length && items.indexOf(v)<0){//data is {label:lb,value:v} type
				var rs = items.filter(e=>(e==v || ($.isObject(e)&&e.value==v)))
				if(rs&&rs.length) draw_tag(htmldecode(rs[0].label),v);
			}else{
				draw_tag(htmldecode(v),v)
			}
		}
    }
    return ac;
};

// var $form_item_autocomplete_onsave = function(row){

// }

/**
 * date pulldown menu
 * @param  {[type]} attrs  {
 *     value : current value of timestamp|js milliseconds|yyyy-mm-dd string
 *     fromYear : start year,default=this year - 5
 *     toYear : end year,default=this year + 5
 *     fromHour : start hour,default=0
 *     toHour : end hour,default=24
 * 	   step : minutes span, default=1 minute
 *     labelStyle : cjk|mark|slash, default=mark
 *     format : yymm|yymmdd|hhii|yymmddhhii, default=yymmdd
 * 	   output : string like "yymm","yymmdd hh:ii"|timestamp, default="yy-mm-dd hh:ii"
 * }
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
var $form_item_datetime = function(attrs,target){
	var ov = (attrs.value||attrs.default||"")+"";
	var d = new Date(),od;
	var output = attrs.output||'yy-mm-dd hh:ii';
	var date, vs;
	//parse original value to yyyy-mm-dd string
	if(ov.match(/^\d+$/)&&(ov.length>=9&&ov.length<=13)){
		if(ov.length<=10) ov+="000";
		// date = new Date(parseInt(ov));
		od = new Date(parseInt(ov));
		ov = od.format("YYYY-MM-DD hhh:mm");
		date = {y:od.getFullYear(),m:od.getMonth(),d:od.getDate(),h:od.getHours(),i:od.getMinutes()};
		output = 'timestamp';
	}else if(ov.length>0){
		// date = new Date(ov);
		od = new Date(ov);
		date = {y:od.getFullYear(),m:od.getMonth(),d:od.getDate(),h:od.getHours(),i:od.getMinutes()};
	}else{
		//date = new Date(d.getFullYear(),0,1,d.getHours());
		date = {y:0,m:0,d:0,h:0,i:0};
	}
	var vs = (ov.length>0)?ov.split(/[\-,\s:]+/):[d.getFullYear(),"01",'01',attrs.fromHour||("0"+d.getHours()).slice(-2),'00'];
	var style = attrs.labelStyle||'mark';
	var format = attrs.format||'yymmddhhii';
	
	//build options	
	var yy = vs[0]||d.getFullYear();vs[0]=yy;
	var mm = vs[1]||("0"+(d.getMonth()+1)).slice(-2);vs[1]=mm;
	var dd = vs[2]||'01';vs[2]=dd;
	var hh = vs[3]||'00';vs[3]=hh;
	var ii = vs[4]||'00';vs[4]=ii;

	var dx = new Date(yy,mm,0).getDate();

	var yi = attrs.fromYear || parseInt(yy)-5; 	//min year
	var yx = attrs.toYear 	|| parseInt(yy)+5;	//max year
	var years = [];
	for(var i=yi;i<=yx;i++)
		years.push(i);
	var hi = attrs.fromHour	||0;//min hour
	var hx = attrs.toHour	||23;//max hour
	// if(hi>0) date.setHours(hi);
	
	var vopts = [[yi,yx],[1,12],[1,dx],[hi,hx],[0,59]];//[yy,mm,dd,hh,ii]
	var seqs = {mark:[0,1,2,3,4],slash:[1,2,0,3,4],cjk:[0,1,2,3,4]};
	var seq = seqs[style];
	var lbs = {mark:'-- :',slash:'// :',cjk:'年月日時分'};
	var lb = lbs[style];
	var names = ['yy','mm','dd','hh','ii'];
	var values = [yy,mm,dd,hh,ii].map(function(e){var le=""+e;if(le.length<2){return '0'+e;}return e;});
	var startIdx = 'ymdhi'.indexOf(format.charAt(0));
	var size = format.length/2;

	var get_output = function(){
		if(output=='timestamp'){
			// return isNaN(date)?0:date.getTime()/1000;
			var succ = (date.y&&date.m>=0&&date.d);
			names.forEach(function(n,i){
				if(!vs[i]) succ=false;
			});
			return succ?new Date(date.y,date.m,date.d,date.h,date.i).getTime()/1000:0;
		}
		var out = output.slice();
		var succ = true;
		names.forEach(function(n,i){
			if(!vs[i]) succ=false;
			out = out.replace(n,vs[i]);
		});
		return succ ? out : 0;
	}
	//build data/labels
	var fr = $div({class:"form-item-datetime"},target);
	//var iph = $input({type:'hidden',name:attrs.name,value:ov.length>0?ov:get_output()},fr);
	var iph = $input({type:'hidden',name:attrs.name,value:output=="timestamp"?(od?od.getTime()/1000:""):ov},fr);
	var onchange=function(e){
		var t = this.attr("ymd")||this.className;
		var i = names.indexOf(t);
		//handle year/month => days
		if(t=='yy'||t=='mm'){
			//update days
			if(format.indexOf('dd')>0){
				var vt = vs.slice(0);//copy vs
				vt[i] = this.value;
				if(this.value && this.value.length>0){
					var dx = new Date(parseInt(vt[0]),parseInt(vt[1]),0).getDate();
					var sl = fr.childNodes[5], j=0;
					// if(dx)
					// while(sl.childNodes.length-1!=dx){
					// 	if(sl.childNodes.length-1<dx){
					// 		var v = sl.childNodes.length;
					// 		// $option({value:v,html:v},sl);
					// 		$li({value:v,html:v},sl);
					// 	}else//remove the last one
					// 		$.remove(sl.childNodes[sl.childNodes.length-1]);
					// }
				}
			}
			if(t=='yy') //date.setFullYear(parseInt(this.value));
				date.y = parseInt(this.value);
			else if(t=='mm') //date.setMonth(parseInt(this.value)-1);
				date.m = parseInt(this.value)-1;
		}else if(t=='dd'){
			// date.setDate(parseInt(this.value));
			date.d = parseInt(this.value);
		}else if(t=='hh'){
			// date.setHours(parseInt(this.value));
			date.h = parseInt(this.value);
		}else if(t=='ii'){
			//date.setMinutes(parseInt(this.value));
			date.i = parseInt(this.value);
		}
		//update values
		vs[i] = this.value;
		iph.value = get_output();
		iph.fire('change');
	}

	for(var i=startIdx;i<startIdx+size;i++){
		var nm = names[seq[i]];
		var step = nm=='ii' ? attrs.step||1:1;

		var d = vopts[seq[i]];
		var ops = [{value:'',label:'--',selected:ov.length==0?1:0}];
		for(var j=d[0];j<=d[1];j+=step){
			var jv = i==0?j: ("0"+j).slice(-2);
			var eq = values[seq[i]]==jv;
			if(seq[i]==4&&step>1){//step rounding problem of minute
				if(parseInt(jv) == parseInt(parseInt(values[seq[i]])/step)*step)
					eq = true;
			}
			ops.push({value:jv,label:jv,selected:ov.length>0 && eq?1:0});
		}
		var dattrs = {name:attrs.name+"-"+nm,class:nm,ymd:nm};
		if(ov&&$.isString(ov)){
			var dvs = ov.split(/[\s\-:]+/)
			if(dvs.length>3&&dvs[3]&&dvs[3].length<=1) dvs[3] = '0'+dvs[3];
			if(dvs[i]) dattrs.default = dvs[i];
		}
		$dropdown(ops,dattrs,fr).bind('change',onchange);
		if(!(lb.charAt(i)==' '&&i==startIdx+size-1))
			$span(lb.charAt(i),fr);
	}
	
	fr.getOutput=get_output;
	return fr;
}


var $form_item_yymmdd = function(attrs,target){
	attrs.format="yymmdd";
	return $form_item_datetime(attrs,target);
}
var $form_item_yymm = function(attrs,target){
	attrs.format="yymm";
	return $form_item_datetime(attrs,target);
}

var $form_item_time = function(attrs,target){
	attrs.format="hhii";
	return $form_item_datetime(attrs,target);
}


/**
 * a popup menu of radio/checkbox with many items.
 * @param  {[type]} opts   :data array
 * @param  {[type]} attrs  :{
 *         multiple : yes,
 * 		   group 	: {
						'漢字圏': '中華人民共和国,中華民国(台湾),香港',
						'ASEAN': 'インドネシア,マレーシア,フィリピン,シンガポール,タイ,ベトナム,ミャンマー,カンボジア',
					},
 * }
 * @param  {[type]} target : an element to append to
 * @return Element
 */
var $form_item_list = function(attrs,target){
	var formItem,ipt,vs=attrs.value?attrs.value.trim().split(","):[],mask,
		opts = attrs.options,
		groups = attrs.group;
	var draw_tag = function(ii){
		ii = parseInt(ii);
		var txt = opts[ii-1];
		var sp = $span({html:txt,i:ii}, formItem);
		$b({class:"cross",i:ii},sp).bind("click",function(e){
			remove_tag();
			e.preventDefault();
			e.stopPropagation();
		});
	}
	var remove_tag = function(v,withoutFire){
		var i=0,s,spans=formItem.find("span");
		for(;s=spans[i];i++){
			if(s.attr("i")==v){
				s.remove();
				break;
			}
		}
		vs.splice(i, 1);
		ipt.value=vs.join(",");
		if(!withoutFire)
			ipt.fire("change");
	}
	//click handler
	var item_clicked = function(e){
        if(this.attr("multiple")){
            var txt = this.textContent, ii = this.attr("i");
        	if(vs.indexOf(""+ii)<0){//add
        		draw_tag(ii);
				if(vs[0]=="")vs[0]=""+ii;
				else vs.push(""+ii);
				this.addClass("on");
        	}else{//remove
        		formItem.find("span",function(el){
        			if(el.attr("i")==ii+"")
        				el.remove();
        		});
        		var i = vs.indexOf(""+ii);
        		vs.splice(i,1);
        		this.removeClass("on");
        	}
        }else{//single , close
        	var txt = this.textContent, ii = this.attr("i");
        	formItem.find("span",function(el){el.remove();})
        	var sp = $span({html:txt,i:ii}, formItem);
        	$b({class:"cross",i:ii},sp).bind("click",function(e){
				var i=0,s,spans=formItem.find("span");
				for(;s=spans[i];i++){
					s.remove();
				}
				vs=[];
				ipt.value="";
				ipt.fire("change");
				e.preventDefault();
				e.stopPropagation();
			});
			vs=[""+ii];
            this.parentNode.className="fadeout";
            setTimeout(function(){
                $.remove(mask);
            },400)
        }
        ipt.value=vs.join(",");
		ipt.fire("change");
        e.preventDefault();
        e.stopPropagation();
    }
    //draw items
    var formItem = $div([
    	ipt = $input({type:"hidden",name:attrs.name,value:attrs.value,class:attrs.class||attrs.className}),
    ],target).addClass("form-item-list").bind('click',function(e){
        mask = $div({id:"mask"},document.body).bind('click',function(){
            this.remove();
        });
        var r = $.rect(this);
        vs = ipt.value.split(",");
        var ul = $ul({id:"form-item-list"},mask).css("margin-left",r.left+r.width+10+"px");
        for(var i=0,o;o=opts[i];i++){
            var li = $li({i:i+1,html:o,multiple:attrs.multiple?"yes":false},ul).bind("click",item_clicked);
            if(vs.indexOf(""+(i+1))>=0)li.addClass("on");
        }
    });
    //draw initial tags
    for(var i=0,v;v=vs[i++];){
    	draw_tag(v);
    }

	if(groups){//draw shortcut groups
		var allks = [];
		for(var k in groups)
			allks = allks.concat(groups[k].split(','));
		var gps = $sel(Object.keys(groups),{type:'checkbox',name:attrs.name+"_groups"},target);
		gps.forEach(function(el){
			el.childNodes[1].bind('change',function(e){
				var kws = [];
				var ds = target.find('input[name='+attrs.name+'_groups'+']:checked');
				for(var i=0,o;o=ds[i];i++){
					kws = kws.concat(groups[Object.keys(groups)[parseInt(o.value)-1]].split(','));
				}
				for(var j=0,o;o=allks[j];j++)
					remove_tag(o,j<allks.length-1);
				for(var j=0,o;o=kws[j];j++){
					if(vs.indexOf(o)<0){
						vs.push(o);
						draw_tag(o);
					}
				}
				ipt.value = vs.join(',');
				ipt.fire('change');
			});
		});
	}
    
    return formItem;
}

/**
 * categorized list selection
 * @param  {[type]} opts   [description]
 * @param  {[type]} attrs  [description]
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
var $form_item_tree = function(attrs, target){
	var lp,rp,tree,formItem,vals=attrs.value?JSON.parse(attrs.value):{},
		multi=Object.keys(attrs).indexOf('multiple')>=0?attrs.multiple:true,
		ipt, options = attrs.options, mask,
		groups = attrs.group;

	var draw_tag=function(i,j){
		var txt = options[parseInt(i)-1].data[parseInt(j)-1];
		if(!multi){formItem.find("span",function(el,i){$.remove(el)});}
		var sp = $span({html:txt,v:i+"."+j},formItem);
		$b({class:"cross",i:i,j:j,v:txt},sp).bind("click",function(e){
			remove_tag(this.attr("i")+"."+this.attr("j"));
			e.preventDefault();
			e.stopPropagation();
		});
	}

	var remove_tag = function(v,withoutFire){
		var i=0,s,spans=formItem.find("span");
				//v = this.attr("v"),
				//jj=this.attr("j"),ii=this.attr("i");
		if(!v)return;
		var ps = v.split(".");
		var ii=ps[0],jj=ps[1];
		//console.log(v,ii,jj,vals);
		for(;s=spans[i];i++){
			if(s.attr("v")==v){
				s.remove();
				break;
			}
		}
		var sel = vals[ii+""];//get selected
		if(!sel)return;
		var ix = sel.indexOf(""+jj);
		sel.splice(ix,1);//remove this item
		if(sel.length>0)vals[ii+""]=sel;
		else delete vals[ii+""];
		ipt.value=JSON.stringify(vals);//save value for submit
		if(ipt.value=="{}")ipt.value="";
		$.remove(mask);
		if(!withoutFire)
			ipt.fire("change");
	}

	//click handler (item)
    var item_clicked = function(e){
    	e.stopPropagation();
    	if(!multi)
    		this.parentNode.childNodes.removeClass('on');
    	this.className=this.hasClass('on')?"":"on";
    	var i = this.attr("i");
    	var j = this.attr("j");
    	var pa = $id("form_tree_category_"+i);//parent

    	//update sections
    	var sel = pa.attr("sel");//get selected
    	sel = (sel!=null&&sel!=undefined)?(sel+"").split(","):[];
    	var txt = options[i-1].data[j-1];
    	//console.log(txt,i,j,options[i-1].category)
    	var ix = sel.indexOf(""+j);//item idx inside selections
    	if(ix<0){
    		if(multi) sel.push(""+j);//add idx of this item
    		else sel[0] = ""+j;
    		draw_tag(i,j);
    	}else {
    		if(multi) sel.splice(ix,1);//remove this item
    		else sel = [];
    		//ix = txt.indexOf(options[i].data[j]);
    		//txt.splice(ix,1);
    		formItem.find("span",function(el){
    			if(el.textContent==txt)
    				el.remove();
    		})
    	}
    	if(sel.length>0)
    		pa.attr("sel",sel.join(","));//save data to category item
    	else
    		pa.removeAttribute("sel");//remove selection data
    	if(multi){
    		pa.childNodes[1].attr({"html":sel.length+"",class:sel.length>0?"on":""});//update category item badge
    		if(sel.length>0)vals[i+""]=sel;
    		else delete vals[i+""];	
    	}else{
    		vals = {};
    		vals[i+""]=sel;
    	}
    	ipt.value=JSON.stringify(vals);//save value for submit	
    	ipt.fire("change");
    	if(!multi){
    		mask.addClass("fadeout");
    		setTimeout(function(){
                $.remove(mask);
            },400)
    	}
    	//formItem.childNodes[1].textContent=txt.join(",");//update showing label
    }

    //click handler (category)
    var cat_clicked = function(e){
    	e.stopPropagation();
		this.parentNode.find("li.on",function(el,i){
    		if(multi){
    			if(!el.attr("sel")) el.className="";	
    		}else{
    			el.removeClass('on');

    		}
    	});
    	this.className='on';
    	//show items
    	rp.attr({html:"",class:""}).hide();
    	var i = this.attr("i");
    	var vs = vals[""+i]?vals[""+i]:[];
    	for(var j=0,oi;oi=options[i-1].data[j];j++){
    		$li({i:i,j:j+1,html:oi+"",class:vs.indexOf((j+1)+"")>=0?"on":""},rp).bind("click",item_clicked);
    	}
    	rp.show().attr({class:"on"})
    }

	//draw form item
	formItem = $div([
		ipt = $input({type:"hidden",name:attrs.name,value:attrs.value,class:attrs.class||attrs.className}),
	],target).addClass("form-item-tree").bind('click',function(e){
        mask = $div({id:"mask"},document.body).bind('click',function(){
            this.remove();
        });
        var dv = (this.tagName=='SPAN')?this.parentNode:this;
        vals = dv.childNodes.length>0&&dv.childNodes[0].value?JSON.parse(dv.childNodes[0].value):{};
        //console.log("vals",vals)
        var r = $.rect(this);
        tree = $div([
        	lp=$ul(), //categories
        	rp=$ol().bind("click",function(e){e.stopPropagation();}) //items
        ],mask).attr({id:"form-item-tree"}).css("margin-left",r.left+r.width+10+"px");
        var cs = Object.keys(vals);
        //draw categories
        for(var i=0,o;o=options[i];i++){
        	var ii = i+1+"";
        	var selected = cs.indexOf(ii)>=0;
            var li = $li({i:ii,html:o.category,id:"form_tree_category_"+ii, class:selected?"on":""},lp).bind("click",cat_clicked);
            $b({html:selected?vals[ii].length+"":"", class:selected?"on":""},li);
            if(selected) li.attr("sel", vals[ii].join(","));//set last value to cat item
        }
    });

    //draw init tags
    for(var i in vals){
    	if(!$.isArray(vals[i]))continue;
    	for(var k=0,j;j=vals[i][k];k++){
    		draw_tag(i,j);
    	}
    }

	if(groups){//draw shortcut groups
		var allks = [];
		for(var k in groups)
			allks = allks.concat(groups[k].split(','));
		var gps = $sel(Object.keys(groups),{type:'checkbox',name:attrs.name+"_groups"},target);
		gps.forEach(function(el){
			el.childNodes[1].bind('change',function(e){
				var kws = [];
				var ds = target.find('input[name='+attrs.name+'_groups'+']:checked');
				for(var i=0,o;o=ds[i];i++){
					kws = kws.concat(groups[Object.keys(groups)[parseInt(o.value)-1]].split(','));
				}
				for(var j=0,o;o=allks[j];j++)
					//remove_tag.call(this,this.attr("v"));
					remove_tag(o,j<allks.length-1);
				for(var j=0,o;o=kws[j];j++){
					var ps = o.split(".");
					var ii = ps[0], jj=ps[1];
					if(!(ii in vals)){
						vals[ii]=[];
					}
					if(vals[ii].indexOf(jj)<0){
						vals[ii].push(jj);
						draw_tag(ii,jj);
					}
				}
				ipt.value = JSON.stringify(vals);
				ipt.fire('change');
			});
		});
	}
    

    return formItem;
}

/**
 * calendar function
 * @param  {object} opts :
 *          x : calendar.left (float) [optional]
 *          y : calendar.top (float) [optional]
 *          style : date|datetime|time
 *          year : 2016, [optional]
 *          month : 9 [optional]
 *          dayHandler: function(y,m,d){ //day selected handler [required]
 *          	//y : 2016
 *          	//m : 10 (date.getMonth()+1)
 *          	//d : 12
 *          },
 *			monthHandler: function(y,m,monthDiff){ //month changed handler [optional]
 *          	//y : 2016
 *          	//m : 10 (date.getMonth()+1)
 *          	//monthDiff : -1 last month, 1 next month
 *          }
 * @param  {element} target : target element to append to
 * @return {element} this calendar article object
 *
 * TO hide calendar
 * $calendar().hide();
 */
var $calendar = function(opts,target){

	// var freeze = function(e){
	// 	e = e || window.event;
	// 	if(e.preventDefault)e.preventDefault();	
	// 	e.returnValue = false;  
	// }

	if(arguments.length==0)
		return {hide:function(){$.remove("#calendar");}};

	//init
	var yyyy = opts.year||new Date().getFullYear(),
		mm = opts.month||new Date().getMonth()+1,
		style = opts.style||"date",
		target = target||document.body;

	$.remove("#calendar");
	$.remove("#calendar-mask");
	var mask = $article({id:"calendar-mask"},document.body);
	var cal = $article({id:"calendar",class:"calendar-"+style,calendar_style:style},target);
	cal.attr({html:"",y:yyyy,m:mm}); //reuse
	if(opts.x)cal.css("left",opts.x+"px").attr("left",opts.x);
	if(opts.y)cal.css("top",opts.y+"px").attr("top",opts.y);

	//generate days list
	var days 	= new Date(yyyy,mm-2,0).getDate(),//days of this month
		w1 		= new Date(yyyy,mm-1,1).getDay(), //weekday of the 1st day of this month
		w$ 		= new Date(yyyy,mm-1,days).getDay(), //weekday of the last day of this month
		i 		= 1,
		dates 	= [];//arr of date

	//fill dates with days of this month
	while(i<=days)
		dates.push({year:yyyy, month:mm, day:i++});

	//fill dates with last month if 1st is not monday
	days = new Date(yyyy,mm-3,0).getDate();//days of last month
	w1 = w1==0?7:w1;
	while(1<(w1--))
		dates.unshift({year:yyyy, month:mm-1, day:days--});

	//fill dates with next month if last is not sunday
	i = 1; 
	while(w$++%7!=0)
		dates.push({year:yyyy, month:mm+1,day:i++});

	//declare elements and handlers
	var tbl = $table({},cal),
		btn_ok, btn_l, btn_r,
		col_y, col_m, col_d,
		v_y = yyyy,
		v_m = mm,
		v_d = opts.day||1,
		v_h = opts.hour||0,
		v_i = opts.minute||0;
	//declare time selection items
	var clock_frame, timelabel, ampm=opts.ampm||"am";

	var cbp_month = opts.monthHandler;
	var cbp_day = opts.dayHandler;
	var f_close = function(){
		mask.remove();
		cal.remove();
		window.onwheel = window.onmousewheel = document.onmousewheel = window.ontouchmove = document.onkeydown =null;
	}
	var f_month_changed = function(e){//month change handler, calendar view
		e = e||window.event;
		var el = e.target||e.srcElement;
		var mdiff = el.className=='left'?-1:1;
		var d = new Date(cal.attr("y"),cal.attr("m")+mdiff-1,1);
		var opt = {year:d.getFullYear(),month:d.getMonth()+1,day:v_d||1,
			monthHandler:cbp_month,dayHandler:cbp_day,style:cal.attr("calendar_style"),
			hour:parseInt(v_h)%12, minute:parseInt(v_i), ampm:ampm};
		if(cal.attr("left"))opt.x = cal.attr("left");
		if(cal.attr("top"))opt.y = cal.attr("top");
		$calendar(opt,target);
		cal.title.className="highlight";
		if(cbp_month) cbp_month(d.getFullYear(),d.getMonth()+1,mdiff);
	}
	var f_day_handler = function(e){ //date selection handler, calendar view
		if(cbp_day){
			v_y = this.attr('yy');
			v_m = this.attr('mm');
			v_d = this.attr('dd');
			cal.find("td",function(el){
				el.removeClass("on");
			})
			this.addClass("on");
			if(timelabel){
				var vs = timelabel.value.split(":");
				v_h = vs[0], v_i = vs[1];
			}
			cbp_day(v_y, v_m, v_d, v_h, v_i);
		}
		//f_close();
	};

	var f_drum = function(el){ // set y/m/d highlight for date picker drum view
		var sh = el.attr("sh")*36;
		var lastY = parseInt(el.attr("lastY"));
		var top = Math.min(sh-180,el.scrollTop);
		var r0 = top>lastY ? Math.floor(top/36):Math.ceil(top/36);
		el.attr("lastY",top);
		el.scrollTop=r0*36;
		for(var i=1;i<=el.childNodes.length;i++){
			var r = i>=r0+4?3-(i-r0-3):i-r0;
			var cls = r<=0? "":"scale"+r;
			el.childNodes[i-1].className = cls;
		}
	}

	var f_ok = function(){
		v_y = parseInt(col_y.find1st(".scale3").textContent);
		v_m = parseInt(col_m.find1st(".scale3").textContent);
		v_d = parseInt(col_d.find1st(".scale3").textContent);
		if(timelabel){
			var vs = timelabel.value.split(":");
			v_h = vs[0], v_i = vs[1];
		}
		if(cbp_day)
			cbp_day(v_y, v_m, v_d, v_h, v_i);
		f_close();
	}

	var f_arm_click = function(e){
		for(var i=0,el;el=this.parentNode.childNodes[i];i++){
			el.removeClass("on");
		}
		this.addClass("on");
		var vs = timelabel.value.split(":");
		var h = this.attr("hour"), m = this.attr("minute");
		if(h) {
			h = ampm=="am" ? h:h+12;
			vs[0] = h<10?"0"+h:(h==24?"00":h);
		}else if(m) {
			if(m==60) m=0;
			vs[1] = m<10?"0"+m:m;
		}
		timelabel.value=vs.join(":");
		v_h = vs[0], v_i = vs[1];
		if(cbp_day){
			cbp_day(v_y||yyyy, v_m||mm, v_d||1, v_h, v_i);
		}
	}
	var f_ampm_click = function(e){
		var dl = e.parentNode;
		var vs = timelabel.value.split(":");
		var h = parseInt(vs[0]);
		if(this.hasClass("am")){
			this.nextSibling.removeClass("on");
			ampm = "am";
			cal.removeClass("pm").addClass("am");
			if(h>=12)vs[0]=h-12<10?"0"+(h-12):h-12;
		}else{
			this.previousSibling.removeClass("on");
			ampm = "pm";
			cal.removeClass("am").addClass("pm");
			if(h<12)vs[0]=h+12==24?"00":h+12;
		}
		timelabel.value=vs.join(":");
		this.addClass("on");
		v_h = vs[0], v_i = vs[1];
		if(cbp_day){
			cbp_day(v_y||yyyy, v_m||mm, v_d||1, v_h, v_i);
		}
	}

	//disable scroll
	window.onwheel = window.onmousewheel = document.onmousewheel = window.ontouchmove = document.onkeydown = function(e){
		var c = $id("calendar");
		if(!c.attr("scroolY"))
			c.attr("scrollY", document.body.scrollTop);
		else{
			if(c && "scroll"!=c.attr("status")) 
				setTimeout(function(){
					if(document.body.scrollTop-c.attr("scroolY")>20)
						f_close();
					c.removeAttribute("scroolY")
				},200,c)
		}
	};

	mask.bind("click",f_close);

	//draw title line
	var draw_calendar = function(){
		var title_line = $tr($th({}),tbl);
		$th([
			cal.title = $u(yyyy+'年 '+mm+'月 ').bind('click',function(){//show year|month selection
				return;//FIXME
				cal.attr("status","scroll");
				btn_l.hide();
				btn_r.hide();
				btn_ok.show();
				var row1 = tbl.childNodes[0];
				var i = tbl.childNodes.length;
				while(1<i--){
					tbl.childNodes[tbl.childNodes.length-1].remove();
				}
				var onscroll = function(e){
					f_drum(this);
				}
				var onclick = function(e){
					if(this.className=="space")return;
					var cls = this.parentNode.className;
					var i = parseInt(this.textContent);
					this.parentNode.scrollTop = cls=="years" ? (i-1970)*36: (i-1)*36;
				}
				var ny = new Date().getFullYear(); //FIXME, let user set start/end
				$tr([
					$td({class:"space"}),
					$td([
						col_y=$ul([$li({class:"space"}),$li({class:"space"})]).attr({sh:(ny-1970)+5,class:"years"}).bind('scroll',onscroll),
						col_m=$ul([$li({class:"space"}),$li({class:"space"})]).attr({sh:12+4,class:"months"}).bind('scroll',onscroll),
						col_d=$ul([$li({class:"space"}),$li({class:"space"})]).attr({sh:31+4,class:"days"}).bind('scroll',onscroll),
					]).attr({colspan:7,class:"space"}),
					$td({class:"space"}),
				],tbl);

				//year drum
				for(var i=1970;i<=ny;i++)
					$li(i+"年",col_y).bind('click',onclick);
				$li({class:"space"},col_y);$li({class:"space"},col_y);
				col_y.scrollTop = (yyyy-1970+1)*36;

				//month drum
				for(var i=1;i<=12;i++)
					$li(i+"月",col_m).bind('click',onclick);
				$li({class:"space"},col_m);$li({class:"space"},col_m);
				col_m.scrollTop = (mm-1)*36;

				//day drum
				for(var i=1;i<=31;i++)
					$li(i+"日",col_d).bind('click',onclick);
				$li({class:"space"},col_d);$li({class:"space"},col_d);

				f_drum(col_y);
				f_drum(col_m);
				f_drum(col_d);
			}),

			btn_ok = $b({class:'check'}).bind("click",f_ok),//save btn
			$b({class:'cross'}).bind("click",f_close),//close button
			btn_r = $b({class:'right'}).bind("click",f_month_changed),//prev month
			btn_l = $b({class:'left'}).bind("click",f_month_changed),//next month
		],title_line).attr({colspan:7});
		$th({},title_line);//space holder

		var titles = "月火水木金土日";

		var grids = $tr({},tbl);
		$th({},grids);//space holder
		for(var i=0;i<7;i++)
			$th(titles.charAt(i)+"",grids);
		$th({},grids);//space holder

		//draw days
		$tr($td({colspan:9,class:"space-s"}),tbl).attr({class:"space-s"});
		var tar = $tr($td({class:"space"}),tbl);
		for(var i=0;i<dates.length;i++){
			var tar = i>0&&i%7==0 ? $tr($td({class:"space"}),tbl) : tar;
			var td = $td({html:""+dates[i].day,class:dates[i].month!=mm?"gray":'','yy':dates[i].year,'mm':dates[i].month,'dd':dates[i].day}, tar).bind("click",f_day_handler);
			if(dates[i].month==mm && dates[i].day==v_d)
				td.addClass("on");
			if(i%7==6) $td({class:"space"},tar);
		}

		$tr($td({colspan:9,class:"space"}),tbl);
		btn_ok.hide();
	}


	//hour/minute
	var draw_clock = function(){
		if(style=="datetime")
			cal.addClass("clock");
		var r=80,//hour arm radius
			R=110,//minute arm radius
			w=20,//text width,height
			ah=16,//hour arm length
			am=32;//minute arm length
		clock_frame = $div({class:"clock-frame"},cal);
		var clock = $div({id:"clock"},clock_frame).css({width:(R+w)*2+"px",height:(R+w)*2+"px",borderRadius:(R+w)+"px"});//the clock panel
		var vs=[v_h<10?"0"+v_h:v_h,v_i<10?"0"+v_i:v_i];
		timelabel = $input({value:vs.join(":"),type:"text"},clock);

		//draw hours / minutes
		for(var j=0,ra;ra=[R,r][j];j++){
			var tag 	= [window["$sub"],window["$sup"]][j];
			var step 	= [5,1][j];
			var offset 	= [0,R-r][j];
			var ar 		= [am,ah][j];
			var aw 		= [2,4][j];
			var k 		= ["minute","hour"][j];
			var fr = $div({},clock).css({top:offset+"px",left:offset+"px",width:2*(ra)+"px",height:2*(ra)+"px",borderRadius:(ra)+"px"});
			for(var i=1;i<=12;i++){
				var radian = 2*Math.PI*i/12.0-Math.PI/2,
					degree = radian*180/Math.PI;
					v = j==1||i%3==0?i*step:"-";
				if(v == 60)v=0;
				//number
				var arm = tag({html:v,class:i%3==0?"":"stick"},fr).attr(k,i*step).css({left:(Math.cos(radian)*(ra-w/2)+ra-w/2)+"px", top:(Math.sin(radian)*(ra-w/2)+ra-w/2)+"px"}).bind("click",f_arm_click);
				//arms
				$cite({},fr).css({left:(Math.cos(radian)*(ar+30-ar/2)+ra-aw/2)+"px", top:(Math.sin(radian)*(ar+30-ar/2)+ra-ar/2)+"px",width:aw+"px",height:ar+"px",transform:"rotate("+(90+degree)+"deg)"});
				if(j==0&&i%3!=0){
					arm.css({transform:"rotate("+degree+"deg)",fontSize:"12pt"})
				}
				if((j==0&&i*step==v_i)||(j==1&&i%12==v_h%12)){
					arm.addClass("on");
				}
			}
		}
		//am/pm
		var dl = $dl([
			$dd({class:"am on",html:"AM"}).bind("click",f_ampm_click),
			$dd({class:"pm",html:"PM"}).bind("click",f_ampm_click),
		],clock_frame);
		if(ampm=="pm"){
			dl.childNodes[1].fire("click")
		}
	}

	if(style.indexOf("date")>=0)
		draw_calendar();
	if(style.indexOf("time")>=0)
		draw_clock();

	return cal;
}

var str2calopt=function(v){
	var o = {};
	if(v.length>0){
		var vs=v.split(/(:|\s+|\-)/);
		var fs = ["year","-","month","-","day","-","hour","-","minute"];
		for(var i=0,f;f=fs[i];i++){
			if(vs.length<=i)return o;
			o[f]=parseInt(vs[i]);
		}
	}
	return o;
}

var $form_item_calendar = function(attrs, target){
	var vstr = attrs.value+""||"";
	if(vstr.match(/^\d+$/)&&(vstr.length>=9&&vstr.length<=13)){
		if(vstr.length<=10) vstr+="000";
		vstr = new Date(parseInt(vstr)).format("YYYY-MM-DD hh:mm");
	}
	return ipt = $input($.extend({type:"text",autocomplete:'off',value:vstr},attrs),target).addClass("form-item-calendar").bind("click",function(){
		var ipt = this;
		var rect = ipt.rect();
		var sch = $.screenHeight();
		var style = attrs.style||'date';
		var date = str2calopt(ipt.value);
		var opt = $.extend({
			x : rect.left,
			y : rect.top+rect.height+260>sch && rect.top>260?rect.top-260:rect.top+rect.height,
			style : style,
			dayHandler:function(y,m,d,H,M){
				var v = style.indexOf("date")>=0? y+"-"+(m>9?m:"0"+m)+"-"+(d>9?d:"0"+d):"";
				if(style.indexOf("time")>=0&&H!=undefined) v+= " "+H+":"+M;
				ipt.value = v;
				ipt.fire("change");
			}
		},date);
		$calendar(opt, document.body);
	})
}

/*
var $form_item_period = function(attrs, target){
	var f_show_cal = function(){
		var ipt = this;
		var rect = ipt.rect();
		var sch = $.screenHeight();
		var style = attrs.style||'date';
		var date = str2calopt(ipt.value);
		$calendar($.extend({
			x : rect.left,
			y : rect.top+rect.height+260>sch && rect.top>260?rect.top-260:rect.top+rect.height,
			style : style,
			dayHandler:function(y,m,d,H,M){
				var v = style.indexOf("date")>=0? y+"-"+(m>9?m:"0"+m)+"-"+(d>9?d:"0"+d):"";
				if(style.indexOf("time")>=0&&H!=undefined) v+= " "+H+":"+M;
				ipt.value = v;
				// ipt.value = y+"-"+(m>9?m:"0"+m)+"-"+(d>9?d:"0"+d);
				var tm = ipt.attr("time");
				var dates = [];
				ipt.parentNode.find("input[type=text]",function(el,i){
					dates.push(el.value);
				});
				ipt.parentNode.childNodes[3].value = dates.join(",")//update hidden field
				ipt.parentNode.childNodes[3].fire("change");
			}
		},date), document.body);
	};
	var orgv = attrs.value||attrs.default||"";
	var vs = (orgv.length>0)?orgv.split(","):["",""];
	for(var i=0;i<vs.length;i++){
		if(vs[i].match(/^\d+$/)&&(vs[i].length==10||vs[i].length==13)){
			if(vs[i].length==10) vs[i]+="000";
			vs[i] = new Date(parseInt(vs[i])).format("YYYY-MM-DD hh:mm");
		}
	}
	return $div([
		$input({type:"text",time:"start",autocomplete:'off',value:vs[0]},target).addClass("form-item-calendar").bind("click",f_show_cal),
		$span(" ~ "),
		$input({type:"text",time:"end",autocomplete:'off',value:vs[1]},target).addClass("form-item-calendar").bind("click",f_show_cal),
		$input($.extend({type:"hidden",value:orgv},attrs))
	],target).attr({class:"form-item-period"});
}
*/


var $form_item_period = function(attrs, target){
	var fv = this;
	var orgv = attrs.value||attrs.default||"";
	var vs = (orgv.length>0)?orgv.split(","):["",""];
	var fr = $div({class:"form-item-period"},target);
	var iph = $input({type:"hidden",value:orgv,name:attrs.name,class:"form-item-period"},fr);
	var d1 = $form_item_datetime($.extend({value:vs[0],name:attrs.name+"-from"},attrs),fr);
	$span(" ~ ", fr);
	var d2 = $form_item_datetime($.extend({value:vs[1],name:attrs.name+"-to"},attrs),fr);
	//bind onchange event
	var change = function(e){
		iph.value = d1.getOutput() + "," + d2.getOutput();
		var tvs = iph.value.split(',');
		if(fv && parseInt(tvs[0])>parseInt(tvs[1])){
			return fv.throwError(attrs.name,{"error":"start>end"});
		}
		iph.fire('change');
	}
	d1.childNodes[0].bind('change',change);
	d2.childNodes[0].bind('change',change);
	return fr;
	// return $div([
	// 	$input({type:"text",time:"start",autocomplete:'off',value:vs[0]},target).addClass("form-item-calendar").bind("click",f_show_cal),
	// 	$span(" ~ "),
	// 	$input({type:"text",time:"end",autocomplete:'off',value:vs[1]},target).addClass("form-item-calendar").bind("click",f_show_cal),
	// 	$input($.extend({type:"hidden",value:orgv},attrs))
	// ],target).attr({class:"form-item-period"});
}


/**
 * number range item
 * {
 * 	name 	: [required]
 * 	title 	: [optional]
 * 	min 	: [optional] min value of this range item
 * 	max 	: [optional] max value of this range item
 * 	step 	: [optional] step of this item, float is permitted
 * 	from 	: [optional] default value of left input
 * 	to 		: [optional] default value of right input
 * 	unit 	: [optional] unit label after number input
 * }
 */
var $form_item_range = function(attrs, target){
	var f_update = function(e){
		var mn=fr.childNodes[0],mx=fr.childNodes[3];
		if(this.attr("i")=="from" && mn.value>mx.value)mx.value=mn.value;
		if(this.attr("i")=="to" && mn.value>mx.value)mn.value=mx.value;
		fr.childNodes[5].value = mn.value+","+mx.value;
		fr.childNodes[5].fire("change");
	}
	var orgv = attrs.value||attrs.default||"";
	var vs = orgv.length>0 ? ($.isString(orgv)?orgv.split(/[,\-]/):orgv):[attrs.min||0,attrs.min||0];
	var v1 = $.isString(vs[0])&&vs[0].indexOf(".")>=0?parseFloat(vs[0]):parseInt(vs[0]);
	var v2 = $.isString(vs[1])&&vs[1].indexOf(".")>=0?parseFloat(vs[1]):parseInt(vs[1]);
	var fr = $div([
		$input({type:"number",i:"from",step:(attrs.step||1),min:(attrs.min||0),max:(attrs.max||Number.MAX_VALUE),value:(v1||0)},target).bind("keyup",f_update).bind("click",f_update),
		$span(attrs.unit||""),
		$span(" ~ "),
		$input({type:"number",i:"to",step:(attrs.step||1),min:(attrs.min||0),max:(attrs.max||Number.MAX_VALUE),value:(v2||0)},target).bind("keyup",f_update).bind("click",f_update),
		$span(attrs.unit||""),
		$input($.extend({type:"hidden",value:orgv},attrs))
	],target).attr({class:"form-item-range"});
	return fr;
}


/**
 * @param {string} 	opt.url		: [required] the api url
 *                           IMPORTANT !!! : the response data must be sth like this
 *                           {
 *                           	total:number
 *                           	data:[{},{},...]
 *                           }
 * @param {array} 	opt.items 	: [optional] instead of using url, you can specify the item list directly
 * @param {int} 	opt.perpage	: [optional]
 * @param {str|obj} opt.query 	: [optional]
 * @param {array} 	opt.fields 	: [optional] columns to show for each item.
 *                             A) [{name:fieldname1, title:title1, sortable:true}, {name:fieldname2, title:title2},...]
 *                             OR B) [fieldname1, fieldname2 ...]
 *                             with A): name=db field name, title=th innerHTML, sortable:default false where this column is sortable
 * @param {array}	opt.tags : [optional]HTML tags, default ['table','tr','th','td']
 * @param {bool} 	opt.append 	: [optional][default=false] whether the items of the next page should append to the end of this one.
 * @param {bool} 	opt.renderHTML : [optional] default:true, if its false, then ListView won't draw tr-td before it calls drawItem delegate function.
 * @param {string} 	opt.pageType : [optional] navi|number|none, default=number, navi=prev/next, number=1...N, none=no page btns
 * @param {array} 	opt.pageLabels :[optional] for pageType=navi only, default = ["< previous", "next >"];
 * @param {int} 	opt.pageSize :[optional] an odd number, page button numbers 1...N default=13
 * @param {string} 	opt.sortKey : [required]
 * @param {string} 	opt.sortOrder : [optional] asc|desc
 * @param {func} 	opt.drawItem : [optional] function(rowElement, item, i){}, custom item rendering, once its declared, the default drawing process will NOT exec
 * @param {func} 	opt.onLoading : [optional] function(params){}, show loading indicator, params=this.query, also you can modify params by @return params
 * @param {func} 	opt.onLoaded : [optional] function(res){}, fired when ajax load successed, you can modify the response by @return res
 * @param {func} 	opt.onError	: [optional] function(){}, fired when ajax error
 * @param {func} 	opt.onEmpty	: [optional] function(){}, fired when data from server is empty
 * @param {func} 	opt.onLastPage	: [optional] function(){}, fired when its the last page.
 * @param {func} 	opt.onSelect	: [optional] function(){}, fired when a single row is selected.
 * @param  {object} delegate [optional] delegate which responses to these delegate methods 
 *                  delegate.drawListItem : alternative to opt.drawItem,
 *                  delegate.onListLoading : alternative to opt.onLoading,
 *                  delegate.onListLoaded : alternative to opt.onLoaded,
 *                  delegate.onListError : alternative to opt.onError,
 *                  delegate.onListEmpty : alternative to opt.onEmpty,
 *                  delegate.onListLastPage : alternative to opt.onLastPage,
 *                  delegate.onListSelect : alternative to opt.onSelect
 *                  delegate.onListCheched : for list_item_checkbox only
 * @param {element} target : [requied]
 * @return {ListView} a ListView instance
 *          public function update(query)
 *          public function dom() return the table element
 *          public funciton cursor() return current start/end idx
 *          public function data() return table data list (got from api server)
 *          public function data(N) return the Nth data of the tale (got from api server)
 *          public function checked() return all checked item's value list (list_item_checkbox is required)
 *
 * @example : init
 *          $this.list = $list_view({url:"/api/users", sortKey:"id"}, $this.layer, $this.footer);//result MUST be saved as view's property or global var.
 * @example : search
 *          $this.list.update({keyword:"my keyword"})
 * @example : sort (automatic with header click event)
 * 
 * @example : paginate (automatic with .drawPages -> page click event)
 */
function $list_view(opt, target, pageTarget){
	var list = new ListView(opt,target,pageTarget);
	/*======== main process ========*/
	list.update.call(list);
	return list;
}

function ListView(opt,target,pageTarget){
	/*======== init ========*/
	var me = this;

	/*======== private properties ========*/
	var tags = opt.tags||['table','tr','th','td'];
	var table = $e(tags[0],{class:"list-view"},target);
	var items = opt.items||[]; //item list from api server.
	var perpage = opt.perpage||10;
	var cursors = [0,perpage]; //start/end item index.
	var url = this.url = opt.url;
	var append = ('append' in opt)?opt.append:false;
	var query = opt.query||{};
	var sortKey = opt.sortKey;
	var sortOrder = opt.sortOrder||"asc";
	var fields = opt.fields;
	var total = 0;
	var pageStyle = opt.pageStyle||"number";
	var pageSize = opt.pageSize||13;
	var pageLabels = opt.pageLabels||["< previous", "next >"];
	var delegate = opt.delegate||{};
	var renderHTML = 'renderHTML' in opt? opt.renderHTML : true;
	var drawItem = opt.drawItem ||delegate.drawListItem;
	var onLoading = opt.onLoading||delegate.onListLoading;
	var onLoaded = opt.onLoaded||delegate.onListLoaded;
	var onError = opt.onError||delegate.onListError;
	var onEmpty = opt.onEmpty||delegate.onListEmpty;
	var onLastPage = opt.onLastPage||delegate.onListLastPage;
	var onSelectFunc = opt.onSelect||delegate.onListSelect;
	var onSelect;
	var wrappers = [];//cell rendering wrapper function list
	var wrapperArgs = [];//cell rendering parameters (array)
	this.page = 1;
	this.perpage = perpage;
	this.delegate = delegate;
	for(var i=0,f;f=fields[i];i++){
		wrappers[i] = ($.isObject(f)&&f.wrapper&&$.isFunc(window["$list_item_"+f.wrapper]))?window["$list_item_"+f.wrapper]:false;
		wrapperArgs[i] = $.isArray(f.args)?f.args:(f.args?[f.args]:[]);
	}
	if(!query.limit)query.limit=perpage;
	if(sortKey)query.order = sortKey+(sortOrder=="desc"?" desc":"");
	if(onSelectFunc)
		onSelect = function(e){
			onSelectFunc.call(this,e,this.attr("i"));
		}

	/*======== public methods ========*/

	/**
	 * update table contents, such as search, refresh, pagination, sort
	 * @param  {bool} clearBeforeDrawing : whether listview should clear contents before drawing items, default=true
	 * @return null
	 */
	this.update = function(queryObj){
		if(queryObj){//update query
			query={};
			for(var k in queryObj){
				var v = queryObj[k];
				if($.isFunc(v))continue;
				if(v===null||v==="") delete query[k];
				else query[k] = v;
			}
			query.limit="0,"+perpage;
			me.page = 1;
		}
		if(onLoading){//user can show loading indicator at this timing.
			var q = onLoading.call(me,query);
			if(q) query = q;
		}
		if(url)
		$http.get(url, query, function(res, err){
			console.log("list res:",res)
			if(!append) table.innerHTML="";
			if(err){//error
				console.log("list errr:",err)
				if(onError)onError.call(me,err);
			}else if(!res || !res.total || !res.data || res.data.length==0){//empty
				console.log("list empty:")
				total = 0;
				items = [];
				var em = drawEmpty();
				if(onEmpty)onEmpty.call(me, em);
			}else{
				total = res.total;
				if(append){
					items.concat(res.data)
				}else
					items = res.data;
				console.log("list res:",items)
				if(onLoaded){//user can custom response at this moment.
					var r = onLoaded.call(me,res);
					if(r) res = r;
				}
				cursors[0] = items&&items.length>0? items[0][sortKey]:0;
				cursors[1] = items&&items.length>1? items.last()[sortKey]:0;
				if(!fields) fields = Object.keys(items[0]);
				table.innerHTML="";
				drawHeader();
				drawItems();
			}
		});
		else if(items&&items.length>0){
			if(!fields) fields = Object.keys(items[0]);
			table.innerHTML="";
			drawHeader();
			drawItems();
		}
		return me;
	}

	this.dom = function(){return table};
	this.target = function(){return target;}
	this.pageTarget = function(){return pageTarget;}
	this.cursor = function(){
		var s=(me.page-1)*perpage;
		return [s, Math.min(total,s+Math.min(perpage,items.length))];
	}
	this.data = function(i){return arguments.length==0?items:items[parseInt(i)];}
	this.total = function(){return total;}
	this.setFields = function(fs){fields = fs;}

	/*======== private methods ========*/

	var drawHeader = function(){
		//draw header
		var row;
		if(table.childNodes.length==0){//draw header
			row = $e(tags[1],{},table);
			for(var i=0,f;f=fields[i];i++){
				var k=$.isObject(f)?f.name:f;
				var hc = $e(tags[2],{html:f.title, key:k, class:k==sortKey&&'checkbox'!=f.wrapper?sortOrder+" on":(f.sortable===true?sortOrder:"none"), order:sortOrder},row);
				if(wrappers[i]){
					var args = wrapperArgs[i].slice();
					args.unshift($.isObject(f)?f.name:"");
					args.unshift(null);
					args.unshift(hc);
					wrappers[i].apply(me,args);
					hc.addClass("list-view-"+f.wrapper);
				}
				if(f.sortable===true)
					hc.bind('click',function(){
						sort.call(me,this.attr('key'),sortKey==this.attr('key')&&this.attr("order")=='asc'?'desc':'asc');
					});
			}
			if(drawItem) //if delegate, use delegate.
				drawItem(row, null, -1);
		}
	}

	var drawItems = function(){
		//draw items
		
		for(var i=append?cursors[0]:0,o;o=items[i];i++){
			if((!append&&i>=perpage)||(append&&i>=perpage+cursors[0]))break; //page over
			var row;
			if(renderHTML) row = $e(tags[1],{i:i},table);
			for(var j=0,f;f=fields[j];j++){
				var k=$.isObject(f)?(f.name||f.wrapper):f;
				var v=o[k];
				var cell = renderHTML ? $e(tags[3],{i:i,html:v,class:'item-view-'+k},row):false;
				if(wrappers[j]){
					var args = wrapperArgs[j].slice();
					args.unshift($.isObject(f)?f.name:"");
					args.unshift(v==undefined?i:v);
					args.unshift(cell);
					args.push(f);
					var nv = wrappers[j].apply(me,args);
					if(renderHTML)cell.addClass("list-view-"+f.wrapper);
					else o[k] = nv;
				}
			}
			if(drawItem) //if delegate, use delegate.
				row = drawItem(row, o, i);
			if(row && onSelect)
				row.bind("click",onSelect);
		}
		//draw pages
		if(pageStyle!="none")
			drawPages(pageTarget||$e(tags[3],{colspan:fields.length},$e(tags[1],{},table)));
	}

	var drawEmpty = function(){
		table.addClass("empty");
		return $tr($td($h2('@list_view.empty')), table);
	}

	/**
	 * draw page indexes
	 * @param  {type} target 
	 * @return {[type]}        [description]
	 */
	var drawPages = function(target){
		if(!target)return;
		var page 	= me.page||1,
			ptotal 	= Math.ceil(total/perpage),
			size 	= Math.min(ptotal, Math.max(7,pageSize)),
			pages 	= [page];
		//pagenation function
		var paginate = function(){
			var page = this.attr("page");//"+1":next page, "-1":previous page, int: page num
			if(page==="+1"||page==="-1"){//next | prev
				var k = sortKey+"@"+(((page==="+1"&&sortKey=="asc")||(page==="-1"&&sortKey=="desc"))?"gt":"lt");
				me.page = me.page||0;
				var v = page==="-1"?me.page-1:me.page+1;
				v = Math.min(ptotal,Math.max(0,v));
				me.page = v;
				query[k] = v;
				query.limit = `${v*perpage},${perpage}`;
				console.log(query);
				me.update.call(me);
			}else if($.isNumber(page)){//page number
				if(this.className=="on")return;
				query.limit = Math.max(0,page-1)*perpage+","+perpage;
				me.page = page;
				me.update.call(me);
			}
		}

		var exists = target.find1st(".list-view-pages");
		if(exists) $.remove(exists);

		//navi mode
		if(pageStyle=="navi"){//prev|next
			return $dl([
				$dd({html:pageLabels[0],page:"-1"}).bind('click',paginate),
				$dd({html:pageLabels[1],page:"+1"}).bind('click',paginate),
			],target).attr({class:"list-view-pages"});
		}

		//get page num list
		// var total = 220,perpage=22,pageSize=10,me={page:4};
		
		if(ptotal>size){
			var seg = size%2==0?size+1:size;
			for (var i=1;pages.length<seg;i++){
				if(page-i>=1)pages.unshift(page-i);
				if(page+i<=ptotal)pages.push(page+i);
			}
			if(pages[pages.length-1]<=ptotal-1)
				pages=pages.slice(0,pages.length-2).concat([0,ptotal]);
			if(pages[0]>=2)
				pages=[1,0].concat(pages.slice(2,pages.length));
		}else{
			pages = [];
			for(var i=1;i<=ptotal;i++)
				if(pages.indexOf(i)<0)
					pages.push(i);
		}
		// console.log(pages);

		//draw pages
		var dl = $dl({class:"list-view-pages"},target);
		for(var i=0;i<pages.length;i++){
			var p = pages[i];
			var dd = $dd({page:p,html:p==0?"...":p+"",class:p==page?"on":""},dl);
			if(p!=0) dd.bind("click",paginate);
		}
	}

	/**
	 * sort functoin
	 * @param  {string} field 
	 * @param  {string} order asc|desc
	 */
	var sort = function(field, order){
		sortKey = field;
		sortOrder = order;
		me.page = 1;
		query.limit = "0,"+perpage;
		query.order = field+" "+order;
		me.update.call(me);
	}

}

/**
 * listview checkbox item
 * @param  {element} cell : the cell dom element
 * @param  {int/string} id : item (the data of this row) id
 * @return {string} 
 */
function $list_item_checkbox(cell, idx){
	var listview = this;
	cell.innerHTML="";
	if(listview) listview.checkedList = listview.checkedList||[];
	var o = listview?listview.data(idx)||{}:{};
	var checked = (!listview.checkedAll && listview.checkedList.indexOf(o.id)>=0)||(listview.checkedAll && listview.checkedList.indexOf(o.id)<0)?'checked':false;
	$label([
		$input({type:"checkbox",value:(idx==null?"all":o.id),checked:checked})
	],cell).bind("click",function(e){
		e.stopPropagation();
		var el = (this.tagName=="LABEL")?this.childNodes[0]:this;
		if(el.value=="all"){//header clicked
			var tbl = el;
			while (tbl.tagName!="TABLE")
				tbl = tbl.parentNode;
			if(el.checked){
				tbl.find("input[type=checkbox]").attr("checked",true);
			} else {
				tbl.find("input[type=checkbox]").attr("checked",false);
			}
			listview.checkedList = [];
			listview.checkedAll = el.checked?true:false;
		}else{//check one
			var isPush = (el.checked&&!listview.checkedAll)||(!el.checked&&listview.checkedAll); 
			if(isPush){
				listview.checkedList.push(el.value);
			}else{
				listview.checkedList = listview.checkedList.filter(function(n){return n!=el.value});
			}
		}
		if(listview && listview.delegate && listview.delegate.onListChecked){
			//trigger the delegate method
			listview.delegate.onListChecked.call(listview, listview.checkedList);
		}
		// console.log(listview.checked())
	});
}

/**
 * listview checkbox item
 * @param  {element} cell : the cell dom element
 * @param  {int/string} id : item (the data of this row) id
 * @return {string} 
 */
function $list_item_time2date(cell, v, field, format){
	if($.isNumber(v))
		cell.innerHTML = new Date(v).format(format);
}


/**
 * draw side menu
 * @param  {array} 	opt.items  [required] item list [{
 *                            title:[required] menu item label,
 *                            class:[optional] menu item class,
 *                            url:[optional] menu item url/href/liber view name,
 *                            action:[optional] menu item click function
 *                            items:[{
 *                            	title:[required] menu sub item label,
 *                            	class:[optional] menu sub item class,
 *                            	url:[optional] menu sub item url,
 *                            	action:[optional] menu sub item click function
 *                            },...]},...]
 * @param  {func} 	opt.drawItem(el,i,j)  [optional] el:dom of this item, i:items index 1,header is -1, j:item index 2
 * @param  {func} 	opt.selectItem(el,i,j)  [optional] el:dom of selected item, i:items index 1,header is -1, j:item index 2
 * @param  {array} 	opt.default  [optional] default clicked menu index array. default [0,0] means i=0,j=0
 * @param  {object} delegate [optional] : a delegate object responses to these methods
 *                  delegate.drawSidemenuItem : alternative to opt.drawItem
 *                  delegate.selectSidemenuItem : alternative to opt.selectItem
 * @param  {element} target [required] target to append to
 * @return {SideMenu}
 *         public function dom() return the DL element.
 *         public function draw()
 *         public function update(newItems) //redraw the menu again with new items
 *         public function collapse()
 *         public function expand()
 *         public function selected() //selected item index array
 */
function $sidemenu(opt,target,menuButtnTarget){
	var m = new SideMenu(opt,target,menuButtnTarget);
	return m.draw();
}

function SideMenu(opt,target,menuButtnTarget){
	var me = this;
	var items = opt.items;
	var menu, btn;

	var selection = opt.default||[0,0];
	var delegate = opt.delegate||{};
	var drawItem = opt.drawItem||delegate.drawSidemenuItem;
	var selItem = opt.selectItem||delegate.selectSidemenuItem;

	/*======== public methods ========*/
	this.draw = function(){
		$.remove($this?$this.layer.find1st("#sidemenu"):$id("sidemenu"));
		$.remove($this?$this.layer.find1st("#sidemenu-button"):$id("sidemenu-button"));
		menu = $aside({id:"sidemenu"});
		target.insertBefore(menu, target.firstChild);//menu will be always insert as the first child
		//menu header
		var hd = $details($summary({i:-1}),menu);
		if(drawItem)drawItem.call(me,hd,-1);
		if(selItem)hd.bind("click",function(e){
			selItem.call(this,e);
		})
		var def = opt.default||getFocusItemWithUrl()||[0,0];
		selection=def;
		//item select handler
		var onsel = function(e){
			highlightItem(this);
			var on=$this.opener?$this.opener.name:"";
			var vn=this.attr("name");
			if(vn==on && $this.isPopup){
				$this.close();
			}else
				$app.openView(vn);
		};
		//draw items
		for(var i=0,o;o=items[i];i++){
			var dl = $details({class:i==def[0]?"on":""},menu);
			var dt = $summary({html:o.title,class:o.class,name:o.url,i:i,j:-1}, dl).bind("click",onsel);
			if(drawItem)drawItem.call(me,dt,i);
			var fireTarget = i==def[0] ? dt:null;
			if(def[0]==i)dt.addClass("on");
			if(o.items){
				for(var j=0,t;t=o.items[j];j++){
					var dd = $p({html:t.title,name:t.url,class:t.class||"",i:i,j:j},dl).bind("click",onsel);
					if(drawItem)drawItem.call(me,dd,i,j);
					if(def.length==2 && i==def[0] && j==def[1]){
						fireTarget=dd;
					}
				}
			}
			//if(fireTarget) fireTarget.fire("click");
			if(fireTarget) highlightItem(fireTarget);
		}
		//draw menu button
		btn = $i({id:"sidemenu-button",class:'btn menu'},menuButtnTarget||target).bind("click",function(e){
			var r = $.rect(menu);
			if(r.left<0){//is hidden
				me.show();
			}else{//is shown
				me.hide();
			}
		});
		return me;
	}
	this.update = function(newItems){
		if(menu)menu.remove();
		if(newItems)items=newItems;
		this.draw();
		this.show();
		return me;
	}
	this.show = function(){
		$this.layer.addClass("sidemenu");
		menu.addClass("on");
		btn.addClass("on");
		return me;
	}

	this.hide = function(){
		$this.layer.removeClass("sidemenu");
		menu.removeClass("on");
		btn.removeClass("on");
		return me;
	}

	this.collapse = function(){
		menu.find("summary",function(el){el.addClass("on")});
		return me;
	}

	this.expand = function(){
		menu.find("summary",function(el){el.removeClass("on")});
		return me;
	}
	this.dom = function(){return menu}
	this.selected = function(){return selection;}
	/*======== private methods ========*/
	var highlightItem = function(item){
		var ii=item.attr("i"),
			jj=item.attr("j");
		selection=[ii,jj];
		menu.find("p",function(dd){dd.removeClass("on");});
		item.parentNode.find(item.tagName.toLowerCase(),function(el,i){
			if(ii==el.attr("i") && jj==el.attr("j")){
				el.addClass("on");
				// if(el.nextSibling && el.nextSibling.tagName=="DL"){
				// 	if(el.nextSibling.childNodes.length>0)
				// 		el.nextSibling.childNodes[0].fire("click");
				// }
			}
			else el.removeClass("on");
		});
		//console.log(jj, this.nextSibling)
		if((jj==-1 && (!item.nextSibling || item.nextSibling.tagName!="DL"))
			|| jj>=0){
			if(selItem) selItem.call(item,ii,jj);
		}
	}
	var getFocusItemWithUrl = function(){//get focus cursor with current url
		var n = window.location.hash;
		if(!n || n.length<=0 || !items)return false;
		n = n.replace("#","");
		for(var i=0,o;o=items[i];i++){
			if(o.url==n){
				return [i,-1];
			}else if(!$.empty(o.items)){
				for(var j=0,p;p=o.items[j];j++){
					if(p.url==n){
						return [i,j];
					}
				}
			}
		}
	}

	return me;
}


/**
 * detail view element
 * @param  Object opt :
 *         scheme|schema : [required][string] db scheme name of the table
 *         items : [required][array] detail view item list,
 *         		detail view item properties {
 *         			name : [required][string] : property name
 *         		    title : [optional][string] the title of this item
 *         		    wrapper : wrapper function name : 'common' means the function names $detail_item_common()
 *         		   	required : [optional][bool] default =false, whether the item is required in the form view
 *         		}
 *         data : [optional][object] value of the data
 *         drawItem : [optional][function] a function to custom drawing of a certain item. drawItem(rowDom,o) //o is item def
 *         delegate : [optional] delegate object responses to these methods
 *         		delegate.drawDetailItem: alternative to opt.drawItem,
 *
 * @param  Element target : element object to append to
 * @return DetailView instance
 *         public function dom() : return an ul element
 *         public function draw() : draw the detail view
 */

function $detail_view(opt, target){
	var detail = new DetailView(opt,target);
	detail.draw.call(detail);
	return detail;
}

function DetailView(opt, target){
	/*======== init ========*/
	var me = this;

	this.scheme = opt.scheme||opt.schema;
	if(!this.scheme){
		console.log("$detail_view WARN : no scheme name");
	}

	/*======== private properties ========*/
	var delegate = opt.delegate||{};
	var drawItem = opt.drawItem||delegate.drawDetailItem;

	var detail;
	var data = opt.data||{};

	/*======== public methods ========*/
	this.dom = function(){return detail}

	this.draw = function(){
		if(v_items)v_items.remove();
		detail = $div({class:"detail-view"},target);
		var v_items = $ul({},detail);
		for(var i=0,o;o=opt.items[i];i++){
			if($.isObject(o)){
				if($.isArray(o.items)){
					var v_item = $li({type:"multiple"},v_items);
					var tr = $tr({},$table({},v_item));
					for(var j=0,oi;oi=o.items[j];j++){
						draw_item(oi,$td({name:oi.name,"class":o.required?"required":""},tr));
						if(j<o.items.length-1){
							$td({class:'space'},tr);//add place holder
						}
					}
				}else{
					if($.isElement(o)){
						var el = $li(o,v_items);
						draw_item(o,el);
					}else{
						var v_item = $li({name:o.name,"class":o.required?"required":""},v_items);
						draw_item(o,v_item);
					}
				}
			}else{
				console.log("$detail_view WARN : SKIP ",o);
			}
		}
		return me;
	};

	var draw_item = function(o,v_item){
		//draw title
		if(o.title) $h4(o.title,v_item);

		var val = data[o.name] || "";
		var v_cell = $div($.extend({class:'detail-item'},o),v_item);
		var vp = $p({html:val},v_cell);

		if(o.wrapper){//custom drawings
			var func = window["$detail_item_"+o.wrapper];
			if($.isFunc(func)){
				func.call(me, vp, val, o.name);
			}
		}
		if(drawItem)drawItem(v_item, o);
	}
}



/**
 * tabmenu element
 * @param  Object opt :
 *         items : [required][array] form item list,
 *         		tab item defination {
 *         			name : [required][string] : property name
 *         		    title : [optional][string] the title of this item
 *         		}
 *         cursor : [optional][int] a index number, specify the tab idx to be focused on.
 *         onSwitch : [required][function] a callback function when tab switched
 *         delegate : [optional] delegate object responses to these methods
 *         		delegate.onTabSwitch: alternative to opt.onSwitch,
 *         className : [optional][string] add class name (same level of 'tab-menu' class)
 *
 * @param  Element target : element object to append to
 * @return DetailView instance
 *         public function dom() : return an ul element
 *         public function draw() : draw the form
 */

function $tab_menu(opt, target, container){
	var tabs = new TabMenu(opt,target);
	tabs.draw.call(tabs);
	return tabs;
}

function TabMenu(opt, target){
	/*======== init ========*/
	var me = this;

	var delegate = opt.delegate||{};
	var onSwitch = opt.onSwitch||delegate.onTabSwitch;
	if(!onSwitch){
		console.log("$tab_menu ERROR: no onSwitch callback");
	}

	/*======== private properties ========*/
	var v_tabs;
	var cursor = opt.cursor||-1;

	/*======== public methods ========*/
	this.dom = function(){return v_tabs}

	//this.tab = function(){return cursor;}

	this.draw = function(){
		if(v_tabs)v_tabs.remove();
		v_tabs = $dl({class:"ui-tab-menu"},target);
		if (opt.style) v_tabs.addClass(opt.style);

		for(var i=0,o;o=opt.items[i];i++){
			if(typeof(o)!=="object" || !o.name){
				console.log("$tab_menu WARN: skip:",o);
				continue;
			}
			var v_tab = $dd({name:o.name,html:o.title||o.name,"class":"tab-menu-item-"+o.name,i:i},v_tabs);
			if(o.class)v_tab.addClass(o.class);
			if(i==cursor){
				v_tab.addClass("on");
			}
			v_tab.bind("click",function(e){
				v_tabs.find("dd").removeClass("on");
				this.addClass("on");
	//			cursor = parseInt(this.attr("i"));
				if(onSwitch) onSwitch.call(me,this.attr("name"),this.attr("i"));
			});
		}

		if(cursor>=0)
		setTimeout(function(){
			me.switch(cursor);
		},100);
		return me;
	};

	this.switch = function(i){
		//console.log("v_tabs",v_tabs)
		if(i>=0&&i!=cursor)
		for(var j=0,d;d=v_tabs.childNodes[j];j++){
			if(j==i){
				return d.fire("click");
			}
		}
	}

	/**
	 * add tab to tabmenu
	 * @param {[type]} i : [int] tab index 0~N,N<=tab length
	 * @param {[type]} o : [string | function(dom)]
	 *   [o=string] : view name , an instance of $tab_view (or derived from $tab_view)
	 *   [o=function] : function(i) use 'this' to access this Tabmenu instance.
	 *   o.name : 
	 *   o.title : 
	 *
	 */
	this.addTab = function(i,o){
		i = Math.min(i,v_tabs.childNodes.length);

		var v_tab = $dd({name:o.name,html:o.title||o.name,"class":"tab-menu-item-"+o.name,i:i})
		.bind("click",function(e){
			v_tabs.childNodes.removeClass("on");
			this.addClass("on");
			if(onSwitch) onSwitch.call(me,this.attr("name"),this.attr("i"));
		});

		//add cross btn
		$b({i:i},v_tab).bind('click',function(e){
			e = e || window.event;
			e.stopPropagation();
			me.removeTab(parseInt(this.attr("i")));
		})

		//do insert | append
		if(i>=v_tabs.childNodes.length){
			v_tabs.appendChild(v_tab);
		}else{
			v_tab.left(v_tabs.childNodes[i]);
		}

		//reset i
		v_tabs.find('dd',function(el,ii){
			el.attr({i:ii}); //adjust the indexes
		});

		//notice the delegate
		v_tab.fire('click');
	}

	this.removeTab = function(i){
		if(i<v_tabs.childNodes.length) {
			$.remove(v_tabs.childNodes[i]);
			v_tabs.find('dd',function(el,ii){
				el.attr({i:ii});
				var b = el.find1st('b');
				if(b)b.attr({i:ii});
			});
			var t = v_tabs.childNodes[0];
			if(t) t.fire('click');
		}
	}
}


/**
 * [$popup description]
 * @param  {[HTML string|Element|Array|function]} content [description] , as same as $e()
 * @return {Popup}
 */
function $popup(content,manuallyClose,additionalClassNames){
	var p = new Popup(content,manuallyClose,additionalClassNames);
	p.draw.call(p);
	return p;
}

function Popup(content,manuallyClose,additionalClassNames){
	var mask;
	var panel;
	var me = this;
	this.draw = function(){
		mask = $article({id:"mask"},document.body);
		if(!manuallyClose)mask.bind('click',function(e){me.close()});
		panel = $section(content,mask).attr('class','popup'+(additionalClassNames?` ${additionalClassNames}`:'')).bind('click',function(e){e.stopPropagation()});
	};
	this.dom = function(){return panel;}
	this.close = function(){
		let ips = document.body.find('#form-item-autocomplete');
		if(ips){
			$.remove(ips[ips.length-1]);
		}
		$.remove(mask);
	}
}


var $alert=function(title, desc, btnLabel, onclose){
    var p = $popup([
        $header($h2(title)),
        $p(desc||""),
        $footer([
            $button(btnLabel||'OK').bind('click',function(){
				p.close()
				if(onclose)onclose();
			}),
        ])
	]);
	p.dom().addClass("popup-confirm")
	p.dom().parentNode.addClass("center-layout");
}

var $confirm=function(callback, title, body, btnLabel1, btnLabel2){
	document.body.find(".popup-confirm").remove();
	var popup = $popup([
		$header($h2(title)),
		$p(body||""),
		$footer([
			$button({html:btnLabel1||'OK',class:'red'}).bind('click', function(e) {
				if (callback) callback(true);
				popup.close();
			}),
			$button({html:btnLabel2||'Cancel',class:'light'}).bind('click', function(e) {
				if (callback) callback(false);
				popup.close();
			}),
		])
	]);
	popup.dom().addClass("popup-confirm");
	popup.dom().parentNode.addClass("center-layout");
}

/**
 * @param opts: array of list items
 * @param attrs: Element attrs
 * 		.multiple: multiple selection
 * 		.default : default value
 * 		.value : value
 * 		.onSelect: function (e, i)
 * @method setLabel(label) : set txt inside selectbox
 */
var $dropdown = function(opts,attrs,tar){
	var lb,def=attrs.value||attrs.default;
	var onSelect = attrs.onSelect;
	opts = opts? opts.map((e,i)=>{
		if($.isObject(e)){
			if(def==e.value)lb=e.label+"";
			return e;
		}else{
			if(def==i+1)lb=e+"";
			return {label:e,value:i+1}
		}
	}) : [];
	var max=0; 
	var widthKey = attrs.flex?"width":"minWidth";
	opts.forEach(e=>{max=Math.max(e.label.length,max)});
	var multi=attrs.multiple?1:0,ma,ul,ip,
		dr = $div([
		$label(lb||" "),
		ip = $input({type:'hidden',name:attrs.name,value:def||'',class:attrs.class||''})
	],tar).attr({class:'ui-dropdown'+(lb?' on':''),max:max})
	dr.style[widthKey]=(max*12)+24+'px';
	dr.bind('click',function(e){
		e.stopPropagation();
		$.remove(ma);
		ma=$article({id:'mask',class:'transparent'},document.body).bind('click',function(e){
			this.remove();
		});	
		let r = this.rect();
		let top = window.outerHeight-r.top-r.height <= 190 ? r.top-190 : r.top+r.height;
		ul = $ul({class:'ui-dropdown-opts'},ma).css({top:top+'px',left:r.left+'px',height:32*Math.min(5,opts.length)+'px'})
		ul.style[widthKey]=r.width+'px';
		for(var o of opts){
			$li({html:o.label,value:o.value,class:o.class||''},ul).bind('click',sel)
		}
	});
	if(attrs.class) dr.addClass(attrs.class);
	var sel = function(e){
		var v = this.attr("value"), lb=this.innerHTML;
		if(onSelect && !onSelect.call(this,e))return false;
		if(multi){
			var vs = ip.value.length?ip.value.split(','):[];
			var lbs = ip.labels?ip.labels.split(','):[];
			var i = !v||v==''?-1:vs.indexOf(v+'');
			if(i>=0) {
				vs.splice(i,1);
				lbs.splice(i,1);
				this.removeClass('on')
			}else{
				if(v>0||`${v}`.length){
					vs.push(v)
					lbs.push(this.innerHTML)	
				}
				this.addClass('on')
			}
			ip.value = vs.join(',');
			ip.fire("change");
			lb = lbs.join(',');
			ip.attr("labels",lb)
		}else{
			ip.value = v;
			ip.fire("change");
			$.remove(ma);
		}
		dr.firstChild.innerHTML=lb;
		if(v>0||`${v}`.length) dr.addClass('on');
		else dr.removeClass('on');
	}
	this.setLabel = function(label){
		if(dr&&dr.firstChild)
			dr.firstChild.innerHTML=label;
	}
	return ip;
}

var $menu = function(opts,attrs,tar,onChange){
	opts = opts? opts.map(e=>$.isObject(e)?e:{label:e}) : [];
	if(!opts.length)return;
	var max=0; 
	opts.forEach(e=>{max=Math.max(e.label.length,max)});
	var i=0;
	if('value' in attrs || 'default' in attrs){
		i = (attrs.value || attrs.default);
		if(i>0)i=i-1;
	}
	var ma,ul,bt=$button(attrs,tar).attr({class:'ui-menu',html:opts[i].label}).bind('click',function(e){
		$.remove(ma);
		ma=$article({id:'mask'},document.body).bind('click',function(e){
			this.remove();
		});	
		let r = this.rect(), w=max*14;
		let top = window.outerHeight-r.top-r.height <= 190 ? r.top-190 : r.top+r.height+10;
		let left = $.screenWidth()-r.left-w<=16?'auto':r.left+'px';
		let right = left=='auto'?$.screenWidth()-r.left-r.width+'px':'auto';
		ul = $ul({class:'ui-dropdown-opts'},ma).css({top:top+'px',left:left,right:right,width:w+'px',height:32*Math.min(6,opts.length)+'px'});
		var i=0;
		for(var o of opts){
			$li({html:o.label,i:i++},ul).bind('click',sel)
		}
	});
	if(attrs.class) bt.addClass(attrs.class);
	var sel = function(e){
		$.remove(ma)
		if(attrs.updateLabel)
			bt.textContent = this.textContent;
		if(onChange) onChange.call(bt,this.i);
	}
	return bt;
}


var $popover_subview=function(vname, params, css, origin_header){
	var vn = vname.replace(/[@?].*/,'');
	var vo = window[vn];
	//if(!vo)return console.error("subview: view not exists, "+vname);
	var h,c,f,pop = $popup([
		h = origin_header || $header([$i({class:'close'}).bind('click',function(e){pop.close()})]),
		c = $section(),
		f = $footer()
	])
	var dom = pop.dom();
	dom.className='popover';
	dom.css(css);
	$app.openSubview(vname, params, h, c, f);
	return dom;
	//if(vo.noFooter){$.remove(f);f=false;}
}

/**
 * 
 * @param {*} title 
 * @param {*} body 
 * @param {*} btns, btns inside footer
 * @param {*} side : top,left,right,bottom
 * @param {*} org : mouse clicked item rect
 * @param {*} w,h : popover width, height
 */
var $popover=function(title,body,btns,side,org,w,h,flipped,noMask){
	var content = title? [
		$header([
			$h2(title),
			$i({class:'close'}).bind('click',function(e){
				if(!noMask)pop.close();
				else $.remove(pop)
			})
		]),
		$section(body)
	]:[$section(body)];
	var pop = !noMask? $popup(content):$section(content,document.body).attr('class','popup').bind('click',function(e){e.stopPropagation()});
	var dom = noMask?pop: pop.dom();
	if(btns)$footer(btns,dom);
	dom.className='popover';
	var sw = $.screenWidth(),
		sh = $.screenHeight();
	var r = $.rect(dom);
	w = w||320; h = h||r.height;//auto
	var css = {width:w+'px'};
	var offsets = {
		// top 	: {top:org.top-h-20,left:org.left+Math.abs(w-org.width)/2,reverse:'bottom'},
		// bottom 	: {top:org.top+org.height+20,left:org.left+Math.abs(w-org.width)/2,reverse:'top'},
		top 	: {top:org.top-h-20,left:org.left+10,reverse:'bottom'},
		bottom 	: {top:org.top+org.height+20,left:org.left+10,reverse:'top'},
		left 	: {left:org.left-w-20,top:org.top,reverse:'right'},
		right 	: {left:org.left+org.width+20,top:org.top,reverse:'left'},
	}
	var os = offsets[side];
	//check center
	var cx = os.left+w/2, cy = os.top+h/2;
	if(!flipped && (cx<0||cx>sw||cy<0||cy>sh)){
		if(pop.close)pop.close();
		else $.remove(pop)
		return $popover(title, body, btns, os.reverse, org, w, h, true)
	}
	dom.addClass(side);
	css.left = os.left+'px';
	css.top = os.top+'px';
	dom.css(css);
	return dom;
}
//remove mask/popup on the top layer
var pop_mask = function(selector){
	selector=selector||"#mask";
	var ps = document.querySelectorAll(selector);
	if(ps&&ps.length){
		ps = ps[ps.length-1];
		$.remove(ps);
	}
}


var show_indicator = function(cls){
	var p = $popup([
		$div({id:'indicator'})
	],true);
	var fr = p.dom();
	fr.removeClass('popup');
	fr.parentNode.addClass('ui-indicator')
	if(cls)fr.parentNode.addClass(cls)
	//customize p.dom()?
}

var hide_indicator = function(){
	var i = $id("indicator");
	if(i){
		$.remove(i.parentNode.parentNode);
	}else
		$.remove($id("mask"));
}


var video_thumb = function(vod,w,h){
	var canvas = $canvas({width:200,height:200},document.body).css({top:0,left:0,position:'fixed',zIndex:1000,backgroundColor:'white'});
	vod.play();
    canvas.getContext('2d').drawImage(vod, 0, 0, w||268, h||180);
	return canvas.toDataURL('image/jpeg');
}


/**
 * calendar function
 * @param  {object} opts :
 *          x : calendar.left (float) [optional]
 *          y : calendar.top (float) [optional]
 *          style : date|datetime|time
 *          year : 2016, [optional]
 *          month : 9 [optional]
 *          dayHandler: function(y,m,d){ //day selected handler [required]
 *          	//y : 2016
 *          	//m : 10 (date.getMonth()+1)
 *          	//d : 12
 *          },
 *			monthHandler: function(y,m,monthDiff){ //month changed handler [optional]
 *          	//y : 2016
 *          	//m : 10 (date.getMonth()+1)
 *          	//monthDiff : -1 last month, 1 next month
 *          }
 * @param  {element} target : target element to append to
 * @return {element} this calendar article object
 *
 * TO hide calendar
 * $calendar().hide();
 */
var $calendar = function(opts,target){

	if(arguments.length==0)
		return {hide:function(){$.remove("#calendar");}};

	//init
	var yyyy = opts.year||new Date().getFullYear(),
		mm = opts.month||new Date().getMonth()+1,
		style = opts.style||"date",
		target = target||document.body;

	$.remove("#calendar");
	$.remove("#calendar-mask");
	var mask = $article({id:"calendar-mask"},document.body);
	var cal = $article({id:"calendar",class:"calendar-"+style,calendar_style:style},target);
	cal.attr({html:"",y:yyyy,m:mm}); //reuse
	if(opts.x)cal.css("left",opts.x+"px").attr("left",opts.x);
	if(opts.y)cal.css("top",opts.y+"px").attr("top",opts.y);

	//generate days list
	var days 	= new Date(yyyy,mm-2,0).getDate(),//days of this month
		w1 		= new Date(yyyy,mm-1,1).getDay(), //weekday of the 1st day of this month
		w$ 		= new Date(yyyy,mm-1,days).getDay(), //weekday of the last day of this month
		i 		= 1,
		dates 	= [];//arr of date

	//fill dates with days of this month
	while(i<=days)
		dates.push({year:yyyy, month:mm, day:i++});

	//fill dates with last month if 1st is not monday
	days = new Date(yyyy,mm-3,0).getDate();//days of last month
	w1 = w1==0?7:w1;
	while(1<(w1--))
		dates.unshift({year:yyyy, month:mm-1, day:days--});

	//fill dates with next month if last is not sunday
	i = 1; 
	while(w$++%7!=0)
		dates.push({year:yyyy, month:mm+1,day:i++});

	//declare elements and handlers
	var tbl = $table({},cal),
		btn_ok, btn_l, btn_r,
		col_y, col_m, col_d,
		v_y = yyyy,
		v_m = mm,
		v_d = opts.day||1,
		v_h = opts.hour||0,
		v_i = opts.minute||0;
	//declare time selection items
	var clock_frame, timelabel, ampm=opts.ampm||"am";

	var cbp_month = opts.monthHandler;
	var cbp_day = opts.dayHandler;
	var f_close = function(){
		mask.remove();
		cal.remove();
		window.onwheel = window.onmousewheel = document.onmousewheel = window.ontouchmove = document.onkeydown =null;
	}
	var f_month_changed = function(e){//month change handler, calendar view
		e = e||window.event;
		var el = e.target||e.srcElement;
		var mdiff = el.className=='left'?-1:1;
		var d = new Date(cal.attr("y"),cal.attr("m")+mdiff-1,1);
		var opt = {year:d.getFullYear(),month:d.getMonth()+1,day:v_d||1,
			monthHandler:cbp_month,dayHandler:cbp_day,style:cal.attr("calendar_style"),
			hour:parseInt(v_h)%12, minute:parseInt(v_i), ampm:ampm};
		if(cal.attr("left"))opt.x = cal.attr("left");
		if(cal.attr("top"))opt.y = cal.attr("top");
		$calendar(opt,target);
		cal.title.className="highlight";
		if(cbp_month) cbp_month(d.getFullYear(),d.getMonth()+1,mdiff);
	}
	var f_day_handler = function(e){ //date selection handler, calendar view
		if(cbp_day){
			v_y = this.attr('yy');
			v_m = this.attr('mm');
			v_d = this.attr('dd');
			cal.find("td",function(el){
				el.removeClass("on");
			})
			this.addClass("on");
			if(timelabel){
				var vs = timelabel.value.split(":");
				v_h = vs[0], v_i = vs[1];
			}
			cbp_day(v_y, v_m, v_d, v_h, v_i);
		}
		//f_close();
	};

	var f_drum = function(el){ // set y/m/d highlight for date picker drum view
		var sh = el.attr("sh")*36;
		var lastY = parseInt(el.attr("lastY"));
		var top = Math.min(sh-180,el.scrollTop);
		var r0 = top>lastY ? Math.floor(top/36):Math.ceil(top/36);
		el.attr("lastY",top);
		el.scrollTop=r0*36;
		for(var i=1;i<=el.childNodes.length;i++){
			var r = i>=r0+4?3-(i-r0-3):i-r0;
			var cls = r<=0? "":"scale"+r;
			el.childNodes[i-1].className = cls;
		}
	}

	var f_ok = function(){
		v_y = parseInt(col_y.find1st(".scale3").textContent);
		v_m = parseInt(col_m.find1st(".scale3").textContent);
		v_d = parseInt(col_d.find1st(".scale3").textContent);
		if(timelabel){
			var vs = timelabel.value.split(":");
			v_h = vs[0], v_i = vs[1];
		}
		if(cbp_day)
			cbp_day(v_y, v_m, v_d, v_h, v_i);
		f_close();
	}

	var f_arm_click = function(e){
		for(var i=0,el;el=this.parentNode.childNodes[i];i++){
			el.removeClass("on");
		}
		this.addClass("on");
		var vs = timelabel.value.split(":");
		var h = this.attr("hour"), m = this.attr("minute");
		if(h) {
			h = ampm=="am" ? h:h+12;
			vs[0] = h<10?"0"+h:(h==24?"00":h);
		}else if(m) {
			if(m==60) m=0;
			vs[1] = m<10?"0"+m:m;
		}
		timelabel.value=vs.join(":");
		v_h = vs[0], v_i = vs[1];
		if(cbp_day){
			cbp_day(v_y||yyyy, v_m||mm, v_d||1, v_h, v_i);
		}
	}
	var f_ampm_click = function(e){
		var dl = e.parentNode;
		var vs = timelabel.value.split(":");
		var h = parseInt(vs[0]);
		if(this.hasClass("am")){
			this.nextSibling.removeClass("on");
			ampm = "am";
			cal.removeClass("pm").addClass("am");
			if(h>=12)vs[0]=h-12<10?"0"+(h-12):h-12;
		}else{
			this.previousSibling.removeClass("on");
			ampm = "pm";
			cal.removeClass("am").addClass("pm");
			if(h<12)vs[0]=h+12==24?"00":h+12;
		}
		timelabel.value=vs.join(":");
		this.addClass("on");
		v_h = vs[0], v_i = vs[1];
		if(cbp_day){
			cbp_day(v_y||yyyy, v_m||mm, v_d||1, v_h, v_i);
		}
	}

	//disable scroll
	window.onwheel = window.onmousewheel = document.onmousewheel = window.ontouchmove = document.onkeydown = function(e){
		var c = $id("calendar");
		if(!c) return f_close();
		if(!c.attr("scroolY"))
			c.attr("scrollY", document.body.scrollTop);
		else{
			if(c && "scroll"!=c.attr("status")) 
				setTimeout(function(){
					if(document.body.scrollTop-c.attr("scroolY")>20)
						f_close();
					c.removeAttribute("scroolY")
				},200,c)
		}
	};

	mask.bind("click",f_close);

	//draw title line
	var draw_calendar = function(){
		var title_line = $tr($th({}),tbl);
		$th([
			cal.title = $u(yyyy+'年 '+mm+'月 ').bind('click',function(){//show year|month selection
				return;//FIXME
				cal.attr("status","scroll");
				btn_l.hide();
				btn_r.hide();
				btn_ok.show();
				var row1 = tbl.childNodes[0];
				var i = tbl.childNodes.length;
				while(1<i--){
					tbl.childNodes[tbl.childNodes.length-1].remove();
				}
				var onscroll = function(e){
					f_drum(this);
				}
				var onclick = function(e){
					if(this.className=="space")return;
					var cls = this.parentNode.className;
					var i = parseInt(this.textContent);
					this.parentNode.scrollTop = cls=="years" ? (i-1970)*36: (i-1)*36;
				}
				var ny = new Date().getFullYear(); //FIXME, let user set start/end
				$tr([
					$td({class:"space"}),
					$td([
						col_y=$ul([$li({class:"space"}),$li({class:"space"})]).attr({sh:(ny-1970)+5,class:"years"}).bind('scroll',onscroll),
						col_m=$ul([$li({class:"space"}),$li({class:"space"})]).attr({sh:12+4,class:"months"}).bind('scroll',onscroll),
						col_d=$ul([$li({class:"space"}),$li({class:"space"})]).attr({sh:31+4,class:"days"}).bind('scroll',onscroll),
					]).attr({colspan:7,class:"space"}),
					$td({class:"space"}),
				],tbl);

				//year drum
				for(var i=1970;i<=ny;i++)
					$li(i+"年",col_y).bind('click',onclick);
				$li({class:"space"},col_y);$li({class:"space"},col_y);
				col_y.scrollTop = (yyyy-1970+1)*36;

				//month drum
				for(var i=1;i<=12;i++)
					$li(i+"月",col_m).bind('click',onclick);
				$li({class:"space"},col_m);$li({class:"space"},col_m);
				col_m.scrollTop = (mm-1)*36;

				//day drum
				for(var i=1;i<=31;i++)
					$li(i+"日",col_d).bind('click',onclick);
				$li({class:"space"},col_d);$li({class:"space"},col_d);

				f_drum(col_y);
				f_drum(col_m);
				f_drum(col_d);
			}),

			btn_ok = $b({class:'check'}).bind("click",f_ok),//save btn
			$b({class:'cross'}).bind("click",f_close),//close button
			btn_r = $b({class:'right'}).bind("click",f_month_changed),//prev month
			btn_l = $b({class:'left'}).bind("click",f_month_changed),//next month
		],title_line).attr({colspan:7});
		$th({},title_line);//space holder

		var titles = "月火水木金土日";

		var grids = $tr({},tbl);
		$th({},grids);//space holder
		for(var i=0;i<7;i++)
			$th(titles.charAt(i)+"",grids);
		$th({},grids);//space holder

		//draw days
		$tr($td({colspan:9,class:"space-s"}),tbl).attr({class:"space-s"});
		var tar = $tr($td({class:"space"}),tbl);
		for(var i=0;i<dates.length;i++){
			var tar = i>0&&i%7==0 ? $tr($td({class:"space"}),tbl) : tar;
			var td = $td({html:""+dates[i].day,class:dates[i].month!=mm?"gray":'','yy':dates[i].year,'mm':dates[i].month,'dd':dates[i].day}, tar).bind("click",f_day_handler);
			if(dates[i].month==mm && dates[i].day==v_d)
				td.addClass("on");
			if(i%7==6) $td({class:"space"},tar);
		}

		$tr($td({colspan:9,class:"space"}),tbl);
		btn_ok.hide();
	}


	//hour/minute
	var draw_clock = function(){
		if(style=="datetime")
			cal.addClass("clock");
		var r=80,//hour arm radius
			R=110,//minute arm radius
			w=20,//text width,height
			ah=16,//hour arm length
			am=32;//minute arm length
		clock_frame = $div({class:"clock-frame"},cal);
		var clock = $div({id:"clock"},clock_frame).css({width:(R+w)*2+"px",height:(R+w)*2+"px",borderRadius:(R+w)+"px"});//the clock panel
		var vs=[v_h<10?"0"+v_h:v_h,v_i<10?"0"+v_i:v_i];
		timelabel = $input({value:vs.join(":"),type:"text"},clock);

		//draw hours / minutes
		for(var j=0,ra;ra=[R,r][j];j++){
			var tag 	= [window["$sub"],window["$sup"]][j];
			var step 	= [5,1][j];
			var offset 	= [0,R-r][j];
			var ar 		= [am,ah][j];
			var aw 		= [2,4][j];
			var k 		= ["minute","hour"][j];
			var fr = $div({},clock).css({top:offset+"px",left:offset+"px",width:2*(ra)+"px",height:2*(ra)+"px",borderRadius:(ra)+"px"});
			for(var i=1;i<=12;i++){
				var radian = 2*Math.PI*i/12.0-Math.PI/2,
					degree = radian*180/Math.PI;
					v = j==1||i%3==0?i*step:"-";
				if(v == 60)v=0;
				//number
				var arm = tag({html:v,class:i%3==0?"":"stick"},fr).attr(k,i*step).css({left:(Math.cos(radian)*(ra-w/2)+ra-w/2)+"px", top:(Math.sin(radian)*(ra-w/2)+ra-w/2)+"px"}).bind("click",f_arm_click);
				//arms
				$i({},fr).css({left:(Math.cos(radian)*(ar+30-ar/2)+ra-aw/2)+"px", top:(Math.sin(radian)*(ar+30-ar/2)+ra-ar/2)+"px",width:aw+"px",height:ar+"px",transform:"rotate("+(90+degree)+"deg)"});
				if(j==0&&i%3!=0){
					arm.css({transform:"rotate("+degree+"deg)",fontSize:"12pt"})
				}
				if((j==0&&i*step==v_i)||(j==1&&i%12==v_h%12)){
					arm.addClass("on");
				}
			}
		}
		//am/pm
		var dl = $dl([
			$dd({class:"am on",html:"AM"}).bind("click",f_ampm_click),
			$dd({class:"pm",html:"PM"}).bind("click",f_ampm_click),
		],clock_frame);
		if(ampm=="pm"){
			dl.childNodes[1].fire("click")
		}
	}

	if(style.indexOf("date")>=0)
		draw_calendar();
	if(style.indexOf("time")>=0)
		draw_clock();

	return cal;
}

var str2calopt=function(v){
	var o = {};
	if(v.length>0){
		var vs=v.split(/(:|\s+|\-)/);
		var fs = ["year","-","month","-","day","-","hour","-","minute"];
		for(var i=0,f;f=fs[i];i++){
			if(vs.length<=i)return o;
			o[f]=parseInt(vs[i]);
		}
	}
	return o;
}

var $form_item_calendar = function(attrs, target){
	var vstr = attrs.value+""||"";
	if(vstr.match(/^\d+$/)&&(vstr.length>=9&&vstr.length<=13)){
		if(vstr.length<=10) vstr+="000";
		vstr = new Date(parseInt(vstr)).format("YYYY-MM-DD hh:mm");
	}
	return ipt = $input($.extend({type:"text",autocomplete:'off',value:vstr},attrs),target).addClass("form-item-calendar").bind("click",function(){
		var ipt = this;
		var rect = ipt.rect();
		var sch = $.screenHeight();
		var style = attrs.style||'date';
		var date = str2calopt(ipt.value);
		var opt = $.extend({
			x : rect.left,
			y : rect.top+rect.height+260>sch && rect.top>260?rect.top-260:rect.top+rect.height,
			style : style,
			dayHandler:function(y,m,d,H,M){
				var v = style.indexOf("date")>=0? y+"-"+(m>9?m:"0"+m)+"-"+(d>9?d:"0"+d):"";
				if(style.indexOf("time")>=0&&H!=undefined) v+= " "+H+":"+M;
				ipt.value = v;
				ipt.fire("change");
			}
		},date);
		$calendar(opt, document.body);
	})
}




/**
 * draw spreadsheet
 * @param {object} opts 
 * @param {Element} tar 
 * @param {Element} pagesTar 
 * @return SpreadsheetView 
 */
var $spreadsheet_view = function(opts, tar, pagesTar){
    var ev = new SpreadsheetView(opts,tar,pagesTar);
	ev.update.call(ev);
	return ev;
}

var SpreadsheetView = function(opts, tar, pagesTar){
    var me = this;

    var items = opts.fields||[],//form items
        data = opts.data||[],
        getUrl = opts.getUrl,
		postUrl = opts.postUrl,
		method = (opts.formMethod||'post').toLowerCase(),
		pk = opts.primaryKey || 'id';
        query = opts.query || {},
		delegate = opts.delegate||false,
		drawListItem = opts.drawListItem||false,
		drawFormItem = opts.drawListItem||false,
		autosaveTimer = false,
		changes = {},
		forms = {},
		currentRow = false //current focused TR
        ;

    var fields = items.map(it=>{return {
        name : it.name||'', title : it.title, sortable:it.sortable, wrapper:it.wrapper
    }});
	items = items.map(it=>{delete it.title; return it;});
	
	var rOpt = {
        url : postUrl,
        method : 'POST',
        delegate : me,
		items : items,
		htmlTag : 'tr-td',
		withForm : false,
	};
	
	var listOpt = Object.assign(opts, {
        url : getUrl,
		fields : fields,
		renderHTML : false,
        delegate : me
	});
	delete listOpt['postUrl'];

	var drew_editing_row_f = false;
	if(!listOpt.items || !listOpt.items.length){
		var o = {}; o[pk] = 0;
		listOpt.items = [o];
		drew_editing_row_f = true;
	}
	var map = {};//formItems kvs map
	for(var it of items){
        if(it.name)
            map[it.name] = it;
	}
	
	var find_1st_ipt = function(form){
		if(!form)return;
		var ipts = form.find('input,textarea');
		for(var i=0,ipt;ipt = ipts[i++];){
			if(ipt.tagName=='INPUT'){
				if(['radio','checkbox','hidden'].indexOf(ipt.type)>=0)
					continue;
			}
			return ipt;
		}
		return false;
	}

	var bind_ipts_events = function(form){
		if(!form)return;
		form.find('input,textarea,select',function(ipt){
			if(ipt.tagName=='INPUT'){
				if(['radio','checkbox'].indexOf(ipt.type)>=0)
					return;
			}
			ipt.bind('keyup',function(e){
				if(e.keyCode==9){//TAB
					console.log("keyup TAB");
					var el = this.parentNode;
					while (el.tagName!='TD')
						el = el.parentNode;
					var hasNext = false;
					while(el.nextSibling){
						el=el.nextSibling;
						if(el.find('input,textarea,select')){
							hasNext=true; break;
						}
					}
					if(!hasNext){//Last element
						me.nextRow(this);
					}
				}
			});
			if(ipt.tagName!='INPUT')return;
			ipt.onEnterKey(function(e){
				console.log("onEnterKey");
				ipt.blur();
				me.autoSave(1);
				me.nextRow(ipt);
			})
		});
	}

	this.drawListItem = function(row, o, i){
		if(!o)return;
		console.log("drawListItem");
		var fm = $form_view(Object.assign(rOpt,{data:o}),list.dom());
		// $.remove(row);
		if(drawListItem) drawListItem(fm.dom(),o,i);
		forms[`id_${o[pk]}`]=fm;
		setTimeout(()=>{
			bind_ipts_events(fm.dom())
		},50)
	}
	
	this.drawFormItem = function(row,o){
		if(drawFormItem) drawFormItem(row,o);
	}

	this.onFormChange = function(k,v,cs,d,el){
		//add to changes
		if(!k||k=='')return;
		console.log("change",k,v,cs,d);
		if(!d[pk]){
			cs[pk] = d[pk];
			changes[`id_${d[pk]}`] = cs;
		}
		list.dom().find("tr.error").removeClass("error");
		if(postUrl)me.autoSave();
	}

	this.onFormError = function(err_name,err,cid){
		console.log("onFormError",err)
		if(opts.onFormError) opts.onFormError.call(this,err_name,err);//'this' is a FormView instance
		if(cid){
			var tr = list.dom().find1st(`tr[data-id="${cid}"]`);
			if(tr && !tr.hasClass('error')) {
				shake_form(list.dom());
				tr.addClass('error');
				var current = document.activeElement;
				var back = false;
				if(current){
					while(current.tagName!='TR')
						current = current.parentNode;
					// console.log("check cid:",current.id, cid)	
					if(current.attr("data-id")!=cid) back=true;
				}
				if(back){
					var ipt = find_1st_ipt(tr);
					if(ipt) ipt.focus();
				}
			}
		}
	}

	this.onFormSubmit = function(ps,cs){
		console.log("spreadsheet submit",ps,cs)
		return opts.onFormSubmit?opts.onFormSubmit(ps,cs):true;
	}

	this.onFormSubmited = function(re, err){
		console.log("onFormSubmited",err)
		if(err && err.code>=400){
			//show error
			shake_form(list.dom())
			var cid = err.params[pk];
			me.onFormError('server-error',err,cid);
		}else{
			//update data
			//update TR date-id
		}
		return false;
	}

    this.addRow = function(o,i){
		if(!o){o={};o[pk]=0;}
		console.log("addRow")
		var dom = list.dom();
		if(i===undefined){
			i = dom.find('tr').length;
		}
		var fm = $form_view(Object.assign(rOpt,{data:o}),dom);
		if(drawListItem) drawListItem(fm.dom(),o,i);
		forms[`id_0`] = fm;
		setTimeout(()=>{
			bind_ipts_events(fm.dom())
			var ipt = find_1st_ipt(fm.dom());
			if(ipt) ipt.focus();
		},50);
    }

    this.delRow = function(){

	}
	
	/**
	 * goto next row
	 */
	this.nextRow = function(el){
		console.log("nextRow");
		while (el.tagName!='TR')
			el = el.parentNode;
		if(!el.nextSibling){//Last row
			//new row
			me.addRow();
		}else{
			var ipt = find_1st_ipt(el.nextSibling);
			if(ipt) ipt.focus();
		}
	}

    this.update = function(q){
		console.log("update");
        list.update.call(list,q||query);
        return me;
	}

	this.autoSave = function(now){
		if(autosaveTimer) clearTimeout(autosaveTimer);
		autosaveTimer = setTimeout(()=>{
			var ks = Object.keys(changes);
			if(ks.length){
				var cid;
				while(cid = ks.shift()){
					me.submit(cid);
				}
			}
		},now?0:1000);
	}

	this.submit = function(cid){
		var c = changes[cid];
		if(cid=='id_0') delete c[pk];
		console.log("AUTOSAVE:", cid, c);
		var da = {};
		if(cid!='id_0'){
			da[pk] = c[pk] =　$.isString(cid) ? cid.replace(/^id_/,''):cid;
		}
		var r = me.onFormSubmit(da, c);
		if(r){
			$http[method](postUrl, $.isObject(r)?r:c, function(r,e){
				// if(!e)
				// 	delete changes[cid];
				if(me.onFormSubmited)
					me.onFormSubmited(r,e);
			},'json');
		}else{
			me.onFormError('validation-error','',cid);
		}
	}
	
	this.close = function(e){
		me.autoSave(1);
	}  
	
	var list = new ListView(listOpt,tar,pagesTar);
	list.dom().addClass('spreadsheet-view');
	if(!drew_editing_row_f){
		me.addRow();
	}

    return me;
}