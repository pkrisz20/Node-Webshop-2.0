import Vue from "vue";

document.addEventListener("ready", function () {
    document.getElementByClassName("js-hero-slick").slick({
        inifinite: true,
        slidesToShow: 1,
        autoplay: true,
        dots: true,
        arrows: true
    });
});

Vue.component("header", require('./modules/header').default);
