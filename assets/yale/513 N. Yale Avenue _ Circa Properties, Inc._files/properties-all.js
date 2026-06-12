(function($, Drupal, undefined) {

  // Lives here (not a separate file) so legacy v1 static sites — which
  // were exported with HTML that references properties-all.js but not
  // a separate lenis bundle — keep working when this file is re-synced
  // to the shared CDN path. _relaz_property_smooth_scroll() gates init
  // via Drupal.settings.propertySmoothScroll, so other view modes are
  // no-ops.
  Drupal.behaviors.LenisSmoothScroll = {
    attach: function(context, settings) {
      if (Drupal.settings.propertySmoothScroll !== undefined) {
        if (Drupal.settings.propertySmoothScroll == true) {
          //https://github.com/studio-freight/lenis
          // Anything that is fixed full screen like overlays and shit
          // need to be in this list.
          var preventLenisSelectors = [
            '#overlay-content-extra',
            '#overlay-description',
            '#right-edit-overlay',
            '#ajax-content-overlay',
            '#side-menu',
            '.lenis-prevent'

          ]
          $.each(preventLenisSelectors, function(index, selector) {
            var $elements = $(selector);
            if ($elements.length) {
              $elements.attr('data-lenis-prevent', '');
            }
          });

          const lenis = new Lenis()

          function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
          }

          requestAnimationFrame(raf);

        }
      }
    }
  }

  Drupal.behaviors.mobileDetect = {
    attach: function(context, settings) {

      if (typeof Drupal.relaGlobalFunctions !== 'undefined' && Drupal.relaGlobalFunctions.isMobile()) {
        $('.full-bg').css('background-attachment', 'scroll');
      }
      else {
        //We can only init  skrollr on desktop cuz it locks the body on mobile
        if (typeof skrollr != 'undefined') {
          skrollr.init({
            forceHeight: false
          });
        }
      }
    }
  }

  Drupal.behaviors.propertySetButtonTextColor =  {
    attach: function(context, settings) {
      if (Drupal.settings.propertyTemplateSettings !== undefined) {
        $('body', context).on('contact-form-loaded', function() {
          setTimeout(function() {
            var submitBGColor = $('button[name="op"]').css("background-color");
            var textColor = getTextColor(submitBGColor);
            $('.form-submit').css("color", textColor);
          }, 100);
        });

        function getTextColor(rgba){
          rgba = rgba.match(/\d+/g);
          if((rgba[0]*0.299)+(rgba[1]*0.587)+(rgba[2]*0.114)>186) {
            return 'black';
          }
          else {
            return 'white';
          }
        }
      }
    }
  }

  Drupal.behaviors.floorplanZoom = {
    attach: function(context, settings) {
      $('.easyzoom--overlay').once().click(function(){
        $('.hotspot-viewer').removeClass('zoom-active');
      });

      $('.hotspot-container.zoomable-1 .field-name-field-doc-file').once().click(function() {
        $wrapper = $(this).parent().parent().parent();//('.hotspot-container');
        $isActive = $wrapper.hasClass('zoom-active');

        if (!$isActive) {
          $wrapper.addClass('zoom-active');
        }
        else {
          $wrapper.removeClass('zoom-active');

        }
      });
    }
  }


  Drupal.behaviors.propertyVtourGallery = {
    attach: function(context, settings) {

      // This is primarily for the VisitHome.ai vtour embeds. They require a minimum width of 1024px.
      function updateVtourWidth() {
        var $vtourWrap = $('.vtour-wrap');
        var $vtourEmbedWrapper = $('#vtour-embed-wrapper');
        var $target = $vtourWrap.length ? $vtourWrap : $vtourEmbedWrapper;

        if (!$target.length) {
          return;
        }

        // Check if iframe src contains visithome.ai
        var $iframe = $target.find('iframe.vtour-frame, iframe#frame-vtour').first();
        if (!$iframe.length) {
          $iframe = $('.vtour-frame, #frame-vtour').first();
        }

        if (!$iframe.length || $iframe.attr('src').indexOf('visithome.ai') === -1) {
          return;
        }

        // Find the constraining container (any max-width-xxx or parent column)
        var $maxWidthContainer = $target.closest('[class*="max-width-"]');
        var $container = $maxWidthContainer.length ? $maxWidthContainer : $target.parent();

        // Override max-width constraint to allow 1024px minimum
        if ($maxWidthContainer.length) {
          $maxWidthContainer.css('max-width', 'none');
        }

        // Measure the actual available width
        var containerWidth = $container.width() || 0;
        var minWidth = 1024;

        console.log('Container width:', containerWidth);

        if (containerWidth < minWidth && containerWidth > 0) {
          var scale = containerWidth / minWidth;
          $target.css({
            'transform': 'scale(' + scale + ')',
            'transform-origin': 'top left',
            'width': minWidth + 'px'
          });
        } else {
          $target.css({
            'transform': '',
            'transform-origin': '',
            'width': ''
          });
        }
      }

      updateVtourWidth();
      if (!this.resizeHandlerAttached) {
        this.resizeHandlerAttached = true;
        $(window).on('resize', function() {
          updateVtourWidth();
        });
      }

      $('.vtab', context).click(function() {
        var tourURL = $(this).data('tour-url');
        $('.vtab-active').removeClass('vtab-active');
        $(this).addClass('vtab-active');

        $('.vtour-frame').attr('src', tourURL);
        return false;
      });
    }
  }

  var getaudio = $('#property-audio')[0];

  function playAudio() {
    $('#property-audio').addClass('on');
    $('#bars').addClass('playing');
    $('#bars').removeClass('paused');

    getaudio.play();
  }

  function pauseAudio() {
    $('#property-audio').removeClass('on');
    $('#bars').removeClass('playing');
    $('#bars').addClass('paused');

    getaudio.pause();
  }

  $(document).ready(function() {

    // Check for Audio.

    if ($('#property-audio').length) {
      getaudio = $('#property-audio')[0];

      // var promise = document.querySelector('audio').play();
      // if (promise !== undefined) {
      //   promise.catch(error => {
      //     // Auto-play was prevented
      //     // Show a UI element to let the user manually start playback
      //     pauseAudio();

      //     var prompt = '<div class="audio-prompt bounceInLeft">Click for the full experience</div>';
      //     $('#bars').after(prompt);
      //     $('.audio-prompt').addClass('animated');
      //     setTimeout(function() {
      //       $('.audio-prompt').removeClass('bounceInLeft').addClass('bounceOutLeft');
      //     }, 4000);

      //   }).then(() => {
      //     // Auto-play started
      //   });
      // }

      Promise.resolve(document.querySelector('audio').play()).then(function() {
        //Returning a thenable from a handler is automatically
        //cast to a trusted Promise as per Promises/A+ specification

      }).then(function() {

      }).catch(function(e) {
        pauseAudio();

        var prompt = '<div class="audio-prompt bounceInLeft text-black">Click for the full audio experience</div>';
        $('#bars').after(prompt);
        $('.audio-prompt').addClass('animated');
        setTimeout(function() {
          $('.audio-prompt').removeClass('bounceInLeft').addClass('bounceOutLeft');
        }, 4000);
        console.log(e);
      });
    }

  });


  Drupal.behaviors.propertyGalleryPID = {
    attach: function(context, settings) {
      $('.view-id-property_gallery', context).each(function() {
        $view = $(this);
        $images = $view.find('.views-row');
        var count = $images.length;
        var i;
        for (i = 0; i < count; i++) {
          $images.eq(i).find('[data-pid]').attr('data-pid', i);
        }
      });

      // Loop through custom preview images and match up the position of
      // the image in the gallery array so it opens to that image.
      if (
        typeof settings.RelaProperty !== 'undefined' &&
        typeof settings.RelaProperty.imageListPS !== 'undefined'
      ) {
        var psImages = Drupal.settings.RelaProperty.imageListPS;
        var propertyNid = Drupal.settings.RelaProperty.nid;
        var imageCount = psImages[propertyNid].length;
        $('[data-ps-url]', context).each(function(){
          for (i = 0; i < imageCount; i++) {
            if ($(this).attr('data-ps-url') == psImages[propertyNid][i]['url']) {
              $(this).attr('data-pid', i);
            }
          }
        })
      }

      // Loop through custom preview images and match up the position of
      // the image in the gallery array so it opens to that image.
      if (
        typeof settings.RelaPropertyFloorplan !== 'undefined' &&
        typeof settings.RelaPropertyFloorplan.floorplanListPS !== 'undefined'
        ) {
        var fpImages = Drupal.settings.RelaPropertyFloorplan.floorplanListPS;
        var imageCount = fpImages.length;
        $('[data-ps-fp-url]', context).each(function(){
          for (i = 0; i < imageCount; i++) {
            if ($(this).attr('data-ps-fp-url') == fpImages[i]['url']) {
              $(this).attr('data-pid', i);
            }
          }
        })
      }
    }
  }


  Drupal.behaviors.propertyAudio = {
    attach: function(context, settings) {

      $('body', context).on('click', '.audio-prompt', function() {
        $('#bars').click();
      });
      $('#bars', context).click(function() {
        if ($('#property-audio').hasClass('on')) {
          pauseAudio();
        } else {
          playAudio();
        }
      });

      $('.overlay-trigger', context).click(function() {
        if ($('#property-audio').length) {
          if ($('#property-audio').hasClass('on')) {
            pauseAudio();
            $('#property-audio').addClass('overlay-pause');
          }
        }

        if (typeof settings.relaVideo !== 'undefined') {
          if (settings.relaVideo.videoSource == 'vimeo') {
            var playerID = '#vimeo-fullscreen';
            var playerIframe = $(playerID)[0];
            var player = new Vimeo.Player(playerIframe);
            player.setVolume(0)
          }
        }

      });

      $('.overlay-close', context).click(function() {
        if ($('.overlay-pause', context).length) {
          $('.overlay-pause').removeClass('overlay-pause');
          playAudio();
        }
      });

      // Social links JS.
      $('.field-type-social-links-field .field-label', context).click(function() {
        $(this).parent().find('.social-links').toggleClass('active');
      });

    }
  }



  // Drupal.behaviors.exitIntent = {
  //   attach: function(context, settings) {

  //     var pid = Drupal.settings.exitIntent.pid || 0;

  //     if (pid > 0) {
  //       // $('.lead-pop-exit', context).each(function(){
  //       //   $(function() {
  //       //     ddexitpop.init({
  //       //       contentsource: ['id', 'ph'],
  //       //       fxclass: 'random',
  //       //       displayfreq: 'always',
  //       //       onddexitpop: function($popup) {
  //       //         $('.lead-pop-exit').click();
  //       //       }
  //       //     })
  //       //   });
  //       // })

  //     }
  //   }
  // }

  Drupal.behaviors.vTourActivate = {
    attach: function(context, settings) {

      $('.vtour-tabs .tour-cover-image').unbind('click');
      $('.vtour-tabs .tour-cover-image').click(function() {
        $this = $(this);
        $vtour = $this.hide().prev();
        var src = $vtour.attr('src');
        if (~src.indexOf('matterport.com')) {
          $vtour.attr('src', src + '&play=1');
        }
      });
    }
  }

  Drupal.behaviors.sbowcaseTabs = {
    attach: function(context, settings) {
      if (('#showcase').length > 0) {

        // setup for intial load
        $('.showcase-tabs-wrapper', context).find('.showcase-tab:first').once('showCaseTabInit').addClass('active');
        $('#showcase', context).find('.showcase-content:first').once('showCaseTabInit').addClass('active');
        var sectionHeight = $('.showcase-content.active').find('.showcase-section').height() + 100;

        //$('.showcase-content.active').parent().css('height', sectionHeight + 'px');

        $('.showcase-tab', context).on('click', function() {
          var $tab = $(this);
          $('#showcase .active').each(function() {
            $(this).removeClass('active');
          });
          var tabID = "#" + $(this).attr('tab-data');
          //sectionHeight = $(tabID).find('.showcase-section').height() + 100;

          $(this).addClass('active');

          $(tabID).addClass('active');
          //$('.showcase-contents-wrapper').css('height', sectionHeight + 'px');
          if ($tab.hasClass('resize-content')) {

            window.dispatchEvent(new Event('resize'));
          }
          return false;
        });
      }
    }
  }

  Drupal.behaviors.vTourLazy = {
    attach: function(context, settings) {
      $('#frame-vtour').load(function(e) {
        if (!$(this).hasClass('vtour-loaded-processed')) {
          $(this).addClass('vtour-loaded-processed');
          setTimeout(function() {
            window.scrollTo(0, 0);
          }, 1);
        }
      });
    }

  }
  // Drupal.behaviors.owlVideoGallery = {
  //   attach: function(context, settings) {
  //      if (Drupal.settings.owlVideo) {
  //        var setNav = false;
  //        var navItems = []
  //        if (Drupal.settings.owlVideo.count > 1) {
  //          setNav = true;
  //          navItems = ['<span class="icon icon-arrow-left valign-sub"></span> ', '<span class="icon icon-arrow-right valign-sub"></span>'];
  //        }
  //        var owlVideo = $(".owl-gallery-ryne-videos .view-content", context).owlCarousel({
  //          loop: false,
  //          items: 1,
  //          pagination: false,
  //          nav: setNav,
  //          navText: navItems,

  //        });

  //        $('.owl-vid-wrapper .play-button').on('click', function() {
  //          var videoURL = $(this).attr('data-video-url');
  //          console.log(videoURL);
  //          embedIframe = '<iframe width="100%" height="100%" src="' + videoURL + '" frameborder="0" allowfullscreen></iframe>';
  //          $(this).parent().html(embedIframe);
  //        });
  //      }
  //    }
  //  }
  //

  Drupal.behaviors.quickfit = {
    attach: function(context, settings) {
      $('.quickfit:visible').each(function() {
        $this = $(this);
        $span = $this.find('span');
        var divWidth = $this.width(),
          spanWidth = $span.width(),
          padding = parseInt($this.attr('data-padding')) || 20,
          curFontSize = parseInt($this.css('font-size')) || 16,
          maxFontSize = parseInt($this.attr('data-max-font'));
        if (spanWidth + (padding * 2) > divWidth) {
          while (spanWidth + (padding * 2) > divWidth) {
            curFontSize -= 3;
            $this.css('font-size', curFontSize + 'px');
            spanWidth = $span.width();

            if (curFontSize < 1) {
              return;
            }
          }
          curFontSize += 3;
          $this.css('font-size', curFontSize + 'px');
        } else if (spanWidth + (padding * 2) < divWidth) {
          while (spanWidth + (padding * 2) < divWidth) {
            curFontSize += 3;
            $this.css('font-size', curFontSize + 'px');
            spanWidth = $span.width();

            if (maxFontSize != 0 && curFontSize > maxFontSize) {
              return;
            }
          }
          while (spanWidth + (padding * 2) > divWidth) {
            curFontSize -= 3;
            $this.css('font-size', curFontSize + 'px');
            spanWidth = $span.width();
            if (curFontSize < 1) {
              return;
            }
          }
          curFontSize -= 3;
          $this.css('font-size', curFontSize + 'px');
        }
      });
    }
  }


  Drupal.behaviors.propertyPass = {
    attach: function(context, settings) {

      // check for cookie.
      // Need to do something if user changes passwords, so cookie
      // needs to be some type of hashed value that checks against live
      // pass value.

      $("#prop-pass-check", context).click(function() {


        if (settings.relaPPSSHash !== undefined) {
          if ($.cookie('rela_ppss') === null) {
            showPassPop();
          } else {
            var cooky = $.cookie('rela_ppss');
            if (cooky !== settings.relaPPSSHash) {
              showPassPop();
            }
          }
        }
      });

      function showPassPop() {
        $('body').addClass('ppss-required');
        $('#ajax-content-overlay').show();
        $('.overlay-header').hide();

        var $show = $('#prop-pass-show');

        $('#overlay-content-static').show();
        $('body').addClass('overlay-open');

        if ($show.attr('data-static-content')) {
          var target = $show.attr('data-static-content');
          $('#' + target).show().detach().appendTo('#overlay-content-static');
        }
        setTimeout(function() {
          $('#prop-pass-show').click();
        }, 200)


      }


      $('#prop-pass-show', context).click(function() {


      });
    }
  }

  Drupal.behaviors.multiGallery = {
    attach: function(context, settings) {
      var icon = '';

      if (typeof settings.multiGallerylazyloader !== 'undefined') {
        icon = Drupal.settings.multiGallerylazyloader.icon;
      }

      if ($('.multi-gallery-overlay').length) {

        $('.property-overlay-link-photos a').removeAttr('data').addClass('multi-gallery-open');
        $('.sticky-link-photos a').removeAttr('data').addClass('multi-gallery-open');



        $(".multi-gallery-image .inner", context).each(function(i) {
          $(this).parent().attr("data-pid", ++i - 1);

        });
      }

      $('.multi-gallery-open', context).click(function() {
        $('body').css('overflow', 'hidden').addClass('multi-is-gallery-open');
        $('.outside-menu-toggle.open').click();
        $('.multi-gallery-overlay').fadeIn();
        $(".multi-gallery-image .inner", context).each(function(i) {
          if (!$(this).hasClass('img-processed')) {
            var target = $(this);
            $('<img/>').attr('src', $(this).data('src')).on('load', function() {
              $(this).remove(); // prevent memory leaks as @benweet suggested
              target.css('background-image', "url(" + target.data('src') + ")").addClass('img-processed');
            });

          }
        });

        var nidTarget = $(this).attr('data-nid');
        var target = $('#gallery-' + nidTarget);
        $('.multi-gallery-overlay').scrollTop(0);
        if(target.length > 0) {
          $('.multi-gallery-overlay').animate({
            scrollTop: $(target).offset().top - $('.multi-gallery-overlay').offset().top,
          }, 1000);
        }
        return false;
      });

      $('.multi-gallery-close', context).click(function() {
        $('.multi-gallery-overlay').fadeOut();
        $('body').css('overflow', '').removeClass('multi-is-gallery-open');;
      });

      $('.multi-gallery-image', context).click(function() {
        $('.multi-gallery-overlay').fadeOut();
        $('body').css('overflow', '').removeClass('multi-is-gallery-open');;
      });

      $('.multi-gallery-overlay .gallery-item-preview', context).click(function() {
        var nidTarget = $(this).data('nid');

        var target = $('#gallery-' + nidTarget);

        $('.multi-gallery-overlay').animate({
          scrollTop: $(target).position().top,
        }, 1000);
      });
    }
  }

  // Static form is now used for all property lead submissions (both static
  // sites and Drupal-served pages) via property-static-forms.js and the
  // public API endpoint. No need to swap in the Drupal node form.

  /**
   * Static Lead Pop Trigger Handler.
   *
   * Uses localStorage instead of cookies for static property sites.
   * Replaces the $.cookie based handler in relas.js.
   */
  Drupal.behaviors.staticLeadPopTrigger = {
    attach: function(context, settings) {
      // Only attach handlers once, even if behavior runs multiple times
      if (this.processed) {
        return;
      }
      this.processed = true;

      var STORAGE_KEY = 'rela_leadpop';
      // Check if user is logged in (from Drupal settings).
      var isLoggedIn = settings.relaLeadPop && settings.relaLeadPop.isLoggedIn;
      var isTestMode = settings.relaLeadPop && settings.relaLeadPop.isTestMode;

      // Check for lpid param (email verification link).
      // If valid, save to localStorage to unlock access.
      var urlParams = new URLSearchParams(window.location.search);
      var lpidParam = urlParams.get('lpid');
      if (lpidParam && settings.relaPIDhash && lpidParam === settings.relaPIDhash) {
        // Valid email verification - save to localStorage.
        try {
          var stored = localStorage.getItem(STORAGE_KEY);
          var pids = stored ? JSON.parse(stored) : [];
          if (!Array.isArray(pids)) {
            pids = [];
          }
          var pid = settings.RelaProperty && settings.RelaProperty.nid;
          if (pid && pids.indexOf(String(pid)) === -1) {
            pids.push(String(pid));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pids));
          }
        }
        catch (e) {}
      }

      // Lead pop link click handler - shows the overlay with static lead pop content.
      // Moved from relas.js to consolidate lead pop functionality.
      // Attach this BEFORE the logged-in check so "Click for Price" always works.
      $('.lead-pop-link', context).click(function(e) {
        var $this = $(this);
        var delay = parseInt($this.attr('data-delay'), 10) || 0;
        var style = $this.data('style');

        // Prevent default link behavior
        e.preventDefault();
        e.stopPropagation();

        if ($('body').hasClass('ppss-required')) {
          return false;
        }

        setTimeout(function() {
          // Reset overlay classes
          $('.overlay-content').attr('class', 'overlay-content');

          // Apply style classes
          if (style !== undefined) {
            $('#ajax-content-overlay').removeClass().addClass(style);
          }

          // Show overlay
          $('#ajax-content-overlay').show();
          $('#overlay-content-static').show();
          $('body').addClass('overlay-open');

          // Handle static content
          var staticContent = $this.attr('data-static-content');
          if (staticContent) {
            var $target = $('#' + staticContent);

            // Handle nested structure: if target is lead-pop-replace,
            // the actual form is inside #exit-intent-wrapper
            if (staticContent === 'lead-pop-replace') {
              // Move the container and ensure it's visible
              if ($target.length > 0) {
                $target.show().detach().appendTo('#overlay-content-static');
                // Make sure the exit-intent-wrapper inside is visible
                var $formWrapper = $target.find('#exit-intent-wrapper');
                if ($formWrapper.length > 0) {
                  $formWrapper.show();
                }
              }
              else {
                console.warn('Lead pop target #lead-pop-replace not found');
              }
            }
            else if (staticContent === 'exit-intent-wrapper') {
              // Look for exit-intent-wrapper, possibly inside lead-pop-replace
              $target = $('#exit-intent-wrapper');
              if ($target.length === 0) {
                $target = $('#lead-pop-replace #exit-intent-wrapper');
              }
              if ($target.length > 0) {
                // If it's inside lead-pop-replace, move the parent container
                var $parent = $target.closest('#lead-pop-replace');
                if ($parent.length > 0) {
                  $parent.show().detach().appendTo('#overlay-content-static');
                  $target.show();
                }
                else {
                  $target.show().detach().appendTo('#overlay-content-static');
                }
              }
              else {
                console.warn('Lead pop target #exit-intent-wrapper not found');
              }
            }
            else {
              // Default: just move the target element
              if ($target.length > 0) {
                $target.show().detach().appendTo('#overlay-content-static');
              }
              else {
                console.warn('Lead pop target #' + staticContent + ' not found');
              }
            }
          }
        }, delay);

        return false;
      });

      // Don't show AUTO-TRIGGERED lead pop to logged-in users unless they're testing.
      // The click handler above still works so "Click for Price" can be manually triggered.
      if (isLoggedIn && !isTestMode) {
        return;
      }

      // Check if lead pop was completed for this property.
      function hasCompletedLeadPop(propertyId) {
        // If in test mode, clear any existing entry so popup shows.
        if (isTestMode) {
          try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              var pids = JSON.parse(stored);
              if (Array.isArray(pids)) {
                var pidIndex = pids.indexOf(String(propertyId));
                if (pidIndex !== -1) {
                  pids.splice(pidIndex, 1);
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(pids));
                }
              }
            }
          }
          catch (e) {}
          return false;
        }

        try {
          var stored = localStorage.getItem(STORAGE_KEY);
          if (!stored) {
            return false;
          }
          var pids = JSON.parse(stored);
          return Array.isArray(pids) && pids.indexOf(String(propertyId)) !== -1;
        }
        catch (e) {
          return false;
        }
      }

      // Lead pop check - runs on page load. Replaces PHP auto-click element.
      // Get settings from Drupal.settings.relaLeadPop instead of data attributes.
      (function() {
        if ($('body').hasClass('ppss-required')) {
          return;
        }

        var settings = Drupal.settings.relaLeadPop || {};
        var pid = settings.pid;
        var type = settings.type;

        if (!pid || !type) {
          return;
        }

        // Check localStorage instead of cookie.
        if (hasCompletedLeadPop(pid)) {
          // Already completed - show price if click-for-price type.
          if (type === 'click for price') {
            var price = $('.click-for-price').data('price');
            if (price) {
              $('.price-field').html(price);
            }
          }
          return;
        }

        // Handle each lead pop type.
        switch (type) {
          case 'forced registration':
          case 'timed':
            // These types auto-trigger with a delay (delay is in data-delay on the link).
            $('.lead-pop-link-auto').trigger('click');
            break;

          case 'exit intent':
            // Set up exit intent popup - triggers when user tries to leave.
            $('.lead-pop-exit').each(function() {
              if (typeof ddexitpop !== 'undefined') {
                ddexitpop.init({
                  contentsource: ['id', 'ph'],
                  fxclass: 'random',
                  displayfreq: 'always',
                  onddexitpop: function($popup) {
                    $('.lead-pop-exit').trigger('click');
                  }
                });
              }
            });
            break;

          case 'click for price':
            // Don't auto-trigger - user must click the price element.
            // The click handler for .click-for-price should trigger the popup.
            break;
        }
      })();
    }
  };

  Drupal.behaviors.unalteredImagePreview = {
    attach: function(context, settings) {
      var viewOriginalButton = null;
      var showingOriginal = false;
      var originalImageData = null; // Stores: {unalteredImageUrl, alteredImageUrl, alteredDescription}
      var isToggling = false; // Flag to track when we're programmatically toggling

      // Function to create/update the View Original button
      function updateViewOriginalButton(gallery) {
        if (!gallery || !gallery.currItem) {
          return;
        }

        // Get data from items array - PhotoSwipe stores custom properties there
        var currentIndex = gallery.getCurrentIndex();
        var itemData = gallery.items && gallery.items[currentIndex] ? gallery.items[currentIndex] : gallery.currItem;

        // Check which properties exist to determine button state
        var unalteredImageUrl = itemData.unaltered_image;
        var editedImageUrl = itemData.edited_image;
        // Get description - if edited_image exists, check edited_image_description
        // Otherwise use altered_description
        var alteredDescription = editedImageUrl
          ? (itemData.edited_image_description || '')
          : (itemData.altered_description || '');

        // If we're toggling and button already exists, don't recreate it
        if (isToggling && viewOriginalButton) {
          return;
        }

        // Remove existing button
        if (viewOriginalButton) {
          viewOriginalButton.remove();
          viewOriginalButton = null;
        }

        // Reset state when changing images (but not when we're toggling)
        if (!isToggling) {
          showingOriginal = false;
          originalImageData = null;
        }

        // Only show button if we have unaltered_image OR edited_image
        // (meaning this image can be toggled)
        if (unalteredImageUrl || editedImageUrl) {
          // Store description for overlay
          originalImageData = {
            alteredDescription: alteredDescription
          };

          // Determine button text based on which property exists
          // If unaltered_image exists, we're showing edited → button says "View Original Photo"
          // If edited_image exists, we're showing original → button says "Return to Edited Photo"
          var buttonText = unalteredImageUrl ? 'View Original Photo' : 'Return to Edited Photo';
          viewOriginalButton = $('<button class="pswp-view-original-button">' + buttonText + '</button>');
          var $ui = $('.pswp__ui');
          var $pswp = $('.pswp');

          if ($ui.length === 0 && $pswp.length === 0) {
            console.log('PhotoSwipe UI not found, retrying...');
            setTimeout(function() {
              updateViewOriginalButton(gallery);
            }, 200);
            return;
          }

          // Append to UI if available, otherwise append to pswp container
          if ($ui.length > 0) {
            $ui.append(viewOriginalButton);
          } else if ($pswp.length > 0) {
            $pswp.append(viewOriginalButton);
          }

          // Style the button
          viewOriginalButton.css({
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            zIndex: 10001,
            padding: '12px 24px',
            backgroundColor: '#8B5CF6', // Purple color like in the image
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'background-color 0.2s',
            display: 'block',
            visibility: 'visible',
            opacity: '1'
          });

          // Ensure button is visible even if UI is hidden initially
          viewOriginalButton.addClass('pswp-view-original-button-visible');

          // Hover effect
          viewOriginalButton.on('mouseenter', function() {
            $(this).css('backgroundColor', '#7C3AED');
          }).on('mouseleave', function() {
            $(this).css('backgroundColor', '#8B5CF6');
          });

          // Click handler
          viewOriginalButton.on('click', function(e) {
            e.stopPropagation();
            toggleImage(gallery);
          });

          // If edited_image exists, we're showing the original - show overlay if description exists
          if (editedImageUrl && alteredDescription) {
            $('.unaltered-image-description-overlay').remove();
            var overlayHtml = '<div class="unaltered-image-description-overlay">';
            overlayHtml += '<div class="description-title">Description of Changes</div>';
            overlayHtml += '<div class="description-text">' + $('<div>').text(alteredDescription).html() + '</div>';
            overlayHtml += '</div>';

            var $overlay = $(overlayHtml);
            $('.pswp__ui').append($overlay);

            // Style the overlay
            $overlay.css({
              position: 'absolute',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10001,
              maxWidth: '90%',
              width: 'auto',
              color: '#fff',
              textAlign: 'center',
              padding: '20px 30px',
              background: 'rgba(0,0,0,0.8)',
              borderRadius: '4px'
            });

            $overlay.find('.description-title').css({
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            });

            $overlay.find('.description-text').css({
              fontSize: '16px',
              lineHeight: '1.6',
              maxWidth: '1200px',
              margin: '0 auto'
            });
          }
        }
      }

      // Function to toggle between altered and original images
      function toggleImage(gallery) {
        if (!gallery || !gallery.currItem) {
          return;
        }

        var currentIndex = gallery.getCurrentIndex();
        var itemData = gallery.items && gallery.items[currentIndex] ? gallery.items[currentIndex] : gallery.currItem;

        // Set flag to prevent afterChange from resetting state
        isToggling = true;

        var newSrc;
        var newButtonText;
        var showOverlay = false;

        if (itemData.unaltered_image) {
          // Currently showing edited image, switching to original
          // Save current src as edited_image
          itemData.edited_image = itemData.src;
          // Save altered_description so we can restore it later
          if (itemData.altered_description) {
            itemData.edited_image_description = itemData.altered_description;
          }
          // Switch to original
          newSrc = itemData.unaltered_image;
          // Delete unaltered_image (we'll restore it when switching back)
          delete itemData.unaltered_image;
          newButtonText = 'Return to Edited Photo';
          showingOriginal = true;
          showOverlay = true;
        } else if (itemData.edited_image) {
          // Currently showing original image, switching back to edited
          // Save current src as unaltered_image (restore it)
          itemData.unaltered_image = itemData.src;
          // Restore altered_description from edited_image_description
          if (itemData.edited_image_description) {
            itemData.altered_description = itemData.edited_image_description;
            delete itemData.edited_image_description;
          }
          // Switch to edited
          newSrc = itemData.edited_image;
          // Delete edited_image (we'll restore it when switching back)
          delete itemData.edited_image;
          newButtonText = 'View Original Photo';
          showingOriginal = false;
          showOverlay = false;
        } else {
          // Neither exists - shouldn't happen, but bail out
          isToggling = false;
          return;
        }

        // Update all PhotoSwipe item references
        itemData.src = newSrc;
        itemData.msrc = newSrc;
        itemData.loaded = false;
        itemData.loadError = false;

        if (itemData.o) {
          itemData.o.src = newSrc;
        }

        // Update currItem
        gallery.currItem.src = newSrc;
        gallery.currItem.msrc = newSrc;
        gallery.currItem.loaded = false;
        gallery.currItem.loadError = false;
        if (gallery.currItem.o) {
          gallery.currItem.o.src = newSrc;
        }

        // Update items array
        if (gallery.items && gallery.items[currentIndex]) {
          gallery.items[currentIndex].src = newSrc;
          gallery.items[currentIndex].msrc = newSrc;
          gallery.items[currentIndex].loaded = false;
          gallery.items[currentIndex].loadError = false;
          if (gallery.items[currentIndex].o) {
            gallery.items[currentIndex].o.src = newSrc;
          }
          // Also update the properties on items array to keep in sync
          if (itemData.unaltered_image) {
            gallery.items[currentIndex].unaltered_image = itemData.unaltered_image;
            delete gallery.items[currentIndex].edited_image;
            delete gallery.items[currentIndex].edited_image_description;
            // Restore altered_description if it was stored
            if (itemData.altered_description) {
              gallery.items[currentIndex].altered_description = itemData.altered_description;
            }
          } else if (itemData.edited_image) {
            gallery.items[currentIndex].edited_image = itemData.edited_image;
            delete gallery.items[currentIndex].unaltered_image;
            // Preserve description when showing original
            if (itemData.edited_image_description) {
              gallery.items[currentIndex].edited_image_description = itemData.edited_image_description;
            }
            // Clear altered_description when showing original (it's stored in edited_image_description)
            delete gallery.items[currentIndex].altered_description;
          }
        }

        // Update button text
        if (viewOriginalButton) {
          viewOriginalButton.text(newButtonText);
        }

        // Handle overlay
        $('.unaltered-image-description-overlay').remove();
        // When showing original, get description from edited_image_description
        var descriptionToShow = showOverlay
          ? (itemData.edited_image_description || '')
          : (originalImageData && originalImageData.alteredDescription ? originalImageData.alteredDescription : '');
        if (showOverlay && descriptionToShow) {
          var overlayHtml = '<div class="unaltered-image-description-overlay">';
          overlayHtml += '<div class="description-title">Description of Changes</div>';
          overlayHtml += '<div class="description-text">' + $('<div>').text(descriptionToShow).html() + '</div>';
          overlayHtml += '</div>';

          var $overlay = $(overlayHtml);
          $('.pswp__ui').append($overlay);

          // Style the overlay
          $overlay.css({
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10001,
            maxWidth: '90%',
            width: 'auto',
            color: '#fff',
            textAlign: 'center',
            padding: '20px 30px',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: '4px'
          });

          $overlay.find('.description-title').css({
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          });

          $overlay.find('.description-text').css({
            fontSize: '16px',
            lineHeight: '1.6',
            maxWidth: '1200px',
            margin: '0 auto'
          });
        }

        // Update DOM and refresh PhotoSwipe
        gallery.invalidateCurrItems();

        var $img = $('.pswp__item--current .pswp__img');
        if ($img.length) {
          $img.attr('src', newSrc);
        }

        gallery.updateSize(true);

        // Reset flag after a short delay to allow afterChange to fire
        setTimeout(function() {
          isToggling = false;
        }, 100);
      }

      // Function to setup gallery listeners
      function setupGalleryListeners(gallery) {
        if (!gallery || gallery._relaOriginalButtonSetup) {
          return;
        }

        // Wait for UI to be visible before adding button
        gallery.listen('firstUpdate', function() {
          setTimeout(function() {
            updateViewOriginalButton(gallery);
          }, 100);
        });

        // Update button when image changes (but not when we're toggling)
        gallery.listen('afterChange', function() {
          if (!isToggling) {
            showingOriginal = false;
            originalImageData = null;
            $('.unaltered-image-description-overlay').remove();
            setTimeout(function() {
              updateViewOriginalButton(gallery);
            }, 50);
          }
          // Note: When toggling, button text is updated directly in toggleImage()
        });

        // Clean up when gallery closes
        gallery.listen('close', function() {
          if (viewOriginalButton) {
            viewOriginalButton.remove();
            viewOriginalButton = null;
          }
          $('.unaltered-image-description-overlay').remove();
          showingOriginal = false;
          originalImageData = null;
        });

        gallery._relaOriginalButtonSetup = true;
      }

      // Listen for PhotoSwipe gallery initialization
      $(document).on('pswp:init', function() {
        var gallery = Drupal.settings.RelaProperty.currentPSgallery;
        if (gallery) {
          setupGalleryListeners(gallery);
          // Try to update button after a delay to ensure UI is ready
          setTimeout(function() {
            updateViewOriginalButton(gallery);
          }, 500);
        }
      });

      // Also check if gallery already exists (for page loads where gallery is already open)
      setTimeout(function() {
        if (Drupal.settings.RelaProperty && Drupal.settings.RelaProperty.currentPSgallery) {
          var gallery = Drupal.settings.RelaProperty.currentPSgallery;
          setupGalleryListeners(gallery);
          updateViewOriginalButton(gallery);
        }
      }, 200);
    }
  };

  /**
   * Tracked download handler for brochures and documents.
   *
   * Uses direct S3 URLs for static site compatibility.
   * Fires Plausible analytics event before opening download.
   */
  Drupal.behaviors.trackedDownloads = {
    attach: function(context, settings) {
      $('.rela-tracked-download', context).once('rela-dl-handler').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $link = $(this);
        var downloadUrl = $link.attr('data-download-url');
        var downloadType = $link.attr('data-download-type');
        var downloadNid = $link.attr('data-download-nid');

        // Fire Plausible event if available.
        if (typeof plausible !== 'undefined') {
          var props = {};
          props[downloadType + '_download_nid'] = downloadNid;
          plausible('pageview', {props: props});
        } else {
          console.warn('Plausible not defined - event not sent');
        }

        // Open download in new window.
        if (downloadUrl) {
          window.open(downloadUrl, '_blank');
        }

        return false;
      });
    }
  };

  Drupal.behaviors.rubikAttributionWaypoint = {
    attach: function(context, settings) {
      // Add waypoint for Rubik themes attribution link
      if ($('body').hasClass('property-template-rubik') || $('body').hasClass('property-template-rubik_v2')) {
        var $overview = $('#overview');
        if ($overview.length > 0) {
          // Show attribution when scrolling past overview section
          $overview.waypoint(function(direction) {
            if (direction == 'down') {
              $('body').addClass('show-attribution');
            }
          }, {
            offset: 'bottom-in-view'
          });

          // Hide attribution when scrolling back up past overview
          $overview.waypoint(function(direction) {
            if (direction == 'up') {
              $('body').removeClass('show-attribution');
            }
          }, {
            offset: '100%'
          });
        }
      }
    }
  };
  Drupal.behaviors.RelaOpenHouseRefresh = {
    attach: function(context, settings) {
      if (context !== document) {
        return;
      }
      // Check if any open houses on the page have expired.
      var today = new Date();
      var hasExpired = false;
      $('[data-oh-end]').each(function() {
        var endIso = $(this).attr('data-oh-end');
        if (endIso && new Date(endIso) < today) {
          hasExpired = true;
          return false;
        }
      });

      if (!hasExpired) {
        return;
      }

      // Ping server to queue a static site regen.
      var pnid = null;
      try {
        pnid = settings.RelaProperty && settings.RelaProperty.nid;
      } catch(e) {}
      if (!pnid) {
        var $form = $('#property-lead-form.form-ph');
        if ($form.length) {
          pnid = $form.attr('pnid');
        }
      }
      if (!pnid) {
        return;
      }

      var storageKey = '_oh_refresh_' + pnid;
      try {
        var last = localStorage.getItem(storageKey);
        if (last && (new Date().getTime() - parseInt(last, 10)) < 86400000) {
          return;
        }
      } catch(e) {}

      var apiBase = $('body').data('api-base') || '';
      try {
        $.ajax({
          url: apiBase + '/api/v1/public/refresh-static/' + pnid,
          type: 'POST',
          dataType: 'json'
        });
        localStorage.setItem(storageKey, new Date().getTime().toString());
      } catch(e) {}
    }
  };

  // Canonical tabbed media (relaz_property_tabs output).
  // Delegated click: toggle is-active on tab + matching panel. Scoped to
  // direct children of the clicked tab's wrapper so nested .property-tabs
  // inside a panel don't interfere with the outer group and vice versa.
  Drupal.behaviors.relaPropertyTabs = {
    attach: function(context) {
      $(context).on('click.propertyTabs', '.property-tabs__tab', function(e) {
        var $tab = $(this);
        var $list = $tab.parent('.property-tabs__list');
        var $wrap = $list.parent('.property-tabs');
        var target = $tab.attr('data-tab');
        if (!target || !$wrap.length) { return; }

        $list.children('.property-tabs__tab')
          .removeClass('is-active')
          .attr('aria-selected', 'false');

        $wrap.children('.property-tabs__panels')
          .children('.property-tabs__panel')
          .removeClass('is-active');

        $tab.addClass('is-active').attr('aria-selected', 'true');
        $wrap.children('.property-tabs__panels')
          .children('.property-tabs__panel[data-panel="' + target + '"]')
          .addClass('is-active');
      });
    }
  };

  // Client-side vtour modal — replaces the /relajax/.../vtour-modal/<type>
  // and /relajax/.../vtour-modal-single/<nid> Drupal AJAX endpoints, which
  // 405 on statically-published property sites. Tour data is emitted as
  // Drupal.settings.relaVtours by relaz_emit_vtour_settings() in template.php.
  Drupal.behaviors.vtourStaticModal = {
    attach: function (context, settings) {
      if (this.processed) {
        return;
      }
      this.processed = true;

      function buildIframe(url, nid) {
        var nidClass = nid ? ' vtour-nid-' + nid : '';
        return '<iframe title="3D Virtual Tour" scrolling="no" id="frame-vtour" data-vtour-url="' + url + '" class="vtour-frame' + nidClass + '" width="100%" height="100%" src="' + url + '" frameborder="0" allowfullscreen></iframe>';
      }

      function buildTabs(tours) {
        var html = '<div id="vtabs-wrapper" class="text-center col-xs-12 no-gutter"><div class="text-center btn-group" role="group">';
        $.each(tours, function (i, tour) {
          html += '<div class="vtab btn ' + (i === 0 ? 'vtab-active' : '') + '" data-tour-nid="' + tour.nid + '" data-tour-url="' + tour.url + '">';
          html += '<div class="vtitle">' + tour.title + '</div>';
          html += '<i class="vtab-icon icon icon-arrow-65"></i>';
          html += '</div>';
        });
        html += '</div></div>';
        return html;
      }

      function openOverlay(html) {
        var $overlay = $('#ajax-content-overlay');
        // Clear any sizing class a previous overlay left on the root. The
        // 16:9 box comes from the inner #vtour-embed-wrapper.overlay-sixteen-nine
        // — never the full-screen overlay root. Putting overlay-sixteen-nine
        // on the root injects a giant aspect-ratio :before spacer that shoves
        // the iframe to the bottom of the viewport.
        $overlay.removeClass('overlay-sixteen-nine modal-video modal-fullscreen overlay-wide');
        $overlay.find('.overlay-content')
          .html(html)
          .addClass('overlay-lg');
        $overlay.show();
        $('body').addClass('overlay-open');
      }

      function openTours(tours) {
        if (!tours || !tours.length) {
          openOverlay('<p class="p-3 text-center">No virtual tours available.</p>');
          return;
        }
        var html = '';
        if (tours.length > 1) {
          html += buildTabs(tours);
        }
        html += '<div id="vtour-embed-wrapper" class="overlay-sixteen-nine"><div class="aspect-ratio-content">' + buildIframe(tours[0].url, tours[0].nid) + '</div></div>';
        openOverlay(html);
      }

      $('body').on('click', '.vtour-modal-trigger', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);
        var singleNid = $this.attr('data-vtour-single');
        var singleUrl = $this.attr('data-vtour-url');

        // Per-tour preview link (gallery thumbs).
        if (singleNid && singleUrl) {
          var html = '<div id="vtour-embed-wrapper" class="overlay-sixteen-nine"><div class="aspect-ratio-content">' + buildIframe(singleUrl, singleNid) + '</div></div>';
          openOverlay(html);
          return false;
        }

        // Property-level branded/unbranded link.
        var propertyNid = $this.attr('data-vtour-property');
        var type = $this.attr('data-vtour-type') || 'branded';
        var byProperty = settings.relaVtours && settings.relaVtours[propertyNid];
        var tours = byProperty ? (byProperty[type] || byProperty.branded || byProperty.unbranded) : null;
        openTours(tours);
        return false;
      });

      // Tab switching inside the vtour modal — swap the iframe src in place
      // so the user can flip between branded/unbranded or multiple tours
      // without reloading the overlay.
      $('body').on('click', '#vtabs-wrapper .vtab', function () {
        var $tab = $(this);
        var url = $tab.attr('data-tour-url');
        var nid = $tab.attr('data-tour-nid');
        if (!url) {
          return;
        }
        $tab.addClass('vtab-active').siblings().removeClass('vtab-active');
        var $iframe = $('#frame-vtour');
        $iframe
          .attr('src', url)
          .attr('data-vtour-url', url)
          .attr('class', 'vtour-frame vtour-nid-' + nid);
      });
    }
  };

})(jQuery, Drupal);
