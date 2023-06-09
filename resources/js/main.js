$(document).ready(function() {
    $(".js-hero-slick").slick({
        inifinite: true,
        slidesToShow: 1,
        autoplay: true,
        dots: false,
        arrows: true,
        appendDots: $('.hero .hero-dots'),
        prevArrow: $('.hero .slick-prev'),
        nextArrow: $('.hero .slick-next'),
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    dots: true,
                    arrows: false
                }
            }
        ]
    });

    $(".js-categories-carousel").slick({
        inifinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: false,
        dots: false,
        arrows: true,
        prevArrow: $('.featured-categories .slick-prev'),
        nextArrow: $('.featured-categories .slick-next'),
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 540,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    });
});
