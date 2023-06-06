$(document).ready(function() {
    $(".js-hero-slick").slick({
        inifinite: true,
        slidesToShow: 1,
        autoplay: true,
        dots: true,
        arrows: true,
        mobileFirst: true,
        responsive: [
            {
                breakpoint: 1200,
                dots: false,
                arrows: true
            }
        ]
    });


});
