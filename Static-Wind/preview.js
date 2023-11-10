let COMP_LOAD = document.querySelectorAll("[html-src]").length; // total number of component need to load

(() => {
    // Load all HTML using fetch, keep for preview but will soon remove after the translation update
    document.querySelectorAll("[html-src]").forEach(elm => {
        fetch(elm.getAttribute('html-src')).then(res => res.text())
        .then((res) => {
            elm.innerHTML = res + elm.innerHTML; // do not over write file
            compLoaded();
        });
    });
})();