(function ($) {

/**
 * Provides Ajax page updating via jQuery $.ajax (Asynchronous JavaScript and XML).
 *
 * Ajax is a method of making a request via JavaScript while viewing an HTML
 * page. The request returns an array of commands encoded in JSON, which is
 * then executed to make any changes that are necessary to the page.
 *
 * Drupal uses this file to enhance form elements with #ajax['path'] and
 * #ajax['wrapper'] properties. If set, this file will automatically be included
 * to provide Ajax capabilities.
 */

Drupal.ajax = Drupal.ajax || {};

Drupal.settings.urlIsAjaxTrusted = Drupal.settings.urlIsAjaxTrusted || {};

/**
 * Attaches the Ajax behavior to each Ajax form element.
 */
Drupal.behaviors.AJAX = {
  attach: function (context, settings) {
    // Load all Ajax behaviors specified in the settings.
    for (var base in settings.ajax) {
      if (!$('#' + base + '.ajax-processed').length) {
        var element_settings = settings.ajax[base];

        if (typeof element_settings.selector == 'undefined') {
          element_settings.selector = '#' + base;
        }
        $(element_settings.selector).each(function () {
          element_settings.element = this;
          Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
        });

        $('#' + base).addClass('ajax-processed');
      }
    }

    // Bind Ajax behaviors to all items showing the class.
    $('.use-ajax:not(.ajax-processed)').addClass('ajax-processed').each(function () {
      var element_settings = {};
      // Clicked links look better with the throbber than the progress bar.
      element_settings.progress = { 'type': 'throbber' };

      // For anchor tags, these will go to the target of the anchor rather
      // than the usual location.
      if ($(this).attr('href')) {
        element_settings.url = $(this).attr('href');
        element_settings.event = 'click';
      }
      var base = $(this).attr('id');
      Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
    });

    // This class means to submit the form to the action using Ajax.
    $('.use-ajax-submit:not(.ajax-processed)').addClass('ajax-processed').each(function () {
      var element_settings = {};

      // Ajax submits specified in this manner automatically submit to the
      // normal form action.
      element_settings.url = $(this.form).attr('action');
      // Form submit button clicks need to tell the form what was clicked so
      // it gets passed in the POST request.
      element_settings.setClick = true;
      // Form buttons use the 'click' event rather than mousedown.
      element_settings.event = 'click';
      // Clicked form buttons look better with the throbber than the progress bar.
      element_settings.progress = { 'type': 'throbber' };

      var base = $(this).attr('id');
      Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
    });
  }
};

/**
 * Ajax object.
 *
 * All Ajax objects on a page are accessible through the global Drupal.ajax
 * object and are keyed by the submit button's ID. You can access them from
 * your module's JavaScript file to override properties or functions.
 *
 * For example, if your Ajax enabled button has the ID 'edit-submit', you can
 * redefine the function that is called to insert the new content like this
 * (inside a Drupal.behaviors attach block):
 * @code
 *    Drupal.behaviors.myCustomAJAXStuff = {
 *      attach: function (context, settings) {
 *        Drupal.ajax['edit-submit'].commands.insert = function (ajax, response, status) {
 *          new_content = $(response.data);
 *          $('#my-wrapper').append(new_content);
 *          alert('New content was appended to #my-wrapper');
 *        }
 *      }
 *    };
 * @endcode
 */
Drupal.ajax = function (base, element, element_settings) {
  var defaults = {
    url: 'system/ajax',
    event: 'mousedown',
    keypress: true,
    selector: '#' + base,
    effect: 'none',
    speed: 'none',
    method: 'replaceWith',
    progress: {
      type: 'throbber',
      message: Drupal.t('Please wait...')
    },
    submit: {
      'js': true
    }
  };

  $.extend(this, defaults, element_settings);

  this.element = element;
  this.element_settings = element_settings;

  // Replacing 'nojs' with 'ajax' in the URL allows for an easy method to let
  // the server detect when it needs to degrade gracefully.
  // There are five scenarios to check for:
  // 1. /nojs/
  // 2. /nojs$ - The end of a URL string.
  // 3. /nojs? - Followed by a query (with clean URLs enabled).
  //      E.g.: path/nojs?destination=foobar
  // 4. /nojs& - Followed by a query (without clean URLs enabled).
  //      E.g.: ?q=path/nojs&destination=foobar
  // 5. /nojs# - Followed by a fragment.
  //      E.g.: path/nojs#myfragment
  this.url = element_settings.url.replace(/\/nojs(\/|$|\?|&|#)/g, '/ajax$1');
  // If the 'nojs' version of the URL is trusted, also trust the 'ajax' version.
  if (Drupal.settings.urlIsAjaxTrusted[element_settings.url]) {
    Drupal.settings.urlIsAjaxTrusted[this.url] = true;
  }

  this.wrapper = '#' + element_settings.wrapper;

  // If there isn't a form, jQuery.ajax() will be used instead, allowing us to
  // bind Ajax to links as well.
  if (this.element.form) {
    this.form = $(this.element.form);
  }

  // Set the options for the ajaxSubmit function.
  // The 'this' variable will not persist inside of the options object.
  var ajax = this;
  ajax.options = {
    url: Drupal.sanitizeAjaxUrl(ajax.url),
    data: ajax.submit,
    beforeSerialize: function (element_settings, options) {
      return ajax.beforeSerialize(element_settings, options);
    },
    beforeSubmit: function (form_values, element_settings, options) {
      ajax.ajaxing = true;
      return ajax.beforeSubmit(form_values, element_settings, options);
    },
    beforeSend: function (xmlhttprequest, options) {
      ajax.ajaxing = true;
      return ajax.beforeSend(xmlhttprequest, options);
    },
    success: function (response, status, xmlhttprequest) {
      // Sanity check for browser support (object expected).
      // When using iFrame uploads, responses must be returned as a string.
      if (typeof response == 'string') {
        response = $.parseJSON(response);
      }

      // Prior to invoking the response's commands, verify that they can be
      // trusted by checking for a response header. See
      // ajax_set_verification_header() for details.
      // - Empty responses are harmless so can bypass verification. This avoids
      //   an alert message for server-generated no-op responses that skip Ajax
      //   rendering.
      // - Ajax objects with trusted URLs (e.g., ones defined server-side via
      //   #ajax) can bypass header verification. This is especially useful for
      //   Ajax with multipart forms. Because IFRAME transport is used, the
      //   response headers cannot be accessed for verification.
      if (response !== null && !Drupal.settings.urlIsAjaxTrusted[ajax.url]) {
        if (xmlhttprequest.getResponseHeader('X-Drupal-Ajax-Token') !== '1') {
          var customMessage = Drupal.t("The response failed verification so will not be processed.");
          return ajax.error(xmlhttprequest, ajax.url, customMessage);
        }
      }

      return ajax.success(response, status);
    },
    complete: function (xmlhttprequest, status) {
      ajax.ajaxing = false;
      if (status == 'error' || status == 'parsererror') {
        return ajax.error(xmlhttprequest, ajax.url);
      }
    },
    dataType: 'json',
    jsonp: false,
    type: 'POST'
  };

  // For multipart forms (e.g., file uploads), jQuery Form targets the form
  // submission to an iframe instead of using an XHR object. The initial "src"
  // of the iframe, prior to the form submission, is set to options.iframeSrc.
  // "about:blank" is the semantically correct, standards-compliant, way to
  // initialize a blank iframe; however, some old IE versions (possibly only 6)
  // incorrectly report a mixed content warning when iframes with an
  // "about:blank" src are added to a parent document with an https:// origin.
  // jQuery Form works around this by defaulting to "javascript:false" instead,
  // but that breaks on Chrome 83, so here we force the semantically correct
  // behavior for all browsers except old IE.
  // @see https://www.drupal.org/project/drupal/issues/3143016
  // @see https://github.com/jquery-form/form/blob/df9cb101b9c9c085c8d75ad980c7ff1cf62063a1/jquery.form.js#L68
  // @see https://bugs.chromium.org/p/chromium/issues/detail?id=1084874
  // @see https://html.spec.whatwg.org/multipage/browsers.html#creating-browsing-contexts
  // @see https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
  if (navigator.userAgent.indexOf("MSIE") === -1) {
    ajax.options.iframeSrc = 'about:blank';
  }

  // Bind the ajaxSubmit function to the element event.
  $(ajax.element).bind(element_settings.event, function (event) {
    if (!Drupal.settings.urlIsAjaxTrusted[ajax.url] && !Drupal.urlIsLocal(ajax.url)) {
      throw new Error(Drupal.t('The callback URL is not local and not trusted: !url', {'!url': ajax.url}));
    }
    return ajax.eventResponse(this, event);
  });

  // If necessary, enable keyboard submission so that Ajax behaviors
  // can be triggered through keyboard input as well as e.g. a mousedown
  // action.
  if (element_settings.keypress) {
    $(ajax.element).keypress(function (event) {
      return ajax.keypressResponse(this, event);
    });
  }

  // If necessary, prevent the browser default action of an additional event.
  // For example, prevent the browser default action of a click, even if the
  // AJAX behavior binds to mousedown.
  if (element_settings.prevent) {
    $(ajax.element).bind(element_settings.prevent, false);
  }
};

/**
 * Handle a key press.
 *
 * The Ajax object will, if instructed, bind to a key press response. This
 * will test to see if the key press is valid to trigger this event and
 * if it is, trigger it for us and prevent other keypresses from triggering.
 * In this case we're handling RETURN and SPACEBAR keypresses (event codes 13
 * and 32. RETURN is often used to submit a form when in a textfield, and 
 * SPACE is often used to activate an element without submitting. 
 */
Drupal.ajax.prototype.keypressResponse = function (element, event) {
  // Create a synonym for this to reduce code confusion.
  var ajax = this;

  // Detect enter key and space bar and allow the standard response for them,
  // except for form elements of type 'text' and 'textarea', where the 
  // spacebar activation causes inappropriate activation if #ajax['keypress'] is 
  // TRUE. On a text-type widget a space should always be a space.
  if (event.which == 13 || (event.which == 32 && element.type != 'text' && element.type != 'textarea')) {
    $(ajax.element_settings.element).trigger(ajax.element_settings.event);
    return false;
  }
};

/**
 * Handle an event that triggers an Ajax response.
 *
 * When an event that triggers an Ajax response happens, this method will
 * perform the actual Ajax call. It is bound to the event using
 * bind() in the constructor, and it uses the options specified on the
 * ajax object.
 */
Drupal.ajax.prototype.eventResponse = function (element, event) {
  // Create a synonym for this to reduce code confusion.
  var ajax = this;

  // Do not perform another ajax command if one is already in progress.
  if (ajax.ajaxing) {
    return false;
  }

  try {
    if (ajax.form) {
      // If setClick is set, we must set this to ensure that the button's
      // value is passed.
      if (ajax.setClick) {
        // Mark the clicked button. 'form.clk' is a special variable for
        // ajaxSubmit that tells the system which element got clicked to
        // trigger the submit. Without it there would be no 'op' or
        // equivalent.
        element.form.clk = element;
      }

      ajax.form.ajaxSubmit(ajax.options);
    }
    else {
      ajax.beforeSerialize(ajax.element, ajax.options);
      $.ajax(ajax.options);
    }
  }
  catch (e) {
    // Unset the ajax.ajaxing flag here because it won't be unset during
    // the complete response.
    ajax.ajaxing = false;
    alert("An error occurred while attempting to process " + ajax.options.url + ": " + e.message);
  }

  // For radio/checkbox, allow the default event. On IE, this means letting
  // it actually check the box.
  if (typeof element.type != 'undefined' && (element.type == 'checkbox' || element.type == 'radio')) {
    return true;
  }
  else {
    return false;
  }

};

/**
 * Handler for the form serialization.
 *
 * Runs before the beforeSend() handler (see below), and unlike that one, runs
 * before field data is collected.
 */
Drupal.ajax.prototype.beforeSerialize = function (element, options) {
  // Allow detaching behaviors to update field values before collecting them.
  // This is only needed when field values are added to the POST data, so only
  // when there is a form such that this.form.ajaxSubmit() is used instead of
  // $.ajax(). When there is no form and $.ajax() is used, beforeSerialize()
  // isn't called, but don't rely on that: explicitly check this.form.
  if (this.form) {
    var settings = this.settings || Drupal.settings;
    Drupal.detachBehaviors(this.form, settings, 'serialize');
  }

  // Prevent duplicate HTML ids in the returned markup.
  // @see drupal_html_id()
  options.data['ajax_html_ids[]'] = [];
  $('[id]').each(function () {
    options.data['ajax_html_ids[]'].push(this.id);
  });

  // Allow Drupal to return new JavaScript and CSS files to load without
  // returning the ones already loaded.
  // @see ajax_base_page_theme()
  // @see drupal_get_css()
  // @see drupal_get_js()
  options.data['ajax_page_state[theme]'] = Drupal.settings.ajaxPageState.theme;
  options.data['ajax_page_state[theme_token]'] = Drupal.settings.ajaxPageState.theme_token;
  for (var key in Drupal.settings.ajaxPageState.css) {
    options.data['ajax_page_state[css][' + key + ']'] = 1;
  }
  for (var key in Drupal.settings.ajaxPageState.js) {
    options.data['ajax_page_state[js][' + key + ']'] = 1;
  }
};

/**
 * Modify form values prior to form submission.
 */
Drupal.ajax.prototype.beforeSubmit = function (form_values, element, options) {
  // This function is left empty to make it simple to override for modules
  // that wish to add functionality here.
};

/**
 * Prepare the Ajax request before it is sent.
 */
Drupal.ajax.prototype.beforeSend = function (xmlhttprequest, options) {
  // For forms without file inputs, the jQuery Form plugin serializes the form
  // values, and then calls jQuery's $.ajax() function, which invokes this
  // handler. In this circumstance, options.extraData is never used. For forms
  // with file inputs, the jQuery Form plugin uses the browser's normal form
  // submission mechanism, but captures the response in a hidden IFRAME. In this
  // circumstance, it calls this handler first, and then appends hidden fields
  // to the form to submit the values in options.extraData. There is no simple
  // way to know which submission mechanism will be used, so we add to extraData
  // regardless, and allow it to be ignored in the former case.
  if (this.form) {
    options.extraData = options.extraData || {};

    // Let the server know when the IFRAME submission mechanism is used. The
    // server can use this information to wrap the JSON response in a TEXTAREA,
    // as per http://jquery.malsup.com/form/#file-upload.
    options.extraData.ajax_iframe_upload = '1';

    // The triggering element is about to be disabled (see below), but if it
    // contains a value (e.g., a checkbox, textfield, select, etc.), ensure that
    // value is included in the submission. As per above, submissions that use
    // $.ajax() are already serialized prior to the element being disabled, so
    // this is only needed for IFRAME submissions.
    var v = $.fieldValue(this.element);
    if (v !== null) {
      options.extraData[this.element.name] = Drupal.checkPlain(v);
    }
  }

  // Disable the element that received the change to prevent user interface
  // interaction while the Ajax request is in progress. ajax.ajaxing prevents
  // the element from triggering a new request, but does not prevent the user
  // from changing its value.
  $(this.element).addClass('progress-disabled').attr('disabled', true);

  // Insert progressbar or throbber.
  if (this.progress.type == 'bar') {
    var progressBar = new Drupal.progressBar('ajax-progress-' + this.element.id, $.noop, this.progress.method, $.noop);
    if (this.progress.message) {
      progressBar.setProgress(-1, this.progress.message);
    }
    if (this.progress.url) {
      progressBar.startMonitoring(this.progress.url, this.progress.interval || 1500);
    }
    this.progress.element = $(progressBar.element).addClass('ajax-progress ajax-progress-bar');
    this.progress.object = progressBar;
    $(this.element).after(this.progress.element);
  }
  else if (this.progress.type == 'throbber') {
    this.progress.element = $('<div class="ajax-progress ajax-progress-throbber"><div class="throbber">&nbsp;</div></div>');
    if (this.progress.message) {
      $('.throbber', this.progress.element).after('<div class="message">' + this.progress.message + '</div>');
    }
    $(this.element).after(this.progress.element);
  }
};

/**
 * Handler for the form redirection completion.
 */
Drupal.ajax.prototype.success = function (response, status) {
  // Remove the progress element.
  if (this.progress.element) {
    $(this.progress.element).remove();
  }
  if (this.progress.object) {
    this.progress.object.stopMonitoring();
  }
  $(this.element).removeClass('progress-disabled').removeAttr('disabled');

  Drupal.freezeHeight();

  for (var i in response) {
    if (response.hasOwnProperty(i) && response[i]['command'] && this.commands[response[i]['command']]) {
      this.commands[response[i]['command']](this, response[i], status);
    }
  }

  // Reattach behaviors, if they were detached in beforeSerialize(). The
  // attachBehaviors() called on the new content from processing the response
  // commands is not sufficient, because behaviors from the entire form need
  // to be reattached.
  if (this.form) {
    var settings = this.settings || Drupal.settings;
    Drupal.attachBehaviors(this.form, settings);
  }

  Drupal.unfreezeHeight();

  // Remove any response-specific settings so they don't get used on the next
  // call by mistake.
  this.settings = null;
};

/**
 * Build an effect object which tells us how to apply the effect when adding new HTML.
 */
Drupal.ajax.prototype.getEffect = function (response) {
  var type = response.effect || this.effect;
  var speed = response.speed || this.speed;

  var effect = {};
  if (type == 'none') {
    effect.showEffect = 'show';
    effect.hideEffect = 'hide';
    effect.showSpeed = '';
  }
  else if (type == 'fade') {
    effect.showEffect = 'fadeIn';
    effect.hideEffect = 'fadeOut';
    effect.showSpeed = speed;
  }
  else {
    effect.showEffect = type + 'Toggle';
    effect.hideEffect = type + 'Toggle';
    effect.showSpeed = speed;
  }

  return effect;
};

/**
 * Handler for the form redirection error.
 */
Drupal.ajax.prototype.error = function (xmlhttprequest, uri, customMessage) {
  Drupal.displayAjaxError(Drupal.ajaxError(xmlhttprequest, uri, customMessage));
  // Remove the progress element.
  if (this.progress.element) {
    $(this.progress.element).remove();
  }
  if (this.progress.object) {
    this.progress.object.stopMonitoring();
  }
  // Undo hide.
  $(this.wrapper).show();
  // Re-enable the element.
  $(this.element).removeClass('progress-disabled').removeAttr('disabled');
  // Reattach behaviors, if they were detached in beforeSerialize().
  if (this.form) {
    var settings = this.settings || Drupal.settings;
    Drupal.attachBehaviors(this.form, settings);
  }
};

/**
 * Provide a series of commands that the server can request the client perform.
 */
Drupal.ajax.prototype.commands = {
  /**
   * Command to insert new content into the DOM.
   */
  insert: function (ajax, response, status) {
    // Get information from the response. If it is not there, default to
    // our presets.
    var wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);
    var method = response.method || ajax.method;
    var effect = ajax.getEffect(response);

    // We don't know what response.data contains: it might be a string of text
    // without HTML, so don't rely on jQuery correctly iterpreting
    // $(response.data) as new HTML rather than a CSS selector. Also, if
    // response.data contains top-level text nodes, they get lost with either
    // $(response.data) or $('<div></div>').replaceWith(response.data).
    var new_content_wrapped = $('<div></div>').html(response.data);
    var new_content = new_content_wrapped.contents();

    // For legacy reasons, the effects processing code assumes that new_content
    // consists of a single top-level element. Also, it has not been
    // sufficiently tested whether attachBehaviors() can be successfully called
    // with a context object that includes top-level text nodes. However, to
    // give developers full control of the HTML appearing in the page, and to
    // enable Ajax content to be inserted in places where DIV elements are not
    // allowed (e.g., within TABLE, TR, and SPAN parents), we check if the new
    // content satisfies the requirement of a single top-level element, and
    // only use the container DIV created above when it doesn't. For more
    // information, please see http://drupal.org/node/736066.
    if (new_content.length != 1 || new_content.get(0).nodeType != 1) {
      new_content = new_content_wrapped;
    }

    // If removing content from the wrapper, detach behaviors first.
    switch (method) {
      case 'html':
      case 'replaceWith':
      case 'replaceAll':
      case 'empty':
      case 'remove':
        var settings = response.settings || ajax.settings || Drupal.settings;
        Drupal.detachBehaviors(wrapper, settings);
    }

    // Add the new content to the page.
    wrapper[method](new_content);

    // Immediately hide the new content if we're using any effects.
    if (effect.showEffect != 'show') {
      new_content.hide();
    }

    // Determine which effect to use and what content will receive the
    // effect, then show the new content.
    if ($('.ajax-new-content', new_content).length > 0) {
      $('.ajax-new-content', new_content).hide();
      new_content.show();
      $('.ajax-new-content', new_content)[effect.showEffect](effect.showSpeed);
    }
    else if (effect.showEffect != 'show') {
      new_content[effect.showEffect](effect.showSpeed);
    }

    // Attach all JavaScript behaviors to the new content, if it was successfully
    // added to the page, this if statement allows #ajax['wrapper'] to be
    // optional.
    if (new_content.parents('html').length > 0) {
      // Apply any settings from the returned JSON if available.
      var settings = response.settings || ajax.settings || Drupal.settings;
      Drupal.attachBehaviors(new_content, settings);
    }
  },

  /**
   * Command to remove a chunk from the page.
   */
  remove: function (ajax, response, status) {
    var settings = response.settings || ajax.settings || Drupal.settings;
    Drupal.detachBehaviors($(response.selector), settings);
    $(response.selector).remove();
  },

  /**
   * Command to mark a chunk changed.
   */
  changed: function (ajax, response, status) {
    if (!$(response.selector).hasClass('ajax-changed')) {
      $(response.selector).addClass('ajax-changed');
      if (response.asterisk) {
        $(response.selector).find(response.asterisk).append(' <span class="ajax-changed">*</span> ');
      }
    }
  },

  /**
   * Command to provide an alert.
   */
  alert: function (ajax, response, status) {
    alert(response.text, response.title);
  },

  /**
   * Command to provide the jQuery css() function.
   */
  css: function (ajax, response, status) {
    $(response.selector).css(response.argument);
  },

  /**
   * Command to set the settings that will be used for other commands in this response.
   */
  settings: function (ajax, response, status) {
    if (response.merge) {
      $.extend(true, Drupal.settings, response.settings);
    }
    else {
      ajax.settings = response.settings;
    }
  },

  /**
   * Command to attach data using jQuery's data API.
   */
  data: function (ajax, response, status) {
    $(response.selector).data(response.name, response.value);
  },

  /**
   * Command to apply a jQuery method.
   */
  invoke: function (ajax, response, status) {
    var $element = $(response.selector);
    $element[response.method].apply($element, response.arguments);
  },

  /**
   * Command to restripe a table.
   */
  restripe: function (ajax, response, status) {
    // :even and :odd are reversed because jQuery counts from 0 and
    // we count from 1, so we're out of sync.
    // Match immediate children of the parent element to allow nesting.
    $('> tbody > tr:visible, > tr:visible', $(response.selector))
      .removeClass('odd even')
      .filter(':even').addClass('odd').end()
      .filter(':odd').addClass('even');
  },

  /**
   * Command to add css.
   *
   * Uses the proprietary addImport method if available as browsers which
   * support that method ignore @import statements in dynamically added
   * stylesheets.
   */
  add_css: function (ajax, response, status) {
    // Add the styles in the normal way.
    $('head').prepend(response.data);
    // Add imports in the styles using the addImport method if available.
    var match, importMatch = /^@import url\("(.*)"\);$/igm;
    if (document.styleSheets[0].addImport && importMatch.test(response.data)) {
      importMatch.lastIndex = 0;
      while (match = importMatch.exec(response.data)) {
        document.styleSheets[0].addImport(match[1]);
      }
    }
  },

  /**
   * Command to update a form's build ID.
   */
  updateBuildId: function(ajax, response, status) {
    $('input[name="form_build_id"][value="' + response['old'] + '"]').val(response['new']);
  }
};

})(jQuery);
;/*})'"*/;/*})'"*/
(function (D) {
  var beforeSerialize = D.ajax.prototype.beforeSerialize;
  D.ajax.prototype.beforeSerialize = function (element, options) {
    beforeSerialize.call(this, element, options);
    options.data['ajax_page_state[jquery_version]'] = D.settings.ajaxPageState.jquery_version;
    options.data['ajax_page_state[jquery_version_token]'] = D.settings.ajaxPageState.jquery_version_token;
  }
})(Drupal);
;/*})'"*/;/*})'"*/
/**
 * @file
 * Ajax Command Invoke Chain js.
 *
 * Processing code for the new command, used like 'invoke' but with the chance
 * to chain calls to several methods.
 */

(function ($) {
  'use strict';

  /**
   * Provides processing for the new ajax command.
   *
   * @param {Object} ajax - Drupal Ajax object.
   * @param {Object} response - Response from server with data retrieved.
   * @param {string} status - Value returned by response processed.
   */
  Drupal.ajax.prototype.commands.invoke_chain = function (ajax, response, status) {
    // Get selector information from the response. If it's not there, default to presets.
    var wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);

    // Get the element.
    var $element = $(wrapper);

    // Loop through all chain to work with data.
    for (var i = 0; i < response.chain.length; i++) {
      // Get the method and arguments.
      var method = response.chain[i].shift();

      // Call the function, and store the obtained object to perform the
      // chainning.
      $element = $element[method].apply($element, response.chain[i]);
    }
  };

})(jQuery);
;/*})'"*/;/*})'"*/
(function ($) {
    'use strict';
    Drupal.behaviors.ACChangeEnterBehavior = {
        attach: function (context, settings) {
            $('input.form-autocomplete', context).once('ac-change-enter-behavior', function() {
                $(this).keypress(function(e) {
                    var ac = $('#autocomplete');
                    if (e.keyCode == 13 && typeof ac[0] != 'undefined') {
                        e.preventDefault();
                        ac.each(function () {
                            if(this.owner.selected == false){
                                this.owner.selectDown();
                            }
                            this.owner.hidePopup();
                        });
                        $(this).trigger('change');
                    }
                });
            });
        }
    };
}(jQuery));
;/*})'"*/;/*})'"*/
/**
 * @file
 * Lazyloader JQuery plugin
 *
 * @author: Daniel Honrade http://drupal.org/user/351112
 *
 * Settings:
 * - distance = distance of the image to the viewable browser screen before it gets loaded
 * - icon     = animating image that appears before the actual image is loaded
 *
 */

(function($){

  // Window jQuery object global reference.
  var $window;

  // Process lazyloader
  $.fn.lazyloader = function(options){
    var settings = $.extend($.fn.lazyloader.defaults, options);
    var images = this;

    if (typeof($window) == 'undefined') {
      $window = $(window);
    }

    // add the loader icon
    if(settings['icon'] != '') $('img[data-src]').parent().css({ position: 'relative', display: 'block'}).prepend('<img class="lazyloader-icon" src="' + settings['icon'] + '" />');

    // Load on refresh
    loadActualImages(images, settings);

    // Load on scroll
    $window.bind('scroll', function(e) {
      loadActualImages(images, settings);
    });

    // Load on resize
    $window.resize(function(e) {
      loadActualImages(images, settings);
    });

    return this;
  };

  // Defaults
  $.fn.lazyloader.defaults = {
    distance: 0, // the distance (in pixels) of image when loading of the actual image will happen
    icon: ''    // display animating icon
  };


  // Loading actual images
  function loadActualImages(images, settings){
    clearTimeout($.fn.lazyloader.timeout);

    $.fn.lazyloader.timeout = setTimeout(function(){
      images.each(function(){
        var $image = $(this);
        var imageHeight = $image.height(), imageWidth = $image.width();
        var iconTop = Math.round(imageHeight/2), iconLeft = Math.round(imageWidth/2), iconFactor = Math.round($image.siblings('img.lazyloader-icon').height()/2);
        $image.siblings('img.lazyloader-icon').css({ top: iconTop - iconFactor, left: iconLeft - iconFactor });

        if (windowView(this, settings) && ($image.attr('data-src'))) {
          loadImage(this);
          $image.fadeIn('slow');
        }
      });
    }, 50);
  };


  // Check if the images are within the window view (top, bottom, left and right)
  function windowView(image, settings){
    var $image = $(image);
    // window variables
    var windowHeight = $window.height(),
        windowWidth  = $window.width(),

        windowBottom = windowHeight + $window.scrollTop(),
        windowTop    = windowBottom - windowHeight,
        windowRight  = windowWidth + $window.scrollLeft(),
        windowLeft   = windowRight - windowWidth,

        // image variables
        imageHeight  = $image.height(),
        imageWidth   = $image.width(),

        imageTop     = $image.offset().top - settings['distance'],
        imageBottom  = imageTop + imageHeight + settings['distance'],
        imageLeft    = $image.offset().left - settings['distance'],
        imageRight   = imageLeft + imageWidth + settings['distance'];

           // This will return true if any corner of the image is within the screen
    return (((windowBottom >= imageTop) && (windowTop <= imageTop)) || ((windowBottom >= imageBottom) && (windowTop <= imageBottom))) &&
           (((windowRight >= imageLeft) && (windowLeft <= imageLeft)) || ((windowRight >= imageRight) && (windowLeft <= imageRight)));
  };


  // Load the image
  function loadImage(image){
    var $image = $(image);
    $image.hide().attr('src', $image.data('src')).removeAttr('data-src');
    $image.load(function() {
      $image.siblings('img.lazyloader-icon').remove();
    });
  };

  Drupal.behaviors.lazyloader = {
    attach: function (context, settings) {
      if (Drupal.settings.lazyloaderSettings) {
        var distance = Drupal.settings.lazyloaderSettings.distance
        var icon = Drupal.settings.lazyloaderSettings.icon
        $("img[data-src]").lazyloader({distance: distance, icon: icon});
      }
    }
  };

})(jQuery);
;/*})'"*/;/*})'"*/
(function($) {
  /**
   * Initialization
   */
  Drupal.behaviors.prevent_js_alerts = {
    /**
     * Run Drupal module JS initialization.
     *
     * @param context
     * @param settings
     */
    attach: function(context, settings) {
      // Override the alert() function.
      window.alert = function(text) {
        // Check if the console exists (required e.g. for older IE versions).
        if (typeof console != "undefined") {
          // Log error to console instead.
          console.error("Module 'prevent_js_alerts' prevented the following alert: " + text);
        }
        return true;
      };
    }
  };
})(jQuery);
;/*})'"*/;/*})'"*/
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress-wrapper" aria-live="polite"></div>');
  this.element.html('<div id ="' + id + '" class="progress progress-striped active">' +
                    '<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
                    '<div class="percentage sr-only"></div>' +
                    '</div></div>' +
                    '</div><div class="percentage pull-right"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.progress-bar', this.element).css('width', percentage + '%');
    $('div.progress-bar', this.element).attr('aria-valuenow', percentage);
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="alert alert-block alert-error"><a class="close" data-dismiss="alert" href="#">&times;</a><h4>Error message</h4></div>').append(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;/*})'"*/;/*})'"*/
/**
 * @file
 * JavaScript for Rela custom dropdowns.
 */
(function ($, Drupal) {
  'use strict';

  /**
   * Rela Dropdown behavior.
   */
  Drupal.behaviors.relaDropdown = {
    attach: function (context, settings) {
      // Handle main dropdown toggle.
      $(context).find('[data-toggle="rela-dropdown"]').once('rela-dropdown', function () {
        var $toggle = $(this);

        // Skip AJAX links - they should not be handled by dropdown toggle.
        // Only skip if it's actually a link element with href and use-ajax class.
        if ($toggle.is('a') && $toggle.attr('href') && $toggle.hasClass('use-ajax')) {
          return;
        }

        var $dropdown = $toggle.closest('.rela-dropdown');

        $toggle.on('click.rela-dropdown', function (e) {
          // Double-check: don't interfere with AJAX links.
          if ($(this).is('a') && $(this).attr('href') && $(this).hasClass('use-ajax')) {
            return;
          }

          e.preventDefault();
          e.stopPropagation();

          var isActive = $dropdown.hasClass('open');

          // Close all other dropdowns.
          $('.rela-dropdown.open').not($dropdown).removeClass('open');

          // Toggle this dropdown.
          if (isActive) {
            $dropdown.removeClass('open');
          }
          else {
            $dropdown.addClass('open');
          }
        });
      });

      // Handle nested submenu toggles.
      $(context).find('.rela-dropdown-item-has-submenu > .rela-dropdown-toggle').once('rela-dropdown-submenu', function () {
        var $toggle = $(this);

        // Skip AJAX links - they should not be handled by dropdown toggle.
        // Only skip if it's actually a link element with href and use-ajax class.
        if ($toggle.is('a') && $toggle.attr('href') && $toggle.hasClass('use-ajax')) {
          return;
        }

        var $item = $toggle.closest('.rela-dropdown-item-has-submenu');

        $toggle.on('click.rela-dropdown-submenu', function (e) {
          // Double-check: don't interfere with AJAX links.
          if ($(this).is('a') && $(this).attr('href') && $(this).hasClass('use-ajax')) {
            return;
          }

          e.preventDefault();
          e.stopPropagation();

          var isActive = $item.hasClass('open');

          // Close all other submenus in the same menu.
          $item.siblings('.rela-dropdown-item-has-submenu.open').removeClass('open');

          // Toggle this submenu.
          if (isActive) {
            $item.removeClass('open');
          }
          else {
            $item.addClass('open');
          }
        });
      });

      // Close dropdowns when clicking outside.
      // Use a small delay to allow AJAX handlers to process first.
      $(document).on('click.rela-dropdown', function (e) {
        var $target = $(e.target);
        var $link = $target.closest('a');
        var $clickedElement = $target.closest('[data-keep-dropdown-open]');

        // Don't close if clicking inside dropdown.
        if ($target.closest('.rela-dropdown').length) {
          // If clicking on an AJAX link, don't interfere - let AJAX handle it.
          // Verify it's actually a link with an href attribute.
          if ($link.length && $link.attr('href') && ($link.hasClass('use-ajax') || $link.closest('.use-ajax').length)) {
            return;
          }
          // Don't close if element has data-keep-dropdown-open attribute
          if ($clickedElement.length && $clickedElement.attr('data-keep-dropdown-open') !== 'false') {
            return;
          }
          // For other clicks inside dropdown, don't close.
          return;
        }

        // Clicking outside - close all dropdowns with a small delay.
        // This allows AJAX handlers to process if they're attached to elements outside.
        setTimeout(function() {
          $('.rela-dropdown.open').removeClass('open');
          $('.rela-dropdown-item-has-submenu.open').removeClass('open');
        }, 10);
      });

      // Handle keyboard navigation (Escape key).
      $(document).on('keydown.rela-dropdown', function (e) {
        if (e.keyCode === 27) { // Escape key
          $('.rela-dropdown.open').removeClass('open');
          $('.rela-dropdown-item-has-submenu.open').removeClass('open');
        }
      });
    }
  };

})(jQuery, Drupal);
;/*})'"*/;/*})'"*/
/*! PhotoSwipe - v4.0.5 - 2015-01-15
* http://photoswipe.com
* Copyright (c) 2015 Dmitry Semenov; */
!function(a,b){"function"==typeof define&&define.amd?define(b):"object"==typeof exports?module.exports=b():a.PhotoSwipe=b()}(this,function(){"use strict";var a=function(a,b,c,d){var e={features:null,bind:function(a,b,c,d){var e=(d?"remove":"add")+"EventListener";b=b.split(" ");for(var f=0;f<b.length;f++)b[f]&&a[e](b[f],c,!1)},isArray:function(a){return a instanceof Array},createEl:function(a,b){var c=document.createElement(b||"div");return a&&(c.className=a),c},getScrollY:function(){var a=window.pageYOffset;return void 0!==a?a:document.documentElement.scrollTop},unbind:function(a,b,c){e.bind(a,b,c,!0)},removeClass:function(a,b){var c=new RegExp("(\\s|^)"+b+"(\\s|$)");a.className=a.className.replace(c," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")},addClass:function(a,b){e.hasClass(a,b)||(a.className+=(a.className?" ":"")+b)},hasClass:function(a,b){return a.className&&new RegExp("(^|\\s)"+b+"(\\s|$)").test(a.className)},getChildByClass:function(a,b){for(var c=a.firstChild;c;){if(e.hasClass(c,b))return c;c=c.nextSibling}},arraySearch:function(a,b,c){for(var d=a.length;d--;)if(a[d][c]===b)return d;return-1},extend:function(a,b,c){for(var d in b)if(b.hasOwnProperty(d)){if(c&&a.hasOwnProperty(d))continue;a[d]=b[d]}},easing:{sine:{out:function(a){return Math.sin(a*(Math.PI/2))},inOut:function(a){return-(Math.cos(Math.PI*a)-1)/2}},cubic:{out:function(a){return--a*a*a+1}}},detectFeatures:function(){if(e.features)return e.features;var a=e.createEl(),b=a.style,c="",d={};if(d.oldIE=document.all&&!document.addEventListener,d.touch="ontouchstart"in window,window.requestAnimationFrame&&(d.raf=window.requestAnimationFrame,d.caf=window.cancelAnimationFrame),d.pointerEvent=navigator.pointerEnabled||navigator.msPointerEnabled,!d.pointerEvent){var f=navigator.userAgent;if(/iP(hone|od)/.test(navigator.platform)){var g=navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);g&&g.length>0&&(g=parseInt(g[1],10),g>=1&&8>g&&(d.isOldIOSPhone=!0))}var h=f.match(/Android\s([0-9\.]*)/),i=h?h[1]:0;i=parseFloat(i),i>=1&&(4.4>i&&(d.isOldAndroid=!0),d.androidVersion=i),d.isMobileOpera=/opera mini|opera mobi/i.test(f)}for(var j,k,l=["transform","perspective","animationName"],m=["","webkit","Moz","ms","O"],n=0;4>n;n++){c=m[n];for(var o=0;3>o;o++)j=l[o],k=c+(c?j.charAt(0).toUpperCase()+j.slice(1):j),!d[j]&&k in b&&(d[j]=k);c&&!d.raf&&(c=c.toLowerCase(),d.raf=window[c+"RequestAnimationFrame"],d.raf&&(d.caf=window[c+"CancelAnimationFrame"]||window[c+"CancelRequestAnimationFrame"]))}if(!d.raf){var p=0;d.raf=function(a){var b=(new Date).getTime(),c=Math.max(0,16-(b-p)),d=window.setTimeout(function(){a(b+c)},c);return p=b+c,d},d.caf=function(a){clearTimeout(a)}}return d.svg=!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect,e.features=d,d}};e.detectFeatures(),e.features.oldIE&&(e.bind=function(a,b,c,d){b=b.split(" ");for(var e,f=(d?"detach":"attach")+"Event",g=function(){c.handleEvent.call(c)},h=0;h<b.length;h++)if(e=b[h])if("object"==typeof c&&c.handleEvent){if(d){if(!c["oldIE"+e])return!1}else c["oldIE"+e]=g;a[f]("on"+e,c["oldIE"+e])}else a[f]("on"+e,c)});var f=this,g=25,h=3,i={allowPanToNext:!0,spacing:.12,bgOpacity:1,mouseUsed:!1,loop:!0,pinchToClose:!0,closeOnScroll:!0,closeOnVerticalDrag:!0,hideAnimationDuration:333,showAnimationDuration:333,showHideOpacity:!1,focus:!0,escKey:!0,arrowKeys:!0,mainScrollEndFriction:.35,panEndFriction:.35,isClickableElement:function(a){return"A"===a.tagName},getDoubleTapZoom:function(a,b){return a?1:b.initialZoomLevel<.7?1:1.5},maxSpreadZoom:2,scaleMode:"fit",modal:!0,alwaysFadeIn:!1};e.extend(i,d);var j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,$,_,ab,bb,cb,db,eb,fb,gb,hb,ib,jb,kb,lb,mb,nb=function(){return{x:0,y:0}},ob=nb(),pb=nb(),qb=nb(),rb={},sb=0,tb=nb(),ub=0,vb=!0,wb=[],xb={},yb=function(a,b){e.extend(f,b.publicMethods),wb.push(a)},zb=function(a){var b=_c();return a>b-1?a-b:0>a?b+a:a},Ab={},Bb=function(a,b){return Ab[a]||(Ab[a]=[]),Ab[a].push(b)},Cb=function(a){var b=Ab[a];if(b){var c=Array.prototype.slice.call(arguments);c.shift();for(var d=0;d<b.length;d++)b[d].apply(f,c)}},Db=function(){return(new Date).getTime()},Eb=function(a){kb=a,f.bg.style.opacity=a*i.bgOpacity},Fb=function(a,b,c,d){a[G]=u+b+"px, "+c+"px"+v+" scale("+d+")"},Gb=function(){fb&&Fb(fb,qb.x,qb.y,s)},Hb=function(a){a.container&&Fb(a.container.style,a.initialPosition.x,a.initialPosition.y,a.initialZoomLevel)},Ib=function(a,b){b[G]=u+a+"px, 0px"+v},Jb=function(a,b){if(!i.loop&&b){var c=m+(tb.x*sb-a)/tb.x,d=Math.round(a-sc.x);(0>c&&d>0||c>=_c()-1&&0>d)&&(a=sc.x+d*i.mainScrollEndFriction)}sc.x=a,Ib(a,n)},Kb=function(a,b){var c=tc[a]-y[a];return pb[a]+ob[a]+c-c*(b/t)},Lb=function(a,b){a.x=b.x,a.y=b.y,b.id&&(a.id=b.id)},Mb=function(a){a.x=Math.round(a.x),a.y=Math.round(a.y)},Nb=null,Ob=function(){Nb&&(e.unbind(document,"mousemove",Ob),e.addClass(a,"pswp--has_mouse"),i.mouseUsed=!0,Cb("mouseUsed")),Nb=setTimeout(function(){Nb=null},100)},Pb=function(){e.bind(document,"keydown",f),P.transform&&e.bind(f.scrollWrap,"click",f),i.mouseUsed||e.bind(document,"mousemove",Ob),e.bind(window,"resize scroll",f),Cb("bindEvents")},Qb=function(){e.unbind(window,"resize",f),e.unbind(window,"scroll",r.scroll),e.unbind(document,"keydown",f),e.unbind(document,"mousemove",Ob),P.transform&&e.unbind(f.scrollWrap,"click",f),W&&e.unbind(window,p,f),Cb("unbindEvents")},Rb=function(a,b){var c=hd(f.currItem,rb,a);return b&&(eb=c),c},Sb=function(a){return a||(a=f.currItem),a.initialZoomLevel},Tb=function(a){return a||(a=f.currItem),a.w>0?i.maxSpreadZoom:1},Ub=function(a,b,c,d){return d===f.currItem.initialZoomLevel?(c[a]=f.currItem.initialPosition[a],!0):(c[a]=Kb(a,d),c[a]>b.min[a]?(c[a]=b.min[a],!0):c[a]<b.max[a]?(c[a]=b.max[a],!0):!1)},Vb=function(){if(G){var b=P.perspective&&!I;return u="translate"+(b?"3d(":"("),void(v=P.perspective?", 0px)":")")}G="left",e.addClass(a,"pswp--ie"),Ib=function(a,b){b.left=a+"px"},Hb=function(a){var b=a.container.style,c=a.fitRatio*a.w,d=a.fitRatio*a.h;b.width=c+"px",b.height=d+"px",b.left=a.initialPosition.x+"px",b.top=a.initialPosition.y+"px"},Gb=function(){if(fb){var a=fb,b=f.currItem,c=b.fitRatio*b.w,d=b.fitRatio*b.h;a.width=c+"px",a.height=d+"px",a.left=qb.x+"px",a.top=qb.y+"px"}}},Wb=function(a){var b="";i.escKey&&27===a.keyCode?b="close":i.arrowKeys&&(37===a.keyCode?b="prev":39===a.keyCode&&(b="next")),b&&(a.ctrlKey||a.altKey||a.shiftKey||a.metaKey||(a.preventDefault?a.preventDefault():a.returnValue=!1,f[b]()))},Xb=function(a){a&&(Z||Y||gb||U)&&(a.preventDefault(),a.stopPropagation())},Yb=function(){z=!0,i.closeOnScroll&&j&&(!f.likelyTouchDevice||i.mouseUsed)&&Math.abs(e.getScrollY()-M)>2&&(l=!0,f.close())},Zb={},$b=0,_b=function(a){Zb[a]&&(Zb[a].raf&&K(Zb[a].raf),$b--,delete Zb[a])},ac=function(a){Zb[a]&&_b(a),Zb[a]||($b++,Zb[a]={})},bc=function(){for(var a in Zb)Zb.hasOwnProperty(a)&&_b(a)},cc=function(a,b,c,d,e,f,g){var h,i=Db();ac(a);var j=function(){if(Zb[a]){if(h=Db()-i,h>=d)return _b(a),f(c),void(g&&g());f((c-b)*e(h/d)+b),Zb[a].raf=J(j)}};j()},dc={shout:Cb,listen:Bb,viewportSize:rb,options:i,isMainScrollAnimating:function(){return gb},getZoomLevel:function(){return s},getCurrentIndex:function(){return m},isDragging:function(){return W},isZooming:function(){return bb},applyZoomPan:function(a,b,c){qb.x=b,qb.y=c,s=a,Gb()},init:function(){if(!j&&!k){var c;f.framework=e,f.template=a,f.bg=e.getChildByClass(a,"pswp__bg"),L=a.className,j=!0,P=e.detectFeatures(),J=P.raf,K=P.caf,G=P.transform,N=P.oldIE,f.scrollWrap=e.getChildByClass(a,"pswp__scroll-wrap"),f.container=e.getChildByClass(f.scrollWrap,"pswp__container"),n=f.container.style,f.itemHolders=A=[{el:f.container.children[0],wrap:0,index:-1},{el:f.container.children[1],wrap:0,index:-1},{el:f.container.children[2],wrap:0,index:-1}],A[0].el.style.display=A[2].el.style.display="none",Vb(),r={resize:f.updateSize,scroll:Yb,keydown:Wb,click:Xb};var d=P.isOldIOSPhone||P.isOldAndroid||P.isMobileOpera;for(P.animationName&&P.transform&&!d||(i.showAnimationDuration=i.hideAnimationDuration=0),c=0;c<wb.length;c++)f["init"+wb[c]]();if(b){var g=f.ui=new b(f,e);g.init()}Cb("firstUpdate"),m=m||i.index||0,(isNaN(m)||0>m||m>=_c())&&(m=0),f.currItem=$c(m),(P.isOldIOSPhone||P.isOldAndroid)&&(vb=!1),i.modal&&(a.setAttribute("aria-hidden","false"),vb?a.style.position="fixed":(a.style.position="absolute",a.style.top=e.getScrollY()+"px")),void 0===O&&(Cb("initialLayout"),O=M=e.getScrollY());var l="pswp--open ";for(i.mainClass&&(l+=i.mainClass+" "),i.showHideOpacity&&(l+="pswp--animate_opacity "),l+=I?"pswp--touch":"pswp--notouch",l+=P.animationName?" pswp--css_animation":"",l+=P.svg?" pswp--svg":"",e.addClass(a,l),f.updateSize(),o=-1,ub=null,c=0;h>c;c++)Ib((c+o)*tb.x,A[c].el.style);N||e.bind(f.scrollWrap,q,f),Bb("initialZoomInEnd",function(){f.setContent(A[0],m-1),f.setContent(A[2],m+1),A[0].el.style.display=A[2].el.style.display="block",i.focus&&a.focus(),Pb()}),f.setContent(A[1],m),f.updateCurrItem(),Cb("afterInit"),vb||(w=setInterval(function(){$b||W||bb||s!==f.currItem.initialZoomLevel||f.updateSize()},1e3)),e.addClass(a,"pswp--visible")}},close:function(){j&&(j=!1,k=!0,Cb("close"),Qb(),bd(f.currItem,null,!0,f.destroy))},destroy:function(){Cb("destroy"),Wc&&clearTimeout(Wc),i.modal&&(a.setAttribute("aria-hidden","true"),a.className=L),w&&clearInterval(w),e.unbind(f.scrollWrap,q,f),e.unbind(window,"scroll",f),yc(),bc(),Ab=null},panTo:function(a,b,c){c||(a>eb.min.x?a=eb.min.x:a<eb.max.x&&(a=eb.max.x),b>eb.min.y?b=eb.min.y:b<eb.max.y&&(b=eb.max.y)),qb.x=a,qb.y=b,Gb()},handleEvent:function(a){a=a||window.event,r[a.type]&&r[a.type](a)},goTo:function(a){a=zb(a);var b=a-m;ub=b,m=a,f.currItem=$c(m),sb-=b,Jb(tb.x*sb),bc(),gb=!1,f.updateCurrItem()},next:function(){f.goTo(m+1)},prev:function(){f.goTo(m-1)},updateCurrZoomItem:function(a){if(a&&Cb("beforeChange",0),A[1].el.children.length){var b=A[1].el.children[0];fb=e.hasClass(b,"pswp__zoom-wrap")?b.style:null}else fb=null;eb=f.currItem.bounds,t=s=f.currItem.initialZoomLevel,qb.x=eb.center.x,qb.y=eb.center.y,a&&Cb("afterChange")},invalidateCurrItems:function(){x=!0;for(var a=0;h>a;a++)A[a].item&&(A[a].item.needsUpdate=!0)},updateCurrItem:function(a){if(0!==ub){var b,c=Math.abs(ub);if(!(a&&2>c)){f.currItem=$c(m),Cb("beforeChange",ub),c>=h&&(o+=ub+(ub>0?-h:h),c=h);for(var d=0;c>d;d++)ub>0?(b=A.shift(),A[h-1]=b,o++,Ib((o+2)*tb.x,b.el.style),f.setContent(b,m-c+d+1+1)):(b=A.pop(),A.unshift(b),o--,Ib(o*tb.x,b.el.style),f.setContent(b,m+c-d-1-1));if(fb&&1===Math.abs(ub)){var e=$c(B);e.initialZoomLevel!==s&&(hd(e,rb),Hb(e))}ub=0,f.updateCurrZoomItem(),B=m,Cb("afterChange")}}},updateSize:function(b){if(!vb){var c=e.getScrollY();if(O!==c&&(a.style.top=c+"px",O=c),!b&&xb.x===window.innerWidth&&xb.y===window.innerHeight)return;xb.x=window.innerWidth,xb.y=window.innerHeight,a.style.height=xb.y+"px"}if(rb.x=f.scrollWrap.clientWidth,rb.y=f.scrollWrap.clientHeight,y={x:0,y:O},tb.x=rb.x+Math.round(rb.x*i.spacing),tb.y=rb.y,Jb(tb.x*sb),Cb("beforeResize"),void 0!==o){for(var d,g,j,k=0;h>k;k++)d=A[k],Ib((k+o)*tb.x,d.el.style),j=zb(m+k-1),g=$c(j),x||g.needsUpdate||!g.bounds?(g&&f.cleanSlide(g),f.setContent(d,j),1===k&&(f.currItem=g,f.updateCurrZoomItem(!0)),g.needsUpdate=!1):-1===d.index&&j>=0&&f.setContent(d,j),g&&g.container&&(hd(g,rb),Hb(g));x=!1}t=s=f.currItem.initialZoomLevel,eb=f.currItem.bounds,eb&&(qb.x=eb.center.x,qb.y=eb.center.y,Gb()),Cb("resize")},zoomTo:function(a,b,c,d,f){b&&(t=s,tc.x=Math.abs(b.x)-qb.x,tc.y=Math.abs(b.y)-qb.y,Lb(pb,qb));var g=Rb(a,!1),h={};Ub("x",g,h,a),Ub("y",g,h,a);var i=s,j={x:qb.x,y:qb.y};Mb(h);var k=function(b){1===b?(s=a,qb.x=h.x,qb.y=h.y):(s=(a-i)*b+i,qb.x=(h.x-j.x)*b+j.x,qb.y=(h.y-j.y)*b+j.y),f&&f(b),Gb()};c?cc("customZoomTo",0,1,c,d||e.easing.sine.inOut,k):k(1)}},ec=30,fc=10,gc={},hc={},ic={},jc={},kc={},lc=[],mc={},nc=[],oc={},pc=0,qc=nb(),rc=0,sc=nb(),tc=nb(),uc=nb(),vc=function(a,b){return a.x===b.x&&a.y===b.y},wc=function(a,b){return Math.abs(a.x-b.x)<g&&Math.abs(a.y-b.y)<g},xc=function(a,b){return oc.x=Math.abs(a.x-b.x),oc.y=Math.abs(a.y-b.y),Math.sqrt(oc.x*oc.x+oc.y*oc.y)},yc=function(){$&&(K($),$=null)},zc=function(){W&&($=J(zc),Pc())},Ac=function(){return!("fit"===i.scaleMode&&s===f.currItem.initialZoomLevel)},Bc=function(a,b){return a?a.className&&a.className.indexOf("pswp__scroll-wrap")>-1?!1:b(a)?a:Bc(a.parentNode,b):!1},Cc={},Dc=function(a,b){return Cc.prevent=!Bc(a.target,i.isClickableElement),Cb("preventDragEvent",a,b,Cc),Cc.prevent},Ec=function(a,b){return b.x=a.pageX,b.y=a.pageY,b.id=a.identifier,b},Fc=function(a,b,c){c.x=.5*(a.x+b.x),c.y=.5*(a.y+b.y)},Gc=function(a,b,c){if(a-R>50){var d=nc.length>2?nc.shift():{};d.x=b,d.y=c,nc.push(d),R=a}},Hc=function(){var a=qb.y-f.currItem.initialPosition.y;return 1-Math.abs(a/(rb.y/2))},Ic={},Jc={},Kc=[],Lc=function(a){for(;Kc.length>0;)Kc.pop();return H?(mb=0,lc.forEach(function(a){0===mb?Kc[0]=a:1===mb&&(Kc[1]=a),mb++})):a.type.indexOf("touch")>-1?a.touches&&a.touches.length>0&&(Kc[0]=Ec(a.touches[0],Ic),a.touches.length>1&&(Kc[1]=Ec(a.touches[1],Jc))):(Ic.x=a.pageX,Ic.y=a.pageY,Ic.id="",Kc[0]=Ic),Kc},Mc=function(a,b){var c,d,e,g,h=0,j=qb[a]+b[a],k=b[a]>0,l=sc.x+b.x,m=sc.x-mc.x;return c=j>eb.min[a]||j<eb.max[a]?i.panEndFriction:1,j=qb[a]+b[a]*c,!i.allowPanToNext&&s!==f.currItem.initialZoomLevel||(fb?"h"!==hb||"x"!==a||Y||(k?(j>eb.min[a]&&(c=i.panEndFriction,h=eb.min[a]-j,d=eb.min[a]-pb[a]),(0>=d||0>m)&&_c()>1?(g=l,0>m&&l>mc.x&&(g=mc.x)):eb.min.x!==eb.max.x&&(e=j)):(j<eb.max[a]&&(c=i.panEndFriction,h=j-eb.max[a],d=pb[a]-eb.max[a]),(0>=d||m>0)&&_c()>1?(g=l,m>0&&l<mc.x&&(g=mc.x)):eb.min.x!==eb.max.x&&(e=j))):g=l,"x"!==a)?void(gb||_||s>f.currItem.fitRatio&&(qb[a]+=b[a]*c)):(void 0!==g&&(Jb(g,!0),_=g===mc.x?!1:!0),eb.min.x!==eb.max.x&&(void 0!==e?qb.x=e:_||(qb.x+=b.x*c)),void 0!==g)},Nc=function(a){if(!("mousedown"===a.type&&a.button>0)){if(Zc)return void a.preventDefault();if(!V||"mousedown"!==a.type){if(Dc(a,!0)&&a.preventDefault(),Cb("pointerDown"),H){var b=e.arraySearch(lc,a.pointerId,"id");0>b&&(b=lc.length),lc[b]={x:a.pageX,y:a.pageY,id:a.pointerId}}var c=Lc(a),d=c.length;ab=null,bc(),W&&1!==d||(W=ib=!0,e.bind(window,p,f),T=lb=jb=U=_=Z=X=Y=!1,hb=null,Cb("firstTouchStart",c),Lb(pb,qb),ob.x=ob.y=0,Lb(jc,c[0]),Lb(kc,jc),mc.x=tb.x*sb,nc=[{x:jc.x,y:jc.y}],R=Q=Db(),Rb(s,!0),yc(),zc()),!bb&&d>1&&!gb&&!_&&(t=s,Y=!1,bb=X=!0,ob.y=ob.x=0,Lb(pb,qb),Lb(gc,c[0]),Lb(hc,c[1]),Fc(gc,hc,uc),tc.x=Math.abs(uc.x)-qb.x,tc.y=Math.abs(uc.y)-qb.y,cb=db=xc(gc,hc))}}},Oc=function(a){if(a.preventDefault(),H){var b=e.arraySearch(lc,a.pointerId,"id");if(b>-1){var c=lc[b];c.x=a.pageX,c.y=a.pageY}}if(W){var d=Lc(a);if(hb||Z||bb)ab=d;else{var f=Math.abs(d[0].x-jc.x)-Math.abs(d[0].y-jc.y);Math.abs(f)>=fc&&(hb=f>0?"h":"v",ab=d)}}},Pc=function(){if(ab){var a=ab.length;if(0!==a)if(Lb(gc,ab[0]),ic.x=gc.x-jc.x,ic.y=gc.y-jc.y,bb&&a>1){if(jc.x=gc.x,jc.y=gc.y,!ic.x&&!ic.y&&vc(ab[1],hc))return;Lb(hc,ab[1]),Y||(Y=!0,Cb("zoomGestureStarted"));var b=xc(gc,hc),c=Uc(b);c>f.currItem.initialZoomLevel+f.currItem.initialZoomLevel/15&&(lb=!0);var d=1,e=Sb(),g=Tb();if(e>c)if(i.pinchToClose&&!lb&&t<=f.currItem.initialZoomLevel){var h=e-c,j=1-h/(e/1.2);Eb(j),Cb("onPinchClose",j),jb=!0}else d=(e-c)/e,d>1&&(d=1),c=e-d*(e/3);else c>g&&(d=(c-g)/(6*e),d>1&&(d=1),c=g+d*e);0>d&&(d=0),cb=b,Fc(gc,hc,qc),ob.x+=qc.x-uc.x,ob.y+=qc.y-uc.y,Lb(uc,qc),qb.x=Kb("x",c),qb.y=Kb("y",c),T=c>s,s=c,Gb()}else{if(!hb)return;if(ib&&(ib=!1,Math.abs(ic.x)>=fc&&(ic.x-=ab[0].x-kc.x),Math.abs(ic.y)>=fc&&(ic.y-=ab[0].y-kc.y)),jc.x=gc.x,jc.y=gc.y,0===ic.x&&0===ic.y)return;if("v"===hb&&i.closeOnVerticalDrag&&!Ac()){ob.y+=ic.y,qb.y+=ic.y;var k=Hc();return U=!0,Cb("onVerticalDrag",k),Eb(k),void Gb()}Gc(Db(),gc.x,gc.y),Z=!0,eb=f.currItem.bounds;var l=Mc("x",ic);l||(Mc("y",ic),Mb(qb),Gb())}}},Qc=function(a){if(P.isOldAndroid){if(V&&"mouseup"===a.type)return;a.type.indexOf("touch")>-1&&(clearTimeout(V),V=setTimeout(function(){V=0},600))}Cb("pointerUp"),Dc(a,!1)&&a.preventDefault();var b;if(H){var c=e.arraySearch(lc,a.pointerId,"id");if(c>-1)if(b=lc.splice(c,1)[0],navigator.pointerEnabled)b.type=a.pointerType||"mouse";else{var d={4:"mouse",2:"touch",3:"pen"};b.type=d[a.pointerType],b.type||(b.type=a.pointerType||"mouse")}}var g,h=Lc(a),i=h.length;if("mouseup"===a.type&&(i=0),2===i)return ab=null,!0;1===i&&Lb(kc,h[0]),0!==i||hb||gb||(b||("mouseup"===a.type?b={x:a.pageX,y:a.pageY,type:"mouse"}:a.changedTouches&&a.changedTouches[0]&&(b={x:a.changedTouches[0].pageX,y:a.changedTouches[0].pageY,type:"touch"})),Cb("touchRelease",a,b));var j=-1;if(0===i&&(W=!1,e.unbind(window,p,f),yc(),bb?j=0:-1!==rc&&(j=Db()-rc)),rc=1===i?Db():-1,g=-1!==j&&150>j?"zoom":"swipe",bb&&2>i&&(bb=!1,1===i&&(g="zoomPointerUp"),Cb("zoomGestureEnded")),ab=null,Z||Y||gb||U)if(bc(),S||(S=Rc()),S.calculateSwipeSpeed("x"),U){var k=Hc();if(.6>k)f.close();else{var l=qb.y,m=kb;cc("verticalDrag",0,1,300,e.easing.cubic.out,function(a){qb.y=(f.currItem.initialPosition.y-l)*a+l,Eb((1-m)*a+m),Gb()}),Cb("onVerticalDrag",1)}}else{if((_||gb)&&0===i){var n=Tc(g,S);if(n)return;g="zoomPointerUp"}if(!gb)return"swipe"!==g?void Vc():void(!_&&s>f.currItem.fitRatio&&Sc(S))}},Rc=function(){var a,b,c={lastFlickOffset:{},lastFlickDist:{},lastFlickSpeed:{},slowDownRatio:{},slowDownRatioReverse:{},speedDecelerationRatio:{},speedDecelerationRatioAbs:{},distanceOffset:{},backAnimDestination:{},backAnimStarted:{},calculateSwipeSpeed:function(d){nc.length>1?(a=Db()-R+50,b=nc[nc.length-2][d]):(a=Db()-Q,b=kc[d]),c.lastFlickOffset[d]=jc[d]-b,c.lastFlickDist[d]=Math.abs(c.lastFlickOffset[d]),c.lastFlickSpeed[d]=c.lastFlickDist[d]>20?c.lastFlickOffset[d]/a:0,Math.abs(c.lastFlickSpeed[d])<.1&&(c.lastFlickSpeed[d]=0),c.slowDownRatio[d]=.95,c.slowDownRatioReverse[d]=1-c.slowDownRatio[d],c.speedDecelerationRatio[d]=1},calculateOverBoundsAnimOffset:function(a,b){c.backAnimStarted[a]||(qb[a]>eb.min[a]?c.backAnimDestination[a]=eb.min[a]:qb[a]<eb.max[a]&&(c.backAnimDestination[a]=eb.max[a]),void 0!==c.backAnimDestination[a]&&(c.slowDownRatio[a]=.7,c.slowDownRatioReverse[a]=1-c.slowDownRatio[a],c.speedDecelerationRatioAbs[a]<.05&&(c.lastFlickSpeed[a]=0,c.backAnimStarted[a]=!0,cc("bounceZoomPan"+a,qb[a],c.backAnimDestination[a],b||300,e.easing.sine.out,function(b){qb[a]=b,Gb()}))))},calculateAnimOffset:function(a){c.backAnimStarted[a]||(c.speedDecelerationRatio[a]=c.speedDecelerationRatio[a]*(c.slowDownRatio[a]+c.slowDownRatioReverse[a]-c.slowDownRatioReverse[a]*c.timeDiff/10),c.speedDecelerationRatioAbs[a]=Math.abs(c.lastFlickSpeed[a]*c.speedDecelerationRatio[a]),c.distanceOffset[a]=c.lastFlickSpeed[a]*c.speedDecelerationRatio[a]*c.timeDiff,qb[a]+=c.distanceOffset[a])},panAnimLoop:function(){return Zb.zoomPan&&(Zb.zoomPan.raf=J(c.panAnimLoop),c.now=Db(),c.timeDiff=c.now-c.lastNow,c.lastNow=c.now,c.calculateAnimOffset("x"),c.calculateAnimOffset("y"),Gb(),c.calculateOverBoundsAnimOffset("x"),c.calculateOverBoundsAnimOffset("y"),c.speedDecelerationRatioAbs.x<.05&&c.speedDecelerationRatioAbs.y<.05)?(qb.x=Math.round(qb.x),qb.y=Math.round(qb.y),Gb(),void _b("zoomPan")):void 0}};return c},Sc=function(a){return a.calculateSwipeSpeed("y"),eb=f.currItem.bounds,a.backAnimDestination={},a.backAnimStarted={},Math.abs(a.lastFlickSpeed.x)<=.05&&Math.abs(a.lastFlickSpeed.y)<=.05?(a.speedDecelerationRatioAbs.x=a.speedDecelerationRatioAbs.y=0,a.calculateOverBoundsAnimOffset("x"),a.calculateOverBoundsAnimOffset("y"),!0):(ac("zoomPan"),a.lastNow=Db(),void a.panAnimLoop())},Tc=function(a,b){var c;gb||(pc=m);var d;if("swipe"===a){var g=jc.x-kc.x,h=b.lastFlickDist.x<10;g>ec&&(h||b.lastFlickOffset.x>20)?d=-1:-ec>g&&(h||b.lastFlickOffset.x<-20)&&(d=1)}var j;d&&(m+=d,0>m?(m=i.loop?_c()-1:0,j=!0):m>=_c()&&(m=i.loop?0:_c()-1,j=!0),(!j||i.loop)&&(ub+=d,sb-=d,c=!0));var k,l=tb.x*sb,n=Math.abs(l-sc.x);return c||l>sc.x==b.lastFlickSpeed.x>0?(k=Math.abs(b.lastFlickSpeed.x)>0?n/Math.abs(b.lastFlickSpeed.x):333,k=Math.min(k,400),k=Math.max(k,250)):k=333,pc===m&&(c=!1),gb=!0,cc("mainScroll",sc.x,l,k,e.easing.cubic.out,Jb,function(){bc(),gb=!1,pc=-1,(c||pc!==m)&&f.updateCurrItem(),Cb("mainScrollAnimComplete")}),c&&f.updateCurrItem(!0),c},Uc=function(a){return 1/db*a*t},Vc=function(){var a=s,b=Sb(),c=Tb();b>s?a=b:s>c&&(a=c);var d,g=1,h=kb;return jb&&!T&&!lb&&b>s?(f.close(),!0):(jb&&(d=function(a){Eb((g-h)*a+h)}),f.zoomTo(a,0,300,e.easing.cubic.out,d),!0)};yb("Gestures",{publicMethods:{initGestures:function(){var a=function(a,b,c,d,e){C=a+b,D=a+c,E=a+d,F=e?a+e:""};H=P.pointerEvent,H&&P.touch&&(P.touch=!1),H?navigator.pointerEnabled?a("pointer","down","move","up","cancel"):a("MSPointer","Down","Move","Up","Cancel"):P.touch?(a("touch","start","move","end","cancel"),I=!0):a("mouse","down","move","up"),p=D+" "+E+" "+F,q=C,H&&!I&&(I=navigator.maxTouchPoints>1||navigator.msMaxTouchPoints>1),f.likelyTouchDevice=I,r[C]=Nc,r[D]=Oc,r[E]=Qc,F&&(r[F]=r[E]),P.touch&&(q+=" mousedown",p+=" mousemove mouseup",r.mousedown=r[C],r.mousemove=r[D],r.mouseup=r[E]),I||(i.allowPanToNext=!1)}}});var Wc,Xc,Yc,Zc,$c,_c,ad,bd=function(b,c,d,g){Wc&&clearTimeout(Wc),Zc=!0,Yc=!0;var h;b.initialLayout?(h=b.initialLayout,b.initialLayout=null):h=i.getThumbBoundsFn&&i.getThumbBoundsFn(m);var j=d?i.hideAnimationDuration:i.showAnimationDuration,k=function(){_b("initialZoom"),d?(f.template.removeAttribute("style"),f.bg.removeAttribute("style")):(Eb(1),c&&(c.style.display="block"),e.addClass(a,"pswp--animated-in"),Cb("initialZoom"+(d?"OutEnd":"InEnd"))),g&&g(),Zc=!1};if(!j||!h||void 0===h.x){var n=function(){Cb("initialZoom"+(d?"Out":"In")),s=b.initialZoomLevel,Lb(qb,b.initialPosition),Gb(),a.style.opacity=d?0:1,Eb(1),k()};return void n()}var o=function(){var c=l,g=!f.currItem.src||f.currItem.loadError||i.showHideOpacity;b.miniImg&&(b.miniImg.style.webkitBackfaceVisibility="hidden"),d||(s=h.w/b.w,qb.x=h.x,qb.y=h.y-M,f[g?"template":"bg"].style.opacity=.001,Gb()),ac("initialZoom"),d&&!c&&e.removeClass(a,"pswp--animated-in"),g&&(d?e[(c?"remove":"add")+"Class"](a,"pswp--animate_opacity"):setTimeout(function(){e.addClass(a,"pswp--animate_opacity")},30)),Wc=setTimeout(function(){if(Cb("initialZoom"+(d?"Out":"In")),d){var f=h.w/b.w,i={x:qb.x,y:qb.y},l=s,m=M,n=kb,o=function(b){z&&(m=e.getScrollY(),z=!1),1===b?(s=f,qb.x=h.x,qb.y=h.y-m):(s=(f-l)*b+l,qb.x=(h.x-i.x)*b+i.x,qb.y=(h.y-m-i.y)*b+i.y),Gb(),g?a.style.opacity=1-b:Eb(n-b*n)};c?cc("initialZoom",0,1,j,e.easing.cubic.out,o,k):(o(1),Wc=setTimeout(k,j+20))}else s=b.initialZoomLevel,Lb(qb,b.initialPosition),Gb(),Eb(1),g?a.style.opacity=1:Eb(1),Wc=setTimeout(k,j+20)},d?25:90)};o()},cd={},dd=[],ed={index:0,errorMsg:'<div class="pswp__error-msg"><a href="%url%" target="_blank">The image</a> could not be loaded.</div>',forceProgressiveLoading:!1,preload:[1,1],getNumItemsFn:function(){return Xc.length}},fd=function(){return{center:{x:0,y:0},max:{x:0,y:0},min:{x:0,y:0}}},gd=function(a,b,c){var d=a.bounds;d.center.x=Math.round((cd.x-b)/2),d.center.y=Math.round((cd.y-c)/2)+a.vGap.top,d.max.x=b>cd.x?Math.round(cd.x-b):d.center.x,d.max.y=c>cd.y?Math.round(cd.y-c)+a.vGap.top:d.center.y,d.min.x=b>cd.x?0:d.center.x,d.min.y=c>cd.y?a.vGap.top:d.center.y},hd=function(a,b,c){if(a.src&&!a.loadError){var d=!c;if(d&&(a.vGap||(a.vGap={top:0,bottom:0}),Cb("parseVerticalMargin",a)),cd.x=b.x,cd.y=b.y-a.vGap.top-a.vGap.bottom,d){var e=cd.x/a.w,f=cd.y/a.h;a.fitRatio=f>e?e:f;var g=i.scaleMode;"orig"===g?c=1:"fit"===g&&(c=a.fitRatio),c>1&&(c=1),a.initialZoomLevel=c,a.bounds||(a.bounds=fd())}if(!c)return;return gd(a,a.w*c,a.h*c),d&&c===a.initialZoomLevel&&(a.initialPosition=a.bounds.center),a.bounds}return a.w=a.h=0,a.initialZoomLevel=a.fitRatio=1,a.bounds=fd(),a.initialPosition=a.bounds.center,a.bounds},id=function(a,b,c,d,e,g){if(!b.loadError){var h,j=f.isDragging()&&!f.isZooming(),k=a===m||f.isMainScrollAnimating()||j;!e&&(I||i.alwaysFadeIn)&&k&&(h=!0),d&&(h&&(d.style.opacity=0),b.imageAppended=!0,c.appendChild(d),h&&setTimeout(function(){d.style.opacity=1,g&&setTimeout(function(){b&&b.loaded&&b.placeholder&&(b.placeholder.style.display="none",b.placeholder=null)},500)},50))}},jd=function(a){a.loading=!0,a.loaded=!1;var b=a.img=e.createEl("pswp__img","img"),c=function(){a.loading=!1,a.loaded=!0,a.loadComplete?a.loadComplete(a):a.img=null,b.onload=b.onerror=null,b=null};return b.onload=c,b.onerror=function(){a.loadError=!0,c()},b.src=a.src,b},kd=function(a,b){return a.src&&a.loadError&&a.container?(b&&(a.container.innerHTML=""),a.container.innerHTML=i.errorMsg.replace("%url%",a.src),!0):void 0},ld=function(){if(dd.length){for(var a,b=0;b<dd.length;b++)a=dd[b],a.holder.index===a.index&&id(a.index,a.item,a.baseDiv,a.img);dd=[]}};yb("Controller",{publicMethods:{lazyLoadItem:function(a){a=zb(a);var b=$c(a);b&&b.src&&!b.loaded&&!b.loading&&(Cb("gettingData",a,b),jd(b))},initController:function(){e.extend(i,ed,!0),f.items=Xc=c,$c=f.getItemAt,_c=i.getNumItemsFn,ad=i.loop,_c()<3&&(i.loop=!1),Bb("beforeChange",function(a){var b,c=i.preload,d=null===a?!0:a>0,e=Math.min(c[0],_c()),g=Math.min(c[1],_c());for(b=1;(d?g:e)>=b;b++)f.lazyLoadItem(m+b);for(b=1;(d?e:g)>=b;b++)f.lazyLoadItem(m-b)}),Bb("initialLayout",function(){f.currItem.initialLayout=i.getThumbBoundsFn&&i.getThumbBoundsFn(m)}),Bb("mainScrollAnimComplete",ld),Bb("initialZoomInEnd",ld),Bb("destroy",function(){for(var a,b=0;b<Xc.length;b++)a=Xc[b],a.container&&(a.container=null),a.placeholder&&(a.placeholder=null),a.img&&(a.img=null),a.preloader&&(a.preloader=null),a.loadError&&(a.loaded=a.loadError=!1);dd=null})},getItemAt:function(a){return a>=0&&void 0!==Xc[a]?Xc[a]:!1},allowProgressiveImg:function(){return i.forceProgressiveLoading||!I||i.mouseUsed||screen.width>1200},setContent:function(a,b){i.loop&&(b=zb(b));var c=f.getItemAt(a.index);c&&(c.container=null);var d,g=f.getItemAt(b);if(!g)return void(a.el.innerHTML="");Cb("gettingData",b,g),a.index=b,a.item=g;var h=g.container=e.createEl("pswp__zoom-wrap");if(!g.src&&g.html&&(g.html.tagName?h.appendChild(g.html):h.innerHTML=g.html),kd(g),!g.src||g.loadError||g.loaded)g.src&&!g.loadError&&(d=e.createEl("pswp__img","img"),d.style.webkitBackfaceVisibility="hidden",d.style.opacity=1,d.src=g.src,id(b,g,h,d,!0));else{if(g.loadComplete=function(c){if(j){if(c.img.style.webkitBackfaceVisibility="hidden",a&&a.index===b){if(kd(c,!0))return c.loadComplete=c.img=null,hd(c,rb),Hb(c),void(a.index===m&&f.updateCurrZoomItem());c.imageAppended?!Zc&&c.placeholder&&(c.placeholder.style.display="none",c.placeholder=null):P.transform&&(gb||Zc)?dd.push({item:c,baseDiv:h,img:c.img,index:b,holder:a}):id(b,c,h,c.img,gb||Zc)}c.loadComplete=null,c.img=null,Cb("imageLoadComplete",b,c)}},e.features.transform){var k="pswp__img pswp__img--placeholder";k+=g.msrc?"":" pswp__img--placeholder--blank";var l=e.createEl(k,g.msrc?"img":"");g.msrc&&(l.src=g.msrc),l.style.width=g.w+"px",l.style.height=g.h+"px",h.appendChild(l),g.placeholder=l}g.loading||jd(g),f.allowProgressiveImg()&&(!Yc&&P.transform?dd.push({item:g,baseDiv:h,img:g.img,index:b,holder:a}):id(b,g,h,g.img,!0,!0))}hd(g,rb),Yc||b!==m?Hb(g):(fb=h.style,bd(g,d||g.img)),a.el.innerHTML="",a.el.appendChild(h)},cleanSlide:function(a){a.img&&(a.img.onload=a.img.onerror=null),a.loaded=a.loading=a.img=a.imageAppended=!1}}});var md,nd={},od=function(a,b,c){var d=document.createEvent("CustomEvent"),e={origEvent:a,target:a.target,releasePoint:b,pointerType:c||"touch"};d.initCustomEvent("pswpTap",!0,!0,e),a.target.dispatchEvent(d)};yb("Tap",{publicMethods:{initTap:function(){Bb("firstTouchStart",f.onTapStart),Bb("touchRelease",f.onTapRelease),Bb("destroy",function(){nd={},md=null})},onTapStart:function(a){a.length>1&&(clearTimeout(md),md=null)},onTapRelease:function(a,b){if(b&&!Z&&!X&&!$b){var c=b;if(md&&(clearTimeout(md),md=null,wc(c,nd)))return void Cb("doubleTap",c);if("mouse"===b.type)return void od(a,b,"mouse");var d=a.target.tagName.toUpperCase();if("BUTTON"===d||e.hasClass(a.target,"pswp__single-tap"))return void od(a,b);Lb(nd,c),md=setTimeout(function(){od(a,b),md=null},300)}}}});var pd;yb("DesktopZoom",{publicMethods:{initDesktopZoom:function(){N||(I?Bb("mouseUsed",function(){f.setupDesktopZoom()}):f.setupDesktopZoom(!0))},setupDesktopZoom:function(b){pd={};var c="wheel mousewheel DOMMouseScroll";Bb("bindEvents",function(){e.bind(a,c,f.handleMouseWheel)}),Bb("unbindEvents",function(){pd&&e.unbind(a,c,f.handleMouseWheel)}),f.mouseZoomedIn=!1;var d,g=function(){f.mouseZoomedIn&&(e.removeClass(a,"pswp--zoomed-in"),f.mouseZoomedIn=!1),1>s?e.addClass(a,"pswp--zoom-allowed"):e.removeClass(a,"pswp--zoom-allowed"),h()},h=function(){d&&(e.removeClass(a,"pswp--dragging"),d=!1)};Bb("resize",g),Bb("afterChange",g),Bb("pointerDown",function(){f.mouseZoomedIn&&(d=!0,e.addClass(a,"pswp--dragging"))}),Bb("pointerUp",h),b||g()},handleMouseWheel:function(a){if(s<=f.currItem.fitRatio)return i.closeOnScroll||a.preventDefault(),!0;if(a.preventDefault(),a.stopPropagation(),pd.x=0,"deltaX"in a)pd.x=a.deltaX,pd.y=a.deltaY;else if("wheelDelta"in a)a.wheelDeltaX&&(pd.x=-.16*a.wheelDeltaX),pd.y=a.wheelDeltaY?-.16*a.wheelDeltaY:-.16*a.wheelDelta;else{if(!("detail"in a))return;pd.y=a.detail}Rb(s,!0),f.panTo(qb.x-pd.x,qb.y-pd.y)},toggleDesktopZoom:function(b){b=b||{x:rb.x/2,y:rb.y/2+M};var c=i.getDoubleTapZoom(!0,f.currItem),d=s===c;f.mouseZoomedIn=!d,f.zoomTo(d?f.currItem.initialZoomLevel:c,b,333),e[(d?"remove":"add")+"Class"](a,"pswp--zoomed-in")}}});var qd,rd,sd,td,ud,vd,wd,xd,yd,zd,Ad,Bd,Cd={history:!0,galleryUID:1},Dd=function(){return Ad.hash.substring(1)},Ed=function(){qd&&clearTimeout(qd),sd&&clearTimeout(sd)},Fd=function(){var a=Dd(),b={};if(a.length<5)return b;for(var c=a.split("&"),d=0;d<c.length;d++)if(c[d]){var e=c[d].split("=");e.length<2||(b[e[0]]=e[1])}return b.pid=parseInt(b.pid,10)-1,b.pid<0&&(b.pid=0),b},Gd=function(){if(sd&&clearTimeout(sd),$b||W)return void(sd=setTimeout(Gd,500));td?clearTimeout(rd):td=!0;var a=wd+"&gid="+i.galleryUID+"&pid="+(m+1);xd||-1===Ad.hash.indexOf(a)&&(zd=!0);var b=Ad.href.split("#")[0]+"#"+a;Bd?"#"+a!==window.location.hash&&history[xd?"replaceState":"pushState"]("",document.title,b):xd?Ad.replace(b):Ad.hash=a,xd=!0,rd=setTimeout(function(){td=!1},60)};yb("History",{publicMethods:{initHistory:function(){if(e.extend(i,Cd,!0),i.history){Ad=window.location,zd=!1,yd=!1,xd=!1,wd=Dd(),Bd="pushState"in history,wd.indexOf("gid=")>-1&&(wd=wd.split("&gid=")[0],wd=wd.split("?gid=")[0]),Bb("afterChange",f.updateURL),Bb("unbindEvents",function(){e.unbind(window,"hashchange",f.onHashChange)});var a=function(){vd=!0,yd||(zd?history.back():wd?Ad.hash=wd:Bd?history.pushState("",document.title,Ad.pathname+Ad.search):Ad.hash=""),Ed()};Bb("unbindEvents",function(){l&&a()}),Bb("destroy",function(){vd||a()}),Bb("firstUpdate",function(){m=Fd().pid});var b=wd.indexOf("pid=");b>-1&&(wd=wd.substring(0,b),"&"===wd.slice(-1)&&(wd=wd.slice(0,-1))),setTimeout(function(){j&&e.bind(window,"hashchange",f.onHashChange)},40)}},onHashChange:function(){return Dd()===wd?(yd=!0,void f.close()):void(td||(ud=!0,f.goTo(Fd().pid),ud=!1))},updateURL:function(){Ed(),ud||(xd?qd=setTimeout(Gd,800):Gd())}}}),e.extend(f,dc)};return a});
;/*})'"*/;/*})'"*/
/*! PhotoSwipe Default UI - 4.0.5 - 2015-01-15
* http://photoswipe.com
* Copyright (c) 2015 Dmitry Semenov; */
!function(a,b){"function"==typeof define&&define.amd?define(b):"object"==typeof exports?module.exports=b():a.PhotoSwipeUI_Default=b()}(this,function(){"use strict";var a=function(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v=this,w=!1,x=!0,y=!0,z={barsSize:{top:44,bottom:"auto"},closeElClasses:["item","caption","zoom-wrap","ui","top-bar"],timeToIdle:4e3,timeToIdleOutside:1e3,loadingIndicatorDelay:1e3,addCaptionHTMLFn:function(a,b){return a.title?(b.children[0].innerHTML=a.title,!0):(b.children[0].innerHTML="",!1)},closeEl:!0,captionEl:!0,fullscreenEl:!0,zoomEl:!0,shareEl:!0,counterEl:!0,arrowEl:!0,preloaderEl:!0,tapToClose:!1,tapToToggleControls:!0,clickToCloseNonZoomable:!0,shareButtons:[{id:"facebook",label:"Share on Facebook",url:"https://www.facebook.com/sharer/sharer.php?u={{url}}"},{id:"twitter",label:"Tweet",url:"https://twitter.com/intent/tweet?text={{text}}&url={{url}}"},{id:"pinterest",label:"Pin it",url:"http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}"},{id:"download",label:"Download image",url:"{{raw_image_url}}",download:!0}],getImageURLForShare:function(){return a.currItem.src||""},getPageURLForShare:function(){return window.location.href},getTextForShare:function(){return a.currItem.title||""},indexIndicatorSep:" / "},A=function(a){if(r)return!0;a=a||window.event,q.timeToIdle&&q.mouseUsed&&!k&&K();for(var c,d,e=a.target||a.srcElement,f=e.className,g=0;g<S.length;g++)c=S[g],c.onTap&&f.indexOf("pswp__"+c.name)>-1&&(c.onTap(),d=!0);if(d){a.stopPropagation&&a.stopPropagation(),r=!0;var h=b.features.isOldAndroid?600:30;s=setTimeout(function(){r=!1},h)}},B=function(){return!a.likelyTouchDevice||q.mouseUsed||screen.width>1200},C=function(a,c,d){b[(d?"add":"remove")+"Class"](a,"pswp__"+c)},D=function(){var a=1===q.getNumItemsFn();a!==p&&(C(d,"ui--one-slide",a),p=a)},E=function(){C(i,"share-modal--hidden",y)},F=function(){return y=!y,y?(b.removeClass(i,"pswp__share-modal--fade-in"),setTimeout(function(){y&&E()},300)):(E(),setTimeout(function(){y||b.addClass(i,"pswp__share-modal--fade-in")},30)),y||H(),!1},G=function(b){b=b||window.event;var c=b.target||b.srcElement;return a.shout("shareLinkClick",b,c),c.href?c.hasAttribute("download")?!0:(window.open(c.href,"pswp_share","scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420,top=100,left="+(window.screen?Math.round(screen.width/2-275):100)),y||F(),!1):!1},H=function(){for(var a,b,c,d,e,f="",g=0;g<q.shareButtons.length;g++)a=q.shareButtons[g],c=q.getImageURLForShare(a),d=q.getPageURLForShare(a),e=q.getTextForShare(a),b=a.url.replace("{{url}}",encodeURIComponent(d)).replace("{{image_url}}",encodeURIComponent(c)).replace("{{raw_image_url}}",c).replace("{{text}}",encodeURIComponent(e)),f+='<a href="'+b+'" target="_blank" class="pswp__share--'+a.id+'"'+(a.download?"download":"")+">"+a.label+"</a>",q.parseShareButtonOut&&(f=q.parseShareButtonOut(a,f));i.children[0].innerHTML=f,i.children[0].onclick=G},I=function(a){for(var c=0;c<q.closeElClasses.length;c++)if(b.hasClass(a,"pswp__"+q.closeElClasses[c]))return!0},J=0,K=function(){clearTimeout(u),J=0,k&&v.setIdle(!1)},L=function(a){a=a?a:window.event;var b=a.relatedTarget||a.toElement;b&&"HTML"!==b.nodeName||(clearTimeout(u),u=setTimeout(function(){v.setIdle(!0)},q.timeToIdleOutside))},M=function(){q.fullscreenEl&&(c||(c=v.getFullscreenAPI()),c?(b.bind(document,c.eventK,v.updateFullscreen),v.updateFullscreen(),b.addClass(a.template,"pswp--supports-fs")):b.removeClass(a.template,"pswp--supports-fs"))},N=function(){q.preloaderEl&&(O(!0),l("beforeChange",function(){clearTimeout(o),o=setTimeout(function(){a.currItem&&a.currItem.loading?(!a.allowProgressiveImg()||a.currItem.img&&!a.currItem.img.naturalWidth)&&O(!1):O(!0)},q.loadingIndicatorDelay)}),l("imageLoadComplete",function(b,c){a.currItem===c&&O(!0)}))},O=function(a){n!==a&&(C(m,"preloader--active",!a),n=a)},P=function(a){var c=a.vGap;if(B()){var g=q.barsSize;if(q.captionEl&&"auto"===g.bottom)if(f||(f=b.createEl("pswp__caption pswp__caption--fake"),f.appendChild(b.createEl("pswp__caption__center")),d.insertBefore(f,e),b.addClass(d,"pswp__ui--fit")),q.addCaptionHTMLFn(a,f,!0)){var h=f.clientHeight;c.bottom=parseInt(h,10)||44}else c.bottom=g.top;else c.bottom=g.bottom;c.top=g.top}else c.top=c.bottom=0},Q=function(){q.timeToIdle&&l("mouseUsed",function(){b.bind(document,"mousemove",K),b.bind(document,"mouseout",L),t=setInterval(function(){J++,2===J&&v.setIdle(!0)},q.timeToIdle/2)})},R=function(){l("onVerticalDrag",function(a){x&&.95>a?v.hideControls():!x&&a>=.95&&v.showControls()});var a;l("onPinchClose",function(b){x&&.9>b?(v.hideControls(),a=!0):a&&!x&&b>.9&&v.showControls()}),l("zoomGestureEnded",function(){a=!1,a&&!x&&v.showControls()})},S=[{name:"caption",option:"captionEl",onInit:function(a){e=a}},{name:"share-modal",option:"shareEl",onInit:function(a){i=a},onTap:function(){F()}},{name:"button--share",option:"shareEl",onInit:function(a){h=a},onTap:function(){F()}},{name:"button--zoom",option:"zoomEl",onTap:a.toggleDesktopZoom},{name:"counter",option:"counterEl",onInit:function(a){g=a}},{name:"button--close",option:"closeEl",onTap:a.close},{name:"button--arrow--left",option:"arrowEl",onTap:a.prev},{name:"button--arrow--right",option:"arrowEl",onTap:a.next},{name:"button--fs",option:"fullscreenEl",onTap:function(){c.isFullscreen()?c.exit():c.enter()}},{name:"preloader",option:"preloaderEl",onInit:function(a){m=a}}],T=function(){var a,c,e,f=function(d){if(d)for(var f=d.length,g=0;f>g;g++){a=d[g],c=a.className;for(var h=0;h<S.length;h++)e=S[h],c.indexOf("pswp__"+e.name)>-1&&(q[e.option]?(b.removeClass(a,"pswp__element--disabled"),e.onInit&&e.onInit(a)):b.addClass(a,"pswp__element--disabled"))}};f(d.children);var g=b.getChildByClass(d,"pswp__top-bar");g&&f(g.children)};v.init=function(){b.extend(a.options,z,!0),q=a.options,d=b.getChildByClass(a.scrollWrap,"pswp__ui"),l=a.listen,R(),l("beforeChange",v.update),l("doubleTap",function(b){var c=a.currItem.initialZoomLevel;a.getZoomLevel()!==c?a.zoomTo(c,b,333):a.zoomTo(q.getDoubleTapZoom(!1,a.currItem),b,333)}),l("preventDragEvent",function(a,b,c){var d=a.target||a.srcElement;d&&d.className&&a.type.indexOf("mouse")>-1&&(d.className.indexOf("__caption")>0||/(SMALL|STRONG|EM)/i.test(d.tagName))&&(c.prevent=!1)}),l("bindEvents",function(){b.bind(d,"pswpTap click",A),b.bind(a.scrollWrap,"pswpTap",v.onGlobalTap),a.likelyTouchDevice||b.bind(a.scrollWrap,"mouseover",v.onMouseOver)}),l("unbindEvents",function(){y||F(),t&&clearInterval(t),b.unbind(document,"mouseout",L),b.unbind(document,"mousemove",K),b.unbind(d,"pswpTap click",A),b.unbind(a.scrollWrap,"pswpTap",v.onGlobalTap),b.unbind(a.scrollWrap,"mouseover",v.onMouseOver),c&&(b.unbind(document,c.eventK,v.updateFullscreen),c.isFullscreen()&&(q.hideAnimationDuration=0,c.exit()),c=null)}),l("destroy",function(){q.captionEl&&(f&&d.removeChild(f),b.removeClass(e,"pswp__caption--empty")),i&&(i.children[0].onclick=null),b.removeClass(d,"pswp__ui--over-close"),b.addClass(d,"pswp__ui--hidden"),v.setIdle(!1)}),q.showAnimationDuration||b.removeClass(d,"pswp__ui--hidden"),l("initialZoomIn",function(){q.showAnimationDuration&&b.removeClass(d,"pswp__ui--hidden")}),l("initialZoomOut",function(){b.addClass(d,"pswp__ui--hidden")}),l("parseVerticalMargin",P),T(),q.shareEl&&h&&i&&(y=!0),D(),Q(),M(),N()},v.setIdle=function(a){k=a,C(d,"ui--idle",a)},v.update=function(){x&&a.currItem?(v.updateIndexIndicator(),q.captionEl&&(q.addCaptionHTMLFn(a.currItem,e),C(e,"caption--empty",!a.currItem.title)),w=!0):w=!1,y||F(),D()},v.updateFullscreen=function(){C(a.template,"fs",c.isFullscreen())},v.updateIndexIndicator=function(){q.counterEl&&(g.innerHTML=a.getCurrentIndex()+1+q.indexIndicatorSep+q.getNumItemsFn())},v.onGlobalTap=function(c){c=c||window.event;var d=c.target||c.srcElement;if(!r)if(c.detail&&"mouse"===c.detail.pointerType){if(I(d))return void a.close();b.hasClass(d,"pswp__img")&&(1===a.getZoomLevel()&&a.getZoomLevel()<=a.currItem.fitRatio?q.clickToCloseNonZoomable&&a.close():a.toggleDesktopZoom(c.detail.releasePoint))}else if(q.tapToToggleControls&&(x?v.hideControls():v.showControls()),q.tapToClose&&(b.hasClass(d,"pswp__img")||I(d)))return void a.close()},v.onMouseOver=function(a){a=a||window.event;var b=a.target||a.srcElement;C(d,"ui--over-close",I(b))},v.hideControls=function(){b.addClass(d,"pswp__ui--hidden"),x=!1},v.showControls=function(){x=!0,w||v.update(),b.removeClass(d,"pswp__ui--hidden")},v.supportsFullscreen=function(){var a=document;return!!(a.exitFullscreen||a.mozCancelFullScreen||a.webkitExitFullscreen||a.msExitFullscreen)},v.getFullscreenAPI=function(){var b,c=document.documentElement,d="fullscreenchange";return c.requestFullscreen?b={enterK:"requestFullscreen",exitK:"exitFullscreen",elementK:"fullscreenElement",eventK:d}:c.mozRequestFullScreen?b={enterK:"mozRequestFullScreen",exitK:"mozCancelFullScreen",elementK:"mozFullScreenElement",eventK:"moz"+d}:c.webkitRequestFullscreen?b={enterK:"webkitRequestFullscreen",exitK:"webkitExitFullscreen",elementK:"webkitFullscreenElement",eventK:"webkit"+d}:c.msRequestFullscreen&&(b={enterK:"msRequestFullscreen",exitK:"msExitFullscreen",elementK:"msFullscreenElement",eventK:"MSFullscreenChange"}),b&&(b.enter=function(){return j=q.closeOnScroll,q.closeOnScroll=!1,"webkitRequestFullscreen"!==this.enterK?a.template[this.enterK]():void a.template[this.enterK](Element.ALLOW_KEYBOARD_INPUT)},b.exit=function(){return q.closeOnScroll=j,document[this.exitK]()},b.isFullscreen=function(){return document[this.elementK]}),b}};return a});
;/*})'"*/;/*})'"*/
(function ($) {

Drupal.googleanalytics = {};

$(document).ready(function() {

  // Attach mousedown, keyup, touchstart events to document only and catch
  // clicks on all elements.
  $(document.body).bind("mousedown keyup touchstart", function(event) {

    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      // Is the clicked URL internal?
      if (Drupal.googleanalytics.isInternal(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox') && (Drupal.settings.googleanalytics.trackColorbox)) {
          // Do nothing here. The custom event will handle all tracking.
          //console.info("Click on .colorbox item has been detected.");
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (Drupal.settings.googleanalytics.trackDownload && Drupal.googleanalytics.isDownload(this.href)) {
          // Download link clicked.
          gtag('event', Drupal.googleanalytics.getDownloadExtension(this.href).toUpperCase(), {
            event_category: 'Downloads',
            event_label: Drupal.googleanalytics.getPageUrl(this.href),
            transport_type: 'beacon'
          });
        }
        else if (Drupal.googleanalytics.isInternalSpecial(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          // @todo: May require tracking ID
          var target = this;
          $.each(Drupal.settings.googleanalytics.account, function () {
            gtag('config', this, {
              page_path: Drupal.googleanalytics.getPageUrl(target.href),
              transport_type: 'beacon'
            });
          });
        }
      }
      else {
        if (Drupal.settings.googleanalytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          gtag('event', 'Click', {
            event_category: 'Mails',
            event_label: this.href.substring(7),
            transport_type: 'beacon'
          });
        }
        else if (Drupal.settings.googleanalytics.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (Drupal.settings.googleanalytics.trackDomainMode !== 2 || (Drupal.settings.googleanalytics.trackDomainMode === 2 && !Drupal.googleanalytics.isCrossDomain(this.hostname, Drupal.settings.googleanalytics.trackCrossDomains))) {
            // External link clicked / No top-level cross domain clicked.
            gtag('event', 'Click', {
              event_category: 'Outbound links',
              event_label: this.href,
              transport_type: 'beacon'
            });
          }
        }
      }
    });
  });

  // Track hash changes as unique pageviews, if this option has been enabled.
  if (Drupal.settings.googleanalytics.trackUrlFragments) {
    window.onhashchange = function() {
      $.each(Drupal.settings.googleanalytics.account, function () {
        gtag('config', this, {
          page_path: location.pathname + location.search + location.hash
        });
      });
    };
  }

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  if (Drupal.settings.googleanalytics.trackColorbox) {
    $(document).bind("cbox_complete", function () {
      var href = $.colorbox.element().attr("href");
      if (href) {
        $.each(Drupal.settings.googleanalytics.account, function () {
          gtag('config', this, {
            page_path: Drupal.googleanalytics.getPageUrl(href)
          });
        });
      }
    });
  }

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
Drupal.googleanalytics.isCrossDomain = function (hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, https://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
};

/**
 * Check whether this is a download URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isDownload = function (url) {
  var isDownload = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  return isDownload.test(url);
};

/**
 * Check whether this is an absolute internal URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternal = function (url) {
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return isInternal.test(url);
};

/**
 * Check whether this is a special URL or not.
 *
 * URL types:
 *  - gotwo.module /go/* links.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternalSpecial = function (url) {
  var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
  return isInternalSpecial.test(url);
};

/**
 * Extract the relative internal URL from an absolute internal URL.
 *
 * Examples:
 * - https://mydomain.com/node/1 -> /node/1
 * - https://example.com/foo/bar -> https://example.com/foo/bar
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   Internal website URL
 */
Drupal.googleanalytics.getPageUrl = function (url) {
  var extractInternalUrl = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return url.replace(extractInternalUrl, '');
};

/**
 * Extract the download file extension from the URL.
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   The file extension of the passed url. e.g. "zip", "txt"
 */
Drupal.googleanalytics.getDownloadExtension = function (url) {
  var extractDownloadextension = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  var extension = extractDownloadextension.exec(url);
  return (extension === null) ? '' : extension[1];
};

})(jQuery);
;/*})'"*/;/*})'"*/
