/*!
    * Start Bootstrap - SB Admin v7.0.7 (https://startbootstrap.com/template/sb-admin)
    * Copyright 2013-2023 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
    */
    //
// Scripts
//

window.addEventListener('DOMContentLoaded', function (event) {
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
});

// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

// Pie Chart Example
// var ctxPieChart = document.getElementById("myPieChart");
// var myPieChart = new Chart(ctxPieChart, {
//   type: 'pie',
//   data: {
//     labels: ["Blue", "Red", "Yellow", "Green"],
//     datasets: [{
//       data: [12.21, 15.58, 11.25, 8.32],
//       backgroundColor: ['#007bff', '#dc3545', '#ffc107', '#28a745'],
//     }],
//   },
// });

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
        type: "POST",
        url: $(this_button).data('url'),
        dataType: 'json',
        data: [{ name: "_csrf", value: $("meta[name='csrf-token']").attr("content") }],
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
                title: 'Hoppá!',
                text: 'Váratlan hiba történt! Szóljatok a Krisztinek, léci ne csináljatok semmit!',
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

// Simple ajax request
$('body').on('click', '.js-simple-ajax', function (event) {
  event.preventDefault();

  $.ajax({
    type: "POST",
    url: $(this).data("url"),
    dataType: 'json',
    data: [{ name: "_csrf", value: $("meta[name='csrf-token']").attr("content") }],
    beforeSend: function (jqXHR) {
      Swal.fire('Folyamatban...');
      Swal.showLoading();
      $(this).addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
    },
    complete: function (jqXHR, textStatus) {
      $(this).removeClass('disabled').removeAttr('disabled').prop('disabled', false);
    },
    success: function (response) {
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
            title: 'Sikeresen feldolgozva!',
            icon: 'success',
            text: response.text ? response.text : false,
            confirmButtonText: "OK",
          })
          .then(function (result) {
            if (result.isConfirmed) {

              if (response.redirect_url) {
                setTimeout(function () {
                  window.location = response.redirect_url;
                }, 500);
              }
            }
          });
        }, 1000);
      }
    }
  });
});
