(function () {
    function scrollHandling(e) {
        const target = e.target.dataset.target;
        const targetElem = document.querySelector('#'+target);
        document.querySelectorAll('[data-remove="true"]').forEach((subsection) => subsection.setAttribute('hidden', true));
            targetElem.removeAttribute('hidden');
            targetElem.scrollIntoView({
                behavior: "smooth"
            });

    }

    document.querySelectorAll('button[data-target]').forEach((elem) => {
        elem.addEventListener('click', scrollHandling);
    });

})();