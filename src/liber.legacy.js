window.$ui = $ui||{};
$ui.rect = $.rect;
$ui.screenHeight = $.screenHeight;
$ui.screenWidth = $.screenWidth;
$ui.show = $.show;
$ui.hide = $.show;
$ui.toggle = function(el){if(el)el.toggle()};
$ui.height = function(el){return el?el.height():0};
$ui.width = function(el){return el?el.width():0};
$ui.insertBefore = function(el,t){if(el)el.before(t)};
$ui.insertAfter = function(el,t){if(el)el.after(t)};
$ui.unselectable = function(el){if(el)el.selectable(false)};

$.empty = $.isEmpty;
$.sort = function(){};
$.keyCode = function(e){return e.keyCode||e.charCode;}
