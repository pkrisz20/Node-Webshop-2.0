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

// Area Chart Example
var ctxAreChart = document.getElementById("myAreaChart");
var myLineChart = new Chart(ctxAreChart, {
  type: 'line',
  data: {
    labels: ["Mar 1", "Mar 2", "Mar 3", "Mar 4", "Mar 5", "Mar 6", "Mar 7", "Mar 8", "Mar 9", "Mar 10", "Mar 11", "Mar 12", "Mar 13"],
    datasets: [{
      label: "Sessions",
      lineTension: 0.3,
      backgroundColor: "rgba(2,117,216,0.2)",
      borderColor: "rgba(2,117,216,1)",
      pointRadius: 5,
      pointBackgroundColor: "rgba(2,117,216,1)",
      pointBorderColor: "rgba(255,255,255,0.8)",
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "rgba(2,117,216,1)",
      pointHitRadius: 50,
      pointBorderWidth: 2,
      data: [10000, 30162, 26263, 18394, 18287, 28682, 31274, 33259, 25849, 24159, 32651, 31984, 38451],
    }],
  },
  options: {
    scales: {
      xAxes: [{
        time: {
          unit: 'date'
        },
        gridLines: {
          display: false
        },
        ticks: {
          maxTicksLimit: 7
        }
      }],
      yAxes: [{
        ticks: {
          min: 0,
          max: 40000,
          maxTicksLimit: 5
        },
        gridLines: {
          color: "rgba(0, 0, 0, .125)",
        }
      }],
    },
    legend: {
      display: false
    }
  }
});

// Delete data
$('body').on('click', '.js-delete-data', function () {

  var this_button = $(this);

  Swal.fire({
    title: 'Biztosan szeretné törölni?',
    text: "Ez a folyamat visszafordíthatatlan!",
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
                icon: 'success',
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
