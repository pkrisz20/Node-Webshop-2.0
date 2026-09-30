/*
 * Webshop parameters block of the admin product forms (views/admin/products/new.ejs and edit.ejs).
 * The container element provides the repeatable row template and the maximum number of rows:
 * <div class="js-container-parameters" data-template="#template-id" data-max-parameters="5">
 */
$(function () {
    const parametersContainer = $('.js-container-parameters');

    parametersContainer.repeatable({
        template: parametersContainer.data('template'),
        addTrigger: '.js-add-parameter',
        deleteTrigger: '.js-delete-parameter',
        itemContainer: '.js-repeatable-row',
        max: parametersContainer.data('maxParameters'),
        min: 0,
        afterAdd: function (event, callback) {
            updateSelectTwosData();
            globalScripts.initSelectTwo();
        },
        beforeDelete: function (event, callback) {
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
        },
    });

    updateSelectTwosData();
});

// A parameter can be selected only once, so the already selected ones are disabled in the other selects.
// It must be global: the selects call it by name (data-on-select="updateSelectTwosData", see admin.js).
window.updateSelectTwosData = function () {
    let selectedValues = [];

    $('.js-select2.js-watch-parameter-change').each(function() {
        selectedValues = selectedValues.concat($(this).val());
    });

    $('.js-select2.js-watch-parameter-change').each(function() {
        let $select = $(this);
        let currentValues = $select.val() || [];

        $select.data('currentValues', currentValues);
        $select.find('option').prop('disabled', false);

        selectedValues.forEach(function(value) {
            if (!currentValues.includes(value)) {
                $select.find('option[value="' + value + '"]').prop('disabled', true);
            }
        });
    });
};
