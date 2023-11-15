// script to allow pages to build preview without translation
(() => {
    // Load all HTML using fetch, keep for preview but will soon remove after the translation update
    document.querySelectorAll("[html-src]").forEach(elm => {
        fetch(elm.getAttribute('html-src')).then(res => res.text())
        .then((res) => {
            elm.innerHTML = res + elm.innerHTML; // do not over write file
        });
    });
})();