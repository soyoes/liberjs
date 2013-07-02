/*
* IndexedDB
*
*/
var $db = {
	
	/**
	 * 
	 * schemas : [
	 * 		{name : storageName1, options:{keyPath:"SSN"}, indexes:{email:true, name:false}},
	 * 		{name : storageName2}
	 * ]
	 * 
	 * */
		
	init:function(db_name, schemas){
		$db.name = db_name;
		$db.schemas = schemas;
		window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB;
	    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
	    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
	    if (window.indexedDB) {
	    	var ver = 1;
	        var req = indexedDB.open(db_name, ver);
	        req.onupgradeneeded =  function(e) {
	        	var db = req.result || e.result;  
	        	if(db.objectStoreNames.contains(db_name)) {
	        		db.deleteObjectStore(db_name);
	        	}
	        	if(schemas){
	        		for(var i=0;i<schemas.length;i++){
		        		var schema = schemas[i];
		        		var store = db.createObjectStore(schema.name,schema.options?schema.options:{keyPath:"id"});
		        		if(schema.indexes){
		        			for(var idx in indexes){
		        				var unique = indexes[idx];
		        				store.createIndex(idx, idx, {unique:unique});
		        			}
		        		}
		        	}
	        	}
	        };
	        req.onsuccess = function(e) {
	            db = e.target.result;
	            getAllTodoItems();
	        };
	        req.onerror = function (event) {
	        	console.log("indexedDB.open Error: " + event.message);
	        };
	    }   
	},
	get:function(store_name, key, callback){
		var req = db.transaction([store_name]).objectStore(store_name).get(key);
		req.onsuccess = function(e){callback(e.target.result);};
	},
	add: function(store_name, data, callback){
		var req = db.transaction([store_name], "readwrite").objectStore(store_name);
		if($utils.isArray(data)){
			for(var i in data)
				req.add(data[i]);
		}else{
			req.add(data);
		}
	},
	update :function(store_name,key, data, callback){
		var req = db.transaction([store_name], "readwrite").objectStore(store_name);
		req.delete(key).onsuccess=function(e){
			req.add(data).onsuccess=callback;
		};
	}, 
	queryIndex:function(store_name, idx, value, callback){
		var schema = $db.schemas[store_name];
		if(!schema){return callback(null);}
		var indexes = schema.indexes;
		if(undefined==indexes[idx])return callback(null);
		var req = db.transaction([store_name]).objectStore(store_name);
		if(indexes[idx]==true){
			req.index(idx).get(value).onsuccess=function(e){
				callback(e.target.result);
			};
		}else{
			var res=[];
			req.index(idx).openCursor().onsuccess=function(e){
				var cursor = e.target.result;
				if(cursor){
					if(cursor.key==value)
						res.push(cursor.value);
					cursor.continue();
				}else{
					callback(res);
				}
			};
		}
		
	},	
	/**
	 * comparator:function(v){ if(v....) .... return true|false;}
	 * 
	 * */
	query:function(store_name, comparator, callback){
		var req = db.transaction([store_name]).objectStore(store_name);
		var res = [];
		req.openCursor().onsuccess=function(e){
			var cursor = e.target.result;
			if(cursor){
				var match=comparator(cursor.value);
				if(match)res.push(cursor.value);
			}else{
				callback(res);
			}
		};
	},
	del : function(store_name, key, callback){
		var req = db.transaction([store_name], "readwrite").objectStore(store_name).delete(key);
		req.onsuccess = callback;
	},
	all : function(store_name, callback){
		var req = db.transaction([store_name]).objectStore(store_name);
		req.getAll().onsuccess = function(event) {
			callback(event.target.result);
		};
	}
};
