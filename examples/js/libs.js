var $custom_radio = function(opts, attrs, target){
	return $sel(opts, $.extend({
		drawOption:function(el, i){
			var o = opts[i];
			el.innerHTML = "";
			$input({type:"checkbox",name:attrs.name},el);
			$div([
				$span({class:"off",html:o.label}),
				$span({class:"on",html:o.label}),
			],el).attr({class:"button"});
  			$div({class:"knob"},el);

		}
	},attrs),target);
};
