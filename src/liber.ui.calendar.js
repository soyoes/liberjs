
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
		_this._onclick(date);
	};

	this.dom = undefined;

	var _this = this;

	this.daysOfMonth = function(y,m){return 32 - new Date(y, m, 32).getDate();};	

	this.daysOfLastMonth = function(y,m){
		var _1st_wday =  new Date(y,m,1).getDay();
		if(_1st_wday==0)
			return [];
		var last_m = m==0?11:m-1,
			last_y = m==0?y-1:y,
			last_m_days = this.daysOfMonth(last_y, last_m),
			res = [];
		for(var i = last_m_days-_1st_wday+1; i<=last_m_days;i++)
			res.push(i);
		return res;
	};

	this.calDays = function(y,m){
		var days = this.daysOfLastMonth(y,m);
		var currentDays = this.daysOfMonth(y,m);
		for(var i=1;i<=currentDays;i++){
			days.push(i);
		}
		var lastwday = days.length%7;
		if(lastwday>0){
			for(var i=1;i<=7-lastwday;i++)
				days.push(i);	
		}
		return days;
	};

	this.nextMonth = function(e){
		var cal = $id("calendar"),
			m = _this.month,
			y = _this.year;
		cal.innerHTML="";
		_this.month = m==11?0:m+1;
		_this.year = m==11?y+1:y;
		_this.draw();
		e.preventDefault();
	};
	this.prevMonth = function(e){
		var cal = $id("calendar"),
			m = _this.month,
			y = _this.year;
		cal.innerHTML="";
		_this.month = m==0?11:m-1;
		_this.year = m==0?y-1:y;
		_this.draw();
		e.preventDefault();
	};


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
			wdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
			days = _this.calDays(_this.year, _this.month),
			row = null,
			thismon = false;
		
		$div([
			$div([
				$a({href:"#",html:"<",onclick:_this.prevMonth}),
				$label({html:monstrs[_this.month]+", "+_this.year}),
				$a({href:"#",html:">",onclick:_this.nextMonth}),
			]).css("minWidth",'100px').attr({"class":"titleWrapper"}),
		],frame).attr({"class":"title"});
		$ul((function(){
			var lis = [];
			for(var wd in wdays)
				lis.push($li(wdays[wd]));
			return lis;
		})(),frame).attr({"class":"subtitle"});
				
		for(var d in days){
			if(d%7==0) row = $ul({"class":"days"},frame);
			var day = days[d];
			if(!thismon && day==1) thismon = true;
			else if(thismon && day==1) thismon = false;
			var cls = !thismon?(d<7?"other lastmonth":"other nextmonth"):((d%7==0)?"sun":(d%7==6?"sat":""));
			$li({html:day,"class":cls,"date":[_this.year,(_this.month+1)<10?"0"+(_this.month+1):_this.month+1,
					day<10?"0"+day:day].join("-")},row).bind('click',_this.onclick);
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
};