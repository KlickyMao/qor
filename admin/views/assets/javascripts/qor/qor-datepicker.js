(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node / CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function ($) {

  'use strict';

  var NAMESPACE = 'qor.datepicker',
      EVENT_ENABLE = 'enable.' + NAMESPACE,
      EVENT_DISABLE = 'disable.' + NAMESPACE,
      EVENT_CHANGE = 'change.' + NAMESPACE,
      EVENT_CLICK = 'click.' + NAMESPACE,

      CLASS_EMBEDDED = '.qor-datepicker-embedded',
      CLASS_SAVE = '.qor-datepicker-save',

      QorDatepicker = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, QorDatepicker.DEFAULTS, $.isPlainObject(options) && options);
        this.date = null;
        this.formatDate = null;
        this.built = false;
        this.init();
      };

  QorDatepicker.prototype = {
    init: function () {
      this.bind();
    },

    bind: function () {
      this.$element.on(EVENT_CLICK, $.proxy(this.show, this));
    },

    unbind: function () {
      this.$element.off(EVENT_CLICK, this.show);
    },

    build: function () {
      var $modal;

      if (this.built) {
        return;
      }

      this.$modal = $modal = $(QorDatepicker.TEMPLATE).appendTo('body');

      $modal.
        find(CLASS_EMBEDDED).
          on(EVENT_CHANGE, $.proxy(this.change, this)).
          datepicker({
            date: this.$element.val(),
            dateFormat: 'yyyy-mm-dd',
            inline: true
          }).
          triggerHandler(EVENT_CHANGE);

      $modal.
        find(CLASS_SAVE).
          on(EVENT_CLICK, $.proxy(this.pick, this));

      this.built = true;
    },

    unbuild: function () {
      if (!this.built) {
        return;
      }

      this.$modal.
        find(CLASS_EMBEDDED).
          off(EVENT_CHANGE, this.change).
          datepicker('destroy').
          end().
        find(CLASS_SAVE).
          off(EVENT_CLICK, this.pick).
          end().
        remove();
    },

    change: function (e) {
      var $modal = this.$modal,
          $target = $(e.target),
          date;

      this.date = date = $target.datepicker('getDate');
      this.formatDate = $target.datepicker('getDate', true);

      $modal.find('.qor-datepicker-year').text(date.getFullYear());
      $modal.find('.qor-datepicker-month').text(String($target.datepicker('getMonthByNumber', date.getMonth(), true)).toUpperCase());
      $modal.find('.qor-datepicker-week').text($target.datepicker('getDayByNumber', date.getDay()));
      $modal.find('.qor-datepicker-day').text(date.getDate());
    },

    show: function () {
      if (!this.built) {
        this.build();
      }

      this.$modal.modal('show');
    },

    pick: function () {
      this.$element.val(this.formatDate);
      this.$modal.modal('hide');
    },

    destroy: function () {
      this.unbind();
      this.unbuild();
      this.$element.removeData(NAMESPACE);
    }
  };

  QorDatepicker.DEFAULTS = {};

  QorDatepicker.TEMPLATE = (
    '<div class="modal fade qor-datepicker-modal" id="qorDatepickerModal" tabindex="-1" role="dialog" aria-labelledby="qorDatepickerModalLabel" aria-hidden="true">' +
      '<div class="modal-dialog qor-datepicker">' +
        '<div class="modal-content">' +
          '<div class="modal-header sr-only">' +
            '<h5 class="modal-title" id="qorDatepickerModalLabel">Pick a date</h5>' +
          '</div>' +
          '<div class="modal-body">' +
            '<div class="qor-datepicker-picked">' +
              '<div class="qor-datepicker-week"></div>' +
              '<div class="qor-datepicker-month"></div>' +
              '<div class="qor-datepicker-day"></div>' +
              '<div class="qor-datepicker-year"></div>' +
            '</div>' +
            '<div class="qor-datepicker-embedded"></div>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button type="button" class="btn btn-link" data-dismiss="modal">Cancel</button>' +
            '<button type="button" class="btn btn-link qor-datepicker-save">OK</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );

  QorDatepicker.plugin = function (options) {
    return this.each(function () {
      var $this = $(this),
          data = $this.data(NAMESPACE),
          fn;

      if (!data) {
        if (!$.fn.datepicker) {
          return;
        }

        if (/destroy/.test(options)) {
          return;
        }

        $this.data(NAMESPACE, (data = new QorDatepicker(this, options)));
      } else {
        options = 'show';
      }

      if (typeof options === 'string' && $.isFunction(fn = data[options])) {
        fn.apply(data);
      }
    });
  };

  $(function () {
    var selector = '[data-toggle="qor.datepicker"]';

    $(document)
      .on(EVENT_CLICK, selector, function () {
        QorDatepicker.plugin.call($(this));
      })
      .on(EVENT_DISABLE, function (e) {
        QorDatepicker.plugin.call($(selector, e.target), 'destroy');
      })
      .on(EVENT_ENABLE, function (e) {
        QorDatepicker.plugin.call($(selector, e.target));
      })
      .triggerHandler(EVENT_ENABLE);
  });

  return QorDatepicker;

});
