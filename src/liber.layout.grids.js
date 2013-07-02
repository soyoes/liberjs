/*
 * @delegates:
 * 		smInitCell(cell,row,col)
 * 		smOnMove(delta)
 * 		
 * */
var $layout = {
	rows : 3,
	cols : 5,
	center : {row:1,col:1},
	cursor : {row:1,col:1},
	cellHeight: $ui.screenHeight(),
	cellWidth:$ui.screenWidth(),
	
	leftWidth:0,
	rightWidth:0,
	topHeight:0,
	bottomHeight:0,
	
	init : function(target, delegate, opts){
		//console.log("screen size",$layout.cellWidth,$layout.cellHeight);
		if(delegate){
			$layout.delegate = delegate;
		}
		if(opts){
			for(var k in opts)$layout[k]=opts[k];
		}
		var frame = $div({"id":"sm-frame"},target).css({width:$layout.cellWidth,height:$layout.cellHeight,overflow:"hidden"});
		var layout = $div({id:"sm-layout"},frame);
		var sumH=0,sumW=0,cells=[];
		for(var r=0;r<$layout.rows;r++){
			cells[r]=[];
			sumW = 0;
			var h = $layout.topHeight&&r==0?$layout.topHeight:($layout.bottomHeight&&r==$layout.rows-1?$layout.bottomHeight:$layout.cellHeight);
			var sh = (r==$layout.rows-1 && h<$layout.cellHeight) ? sumH+h-$layout.cellHeight:sumH;
			for(var c=0;c<$layout.cols;c++){
				var w = $layout.leftWidth&&c==0?$layout.leftWidth:($layout.rightWidth&&c==$layout.cols-1?$layout.rightWidth:$layout.cellWidth);
				var sw = (c==$layout.cols-1 && w<$layout.cellWidth ) ? sumW+w-$layout.cellWidth:sumW;
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
				if(r==$layout.cursor.row&&c==$layout.cursor.col){
					//console.log("set margin",sumW,sumH);
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
		layout.onscroll = function(e){
			e.preventDefault();
		};
		$layout.cells = cells;
		$layout.width = sumW;
		$layout.height = sumH;
		$layout.panel = layout;
	},
	drawView : function(view){
		//get cellidx from view
		var pos = view.cell;  
		if(!pos||pos.row==undefined||!pos.col==undefined){
			//use right one
			pos = {row:$layout.cursor.row, col:$layout.cursor.col+1};
		}
		var dis={row:pos.row-$layout.cursor.row, col:pos.col-$layout.cursor.col};
		
		//drawView to cell
		var cell = $layout.cells[pos.row][pos.col];
		if(!(view.reusable && cell.innerHTML && cell.innerHTML.length>0)){
			cell.innerHTML = "";
			cell.attr("view", view.name);
			if(!view.noHeader){
				var header =  $app.drawHeader? $app.drawHeader(cell):$div({id:"header"},cell);
				if(view.drawHeader)
					view.drawHeader(header,cell);	
			}

			var content = $div({id:"content"},cell);
			var wrapper=$div({},content).css({overflow:"hidden","overflow-y":"auto", "-webkit-overflow-scrolling":"touch",height:"1024px"});
			
			if(view.drawContent){
				view.layer = cell;
				view.wrapper = wrapper;
				view.drawContent(wrapper,cell);	
			}

			if(!view.noFooter){
				var footer =  $app.drawFooter? $app.drawFooter(cell):$div({id:"footer"},cell);
				if(view.drawFooter)
					view.drawFooter(footer);
			}
		}
		//move
		$layout.move(dis.row, dis.col);
		
	},
	closeView : function(view){
		var pos = $layout.last || $layout.center;
		var dis={row:pos.row-$layout.cursor.row, col:pos.col-$layout.cursor.col};
		//move
		$layout.move(dis.row, dis.col);
	},
	move : function(rowOffset, colOffset){
		if($layout.distance)
			return;
		$layout.last = $utils.clone($layout.cursor);
		var nextRow = rowOffset+$layout.cursor.row;
		var nextCol = colOffset+$layout.cursor.col;
		if(nextCol >= $layout.cols || nextCol<0)
			colOffset=0;
		if(nextRow >= $layout.rows || nextRow<0)
			rowOffset=0;
		//console.log(rowOffset, colOffset,"MOVE TO:",nextRow,nextCol)
		if(rowOffset!=0||colOffset!=0){
			var currentCell = $layout.cells[$layout.cursor.row][$layout.cursor.col];
			var targetCell = $layout.cells[nextRow][nextCol];
			var dis = {
				orgX : parseInt(currentCell.attr("x")),
				orgY : parseInt(currentCell.attr("y")),
				x:parseInt(targetCell.attr("x"))-parseInt(currentCell.attr("x")),
				y:parseInt(targetCell.attr("y"))-parseInt(currentCell.attr("y"))
			};
			$layout.distance = dis;
			$layout.cursor.col = nextCol;
			$layout.cursor.row = nextRow;
			var layout = $id("sm-layout");
			var dur = 200;
			var animeOpt = {
				frame : 20,
				duration:dur,
				step:function(el, delta){
					el.style.marginLeft = -1*($layout.distance.orgX+delta*$layout.distance.x);
					el.style.marginTop = -1*($layout.distance.orgY+delta*$layout.distance.y);
					if($layout.delegate.smOnMove)
						$layout.delegate.smOnMove(delta);
				}
			}; 
			$layout.panel.animate(animeOpt);
			setTimeout(function(res){
				$layout.distance = null;
			},dur+100);
		}
	},
	clear:function(row,col){
		if($layout.cells[row]&&$layout.cells[row][col]){
			var c = $layout.cells[row][col];
			c.innerHTML = "";
		}
	}
};
$app.layout = $layout;