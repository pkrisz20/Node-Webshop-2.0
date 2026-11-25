(self["webpackChunkWebshop_Node"] = self["webpackChunkWebshop_Node"] || []).push([["/admin/js/product-form"],{

/***/ "./resources/admin/js/product-form.js":
/*!********************************************!*\
  !*** ./resources/admin/js/product-form.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.array.concat.js */ "./node_modules/core-js/modules/es.array.concat.js");
__webpack_require__(/*! core-js/modules/es.array.find.js */ "./node_modules/core-js/modules/es.array.find.js");
__webpack_require__(/*! core-js/modules/es.array.includes.js */ "./node_modules/core-js/modules/es.array.includes.js");
__webpack_require__(/*! core-js/modules/es.object.to-string.js */ "./node_modules/core-js/modules/es.object.to-string.js");
__webpack_require__(/*! core-js/modules/es.string.includes.js */ "./node_modules/core-js/modules/es.string.includes.js");
__webpack_require__(/*! core-js/modules/web.dom-collections.for-each.js */ "./node_modules/core-js/modules/web.dom-collections.for-each.js");
/*
 * Webshop parameters block of the admin product forms (views/admin/products/new.ejs and edit.ejs).
 * The container element provides the repeatable row template and the maximum number of rows:
 * <div class="js-container-parameters" data-template="#template-id" data-max-parameters="5">
 */
$(function () {
  var parametersContainer = $('.js-container-parameters');
  parametersContainer.repeatable({
    template: parametersContainer.data('template'),
    addTrigger: '.js-add-parameter',
    deleteTrigger: '.js-delete-parameter',
    itemContainer: '.js-repeatable-row',
    max: parametersContainer.data('maxParameters'),
    min: 0,
    afterAdd: function afterAdd(event, callback) {
      updateSelectTwosData();
      globalScripts.initSelectTwo();
    },
    beforeDelete: function beforeDelete(event, callback) {
      Swal.fire({
        title: "Biztosan törlöd ezt a paramétert?",
        text: "Ez a folyamat visszafordíthatatlan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#008a00",
        cancelButtonColor: "#db3700",
        confirmButtonText: "Igen, törlöm!",
        cancelButtonText: "Nem, mégsem!"
      }).then(function (result) {
        if (result.isConfirmed) {
          callback();
          updateSelectTwosData();
        }
      });
    }
  });
  updateSelectTwosData();
});

// A parameter can be selected only once, so the already selected ones are disabled in the other selects.
// It must be global: the selects call it by name (data-on-select="updateSelectTwosData", see admin.js).
window.updateSelectTwosData = function () {
  var selectedValues = [];
  $('.js-select2.js-watch-parameter-change').each(function () {
    selectedValues = selectedValues.concat($(this).val());
  });
  $('.js-select2.js-watch-parameter-change').each(function () {
    var $select = $(this);
    var currentValues = $select.val() || [];
    $select.data('currentValues', currentValues);
    $select.find('option').prop('disabled', false);
    selectedValues.forEach(function (value) {
      if (!currentValues.includes(value)) {
        $select.find('option[value="' + value + '"]').prop('disabled', true);
      }
    });
  });
};

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["js/vendor"], function() { return __webpack_exec__("./resources/admin/js/product-form.js"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);