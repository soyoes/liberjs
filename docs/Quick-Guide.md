## Installation Guide

* download or checkout all js files from here 

* put them in your WEBROOT/JS_DIR


----

## 1 Minute Guide

#### Using Render Only

After the [Installation Guide](#installation-guide).

1) In your HTML. 

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"></meta>
  <script src="YOUR_JS_PATH/liber.js"></script>  
</head>
<body>
  <script>
    window.onload = function(){
      TABLE([
        TR([
          TH("ColHeader1"),
          TH("ColHeader2"),
          TH("ColHeader3")
        ]),
        TR([
          TD("ColValue1"),
          TD("ColValue2"),
          TD("ColValue3")
        ]),
      ], document.body);
    }
  </script>
</body>
</html>

```

2) Check the result on your browser

## 5 Minutes Guide

#### Using App & ViewController

1) In your HTML. 

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"></meta>
  <script>
    //configuration of liberJS
    var $conf = {
      default_view : "list_view"
    };
    //define a master data for example
    var countries = {
      "1":{id:1, name:"USA", domain:"us"},
      "2":{id:2, name:"China", domain:"cn"},
      "3":{id:3, name:"Japan", domain:"jp"},
      "4":{id:4, name:"German", domain:"de"},
      "5":{id:5, name:"United Kindom", domain:"uk"},
      "6":{id:6, name:"France", domain:"fr"},
    }
  </script>
  <script src="YOUR_JS_PATH/liber.js"></script>
  <script src="YOUR_JS_PATH/views.js"></script>     
</head>
<body>
  <script>
    window.onload = $app.start;
    //this will load $conf.default_view as the first controller
  </script>
</body>
</html>

```

2) In your views.js

```Javascript

//declaration of list_view ($conf.default_view)

var list_view = {

  //has to have a same name of this view object.
  name : "list_view", 

  //implement the delegate method to draw the view
  drawContent : function(wrapper, layer){ 
    //define a table, and insert to this view.
    var list = $table([ //$table() is the same thing with TABLE()
      $tr([
        $th("ID"),
        $th("NAME").attr(),
        $th("DOMAIN")
        //LiberJS supports most of the Element manipulate methods like jQuery
      ])
    ],wrapper);
    
    for(var i in countries){
      var c = countries[i];
      $tr([
        $td(c.id),
        $td(c.name),
        $td(c.domain)
      ],list).attr({url:"detailed_view?id="c.id}), 
      //add rows to list.
      //url : declare view transition, 
      //Once this row be clicked detailed_view will be presented with parameters id=c.id
    }
  }
};

//declaration of detailed_view

var detailed_view = {
  name : "detailed_view",
  onLoad : function(params){
    //an optional delegate method like drawContent, 
    //you can load data or init the view here.
    //params is parameters from access url, 
    //in this case it will be {id:c.id}
    this.country = countries[params.id];
    //this means detailed_view, you can also use $this instead.
    this.loaded(); //required. you must call this after initialization.
  },
  drawHeader : function(header){
    //another optional delegate method to draw the header of a view.
    $h1($this.country.name, header);
  },
  drawContent : function(wrapper){
    var c = $this.country;
    $p(c.id,wrapper),
    $p(c.name,wrapper),
    $p(c.domain,wrapper),
  },
  drawFooter : function(footer){
    //optional delegate method to draw the footer of a view.
    $button("Close", footer).bind("click", $this.close);
    //once it is clicked, this view(detailed_view) will be closed and go back to the last view(list_view)
  },
  
};

```



3) Check the result on your browser
