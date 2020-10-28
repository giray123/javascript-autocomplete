var Autocomplete = function({selector, minChar, extraParentClasses, ajax, fixSearch, manualAjax, submitHandler, delay, highlight}){
    // variable declerations
    var processId   = null,
        $input      = document.querySelector(selector),
        input_backup= "",
        activeIndex = -1,
        minChar     = minChar || 0,
        delay     = delay || 500,
        highlight = typeof highlight  == "undefined" ? true : highlight,
        url;

    // create a wrapper
    var $parent = $input.parentNode;
    var $wrapper = document.createElement('div');
        $wrapper.classList.add("ac-wrapper")
        $wrapper.style.position = "relative";
        $wrapper.style.display = "inline-block";
        if(extraParentClasses){
            $wrapper.className+=' '+extraParentClasses;
        }
    $parent.replaceChild($wrapper, $input);
    $wrapper.appendChild($input);

    // create a clear icon
    var $icon_clear = document.createElement('div');
        $icon_clear.classList.add("ac-autocomplete-clear-icon", "ac-hidden")
        $icon_clear.title = "clear"
        $icon_clear.addEventListener('click', iconClearClick)
        $wrapper.appendChild($icon_clear);

        function iconClearClick(){
            $input.value = ""
            $list.innerHTML = ""
            cancelAjaxSearch()
            $input.focus()
            $icon_clear.classList.add("ac-hidden")
        }

    // create suggestion list
    var $list = document.createElement('div')
        $list.classList.add('ac-suggestion-list')
        $wrapper.appendChild($list);

    // input event listeners
    $input.addEventListener('input', inputChange)
    $input.addEventListener('keydown', keydown)
    $input.addEventListener('blur', blur)

    function blur(){
        cancelAjaxSearch()
        // $list.innerHTML = "";
    }

    function inputChange(){
        cancelAjaxSearch()
        input_backup = $input.value
        if(input_backup != ""){
            processId = setTimeout(()=>{startAjaxSearch(input_backup)}, delay)
        }
        checkIconClear()
    }
    function checkIconClear(){
        if($input.value != ""){
            $icon_clear.classList.remove("ac-hidden")
        }else{
            $icon_clear.classList.add("ac-hidden")
        }
    }
    function keydown(event){
        // console.log('keydown')
        var keycode = (event.keyCode ? event.keyCode : event.which)

        if(keycode == 40){ // DOWN
            var count = $list.childElementCount
            if(count){
                if(activeIndex == -1){
                    activeIndex++
                    $list.childNodes[activeIndex].classList.add('active')
                    $input.value = $list.childNodes[activeIndex].innerText
                }else if(activeIndex >= count-1 ){
                    $list.childNodes[activeIndex].classList.remove('active')
                    activeIndex = -1
                    $input.value = input_backup
                }else{
                    $list.childNodes[activeIndex].classList.remove('active')
                    activeIndex++
                    $list.childNodes[activeIndex].classList.add('active')
                    $input.value = $list.childNodes[activeIndex].innerText
                }
            }
            event.preventDefault();
            return false;
        }
        // click on next lyric
        else if(keycode == 38){ // UP
            var count = $list.childElementCount
            if(count){    
                if(activeIndex == -1){
                    activeIndex = count-1
                    $list.childNodes[activeIndex].classList.add('active')
                    $input.value = $list.childNodes[activeIndex].innerText
                }else if(activeIndex == 0){
                    $list.childNodes[activeIndex].classList.remove('active')
                    activeIndex = -1
                    $input.value = input_backup
                }else{
                    $list.childNodes[activeIndex].classList.remove('active')
                    activeIndex--
                    $list.childNodes[activeIndex].classList.add('active')
                    $input.value = $list.childNodes[activeIndex].innerText
                }
            }
            event.preventDefault();
            return false;
        }
        else if(keycode == 13){ // ENTER
            cancelAjaxSearch()
            event.preventDefault()
            $list.innerHTML = "";
            submitHandler($input.value)
            return false;
        }
        else if(keycode == 27){ // ESCAPE
            $list.innerHTML = "";
            return false;
        }
        else if(keycode == 9){ // TAB
            // $list.innerHTML = "";
        }
        else if(keycode == 37 || keycode == 39){ // LEFT - RIGHT
            // do nothing
        }
    }
    function cancelAjaxSearch(){
        clearTimeout(processId)
    }

    async function startAjaxSearch(search){
        if(search.length < minChar) return

        if(fixSearch){ search = fixSearch(search)}

        var results = []
        if(manualAjax){
            var results = await manualAjax(search);
            console.log(results, 'results')
            showAutocompleteList(results, search)
        }else{
            var request = new XMLHttpRequest();
            request.open(ajax.method, ajax.url+ajax.fields+search, true);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            request.onreadystatechange = function() {
                if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                    console.log('succeed');
                    console.log(request.responseText);
                    if(ajax.responseHandler){
                        results = ajax.responseHandler(request.responseText)
                        showAutocompleteList(results, search)
                    }else{
                        showAutocompleteList(request.responseText, search)
                    }
                }else{
                    console.log('server error');
                }
            };
            request.onerror = function(e) {
                console.log('something went wrong');
                console.log(e)
            };
            request.send();
        }
    }

    function showAutocompleteList(array, search){
        var results = array

        $list.innerHTML = "";
        if(results.length>0){
            for (var i = 0; i < results.length; i++) {
                var $result = document.createElement("div")
                    $result.classList.add("autocomplete-result")
                    $result.title = results[i] // for truncated texts hover should reveal the whole text
                    $list.appendChild($result)
                    var $text = document.createElement("div")
                        $text.classList.add("autocomplete-text")
                        if(!highlight) $text.innerText = results[i]
                        else {
                            var regex = new RegExp(search.trim(), "ig");
                            $text.innerHTML = results[i].replace(regex, (match, contents, offset, input_string)=>`<b>${match}</b>`)   
                        }
                        /**
                             * this is required because @blur event on input is fired before suggestionClick and
                             * prevents it. However @mousedown.prevent fires before @blur and prevents it
                             */
                        // $text.addEventListener('mousedown', function(e){e.preventDefault()}) // prevent 
                        $text.addEventListener('mousedown', resultClick)
                        $result.appendChild($text)
                    var $mobile_icon = document.createElement("div")
                        $mobile_icon.classList.add("autocomplete-mobile-icon")
                        $mobile_icon.setAttribute("data", i)
                        $mobile_icon.addEventListener('mousedown', resultIconClick)
                        $result.appendChild($mobile_icon)
            }
        }
        // reset active index
        activeIndex = -1;
    }

    function resultClick(e){
        e.preventDefault()
        if(e.which != 1) return; // only progress on left mouse clicks
        console.log('resultClick')
        $input.value = e.currentTarget.innerText
        $list.innerHTML = ""
        submitHandler($input.value)
    }
    function resultIconClick(e){
        e.preventDefault()
        console.log('iconClick')
        $input.value = $list.childNodes[e.currentTarget.getAttribute("data")].innerText
        cancelAjaxSearch()
        startAjaxSearch($input.value)
        $input.focus()
    }
    function value(str){
        $input.value = str
        cancelAjaxSearch()
        checkIconClear()
    }
    function focus(){
        $input.focus()
    }
  
    return {
        context: ()=>{
            return {
                processId   : processId,
                $input      : $input,
                activeIndex : activeIndex
            }
        },
        focus: focus,
        value: value
    }
};