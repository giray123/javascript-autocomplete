<h1 align="center">Javascript Autocomplete</h1>
<p align="center">Autocomplete snippet for HTML input fields built with native javascript</p>
<p align="center"><img src="img/search_auto_ajax.gif"></p>

This snippet:
- is built with **native javascript**
- requires **no dependencies**
- can be used **with OR without AJAX**
- highy **customizable** yet very **simple**
- user experience is **inspired from Google search**

## Usage

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
<p align="center"><img src="img/search_wihtout_ajax.gif" style="margin: 20px;"></p>

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
<p align="center"><img src="img/search_wihtout_ajax_custom_search.gif" style="margin: 20px;"></p>

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
<p align="center"><img src="img/search_auto_ajax.gif" style="margin: 20px;"></p>

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
<p align="center"><img src="img/search_manual_ajax.gif" style="margin: 20px;"></p>

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

## Configuration
### Global Options
| attribute  | type | default | description |
| -------------       | -------- | ---- | ------------- |
| `selector`            | string   | required | html input element query selector (`document.querySelector(selector)`)
| `minChar`             | integer  | `0`    | minimum number of letters for search to start
| `delay`               | integer  | `500`  | milliseconds after which search starts if there is no other input by the user
| `list`                | array    | optional | array of strings to search for. This automatically disables AJAX calls.
| `customSearch`        | function | optional | if `list` is provided, this will override the default list search function. Default search function trims and lowercases the input and makes a simple regex search (`"^"+search.toLowerCase().trim()+".*$"`) on the list. It sorts the filtered values at the end.
| `extraParentClasses`  | string   | optional | any additional classes for the wrapper element
| `ajax`                | object   | optional | configuration object in case of using built-in XMLHttpRequest AJAX requests. Object attributes are listed below.
| `beforeAjax`          | function | optional | this function manipulates the user input before search starts. For example, you can make the input lowercase
| `manualAjax`          | function | optional | this function is for a custom AJAX function istead of the built-in XMLHttpRequest. It should return a promise. Please see the example.
| `submitHandler`       | function | required | this function defines what to do when user submits an input after autocomplete, presses enter on any autocomplete suggestion etc.
| `highlight`           | boolean  | `true` | when enabled, autocomplete list will highligh search string on autocomplete rows 
### Built-in XMLHttpRequest Ajax Options
| attribute  | type | default | description |
| -------------       | -------- | ---- | ------------- |
| `ajax.method`         | string   | `"GET"`| built-in XMLHttpRequest AJAX method
| `ajax.url`            | url      | required | built-in XMLHttpRequest AJAX method
| `ajax.withCredentials`| boolean  | `false`| whether to send credentials with built-in XMLHttpRequest AJAX
| `ajax.fields`         | object   | `"?search="`| query parameters to append to url
| `ajax.responseHandler`| object   | optional | when AJAX returns any response this function is used to manipulate the response. It must return an array of strings.
## Mobile Friendliness

Screen sizes below 768px also display arrows on suggestion list so that users could tap and copy the value onto the search field without submitting a value.

<p align="center"><img src="img/mobile_friendly.gif" style="margin: 20px;"></p>

## LICENSE
This project is ![](license)licensed under the terms of the MIT license.