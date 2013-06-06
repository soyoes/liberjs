/*
 * @delegates:
 * 		smInitCell(cell,row,col)
 * 		smBeforeMove(cell,animateOption)
 * 		smAfterMove(cell)
 * 		
 * */
var $sm = {
	rows : 3,
	cols : 3,
	center : {row:1,col:1},
	cursor : {row:1,col:1},
	cellHeight: $ui.screenHeight(),
	cellWidth:$ui.screenWidth(),
	
	leftWidth:0,
	rightWidth:0,
	topHeight:0,
	bottomHeight:0,
	
	init : function(target, delegate, opts){
		console.log("screen size",$sm.cellWidth,$sm.cellHeight);
		if(delegate){
			$sm.delegate = delegate;
		}
		if(opts){
			for(var k in opts)$sm[k]=opts[k];
		}
		var layout = $div({id:"sm-layout"},target);
		var sumH=0,cells=[];
		for(var r=0;r<$sm.rows;r++){
			cells[r]=[];
			var sumW = 0;
			var h = $sm.topHeight&&r==0?$sm.topHeight:($sm.bottomHeight&&r==$sm.rows-1?$sm.bottomHeight:$sm.cellHeight);
			var sh = (r==$sm.rows-1 && h<$sm.cellHeight) ? sumH+h-$sm.cellHeight:sumH;
			for(var c=0;c<$sm.cols;c++){
				var w = $sm.leftWidth&&c==0?$sm.leftWidth:($sm.rightWidth&&c==$sm.cols-1?$sm.rightWidth:$sm.cellWidth);
				var sw = (c==$sm.cols-1 && w<$sm.cellWidth ) ? sumW+w-$sm.cellWidth:sumW;
				var cell = $div({id:"cell-"+r+"-"+c,className:"sm-layout-cell",x:sw,y:sh,w:w,h:h},layout).css({
					float:"left",
					width:w,
					height:h,
					position:"relative",
					overflow:"hidden"
				}); 
				if(delegate && delegate.smInitCell){
					delegate.smInitCell.call(delegate, cell, r, c);
				}
				if(r==$sm.cursor.row&&c==$sm.cursor.col){
					console.log("set margin",sumW,sumH);
					layout.css({marginTop : -1 * sumH + "px",marginLeft : -1 * sumW + "px"});
				}
				sumW+=w;
				cells[r].push(cell);
			}
			sumH+=h;
		}
		layout.css({
			width : sumW + "px",
			height : sumH + "px",
			position: "relative",
			overflow : "hidden",
		});
		$sm.cells = cells;
		$sm.width = sumW;
		$sm.height = sumH;
		$sm.layout = layout;
	},
	move : function(rowOffset, colOffset){
		if($sm.distance)
			return;
		var nextRow = rowOffset+$sm.cursor.row;
		var nextCol = colOffset+$sm.cursor.col;
		if(nextCol >= $sm.cols || nextCol<0)
			colOffset=0;
		if(nextRow >= $sm.rows || nextRow<0)
			rowOffset=0;
		console.log(rowOffset, colOffset,"MOVE TO:",nextRow,nextCol)
		if(rowOffset!=0||colOffset!=0){
			var currentCell = $sm.cells[$sm.cursor.row][$sm.cursor.col];
			var targetCell = $sm.cells[nextRow][nextCol];
			var dis = {
				orgX : parseInt(currentCell.attr("x")),
				orgY : parseInt(currentCell.attr("y")),
				x:parseInt(targetCell.attr("x"))-parseInt(currentCell.attr("x")),
				y:parseInt(targetCell.attr("y"))-parseInt(currentCell.attr("y"))
			};
			$sm.distance = dis;
			$sm.cursor.col = nextCol;
			$sm.cursor.row = nextRow;
			var layout = $id("sm-layout");
			var dur = 300;
			var animeOpt = {
				frame : 20,
				duration:dur,
				step:function(el, delta){
					el.style.marginLeft = -1*($sm.distance.orgX+delta*$sm.distance.x);
					el.style.marginTop = -1*($sm.distance.orgY+delta*$sm.distance.y);
				}
			}; 
			$sm.layout.animate(animeOpt);
			setTimeout(function(res){
				$sm.distance = null;
			},dur+100);
		}
	}
}