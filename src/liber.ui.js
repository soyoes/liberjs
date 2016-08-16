
/**
 * form view element
 * @param  Object opt : 
 *         url : [required][string] submit url (relative path)
 *         items : [required][array] form item list,
 *         		form item example {
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
 *         onSubmit : [optional][function] function(params){ params = user input form data } you can use this to show loading indicator. 
 *         				or return false to stop submit.
 *         onSubmited : [optional][function] function(res){ res = server response data in json format } 
 *         onError : [optional][function] function(name,error){ name=form item name, error=error detail } 
 *         delegate : [optional] delegate object responses to these methods
 *         			delegate.onFormSubmit : alternative to opt.onSubmit,
 *         			delegate.onFormSubmited : alternative to opt.onSubmited,
 *         			delegate.onFormError : alternative to opt.onError,
 *         			delegate.drawFormItem: alternative to opt.drawItem,
 * @param  Element target : element object to append to
 * @return FormView instance
 *         public function dom() : return form element
 *         public function draw() : draw the form
 *         public function remove() : remove this form
 *         public function submit() : submit the form
 *         public function reset(clearData): clear all data and redraw the form, if clearData, the form data will be cleared too
 *         public function changes(): set or get changes, get:changes(), set:changes("myname","myvalue"), del:changes("myname",undefined);
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

	/*======== private properties ========*/
	var form;
	var data = opt.data||{};
	var changed = {};
	/*======== public methods ========*/
	this.dom = function(){return form}

	this.draw = function(){
		if(form)form.remove();
		form = $form({method:opt.method||"POST", action:opt.url||"", enctype:"multipart/form-data"},target);
		var v_items = $ul({},form);

		for(var i=0,o;o=opt.items[i];i++){
			if(typeof(o)!=="object" || !o.name){
				console.log("$formview WARN: skip:",o);
				continue;
			}
			o.type = o.type||"text";
			var v_item = $li({name:o.name,type:o.type,"class":o.required?"required":""},v_items);

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
				$input(args, v_cell).attr("type",o.type).bind("change",item_changed);
			}else if(o.type.match(/^(checkbox|radio)$/)){
				//TODO onchange
				window["$"+o.type](o.options,args,v_cell);
				v_cell.find('label',function(el,i){
					el.bind("click",function(e){
						this.parentNode.find("label",function(el1,i){
							var sel = el1.childNodes[1];
							el1.className=sel.checked?"on":"";
						});
					}).bind("change",item_changed);
				});
			}else if(o.type=='select'){
				$select(o.options, args, v_cell); //TODO onchange
			}else if(o.type.match(/^(image|file|autocomplete|list|tree|switch|calendar|period)$/)){//extentions
				window["$form_item_"+o.type].call(me, o, args, v_cell);
			}else{//custom tags
				var func = window["$"+o.type];
				if($.isFunc(func)){
					func.call(me, o, args, v_cell);
				}
			}
			var errors = $i({class:"error-"+o.name},v_cell);
			if(drawItem)drawItem(v_item, o);
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
		var items = opt.items.slice();

		for(var i=0,o;o=items[i];i++){
			// if(name=="html")continue;
			var name = o.name||o.attr("name"), 
				v = form[name]||false;
			if(o.type=="checkbox"){
				v = [];
				form.find("input[name='"+name+"']:checked",function(el){v.push(el.value)});
			}else if(o.type=="image"){
				var imo = form.find1st("img[name='"+name+"']");
				v = imo.src?imo.src.htmlencode():"";
			}else
				v = v?v.value.trim():false;
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
					if(wrong){
						errors++;
						// var li = form.find1st("li[name="+name+"]");
						// if(li)li.addClass("error");
						var el = form.find1st("i.error-"+name);
						var msg = o.validate;
						if(mn>=0) msg = "length must "+(mx?"between "+mn+"~"+mx:">"+mn);
						if(el) el.attr({html:"ERR: invalide "+msg}).show();
						el.parentNode.addClass("error");
						if(onError) 
							onError.call(form,name,o.validate);
					}
				}
			}
			if(v) params[name]=v;
		}

		if(!errors){
			var re = (onSubmit)?onSubmit(params):true;
			if(re && opt.url){
			    var method = (opt.method||($.isString(e)?e:"post")).toLowerCase();
			    $http[method](opt.url, params, function(r,e){
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

	this.changes = function(k,v){
		if(arguments.length==0)
			return changed;
		else{
			if(v!==undefined)changed[k]=v;
			else delete changed[k];
		}
	}
	this.remove = function(){
		if(form)$.remove(form);
	}
	/*======== private methods ========*/
	var item_changed = function(e){
		var v = this.value?this.value.trim():"";
		me.changes(this.name,v.length>0?v:undefined);
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
function $form_item_image(o, args, target){
	args.src = "data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg'><rect/></svg>";
	return $div($img(args),target).attr({class:"form-item-image"})
	.bind("click",function(e){
		var im = this.tagName=='IMG'?this:this.childNodes[0];
		//console.log(im);
		$.uploadWindow(function(r){
			var reader = new FileReader();
            reader.onload = function (e2) {
            	im.src = e2.target.result;
            };
            reader.readAsDataURL(this.files[0]);
		});
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
var $form_item_file = function(o, attrs, target){
	var amount = parseInt(o.amount) || 1;
	var fr = $div({class:"form-item-file"},target);
	var i=0;
	while(i++<amount)
		$div([
			$span(""), //file ext or the [+] btn
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
var $form_item_switch = function(opts, attrs, target){
    return $div([
    	$input($.extend({type:"hidden"},attrs)),
    	$b({class:'form-item-switch'},target).bind('click',function(e){
	    	if(this.hasClass('on')){
	    		this.previousSibling.value = 0;
	    		this.removeClass('on');
	    	}else{
	    		this.previousSibling.value = 1;
	    		this.addClass('on');
	    	}
    	}),
    ],target);
};

/**
 * autocomplete search box
 * @param  opts  : 
 * @param  attrs : {
 *     url : an url tells where to fetch json contents
 *     		autocomplete item will send GET request like url?keyword=value
 *     labelKey : property name of item label
 *     valueKey : property name of item value
 * }
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
var $form_item_autocomplete = function(opts, attrs, target){
	var items;
	var rowH = 40;
	return  $input($.extend({type:'text'},attrs),target)
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
    		return $.remove($('#form-item-autocomplete'));
    	}
    	if([16,17,91,37,39].indexOf(c)>=0)return;//ctrl, shift, cmd, left/right arrow events
    	if(c==40||c==38||(!ja&&c==13)){//40:down 38:up 13:enter,arrow key selection events
    		var al = $('#form-item-autocomplete');
    		if(!al)return;
    		al.childNodes.attr("class","");
			var size = al.attr('size');
    		var cursor = al.attr("cursor");
    		if(c==13){
    			if(cursor==null)cursor=(c==38?size-1:0);
    			ipt.value = al.childNodes[cursor].innerHTML;
    			al.remove();
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
    	if(api)
    		$http.get(api, {keyword : v}, function(res, err){
    			items = res;
    			$.remove($('#form-item-autocomplete'));
    			if(!err){
    				if(res.length>0){
    					var rect = $.rect(ipt);
    					var al = $ul({id:"form-item-autocomplete",size:res.length}, $this.layer)
    						.css({left:rect.left+"px", top:rect.top+rect.height+"px", width:rect.width+'px', height:Math.min(5,res.length)*rowH+"px"});
    					var item_clicked = function(){
							ipt.value = this.innerHTML;
							al.remove();
						}
    					for(var i=0,r;r=res[i];i++){
    						$li({html:lk?r[lk]:r,value:vk?r[vk]:r,i:i},al).bind('click',item_clicked);
    					}
    				}
    			}
    		})
    })
};

/**
 * a popup menu of radio/checkbox with many items.
 * @param  {[type]} opts   :data array
 * @param  {[type]} attrs  :{
 *         multiple : yes 
 * }
 * @param  {[type]} target : an element to append to
 * @return Element
 */
var $form_item_list = function(opts,attrs,target){
	var formItem;
	//click handler
	var item_clicked = function(e){
        if(this.attr("multiple")){
            this.className=this.className=='on'?'':'on';
        }else{//close
            formItem.childNodes[0].value = this.innerHTML;
            formItem.childNodes[1].innerHTML = this.innerHTML;
            this.className="on";
            this.parentNode.className="fadeout";
            e.stopPropagation();
            setTimeout(function(){
                $.remove(mask);
            },400)
        }
    }
    //draw items
    var formItem = $div([
    	$input($.extend({type:"hidden"},attrs)),
    	$span()
    ],target).addClass("form-item-list").bind('click',function(e){
        var mask = $div({id:"mask"},document.body).bind('click',function(){
            this.remove();
        });
        var r = $.rect(this);
        var ul = $ul($.extend({id:"form-item-list"},attrs),mask).css("margin-left",r.left+r.width+10+"px");
        for(var i=0,o;o=opts.options[i];i++){
            $li({i:i,html:o,multiple:attrs.multiple},ul).bind("click",item_clicked);
        }
    });
    return formItem;
}

/**
 * categorized list selection
 * @param  {[type]} opts   [description]
 * @param  {[type]} attrs  [description]
 * @param  {[type]} target [description]
 * @return {[type]}        [description]
 */
var $form_item_tree = function(opts, attrs, target){
	var lp,rp,tree,formItem,vals=attrs.value?JSON.parse(attrs.value):{};
		options = opts.options;
	//click handler (item)
    var item_clicked = function(e){
    	e.stopPropagation();
    	this.className=this.className=='on'?"":"on";
    	var i = this.attr("i");
    	var j = this.attr("j");
    	var pa = $id("form_tree_category_"+i);//parent

    	//update sections
    	var sel = pa.attr("sel");//get selected
    	sel = (sel!=null&&sel!=undefined)?(sel+"").split(","):[];
    	var txt = formItem.childNodes[1].innerHTML?formItem.childNodes[1].innerHTML.split(","):[];

    	var ix = sel.indexOf(""+j);//item idx inside selections
    	if(ix<0){
    		sel.push(""+j);//add idx of this item
    		txt.push(options[i].data[j]);
    	}else {
    		sel.splice(ix,1);//remove this item
    		ix = txt.indexOf(options[i].data[j]);
    		txt.splice(ix,1);
    	}
    	if(sel.length>0)
    		pa.attr("sel",sel.join(","));//save data to category item
    	else
    		pa.removeAttribute("sel");//remove selection data
    	pa.childNodes[1].attr({"html":sel.length+"",class:sel.length>0?"on":""});//update category item badge
    	if(sel.length>0)vals[i+""]=sel;
    	else delete vals[i+""];
    	formItem.childNodes[0].value=JSON.stringify(vals);//save value for submit
    	formItem.childNodes[1].innerHTML=txt.join(",");//update showing label
    }

    //click handler (category)
    var cat_clicked = function(e){
    	e.stopPropagation();
    	this.parentNode.find("li.on",function(el,i){
    		if(!el.attr("sel")) el.className="";
    	});
    	this.className='on';
    	//show items
    	rp.attr({html:"",class:""}).hide();
    	var i = this.attr("i");
    	var vs = vals[""+i]?vals[""+i]:[];
    	for(var j=0,oi;oi=options[i].data[j];j++){
    		$li({i:i,j:j,html:oi+"",class:vs.indexOf(j+"")>=0?"on":""},rp).bind("click",item_clicked);
    	}
    	rp.show().attr({class:"on"})
    }

	formItem = $div([
		$input($.extend({type:"hidden"},attrs)),
		$span()
	],target).addClass("form-item-tree").bind('click',function(e){
        var mask = $div({id:"mask"},document.body).bind('click',function(){
            this.remove();
        });
        var dv = (this.tagName=='SPAN')?this.parentNode:this;
        vals = dv.childNodes[0].value?JSON.parse(dv.childNodes[0].value):{};
        //console.log("vals",vals)
        var r = $.rect(this);
        tree = $div([
        	lp=$ul(), //categories
        	rp=$ol().bind("click",function(e){e.stopPropagation();}) //items
        ],mask).attr({id:"form-item-tree"}).css("margin-left",r.left+r.width+10+"px");
        var cs = Object.keys(vals);
        //draw categories
        for(var i=0,o;o=options[i];i++){
        	var selected = cs.indexOf(i+"")>=0;
            var li = $li({i:i,html:o.category,id:"form_tree_category_"+i, class:selected?"on":""},lp).bind("click",cat_clicked);
            $b({html:selected?vals[i+""].length+"":"", class:selected?"on":""},li);
            if(selected) li.attr("sel", vals[i+""].join(","));//set last value to cat item
        }
    });
    return formItem;
}

/**
 * calendar function
 * @param  {object} opts :
 *          x : calendar.left (float) [optional]
 *          y : calendar.top (float) [optional]
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
		return {hide:function(){
			if(window.liber_ui_calendar)window.liber_ui_calendar.remove();window.liber_ui_calendar=null;
			//window.onwheel = window.onmousewheel = document.onmousewheel = window.ontouchmove = document.onkeydown = null;
		}};

	//init
	var yyyy = opts.year||new Date().getFullYear(),
		mm = opts.month||new Date().getMonth()+1;

	var cal = window.liber_ui_calendar || $article({id:"calendar"},target);
	cal.attr({html:"",y:yyyy,m:mm}); //reuse
	if(opts.x)cal.css("left",opts.x+"px");
	if(opts.y)cal.css("top",opts.y+"px");

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
		col_y, col_m, col_d;

	var cbp_month = opts.monthHandler;
	var cbp_day = opts.dayHandler;
	var f_close = function(){
		cal.remove();
		window.liber_ui_calendar=null;
		//resume scroll
		//window.onwheel = window.onmousewheel = document.onmousewheel = window.ontouchmove = document.onkeydown = null;
	}
	var f_month_changed = function(e){//month change handler, calendar view
		e = e||window.event;
		var el = e.target||e.srcElement;
		var mdiff = el.className=='left'?-1:1;
		var d = new Date(cal.attr("y"),cal.attr("m")+mdiff-1,1);
		$calendar({year:d.getFullYear(),month:d.getMonth()+1,monthHandler:cbp_month,dayHandler:cbp_day});
		cal.title.className="highlight";
		if(cbp_month) cbp_month(d.getFullYear(),d.getMonth()+1,mdiff);
	}
	var f_day_handler = function(e){ //date selection handler, calendar view
		if(cbp_day)
			cbp_day(this.attr('yy'), this.attr('mm'), this.attr('dd'));
		f_close();
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
		var vy = parseInt(col_y.find1st(".scale3").innerHTML),
			vm = parseInt(col_m.find1st(".scale3").innerHTML),
			vd = parseInt(col_d.find1st(".scale3").innerHTML);
		if(cbp_day)
			cbp_day(vy,vm,vd);
		f_close();
	}

	//disable scroll
	window.onwheel = window.onmousewheel = document.onmousewheel = window.ontouchmove = document.onkeydown = function(){
		if(window.liber_ui_calendar && "scroll"!=window.liber_ui_calendar.attr("status"))
			f_close();
	};

	//draw title line
	var title_line = $tr($th({}),tbl);
	$th([
		cal.title = $u(yyyy+'年 '+mm+'月 ').bind('click',function(){//show year|month selection
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
				var i = parseInt(this.innerHTML);
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
		$td({html:""+dates[i].day,class:dates[i].month!=mm?"gray":'','yy':dates[i].year,'mm':dates[i].month,'dd':dates[i].day}, tar).bind("click",f_day_handler);
		if(i%7==6) $td({class:"space"},tar);
	}

	$tr($td({colspan:9,class:"space"}),tbl);

	btn_ok.hide();

	return window.liber_ui_calendar = cal;
}

var $form_item_calendar = function(o, attrs, target){
	return $input($.extend({type:"text"},attrs),target).addClass("form-item-calendar").bind("click",function(){
		var ipt = this;
		var rect = ipt.rect();
		var sch = $.screenHeight();
		$calendar({
			x : rect.left,
			y : rect.top+rect.height,//+300>sch && rect.top>300?rect.top-300:rect.top+rect.height,
			dayHandler:function(y,m,d){
				ipt.value = y+"-"+(m>9?m:"0"+m)+"-"+(d>9?d:"0"+d);
			}
		}, document.body);
	})
}

var $form_item_period = function(o, attrs, target){
	var f_show_cal = function(){
		var ipt = this;
		var rect = ipt.rect();
		$calendar({
			x : rect.left,
			y : rect.top+rect.height,
			dayHandler:function(y,m,d){
				ipt.value = y+"-"+(m>9?m:"0"+m)+"-"+(d>9?d:"0"+d);
				var tm = ipt.attr("time");
				var dates = [];
				ipt.parentNode.find("input[type=text]",function(el,i){
					dates.push(el.value);
				});
				ipt.parentNode.childNodes[3].value = dates.join(",")//update hidden field
			}
		}, document.body);
	};
	return $div([
		$input({type:"text",time:"start"},target).addClass("form-item-calendar").bind("click",f_show_cal),
		$span(" ~ "),
		$input({type:"text",time:"end"},target).addClass("form-item-calendar").bind("click",f_show_cal),
		$input($.extend({type:"hidden"},attrs),target)
	],target).attr({class:"form-item-period"});
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
 * @param  {object} delegate [optional] delegate which responses to these delegate methods 
 *                  delegate.drawListItem : alternative to opt.drawItem,
 *                  delegate.onListLoading : alternative to opt.onLoading,
 *                  delegate.onListLoaded : alternative to opt.onLoaded,
 *                  delegate.onListError : alternative to opt.onError,
 *                  delegate.onListEmpty : alternative to opt.onEmpty,
 *                  delegate.onListLastPage : alternative to opt.onLastPage,
 * @param {element} target : [requied]
 * @return {ListView} a ListView instance
 *          public function update(query)
 *          public function dom() return the table element
 *
 * @example : init
 *          $this.list = $list_view({url:"/api/users", sortKey:"id"}, $this.layer, $this.footer);//result MUST be saved as view's property or global var.
 * @example : search
 *          $this.list.update({keyword:"my keyword"})
 * @example : sort (automatic with header click event)
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
	var cursors = [0,this.perpage]; //start/end item index.
	var url = opt.url;
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
	var drawItem = opt.drawItem ||delegate.drawFormItem;
	var onLoading = opt.onLoading||delegate.onListLoading;
	var onLoaded = opt.onLoaded||delegate.onListLoaded;
	var onError = opt.onError||delegate.onListError;
	var onEmpty = opt.onEmpty||delegate.onListEmpty;
	var onLastPage = opt.onLastPage||delegate.onListLastPage;

	if(!query.limit)query.limit=perpage;

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
				if(onError)onError(err);
			}else if(!res || res.length==0){//empty
				if(onEmpty)onEmpty();
			}else{
				if(onLoaded){//user can custom response at this moment.
					var r = onLoaded.call(me,res);
					if(r) res = r;
				}
				total = res.total;
				if(append){
					items.concat(res.data)
				}else
					items = res.data;
				cursors[0] = items[0][sortKey];
				cursors[1] = items.last()[sortKey];
				if(!fields) fields = Object.keys(items[0]);
				drawItems();
			}
		});
		return me;
	}

	this.dom = function(){return table};

	/*======== private methods ========*/

	var drawItems = function(){
		if(!items || items.length==0)return;
		//draw header
		var row;
		if(table.childNodes.length==0){//draw header
			row = $tr({},table);
			for(var i=0,f;f=fields[i];i++){
				var k=$.isObject(f)?f.name:f;
				var hc = $th({html:f.title||f, key:k, class:k==sortKey?sortOrder+" on":(f.sortable?sortOrder:"none"), order:sortOrder},row);
				if(f.sortable)
					hc.bind('click',function(){
						sort.call(me,this.attr('key'),sortKey==this.attr('key')&&this.attr("order")=='asc'?'desc':'asc');
					});
			}
		}
		//draw items
		for(var i=append?cursors[0]:0,o;o=items[i];i++){
			if((!append&&i>=perpage)||(append&&i>=perpage+cursors[0]))return; //page over
			row = $tr({i:i},table);
			if(drawItem) //if delegate, use delegate.
				drawItem(row, o, i);
			else
				for(var j=0,f;f=fields[j];j++){
					var k=$.isObject(f)?f.name:f;
					$td({i:i,html:o[k],class:'item-view-'+k},row);
				}
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
		var def = opt.default||[0,0];
		//item select handler
		var onsel = function(e){
			var ii=this.attr("i"),
				jj=this.attr("j");
			selection=[ii,jj];
			menu.find("dd",function(dd){dd.removeClass("on");});
			this.parentNode.find(this.tagName.toLowerCase(),function(el,i){
				if(ii==el.attr("i") && jj==el.attr("j")){
					el.addClass("on");
					if(el.nextSibling && el.nextSibling.tagName=="DL"){
						if(el.nextSibling.childNodes.length>0)
							el.nextSibling.childNodes[0].fire("click");
					}
				}
				else el.removeClass("on");
			});
			console.log(jj, this.nextSibling)
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

	return me;
}

