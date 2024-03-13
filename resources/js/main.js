$(function() {
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

    // Is there any recaptcha validation?
    if (typeof grecaptcha !== 'undefined' && $('.js-form-validate').find('.g-recaptcha').length > 0) {

        var inputToken = $('.js-form-validate').find('.g-recaptcha');
        var recaptchaToken = inputToken.val();

        grecaptcha.ready(function () {
            grecaptcha.execute(recaptchaToken).then(function (token) {
                inputToken.val(token);
            });
        });
    }

    // Default ajax setup
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $("meta[name='csrf-token']").attr("content")
        }
    });

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

    $('body').on('click', '.js-hamburger-menu', function () {
        $('.js-mobile-menu').addClass('nav-opened');
    });

    $('body').on('click', '.js-close-mobile-menu', function () {
        $('.js-mobile-menu').removeClass('nav-opened');
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

    // Tabs functionality
    if ($('.js-tabs').length > 0) {

        $('.js-tab-link').on('click', function (event) {
            event.preventDefault();
            var tab = $(this);
            var tabContent = tab.closest('.js-tabs');
            var tabAnchor = tab.data('tab-link');
            var currentTab = $('.js-tabs-content ' + tabAnchor, tabContent);

            if (currentTab.length === 1) {
                $('.js-tab-link', tabContent).removeClass('selected');
                tab.addClass('selected');
                currentTab.siblings().hide();
                currentTab.show();
            }
        });

        $('.js-tabs').each(function() {
            if ($(this).find('.selected').length == 0) {
                $(this).find('.js-tab-link').eq(0).addClass('selected');
            }
        });

        $('.js-tab-link.selected').trigger('click');
    }

    // Mobile categories slide
    $('body').on('click', '.js-slide-toggle', function () {
        var icon = $(this).find('i');
        var toggleItem = $(this).closest('.js-toggle-container').find('.js-toggle-content');

        toggleItem.slideToggle();
        icon.toggleClass('rotate');
    });

    // If the site is loaded and unexpectedly the search input has value then make it empty by default
    if ( $('body .js-search-input').length > 0 ) {
        $('body .js-search-input').val().length > 0 && $('body .js-search-input').val('');
    }

    function setCookie (cname, cvalue, exdays) {
        const date = new Date();
        date.setTime(date.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires="+date.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function setConsent (consent) {
        const consentMode = {
            'ad_storage': consent.includes('marketing') ? 'granted' : 'denied',
            'ad_user_data': consent.includes('marketing') ? 'granted' : 'denied',
            'ad_personalization': consent.includes('marketing') ? 'granted' : 'denied',
            'analytics_storage': consent.includes('statistics') ? 'granted' : 'denied',
            'functionality_storage': consent.includes('necessary') ? 'granted' : 'denied',
            'personalization_storage': consent.includes('preferences') ? 'granted' : 'denied',
            'security_storage': consent.includes('necessary') ? 'granted' : 'denied',
            'wait_for_update': 500
        };

        gtag('consent', 'update', consentMode);
        localStorage.setItem('consentMode', JSON.stringify(consentMode));
    }

    $('body').on('click', '.js-open-cookie-panel', function () {
        $('.js-cookies').removeClass('hidden');
    });

    $('body').on('click', '.js-toggle-cookie-details', function () {
        var toggleBtn = $(this);
        var toggleBtnText = $(this).find('span');
        var cookieDesc = $('body .js-cookie-description');

        if ($(cookieDesc)[0].style.display === 'none') {
            $(cookieDesc).slideDown();
            toggleBtn.addClass('active');
            toggleBtnText.text(toggleBtn.data('hide-text'));
        }
        else if ($(cookieDesc)[0].style.display !== 'none') {
            $(cookieDesc).slideUp();
            toggleBtn.removeClass('active');
            toggleBtnText.text(toggleBtn.data('show-text'));
        }
    });

    $('body').on('click', '.js-cookie-submit', function () {
        var this_button = $(this);
        const pathname = window.location.pathname;
        const currentLang = pathname.split('/')[1];

        if (this_button.hasClass('js-cookie-all')) {
            $('.js-cookie-input').each(function () {
                if (!$(this).is(':checked')) {
                    $(this).prop('checked', true);
                }
            });
        }
        else if (this_button.hasClass('js-reject')) {
            $('.js-cookie-input:not(:disabled)').each(function () {
                if ($(this).is(':checked')) {
                    $(this).prop('checked', false);
                }
            });
        }

        var checkedTypes = [];
        $('.js-cookie-input:checked').each(function () {
            checkedTypes.push($(this).val());
        });

        setCookie('website_cookie_consent_done', '1', 365);

        $('.js-cookies').addClass('hidden');

        $.ajax({
            type: 'post',
            url: `${ currentLang }/gdpr/handle`,
            dataType: 'json',
            data: {
                allowed_cookies: checkedTypes,
            },
            beforeSend: function (jqXHR) {
                this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
            },
            complete: function (jqXHR, textStatus) {
                this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
            },
            success: function (response) {
                if (typeof response.csrfToken !== 'undefined') {
                    $("meta[name='csrf-token']").attr("content", response.csrfToken);
                }

                if (response.status == 'success' && (process.env.GTAG_ID || false)) {
                    setConsent(checkedTypes);
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
});

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
                data: $(form).serializeArray(),
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

// Dropdowns handle
$('body').on("mouseenter", ".js-dropdown-opener", function () {
    $(this).find('.js-dropdown-list').addClass('dropdown-list--open');
});

$('body').on("mouseleave", ".js-dropdown-opener", function () {
    $(this).find('.js-dropdown-list').removeClass('dropdown-list--open');
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

    $.ajax({
        type: 'post',
        url: "/api/cart/add",
        dataType: 'json',
        data: {
            productId: this_button.data('id'),
            quantity: quantity,
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
    $('body .js-search-results-container').hide();
    $('body .js-search-results').hide();
});

function delayExecute (callback, delay = 0) {
    var timer = 0;

    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);

        timer = setTimeout(function () {
            callback.apply(context, args);
        }, delay);
    };
}

$('body').on('input', '.js-search-input', function () {
    var searchResult = $('body .js-search-results');
    var loadingSpinner = searchResult.find('.js-loading');
    var searchResultContainer = $('body .js-search-results-container');
    searchResultContainer.hide();

    if ( $(this).val().length > 0 ) {
        $(this).next('.js-search-close')[0].style.display === 'none' && $(this).next('.js-search-close').show();
        searchResult[0].style.display === 'none' && searchResult.show();
        loadingSpinner[0].style.display === 'none' && loadingSpinner.show();
    }
    else if ( $(this).val().length === 0 ) {
        $(this).next('.js-search-close').hide();
        searchResult.hide();
        loadingSpinner.hide();
    }
});

$('body').on('keyup', '.js-search-input', delayExecute(function (event) {

    // Detect the pressed key & handled which are enabled to start search request
    if (
        typeof event.keyCode === 'undefined'
        || event.keyCode === 0
        || (event.keyCode >= 16 && event.keyCode <= 27)
        || (event.keyCode >= 33 && event.keyCode <= 45)
        || (event.keyCode >= 91 && event.keyCode <= 93)
        || (event.keyCode >= 112 && event.keyCode <= 183)
    ) {
        return;
    }

    // Enter key pressed
    else if (event.keyCode === 13) {
        var searchInputValue = $('.js-search-input').val();
        var keywords = searchInputValue.replaceAll(' ', '+');
        window.location.href = `/${ window.location.pathname.split('/')[1] }/search?keywords=${ keywords }`;
    }

    else if ($(this).val().length > 0) {
        var searchResult = $('body .js-search-results');
        var loadingSpinner = searchResult.find('.js-loading');
        var searchResultContainer = $('body .js-search-results-container');

        $.ajax({
            type: 'post',
            url: `/${ locale }/ajax-search`,
            dataType: 'json',
            data: {
                keywords: $(this).val(),
            },
            beforeSend: function (jqXHR) {
                searchResultContainer.find('.js-found-blogs').empty();
                searchResultContainer.find('.js-found-products').empty();
                searchResultContainer.find('.js-found-galleries').empty();
            },
            complete: function (jqXHR, textStatus) {
                loadingSpinner.hide();
            },
            success: function (response) {
                if (typeof response.csrfToken !== 'undefined') {
                    $("meta[name='csrf-token']").attr("content", response.csrfToken);
                }

                if (response.status == 'success') {
                    searchResultContainer.find('.js-found-products').html(response.productsHtml);
                    searchResultContainer.find('.js-found-galleries').html(response.galleriesHtml);
                    searchResultContainer.find('.js-found-blogs').html(response.blogsHtml);
                    searchResultContainer.show();
                }
                else if (response.status == 'error') {
                    searchResultContainer.hide();
                    loadingSpinner.hide();
                    searchResult.hide();
                    $('.js-search-close').hide();
                    $('.js-search-input').val('');

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
    }
}, 1500));

$('body').on("click", ".js-wishlist-btn", function (event) {
    event.preventDefault();
    var this_button = $(this);
    var wishlistEndpoint = this_button.data('url');
    var operation = this_button.data("operation");

    $.ajax({
        type: 'post',
        url: wishlistEndpoint,
        dataType: 'json',
        data: {
            operation: operation
        },
        beforeSend: function (jqXHR) {
            this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
        },
        complete: function (jqXHR, textStatus) {
            this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
        },
        success: function (response) {
            if (typeof response.csrfToken !== 'undefined') {
                $("meta[name='csrf-token']").attr("content", response.csrfToken);
            }

            if (response.status == 'success') {
                response.finishedTask === 'removed' && this_button.removeClass('saved');
                response.finishedTask === 'added' && this_button.addClass('saved');
                this_button.data('operation', response.operation);
                $('body .js-wishlist-counter').text(response.wishlistTotalNumber);
            }

            $.alert({
                useBootstrap: false,
                boxWidth: '350px',
                title: response.title,
                content: false,
                buttons: {
                    OK: {
                        action: function() {
                            // do nothing
                        },
                    }
                }
            });
        }
    });
});
