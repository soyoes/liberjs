/**
 * 
 * opt = {
 * 	min:1
 * 	max:100
 * 	value:1
 * 	minLabel:true|false
 * 	maxLabel:true|false
 * 	id:ss
 * 
 * }
 * 
 * 
 * */

var $slider = function(opt,target){
	var WIDTH = opt.width||200;
	var btnclick = function(e){
		e = e||window.event;
		var ta = e.target||e.srcElement;
		var barRect = $ui.rect($id(ta.attr("barId")));
		var pRect = $ui.rect(ta.parentNode);
		var way = ta.className.indexOf("plus")>=0?1:-1;
		if(ta.tagName.toUpperCase()!="P")
			ta = ta.parentNode;
		var value = parseInt(ta.attr("value"));
		var max = parseInt(ta.attr("max"));
		var block = $id(ta.id+"-block"); 
		value = way>0? Math.min(value+1,max):Math.max(value-1,0);
		var left = Math.ceil(WIDTH*value/max)+(barRect.left-pRect.left);
		block.style.left = left+"px";
		ta.attr({"value":value});
		var label = $id(ta.id+"-label");
		label.innerHTML = value;
	};
	
	var barclick = function(e){
		e = e||window.event;
		var ta = e.target||e.srcElement;
		var rect = $ui.rect(ta);
		if(ta.tagName.toUpperCase()!="P")
			ta = ta.parentNode;
		var eLeft = e.pageX||e.clientX; 
		var loffset = eLeft-rect.left;
		var max = parseInt(ta.attr("max"));
		var value = Math.ceil(max*loffset/(WIDTH+17));
		value = Math.max(0,Math.min(value,max));
		var left = WIDTH*value/max+17;
		block.style.left = left+"px";
		ta.attr({"value":value});
		var label = $id(ta.id+"-label");
		label.innerHTML = value;
	};
	
	var sl = $p([
	        $span({"class":"label",id:opt.id+"-min-label",html:opt.minLabel?opt.min:""}),
     	    $i({"class":"minus","barId":opt.id+"-bar"}).bind({"click":btnclick}),
     	    $span({"class":"bar","var":"bar",id:opt.id+"-bar"}).bind({"click":barclick}),
     	    $i({"class":"plus","barId":opt.id+"-bar"}).bind({"click":btnclick}),
     	    $span({"class":"block",id:opt.id+"-block","var":"block"}).css({left:WIDTH*opt.value/opt.max+17+"px"}),
     	    $span({"class":"label",id:opt.id+"-label",html:opt.value}),
    ]).attr({"class":"slider","id":opt.id,"value":opt.value,"max":opt.max,"min":opt.min});

	var block = __["block"];
	
	block.onmousedown = function(e) {
	    e = e || window.event;
	    var target = e.target||e.srcElement;
	    var start = 0, diff = 0;
	    if( e.pageX) start = e.pageX;
	    else if( e.clientX) start = e.clientX;
	    window._dragStart = start;
	    window._dragStartLeft = parseInt(target.style.left.replace("px",""));
	    var bar = $id(target.id.replace("-block","-bar"));
	    var barRect = $ui.rect(bar);
	    var rect = $ui.rect(target);
	    window._dragMin = barRect.left+(start-rect.left);
	    window._dragMax = window._dragMin+WIDTH;
	    window._dragValueMax = parseInt(target.parentNode.attr("max"));
	    window._dragId = target.id;
	    e.stopPropagation();
	    
	    document.body.onmousemove = function(e) {
	        e = e || window.event;
	        var end = e.pageX|| e.clientX;
	        var value = (end<=_dragMin)?0:(end>=_dragMax?_dragValueMax:-1);
	        end = end<_dragMin?_dragMin:end;
	        end = end>_dragMax?_dragMax:end;
	        var left = _dragStartLeft+end-_dragStart;
	        target.style.left = left+"px";
	        value = value<0? Math.floor(left*_dragValueMax/217):value;
	        var label = $id(_dragId.replace("-block","-label"));
			label.innerHTML = value;
			$id(_dragId.replace("-block","")).attr("value",value);
	    };
	    document.body.onmouseup = function(e) {
	    	e = e || window.event;
	        document.body.onmousemove = document.body.onmouseup = null;
	        window._dragStart=window._dragStartLeft=window._dragMin=window._dragMax=window._dragValueMax=window._dragId=null;
	    };
	};
	
    if(target)target.appendChild(sl);
	
	return sl;
};