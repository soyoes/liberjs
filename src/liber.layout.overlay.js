/*
 * @delegates:
 * 		smInitCell(cell,row,col)
 * 		smBeforeMove(cell,animateOption)
 * 		smAfterMove(cell)
 * 		
 * */
var $layout = {
	init : function(target, delegate, opts){
		
	},
	drawView : function(view){
		var _drawView = function(target, view){
			target.attr("view", view.name);
			if(!view.noHeader){
				var header =  $app.drawHeader? $app.drawHeader(target):$div({id:"header"},target);
				if(view.drawHeader)
					view.drawHeader(header);	
			}

			var content = $div({id:"content"},target);
			var wrapper = $div({"class":"wrapper",id:"wrapper",layer:target.attr("layer")},content);

			if(view.drawContent){
				if(view.layer)
					$ui.remove(view.layer);
				view.layer = target;
				view.wrapper = wrapper;
				view.drawContent(wrapper,target);	
			}

			if(!view.noFooter){
				var footer =  $app.drawFooter? $app.drawFooter(target):$div({id:"footer"},target);
				if(view.drawFooter)
					view.drawFooter(footer);
			}
		}; 
		if(view.reusable && view.layer){
			$ui.bringLayerToFront(view.layer);
			if(view.drawContent){
				view.drawContent(view.wrapper,view.layer);	
			}
			return;
		}
		$ui.addLayer(_drawView,view);
	},
	closeView:function(view){
		$ui.removeLayer(view);
	}
	
};
$app.layout = $layout;