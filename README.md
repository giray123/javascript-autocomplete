# Javascript Autocomplete
Autocomplete snippet for HTML input fields build with:
- native javascript
- no dependencies
- with OR without AJAX

## Quick Start

Add JS onto your html
```html
<script src="autocomplete.js"></script>
```
Add either raw or default CSS styles to your html
(feel free to change any CSS according to your html)
```html
<!-- bare minimum styles -->
<link rel="stylesheet" href="/css/autocomplete-raw.css">
<!-- bare minimum styles + a little bit more CSS for better UI -->
<link rel="stylesheet" href="/css/autocomplete-default.css">
```
Initialize Autocomplete object with your configurations
### Without AJAX
```js
var autocomplete = new Autocomplete({
    selector: "#search_wihtout_ajax",
    minChar: 1,
    delay: 100,
    list: ['apple', 'applepie', 'abacus', 'grape', 'watermelon', 'cherry'],
    submitHandler: function(str){
        console.log("Searched: "+str)
    }
})
```
### Without AJAX + Custom Search Function
```js
var autocomplete = new Autocomplete({
    selector: "#search_wihtout_ajax_custom_search",
    minChar: 1,
    delay: 100,
    list: ['apple', 'applepie', 'abacus', 'grape', 'watermelon', 'cherry'],
    customSearch: function(value, list){
        var regexp = new RegExp(value.toLowerCase().trim())
        var results = list.filter(v=>regexp.test(v)).sort()
        return results
    },
    submitHandler: function(str){
        console.log("Searched: "+str)
    }
})
```
### With AJAX + Builtin XMLHttpRequest Request
```js
var autocomplete = new Autocomplete({
    selector: "#search_auto_ajax",
    minChar: 1,
    maxListHeight: 400,
    ajax: {
        method: "GET",
        url: "https://kitsu.io/api/edge/anime",
        withCredentials: false,
        fields: "?fields[anime]=titles&page[limit]=10&filter[text]",
        responseHandler: function(response){
            var array = JSON.parse(response).data
                            .map(v=>v.attributes.titles.en || v.attributes.titles.en_jp)
                            .filter(v=>v) // remove false/undefined values
            console.log(array, 'array')
            return array
        },
    },
    beforeAjax : function(search){
        return search.toLowerCase()
    },
    submitHandler: function(str){
        console.log("Searched: "+str)
    }
})
```
### With AJAX + Custom AJAX Handler
```js
var autocomplete = new Autocomplete({
    selector: "#search_manual_ajax",
    minChar: 1,
    manualAjax: function(value){
        // you need to return a promise here
        // feel free to use any AJAX library you want
        return new Promise(function(resolve, reject){
            var request = new XMLHttpRequest();
            request.open('GET', 'https://kitsu.io/api/edge/anime?fields[anime]=titles&page[limit]=10&filter[text]='+value, true);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            request.onreadystatechange = function() {
                if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                    console.log('succeed');
                    console.log(request.responseText);
                    var array = JSON.parse(request.responseText).data.map(v=>v.attributes.titles.en || v.attributes.titles.en_jp)
                    resolve(array)
                }else{
                    console.log('server error');
                }
            };
            request.onerror = function(e) {
                console.log('something went wrong');
                reject(e)
            };
            request.send();
        })
    },
    beforeAjax : function(search){
        return search.toLowerCase()
    },
    submitHandler: function(str){
        console.log("Searched: "+str)
    }
})
```
