$utils.package("liber.ui.ext");
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