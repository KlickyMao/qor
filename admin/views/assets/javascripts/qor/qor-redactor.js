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

  var $window = $(window),
      NAMESPACE = 'qor.redactor',
      EVENT_ENABLE = 'enable.' + NAMESPACE,
      EVENT_DISABLE = 'disable.' + NAMESPACE,
      EVENT_CLICK = 'click.' + NAMESPACE,
      EVENT_FOCUS = 'focus.' + NAMESPACE,
      EVENT_BLUR = 'blur.' + NAMESPACE,
      EVENT_IMAGE_UPLOAD = 'imageupload.' + NAMESPACE,
      EVENT_IMAGE_DELETE = 'imagedelete.' + NAMESPACE,
      REGEXP_OPTIONS = /x|y|width|height/,

      QorRedactor = function (element, options) {
        this.$element = $(element);
        this.options = $.extend(true, {}, QorRedactor.DEFAULTS, $.isPlainObject(options) && options);
        this.init();
      };

  function encodeCropData(data) {
    var nums = [];

    if ($.isPlainObject(data)) {
      $.each(data, function () {
        nums.push(arguments[1]);
      });
    }

    return nums.join();
  }

  function decodeCropData(data) {
    var nums = data && data.split(',');

    data = null;

    if (nums && nums.length === 4) {
      data = {
        x: Number(nums[0]),
        y: Number(nums[1]),
        width: Number(nums[2]),
        height: Number(nums[3])
      };
    }

    return data;
  }

  function capitalize (str) {
    if (typeof str === 'string') {
      str = str.charAt(0).toUpperCase() + str.substr(1);
    }

    return str;
  }

  function getCapitalizeKeyObject (obj) {
    var newObj = {},
        key;

    if ($.isPlainObject(obj)) {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[capitalize(key)] = obj[key];
        }
      }
    }

    return newObj;
  }

  QorRedactor.prototype = {
    constructor: QorRedactor,

    init: function () {
      var options = this.options,
          $this = this.$element,
          $parent = $this.closest(options.parent);

      if (!$parent.length) {
        $parent = $this.parent();
      }

      this.$parent = $parent;
      this.$button = $(QorRedactor.BUTTON);
      this.$modal = $(QorRedactor.MODAL).appendTo('body');
      this.bind();
    },

    bind: function () {
      var $parent = this.$parent,
          click = $.proxy(this.click, this);

      this.$element.
        on(EVENT_IMAGE_UPLOAD, function (e, image) {
          $(image).on(EVENT_CLICK, click);
        }).
        on(EVENT_IMAGE_DELETE, function (e, image) {
          $(image).off(EVENT_CLICK, click);
        }).
        on(EVENT_FOCUS, function () {
          $parent.find('img').off(EVENT_CLICK, click).on(EVENT_CLICK, click);
        }).
        on(EVENT_BLUR, function () {
          $parent.find('img').off(EVENT_CLICK, click);
        });

      $window.on(EVENT_CLICK, $.proxy(this.removeButton, this));
    },

    unbind: function () {
      this.$element.
        off(EVENT_IMAGE_UPLOAD).
        off(EVENT_IMAGE_DELETE).
        off(EVENT_FOCUS).
        off(EVENT_BLUR);

      $window.off(EVENT_CLICK, this.removeButton);
    },

    click: function (e) {
      e.stopPropagation();
      setTimeout($.proxy(this.addButton, this, $(e.target)), 1);
    },

    addButton: function ($image) {
      this.$button.insertBefore($image).off(EVENT_CLICK).one(EVENT_CLICK, $.proxy(this.crop, this, $image));
    },

    removeButton: function () {
      this.$button.off(EVENT_CLICK).detach();
    },

    crop: function ($image) {
      var options = this.options,
          url = $image.attr('src'),
          originalUrl = url,
          $clone = $('<img>'),
          $modal = this.$modal;

      if ($.isFunction(options.replace)) {
        originalUrl = options.replace(originalUrl);
      }

      $clone.attr('src', originalUrl);
      $modal.one('shown.bs.modal', function () {
        $clone.cropper({
          data: decodeCropData($image.attr('data-crop-options')),
          background: false,
          movable: false,
          zoomable: false,
          rotatable: false,
          checkImageOrigin: false,

          built: function () {
            $modal.find(options.save).one('click', function () {
              var cropData = {};

              $.each($clone.cropper('getData'), function (i, n) {
                if (REGEXP_OPTIONS.test(i)) {
                  cropData[i] = Math.round(n);
                }
              });

              $.ajax(options.remote, {
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  Url: url,
                  CropOptions: {
                    original: getCapitalizeKeyObject(cropData)
                  },
                  Crop: true
                }),
                dataType: 'json',

                success: function (response) {
                  if ($.isPlainObject(response) && response.url) {
                    $image.attr('src', response.url).attr('data-crop-options', encodeCropData(cropData)).removeAttr('style').removeAttr('rel');

                    if ($.isFunction(options.complete)) {
                      options.complete();
                    }

                    $modal.modal('hide');
                  }
                }
              });
            });
          }
        });
      }).one('hidden.bs.modal', function () {
        $clone.cropper('destroy').remove();
      }).modal('show').find('.modal-body').append($clone);
    },

    destroy: function () {
      this.unbind();
      this.$modal.modal('hide').remove();
      this.$element.removeData(NAMESPACE);
    }
  };

  QorRedactor.DEFAULTS = {
    remote: false,
    toggle: false,
    parent: false,
    modal: '.qor-cropper-modal',
    save: '.qor-cropper-save',
    replace: null,
    complete: null
  };

  QorRedactor.BUTTON = '<span class="redactor-image-cropper">Crop</span>';
  QorRedactor.MODAL = (
    '<div class="modal fade qor-cropper-modal" tabindex="-1" role="dialog" aria-hidden="true">' +
      '<div class="modal-dialog">' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h5 class="modal-title">Crop the image</h5>' +
          '</div>' +
          '<div class="modal-body"></div>' +
          '<div class="modal-footer">' +
            '<button type="button" class="btn btn-link" data-dismiss="modal">Cancel</button>' +
            '<button type="button" class="btn btn-link qor-cropper-save">OK</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );

  QorRedactor.plugin = function (options) {
    return this.each(function () {
      var $this = $(this),
          data = $this.data(NAMESPACE),
          config,
          fn;

      if (!data) {
        if (!$.fn.redactor) {
          return;
        }

        if (/destroy/.test(options)) {
          return;
        }

        $this.data(NAMESPACE, (data = {}));
        config = $this.data();

        $this.redactor({
          imageUpload: config.uploadUrl,
          fileUpload: config.uploadUrl,

          initCallback: function () {
            $this.data(NAMESPACE, (data = new QorRedactor($this, {
              remote: config.cropUrl,
              toggle: '.redactor-image-cropper',
              parent: '.form-group',
              replace: function (url) {
                return url.replace(/\.\w+$/, function (extension) {
                  return '.original' + extension;
                });
              },
              complete: $.proxy(function () {
                this.code.sync();
              }, this)
            })));
          },

          focusCallback: function (/*e*/) {
            $this.triggerHandler(EVENT_FOCUS);
          },

          blurCallback: function (/*e*/) {
            $this.triggerHandler(EVENT_BLUR);
          },

          imageUploadCallback: function (/*image, json*/) {
            $this.triggerHandler(EVENT_IMAGE_UPLOAD, arguments[0]);
          },

          imageDeleteCallback: function (/*url, image*/) {
            $this.triggerHandler(EVENT_IMAGE_DELETE, arguments[1]);
          }
        });
      } else {
        if (/destroy/.test(options)) {
          $this.redactor('core.destroy');
        }
      }

      if (typeof options === 'string' && $.isFunction(fn = data[options])) {
        fn.apply(data);
      }
    });
  };

  $(function () {
    var selector = '.qor-textarea';

    $(document)
      .on(EVENT_DISABLE, function (e) {
        QorRedactor.plugin.call($(selector, e.target), 'destroy');
      })
      .on(EVENT_ENABLE, function (e) {
        QorRedactor.plugin.call($(selector, e.target));
      })
      .triggerHandler(EVENT_ENABLE);
  });

  return QorRedactor;

});
