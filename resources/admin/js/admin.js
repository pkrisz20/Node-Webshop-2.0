/*!
    * Start Bootstrap - SB Admin v7.0.7 (https://startbootstrap.com/template/sb-admin)
    * Copyright 2013-2023 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
    */
    //
// Scripts
//

var select2SelectionTemplates = {};

window.globalScripts = {
  initSelectTwo: function () {
    if ($().select2 && $('.js-select2').length > 0) {
      $('.js-select2').not('.inited').each(function () {
        var this_remote = $(this);
        var url = this_remote.data('url');
        var text_index = this_remote.data('textIndex');
        var minimumInputLength = this_remote.data('minInputLength');
        var selectionTemplateName = this_remote.data('formStateName');

        if (typeof minimumInputLength === 'undefined') {
          minimumInputLength = 1;
        }

        var select_options = {
          language: 'hu',
          minimumInputLength: minimumInputLength,
          allowClear: this_remote.data('allowClear') || false,
          placeholder: this_remote.data('placeholder'),
          templateSelection: selectionTemplateName ? select2SelectionTemplates[selectionTemplateName] : undefined,
        };

        if (url) {
          select_options.ajax = {
            url: url,
            dataType: 'json',
            delay: 250,
            data: function (params) {
              var current_select = this;
              var this_form = current_select.closest('form');
              var extra_inputs = $('input.js-extra-data, textarea.js-extra-data, select.js-extra-data' + (this_remote.data('extra-data-selector') !== undefined ? ', ' + this_remote.data('extra-data-selector') : ''), this_form);
              var global_extra_inputs = $(this_remote.data('global-extra-input-selector'));

              var data = {
                query: params.term, // search term
                page: params.page
              };

              if (extra_inputs.length > 0 || global_extra_inputs.length > 0) {
                var extra_data = $.merge(extra_inputs.serializeArray(), global_extra_inputs.serializeArray());

                $.each( extra_data, function( extra_key, extra_value ) {
                  if (extra_value.name != current_select.prop('name')) {
                    data[extra_value.name] = extra_value.value;
                  }
                });
              }

              if (this_remote.data('exceptions-selector') !== undefined) {
                data.exceptions = [];
                $(this_remote.data('exceptions-selector')).each(function () {
                  var val = $(this).val();
                  if (val != null) {
                    data.exceptions.push(val);
                  }
                });
              }

              return data;
            },
            processResults: function (results, params) {
              params.page = params.page || 1;
              results.data = $.map(results.data, function (obj) {
                obj.text = obj[text_index] || obj.text || obj.name || obj.title; // replace name with the property used for the text
                return obj;
              });

              return {
                results: results.data,
                pagination: {
                  more: (params.page * results.per_page) < results.total
                }
              };
            },
            cache: true
          };
        }

        this_remote.select2($.extend({}, select_options, this_remote.data()));

        this_remote.on('select2:open', function () {
          $('.select2-search__field').focus();
        });

        var custom_onselect = this_remote.data('onSelect');
        if (custom_onselect && typeof window[custom_onselect] === 'function') {
          this_remote.on('select2:select', function (event) {
            window[custom_onselect](event);
          });
        }
      })
      .addClass('inited');
    }
  }
}

// Set new default font family and font color to charts
Chart.defaults.global.defaultFontFamily = 'Poppins, sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

$(document).ready(function() {

  // Toggle the side navigation
  const sidebarToggle = document.querySelector('#sidebarToggle');
  if (sidebarToggle) {
    // Persist sidebar toggle between refreshes
    if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
      document.body.classList.toggle('sb-sidenav-toggled');
    }
    sidebarToggle.addEventListener('click', function (event) {
      event.preventDefault();
      document.body.classList.toggle('sb-sidenav-toggled');
      localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
    });
  }

  // Default ajax setup
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $("meta[name='csrf-token']").attr("content")
    }
  });

  // This requires to prevent some random errors because the validate & ckeditor plugins do not like each other
  $('form').each(function() {
    if ($(this).data('validator')) {
      $(this).data('validator').settings.ignore = ".ck";
    }
  });

  if ( $('.jquery-tooltip').length > 0 ) {
    $('.jquery-tooltip').tooltipster({
      position: 'left'
    });
  }

  if (typeof $.validator !== 'undefined') {
    $.validator.addMethod('latCoord', function (value, element) {
      return this.optional(element) || value.length >= 4 && /^(?=.)-?((8[0-5]?)|([0-7]?[0-9]))?(?:\.[0-9]{1,20})?$/.test(value);
    }, 'A szélességi érték helytelen.');

    $.validator.addMethod('longCoord', function(value, element) {
      return this.optional(element) || value.length >= 4 && /^(?=.)-?((0?[8-9][0-9])|180|([0-1]?[0-7]?[0-9]))?(?:\.[0-9]{1,20})?$/.test(value);
    }, 'A hosszússági érték helytelen');
  }

  // It there is any ck editor, then initialize it
  if ($('body .js-ckeditor').length > 0) {
    document.querySelectorAll('.js-ckeditor').forEach(function (event) {

      // If the db value is null, just init the ck editor
      if ( typeof event.value !== 'undefined' && event.value.length === 0 ) {
        ClassicEditor
          .create(event)
          .then(function (editor) {
            editor.model.document.on('change:data', function () {
              event.value = editor.getData();
            });
          })
          .catch(function (error) {
            console.error(error);
          });
      }
      // If the db value is not empty, then init + set the value
      else if ( typeof event.value !== 'undefined' && event.value.length > 0 ) {
        ClassicEditor
          .create(event)
          .then(function (editor) {

            editor.data.set(event.value);

            editor.model.document.on('change:data', function () {
              event.value = editor.getData();
            });
          })
          .catch(function (error) {
            console.error(error);
          });
      }
    });
  }

  globalScripts.initSelectTwo();
});

// Delete data
$('body').on('click', '.js-delete-data', function () {

  var this_button = $(this);

  Swal.fire({
    title: 'Biztosan szeretné törölni?',
    text: "Ez a folyamat visszafordíthatatlan! A törölt adatok nem számolódnak bele a statisztikába.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#dc3545',
    cancelButtonText: 'Mégsem',
    confirmButtonText: 'Igen, törlöm!',
  })
  .then(function (result) {
    if (result.isConfirmed) {

      $.ajax({
        type: "GET",
        url: $(this_button).data('url'),
        dataType: 'json',
        beforeSend: function (jqXHR) {
          Swal.fire('Folyamatban...');
          Swal.showLoading();
          this_button.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
        },
        complete: function (jqXHR, textStatus) {
          this_button.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
        },
        success: function (response) {
          if (response.status === 'error') {
            setTimeout(function () {
              Swal.fire({
                icon: 'error',
                title: response.title || 'Hoppá!',
                text: response.text || 'Váratlan hiba történt! Szóljatok a Krisztinek, léci ne csináljatok semmit!',
              });
            }, 1000);
          }
          else if (response.status === 'success') {
            setTimeout(function () {
              Swal.fire({
                title: 'Sikeresen törölve!',
                text: 'Az oldal újra fog tölteni másodperceken belül, hogy a friss adatok legyenek láthatóak!',
                icon: 'success',
                confirmButtonText: "OK",
              })
              .then(function (result) {
                if (result.isConfirmed) {

                  setTimeout(function () {
                    if (response.redirect_url) {
                      window.location = response.redirect_url;
                    }
                    else {
                      window.location.reload();
                    }
                  }, 500);
                }
              });
            }, 1000);
          }
        }
      });
    }
  });
});

// Get order details info
$('body').on('click', '.js-get-order-info', function (event) {
  event.preventDefault();

  $.ajax({
    type: "GET",
    url: $(this).data("url"),
    dataType: 'json',
    beforeSend: function (jqXHR) {
      Swal.fire('Adatok lekérése folyamatban...');
      Swal.showLoading();
      $(this).addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
    },
    complete: function (jqXHR, textStatus) {
      $(this).removeClass('disabled').removeAttr('disabled').prop('disabled', false);
    },
    success: function (response) {
      // Set the new XSRF token
      if (typeof response.csrfToken !== 'undefined') {
        $("meta[name='csrf-token']").attr("content", response.csrfToken);
      }

      if (response.status === 'error') {
        setTimeout(function () {
          Swal.fire({
            icon: 'error',
            title: 'Hoppá!',
            text: 'Váratlan hiba történt! Szóljatok a Krisztinek, léci ne csináljatok semmit!',
          });
        }, 1000);
      }
      else if (response.status === 'success') {
        setTimeout(function () {
          Swal.fire({
            title: 'Részletes adatok',
            icon: 'info',
            html: response.htmlResponse,
          });
        }, 1000);
      }
    }
  });
});

// Get client message details
$('body').on('click', '.js-get-message-details', function (event) {
  event.preventDefault();

  $.ajax({
    type: "GET",
    url: $(this).data("url"),
    dataType: 'json',
    beforeSend: function (jqXHR) {
      Swal.fire('Adatok lekérése folyamatban...');
      Swal.showLoading();
      $(this).addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
    },
    complete: function (jqXHR, textStatus) {
      $(this).removeClass('disabled').removeAttr('disabled').prop('disabled', false);
    },
    success: function (response) {
      // Set the new XSRF token
      if (typeof response.csrfToken !== 'undefined') {
        $("meta[name='csrf-token']").attr("content", response.csrfToken);
      }

      if (response.status === 'error') {
        setTimeout(function () {
          Swal.fire({
            icon: 'error',
            title: 'Hoppá!',
            text: 'Váratlan hiba történt! Szóljatok a Krisztinek, léci ne csináljatok semmit!',
          });
        }, 1000);
      }
      else if (response.status === 'success') {
        setTimeout(function () {
          Swal.fire({
            title: 'Üzenet tartalma',
            icon: 'info',
            html: response.htmlResponse,
          });
        }, 1000);
      }
    }
  });
});

// Simple ajax
$('body').on('click', '.js-simple-ajax', function (event) {
  event.preventDefault();

  $.ajax({
    type: "GET",
    url: $(this).data("url"),
    dataType: 'json',
    beforeSend: function (jqXHR) {
      Swal.fire('Feldolgozás folyamatban...');
      Swal.showLoading();
      $(this).addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
    },
    complete: function (jqXHR, textStatus) {
      $(this).removeClass('disabled').removeAttr('disabled').prop('disabled', false);
    },
    success: function (response) {
      // Set the new XSRF token
      if (typeof response.csrfToken !== 'undefined') {
        $("meta[name='csrf-token']").attr("content", response.csrfToken);
      }

      if (response.status === 'success') {
        setTimeout(function () {
          Swal.fire({
            title: response.title || false,
            icon: response.icon || 'success',
            text: response.text,
          }).then(function() {
            var callbackFunction = $(this).data("callback");

            if (response.redirect_url) {
              window.location = response.redirect_url;
            }
            else if (callbackFunction && typeof window[callbackFunction] == 'function') {
              window[callbackFunction](response);
            }
          });
        }, 1000);
      }
      else if (response.status === 'error') {
        setTimeout(function () {
          Swal.fire({
            icon: 'error',
            title: 'Hoppá!',
            text: 'Váratlan hiba történt! Szóljatok a Krisztinek, léci ne csináljatok semmit!',
          });
        }, 1000);
      }
    }
  });
});

// Toggle comment verified badge
$('body').on('click', '.js-toggle-verified-badge', function (event) {
  event.preventDefault();

  $.ajax({
    type: "POST",
    url: $(this).data("url"),
    dataType: 'json',
    data: [{ name: "activationStatus", value: $(this).data("activationStatus") }],
    beforeSend: function (jqXHR) {
      Swal.fire('Feldolgozás folyamatban...');
      Swal.showLoading();
    },
    complete: function (jqXHR, textStatus) {
      // Nothing
    },
    success: function (response) {
      // Set the new XSRF token
      if (typeof response.csrfToken !== 'undefined') {
        $("meta[name='csrf-token']").attr("content", response.csrfToken);
      }

      if (response.status === 'success') {
        setTimeout(function () {
          Swal.fire({
            title: "Sikeresen frissitve!",
            icon: 'success',
          }).then(function() {
            window.location.reload();
          });
        }, 1000);
      }
      else if (response.status === 'error') {
        setTimeout(function () {
          Swal.fire({
            icon: 'error',
            title: 'Hoppá!',
            text: 'Váratlan hiba történt! Szóljatok a Krisztinek, léci ne csináljatok semmit!',
          });
        }, 1000);
      }
    }
  });
});

// Toggle discount price input
$('body').on('change', '.js-discount-input-toggle', function (event) {
  event.preventDefault();
  var inputContainer = $(this).closest('.js-price-wrapper').find('.js-input-container');
  var inputField = inputContainer.find('.js-discount-input');

  if ( inputContainer[0].style.display === 'none' ) {
    inputContainer.slideDown(300);
    inputField.rules('add', {
      required: true,
      digits: true
    });
  }
  else {
    inputContainer.slideUp(300);
    inputField.rules('remove');
    inputField.hasClass('is-valid') && inputField.removeClass('is-valid');
    inputField.val('');
  }
});

// Boolean checkbox values handle
$('input.js-boolean-checkbox[type="checkbox"]').change(function () {
  this.value = (Number(this.checked));
});

$('.js-validate-form').not('.inited').each(function () {
  $(this).validate({
    ignore: 'input[type=hidden], .dont-validate',
    errorClass: 'is-invalid',
    validClass: 'is-valid',
    focusInvalid: false,
    invalidHandler: function (form, validator) {
      if (validator.numberOfInvalids() > 0) {
        form.preventDefault();
      }
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass(errorClass).removeClass(validClass);
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass(errorClass).addClass(validClass);
    },
    errorPlacement: function (error, element) {
      var parent = $(element).closest('.form-row');
      error.addClass('error-label');
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
          Swal.fire('Feldolgozás folyamatban...');
          Swal.showLoading();
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
            setTimeout(function () {
              Swal.fire({
                icon: 'error',
                title: response.title || 'Hoppá!',
                text: response.text || 'Váratlan hiba történt! Szóljatok a Krisztinek, léci ne csináljatok semmit!',
              });
            }, 1000);
          }
          else if (response.status === 'success') {
            if (!$(form).data('noReset')) {
              form.reset();
            }

            setTimeout(function () {
              Swal.fire({
                title: response.title || "Sikeresen feldolgozva",
                icon: response.icon || 'success',
                text: response.text || false,
              }).then(function() {
                var callbackFunction = $(form).data("callback");

                if (response.redirect_url) {
                  window.location = response.redirect_url;
                }
                else if (callbackFunction && typeof window[callbackFunction] == 'function') {
                  window[callbackFunction](response, form);
                }
              });
            }, 1000);
          }
        }
      });
    },
  });

  $(this).addClass('inited');
});

// Open order editor modal
$('body').on('mouseenter', '.js-open-edit-order', function () {
  $(this).find('.js-statuses-container').css({ 'visibility': 'visible', 'opacity': '1' });
});

// Close order editor modal
$('body').on('mouseleave', '.js-open-edit-order', function () {
  $(this).find('.js-statuses-container').css({ 'visibility': 'hidden', 'opacity': '0' });
});

$('body').on('click', '.js-status-btn', function (event) {
  event.preventDefault();

  $.ajax({
    type: "POST",
    url: $(this).data("url"),
    dataType: 'json',
    data: { new_status: $(this).data("status") },
    beforeSend: function (jqXHR) {
      Swal.fire('Feldolgozás folyamatban...');
      Swal.showLoading();
    },
    success: function (response) {
      // Set the new XSRF token
      if (typeof response.csrfToken !== 'undefined') {
        $("meta[name='csrf-token']").attr("content", response.csrfToken);
      }

      if (response.status === 'success') {
        setTimeout(function () {
          Swal.fire({
            title: "Sikeresen frissitve!",
            icon: 'success',
          }).then(function() {
            window.location.reload();
          });
        }, 1000);
      }
      else if (response.status === 'error') {
        setTimeout(function () {
          Swal.fire({
            icon: 'error',
            title: response.title || 'Hoppá!',
            text: response.message || 'Váratlan hiba történt! Szóljatok a Krisztinek, léci ne csináljatok semmit!',
          });
        }, 1000);
      }
    }
  });
});
