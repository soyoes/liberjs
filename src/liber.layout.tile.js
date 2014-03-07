/*
 * @delegates:
 * 		smInitCell(cell,row,col)
 * 		smBeforeMove(cell,animateOption)
 * 		smAfterMove(cell)
 * 		
 * */

var $layout = {
	init : function(target, delegate, opts){
		$layout.panel 	= target;
		$layout.header 	= $app.drawHeader? $app.drawHeader(target):$div({id:"header"},target);
		$layout.content = $div({id:"content"},target);
		$layout.wrapper = $div({className:"wrapper"},$layout.content);
		$layout.footer 	= $app.drawFooter? $app.drawFooter(target):$div({id:"footer"},target);
		$conf.query_all_layer = true;
	},
	drawView : function(view){
		var target = view.params.target || $layout.wrapper,
			before = view.params.before; 
		if(typeof(target)=="string") target = $id(target);
		if(typeof(before)=="string") before = $id(before);
		if(!target) return;
		//target.innerHTML="";
		var art = $article({view:view.name}); 
		if(!view.noHeader){
			if(view.drawHeader)
				view.drawHeader($header({},art));	
		}
		if(view.drawContent){
			view.layer = art;
			view.wrapper = $section({},art);
			view.drawContent(view.wrapper,art);	
		}
		if(!view.noFooter){
			if(view.drawFooter)
				view.drawFooter($footer({},art));	
		}
		if($app.layoutOnload){
			$app.layoutOnload(art,target,before,view);
		}else{
			if(!before)
				target.appendChild(art);
			else
				target.insertBefore(art,before);
		}
	},
	closeView:function(view){
		$ui.remove(view);
		$ui.remove(view.layer);
	}
};
$app.layout = $layout;