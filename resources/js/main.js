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

$(window).on('scroll', function () {
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

$('body').on("click", ".js-add-to-cart", function (event) {
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
        url: "/api/cart/add",
        dataType: 'json',
        data: { cartItem: item },
        beforeSend: function (jqXHR) {
            this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
        },
        complete: function (jqXHR, textStatus) {
            this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
        },
        success: function (response) {
            if (response.status == 'success') {

                $.each(response.results, function (item) {
                    $('.js-cart-list').html(`
                        <li class="cart-container-list-item">
                            <div class="cart-product">
                                <div class="cart-product-image">
                                    <picture>
                                        <source srcset="${ item.image }">
                                        <img class="cart-product-img" alt="${ item.productName }" loading="lazy" src="images/no-picture.jpg">
                                    </picture>
                                </div>

                                <div class="cart-product-desc">
                                    <h5 class="cart-product-desc_name">${ item.productName }</h5>

                                    <div class="quantities">
                                        <div class="quantities-container">
                                            <button type="button" class="quantities-btn minus"><i class="fas fa-minus"></i></button>
                                            <%# setAmountQuantity(item.productId, item.maxQuantity, $event) %>
                                            <%#  @keypress="isDigit($event)" %>
                                            <input class="quantities-input" type="number" value="${ item.quantity }" min="1" max="${ item.maxQuantity }" />
                                            <button type="button" class="quantities-btn plus"><i class="fas fa-plus"></i></button>
                                        </div>

                                        <small class="quantities-price"><i class="fas fa-times"></i> <span>${ item.price } RSD</span></small>
                                    </div>

                                    <div class="functions">
                                        <a href="/${ response.current_locale }/product" class="functions_details" aria-label="Link to product details"><i class="fas fa-info-circle"></i></a>
                                        <button type="button" value="${ response.remove_text } %>" class="functions_remove"><i class="fas fa-times"></i></button>
                                    </div>
                                </div>
                            </div>
                        </li>`
                    );
                });

                $('.js-cart-counter').text(response.totalCount);
                $('.js-total-price').text(response.totalPrice);

                $.alert({
                    boxWidth: '350px',
                    title: response.title,
                    content: response.message,
                    buttons: 'OK'
                });
            }
            else if (response.status == 'error') {
                $.confirm({
                    title: response.title,
                    content: response.message,
                    type: 'red',
                    typeAnimated: true,
                    buttons: {
                        tryAgain: {
                            text: 'OK',
                            action: function(){
                                // do nothing
                            }
                        }
                    }
                });
            }
        }
    });
});

// Search
$('body').on('click', '.js-search-btn', function () {
    $('.js-search-input').focus();
});
