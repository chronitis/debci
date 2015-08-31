jQuery(function($) {

  var PACKAGES_HTML_DIR = '/data/.html/packages';
  var STATUS_DIR = '/data/status/';
  var STATUS_HTML_DIR = '/data/.html/status';

  function pkg_dir(pkg) {
    return pkg.replace(/^((lib)?.)/, "$1/$&");
  }

  function on(selector, handler) {
    if ($.find(selector).length > 0) {
      handler();
    }
  }

  on('#status', function() {
    $.get(STATUS_HTML_DIR + '/platforms.json', function(data) {
      $.each(data, function(index, item) {

        var platform = item.platform.replace('/', '-')

        $.get(STATUS_DIR + item.platform + '/history.json', function(data) {
          if (data.length < 2) {
            $('.chart').html("Not enough data for plot. Wait until the next run");
            return;
          }

          var pass = [];
          var fail = [];
          var tmpfail = [];
          var pass_percentage = [];
          var duration = [];
          var max_duration = 0;
          $.each(data, function(index, entry) {
            var date = Date.parse(entry.date);
            pass.push([date, entry.pass]);
            fail.push([date, entry.fail]);
            tmpfail.push([date, entry.tmpfail || 0]);
            pass_percentage.push([date, entry.pass / entry.total]);
            duration.push([date, entry.duration]);
            if (entry.duration && entry.duration > max_duration) {
              max_duration = entry.duration;
            }
          });

          var status_data = [
            {
              label: "Pass",
              data: pass
            },
            {
              label: "Fail",
              data: fail
            },
            {
              label: "Temporary failure",
              data: tmpfail
            }
          ];

          $.plot("#chart-pass-fail" + platform, status_data, {
            series: {
              stack: true,
              lines: {
                show: true,
                fill: true,
                steps: false,
              }
            },
            colors: [ '#8ae234', '#ef2929', '#ffd862' ],
            legend: {
              show: true,
              backgroundOpacity: 0.2,
              position: 'sw'
            },
            xaxis: {
              mode: "time"
            },
            yaxis: {
              min: 0
            }
          });

          $.plot('#chart-pass-percentage' + platform, [pass_percentage], {
            series: {
              lines: {
                show: true
              }
            },
            colors: [ '#8ae234' ],
            xaxis: {
              mode: 'time',
            },
            yaxis: {
              min: 0,
              max: 1,
              ticks: [[0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1.0, '100%']]
            }
          });

        })
      })
    })
  });

  on('#package-select', function() {
    $.get(PACKAGES_HTML_DIR + '/packages.json', function(data) {
      $.each(data, function(index, item) {
        var package_dir = pkg_dir(item.package);

        var $item = $('<li></li>');
        $item.attr('data-package', item.package);

        var $link = $('<a></a>');
        $link.attr('href', '/packages/' + package_dir);
        $link.html('<b>' + item.package + '</b> (package page)');
        $item.append($link);

        var $sublinks = $('<div></div>');
        $sublinks.addClass('search-sub-links');

        for (var platform in item.status) {
          var $link = $('<a></a>');
          $link.addClass(item.status[platform]);
          $link.attr('href', '/packages/' + package_dir + '/' + platform);
          $link.html(platform);
          $sublinks.append($link)
        }
        $item.append($sublinks);

        $('#package-select').append($item);

      });

      $('#package-select').hide();

      if ($('#package-search').val() != '') {
        // trigger search immediately if there is something in the search box
        // already
        $('#package-search').keyup();
      }
    });

    if (window.location.search.match(/\?q=/)) {
      var query_string = window.location.search.replace(/^\?/, '').split('&');
      for (var i = 0; i < query_string.length; i++) {
        var parts = query_string[i].split('=');
        var key = parts[0];
        if (key == 'q') {
          var value = decodeURIComponent(parts[1]);
          $('#package-search').val(value);
        }
      }
    }
  });

  $('#package-search').keyup(function() {
      var query = $(this).val();

      if (query.length > 0) {
        $('.request-search').hide();
        $('#package-select').show();
        var found = 0;
        $('#package-select li').each(function() {
          if ($(this).attr('data-package').match(query)) {
            $(this).show();
            found++;
          } else {
            $(this).hide();
          }
        });
        if (found > 0) {
          $('.search-no-results').hide();
          $('.search-count .count').html(found);
          $('.search-count').show();
        } else {
          $('.search-no-results').show();
          $('.search-count').hide();
        }
      } else {
        $('.search-no-results').hide();
        $('.request-search').show();
        $('.search-count').hide();
        $('#package-select li').hide();
      }

      window.history.replaceState({}, '', '?q=' + encodeURIComponent(query));
  });

  if (window.location.pathname == '/') {
    var match = window.location.hash.match(/^#package\/(\S+)$/);
    if (match) {
      var pkg = match[1];
      window.location.href = '/packages/' + pkg_dir(pkg);
    }
  }

});
