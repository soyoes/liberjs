var $doughnut = function(opt,target){
  var name = opt.name;
  var num = opt.num;
  var scale = opt.scale||20;
  var color = opt.color||"rgba(228,93,60,1)";
  var bgcolor = opt.bgcolor||"rgba(0,0,0,0.6)";//"rgba(51,41,34,0.8)";//"rgba(52,73,94,0.9)";
  var anime = opt.anime!==false;
  
  var drawStep = function(canv, v, delta){
	  delta = delta||1;
	  var ctx = canv.getContext("2d");
      ctx.clearRect(0,0,100,100);
      var r = 45;
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = bgcolor;
      ctx.lineWidth = 0;
      if(delta>=1&&v>=1){
        ctx.arc(50, 50, r, 0, 2*Math.PI, false);  
      }else{
        var h = 100-delta*v*100;
        var ang = h>50? Math.atan((h-50)/r):Math.atan((50-h)/r);
        //console.log(h);
        ctx.arc(50, 50, r, h>50? ang:-1*ang,h>50? Math.PI-ang:Math.PI+ang, false);  
      }
      ctx.fill();
      ctx.closePath();
      ctx.restore();
      //draw round;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(50, 50, 48, 0, (delta*v)* 2*Math.PI, false);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
  }

  var draw = function(){
    var canv = $canvas({width:"100px",height:"100px"},target);
    $strong(""+num,target);
    $label(name,target);
    if(!anime){
    	drawStep(canv, num*2/scale* Math.PI ,delta);
    }else{
      canv.attr("value",parseFloat(num/scale)).animate({
        duration:300,
        step:function(el,delta){
        	drawStep(el, parseFloat(el.attr("value")) ,delta);
        }
      });
    }
  }
  draw();

};