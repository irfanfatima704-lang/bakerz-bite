
(function (window, document) {
  'use strict';
  if (!window.jQuery) return;
  var $ = window.jQuery;
  $(function () {
    if (!$('#bb-back-to-top').length) {
      $('<button>', {
        id: 'bb-back-to-top',
        type: 'button',
        'aria-label': 'Back to top',
        title: 'Back to top',
        text: '↑'
      }).appendTo('body');
    }
    var $button = $('#bb-back-to-top');
    function updateVisibility() {
      $button.toggleClass('is-visible', $(window).scrollTop() > 320);
    }
    $(window).on('scroll.bbBackToTop resize.bbBackToTop', updateVisibility);
    $button.on('click', function () {
      $('html, body').stop(true).animate({ scrollTop: 0 }, 450);
    });
    updateVisibility();
  });
})(window, document);
