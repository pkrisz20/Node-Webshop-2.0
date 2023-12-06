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

        $('body').on('click', '.js-delete-image', function (event) {
            event.preventDefault();
            var deleteButton = $(this);
            var fileSource = deleteButton.closest('.js-image-item').find('.js-uploaded-image');

            Swal.fire({
                title: "Biztosan törlöd ezt a képet?",
                text: "Ez a folyamat visszafordíthatatlan!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#008a00",
                cancelButtonColor: "#db3700",
                confirmButtonText: "Igen, törlöm!",
                cancelButtonText: "Nem, mégsem!"
            }).then(function (result) {
                if (result.isConfirmed) {

                    $.ajax({
                        type: "post",
                        url: $(deleteButton).data('url'),
                        dataType: 'json',
                        headers: {
                            'X-CSRF-TOKEN': $("meta[name='csrf-token']").attr("content")
                        },
                        data: {
                            databaseId: deleteButton.data('id'),
                            fileType: deleteButton.data('type'),
                            fileSource: fileSource.attr('src'),
                        },
                        beforeSend: function (jqXHR) {
                            deleteButton.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
                            Swal.fire('Feldolgozás folyamatban...');
                            Swal.showLoading();
                        },
                        complete: function (jqXHR, textStatus) {
                            deleteButton.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
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
                                        title: response.title || "Sikeresen törölve",
                                        icon: response.icon || 'success',
                                        text: response.message || "A fájl törlésre került a rendszerből. Az oldal újra fog tölteni másodperceken belül.",
                                    }).then(function () {
                                        window.location.reload();
                                    });
                                }, 1000);
                            }
                        }
                    });
                }
            });
        });
    }
});
