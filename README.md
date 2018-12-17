any.js
=======


A pure javascript web framework

# Goals
* Liberated the server from view rendering.
* Save your much time from making pages UI.
* Make the view transition under controll by independent logic
* Provide better UX by reducing the delay on screen transition.

# Main features
* Written in pure JS
* Message driven architecture, all view controllers only need to implement required delegate methods .
* Libraries can be included automatically.
* Render HTML with js functions named as same as HTML Tags, with nested layout support.
* Various utils, such as http, sockets, storage ...
* Various UI Components, such as List, Form, Spreadsheets, Auto complete...
* Reusable DomElement
* History control.
* Works on IE8+ , Webkit(Chrome, Safari, Opera), Firefox.

# About The Framework

* [Installation Guide](#installation-guide)


----

* [One Minute Guide](#one-minute-guide)
* [Five Minutes Guide](#five-minutes-guide)

----

* [Architecture](#architecture)
* [View Controllers & Delegate](#view-controllers--delegate)
* [Selectors](#selectors)
* [Draw HTML Tags](#draw-html-tags)
* [Animations](#animations)
* [HTTP Request](#http-request)
* [Socket Request](#socket-request)
* [Garbage Collection](#garbage-collection)
* [History](#history)
* [Source Code Compression](#source-code-compression)


----

* [Class Reference](#class-reference)



## Installation Guide

* download or checkout all js files from here 

* put them in your WEBROOT/JS_DIR


----

## One Minute Guide
After the [Installation Guide](#installation-guide).

1) In your HTML.

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"></meta>
  <title>Test page of any.js</title>
  <script src="YOUR_JS_PATH/any.js"></script>
  <script src="YOUR_JS_PATH/views.js"></script>     
</head>
<body>
</body>
</html>

```

2) In your views.js

```javascript

var my_view = {
    name : "my_view",
    drawContent : function(wrapper, layer){ //implement the delegate method
        $table([
            $tr([
                $th("ColHeader1"),
                $th("ColHeader2"),
                $th("ColHeader3")
            ]),
            $tr([
                $td("ColValue1"),
                $td("ColValue2"),
                $td("ColValue3")
            ]),
        ], document.body);
    }
};

window.onload = function(){
  $app.start("my_view");
}

```

3) Check the result on your browser


----


## Five Minutes Guide
* Read [#OneMinuteGuide this] first.
* To create common header
```Javascript
$app.drawHeader = function(header){
    //draw a H1 tag with innerHTML of 'MY WEB SERVICE', and append to header
    //all pages will be affected by this setting
    $h1("MY WEB SERVICE", header);
}
```

* To create common footer
```Javascript
$app.drawFooter : function(footer){
    //draw an <A> tag with href='the url',and innerHTML of 'Copyright' and append to footer
    //all pages will be affected by this setting
    $a({html:"Copyright",href:'https://my-great-company.com'}, footer);
};
```

* To customize header of the current view
```Javascript
var my_view = {
    name : "my_view",
    drawHeader : function(header){
        //draw a H1 tag with innerHTML of 'MY VIEW', and append to header
        $h1("MY VIEW", header);
    },
    drawContent : function(wrapper, layer){ //implement the delegate method
        //...
    }
};
```

* To customize footer of the current view
```Javascript
var my_view = {
    name : "my_view",
    drawHeader : function(header){
        //...
    },
    drawContent : function(wrapper, layer){ //implement the delegate method
        //...
    },
    drawFooter : function(footer){
        //draw an <A> tag with href='the url',and innerHTML of 'Copyright' and append to footer
        $a({html:"Copyright",href:'https://my-great-company.com'}, footer);
    },
};
```

* What's next?
    Read from [#Architecture Architecture] please.

----


## Architecture ##
| File | Module | Description |
| --- | --- | --- |
| any.js | | Core modules & functions |
| | Element.prototype | Let normal DOMElement works like jQuery, which can '''bind''', '''css''', '''attr''', '''animate'''  themselves [[BR]] without create new big objects into the memory like jQuery/ExtJS/dojo does  ... |
| | Date.prototype | |
| | String.prototype | |
| | $app.* | The application (singleton) |
| | $http.* | Ajax tool kits |
| | $.* | common utilities |
| any.ui.js | | Extensions like FormView, ListView, Calendar ... |
| any.net.js | | Core modules & functions |
| | SocketKits($socket.*) | Web socket tool kits (TODO) |
| any.oauth.js | | common Oauth Library |
| any.db.js | | Local Storage Database Library |


## Draw HTML Tags

### Normal Tags

```Javascript
/**
 * @param OPTIONS : 
 *      can be String, Object, Array 
 *      String : be trait as src for <img> and innerHTML of the other tags
 *      Object : attribuites of this tag
 *          - any official attribute.
 *          - any custom key name.
 *          - "html" = shortcut of innerHTML
 *          - "class" = shortcut of className
 *      Array : an array of children nodes.
 * @param TARGET : [optional], target Dom Element to append to 
 * @return : Element Object (with extension methods)
 *      
 */
TAG_NAME_UPPERCASE(OPTIONS, TARGET);//uppercased tagname
//OR
$TAG_NAME_LOWERCASE(OPTIONS, TARGET);//lowercased tagname with a prefix of $
//OR
$e(TAGNAME, OPTIONS, TARGET);//TAGNAME can be upper or lower case, and you can combine with ID or class name, such as li.classname, ul#myId
```

 * Most of the html tags can be written with the same name js functions
 * table,tr,th,td,div,img,ul,lo,li,p,a,b,strong,textarea,br,hr,form,input,span,label,h1,h2,h3...
 * The following shortcut functions are not predefined, to use them, please use $e function instead.
```
html,script,link,iframe,head,body,meta,
(Deprecated) : acronym,applet,basefont,big,center,dir,font,frame,frameset,noframes,strike,tt
(uncommon) : details-summary,dialog,bdi,command,menu,track,wbr
(Others) : rp-rt-ruby,object-param,noscript,del,blockquote,ins
```

### Attribuites

#### Set attributes
* .attr(key, value);
```javascript
//Syntax 
/**
 * @param key : key name String or Object
 * @param value : value
 * @return : this Element Object.
 */
Element.attr(key, value);

//Example
var el = $div({html:'My DIV', class:'my-div-cls'});
el.attr('data-id',1234).attr({'data-key':'myKey','data-value':'myVal'});//.attr method returns Element Object.
document.body.appendChild(el) // can be used as same as Element Object

//these code are exactly same with 
var el = $div({html:'My DIV', class:'my-div-cls',
    'data-id':1234,'data-key':'myKey','data-value':'myVal'}, document.body);

```

#### Get attributes
* .attr(key);
```javascript
//Syntax 
/**
 * @param key : [String] key name String
 * @return : value [Mixed]
 */
Element.attr(key);

//Example
var el = $div({html:'My DIV', 'data-id':'myId'});
var id = el.attr('data-id'); // id='myId'
```

### Styles
#### Set Styles
* .css(key, value)
```javascript
//Syntax 
/**
 * @param key : key name String or Object
 * @param value : value
 * @return : this Element Object.
 */
Element.css(key, value);

//Example
$div('my div').css({color:'red',fontSize:'11pt'});
```

#### Get Style
* .css(key)
```javascript
//Syntax 
/**
 * @param key : style key name
 * @return : this Element Object.
 */
Element.css(key);

//Example
var cl = $div('my div').css('color'); //cl='red'
```

### Bind Events handlers
* .bind(eventname, func)
```javascript
//Syntax 
/**
 * @param eventname : JS event name
 * @param func : JS Function instance
 * @return : this Element Object.
 */
Element.bind(eventname,func);

//Example
var cl = $div('my div')
    .attr({class:'my-class-name'})
    .bind('click',function(e){
        console.log('Clicked : '+this.innerHTML);
    })
    .bind('doubleclick',function(e){
        console.log('DoubleClicked : '+this.innerHTML);
    })
```


* Example : Draw single Element.

```javascript

//These are basically same.
$div() === DIV() 

//Create a link with href=http://google.com and append to #myDiv
$a("http://google.com/", $id("myDiv"));

//Draw img tag with src=...
$img("http://google.com/images/xxxx.png");

//Create a <label> with innerHTML=Hey!..... and set color=red, id=myLabel
$label("Hey! How are you doing.")
    .css({"color":"red"})
    .attr({id:"myLabel"}); 

//create a element like this: <div id="myDiv">the content of this div</div>
$div({id:"myDiv", html:"the content of this div"}); 

```

* Example : Draw Nested Elements

```javascript
$table([
    $tr([
        $th("ColHeader1"),
        $th("ColHeader2"),
        $th("ColHeader3")
    ]),
    $tr([
        $td("ColValue1"),
        $td("ColValue2"),
        $td("ColValue3")
    ]),
], document.body);

```

Result
| ColHeader1 | ColHeader2 | ColHeadler3 |
| --- | --- | --- |
| ColValue1 | ColValue2 | ColValue3 |


### Special Form Tags

#### checkbox / radiobox
* $sel(options, attrs, target)
```Javascript
/**
 * checkbox / radiobox
 * 
 * @param options : Array, 
 *      [{label:"label1",value:"value1"},{label:"label2",value:"value2"}}...]
 * @param attrs : {
 * 		name : [required] name of form item
 * 		type : [required] checkbox|radio .
 * 		drawOption : function(el, i, attrs ){} //custom drawing,
 * 			             // el=<label>-<input> element, i=index, 
 * 		onclick : function(){},... //other events are also supported
 * }
 * @param target : which dom to append to
 * @return : Element
 * */
$sel(options,attrs,target);

//Example
$sel(
    [{label:'Male',value:'male'},{label:'Female',value:'female'}],
    {name:'gender',type:'radio'},
    document.body
)
```

### Dropdown

```Javascript
/**
 * @param opts: array of list items, @see $sel
 * @param attrs: Element attrs
 * 		.multiple: multiple selection
 * 		.default : default value
 * 		.value : value
 * 		.onSelect: function (e, i)
 * @method setLabel(label) : set txt inside selectbox
 */
$dropdown(opts,attrs,tar)
```



## View Controllers & Delegate

### Layers
Every time your draw a view with $ui.drawView. a new layer will be created and the other layers will be hidden.[[BR]]
Also there will be a [#GarbageCollection Garbage Collection] mechanism to prevent memory overflow.[[BR]]
[[BR]]

### Draw Views With Delegate
There are 3 steps to draw a view so you can implement the following 3 delegate methods to finish drawing.[[BR]]
1. view.drawHeader
 * Optional : default will be $app.drawHeader

2. view.drawContent
 * Required : or the body will be blank

3. view.drawFooter
 * Optional : default will be $app.drawFooter.

To present the view controller. you have to call
```javascript
  // this will be changed in the future.
  $app.loadView("YOUR_VIEW_NAME"); 
  
  // or 
  $div({url:"YOUR_VIEW_NAME?param1=b&param2=b"});
  
```

## Selectors
* $(query, thisLayer) selector : XPath selector, similar with jQuery selector. but you can specify if select from all layer or just current one. and the return value is Element but not jQuery Object
```javascript
$("#id"); //return Element
$(".className"); //return Element list
$("#myId .className", function(el, idx){ ... }); //do foreach on selected elements;
```

* $id() selector : = document.getElementById() MUCH faster than XPath selector $("#ID")

### Advanced Topics
* FormView
```javascript
$ui.formView();
Coming soon ...
```

* Show messages
```javascript
$ui.showMessage();
Coming soon ...
```


## Animations

### Usage
```javascript
Element.animate(OPTIONS);

Available OPTIONS:
@delay : time wait to start
@frame : how many frames per second. (1000ms) | 50
@duration : The full time the animation should take, in ms. default = 1000ms
@delta(progress) : A function name, which returns the current animation progress. @see deltas
@style : easeIn(default), easeOut, easeInOut
@step(element, delta) : function. do the real job

Examples:
$id("img").animate({
  delta :"bounce",  
  style : "easeOut",
  step: function(el, delta){
    el.style.marginTop = delta*600;
  }}).animate({
  delta :"quad",
  style :"easeOut",
  step:function(el, delta){
    el.style.marginLeft = delta*600;
    el.style.width = delta*24*10; 
  }});

```

### Deltas
* linear : Average speed.
```
>>>>>>>>>>
```

* quad : Accelerator 
```
o > >> >>> >>>> >>>>>
```

* quad5 : Accelerator faster
```
o > >>> >>>>> >>>>>>> >>>>>>>>>>>
```

* circ : Throwing 
```
o >> > ... > >> >>> >>>>
```

* back : bow - arrow 
```
<< < o > >> >>> >>>>
```

* bounce : 
```
< > < > < > o > >> >>> >>>>
```

* elastic :
```
< > << >> <<< >>> o > >> >>> >>>>
```

### Styles
* easeIn : same with the delta progress.
* easeOut : reverse the delta progress. 
* easeInOut : repeat 0~50% of the time of the delta progress and reverse it on the rest 50%.

## HTTP Request
* .get : $http.get(URL,PARAMS, CALLBACK, FORMAT)
```javascript
$http.get("/api/test", {page:1}, function(res){console.log(res)}, "json");
```

* .post : $http.get(URL,PARAMS, CALLBACK, FORMAT)
```javascript
$http.get("/api/test", {user:U, pass:P}, function(res){console.log(res)}, "html");
```

* .put : $http.get(URL,PARAMS, CALLBACK, FORMAT)
    send request with method = PUT
```javascript
$http.put("/api/test/1", {pass:P}, function(res){console.log(res)}, "text");
```

* .del : $http.get(URL,PARAMS, CALLBACK, FORMAT)
    send request with method = DELETE
```javascript
$http.put("/api/test/1", {}, function(res){console.log(res)}, "json");
```


## Socket Request
```javascript
Coming soon ...
```

## Garbage Collection
TODO : remove inactive layers


----


## Class Reference ##

### Element.prototype ###
