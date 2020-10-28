var Autocomplete = function({selector, minChar, extraParentClasses, ajax, manualAjax, submitHandler, delay, highlight}){
    // variable declerations
    var processId   = null,
        $input      = document.querySelector(selector),
        input_backup= "",
        activeIndex = -1,
        minChar     = minChar || 0,
        delay     = delay || 500,
        highlight = typeof highlight  == "undefined" ? true : highlight,
        url;

    // create a wrapper div for input and suggestion list
    var $parent = $input.parentNode;
    var $wrapper = document.createElement('div');
        $wrapper.style.position = "relative";
        if(extraParentClasses){
            $wrapper.className+=' '+extraParentClasses;
        }
    $parent.replaceChild($wrapper, $input);
    $wrapper.appendChild($input);

    // create a clear icon
    var $icon_clear = document.createElement('div');
        $icon_clear.classList.add("ac-autocomplete-clear-icon", "ac-hidden")
        $icon_clear.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"  width="24" height="24" viewBox="0 0 24 24">
                <path fill="#969696" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
        `
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
                $list.classList.add('ac-suggestion_list')
                $wrapper.appendChild($list);

    $input.style.paddingRight = "50px"
    var inputPaddingLeft = 0
    function syncCssParameters(){
        var inputStyles = getComputedStyle($input)
        $list.style.fontFamily = inputStyles.fontFamily
        $list.style.fontSize = inputStyles.fontSize
        $list.style.lineHeight = inputStyles.lineHeight
        inputPaddingLeft = inputStyles.paddingLeft
        inputHeight = inputStyles.height
    }
    function createEmbeddedCSS(){
        var styles = `
            // AUTOCOMPLETE CSS - start
            .ac-hidden{
                display: none;
            }
            .ac-suggestion_list{ 
                width: 100%;
                position: absolute;
                left: 0px;
                text-align: left;
                background-color: white;
                max-width: 100%;
                z-index: 5;
                border-radius: 5px;
                overflow: hidden;
                border: 1px solid #e8e8e8;
                border-top: none;
            }
            .ac-autocomplete-clear-icon{
                position: absolute;
                top: 0;
                right: 35px; 
                width: 40px;
                height: 100%;
            }
            .ac-autocomplete-clear-icon:hover{
                cursor: pointer;
            }
            .ac-suggestion_list div.autocomplete-result { 
                max-width: 100%;
                display: flex;
            }
            .ac-suggestion_list div:hover { 
                cursor: pointer;
                background-color: whitesmoke;
            }
            .ac-suggestion_list div.active { 
                background-color: #e4e2e2;
            }
            .ac-suggestion_list div.autocomplete-text { 
                padding: 5px ${inputPaddingLeft};
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex-grow: 1;
            }
            .ac-suggestion_list div.autocomplete-mobile-icon { 
                display: none;
                flex-shrink: 0;
                width: 40px;
                background-image: url(/public/img/icons/arrow-top-left.svg);
                background-repeat: no-repeat;
                background-position: center;
            }
            @media screen and (max-width: 768px) {
                .ac-suggestion_list div.autocomplete-result { 
                    min-height: 40px;
                }
                .ac-suggestion_list div.autocomplete-mobile-icon { 
                    display: initial;
                }
            }
            // AUTOCOMPLETE CSS - end
        `
        var styleSheet = document.createElement("style")
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)
    }

    syncCssParameters()
    createEmbeddedCSS()
    $input.addEventListener('input', inputChange)
    $input.addEventListener('keydown', keydown)
    $input.addEventListener('blur', blur)


    function blur(){
        // console.log('blur')
        cancelAjaxSearch()
        // $list.innerHTML = "";
    }
    function inputChange(){
        // console.log('inputChange')
        cancelAjaxSearch()
        input_backup = $input.value
        if($input.value != ""){
            processId = setTimeout(()=>{search()}, delay)
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
    // function scrollList(parent, child){
    //     if(child.offsetTop > (parent.offsetHeight - child.offsetHeight)){
    //         parent.scrollTop = child.offsetTop - (parent.offsetHeight - child.offsetHeight);
    //     }
    // }
    function cancelAjaxSearch(){
        clearTimeout(processId)
    }

    async function search(input){
        // console.log('search')
        var search = $input.value.toLowerCase()
        // console.log('search:' + search)
        if(search.length < minChar) return;

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
        search()
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
        search: search,
        focus: focus,
        value: value
    }
};