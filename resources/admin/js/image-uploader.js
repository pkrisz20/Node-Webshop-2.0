$(document).ready(function() {

    if ( $('body .js-image-upload-form').length > 0 ) {

        $('body').on('click', '.js-upload-submit', function (event) {
            event.preventDefault();
            var submitButton = $(this);
            var fileInput = submitButton.closest('.js-image-upload-form').find('.js-file-input');

            if ( fileInput[0].files.length === 0 ) {
                Swal.fire({ icon: 'warning', title: 'Nincs fájl kiválasztva!' });
                return;
            }

            var uploadForm = submitButton.closest('.js-image-upload-form');
            var formData = new FormData( $(uploadForm)[0] );
            formData.append('databaseId', fileInput.data('id'));

            $.ajax({
                type: "post",
                url: $(uploadForm).data('url'),
                dataType: 'json',
                processData: false,
                contentType: false,
                headers: {
                    'X-CSRF-TOKEN': $("meta[name='csrf-token']").attr("content")
                },
                data: formData,
                beforeSend: function (jqXHR) {
                    submitButton.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
                    Swal.fire('Feldolgozás folyamatban...');
                    Swal.showLoading();
                },
                complete: function (jqXHR, textStatus) {
                    submitButton.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
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
                                text: response.message || 'Váratlan hiba történt! Szóljatok a Krisztinek, léci ne csináljatok semmit!',
                            });
                        }, 1000);
                    }
                    else if (response.status === 'success') {
                        setTimeout(function () {
                            Swal.fire({
                                title: response.title || "Sikeresen feltöltve",
                                icon: response.icon || 'success',
                                text: response.message || "Az oldal újra fog tölteni másodperceken belül, hogy a friss adatok legyenek láthatóak",
                            }).then(function () {
                                window.location.reload();
                            });
                        }, 1000);
                    }
                }
            });
        });
    }
});
