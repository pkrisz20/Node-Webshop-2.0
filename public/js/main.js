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
});
$(window).on('scroll', function () {
  var navbar = $(".js-header");
  var sticky = navbar.offsetTop;
  if (window.pageYOffset >= sticky) {
    navbar.addClass("header-sticky");
  } else {
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
  var item = {
    productId: this_button.data('id'),
    quantity: quantity
  };
  $.ajax({
    type: 'post',
    url: "/api/cart/add",
    dataType: 'json',
    data: {
      cartItem: item
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
            cartItems += "\n                            <li class=\"cart-container-list-item js-cart-item\">\n                                <div class=\"cart-product\">\n                                    <div class=\"cart-product-image\">\n                                        <picture>\n                                            <source srcset=\"".concat(item.image || '', "\">\n                                            <img class=\"cart-product-img\" alt=\"").concat(item.productName, "\" loading=\"lazy\" src=\"images/no-picture.jpg\">\n                                        </picture>\n                                    </div>\n\n                                    <div class=\"cart-product-desc\">\n                                        <h5 class=\"cart-product-desc_name\">").concat(item.productName, "</h5>\n\n                                        <div class=\"quantities\">\n                                            <div class=\"quantities-container\">\n                                                <button type=\"button\" class=\"quantities-btn minus\"><i class=\"fas fa-minus\"></i></button>\n                                                <input class=\"quantities-input\" type=\"number\" value=\"").concat(item.quantity, "\" min=\"1\" max=\"").concat(item.maxQuantity, "\" />\n                                                <button type=\"button\" class=\"quantities-btn plus\"><i class=\"fas fa-plus\"></i></button>\n                                            </div>\n\n                                            <small class=\"quantities-price\"><i class=\"fas fa-times\"></i> <span>").concat(item.price, " RSD</span></small>\n                                        </div>\n\n                                        <div class=\"functions\">\n                                            <a href=\"/").concat(response.current_locale, "/product\" class=\"functions_details\" aria-label=\"Link to product details\"><i class=\"fas fa-info-circle\"></i></a>\n                                            <button type=\"button\" value=\"").concat(response.remove_text, " %>\" data-id=\"").concat(item.productId, "\" class=\"functions_remove js-remove-cart\"><i class=\"fas fa-times\"></i></button>\n                                        </div>\n                                    </div>\n                                </div>\n                            </li>");
          });
          $('.js-cart-list').html(cartItems);
          $('span.js-cart-counter').text(response.totalCount);
          $('span.js-total-price').text(response.totalPrice);
        } else {
          $('.js-cart-empty').hide();
          $('.js-cart').append("<h5 class=\"cart-counter\">".concat(response.ordersCartCountText, ": <span class=\"js-cart-counter\">").concat(response.totalCount, "</span></h5>\n                        <div class=\"cart-container\">\n                            <div class=\"cart-container-top\">\n                                <a href=\"/").concat(response.current_locale, "/order\" aria-label=\"Navigation link to the orders page\" class=\"cart-container-top_ordering\">").concat(response.orderPageText, "</a>\n                                <strong class=\"cart-container-top_total\">").concat(response.totalPriceText, ": <span class=\"js-total-price\">").concat(response.totalPrice, "</span><small>RSD</small></strong>\n                            </div>\n\n                            <ul class=\"cart-container-list js-cart-list\">\n                                <li class=\"cart-container-list-item js-cart-item\">\n                                    <div class=\"cart-product\">\n                                        <div class=\"cart-product-image\">\n                                            <picture>\n                                                <source srcset=\"").concat(response.results[0].image || '', "\">\n                                                <img class=\"cart-product-img\" alt=\"").concat(response.results[0].productName, "\" loading=\"lazy\" src=\"images/no-picture.jpg\">\n                                            </picture>\n                                        </div>\n\n                                        <div class=\"cart-product-desc\">\n                                            <h5 class=\"cart-product-desc_name\">").concat(response.results[0].productName, "</h5>\n\n                                            <div class=\"quantities\">\n                                                <div class=\"quantities-container\">\n                                                    <button type=\"button\" class=\"quantities-btn minus\"><i class=\"fas fa-minus\"></i></button>\n                                                    <input class=\"quantities-input\" type=\"number\" value=\"").concat(response.results[0].quantity, "\" min=\"1\" max=\"").concat(response.results[0].maxQuantity, "\" />\n                                                    <button type=\"button\" class=\"quantities-btn plus\"><i class=\"fas fa-plus\"></i></button>\n                                                </div>\n\n                                                <small class=\"quantities-price\"><i class=\"fas fa-times\"></i> <span>").concat(response.results[0].price, " RSD</span></small>\n                                            </div>\n\n                                            <div class=\"functions\">\n                                                <a href=\"/").concat(response.current_locale, "/product\" class=\"functions_details\" aria-label=\"Link to product details\"><i class=\"fas fa-info-circle\"></i></a>\n                                                <button type=\"button\" value=\"").concat(response.remove_text, "\" data-id=\"").concat(response.results[0].productId, "\" class=\"functions_remove js-remove-cart\"><i class=\"fas fa-times\"></i></button>\n                                            </div>\n                                        </div>\n                                    </div>\n                                </li>\n                            </ul>\n                        </div>"));
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
          content: response.content,
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
  var this_button = $(this);
  $.ajax({
    type: 'post',
    url: "/api/cart/delete",
    dataType: 'json',
    data: {
      productId: this_button.data('id')
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

// Search
$('body').on('click', '.js-search-btn', function () {
  $('.js-search-input').focus();
});

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
/******/ 			"css/about": 0,
/******/ 			"css/home": 0,
/******/ 			"css/main": 0
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
/******/ 	__webpack_require__.O(undefined, ["css/about","css/home","css/main"], () => (__webpack_require__("./resources/js/main.js")))
/******/ 	__webpack_require__.O(undefined, ["css/about","css/home","css/main"], () => (__webpack_require__("./resources/scss/main.scss")))
/******/ 	__webpack_require__.O(undefined, ["css/about","css/home","css/main"], () => (__webpack_require__("./resources/scss/pages/home.scss")))
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["css/about","css/home","css/main"], () => (__webpack_require__("./resources/scss/pages/about.scss")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;