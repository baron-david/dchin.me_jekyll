(function($, Drupal, undefined) {

  Drupal.behaviors.Mode = {
    attach: function(context, settings) {



      $('.more-link', context).click(function() {
        var showItem = $(this).attr('overlay-target');
        $('#overlay-description').fadeIn().addClass('overlay_' + showItem);
        $('body').css('overflow-y', 'hidden');
        $('.overlay-content-item').hide();
        var showItem = $(this).attr('overlay-target');
        $('.overlay-content-item[overlay-content="'+ showItem + '"').show();
      });

      $('.close-overlay', context).click(function() {

        $('#overlay-description').fadeOut(function() {
          $(this).removeClass();
        });

        $('body').css('overflow-y', 'scroll');
      });

      $('#property-amenities-list li').draggable({
        revert: false,
        containment: ".amenities-inner",
        scroll: false
      });



      $('#property-main-content', context).waypoint(function(direction){
        if (direction == 'down') {
          $('.side-menu-bar').addClass('scrolled');
          $('#mobile-cta').addClass('on');
        }
      },
      {
        offset: 20
      });

      $('#property-main-content', context).waypoint(function(direction){
        if (direction == 'up') {
          $('.side-menu-bar').removeClass('scrolled');
          $('.side-menu-bar .menu-title .inner').text('Menu');
          $('#mobile-cta').removeClass('on');
        }
      },
      {
        offset: -10
      });

      $('.section-wrap', context).waypoint(function(direction) {
        if (direction == 'down') {
          // Ensure you are capturing the current element
          var menuTitle = $(this.element).attr('menu-title');
          // Update the menu title in the sidebar
          if (menuTitle) {
            $('.side-menu-bar .menu-title .inner').text(menuTitle);
          }
        }
      }, {
        offset: 50
      });

       $('.section-wrap', context).waypoint(function(direction) {
        if (direction == 'up') {
          // Ensure you are capturing the current element
          var menuTitle = $(this.element).attr('menu-title');
          // Update the menu title in the sidebar
          if (menuTitle) {
            $('.side-menu-bar .menu-title .inner').text(menuTitle);
          }
        }
      }, {
        offset: '-90%'
      });

      $('#amenities', context).waypoint(function(){
        $('#property-amenities-list li').attr('style', "");
        // $( "#property-amenities-list li" ).draggable( "option", "revert", true );
        // console.log('fauask');
      },
      {
        offset: 20
      });

      $('#address-hero', context).waypoint(function(direction){
          if (direction == 'down') {
             $('#address-hero').addClass('on');
          }
      },
      {
        offset: 700
      });


      $('#address-hero', context).waypoint(function(direction){
          if (direction == 'up') {
             $('#address-hero').removeClass('on');
          }
      },
      {
        offset: 20
      });

      $('.side-menu-bar', context).click(function() {
        $('#side-menu').addClass('on');
      });

      $('.side-menu-close', context).click(function() {
        $('#side-menu').removeClass('on');
      });
      $('.sticky-link a', context).click(function() {
        $('#side-menu').removeClass('on');
      });

      $('#overview', context).waypoint(function() {
        $('.img-1-bg').attr('transition-style', 'in:wipe:right').addClass('opacity-100');

        setTimeout(function() {
          $('.preview-image-1').attr('transition-style', 'in:wipe:right').addClass('opacity-100');
        }, 500);

        $('.img-2-bg').attr('transition-style', 'in:wipe:up').addClass('opacity-100');

        setTimeout(function() {
          $('.preview-image-2').attr('transition-style', 'in:wipe:up').addClass('opacity-100');
        }, 500);

      }, {
        offset: '50%'
      });
   }
  }
})(jQuery, Drupal);


