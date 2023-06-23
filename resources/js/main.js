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

    $(".js-featured-products").slick({
        inifinite: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplay: false,
        dots: false,
        arrows: true,
        prevArrow: $('.products-carousel .slick-prev'),
        nextArrow: $('.products-carousel .slick-next'),
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            },
            {
                breakpoint: 540,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    });

    $(".js-featured-blogs").slick({
        inifinite: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplay: false,
        dots: false,
        arrows: true,
        prevArrow: $('.featured-blogs .slick-prev'),
        nextArrow: $('.featured-blogs .slick-next'),
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            },
            {
                breakpoint: 540,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    });
});

$(document).on('scroll', function () {
    var navbar = $(".js-header");
    var sticky = navbar.offsetTop;

    if (window.pageYOffset >= sticky) {
        navbar.addClass("header-sticky");
    }
    else {
        navbar.removeClass("header-sticky");
    }
});

// Language dropdown
$('body').on("mouseenter", ".js-lang-switcher", function () {
    $(".js-langs-list").addClass('dropdown-list--open');
});

$('body').on("mouseleave", ".js-lang-switcher", function () {
    $(".js-langs-list").removeClass("dropdown-list--open");
});

// Cart toggle
$('body').on("click", ".js-cart-btn", function () {
    $(".js-cart").addClass('open');
});

$('body').on("click", ".js-cart-close", function () {
    $(".js-cart").removeClass('open');
});

$('body').on('click', '.js-add-to-cart', function (event) {
    event.preventDefault();
    var this_button = $(this);
    var quantity_wrapper = this_button.closest('.js-quantities');
    var quantity = null;

    if (quantity_wrapper.length > 0) {
        quantity = ~~parseInt($('.js-product-quantity').val());
    } else {
        quantity = 1;
    }

    let item = {
        productId: this_button.data('id'),
        quantity: quantity
    };

    $.ajax({
        type: 'post',
        url: `${ process.env.APP_URL }/api/cart/add`,
        dataType: 'json',
        data: item,
        beforeSend: function (jqXHR) {
            this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
        },
        complete: function (jqXHR, textStatus) {
            this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
        },
        success: function (response) {
            // $.openModal({
            //     type: 'alert',
            //     content: response.message,
            //     buttons: 'OK'
            // });
            if (response.message == 'success') {
                console.log('success')
            }
        }
    });
});

// Search
$('body').on('click', '.js-search-btn', function () {
    $('.js-search-input').focus();
});
