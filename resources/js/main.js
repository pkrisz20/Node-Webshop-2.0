$(document).ready(function() {

    if ($(".js-hero-slick").length > 0) {
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
    }

    if ($(".js-categories-carousel").length > 0) {
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
    }

    if ($(".js-featured-products").length > 0) {
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
    }

    if ($(".js-featured-blogs").length > 0) {
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
    }

    if ($(".js-featured-galleries").length > 0) {
        $(".js-featured-galleries").slick({
            inifinite: true,
            slidesToShow: 3,
            slidesToScroll: 3,
            autoplay: false,
            dots: false,
            arrows: true,
            prevArrow: $('.featured-galleries .slick-prev'),
            nextArrow: $('.featured-galleries .slick-next'),
            responsive: [
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
    }

    // Is there any form to validate?
    if ($.validator) {
        // Custom validations cause of custom error message based on current lang
        $.validator.addMethod('min-length', function (val, element) {
            return this.optional(element) || val.length >= $(element).data('rule-min-length');
        }, function(params, element) {
            return translateText('validations.min', params);
        });

        $.validator.addMethod('max-length', function (val, element) {
            return this.optional(element) || val.length <= $(element).data('rule-max-length');
        }, function(params, element) {
            return translateText('validations.must_have_at_most', params);
        });

        $.validator.addMethod('max-value', function (val, element) {
            return this.optional(element) || val <= $(element).data('rule-max-value');
        }, function(params, element) {
            return translateText('validations.max_value', params);
        });

        $.validator.addMethod('min-value', function (val, element) {
            return this.optional(element) || val >= $(element).data('rule-min-value');
        }, function(params, element) {
            return translateText('validations.min_value', params);
        });

        // Hide some error elements
        $('.js-form-validate').find('.form-row-error').hide();
        $('.js-form-validate').find('.error-icon').hide();

        jQuery.extend(jQuery.validator.messages, {
            required: translateText('validations.required'),
            email: translateText('validations.invalid_email'),
            url: translateText('validations.invalid_url'),
            date: translateText('validations.date'),
            number: translateText('validations.number'),
            digits: translateText('validations.digits'),
            equalTo: translateText('validations.equalTo')
        });

        if (typeof grecaptcha !== 'undefined' && $('.js-form-validate').find('.g-recaptcha').length > 0) {

            var inputToken = $('.js-form-validate').find('.g-recaptcha');
            var recaptchaToken = inputToken.val();

            grecaptcha.ready(function () {
                grecaptcha.execute(recaptchaToken).then(function (token) {
                    inputToken.val(token);
                });
            });
        }
    }
});

window.translateText = function translateText(key, ...params) {

    let translationText = '';
    let keys = key.split(".");
    translationText = translations[keys[0]][keys[1]];

    if (params.length > 0) {
        params.forEach((paramItem, index) => {
            translationText = translationText.replace(`{${index}}`, paramItem);
        });
    }

    return translationText;
}

$('body').on('keyup', '.js-characters-count', function () {
    var characterCounter = $(this);
    var counterElement = $('.js-characters-count').closest('.form-row').find('.js-counter');
    var characters = characterCounter.val().length;
    $(counterElement).find('span').text(1000 - characters);
});

$('.js-form-validate').not('.inited').each(function () {
    $(this).validate({
        ignore: 'input[type=hidden], .dont-validate',
        errorClass: 'is-invalid',
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (validator.numberOfInvalids() > 0) {
                form.preventDefault();
                var to_elem = $(validator.errorList[0].element).closest('.form-row');
                var topY = to_elem.offset().top - $('.js-header').outerHeight() - 10;
                window.scroll({ top: topY, behavior: 'smooth' });
            }
        },
        highlight: function (element, errorClass) {
            $(element).addClass(errorClass);
            $(element).closest('.form-row').find('.form-label').addClass('error');
            $(element).closest('.form-row').find('.form-row-error').show();
            $(element).closest('.form-row').find('.error-icon').show();
        },
        unhighlight: function (element, errorClass) {
            $(element).removeClass(errorClass);
            $(element).closest('.form-row').find('.form-label').removeClass('error');
            $(element).closest('.form-row').find('.form-row-error').hide();
            $(element).closest('.form-row').find('.error-icon').hide();
        },
        errorPlacement: function (error, element) {
            var parent = $(element).closest('.form-row').find('.form-row-error');
            parent.append(error);
        },
        submitHandler: function (form) {
            var this_button = $('button[type="submit"]', $(form));

            $.ajax({
                type: $(form).prop('method'),
                url: $(form).data('url'),
                dataType: 'json',
                data: $(form).serializeArray().concat({ name: "_csrf", value: $("meta[name='csrf-token']").attr("content") }),
                beforeSend: function (jqXHR) {
                    this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
                },
                complete: function (jqXHR, textStatus) {
                    this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
                },
                success: function (response) {
                    // Set the new XSRF token
                    if (typeof response.csrfToken !== 'undefined') {
                        $("meta[name='csrf-token']").attr("content", response.csrfToken);
                    }

                    if (response.status === 'error') {
                        $.alert({
                            useBootstrap: false,
                            boxWidth: '400px',
                            title: response.title,
                            content: response.content || false,
                            buttons: {
                                OK: function () {
                                    // do nothing, and close modal
                                }
                            }
                        });
                    }
                    else if (response.status === 'success') {

                        if (!$(form).data('noReset')) {
                            form.reset();
                        }

                        var callbackFunctionOnSuccess = $(form).data('callback');
                        if (callbackFunctionOnSuccess && typeof window[callbackFunctionOnSuccess] == 'function') {
                            window[callbackFunctionOnSuccess](response, form);
                        }

                        $.alert({
                            useBootstrap: false,
                            boxWidth: '400px',
                            title: response.title,
                            content: response.content || false,
                            buttons: {
                                OK: function () {
                                    if (response.redirect_url) {
                                        setTimeout(function () {
                                            window.location = response.redirect_url;
                                        }, 1000);
                                    }
                                }
                            }
                        });
                    }
                }
            });
        },
    });
    $(this).addClass('inited');
});

$(function() {
    var header = $(".js-header");
    var upscrollButton = $('.js-upscroll');

    $(window).scroll(function () {

        var scroll = $(window).scrollTop();

        if (scroll > 0) {
            header.addClass('header-sticky');
            upscrollButton.css('opacity', '1');
            upscrollButton.css('visibility', 'visible');
        }
        else {
            header.removeClass('header-sticky');
            upscrollButton.css('opacity', '0');
            upscrollButton.css('visibility', 'hidden');
        }
    });

    $('body').on('click', '.js-upscroll', function () {
        window.scroll({ top: 0, behavior: 'smooth' });
    });

    if ($('.js-countup-section').length > 0) {
        var alreadyExecuted = false;
        var countUpOptions = {
            useEasing : true,
            useGrouping : true,
            separator : ',',
            decimal : '.',
            prefix : '',
            suffix : ''
        };

        $('.js-countup-section').waypoint(function () {
            if (!alreadyExecuted) {
                const targetNumbers = $('.js-countup-section .js-countup-item');

                $.each(targetNumbers, function (index, value) {
                    var endValue = $(value).data('number');
                    var counter = new CountUp(value, 0, parseInt(endValue), 0, 3.5, countUpOptions);
                    counter.start();
                });

                alreadyExecuted = true;
            }
        }, {
            offset: '100%'
        });
    }

    // Eye icon at password fields which toggles the type of input
    if ($('body .js-password-toggle').length > 0) {
        var slashedEye = $('body .js-password-toggle').find('i.fa-eye-slash');
        var normalEye = $('body .js-password-toggle').find('i.fa-eye');
        $(slashedEye).hide();

        $('body .js-password-toggle').on('click', function() {
            var input = $(this).closest('.form-row').find('input.form-control');
            var inputType = $(input).attr("type");

            if (inputType === 'password') {
                $(input).attr('type', 'text');
                $(slashedEye).show();
                $(normalEye).hide();
            }
            else if (inputType === 'text') {
                $(input).attr('type', 'password');
                $(slashedEye).hide();
                $(normalEye).show();
            }
            else {
                return false;
            }
        });
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
    var quantity_wrapper = $(this).prev(".js-quantities");
    var quantity = null;

    if (quantity_wrapper.length > 0) {
        quantity = parseInt(quantity_wrapper.find('.js-product-details-quantity').val());
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
        data: {
            cartItem: item,
            _csrf: $("meta[name='csrf-token']").attr("content")
        },
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
                                            <a href="/${ response.current_locale }/products/${ item.slug }" class="functions_details" aria-label="Link to product details"><i class="fas fa-info-circle"></i></a>
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
                                                <a href="/${ response.current_locale }/products/${ response.results[0].slug }" class="functions_details" aria-label="Link to product details"><i class="fas fa-info-circle"></i></a>
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
        data: {
            productId: this_button.data('id'),
            _csrf: $("meta[name='csrf-token']").attr("content")
        },
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
            quantity: quantity,
            _csrf: $("meta[name='csrf-token']").attr("content")
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

                if ($('body .js-order-total-price').length > 0 && $('body .js-order-alone-price').length > 0) {
                    $('body .js-order-total-price').text(response.totalPrice);
                    $(event.target).closest('.js-order-item').find('.js-order-alone-price').text(response.alonePrice);
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

// Search features
$('body').on('click', '.js-search-btn', function () {
    if ($('.js-search-input').val().length > 0) {
        var searchInputValue = $('.js-search-input').val();
        var keywords = '';

        keywords = searchInputValue.replaceAll(' ', '+');
        window.location.href = `/${ window.location.pathname.split('/')[1] }/search?keywords=${ keywords }`;
    }

    else if ($('.js-search-input').val().length === 0) {
        $('.js-search-input').focus();
    }
});

$('body').on('click', '.js-search-close', function () {
    $('.js-search-input').val('');
    $(this).hide();
});

$('body').on('keyup', '.js-search-input', function (event) {
    // Enter key pressed
    if (event.keyCode === 13) {
        var searchInputValue = $('.js-search-input').val();
        var keywords = '';

        keywords = searchInputValue.replaceAll(' ', '+');
        window.location.href = `/${ window.location.pathname.split('/')[1] }/search?keywords=${ keywords }`;
    }

    if ($('.js-search-input').val().length > 0) {
        $(this).next('.js-search-close').show();
    }
    else if ($('.js-search-input').val().length === 0) {
        $(this).next('.js-search-close').hide();
    }
});
