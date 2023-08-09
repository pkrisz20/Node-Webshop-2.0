/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./resources/js/main.js":
/*!******************************!*\
  !*** ./resources/js/main.js ***!
  \******************************/
/***/ (() => {

$(document).ready(function () {
  $(".js-hero-slick").slick({
    inifinite: true,
    slidesToShow: 1,
    autoplay: true,
    dots: false,
    arrows: true,
    appendDots: $('.hero .hero-dots'),
    prevArrow: $('.hero .slick-prev'),
    nextArrow: $('.hero .slick-next'),
    responsive: [{
      breakpoint: 1200,
      settings: {
        dots: true,
        arrows: false
      }
    }]
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
    responsive: [{
      breakpoint: 1200,
      settings: {
        slidesToShow: 3
      }
    }, {
      breakpoint: 768,
      settings: {
        slidesToShow: 2
      }
    }, {
      breakpoint: 540,
      settings: {
        slidesToShow: 1
      }
    }]
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
    responsive: [{
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3
      }
    }, {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    }, {
      breakpoint: 540,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }]
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
    responsive: [{
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3
      }
    }, {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    }, {
      breakpoint: 540,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }]
  });

  // Is there any form to validate?
  if ($.validator) {
    // Custom validations cause of custom error message based on current lang
    $.validator.addMethod('min-length', function (val, element) {
      return this.optional(element) || val.length >= $(element).data('rule-min-length');
    }, function (params, element) {
      return translateText('validations.min', params);
    });
    $.validator.addMethod('max-length', function (val, element) {
      return this.optional(element) || val.length <= $(element).data('rule-max-length');
    }, function (params, element) {
      return translateText('validations.must_have_at_most', params);
    });
    $.validator.addMethod('max-value', function (val, element) {
      return this.optional(element) || val <= $(element).data('rule-max-value');
    }, function (params, element) {
      return translateText('validations.max_value', params);
    });
    $.validator.addMethod('min-value', function (val, element) {
      return this.optional(element) || val >= $(element).data('rule-min-value');
    }, function (params, element) {
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
    if (grecaptcha && $('.js-form-validate').find('.g-recaptcha').length > 0) {
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
window.translateText = function translateText(key) {
  var translationText = '';
  var keys = key.split(".");
  translationText = translations[keys[0]][keys[1]];
  for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    params[_key - 1] = arguments[_key];
  }
  if (params.length > 0) {
    params.forEach(function (paramItem, index) {
      translationText = translationText.replace("{".concat(index, "}"), paramItem);
    });
  }
  return translationText;
};
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
    invalidHandler: function invalidHandler(form, validator) {
      if (validator.numberOfInvalids() > 0) {
        form.preventDefault();
        var to_elem = $(validator.errorList[0].element).closest('.form-row');
        var topY = to_elem.offset().top - $('.js-header').outerHeight() - 10;
        window.scroll({
          top: topY,
          behavior: 'smooth'
        });
      }
    },
    highlight: function highlight(element, errorClass) {
      $(element).addClass(errorClass);
      $(element).closest('.form-row').find('.form-label').addClass('error');
      $(element).closest('.form-row').find('.form-row-error').show();
      $(element).closest('.form-row').find('.error-icon').show();
    },
    unhighlight: function unhighlight(element, errorClass) {
      $(element).removeClass(errorClass);
      $(element).closest('.form-row').find('.form-label').removeClass('error');
      $(element).closest('.form-row').find('.form-row-error').hide();
      $(element).closest('.form-row').find('.error-icon').hide();
    },
    errorPlacement: function errorPlacement(error, element) {
      var parent = $(element).closest('.form-row').find('.form-row-error');
      parent.append(error);
    },
    submitHandler: function submitHandler(form) {
      var this_button = $('button[type="submit"]', $(form));
      $.ajax({
        type: $(form).prop('method'),
        url: $(form).data('url'),
        dataType: 'json',
        data: $(form).serializeArray(),
        beforeSend: function beforeSend(jqXHR) {
          this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
        },
        complete: function complete(jqXHR, textStatus) {
          this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
        },
        success: function success(response) {
          if (response.status === 'error') {
            $.alert({
              useBootstrap: false,
              boxWidth: '400px',
              title: response.title,
              content: response.content || false,
              buttons: 'OK'
            });
          } else if (response.status === 'success') {
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
                OK: function OK() {
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
    }
  });
  $(this).addClass('inited');
});
$(function () {
  var header = $(".js-header");
  var upscrollButton = $('.js-upscroll');
  $(window).scroll(function () {
    var scroll = $(window).scrollTop();
    if (scroll > 0) {
      header.addClass('header-sticky');
    } else {
      header.removeClass('header-sticky');
      upscrollButton.removeClass('show');
    }
    if (scroll > 350) {
      upscrollButton.addClass('show');
    }
  });
  $('body').on('click', '.js-upscroll', function () {
    window.scroll({
      top: 0,
      behavior: 'smooth'
    });
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
  var quantity_wrapper = $(this).prev(".js-quantities");
  var quantity = null;
  if (quantity_wrapper.length > 0) {
    quantity = parseInt(quantity_wrapper.find('.js-product-details-quantity').val());
  } else {
    quantity = 1;
  }
  var item = {
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
    beforeSend: function beforeSend(jqXHR) {
      this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
    },
    complete: function complete(jqXHR, textStatus) {
      this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
    },
    success: function success(response) {
      if (response.status == 'success') {
        var cartItems = '';
        if ($('.js-cart-list').length > 0) {
          $.each(response.results, function (index, item) {
            cartItems += "\n                            <li class=\"cart-container-list-item js-cart-item\">\n                                <div class=\"cart-product\">\n                                    <div class=\"cart-product-image\">\n                                        <picture>\n                                            <source srcset=\"".concat(item.image || '', "\">\n                                            <img class=\"cart-product-img\" alt=\"").concat(item.productName, "\" loading=\"lazy\" src=\"images/no-picture.jpg\">\n                                        </picture>\n                                    </div>\n\n                                    <div class=\"cart-product-desc\">\n                                        <h5 class=\"cart-product-desc_name\">").concat(item.productName, "</h5>\n\n                                        <div class=\"quantities\">\n                                            <div class=\"quantities-container js-quantities\">\n                                                <button type=\"button\" class=\"quantities-btn js-quantity-btn minus\"><i class=\"fas fa-minus\"></i></button>\n                                                <input class=\"quantities-input js-product-quantity\" data-id=\"").concat(item.productId, "\" type=\"number\" value=\"").concat(item.quantity, "\" min=\"1\" max=\"").concat(item.maxQuantity, "\" />\n                                                <button type=\"button\" class=\"quantities-btn js-quantity-btn plus\"><i class=\"fas fa-plus\"></i></button>\n                                            </div>\n\n                                            <small class=\"quantities-price\"><i class=\"fas fa-times\"></i> <span>").concat(item.price, " RSD</span></small>\n                                        </div>\n\n                                        <div class=\"functions\">\n                                            <a href=\"/").concat(response.current_locale, "/product\" class=\"functions_details\" aria-label=\"Link to product details\"><i class=\"fas fa-info-circle\"></i></a>\n                                            <button type=\"button\" value=\"").concat(response.remove_text, " %>\" data-id=\"").concat(item.productId, "\" class=\"functions_remove js-remove-cart\"><i class=\"fas fa-times\"></i></button>\n                                        </div>\n                                    </div>\n                                </div>\n                            </li>");
          });
          $('.js-cart-list').html(cartItems);
          $('span.js-cart-counter').text(response.totalCount);
          $('span.js-total-price').text(response.totalPrice);
        } else {
          $('.js-cart-empty').removeClass('show');
          $('.js-cart-empty').addClass('hide');
          $('.js-cart').append("<h5 class=\"cart-counter\">".concat(response.ordersCartCountText, ": <span class=\"js-cart-counter\">").concat(response.totalCount, "</span></h5>\n                        <div class=\"cart-container\">\n                            <div class=\"cart-container-top\">\n                                <a href=\"/").concat(response.current_locale, "/order\" aria-label=\"Navigation link to the orders page\" class=\"cart-container-top_ordering\">").concat(response.orderPageText, "</a>\n                                <strong class=\"cart-container-top_total\">").concat(response.totalPriceText, ": <span class=\"js-total-price\">").concat(response.totalPrice, "</span><small>RSD</small></strong>\n                            </div>\n\n                            <ul class=\"cart-container-list js-cart-list\">\n                                <li class=\"cart-container-list-item js-cart-item\">\n                                    <div class=\"cart-product\">\n                                        <div class=\"cart-product-image\">\n                                            <picture>\n                                                <source srcset=\"").concat(response.results[0].image || '', "\">\n                                                <img class=\"cart-product-img\" alt=\"").concat(response.results[0].productName, "\" loading=\"lazy\" src=\"images/no-picture.jpg\">\n                                            </picture>\n                                        </div>\n\n                                        <div class=\"cart-product-desc\">\n                                            <h5 class=\"cart-product-desc_name\">").concat(response.results[0].productName, "</h5>\n\n                                            <div class=\"quantities\">\n                                                <div class=\"quantities-container js-quantities\">\n                                                    <button type=\"button\" class=\"quantities-btn js-quantity-btn minus\"><i class=\"fas fa-minus\"></i></button>\n                                                    <input class=\"quantities-input js-product-quantity\" data-id=\"").concat(response.results[0].productId, "\" type=\"number\" value=\"").concat(response.results[0].quantity, "\" min=\"1\" max=\"").concat(response.results[0].maxQuantity, "\" />\n                                                    <button type=\"button\" class=\"quantities-btn js-quantity-btn plus\"><i class=\"fas fa-plus\"></i></button>\n                                                </div>\n\n                                                <small class=\"quantities-price\"><i class=\"fas fa-times\"></i> <span>").concat(response.results[0].price, " RSD</span></small>\n                                            </div>\n\n                                            <div class=\"functions\">\n                                                <a href=\"/").concat(response.current_locale, "/product\" class=\"functions_details\" aria-label=\"Link to product details\"><i class=\"fas fa-info-circle\"></i></a>\n                                                <button type=\"button\" value=\"").concat(response.remove_text, "\" data-id=\"").concat(response.results[0].productId, "\" class=\"functions_remove js-remove-cart\"><i class=\"fas fa-times\"></i></button>\n                                            </div>\n                                        </div>\n                                    </div>\n                                </li>\n                            </ul>\n                        </div>"));
        }
        $(".js-cart").addClass('open');
        $.alert({
          useBootstrap: false,
          boxWidth: '350px',
          title: response.title,
          content: response.content,
          buttons: {
            OK: function OK() {
              // do nothing
            }
          }
        });
      } else if (response.status == 'error') {
        $.confirm({
          useBootstrap: false,
          boxWidth: '350px',
          title: response.title,
          content: response.message,
          buttons: {
            OK: {
              action: function action() {
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
    beforeSend: function beforeSend(jqXHR) {
      this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
    },
    complete: function complete(jqXHR, textStatus) {
      this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
    },
    success: function success(response) {
      if (response.status == 'success') {
        this_button.closest('.js-cart-item').remove();
        $('span.js-cart-counter').text(response.totalCount);
        $('span.js-total-price').text(response.totalPrice);
        if (response.isEmpty) {
          $('.js-cart-empty').addClass('show');
          $('.js-cart-empty').removeClass('hide');
          $('.js-total-price').closest('.cart-container-top').remove();
          $('.js-cart-counter').closest('h5.cart-counter').remove();
        } else {
          $('.js-cart-empty').addClass('hide');
          $('.js-cart-empty').removeClass('show');
        }
        $.alert({
          useBootstrap: false,
          boxWidth: '350px',
          title: response.title,
          buttons: {
            OK: function OK() {
              // do nothing
            }
          }
        });
      } else if (response.status == 'error') {
        $.confirm({
          useBootstrap: false,
          boxWidth: '350px',
          title: response.title,
          content: response.message,
          buttons: {
            OK: {
              action: function action() {
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
  if ($(this).hasClass('minus') && value > 1) {
    value = value - 1;
  } else if ($(this).hasClass('plus')) {
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
  if (targetInput) {
    quantity = $(targetInput).val();
    productId = $(targetInput).data("id");
  } else if (!targetInput) {
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
    beforeSend: function beforeSend(jqXHR) {
      this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
    },
    complete: function complete(jqXHR, textStatus) {
      this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
    },
    success: function success(response) {
      if (response.status == 'success') {
        if (targetInput) {
          $(targetInput).val(response.newValue);
        } else if (!targetInput) {
          $(event.target).val(response.newValue);
        }
        $('.js-total-price').text(response.totalPrice);
        $.alert({
          useBootstrap: false,
          boxWidth: '350px',
          title: response.title,
          content: response.message,
          buttons: {
            OK: function OK() {
              // do nothing
            }
          }
        });
      } else if (response.status == 'error') {
        if (response.newValue) {
          if (targetInput) {
            $(targetInput).val(response.newValue);
          } else if (!targetInput) {
            $(event.target).val(response.newValue);
          }
        }
        $.alert({
          useBootstrap: false,
          boxWidth: '350px',
          title: response.title,
          content: response.message,
          buttons: {
            OK: function OK() {
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
    window.location.href = "/".concat(window.location.pathname.split('/')[1], "/search?keywords=").concat(keywords);
  } else if ($('.js-search-input').val().length === 0) {
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
    window.location.href = "/".concat(window.location.pathname.split('/')[1], "/search?keywords=").concat(keywords);
  }
  if ($('.js-search-input').val().length > 0) {
    $(this).next('.js-search-close').show();
  } else if ($('.js-search-input').val().length === 0) {
    $(this).next('.js-search-close').hide();
  }
});

/***/ }),

/***/ "./resources/scss/pages/blog-list.scss":
/*!*********************************************!*\
  !*** ./resources/scss/pages/blog-list.scss ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/faq.scss":
/*!***************************************!*\
  !*** ./resources/scss/pages/faq.scss ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/product-details.scss":
/*!***************************************************!*\
  !*** ./resources/scss/pages/product-details.scss ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/gallery-details.scss":
/*!***************************************************!*\
  !*** ./resources/scss/pages/gallery-details.scss ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/blog-details.scss":
/*!************************************************!*\
  !*** ./resources/scss/pages/blog-details.scss ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/error.scss":
/*!*****************************************!*\
  !*** ./resources/scss/pages/error.scss ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/gdpr.scss":
/*!****************************************!*\
  !*** ./resources/scss/pages/gdpr.scss ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/search-list.scss":
/*!***********************************************!*\
  !*** ./resources/scss/pages/search-list.scss ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/contact.scss":
/*!*******************************************!*\
  !*** ./resources/scss/pages/contact.scss ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/main.scss":
/*!**********************************!*\
  !*** ./resources/scss/main.scss ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/home.scss":
/*!****************************************!*\
  !*** ./resources/scss/pages/home.scss ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/about.scss":
/*!*****************************************!*\
  !*** ./resources/scss/pages/about.scss ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/product-list.scss":
/*!************************************************!*\
  !*** ./resources/scss/pages/product-list.scss ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/scss/pages/gallery-list.scss":
/*!************************************************!*\
  !*** ./resources/scss/pages/gallery-list.scss ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"/js/main": 0,
/******/ 			"css/gallery-list": 0,
/******/ 			"css/product-list": 0,
/******/ 			"css/about": 0,
/******/ 			"css/home": 0,
/******/ 			"css/main": 0,
/******/ 			"css/contact": 0,
/******/ 			"css/search-list": 0,
/******/ 			"css/gdpr": 0,
/******/ 			"css/error": 0,
/******/ 			"css/blog-details": 0,
/******/ 			"css/gallery-details": 0,
/******/ 			"css/product-details": 0,
/******/ 			"css/faq": 0,
/******/ 			"css/blog-list": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkWebshop_Node"] = self["webpackChunkWebshop_Node"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/js/main.js")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/main.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/home.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/about.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/product-list.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/gallery-list.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/blog-list.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/faq.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/product-details.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/gallery-details.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/blog-details.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/error.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/gdpr.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/search-list.scss")))
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["css/gallery-list","css/product-list","css/about","css/home","css/main","css/contact","css/search-list","css/gdpr","css/error","css/blog-details","css/gallery-details","css/product-details","css/faq","css/blog-list"], () => (__webpack_require__("./resources/scss/pages/contact.scss")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;