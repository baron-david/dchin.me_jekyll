/**
 * @file
 * Static property lead form handler.
 *
 * Handles lead form submissions for static property websites that don't have
 * access to Drupal's AJAX form system.
 */
(function($) {
  'use strict';

  // Cooldown period in minutes before allowing another submission.
  var SUBMISSION_COOLDOWN_MINUTES = 5;

  // Skip cooldown for logged-in Drupal users (testing).
  function isLoggedIn() {
    return $('body').hasClass('logged-in');
  }

  /**
   * Shared spam detection for all lead forms.
   *
   * @param {Object} data - Form data with first_name, last_name, email, phone.
   * @return {boolean} TRUE if the submission looks like spam.
   */
  function checkForSpam(data) {
    var fn = (data.first_name || '').trim();
    var ln = (data.last_name || '').trim();

    // Same first and last name.
    if (fn && ln && fn === ln) {
      return true;
    }

    // 555 phone numbers.
    if (data.phone && data.phone.indexOf('555') !== -1) {
      return true;
    }

    // @example.com emails.
    if (data.email && data.email.indexOf('@example.com') !== -1) {
      return true;
    }

    // Non-ASCII characters in names (Cyrillic, Devanagari, CJK, Arabic, etc.).
    // Allow only basic Latin letters, hyphens, apostrophes, spaces, and periods.
    var nameAsciiPattern = /[^A-Za-z '\-.]/;
    if (fn && nameAsciiPattern.test(fn)) {
      return true;
    }
    if (ln && nameAsciiPattern.test(ln)) {
      return true;
    }

    // SQL/code injection patterns in any field.
    var injectionPattern = /(select|insert|update|delete|drop|union|sleep|benchmark|waitfor|DBMS_PIPE|RECEIVE_MESSAGE|PG_SLEEP|CHR\(|DUAL|sysdate|XOR|\/\*|\*\/|<\?php|<script|alert\(|onerror|onload|0x[a-f0-9]+)/i;
    var fieldsToCheck = [fn, ln, data.email || '', data.phone || '', data.comment || ''];
    for (var j = 0; j < fieldsToCheck.length; j++) {
      if (fieldsToCheck[j] && injectionPattern.test(fieldsToCheck[j])) {
        return true;
      }
    }

    // Name heuristic: flag gibberish names (long consonant/vowel runs, suspicious casing).
    var names = [fn, ln];
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (name.length < 6) {
        continue;
      }
      var letters = name.replace(/[^A-Za-z]/g, '');
      var upper = (letters.match(/[A-Z]/g) || []).length;
      var lower = (letters.match(/[a-z]/g) || []).length;
      // Allow ALL-CAPS but block mixed-case with too many uppercase.
      if (lower > 0 && upper > 2) {
        return true;
      }
      // Excessive vowel runs (4+).
      if (/[AEIOUaeiou]{4,}/.test(letters)) {
        return true;
      }
      // Excessive consonant runs (5+).
      if (/[^AEIOUaeiou]{5,}/.test(letters)) {
        return true;
      }
    }

    return false;
  }

  $(document).ready(function() {
    var $form = $('#property-lead-form.form-ph');
    if (!$form.length) {
      return;
    }

    // Get API base URL from body data attribute or default to empty (same origin).
    var apiBase = $('body').data('api-base') || '';
    var pnid = $form.attr('pnid');
    var $formWrapper = $form.closest('.load-property-form');

    // Check if form was recently submitted.
    if (wasRecentlySubmitted(pnid)) {
      showSuccessState($formWrapper, true);
      return;
    }

    // Field mapping: field key -> input selector
    var fieldMap = {
      first_name: '[name="field_lead_first_name[und][0][value]"]',
      last_name: '[name="field_lead_last_name[und][0][value]"]',
      email: '[name="field_lead_email[und][0][email]"]',
      phone: '[name="field_lead_phone[und][0][value]"]',
      comment: '[name="field_lead_comment[und][0][value]"]'
    };

    // Enable the submit button (disabled by default via pointer-events in template).
    var $submit = $form.find('#edit-submit');
    $submit.css('pointer-events', 'auto');

    // Clear inline error when user starts typing (not on focus, to avoid clearing on programmatic focus).
    $form.on('input', 'input, textarea', function() {
      clearFieldError($(this));
    });

    // Handle form submission via click or Enter key.
    $form.on('submit', function(e) {
      e.preventDefault();
      submitLeadForm();
    });

    $submit.on('click', function(e) {
      e.preventDefault();
      submitLeadForm();
    });

    /**
     * Submit the lead form via AJAX.
     */
    function submitLeadForm() {
      // Clear all previous errors.
      clearAllErrors();

      // Gather form data.
      var data = {
        first_name: $form.find(fieldMap.first_name).val(),
        last_name: $form.find(fieldMap.last_name).val(),
        email: $form.find(fieldMap.email).val(),
        phone: $form.find(fieldMap.phone).val(),
        comment: $form.find(fieldMap.comment).val(),
        source: 'contact',
        _hp: $form.find('[name="website"]').val() || ''
      };

      // Honeypot check - if filled, silently "succeed" without actually submitting.
      if (data._hp) {
        markAsSubmitted(pnid);
        showSuccessState($formWrapper, false);
        return;
      }

      // Silent spam block — fake success, set cooldown, never submit.
      if (checkForSpam(data)) {
        markAsSubmitted(pnid);
        showSuccessState($formWrapper, false);
        return;
      }

      // Client-side validation.
      var errors = validateForm(data);
      if (Object.keys(errors).length) {
        showFieldErrors(errors);
        return;
      }

      // Show loading state.
      var originalText = $submit.text();
      $submit.text('Sending...').prop('disabled', true);

      // Submit to API.
      $.ajax({
        url: apiBase + '/api/v1/public/lead/' + pnid,
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(response) {
          if (response.success) {
            // Mark as submitted to prevent re-submission.
            markAsSubmitted(pnid);
            // Show success message.
            showSuccessState($formWrapper, false);
          }
          else {
            // Show server-side errors.
            var errorList = response.errors || [response.error || 'An error occurred'];
            showGeneralError(errorList.join(' '));
            $submit.text(originalText).prop('disabled', false);
          }
        },
        error: function() {
          showGeneralError('An error occurred. Please try again.');
          $submit.text(originalText).prop('disabled', false);
        }
      });
    }

    /**
     * Validate form data client-side.
     *
     * @param {Object} data - Form data object.
     * @return {Object} Object with field keys and error messages.
     */
    function validateForm(data) {
      var errors = {};

      if (!data.first_name || !data.first_name.trim()) {
        errors.first_name = 'First name is required';
      }
      if (!data.last_name || !data.last_name.trim()) {
        errors.last_name = 'Last name is required';
      }
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!data.phone || !data.phone.trim()) {
        errors.phone = 'Phone number is required';
      }
      if (!data.comment || data.comment.trim().split(/\s+/).length < 3) {
        errors.comment = 'Please enter a message (at least 3 words)';
      }

      return errors;
    }

    /**
     * Show inline error messages for specific fields.
     *
     * @param {Object} errors - Object with field keys and error messages.
     */
    function showFieldErrors(errors) {
      var firstErrorField = null;

      $.each(errors, function(fieldKey, message) {
        var $input = $form.find(fieldMap[fieldKey]);
        if ($input.length) {
          // Add error styling to input.
          $input.addClass('border-red-500 border-2');

          // Create inline error message.
          var errorHtml = '<div class="field-error text-red-600 text-sm mt-1 mb-2">' + message + '</div>';

          // Insert after the input (or textarea).
          $input.after(errorHtml);

          // Track first error field for scrolling.
          if (!firstErrorField) {
            firstErrorField = $input;
          }
        }
      });

      // Scroll to first error.
      if (firstErrorField) {
        $('html, body').animate({
          scrollTop: firstErrorField.offset().top - 120
        }, 300);
        firstErrorField.focus();
      }
    }

    /**
     * Clear inline error for a specific field.
     *
     * @param {jQuery} $input - The input element.
     */
    function clearFieldError($input) {
      $input.removeClass('border-red-500 border-2');
      $input.siblings('.field-error').remove();
      $input.next('.field-error').remove();
    }

    /**
     * Clear all inline errors.
     */
    function clearAllErrors() {
      $form.find('.field-error').remove();
      $form.find('.general-error').remove();
      $form.find('input, textarea').removeClass('border-red-500 border-2');
    }

    /**
     * Show a general error message at the top of the form.
     *
     * @param {string} message - Error message to display.
     */
    function showGeneralError(message) {
      var errorHtml = '<div class="general-error bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">' +
        message +
        '</div>';
      $form.prepend(errorHtml);

      // Scroll to error.
      $('html, body').animate({
        scrollTop: $form.offset().top - 100
      }, 300);
    }

    /**
     * Show success state, replacing the form with a confirmation message.
     *
     * @param {jQuery} $wrapper - The form wrapper element.
     * @param {boolean} isReturningVisitor - If true, show a slightly different message.
     */
    function showSuccessState($wrapper, isReturningVisitor) {
      // Capture current dimensions to prevent layout shift.
      var currentHeight = $wrapper.outerHeight();
      var currentWidth = $wrapper.outerWidth();

      var message = isReturningVisitor
        ? "Thank you for reaching out! We'll be in touch soon!"
        : 'Thank you for reaching out! We will connect with you as soon as possible.';

      var successHtml =
        '<div class="lead-submit-success mt-2 border border-gray-300 border-dashed bg-gray-50 flex items-center justify-center text-center p-6" ' +
        'style="min-height: ' + currentHeight + 'px; width: 100%;">' +
        '<div>' +
        '<div class="text-green-700 mb-3">' +
        '<svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>' +
        '</svg>' +
        '</div>' +
        '<h3 class="text-xl font-semibold mb-2 text-gray-800">Message Sent!</h3>' +
        '<p class="text-gray-600">' + message + '</p>' +
        '</div>' +
        '</div>';

      $wrapper.html(successHtml);
    }

    /**
     * Check if the form was recently submitted for this property.
     *
     * @param {string} propertyNid - The property node ID.
     * @return {boolean} True if submitted within cooldown period.
     */
    function wasRecentlySubmitted(propertyNid) {
      if (isLoggedIn()) {
        return false;
      }
      var storageKey = '_r' + btoa(propertyNid).substring(0, 8);
      var submittedAt = localStorage.getItem(storageKey);

      if (!submittedAt) {
        return false;
      }

      var submittedTime = parseInt(submittedAt, 10);
      var now = Date.now();
      var cooldownMs = SUBMISSION_COOLDOWN_MINUTES * 60 * 1000;

      return (now - submittedTime) < cooldownMs;
    }

    /**
     * Mark the form as submitted for this property.
     *
     * @param {string} propertyNid - The property node ID.
     */
    function markAsSubmitted(propertyNid) {
      var storageKey = '_r' + btoa(propertyNid).substring(0, 8);
      localStorage.setItem(storageKey, Date.now().toString());
    }
  });

  /**
   * Book Showing Static Form Handler.
   */
  $(document).ready(function() {
    var $form = $('.book-showing-static');
    var apiBase = $('body').data('api-base') || '';

    /**
     * Check if booking form was recently submitted for this property.
     */
    function wasBookingRecentlySubmitted(propertyNid) {
      if (isLoggedIn() || !propertyNid) {
        return false;
      }
      // Convert to string in case it's a number
      var propertyNidStr = String(propertyNid);
      var storageKey = '_b' + btoa(propertyNidStr).substring(0, 8);
      var submittedAt = localStorage.getItem(storageKey);

      if (!submittedAt) {
        return false;
      }

      var submittedTime = parseInt(submittedAt, 10);
      var now = Date.now();
      var cooldownMs = SUBMISSION_COOLDOWN_MINUTES * 60 * 1000;

      return (now - submittedTime) < cooldownMs;
    }

    /**
     * Mark the booking form as submitted for this property.
     */
    function markBookingSubmitted(propertyNid) {
      // Convert to string in case it's a number
      var propertyNidStr = String(propertyNid);
      var storageKey = '_b' + btoa(propertyNidStr).substring(0, 8);
      localStorage.setItem(storageKey, Date.now().toString());
    }

    // Open modal on trigger click - always bind, even if form not found yet.
    $(document).on('click', '.book-showing-trigger', function(e) {
      e.preventDefault();
      var $wrapper = $('#book-showing-static-wrapper');

      if (!$wrapper.length) {
        return;
      }

      // Get property NID from the form inside the wrapper to check cooldown.
      var $formInWrapper = $wrapper.find('.book-showing-static');
      var pnid = $formInWrapper.length ? $formInWrapper.attr('pnid') : null;

      // Check cooldown BEFORE detaching - if recently submitted, show success message instead of form.
      var $bookingWrapper = $wrapper.find('.panel-body .booking-content-wrapper');
      if (pnid && wasBookingRecentlySubmitted(pnid) && $bookingWrapper.length) {
        $bookingWrapper.html(
          '<div class="text-center p-a-4">' +
          '<i class="fa fa-check-circle text-success" style="font-size:60px;"></i>' +
          '<h3 class="m-t-2">Tour Requested!</h3>' +
          '<p class="text-muted">We have received your request and will be in touch soon!</p>' +
          '</div>'
        );
      }

      // Use .overlay-content like the AJAX version for proper styling.
      $('#overlay-content-static').hide();
      $('.overlay-content').html('').show();
      $wrapper.detach().appendTo('.overlay-content').show();

      var modalClass = $wrapper.data('modal-class') || 'booking-showing-basic-modal book-showing-modal text-center';
      $('#ajax-content-overlay')
        .removeClass()
        .addClass(modalClass)
        .fadeIn();
      $('.overlay-header').show();
      $('body').addClass('overlay-open');

      // Trigger window resize to recalculate modal width.
      var resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
    });

    // Handle overlay close - restore wrapper BEFORE relas.js clears the content.
    // Use mousedown which fires before click.
    $(document).on('mousedown', '.overlay-close', function() {
      var $wrapper = $('#book-showing-static-wrapper');
      if ($wrapper.length) {
        $wrapper.hide().detach().appendTo('body');
      }
    });

    // Only set up form handlers if form exists.
    if (!$form.length) {
      return;
    }

    // Step 1 -> Step 2 navigation.
    $(document).on('click', '.btn-showing-next', function() {
      var appointmentType = $form.find('[name="appointment_type"]:checked').val();
      var appointmentDate = $form.find('[name="appointment_date"]:checked').val();
      var preferredTime = $form.find('[name="preferred_time"]:checked').val();

      if (!appointmentType || !appointmentDate || !preferredTime) {
        $('#booking-request-error').text('Please choose an Appointment Type, Date, and Preferred Time');
        return;
      }

      // Format date display.
      var displayDate = $.datepicker.formatDate('DD, MM d, yy', new Date(appointmentDate));
      var typeLabel = $form.find('[name="appointment_type"]:checked').closest('label').text().trim();
      var timeLabel = $form.find('[name="preferred_time"]:checked').closest('label').text().trim();

      $form.find('.date-info').remove();
      $form.find('.finish-wrapper').prepend(
        '<div class="date-info text-center m-b-2">' +
        '<div class="date-type text-capitalize">' + typeLabel + '</div>' +
        '<div class="date-date h4 m-y-1">' + displayDate + '</div>' +
        '<div class="date-time text-capitalize">' + timeLabel + '</div>' +
        '</div>'
      );

      $form.find('.initial-wrapper').removeClass('active');
      $form.find('.finish-wrapper').addClass('active');
      $('.book-showing-back').show();
    });

    // Back button.
    $(document).on('click', '.book-showing-back', function() {
      $('#booking-request-error').text('');
      $(this).hide();
      $form.find('.finish-wrapper').removeClass('active');
      $form.find('.initial-wrapper').addClass('active');
      $form.find('.date-info').remove();
    });

    // Submit button click.
    $(document).on('click', '#schedule-booking-submit-static', function(e) {
      e.preventDefault();
      submitBookShowingForm();
    });

    // Clear errors on input.
    $form.on('input', 'input, textarea', function() {
      $(this).removeClass('error');
      $(this).siblings('.field-error').remove();
    });

    function submitBookShowingForm() {
      // Re-query form in case it was moved.
      var $currentForm = $('.book-showing-static');
      var currentPnid = $currentForm.attr('pnid');

      $currentForm.find('.field-error, .general-error').remove();
      $currentForm.find('input, textarea').removeClass('error');

      // Check cooldown.
      if (wasBookingRecentlySubmitted(currentPnid)) {
        $currentForm.find('.finish-wrapper').prepend(
          '<div class="general-error alert alert-warning">We have received your request and will be in touch soon!</div>'
        );
        return;
      }

      var data = {
        source: 'book_showing',
        first_name: $currentForm.find('[name="field_first_name"]').val(),
        last_name: $currentForm.find('[name="field_last_name"]').val(),
        email: $currentForm.find('[name="field_email"]').val(),
        phone: $currentForm.find('[name="field_phone"]').val(),
        comment: $currentForm.find('[name="field_message"]').val() || '',
        appointment_type: $currentForm.find('[name="appointment_type"]:checked').val(),
        appointment_date: $currentForm.find('[name="appointment_date"]:checked').val(),
        preferred_time: $currentForm.find('[name="preferred_time"]:checked').val()
      };

      // Silent spam block — fake success, set cooldown, never submit.
      if (checkForSpam(data)) {
        markBookingSubmitted(currentPnid);
        $currentForm.closest('.booking-content-wrapper').html(
          '<div class="text-center p-a-4">' +
          '<i class="fa fa-check-circle text-success" style="font-size:60px;"></i>' +
          '<h3 class="m-t-2">Tour Requested!</h3>' +
          '<p class="text-muted">We\'ll confirm your tour request soon.</p>' +
          '</div>'
        );
        return;
      }

      // Validation.
      var errors = {};
      if (!data.first_name) errors.field_first_name = 'First name is required';
      if (!data.last_name) errors.field_last_name = 'Last name is required';
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.field_email = 'Valid email is required';
      }
      if (!data.phone) errors.field_phone = 'Phone is required';

      if (Object.keys(errors).length) {
        $.each(errors, function(field, msg) {
          var $input = $currentForm.find('[name="' + field + '"]');
          $input.addClass('error');
          $input.after('<div class="field-error text-danger m-t-1">' + msg + '</div>');
        });
        return;
      }

      var $submit = $('#schedule-booking-submit-static');
      var originalText = $submit.text();
      $submit.text('Sending...').prop('disabled', true);

      $.ajax({
        url: apiBase + '/api/v1/public/lead/' + currentPnid,
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(response) {
          if (response.success) {
            // Mark as submitted for cooldown.
            markBookingSubmitted(currentPnid);
            $currentForm.closest('.booking-content-wrapper').html(
              '<div class="text-center p-a-4">' +
              '<i class="fa fa-check-circle text-success" style="font-size:60px;"></i>' +
              '<h3 class="m-t-2">Tour Requested!</h3>' +
              '<p class="text-muted">We\'ll confirm your tour request soon.</p>' +
              '</div>'
            );
          } else {
            $currentForm.find('.finish-wrapper').prepend(
              '<div class="general-error alert alert-danger">' +
              (response.errors ? response.errors.join(' ') : 'An error occurred') +
              '</div>'
            );
            $submit.text(originalText).prop('disabled', false);
          }
        },
        error: function() {
          $currentForm.find('.finish-wrapper').prepend(
            '<div class="general-error alert alert-danger">An error occurred. Please try again.</div>'
          );
          $submit.text(originalText).prop('disabled', false);
        }
      });
    }

  });

  /**
   * Lead Pop Static Form Handler.
   *
   * Uses delegated events since the form is in a hidden container
   * that gets moved into the overlay when triggered.
   */
  $(document).ready(function() {
    var apiBase = $('body').data('api-base') || '';
    var LEADPOP_STORAGE_KEY = 'rela_leadpop';

    // Field mapping for the Drupal form field names.
    var fieldMap = {
      first_name: '[name="field_lead_first_name[und][0][value]"]',
      last_name: '[name="field_lead_last_name[und][0][value]"]',
      email: '[name="field_lead_email[und][0][email]"]',
      phone: '[name="field_lead_phone[und][0][value]"]'
    };

    // Mark lead pop as complete in localStorage (persists like the 14-day cookie).
    function markLeadPopComplete(propertyId) {
      try {
        var stored = localStorage.getItem(LEADPOP_STORAGE_KEY);
        var pids = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(pids)) {
          pids = [];
        }
        if (pids.indexOf(String(propertyId)) === -1) {
          pids.push(String(propertyId));
        }
        localStorage.setItem(LEADPOP_STORAGE_KEY, JSON.stringify(pids));
      }
      catch (e) {
        console.warn('Could not save to localStorage');
      }
    }

    // Clear inline error when user starts typing (delegated event).
    $(document).on('input', '.leadpop-static input, .leadpop-static textarea', function() {
      clearLeadPopFieldError($(this));
    });

    // Submit button click (delegated event).
    $(document).on('click', '#leadpop-submit-static', function(e) {
      e.preventDefault();
      submitLeadPopForm();
    });

    function submitLeadPopForm() {
      // Re-query form in case it was moved in DOM.
      var $currentForm = $('.leadpop-static');
      if (!$currentForm.length) {
        console.warn('Lead pop form not found');
        return;
      }

      var currentPnid = $currentForm.attr('pnid');

      // Clear all previous errors.
      clearAllLeadPopErrors($currentForm);

      var data = {
        source: 'pop',
        first_name: $currentForm.find(fieldMap.first_name).val() || '',
        last_name: $currentForm.find(fieldMap.last_name).val() || '',
        email: $currentForm.find(fieldMap.email).val() || '',
        phone: $currentForm.find(fieldMap.phone).val() || '',
        _hp: $currentForm.find('[name="website"]').val() || ''
      };

      // Honeypot check.
      if (data._hp) {
        markLeadPopComplete(currentPnid);
        showLeadPopSuccess($currentForm);
        return;
      }

      // Silent spam block — fake success, mark complete, never submit.
      if (checkForSpam(data)) {
        markLeadPopComplete(currentPnid);
        showLeadPopSuccess($currentForm);
        return;
      }

      // Validation.
      var errors = validateLeadPopForm(data);
      if (Object.keys(errors).length) {
        showLeadPopFieldErrors($currentForm, errors);
        return;
      }

      var $submit = $('#leadpop-submit-static');
      var originalText = $submit.text();
      $submit.text('Sending...').prop('disabled', true);

      $.ajax({
        url: apiBase + '/api/v1/public/lead/' + currentPnid,
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(response) {
          if (response.success) {
            if (response.verification_required) {
              // Email verification required - show check email message.
              // Don't save to localStorage yet - wait for email link click.
              showLeadPopVerificationMessage($currentForm);
            }
            else {
              // No verification required - mark complete and show success.
              markLeadPopComplete(currentPnid);
              showLeadPopSuccess($currentForm);
            }
          }
          else {
            showLeadPopGeneralError($currentForm, response.errors ? response.errors.join(' ') : 'An error occurred');
            $submit.text(originalText).prop('disabled', false);
          }
        },
        error: function() {
          showLeadPopGeneralError($currentForm, 'An error occurred. Please try again.');
          $submit.text(originalText).prop('disabled', false);
        }
      });
    }

    /**
     * Validate lead pop form data.
     */
    function validateLeadPopForm(data) {
      var errors = {};

      if (!data.first_name || !data.first_name.trim()) {
        errors.first_name = 'First name is required';
      }
      if (!data.last_name || !data.last_name.trim()) {
        errors.last_name = 'Last name is required';
      }
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!data.phone || !data.phone.trim()) {
        errors.phone = 'Phone number is required';
      }

      return errors;
    }

    /**
     * Show inline error messages for specific fields.
     */
    function showLeadPopFieldErrors($currentForm, errors) {
      var firstErrorField = null;

      $.each(errors, function(fieldKey, message) {
        var $input = $currentForm.find(fieldMap[fieldKey]);
        if ($input.length) {
          // Add error styling to input.
          $input.addClass('error has-error');

          // Create inline error message.
          var errorHtml = '<div class="field-error text-danger" style="font-size:12px;margin-top:2px;text-align:left">' + message + '</div>';

          // Insert after the input.
          $input.after(errorHtml);

          // Track first error field for focus.
          if (!firstErrorField) {
            firstErrorField = $input;
          }
        }
      });

      // Focus on first error field.
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }

    /**
     * Clear inline error for a specific field.
     */
    function clearLeadPopFieldError($input) {
      $input.removeClass('error has-error');
      $input.siblings('.field-error').remove();
      $input.next('.field-error').remove();
    }

    /**
     * Clear all inline errors.
     */
    function clearAllLeadPopErrors($currentForm) {
      $currentForm.find('.field-error').remove();
      $currentForm.find('.general-error').remove();
      $currentForm.find('input, textarea').removeClass('error has-error');
    }

    /**
     * Show general error message.
     */
    function showLeadPopGeneralError($currentForm, message) {
      var errorHtml = '<div class="general-error alert alert-danger">' + message + '</div>';
      $currentForm.find('#exit_intent_lead_node_form_wrapper').prepend(errorHtml);
    }

    /**
     * Show success state.
     */
    function showLeadPopSuccess($currentForm) {
      $currentForm.closest('#exit_intent_lead_node_form_wrapper').html(
        '<div class="text-center p-a-4">' +
        '<i class="fa fa-check-circle text-success" style="font-size:60px;"></i>' +
        '<h3 class="m-t-2">Thank You!</h3>' +
        '<p class="text-muted">Your request has been received.</p>' +
        '</div>'
      );
      // Close overlay after delay.
      setTimeout(function() {
        $('.overlay-close').trigger('click');
      }, 2500);
    }

    /**
     * Show email verification message.
     */
    function showLeadPopVerificationMessage($currentForm) {
      $currentForm.closest('#exit_intent_lead_node_form_wrapper').html(
        '<div class="text-center p-a-4">' +
        '<i class="fa fa-envelope text-info" style="font-size:60px;"></i>' +
        '<h3 class="m-t-2">Check Your Email</h3>' +
        '<p class="text-muted">Look for the verification email in your inbox and click the link to gain full access to this listing.</p>' +
        '</div>'
      );
    }
  });

  /**
   * Password Protection Static Form Handler.
   *
   * Handles password-protected property sites without AJAX.
   * Password validation is done entirely on the frontend.
   */
  $(document).ready(function() {
    var PPSS_COOKIE_NAME = 'rela_ppss';
    var PPSS_COOKIE_DAYS = 1;

    // Check if password protection is active on page load.
    $('#prop-pass-check').click(function() {
      if (Drupal.settings.relaPPSSHash === undefined) {
        return;
      }

      var storedHash = Drupal.settings.relaPPSSHash;
      var cookie = $.cookie(PPSS_COOKIE_NAME);

      if (cookie === null || cookie !== storedHash) {
        showPasswordPopup();
      }
    });

    function showPasswordPopup() {
      $('body').addClass('ppss-required');
      $('#ajax-content-overlay').removeClass().addClass('overlay-wide overlay-pass-pop').show();
      $('#overlay-content-static').show();
      $('body').addClass('overlay-open');
      $('.overlay-header').hide();

      var $target = $('#pass-pop-replace');
      if ($target.length) {
        $target.show().detach().appendTo('#overlay-content-static');
      }
    }

    // Submit button click (delegated event).
    $(document).on('click', '#ppss-submit-static', function(e) {
      e.preventDefault();
      submitPasswordForm();
    });

    // Also handle Enter key in the password field.
    $(document).on('keypress', '.ppss-static input[name="pass"]', function(e) {
      if (e.which === 13) {
        e.preventDefault();
        submitPasswordForm();
      }
    });

    function submitPasswordForm() {
      var $form = $('.ppss-static');
      if (!$form.length) {
        return;
      }

      var enteredPass = $form.find('input[name="pass"]').val() || '';
      var expectedPass = Drupal.settings.relaPPSSPass || '';
      var hashForCookie = Drupal.settings.relaPPSSHash || '';

      // Clear previous errors.
      $form.find('.error-message').remove();
      $form.find('input').removeClass('error');

      if (!enteredPass) {
        showPasswordError($form, 'Password field cannot be empty.');
        return;
      }

      if (enteredPass !== expectedPass) {
        showPasswordError($form, 'Incorrect password. Please try again.');
        return;
      }

      // Success - set cookie and close overlay.
      $.cookie(PPSS_COOKIE_NAME, hashForCookie, { expires: PPSS_COOKIE_DAYS, path: '/' });
      closePasswordOverlay();
    }

    function showPasswordError($form, message) {
      var $input = $form.find('input[name="pass"]');
      $input.addClass('error');
      $input.after('<div class="error-message text-danger m-t-1">' + message + '</div>');
      $input.focus();
    }

    function closePasswordOverlay() {
      $('#pass-pop-replace').html('');
      $('#ajax-content-overlay').hide();
      $('body').css('overflow', 'visible').removeClass('overlay-open ppss-required');
      $('.overlay-header').show();
      $('.overlay-close').click();
    }
  });

})(jQuery);
