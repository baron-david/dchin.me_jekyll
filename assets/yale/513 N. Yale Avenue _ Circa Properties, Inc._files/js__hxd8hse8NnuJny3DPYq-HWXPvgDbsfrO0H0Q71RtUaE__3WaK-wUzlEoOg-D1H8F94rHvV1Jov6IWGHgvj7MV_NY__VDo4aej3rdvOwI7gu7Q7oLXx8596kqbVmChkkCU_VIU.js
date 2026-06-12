(function($, Drupal, PhotoSwipe, PhotoSwipeUI_Default) {
  Drupal.behaviors.photoswipe = {
    /**
     * PhotoSwipe Options, coming from Drupal.settings.
     */
    photoSwipeOptions: {},
    /**
     * Instantiated galleries.
     */
    galleries: [],
    /**
     * Load PhotoSwipe once page is ready
     */
    attach: function(context, settings) {
      // Send to GA.
      function psSendToGA(category, action, label, value) {
        if (typeof ga != 'undefined') {
          if (label === undefined) {
            label = 0;
          }


          if (value === undefined) {
            value = 0;
          }

          ga('send', {
            'hitType': 'event',
            'eventCategory': category,
            'eventAction': action,
            'eventLabel': label,
            'eventValue': value
          });
        }
      }

      this.photoSwipeOptions = settings.photoswipe ? settings.photoswipe.options : {};

      var images = [];
      if (settings.RelaProperty !== undefined) {
        if (settings.RelaProperty.DLRestricted == true) {
          $('body').addClass('nodl');
        }
        else {
         $('body').removeClass('nodl');
        }

        PSImages = settings.RelaProperty.imageListPS[settings.RelaProperty.nid];
        Object.keys(PSImages).forEach(function(key) {
          image = {};

          image['src'] = PSImages[key]['url'];
          image['w'] = PSImages[key]['w'];
          image['h'] = PSImages[key]['h'];
          image['title'] = PSImages[key]['title'];
          image['pid'] = PSImages[key]['pid'];
          image['property'] = PSImages[key]['property'];
          // Include unaltered_image and altered_description if they exist
          if (PSImages[key]['unaltered_image']) {
            image['unaltered_image'] = PSImages[key]['unaltered_image'];
          }
          if (PSImages[key]['altered_description'] !== undefined) {
            image['altered_description'] = PSImages[key]['altered_description'];
          }
          images.push(image);
        });
      }

      var floorplans = [];
      if (settings.RelaPropertyFloorplan !== undefined) {
        PSFloorplans = settings.RelaPropertyFloorplan.floorplanListPS;

        if (settings.RelaPropertyFloorplan.DLRestricted == true) {
          $('body').addClass('nodl');
        }
        else {
          $('body').removeClass('nodl');
        }

        Object.keys(PSFloorplans).forEach(function(key) {
          image = {};

          image['src'] = PSFloorplans[key]['url'];
          image['w'] = PSFloorplans[key]['w'];
          image['h'] = PSFloorplans[key]['h'];
          image['title'] = PSFloorplans[key]['title'];
          image['pid'] = PSFloorplans[key]['pid'];
          image['property'] = PSFloorplans[key]['property'];
          floorplans.push(image);
        });
      }

      if (!images.length && !floorplans.length) {
        return;
      }

      // define options (if needed)
      var options = {
        index: 0,
        bgOpacity: 1,
        closeOnScroll: false,
        clickToCloseNonZoomable: false,
        tapToClose: false,
        closeElClasses: [],
        galleryPIDs: true,
        shareEl: false,
      };

      var ssRunning = false,
        ssOnce = false,
        ssDelay = 4500 /*ms*/ ,
        ssButtonClass = '.pswp-custom-button--playpause';

      var gallery = null;
      // Initializes and opens PhotoSwipe
      $('[data="ps-open"]', context).click(function() {
        var pswpElement = document.querySelectorAll('.pswp')[0];

        options['index'] = 0;
        var pid = $(this).attr('data-pid');
        if (pid !== undefined) {
          options['index'] = parseInt(pid);
        }

        var content = images;

        if ($(this).hasClass('floorplan-gallery-link')) {
          content = floorplans;
          $('.pswp-custom-button--photogrid').hide();
        }
        else {
          $('.pswp-custom-button--photogrid').show();
        }


        gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, content, options);

        /* not running from the start */
        setSlideshowState(ssButtonClass, false);
        // start timer for the next slide in slideshow after prior image has loaded

        gallery.init();

        $(pswpElement).data('pswp', gallery);

        psSendToGA('Images', gallery.currItem.property, gallery.currItem.pid, 0);
        gallery.listen('afterChange', function() {
          if (ssRunning && ssOnce) {
            ssOnce = false;
            setTimeout(gotoNextSlide, ssDelay);
          }
          psSendToGA('Images', gallery.currItem.property, gallery.currItem.pid, 0);
        });

        Drupal.settings.RelaProperty.currentPSgallery = gallery;
        // Trigger custom event for other scripts to hook into
        $(document).trigger('pswp:init');
        gallery.listen('close', function() {
          $('body').removeClass('ps-grid-open');
          $('#pspw-gallery-thumbs').hide();
        });
        return false;
      })

      // $('div[data="ps-open"]', context).click(function() {
      //   var pswpElement = document.querySelectorAll('.pswp')[0];

      //   options['index'] = 0;
      //   var pid = $(this).attr('data-pid');
      //   if (pid !== undefined) {
      //     options['index'] = parseInt(pid);
      //   }

      //   gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, images, options);

      //   /* not running from the start */
      //   setSlideshowState(ssButtonClass, false );
      //   // start timer for the next slide in slideshow after prior image has loaded

      //   gallery.init();

      //   $(pswpElement).data('pswp', gallery);

      //   psSendToGA('Images', gallery.currItem.property, gallery.currItem.pid, 0);
      //   gallery.listen('afterChange', function() {
      //     if (ssRunning && ssOnce) {
      //       ssOnce = false;
      //       setTimeout(gotoNextSlide, ssDelay);
      //     }
      //     psSendToGA('Images', gallery.currItem.property, gallery.currItem.pid, 0);
      //   });
      //   Drupal.settings.RelaProperty.currentPSgallery = gallery;

      //   gallery.listen('close', function() {
      //     $('body').removeClass('ps-grid-open');
      //     $('#pspw-gallery-thumbs').hide();
      //     if ($('#gallery-thumbs-ph').length > 0) {
      //       $('#gallery-thumbs-ph').hide();
      //     }
      //   });

      //   return false;
      // })

      /* slideshow management */
      $(ssButtonClass, context).on('click tap', function(e) {
        // toggle slideshow on/off
        setSlideshowState(this, !ssRunning);

      });

      $('.pswp-custom-button--photogrid', context).click(function(){
        if (Drupal.settings.RelaProperty) {
          if ($('body').hasClass('ps-grid-open')) {
            $('body').removeClass('ps-grid-open');
            $('#pspw-gallery-thumbs').hide();
            window.dispatchEvent(new Event('resize'));
          }
          else {
            $('body').addClass('ps-grid-open');
            $('#pspw-gallery-thumbs').show();

            // Multi-gallery: replace thumb sources on first open.
            if (!$('body').hasClass('ps-grid-processed')) {
              $('body').addClass('ps-grid-processed');
              if (typeof settings.multiGallerylazyloader !== 'undefined') {
                $('#pspw-gallery-thumbs .thumb img', context).each(function(){
                  var pswp_pid = $(this).parent().data('pid');
                  var img_replace = $(".multi-gallery-image[data-pid='" + pswp_pid + "'] .inner").data('src');
                  $(this).attr('src', img_replace);
                });
              }
            }

            window.dispatchEvent(new Event('resize'));
          }
        }
      });

      $('#pspw-close-thumbs', context).click(function(){
         $('body').removeClass('ps-grid-open');
         $('#pspw-gallery-thumbs').hide();
         window.dispatchEvent(new Event('resize'));
      });


      $('#pspw-gallery-thumbs .thumb').unbind('click');
      $('#pspw-gallery-thumbs .thumb').click(function(){
        var thumbIndex = $(this).data('pid');
        var currentGal = settings.RelaProperty.currentPSgallery
        currentGal.goTo(parseInt(thumbIndex));
      });

      function setSlideshowState(el, running) {
        if (running) {
          $(ssButtonClass + ' i').removeClass('fa-play');
          $(ssButtonClass + ' i').addClass('fa-pause');
          setTimeout(gotoNextSlide, ssDelay / 2.0 /* first time wait less */ );
        }
        else {
          $(ssButtonClass + ' i').addClass('fa-play');
          $(ssButtonClass + ' i').removeClass('fa-pause');
        }
        var title = running ? "Pause Slideshow" : "Play Slideshow";
        // $(el).removeClass(running ? "play" : "pause") // change icons defined in css
        //   .addClass(running ? "pause" : "play")
        //   .prop('title', title);
        ssRunning = running;
      }

      function gotoNextSlide() {
        if (ssRunning && !!gallery) {
          ssOnce = true;
          var n = '.pswp__scroll-wrap';
          $(n).addClass("animated fadeOut");
          setTimeout(function() {
            $(n).addClass("invisible").removeClass("animated fadeOut");
            gallery.next();
            $(n).removeClass("invisible").addClass("animated fadeIn");
            setTimeout(function() {
              $(n).removeClass("animated fadeIn");
            }, 700)
            }, 700)
          //gallery.next();
          // start counter for next slide in 'afterChange' listener
        }
      }

    },
    /**
     * Triggers when user clicks on thumbnail.
     *
     * Code taken from http://photoswipe.com/documentation/getting-started.html
     * and adjusted accordingly.
     */
    onThumbnailsClick: function(e) {
      e = e || window.event;

      e.preventDefault ? e.preventDefault() : e.returnValue = false;

      var $clickedGallery = $(this);

      var eTarget = e.target || e.srcElement;
      var $eTarget = $(eTarget);

      // find root element of slide
      var clickedListItem = $eTarget.closest('.photoswipe');

      if (!clickedListItem) {

        return;
      }

      // get the index of the clicked element
      index = clickedListItem.index('.photoswipe');

      if (index >= 0) {
        // open PhotoSwipe if valid index found
        Drupal.behaviors.photoswipe.openPhotoSwipe(index, $clickedGallery);
      }
      return false;
    },
    /**
     * Code taken from http://photoswipe.com/documentation/getting-started.html
     * and adjusted accordingly.
     */
    openPhotoSwipe: function(index, galleryElement, options) {
      var pswpElement = $('.pswp')[0];
      var images = [];
      options = options || Drupal.behaviors.photoswipe.photoSwipeOptions;

      var images = galleryElement.find('a.photoswipe');
      images.each(function(index) {
        var $image = $(this);
        size = $image.data('size') ? $image.data('size').split('x') : ['', ''];
        images.push({
          src: $image.attr('href'),
          w: size[0],
          h: size[1],
          title: $image.data('overlay-title')
        });
      })

      // define options
      options.index = index;
      // define gallery index (for URL)
      options.galleryUID = galleryElement.data('pswp-uid');

      // Pass data to PhotoSwipe and initialize it
      var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, images, options);
      gallery.init();
      this.galleries.push(gallery);
      $(pswpElement).data('pswp', gallery);
    },
    /**
     * Parse picture index and gallery index from URL (#&pid=1&gid=2)
     *
     * Code taken from http://photoswipe.com/documentation/getting-started.html
     * and adjusted accordingly.
     */
    parseHash: function() {
      var hash = window.location.hash.substring(1),
        params = {};

      if (hash.length < 5) {
        return params;
      }

      var vars = hash.split('&');
      for (var i = 0; i < vars.length; i++) {
        if (!vars[i]) {
          continue;
        }
        var pair = vars[i].split('=');
        if (pair.length < 2) {
          continue;
        }
        params[pair[0]] = pair[1];
      }

      if (params.gid) {
        params.gid = parseInt(params.gid, 10);
      }

      if (!params.hasOwnProperty('pid')) {
        return params;
      }
      params.pid = parseInt(params.pid, 10);

      return params;
    }
  };
})(jQuery, Drupal, PhotoSwipe, PhotoSwipeUI_Default);
;/*})'"*/;/*})'"*/
(function(){
  var fnIndex = 0;
  var fnSwitch = {};
  var fnList = {};
  var breakpoints = [];

    function setSwitch() {
      var onItems = fnSwitch[breaky.value].on;
      var onItemsLength = onItems.length;
      var offItems = fnSwitch[breaky.value].off;
      var offItemsLength = offItems.length;

      for ( var i = 0; i < onItemsLength; i++ ) {
        if(!fnList[onItems[i]].active) {
          fnList[onItems[i]].fn();
          fnList[onItems[i]].active = true;
        }
      }
      for ( var i = 0; i < offItemsLength; i++ ) {
        fnList[offItems[i]].active = false;
      }
    }

     function readValue( el ) {
      return window.getComputedStyle(
          document.querySelector(el), ':before'
        ).getPropertyValue( 'content' ).replace( /\"/g, '' ).replace( /\'/g, '' );
    }

    function appendFunction( fn ) {
      fnIndex++;
      fnList[fnIndex] = {};
      fnList[fnIndex]["fn"] = fn;
      fnList[fnIndex]["active"] = false;
    }
    function indexOf (collection, value) {
        if (Array.prototype.indexOf) {
            return collection.indexOf( value );
        }
        for (var i = 0, l = collection.length; i < l; i++) {
            if(value === collection[i]) {
                return i;
            }
        }
    }
    function connectFunction( view1, direction, view2 ) {
      var viewIndex1 = indexOf(breakpoints, view1);
      var viewIndex2 = indexOf(breakpoints, view2);

      for( var i = 0; i < breakpoints.length; i++ ) {
          if( i == viewIndex1 && direction == "at"
          || i <= viewIndex1 && direction == "below"
          || i >= viewIndex1 && direction == "above"
          || viewIndex1 <= i && i <= viewIndex2 &&  direction == "between" ) {
            fnSwitch[breakpoints[i]].on.push( fnIndex );
          } else {
            fnSwitch[breakpoints[i]].off.push( fnIndex );
          }
      }
      setSwitch();
    }

    function createFnSwitch() {
      breakpointsLength = breakpoints.length;
      for(var i = 0; i < breakpointsLength; i++ ) {
        fnSwitch[breakpoints[i]] = {};
        fnSwitch[breakpoints[i]].on = [];
        fnSwitch[breakpoints[i]].off = [];
      }
    }

    function connectAndAppendFn( fn, view1, direction, view2 ) {
      appendFunction( fn );
      connectFunction( view1, direction, view2 );
    }

    window.breaky = {
      below: function( view, fn ) {
        connectAndAppendFn( fn, view, "below" );
      },
      above: function( view, fn ) {
        connectAndAppendFn( fn, view, "above" );
      },
      between: function( view1, view2, fn ) {
        connectAndAppendFn( fn, view1, "between", view2 );
      },
      at : function( view, fn ) {
        connectAndAppendFn( fn, view, "at" );
      },
      initIE8 : function(bp, value) {
          if(!window.getComputedStyle) {
            breakpoints = bp;
            createFnSwitch();
            breaky.value = value;
          }
      },
      init : function() {
        breakpoints = readValue( "html" ).split( "," );
        createFnSwitch();
        breaky.value = readValue( "body" );
        window.onresize = function () {
          if(breaky.value !== readValue( "body" )) {
            breaky.value = readValue( "body" );
            setSwitch();
          }
        }
      }
     }
    if(window.getComputedStyle) {
      breaky.init();
    }
})();
;/*})'"*/;/*})'"*/
/**
 * @file
 * bootstrap.js
 *
 * Provides general enhancements and fixes to Bootstrap's JS files.
 */

var Drupal = Drupal || {};

(function($, Drupal){
  "use strict";

  Drupal.behaviors.bootstrap = {
    attach: function(context) {
      // Provide some Bootstrap tab/Drupal integration.
      $(context).find('.tabbable').once('bootstrap-tabs', function () {
        var $wrapper = $(this);
        var $tabs = $wrapper.find('.nav-tabs');
        var $content = $wrapper.find('.tab-content');
        var borderRadius = parseInt($content.css('borderBottomRightRadius'), 10);
        var bootstrapTabResize = function() {
          if ($wrapper.hasClass('tabs-left') || $wrapper.hasClass('tabs-right')) {
            $content.css('min-height', $tabs.outerHeight());
          }
        };
        // Add min-height on content for left and right tabs.
        bootstrapTabResize();
        // Detect tab switch.
        if ($wrapper.hasClass('tabs-left') || $wrapper.hasClass('tabs-right')) {
          $tabs.on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
            bootstrapTabResize();
            if ($wrapper.hasClass('tabs-left')) {
              if ($(e.target).parent().is(':first-child')) {
                $content.css('borderTopLeftRadius', '0');
              }
              else {
                $content.css('borderTopLeftRadius', borderRadius + 'px');
              }
            }
            else {
              if ($(e.target).parent().is(':first-child')) {
                $content.css('borderTopRightRadius', '0');
              }
              else {
                $content.css('borderTopRightRadius', borderRadius + 'px');
              }
            }
          });
        }
      });
    }
  };

  /**
   * Bootstrap Popovers.
   */
  Drupal.behaviors.bootstrapPopovers = {
    attach: function (context, settings) {
      if (settings.bootstrap && settings.bootstrap.popoverEnabled) {
        var elements = $(context).find('[data-toggle="popover"]').toArray();
        for (var i = 0; i < elements.length; i++) {
          var $element = $(elements[i]);
          var options = $.extend(true, {}, settings.bootstrap.popoverOptions, $element.data());
          $element.popover(options);
        }
      }
    }
  };

  /**
   * Bootstrap Tooltips.
   */
  Drupal.behaviors.bootstrapTooltips = {
    attach: function (context, settings) {
      if (settings.bootstrap && settings.bootstrap.tooltipEnabled) {
        var elements = $(context).find('[data-toggle="tooltip"]').toArray();
        for (var i = 0; i < elements.length; i++) {
          var $element = $(elements[i]);
          var options = $.extend(true, {}, settings.bootstrap.tooltipOptions, $element.data());
          $element.tooltip(options);
        }
      }
    }
  };

  /**
   * Anchor fixes.
   */
  var $scrollableElement = $();
  Drupal.behaviors.bootstrapAnchors = {
    attach: function(context, settings) {
      var i, elements = ['html', 'body'];
      if (!$scrollableElement.length) {
        for (i = 0; i < elements.length; i++) {
          var $element = $(elements[i]);
          if ($element.scrollTop() > 0) {
            $scrollableElement = $element;
            break;
          }
          else {
            $element.scrollTop(1);
            if ($element.scrollTop() > 0) {
              $element.scrollTop(0);
              $scrollableElement = $element;
              break;
            }
          }
        }
      }
      if (!settings.bootstrap || !settings.bootstrap.anchorsFix) {
        return;
      }
      var anchors = $(context).find('a').toArray();
      for (i = 0; i < anchors.length; i++) {
        if (!anchors[i].scrollTo) {
          this.bootstrapAnchor(anchors[i]);
        }
      }
      $scrollableElement.once('bootstrap-anchors', function () {
        $scrollableElement.on('click.bootstrap-anchors', 'a[href*="#"]:not([data-toggle],[data-target])', function(e) {
          this.scrollTo(e);
        });
      });
    },
    bootstrapAnchor: function (element) {
      element.validAnchor = element.nodeName === 'A' && (location.hostname === element.hostname || !element.hostname) && element.hash.replace(/#/,'').length;
      element.scrollTo = function(event) {
        var attr = 'id';
        var $target = $(element.hash);
        if (!$target.length) {
          attr = 'name';
          $target = $('[name="' + element.hash.replace('#', '') + '"');
        }
        var offset = $target.offset().top - parseInt($scrollableElement.css('paddingTop'), 10) - parseInt($scrollableElement.css('marginTop'), 10);
        if (this.validAnchor && $target.length && offset > 0) {
          if (event) {
            event.preventDefault();
          }
          var $fakeAnchor = $('<div/>')
            .addClass('element-invisible')
            .attr(attr, $target.attr(attr))
            .css({
              position: 'absolute',
              top: offset + 'px',
              zIndex: -1000
            })
            .appendTo(document);
          $target.removeAttr(attr);
          var complete = function () {
            location.hash = element.hash;
            $fakeAnchor.remove();
            $target.attr(attr, element.hash.replace('#', ''));
          };
          if (Drupal.settings.bootstrap.anchorsSmoothScrolling) {
            $scrollableElement.animate({ scrollTop: offset, avoidTransforms: true }, 400, complete);
          }
          else {
            $scrollableElement.scrollTop(offset);
            complete();
          }
        }
      };
    }
  };

})(jQuery, Drupal);
;/*})'"*/;/*})'"*/
