
var Calendar = function(attrs,onclick){
	var d =new Date();
	this.year = d.getFullYear();
	this.month = d.getMonth();
	this.wday = d.getDay();
	this.day = d.getDate();
	this.opts = attrs;
	this._onclick = onclick;
	this.onclick = function(e){
		if(!_this.onclick)
			return;
		e=e||window.event;
		var cell=e.target||e.srcElement;
		var date = cell.attr("date");
		var parts = date.split("-");
		var month = (cell.className.indexOf("lastmonth")>0)? parseInt(parts[1])-2:
					((cell.className.indexOf("nextmonth")>0) ? parseInt(parts[1]) : parseInt(parts[1])-1);
		date = new Date(parts[0],month,parts[2]);
		$("#calendar li",function(el,idx){
			el.className = el.className.replace(/\s*on/,''); 
		});
		cell.className += cell.className&&cell.className.length>0? " on":"on";
		_this._onclick(date,cell);
	};

	this.dom = undefined;

	var _this = this;

	// this.daysOfMonth = function(y,m){return 32 - new Date(y, m, 32).getDate();};	

	this.draw = function(){
		var attrs = this.opts?this.opts:{};
		attrs["id"] = "calendar";
		var frame = $id("calendar");
		if(!frame){
			frame = $div(attrs);
		}
		//frame.id = "calendar";
		_this.dom = frame;
		/* year - month row */

		var monstrs = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
			// wdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
			wdays 	= ['日','月','火','水','木','金','土'],
			//days = _this.calDays(_this.year, _this.month),
			// row = null,
			// thismon = false;
			start 	= new Date(this.year,this.month-6,1),
			end 	= new Date(this.year,this.month+18,1),
			tic 	= start;

		// $div([
		// 	$div([
		// 		// $a({href:"#",html:"<"}).bind("click",_this.prevMonth),
		// 		$label({html:monstrs[_this.month]+", "+_this.year}),
		// 		// $a({href:"#",html:">"}).bind("click",_this.nextMonth),
		// 	]).css("minWidth",'100px').attr({"class":"titleWrapper"}),
		// ],frame).attr({"class":"title"});
		$ul((function(){
			var lis = [];
			for(var wd in wdays)
				lis.push($li(wdays[wd]));
			return lis;
		})(),frame).attr({"class":"subtitle"});

		var days = $ul({"class":"days"},frame);
		while(tic<end){
			var dt = tic.getDate();
			if(dt==1){//draw month
				var w = tic.getDay();
				for (var i=0; i<8; i++) {$li({},days);};
				$li({"class":"month",html:tic.getMonth()+1+"月"},days);
			
				for (var i=0; i<6; i++) {
					$li({},days);
				};
			}
			$li({"class":"day",html:dt+""},days);
			tic = new Date(tic.getTime()+86400*1000);
		}
	};
};


/*FIXME delete do this in ui.ext or ui.calendar*/
$ui.calendar = function(target,attrs,onclick ){
	if(typeof(target)=="string")target = $id(target);
	if(!target)return;
	target.innerHTML="";
	var dom = "";
	if ($ui._calendar){
		dom = $ui._calendar.dom;
		target.appendChild(dom);
	}else{
		var cal = new Calendar(attrs,onclick);
		cal.draw();
		$ui._calendar=cal;
		target.appendChild(cal.dom);
	}
	return $ui._calendar;
};