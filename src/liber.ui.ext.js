$ui.countDown = function(domId,callback){
	if(domId)
		$ui.counterDomId = domId;
	if(callback)
		$ui.counterCallback = callback;
	setTimeout(function(){
		if($ui.counterDomId){
			var dom = $id(_this.counterDomId);
			var counter =parseInt(dom.innerHTML)-1;
			dom.innerHTML = counter;
			if(counter>0){
				$ui.countDown();
			}else{
				if($ui.counterCallback)
					$ui.counterCallback();
				$ui.counterDomId = null;
				$ui.counterCallback = null;
			}
		}
	},1000);
};



String.prototype.screenSize=function(font, fontSize, maxWidth){
	var text = this;
	var rowSpliter = "\n";
	var di = document.createElement('input');
	di.id = 'dummy_text_size_calculator';
	var style = {
		border:0,
		margin:0,
		outer:0,
		padding:0,
		color:'trasparent',
		backgroundColor:'trasparent',
		whiteSpace:'nowrap'
	};
	for(var k in style)
		di.style[k] = style[k];
	
	if(font)
		di.style.fontFamily=font;
	if(fontSize)
		di.style.fontSize=fontSize;
	var lines = text.split(rowSpliter);
	var longestRow = "";
	var rowCols = [];
	for (var r in lines){
		var row = lines[r];
		if(row.length>longestRow.CJKLength())longestRow = row;
		rowCols.push(row.length);
	}
	di.value = longestRow;
	di.size = longestRow.CJKLength();
	document.body.appendChild(di);
	var size = {width:di.clientWidth+di.size, height:(di.clientHeight+1)*lines.length};
	di.parentNode.removeChild(di);
	if(maxWidth && size.width>maxWidth){
		var charW = size.width / longestRow.length;
		var maxChars = Math.floor(maxWidth/charW);
		size.width = maxWidth;
		var orgRows = lines.length;
		var rowH = size.height/orgRows;
		for(var i=0;i<rowCols.length;i++){
			var chars = rowCols[i];
			if(chars>maxChars)
				orgRows += (Math.ceil(chars*charW/maxWidth)-1);
		}
		size.height = orgRows * rowH;
	}
	console.log(text+"-"+fontSize+":"+(size.width)+","+(size.height));
	return size;
};


/**
 * opts = {
 * 	width : 240
 * 	height : 18
 *  label : "Loading ... "
 *  labelStyle : {}
 *  strokeColor : #ccc
 *  bgColor : #666 
 *  update : function(progress, params)
 *  finish : function()
 * }
 * 
 * css : {
 * 	#progress-bar-frame
 *  #progress-bar-label
 * }
 * 
 * */
$ui.progressBar =function(target,max,opts){
	var ProgressBar = function(target,max,opts){
		opts = opts||{};
		var barWidth = opts.width || 240;
		var barHeight = opts.height || 3;
		var maxValue = max;
		var value = 0;
		var labelPrefix = opts.label || "Loading ... ";
		var barFrame = $div({id:"progress-bar-frame"},target).css({margin:"300px auto auto auto",position:"relative",width:barWidth+"px",height:barHeight+"px",padding:"2px",border:"1px solid #666",borderRadius:"3px",fontSize:"0pt"});
		var canv = $canvas({width:barWidth,height:barHeight},barFrame);
		var barLabel = $span({id:"progress-bar-label",html:labelPrefix+"0%"},document.body).css(opts.labelStyle||{position:"absolute",top:310+barHeight+"px",width:"100%",height:"20px",zIndex:100,color:"#333",textAlign:"center",fontFamily:"impact"});
		var ctx = canv.getContext? canv.getContext("2d"):null;
		var onUpdate = opts.update||null;
		var onFinish = opts.finish||null;
		if(ctx){
			ctx.fillStyle = opts.bgColor|| "#666";
		    ctx.strokeStyle = opts.strokeColor||"#CCC";
		    ctx.lineWidth = 10;
		}
	    this.update = function(param){
	    	value++;
			var progress = parseInt(value*100/maxValue);
			if(onUpdate){onUpdate(progress,param);}
			if(ctx){
				canv.attr({"value":progress});
				canv.animate({
	    	        duration:300,
	    	        step:function(el,delta){
	    	        	var v=el.attr("value");
	    	        	var w = delta*v/100*barWidth;
	    	           	ctx.fillRect(0, 0, w, barHeight);
	    	        }
	    	    });
			}
			barLabel.innerHTML=labelPrefix+progress+"%";
    		if(progress>=100){
    			$ui.remove("progress-bar-frame");
    			$ui.remove("progress-bar-label");
    			if(onFinish){onFinish();}
    		}
		};
	};
	
	return new ProgressBar(target,max,opts);
};