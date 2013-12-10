

function $_autocomplete(opts){
	var datas = opts.datas,
		ipt = opts.input;
	ipt.attr({"datas":datas.join(",")}).bind("keyup",function(e){
		e=e||window.event;
		var t = e.target||e.srcElement;
		var datas = t.attr("datas").split(","),filtered=[],v=t.value;
		datas.forEach(function(el,idx){
			if(el.indexOf(v)==0){filtered.push(el)}
		});
		var ul =$id(t.id+"-datas"); 
		if(!ul){
			var rect= $ui.rect(t),
				prect= $ui.rect(t.parentNode);
			var atop = rect.top - prect.top,
				aleft = rect.left - prect.left,
			ul = $ul({id:t.id+"-datas"},t.parentNode).css({position:"absolute";width:rect.width+"px",height:filtered.length*20+"px",
				top:atop+rect.height+"px",left:aleft+"px",zIndex:1});
		}
		ul.innerHTML = "";
		if(filtered.length>0){
			ul.style.display="block";
			filtered.forEach(function(el, idx){
				$li(el,ul);
			});
		}else{
			ul.style.display="none";
		}
	});
	
}