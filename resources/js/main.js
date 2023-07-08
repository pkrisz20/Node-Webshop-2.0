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

$(function() {
    var header = $(".js-header");

    $(window).scroll(function () {
        var scroll = $(window).scrollTop();

        if (scroll > 0) {
            header.addClass('header-sticky');
        }
        else {
            header.removeClass('header-sticky');
        }
    });
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
    // TODO: Fix this sh*t, cause does not work inside product details page
    var quantity_wrapper = $(this).closest(".js-quantities");
    var quantity = null;

    if (quantity_wrapper.length > 0) {
        quantity = parseInt($('.js-product-details-quantity').val());
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
                var cartItems = '';

                if ($('.js-cart-list').length > 0) {
                    $.each(response.results, function (index, item) {
                        cartItems += `
                            <li class="cart-container-list-item js-cart-item">
                                <div class="cart-product">
                                    <div class="cart-product-image">
                                        <picture>
                                            <source srcset="${ item.image || '' }">
                                            <img class="cart-product-img" alt="${ item.productName }" loading="lazy" src="images/no-picture.jpg">
                                        </picture>
                                    </div>

                                    <div class="cart-product-desc">
                                        <h5 class="cart-product-desc_name">${ item.productName }</h5>

                                        <div class="quantities">
                                            <div class="quantities-container js-quantities">
                                                <button type="button" class="quantities-btn js-quantity-btn minus"><i class="fas fa-minus"></i></button>
                                                <input class="quantities-input js-product-quantity" data-id="${ item.productId }" type="number" value="${ item.quantity }" min="1" max="${ item.maxQuantity }" />
                                                <button type="button" class="quantities-btn js-quantity-btn plus"><i class="fas fa-plus"></i></button>
                                            </div>

                                            <small class="quantities-price"><i class="fas fa-times"></i> <span>${ item.price } RSD</span></small>
                                        </div>

                                        <div class="functions">
                                            <a href="/${ response.current_locale }/product" class="functions_details" aria-label="Link to product details"><i class="fas fa-info-circle"></i></a>
                                            <button type="button" value="${ response.remove_text } %>" data-id="${ item.productId }" class="functions_remove js-remove-cart"><i class="fas fa-times"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </li>`;
                    });

                    $('.js-cart-list').html(cartItems);
                    $('span.js-cart-counter').text(response.totalCount);
                    $('span.js-total-price').text(response.totalPrice);
                }
                else {
                    $('.js-cart-empty').removeClass('show');
                    $('.js-cart-empty').addClass('hide');

                    $('.js-cart').append(
                        `<h5 class="cart-counter">${ response.ordersCartCountText }: <span class="js-cart-counter">${ response.totalCount }</span></h5>
                        <div class="cart-container">
                            <div class="cart-container-top">
                                <a href="/${ response.current_locale }/order" aria-label="Navigation link to the orders page" class="cart-container-top_ordering">${ response.orderPageText }</a>
                                <strong class="cart-container-top_total">${ response.totalPriceText }: <span class="js-total-price">${ response.totalPrice }</span><small>RSD</small></strong>
                            </div>

                            <ul class="cart-container-list js-cart-list">
                                <li class="cart-container-list-item js-cart-item">
                                    <div class="cart-product">
                                        <div class="cart-product-image">
                                            <picture>
                                                <source srcset="${ response.results[0].image || '' }">
                                                <img class="cart-product-img" alt="${ response.results[0].productName }" loading="lazy" src="images/no-picture.jpg">
                                            </picture>
                                        </div>

                                        <div class="cart-product-desc">
                                            <h5 class="cart-product-desc_name">${ response.results[0].productName }</h5>

                                            <div class="quantities">
                                                <div class="quantities-container js-quantities">
                                                    <button type="button" class="quantities-btn js-quantity-btn minus"><i class="fas fa-minus"></i></button>
                                                    <input class="quantities-input js-product-quantity" data-id="${ response.results[0].productId }" type="number" value="${ response.results[0].quantity }" min="1" max="${ response.results[0].maxQuantity }" />
                                                    <button type="button" class="quantities-btn js-quantity-btn plus"><i class="fas fa-plus"></i></button>
                                                </div>

                                                <small class="quantities-price"><i class="fas fa-times"></i> <span>${ response.results[0].price } RSD</span></small>
                                            </div>

                                            <div class="functions">
                                                <a href="/${ response.current_locale }/product" class="functions_details" aria-label="Link to product details"><i class="fas fa-info-circle"></i></a>
                                                <button type="button" value="${ response.remove_text }" data-id="${ response.results[0].productId }" class="functions_remove js-remove-cart"><i class="fas fa-times"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>`
                    );
                }

                $(".js-cart").addClass('open');

                $.alert({
                    useBootstrap: false,
                    boxWidth: '350px',
                    title: response.title,
                    content: response.content,
                    buttons: {
                        OK: function () {
                            // do nothing
                        }
                    }
                });
            }
            else if (response.status == 'error') {
                $.confirm({
                    useBootstrap: false,
                    boxWidth: '350px',
                    title: response.title,
                    content: response.message,
                    buttons: {
                        OK: {
                            action: function() {
                                // do nothing
                            }
                        }
                    }
                });
            }
        }
    });
});

$('body').on("click", ".js-remove-cart", function (event) {
    event.preventDefault();
    var this_button = $(this);

    $.ajax({
        type: 'post',
        url: "/api/cart/delete",
        dataType: 'json',
        data: { productId: this_button.data('id') },
        beforeSend: function (jqXHR) {
            this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
        },
        complete: function (jqXHR, textStatus) {
            this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
        },
        success: function (response) {
            if (response.status == 'success') {
                this_button.closest('.js-cart-item').remove();
                $('span.js-cart-counter').text(response.totalCount);
                $('span.js-total-price').text(response.totalPrice);

                if (response.isEmpty) {
                    $('.js-cart-empty').addClass('show');
                    $('.js-cart-empty').removeClass('hide');
                    $('.js-total-price').closest('.cart-container-top').remove();
                    $('.js-cart-counter').closest('h5.cart-counter').remove();
                }
                else {
                    $('.js-cart-empty').addClass('hide');
                    $('.js-cart-empty').removeClass('show');
                }

                $.alert({
                    useBootstrap: false,
                    boxWidth: '350px',
                    title: response.title,
                    buttons: {
                        OK: function () {
                            // do nothing
                        }
                    }
                });
            }

            else if (response.status == 'error') {
                $.confirm({
                    useBootstrap: false,
                    boxWidth: '350px',
                    title: response.title,
                    content: response.message,
                    buttons: {
                        OK: {
                            action: function() {
                                // do nothing
                            }
                        }
                    }
                });
            }
        }
    });
});

$('body').on("click", ".js-quantity-btn", function (event) {
    event.preventDefault();
    var quantity_wrapper = $(this).closest('.js-quantities');
    var quantity = quantity_wrapper.find('.js-product-quantity');
    var value = parseInt(quantity.val());

    if ( $(this).hasClass('minus') && value > 1 ) {
        value = value - 1;
    }
    else if ( $(this).hasClass('plus') ) {
        value = value + 1;
    }

    quantity.val(value);
    quantity.trigger('change', quantity);
});

$('body').on("change", ".js-product-quantity", function (event, targetInput) {
    event.preventDefault();
    var this_button = $('.js-quantity-btn');
    var productId = null;
    var quantity = null;

    if ( targetInput ) {
        quantity = $(targetInput).val();
        productId = $(targetInput).data("id");
    }
    else if ( !targetInput ) {
        quantity = $(event.target).val();
        productId = $(event.target).data("id");
    }

    quantity = parseInt(quantity);

    $.ajax({
        type: 'post',
        url: "/api/cart/update",
        dataType: 'json',
        data: {
            productId: productId,
            quantity: quantity
        },
        beforeSend: function (jqXHR) {
            this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
        },
        complete: function (jqXHR, textStatus) {
            this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
        },
        success: function (response) {
            if (response.status == 'success') {

                if ( targetInput ) {
                    $(targetInput).val(response.newValue);
                }
                else if ( !targetInput ) {
                    $(event.target).val(response.newValue);
                }

                $('.js-total-price').text(response.totalPrice);

                $.alert({
                    useBootstrap: false,
                    boxWidth: '350px',
                    title: response.title,
                    content: response.message,
                    buttons: {
                        OK: function () {
                            // do nothing
                        }
                    }
                });
            }
            else if (response.status == 'error') {
                if (response.newValue) {
                    if ( targetInput ) {
                        $(targetInput).val(response.newValue);
                    }
                    else if ( !targetInput ) {
                        $(event.target).val(response.newValue);
                    }
                }

                $.alert({
                    useBootstrap: false,
                    boxWidth: '350px',
                    title: response.title,
                    content: response.message,
                    buttons: {
                        OK: function () {
                            // do nothing
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
