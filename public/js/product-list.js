(self["webpackChunkWebshop_Node"] = self["webpackChunkWebshop_Node"] || []).push([["/js/product-list"],{

/***/ "./resources/js/pages/product-list.js":
/*!********************************************!*\
  !*** ./resources/js/pages/product-list.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.array.find.js */ "./node_modules/core-js/modules/es.array.find.js");
__webpack_require__(/*! core-js/modules/es.array.push.js */ "./node_modules/core-js/modules/es.array.push.js");
__webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
__webpack_require__(/*! core-js/modules/es.regexp.exec.js */ "./node_modules/core-js/modules/es.regexp.exec.js");
__webpack_require__(/*! core-js/modules/es.string.replace.js */ "./node_modules/core-js/modules/es.string.replace.js");
__webpack_require__(/*! core-js/modules/es.string.trim.js */ "./node_modules/core-js/modules/es.string.trim.js");
/* Product list page: filters, sorting and AJAX pagination (views/pages/products.ejs) */

var blockUIOptions = {
  message: null,
  css: {
    padding: 0,
    margin: 0,
    color: '#000',
    border: 'none',
    backgroundColor: '#c1d2cf',
    cursor: 'wait'
  },
  overlayCSS: {
    backgroundColor: '#c1d2cf',
    opacity: 0.6,
    cursor: 'wait'
  }
};
function loadProducts(clicked_page) {
  var reset_link = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var pager_url = clicked_page.attr('href');
  var data_wrapper = $('.js-product-list');
  var prod_page = $('.js-product-page');
  var base_url = prod_page.data('url');
  var base_title = prod_page.data('category');
  var visible_filter = $('.js-filter-form:visible');
  var filter_inputs = $(':input', visible_filter);
  var filter_data = filter_inputs.serializeArray();
  var prod_page_inputs = $('select', prod_page);
  var base_options = prod_page_inputs.serializeArray();
  var options = base_options;
  $.each(filter_data, function (index, value) {
    options.push(value);
  });
  options.push({
    name: 'ajax',
    value: '1'
  });
  $.ajax({
    type: 'get',
    url: reset_link === false ? pager_url : base_url,
    dataType: 'json',
    data: options,
    beforeSend: function beforeSend(jqXHR) {
      data_wrapper.block(blockUIOptions);
      scrollToAnchor('#products-list');
    },
    complete: function complete(jqXHR, textStatus) {
      data_wrapper.unblock(blockUIOptions);
    },
    success: function success(response) {
      if (response.status === 'success') {
        window.history.pushState(base_options, base_title, this.url.replace('ajax=1', '').replace(/^&+|&+$/g, ''));
        // data_wrapper.html(response.products.html);
        // $('.js-total-products').text(response.products.total);
      } else {
        $.alert({
          useBootstrap: false,
          boxWidth: '400px',
          title: response.title,
          content: response.message || false
        });
      }
    }
  });
}
function handleFilterChange(ev) {
  var this_option = $(ev.target);
  var this_option_value = this_option.val();
  var other_option = $('[data-sync-id="' + this_sync + '"]');
  if (this_option.is(':checkbox')) {
    other_option.attr('checked', this_option.is(':checked')).prop('checked', this_option.is(':checked'));
    if (this_option.is(':checked')) {
      var filter_id = this_option.attr('id');
      var filter_value = this_option.siblings('span')[0].childNodes[0].nodeValue.trim();
    } else {
      $('[data-filter-id="' + this_option.attr('id') + '"]').parent().remove();
    }
  } else {
    other_option.val(this_option.val());
  }
}
$('body').on('change', '.js-watch-option', function (ev) {
  var this_option = $(this);
  var clicked_page = $('.js-pagination-wrapper li.active a');
  loadProducts(clicked_page, true);
});
$('body').on('click', '.js-pagination-wrapper li.active a', function (ev) {
  ev.preventDefault();
  var clicked_page = $(this);
  loadProducts(clicked_page);
});
$('body').on('submit', '.js-filter-form', function (ev) {
  ev.preventDefault();
  var this_option = $(this);
  var clicked_page = $('.js-pagination-wrapper li.active a');
  loadProducts(clicked_page, true);
});

// The range (cheapest / most expensive product) and the step come from the data attributes of the slider
$('.js-price-slider').each(function () {
  var priceSlider = $(this);
  priceSlider.slider({
    range: true,
    min: priceSlider.data('min'),
    max: priceSlider.data('max'),
    step: priceSlider.data('step'),
    values: [priceSlider.data('min'), priceSlider.data('max')],
    slide: function slide(event, ui) {
      var labelSelector = '.js-price-' + (ui.handleIndex === 0 ? 'min' : 'max');
      var textSelector = '.js-slider-label-' + (ui.handleIndex === 0 ? 'min' : 'max');
      $(labelSelector).val(ui.value);
      $(textSelector).text(ui.value);
    },
    change: function change(event, ui) {
      $(this).closest('form.js-filter-form').trigger('submit');
    }
  });
});
$('body').on('change', '.js-price-min, .js-price-max', function (ev) {
  var affected_form = $(this).closest('form');
  var sliders = $('.js-price-slider', affected_form);
  if (sliders.length > 0) {
    var min_input = $('.js-price-min', affected_form);
    var max_input = $('.js-price-max', affected_form);
    sliders.each(function () {
      var options = $(this).slider('option');
      var min = ~~parseInt(min_input.val());
      var max = ~~parseInt(max_input.val());
      if (min < options.min) {
        min = options.min;
        min_input.val(min);
      }
      if (max > options.max) {
        max = options.max;
        max_input.val(max);
      }
      $(this).slider('values', [min, max]);
    });
  }
});
$('body').on('click', '.js-show-more-filters', function () {
  var toggleFilterOptionsBtn = $(this);
  var filterOptions = toggleFilterOptionsBtn.closest('.js-filter-box').find('.js-expandable');
  filterOptions.slideToggle().toggleClass('expanded');
  var filterOptionsText = $(toggleFilterOptionsBtn).find('span');
  var filterButtonIcons = $(toggleFilterOptionsBtn).find('.icon');
  $(filterOptionsText).text(filterOptions.hasClass('expanded') ? filterOptionsText.data('hideText') : filterOptionsText.data('showText'));
  filterButtonIcons.css('transform', filterOptions.hasClass('expanded') ? 'rotate(180deg)' : 'rotate(0)');
});
$('.js-trigger-filter').on('click', function () {
  var targetBox = $(this).closest('.js-filter-box').find('.js-filter-options-list');
  targetBox.slideToggle();
  targetBox.closest('.js-filter-box').toggleClass('filter--open');
});
$('body').on('change', '.js-filter-checkbox', function () {
  handleFilterChange($(this));
  $(this).closest('form.js-filter-form').trigger('submit');
});
$('body').on('click', '.js-open-filters-sidebar', function () {
  $('.js-filter-wrapper').addClass('filter-wrapper--opened');
  $('body .site-overlay').css({
    visibility: 'visible',
    opacity: '1'
  });
});
$('body').on('click', '.js-filters-sidebar-close', function () {
  $('.js-filter-wrapper').removeClass('filter-wrapper--opened');
  $('body .site-overlay').css({
    visibility: 'hidden',
    opacity: '1'
  });
});
$('body').on('reset', '.js-filter-form', function (ev) {
  ev.preventDefault();
  $(this)[0].reset();
  var sliders = $('.js-price-slider');
  if (sliders.length > 0) {
    var options;
    sliders.each(function () {
      options = $(this).slider('option');
      var this_form = $(this).closest('.js-filter-form');
      var this_min = $('.js-price-min', this_form);
      var this_max = $('.js-price-max', this_form);
      this_min.val(options.min);
      this_max.val(options.max);
      $(this).slider('values', [options.min, options.max]);
    });
  }
  $('.js-filter-checkbox').prop('checked', false).attr('checked', false);
  $(this).closest('form.js-filter-form').trigger('submit');
});

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["js/vendor"], function() { return __webpack_exec__("./resources/js/pages/product-list.js"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);