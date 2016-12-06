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
 *         		    placeHolder : [optional][string] for text|password|textarea only
 *         		    options : [optional][array] for radio|checkbox|select only
 *         		    	e.g. : [{label1:value1},{label2:value2},{label3:value3}] OR [value1, value2, value3...](labelN will = valueN)
 *         		    @other_keys : [optional][mixed], the key name can be any string. the value can be any type
 *         		    		the value will be set as attributes of this form item tag.
 *         		}
 *         data : [optional][object] form data
 *         method : [optional][string] http method, default=post
 *         drawItem : [optional][function] a function to custom drawing of a certain item. drawItem(rowDom,o) //o is item def
 *         onChange : [optional][function] a function triggers when form item's value changes
 *         onSubmit : [optional][function] function(params){ params = user input form data } you can use this to show loading indicator. 
 *         				or return false to stop submit.
 *         onSubmited : [optional][function] function(res){ res = server response data in json format } 
 *         onError : [optional][function] function(name,error){ name=form item name, error=error detail } 
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
	var onChange = opt.onChange||delegate.onFormChange;

	/*======== private properties ========*/
	var form;
	var data = opt.data||{};
	var changed = {};
	/*======== public methods ========*/
	this.dom = function(){return form}

	this.draw = function(){
		if(form)form.remove();
		form = $form({method:opt.method||"POST", class:opt.className||"", action:opt.url||"", enctype:"multipart/form-data"},target);
		var v_items = $ul({},form);

		for(var i=0,o;o=opt.items[i];i++){
			if($.isObject(o)){
				if($.isArray(o.items)){
					var v_item = $li({type:"multiple"},v_items);
					var tr = $tr({},$table({},v_item));
					for(var j=0,oi;oi=o.items[j];j++){
						if($.isElement(oi)){
	                        $td(oi,tr);
	                    } else {
							oi.type = oi.type || "text";
							draw_item(oi,$td({name:oi.name,type:oi.type,"class":oi.required?"required":""},tr));
							if(j<o.items.length-1){
								$td({class:'space'},tr);//add place holder
							}
	                    }
					}
				}else{
					if($.isElement(o)){
                        $li(o,v_items);
                    } else {
						o.type = o.type || "text";
						var v_item = $li({name:o.name,type:o.type,"class":o.required?"required":""},v_items);
						draw_item(o,v_item);
                    }
				}
			}else{
				console.log("$form_view WARN : SKIP ",o);
			}
		}
		return me;
	};

	this.submit=function(e){
		e = e||window.event;
		if(e && e.preventDefault)e.preventDefault();
		//remove errs
		//this.find("i",function(err){err.attr({html:""})});
		form.find(".error",function(el){el.removeClass("error");});

		//serialize form
		var params = {};
		var errors = 0;
		var items = [];

		for(var i=0,o;o=opt.items[i++];){
			if($.isArray(o.items))
				for(var j=0,oi;oi=o.items[j++];)
					items.push(oi);
			else
				items.push(o);
		}
		for(var i=0,o;o=items[i];i++){
			// if(name=="html")continue;
			var name = o.name||o.attr("name"), 
				v = form[name]||false;
			//console.log('name',name,',v',v);
			if(o.type=="checkbox"){
				v = [];
				form.find("input[name='"+name+"']:checked",function(el){v.push(el.value)});
			}else if(o.type=='file'){//multiple files
				var fs = [];
				for(var j=0,ip;ip=form[name][j++];){
					console.log("files",ip.files)
						fs.push(ip.files[0]);
				}
				params[name]=fs;
				continue;
			}else if(o.type=="image"){
				var imo = form.find1st("img[name='"+name+"']");
				v = imo&&imo.src?imo.src.htmlencode():"";
			}else if(o.type=="period"){
				var pvs = v.value.split(',');
				if(parseInt(pvs[0])>parseInt(pvs[1]) && onError)
					return onError.call(form,name,"start>end");
				v = v.value;
			}else{
				v = v?v.value.trim():false;
			}

			if(o.validate){
				var vas = o.validate.split(/;+/g);
				for(var j=0,va;va=vas[j];j++){
					var mx=0,mn=-1;
					if(va.startsWith("len")){
						var ps = va.split(":");
						mn = ps[1]?parseInt(ps[1]):-1;
						mx = ps[2]?parseInt(ps[2]):0;
					}
					if(va){
						var wrong=false;
						if($.isString(v))
							wrong = !v.validate(va);
						else if(mn||mx)
							wrong = (mn>=0 && v.length<mn) || mx&&v.length>mx;
						if(wrong){
							errors++;
							// var li = form.find1st("li[name="+name+"]");
							// if(li)li.addClass("error");
							var el = form.find1st("i.error-"+name);
							var msg = va;
							if(mn>=0) msg = "length must "+(mx?"between "+mn+"~"+mx:">"+mn);
							if(el) el.attr({html:"ERR: invalide "+msg}).show();
							el.parentNode.addClass("error");
							if(onError) 
								onError.call(form,name,va);
							break;
						}
					}	
				}
			}
			if(v || (data[name]&&v!=data[name])) params[name]=v;
		}

		if(!errors){
			var re = (onSubmit)?onSubmit(params):true;
			if(re && (opt.url||this.url)){
			    var method = (opt.method||($.isString(e)?e:"post")).toLowerCase();
			    $http[method](opt.url||this.url, params, function(r,e){
			    	changed = {};
			    	if(onSubmited)
			    		onSubmited(r,e);
			    } ,"json");
			}
		}
		return me;
	};

	this.reset=function(clearData){
		if(clearData) data={};
		if(form)form.remove();
		return me.draw();
	};


	this.throwError = function(name, err){
		if(onError)onError.call(me,name,err);
	};

	/**
	 * get/set changes of this form
	 * @example
	 *  set k->v : myform.set("mykey","myval");
	 *  set obj : myform.set({"key1":"val1","key2":"val2"});
	 *  get : var c = myform.changes()
	 */
	this.changes = function(k,v){
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
		//draw title
		if(o.title) $h4(o.title,v_item);

		var val = data[o.name] || o.default || "";
		var v_cell = $div({},v_item);
		var args = $.extend({name:o.name,value:val,class:'form-item'},o);

		if(o.type==="html"){
			v_cell.innerHTML = o.html;
		}else if(o.type=='textarea'){
			$textarea(args, v_cell).bind("change",item_changed);
		}else if(o.type.match(/^(text|password|hidden)$/)){
			$input(args, v_cell).attr("type",o.type).bind("keyup",item_changed);
		}else if(o.type.match(/^(checkbox|radio)$/)){
			window["$"+o.type](o.options,args,v_cell);
			v_cell.find('label',function(el,i){
				el.bind("click",function(e){
					this.parentNode.find("label",function(el1,i){
						var sel = el1.childNodes[1];
						el1.className=sel.checked?"on":"";
					});
				});
			});
			v_cell.find("input",function(el,i){
				el.bind("change",item_changed);
			})
		}else if(o.type=='select'){
			$select(o.options, args, v_cell).bind("change",item_changed); 
		}else if(o.type.match(/^(image|file|autocomplete|list|tree|switch|calendar|period|range)$/)){//extentions
			window["$form_item_"+o.type].call(me, args, v_cell);
			form.find("input[name="+args.name+"]",function(el,i){
				el.bind("change",item_changed);
			});
		}else{//custom tags
			var func = window["$form_item_"+o.type];
			if($.isFunc(func)){
				func.call(me, args, v_cell);
			}
			form.find("input[name="+args.name+"]",function(el,i){
				el.bind("change",item_changed);
			});
		}
		//description
		$p({class:"desc-"+o.name+(o.desc?"":" empty"),html:o.desc||""},v_cell);
		//error msg
		$i({class:"error-"+o.name},v_cell);
		if(drawItem)drawItem(v_item, o);
	}

	var item_changed = function(e){
		var v = this.value?this.value.trim():"";
		if(this.tagName=="INPUT" && this.type=="checkbox"){//handle multiples
			var vs = [];
			var ds = form.find("input[name="+this.name+"]:checked");
			for(var i=0,d;d=ds[i];i++){
				vs.push(d.value);
			}
			v = vs.join(",");
		}
		me.changes(this.name,v.length>0?v:undefined);
		if(onChange) onChange.call(me,this.name,v,$.clone(changed));
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
function $form_item_image(attrs, target){
	var src = attrs.value||"data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg'><rect/></svg>";
	return $div([
		$input($.extend({type:"file",value:""},attrs)),
		$img({src:src,name:attrs.name})
	],target).attr({class:"form-item-image"})
	.bind("click",function(e){
		var t = (this.tagName!='DIV')?this.parentNode:this;
		t.childNodes[0].bind("change",function(e){
			if(!this.value)return;
			var fn = this.value.split(/[\/\\]/);
			fn = fn[fn.length-1];
			var ext = fn.split(".");
			ext = ext.length>1? ext[ext.length-1].toLowerCase():"???";
			if(["jpg","png","gif","bmp"].indexOf(ext)>=0){
				var reader = new FileReader();
        		reader.onload = function (e2) {
        			t.childNodes[1].src = e2.target.result;
        		};
        		reader.readAsDataURL(this.files[0]);
			}
		}).fire("click");
	});
}

/**
 * TODO : multiple files test
 * form file upload item
 * @param  {[type]} o      [description]
 * @param  {[type]} attrs  [description]
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
var $form_item_file = function(attrs, target){
	var amount = parseInt(attrs.amount) || 1;
	var fr = $div({class:"form-item-file"},target);
	var i=0;
	var vs = attrs.value?attrs.value.split(","):[];
	while(i++<amount){
		var sp ;
		$div([
			sp = $span(""), //file ext or the [+] btn
			$u(""), //file name
			$input($.extend({type:"file",i:i},attrs))
		], fr).bind('click',function(){
			var t = (this.tagName!='DIV')?this.parentNode:this;
			t.childNodes[2].bind("change",function(e){
				if(!this.value)return;
				var fn = this.value.split(/[\/\\]/);
				fn = fn[fn.length-1];
				var ext = fn.split(".");
				ext = ext.length>1? ext[ext.length-1].toLowerCase():"???";
				if(["jpg","png","gif","bmp"].indexOf(ext)>=0){
					var reader = new FileReader();
            		reader.onload = function (e2) {
            			t.childNodes[0].innerHTML="";
            			t.childNodes[0].style.backgroundImage = "url("+e2.target.result+")";
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
			}).fire("click");
		});
		if(vs[i-1]){
			sp.style.backgroundImage = "url("+vs[i-1]+")";
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
 * 	   group : {
 * 			'関東' : '東京,神奈川,千葉,埼玉,茨城,栃木,群馬',
 * 			'関西' : '大阪,京都,兵庫,奈良,三重,滋賀,和歌山',
 * 	   }
 * }
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
var $form_item_autocomplete = function(attrs, target){
	var items;
	var rowH = 40;
	var vs=attrs.value?attrs.value.split(","):[];
	var ipt,iph,al,ac,gps;
	var multi=('multiple' in attrs)?attrs.multiple:true;
	var groups = attrs.group;
	var _form = this;
	var draw_tag = function(v){
		if(!multi){
			var o=ipt;
			while(o=o.previousSibling)
				if(o.tagName=="SPAN")o.remove();
		}
		var sp = $span(v).left(ipt);
		$b({class:"cross",v:v},sp).bind("click",function(e){
			remove_tag(this.attr("v"));
		});
	}
	//remove tags that textContent=v
	var remove_tag = function(v,withoutFire){
		var i=0,s,spans=ac.find("span");
		var ex = new RegExp(v);
		for(;s=spans[i];i++){
			if(s.textContent==v){
				s.remove();
				vs.splice(i, 1);
				break;
			}
		}
		iph.value = vs.join(",");
		console.log("iph",vs,iph.value)
		if(!withoutFire)
			iph.fire("change");
	};
	var item_sel = function(v){
		$.remove(al);
		ipt.value="";
		if(multi){
			if(vs.indexOf(v)>=0)return;
			vs.push(v);
		}else{
			vs=[v];
		}
		iph.value = vs.join(",");
		draw_tag(v);
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
	ac = $div([
		ipt = $input({type:'text',autocomplete:'off',class:"autocomplete",url:attrs.url,labelKey:attrs.labelKey,valueKey:attrs.valueKey})
		.bind('keydown',function(e){//Japanese IMG
			var c = e.which || e.keyCode;
			if(c==229) this.attr("ja",1);
			else this.removeAttribute("ja");
		})
		.bind('keyup',function(e){
	    	var c = e.which || e.keyCode;
	    	var ja = this.attr("ja")==1;
	    	if(ja&&c!=13)return;
	    	var v = this.value.trim();
	    	var ipt = this;
	    	if(v.length==0){
	    		if(c==8){
	    			item_remove_last();
	    		}
	    		return $.remove($('#form-item-autocomplete'));
	    	}
	    	if([16,17,91,37,39].indexOf(c)>=0)return;//ctrl, shift, cmd, left/right arrow events
	    	if(c==40||c==38||(!ja&&c==13)){//40:down 38:up 13:enter,arrow key selection events
	    		if(!al)return;
	    		al.childNodes.attr("class","");
				var size = al.attr('size');
	    		var cursor = al.attr("cursor");
	    		if(c==13){
	    			if(cursor==null)cursor=(c==38?size-1:0);
	    			item_sel(al.childNodes[cursor].textContent) ;
	    		}else{
	    			cursor = (cursor==null) ? (c==38?size-1:0):  Math.max(0,Math.min(size-1,cursor+(c==38?-1:1)));
					al.childNodes[cursor].attr("class","on");
					var visibleRows = al.offsetHeight/rowH-1;
		    		al.scrollTop = Math.max(0,(cursor-visibleRows))*rowH;
		    		this.removeAttribute("ja");
					al.attr("cursor",cursor);
	    		}
	    		return;
	    	}
	    	//search events.
	    	var api = this.attr("url"),
	    		lk = this.attr("labelKey"),
	    		vk = this.attr("valueKey");
	    	if(api){
	    		$http.get(api, {keyword : v}, function(res, err){
	    			items = res;
	    			$.remove($('#form-item-autocomplete'));
	    			if(!err){
	    				if(res.length>0){
	    					var rect = $.rect(ac);
	    					al = $ul({id:"form-item-autocomplete",size:res.length}, $this.layer)
	    						.css({left:rect.left+"px", top:rect.top+rect.height+"px", width:rect.width+'px', height:Math.min(5,res.length)*rowH+"px"})
	    						.hover(function(){//mouseover
	    							this.attr("over","yes");
	    						},function(){//mouseout
	    							this.attr("over","no");
	    						});
	    					var item_clicked = function(){
								item_sel(this.textContent);
							}
	    					for(var i=0,r;r=res[i];i++){
	    						$li({html:lk?r[lk]:r,value:vk?r[vk]:r,i:i},al).bind('click',item_clicked);
	    					}
	    					//disable scroll
							window.onwheel = window.onmousewheel = document.onmousewheel = window.ontouchmove = function(){
								if(al && "yes"!=al.attr("over")){
									al.remove();
									window.onwheel = window.onmousewheel = document.onmousewheel = window.ontouchmove = null;
								}
							};
	    				}
	    			}
	    		});//end http.get
	    	}//end if api
	    }),//end $input
	    iph = $input($.extend({type:'hidden'},attrs))
    ],target).attr("className","form-item-autocomplete")
    .bind("click",function(e){
    	if(ipt!=document.activeElement){
    		ipt.focus();
    	}
    });

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
    	for(var i=0,v;v=vs[i++];)
    		draw_tag(v)
    }
    return ac;
};

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
	var d = new Date();
	var output = attrs.output||'yy-mm-dd hh:ii';
	var date;
	//parse original value to yyyy-mm-dd string
	if(ov.match(/^\d+$/)&&(ov.length>=9&&ov.length<=13)){
		if(ov.length<=10) ov+="000";
		// date = new Date(parseInt(ov));
		var od = new Date(parseInt(ov));
		ov = od.format("YYYY-MM-DD hh:mm");
		date = {y:od.getFullYear(),m:od.getMonth(),d:od.getDate(),h:od.getHours(),i:od.getMinutes()};
		output = 'timestamp';
	}else if(ov.length>0){
		// date = new Date(ov);
		var od = new Date(ov);
		date = {y:od.getFullYear(),m:od.getMonth(),d:od.getDate(),h:od.getHours(),i:od.getMinutes()};
	}else{
		//date = new Date(d.getFullYear(),0,1,d.getHours());
		date = {y:0,m:0,d:0,h:0,i:0};
	}
	var vs = (ov.length>0)?ov.split(/[-, :]+/):[d.getFullYear(),"01",'01',attrs.fromHour||("0"+d.getHours()).slice(-2),'00'];
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
	var step = i==0? 1: attrs.step||1;//minute step
	var hi = attrs.fromHour	||0;//min hour
	var hx = attrs.toHour	||23;//max hour
	// if(hi>0) date.setHours(hi);
	
	var vopts = [[yi,yx],[1,12],[1,dx],[hi,hx],[0,59]];//[yy,mm,dd,hh,ii]
	var seqs = {mark:[0,1,2,3,4],slash:[1,2,0,3,4],cjk:[0,1,2,3,4]};
	var seq = seqs[style];
	var lbs = {mark:'-- :',slash:'// :',cjk:'年月日時分'};
	var lb = lbs[style];
	var names = ['yy','mm','dd','hh','ii'];
	var values = [yy,mm,dd,hh,ii];

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
	var iph = $input({type:'hidden',name:attrs.name,value:ov},fr);
	var onchange=function(e){
		var t = this.attr("ymd");
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
					if(dx)
					while(sl.childNodes.length-1!=dx){
						if(sl.childNodes.length-1<dx){
							var v = sl.childNodes.length;
							$option({value:v,html:v},sl);
						}else//remove the last one
							$.remove(sl.childNodes[sl.childNodes.length-1]);
					}
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
		var s = $e("select",{name:attrs.name+"-"+names[seq[i]],class:names[seq[i]],ymd:names[seq[i]]},fr).bind('change',onchange);
		var d = vopts[seq[i]];
		$option({value:'',html:'',selected:ov.length==0?"selected":false},s);
		for(var j=d[0];j<=d[1];j++){
			var jv = i==0?j: ("0"+j).slice(-2);
			$option({value:jv,html:jv,selected:ov.length>0 && values[seq[i]]==jv?"selected":false},s);
		}
		if(!(lb.charAt(i)==' '&&i==startIdx+size-1))
			$span(lb.charAt(i),fr);
	}
	
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
	var lp,rp,vals,tree,formItem,vals=attrs.value?JSON.parse(attrs.value):{},
		multi=Object.keys(attrs).indexOf('multiple')>=0?attrs.multiple:true,
		ipt, options = attrs.options, mask;

	var draw_tag=function(i,j){
		var txt = options[i-1].data[j-1];
		if(!multi){formItem.find("span",function(el,i){$.remove(el)});}
		var sp = $span(txt,formItem);
		$b({class:"cross",i:i,j:j,v:txt},sp).bind("click",function(e){
			var i=0,s,spans=formItem.find("span"),
				v = this.attr("v"),jj=this.attr("j"),ii=this.attr("i");
			for(;s=spans[i];i++){
				if(s.textContent==v){
					s.remove();
					break;
				}
			}
			var sel = vals[ii+""];//get selected
			var ix = sel.indexOf(""+jj);
			sel.splice(ix,1);//remove this item
			if(sel.length>0)vals[ii+""]=sel;
			else delete vals[ii+""];
			ipt.value=JSON.stringify(vals);//save value for submit
			ipt.fire("change");
			e.preventDefault();
			e.stopPropagation();
			mask.remove();
		});
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
		$calendar(opt);
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
		iph.value = d1.childNodes[0].value + "," + d2.childNodes[0].value;
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
	var vs = (orgv.length>0)?orgv.split(/[,\-]/):[attrs.min||0,attrs.min||0];
	var v1 = $.isString(vs[0])&&vs[0].indexOf(".")>=0?parseFloat(vs[0]):parseInt(vs[0]);
	var v2 = $.isString(vs[1])&&vs[1].indexOf(".")>=0?parseFloat(vs[1]):parseInt(vs[1]);
	var fr = $div([
		$input({type:"number",i:"from",step:(attrs.step||1),min:(attrs.min||0),max:(attrs.max||Number.MAX_VALUE),value:(v1||0)},target).bind("keyup",f_update).bind("click",f_update),
		$b(attrs.unit||""),
		$span(" ~ "),
		$input({type:"number",i:"to",step:(attrs.step||1),min:(attrs.min||0),max:(attrs.max||Number.MAX_VALUE),value:(v2||0)},target).bind("keyup",f_update).bind("click",f_update),
		$b(attrs.unit||""),
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
 * @param {int} 	opt.perpage	: [optional]
 * @param {str|obj} opt.query 	: [optional]
 * @param {array} 	opt.fields 	: [optional] columns to show for each item.
 *                             A) [{name:fieldname1, title:title1, sortable:true}, {name:fieldname2, title:title2},...]
 *                             OR B) [fieldname1, fieldname2 ...]
 *                             with A): name=db field name, title=th innerHTML, sortable:default false where this column is sortable
 * @param {bool} 	opt.append 	: [optional][default=false] whether the items of the next page should append to the end of this one.
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
	var table = $table({class:"list-view"},target);
	var items = []; //item list from api server.
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
			for(var k in queryObj){
				var v = queryObj[k];
				if($.isFunc(v))continue;
				if(v==null||v=="") delete query[k];
				else query[k] = v;
			}
			query.limit="0,"+perpage;
			me.page = 1;
		}
		if(onLoading){//user can show loading indicator at this timing.
			var q = onLoading.call(me,query);
			if(q) query = q;
		}
		$http.get(url, query, function(res, err){
			if(!append) table.innerHTML="";
			if(err){//error
				if(onError)onError.call(me,err);
			}else if(!res || !res.total || !res.data || res.data.length==0){//empty
				total = 0;
				items = [];
				drawItems();
				if(onEmpty)onEmpty.call(me);
			}else{
				total = res.total;
				if(append){
					items.concat(res.data)
				}else
					items = res.data;
				if(onLoaded){//user can custom response at this moment.
					var r = onLoaded.call(me,res);
					if(r) res = r;
				}
				cursors[0] = items&&items.length>0? items[0][sortKey]:0;
				cursors[1] = items&&items.length>1? items.last()[sortKey]:0;
				if(!fields) fields = Object.keys(items[0]);
				drawHeader();
				drawItems();
			}
		});
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

	/*======== private methods ========*/

	var drawHeader = function(){
		//draw header
		var row;
		if(table.childNodes.length==0){//draw header
			row = $tr({},table);
			for(var i=0,f;f=fields[i];i++){
				var k=$.isObject(f)?f.name:f;
				var hc = $th({html:f.title, key:k, class:k==sortKey&&'checkbox'!=f.wrapper?sortOrder+" on":(f.sortable===true?sortOrder:"none"), order:sortOrder},row);
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
			row = $tr({i:i},table);
			for(var j=0,f;f=fields[j];j++){
				var k=$.isObject(f)?(f.name||f.wrapper):f;
				var v=o[k];
				var cell = $td({i:i,html:v,class:'item-view-'+k},row);
				if(wrappers[j]){
					var args = wrapperArgs[j].slice();
					args.unshift($.isObject(f)?f.name:"");
					args.unshift(v==undefined?i:v);
					args.unshift(cell);
					wrappers[j].apply(me,args);
					cell.addClass("list-view-"+f.wrapper);
				}
			}
			if(drawItem) //if delegate, use delegate.
				drawItem(row, o, i);
			if(onSelect)
				row.bind("click",onSelect);
		}
		//draw pages
		if(pageStyle!="none")
			drawPages(pageTarget||$td({colspan:fields.length},$tr({},table)));
	}

	/**
	 * draw page indexes
	 * @param  {type} target 
	 * @return {[type]}        [description]
	 */
	var drawPages = function(target){
		if(!target)return;
		//pagenation function
		var paginate = function(){
			var page = this.attr("page");//"+1":next page, "-1":previous page, int: page num
			if($.isNumber(page)){//page number
				if(this.className=="on")return;
				query.limit = Math.max(0,page-1)*perpage+","+perpage;
				me.page = page;
				me.update.call(me);
			}else if(page==="+1"||page==="-1"){//next | prev
				var k = sortKey+"@"+(((page==="+1"&&sortKey=="asc")||(page==="-1"&&sortKey=="desc"))?"gt":"lt");
				var v = page==="-1"?cursors[0]:cursors[1];
				query[k] = v;
				query.limit = perpage;
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
		var page 	= me.page||1,
			ptotal 	= Math.ceil(total/perpage),
			size 	= Math.min(ptotal, Math.max(5,pageSize)),
			pages 	= [];
		if(ptotal>size){
			var half 	= size/2.0,
				r 		= page<=half||page>=ptotal-half?half-1:half-2,//radius
				c 		= (page<=half?r:(page>=ptotal-half?ptotal-r:page))+(size%2==0?.5:0),//center
				surfix = page<ptotal-half?[0,ptotal]:[];
			if(page-half>2) pages = [1,0];
			for(var i=Math.max(1,Math.ceil(c-r));i<=Math.floor(c+r);i++)
				pages.push(i);
			pages = pages.concat(surfix);
		}else{
			for(var i=1;i<=ptotal;i++)
				pages.push(i);
		}

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
	$label([
		$input({type:"checkbox",value:(idx==null?"all":idx)})
	],cell).bind("click",function(e){
		e.stopPropagation();
		var el = (this.tagName=="LABEL")?this.childNodes[0]:this;
		if(el.value=="all"){
			var tbl = el;
			while (tbl.tagName!="TABLE")
				tbl = tbl.parentNode;
			if(el.checked) tbl.find("input[type=checkbox]").attr("checked",true);
			else tbl.find("input[type=checkbox]").attr("checked",false);
		}
		if(listview && listview.delegate && listview.delegate.onListChecked){
			//trigger the delegate method
			listview.delegate.onListChecked.call(listview, listview.checked());
		}
		// console.log(listview.checked())
	});
}
/**
 * ListView extension by list_item_checkbox
 * get checked item index list
 * @return {array} of index
 */
ListView.prototype.checked = function(){
	var dom = this.dom();
	var ls = dom.find("input[type=checkbox]:checked");
	var vs = [];
	for(var i=0,l;l=ls[i++];)
		if(l.value!="all")
			vs.push(l.value);
	return vs;
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
		$.remove($id("sidemenu"));
		$.remove($id("sidemenu-button"));
		menu = $dl({id:"sidemenu"});
		target.insertBefore(menu, target.firstChild);//menu will be always insert as the first child
		//menu header
		var hd = $dt({i:-1},menu);
		if(drawItem)drawItem.call(me,hd,-1);
		if(selItem)hd.bind("click",function(e){
			selItem.call(this,e);
		})
		var def = opt.default||currentWithUrl()||[0,0];
		selection=def;
		//item select handler
		var onsel = function(e){
			var ii=this.attr("i"),
				jj=this.attr("j");
			selection=[ii,jj];
			menu.find("dd",function(dd){dd.removeClass("on");});
			this.parentNode.find(this.tagName.toLowerCase(),function(el,i){
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
			if((jj==-1 && (!this.nextSibling || this.nextSibling.tagName!="DL"))
				|| jj>=0){
				if(selItem) selItem.call(this,ii,jj);
			}
		};
		//draw items
		for(var i=0,o;o=items[i];i++){
			var dt = $dt({html:o.title,class:o.class,url:o.url,i:i,j:-1}, menu).bind("click",onsel);
			if(drawItem)drawItem.call(me,dt,i);
			var fireTarget = i==def[0] ? dt:null;
			if(def[0]==i)dt.addClass("on");
			if(o.items){
				var dl = $dl({class:i==def[0]?"on":""},menu);
				for(var j=0,t;t=o.items[j];j++){
					var dd = $dd({html:t.title,url:t.url,class:t.class||"",i:i,j:j},dl).bind("click",onsel);
					if(drawItem)drawItem.call(me,dd,i,j);
					if(def.length==2 && i==def[0] && j==def[1]){
						fireTarget=dd;
					}
				}
			}
			if(fireTarget) fireTarget.fire("click");
		}
		//draw menu button
		btn = $button({id:"sidemenu-button"},menuButtnTarget||target).bind("click",function(e){
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
		menu.find("dt",function(el){el.addClass("on")});
		return me;
	}

	this.expand = function(){
		menu.find("dt",function(el){el.removeClass("on")});
		return me;
	}
	this.dom = function(){return menu}
	this.selected = function(){return selection;}
	/*======== private methods ========*/
	var currentWithUrl = function(){//get focus cursor with current url
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
						$li(o,v_items);
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
		var vp = $p({textContent:val},v_cell);

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

	this.draw = function(){
		if(v_tabs)v_tabs.remove();
		v_tabs = $dl({class:"tab-menu"},target);
		if (opt.className) v_tabs.addClass(opt.className);

		for(var i=0,o;o=opt.items[i];i++){
			if(typeof(o)!=="object" || !o.name){
				console.log("$tab_menu WARN: skip:",o);
				continue;
			}
			var v_tab = $dd({name:o.name,html:o.title||o.name,"class":"tab-menu-item-"+o.name,i:i},v_tabs);
			if(i==cursor){
				v_tab.addClass("on");
			}
			v_tab.bind("click",function(e){
				v_tabs.find("dd").removeClass("on");
				this.addClass("on");
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
function $popup(content){
	var p = new Popup(content);
	p.draw.call(p);
	return p;
}

function Popup(content){
	var mask;
	var panel;
	var me = this;
	this.draw = function(){
		mask = $article({id:"mask"},document.body).bind('click',function(e){me.close()});
		panel = $section(content,mask).bind('click',function(e){e.stopPropagation()});
	};
	this.dom = function(){return panel;}
	this.close = function(){$.remove(mask);}
}

