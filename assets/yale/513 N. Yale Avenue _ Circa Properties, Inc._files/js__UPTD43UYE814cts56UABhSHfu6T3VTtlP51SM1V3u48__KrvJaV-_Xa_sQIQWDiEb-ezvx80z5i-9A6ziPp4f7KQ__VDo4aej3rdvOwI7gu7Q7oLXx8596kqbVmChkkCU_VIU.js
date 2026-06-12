/**
 * Functionality to send events to plausible.io analytics.
 * Currently sending property analytics, we could add WL Order Form analytics.
 *
 * Note: Download tracking is handled in properties-all.js (Drupal.behaviors.trackedDownloads)
 * to ensure it's available on all property pages.
 */

(function($, Drupal, undefined) {
  Drupal.behaviors.plausibleAnalytics =  {
    attach: function(context, settings) {

      function sendPlausibleEvent(eventName, params) {
        if (typeof plausible !== 'undefined') {
          // Per the devs at Plausible, we can add props the the core pageview
          // event. This is the only way to get the actual pageview count from
          // their API. Useing a custom event name and trying to filter by props
          // doesnt work.
          plausible('pageview', {props: params});
        }
      }

      if (!$.isEmptyObject(Drupal.settings.relaAnalyticsPlausible)) {
        $.each(Drupal.settings.relaAnalyticsPlausible, function(eventName, params) {
          sendPlausibleEvent(eventName, params);
          delete Drupal.settings.relaAnalyticsPlausible[eventName];
        });
      }
    }
  }

})(jQuery, Drupal);
;/*})'"*/;/*})'"*/
(function ($) {
  Drupal.behaviors.improved_multi_select = {
    attach: function(context, settings) {
      if (settings.improved_multi_select && settings.improved_multi_select.selectors) {
        var options = settings.improved_multi_select;

        for (var key in options.selectors) {
          var selector = options.selectors[key];

          var $target;
          if (!options.isblacklist || 'select[multiple]' === selector) {
            $target = $(selector, context);
          }
          else {
            $target = $('select[multiple]', context).not(selector);
          }

          $target.once('improvedselect', function() {
            var $select = $(this),
              moveButtons = '',
              improvedselect_id = $select.attr('id'),
              $cloned_select = null,
              cloned_select_id = '';
            if (options.orderable) {
              // If the select is orderable then we clone the original select
              // so that we have the original ordering to use later.
              $cloned_select = $select.clone();
              cloned_select_id = $cloned_select.attr('id');
              cloned_select_id += '-cloned';
              $cloned_select.attr('id', cloned_select_id);
              $cloned_select.appendTo($select.parent()).hide();
              // Move button markup to add to the widget.
              moveButtons = '<span class="move_up" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_moveup) + '</span>' +
                            '<span class="move_down" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_movedown) + '</span>';
            }
            $select.parent().append(
              '<div class="improvedselect" sid="' + $select.attr('id') + '" id="improvedselect-' + $select.attr('id') + '">' +
                '<div class="improvedselect-text-wrapper">' +
                  '<input type="text" class="improvedselect_filter" sid="' + $select.attr('id') + '" prev="" />' +
                '</div>' +
                '<ul class="improvedselect_sel"></ul>' +
                '<ul class="improvedselect_all"></ul>' +
                '<div class="improvedselect_control">' +
                  '<span class="add" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_add) + '</span>' +
                  '<span class="del" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_del) + '</span>' +
                  '<span class="add_all" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_addall) + '</span>' +
                  '<span class="del_all" sid="' + $select.attr('id') + '">' + Drupal.checkPlain(options.buttontext_delall) + '</span>' +
                  moveButtons +
                '</div>' +
                '<div class="clear"></div>' +
              '</div>');
            if ($select.find('optgroup').has('option').length > 0) {
              $select.parent().find('.improvedselect').addClass('has_group');
              // Build groups.
              $('#improvedselect-' + improvedselect_id + ' .improvedselect-text-wrapper', context)
                .after('<div class="improvedselect_tabs-wrapper" sid="' + $select.attr('id') + '"><ul class="improvedselect_tabs"></ul></div>');
              $select.find('optgroup').has('option').each(function() {
                $('#improvedselect-' + improvedselect_id + ' .improvedselect_tabs', context)
                  .append('<li><a href="">' + $(this).attr('label') + '</a></li>');
              });
              // Show all groups option.
              $('#improvedselect-' + improvedselect_id + ' .improvedselect_tabs', context)
                .prepend('<li class="all"><a href="">' + Drupal.t('All') + '</a></li>');
              // Select group.
              $('#improvedselect-' + improvedselect_id + ' .improvedselect_tabs li a', context).click(function(e) {
                var $group = $(this),
                  sid = $group.parent().parent().parent().attr('sid');
                $('#improvedselect-' + improvedselect_id + ' .improvedselect_tabs li.selected', context).removeClass('selected').find('a').unwrap();
                $group.wrap('<div>').parents('li').first().addClass('selected');

                // Any existing selections in the all list need to be unselected
                // if they aren't part of the newly selected group.
                if (!$group.hasClass('all')) {
                  $('#improvedselect-' + improvedselect_id + ' .improvedselect_all li.selected[group!="' + $group.text() + '"]', context).removeClass('selected');
                }

                // Clear the filter if we have to.
                if (options.groupresetfilter) {
                  // Clear filter box.
                  $('#improvedselect-' + improvedselect_id + ' .improvedselect_filter', context).val('');
                }
                // Force re-filtering.
                $('#improvedselect-' + improvedselect_id + ' .improvedselect_filter', context).attr('prev', '');
                // Re-filtering will handle the rest.
                improvedselectFilter(sid, options, context);
                e.preventDefault();
              });
              // Select all to begin.
              $('#improvedselect-' + improvedselect_id + ' .improvedselect_tabs li.all a', context).click();
            }

            $select.find('option, optgroup').each(function() {
              var $opt = $(this),
                group = '';
              if ($opt[0].tagName == 'OPTGROUP') {
                if ($opt.has('option').length) {
                  $('#improvedselect-'+ improvedselect_id +' .improvedselect_all', context)
                    .append('<li isgroup="isgroup" so="---' + $opt.attr('label') + '---">--- '+ $opt.attr('label') +' ---</li>');
                }
              }
              else {
                group = $opt.parent("optgroup").attr("label");
                if (group) {
                  group = ' group="' + group + '"';
                }
                if ($opt.attr('value') != "_none") {
                  if ($opt.attr('selected')) {
                    $('#improvedselect-' + improvedselect_id + ' .improvedselect_sel', context)
                      .append('<li so="' + $opt.attr('value') + '"' + group + '>' + $opt.html() + '</li>');
                  }
                  else {
                    $('#improvedselect-' + improvedselect_id + ' .improvedselect_all', context)
                      .append('<li so="' + $opt.attr('value') + '"' + group + '>' + $opt.html() + '</li>');
                  }
                }
              }
            });
            $('#improvedselect-'+ improvedselect_id + ' .improvedselect_sel li, #improvedselect-' + improvedselect_id + ' .improvedselect_all li[isgroup!="isgroup"]', context).click(function() {
              $(this).toggleClass('selected');
            });
            $select.hide();
            // Double click feature request.
            $('#improvedselect-'+ improvedselect_id + ' .improvedselect_sel li, #improvedselect-' + improvedselect_id + ' .improvedselect_all li[isgroup!="isgroup"]', context).dblclick(function() {
              // Store selected items.
              var selected = $(this).parent().find('li.selected'),
                current_class = $(this).parent().attr('class');
              // Add item.
              if (current_class == 'improvedselect_all') {
                $(this).parent().find('li.selected').removeClass('selected');
                $(this).addClass('selected');
                $(this).parent().parent().find('.add').click();
              }
              // Remove item.
              else {
                $(this).parent().find('li.selected').removeClass('selected');
                $(this).addClass('selected');
                $(this).parent().parent().find('.del').click();
              }
              // Restore selected items.
              if (selected.length) {
                for (var k = 0; k < selected.length; k++) {
                  if ($(selected[k]).parent().attr('class') == current_class) {
                    $(selected[k]).addClass('selected');
                  }
                }
              }
            });

            // Set the height of the select fields based on the height of the
            // parent, otherwise it can end up with a lot of wasted space.
            $('.improvedselect_sel, .improvedselect_all').each(function() {
              if ($(this).parent().height() > 0 ) {
                $(this).height($(this).parent().height() - 35);
              }
              // @todo: Element is hidden - we can't detect its height.
              else {}
            });
          });
        }

        $('.improvedselect_filter', context).bind('input', function() {
          improvedselectFilter($(this).attr('sid'), options, context);
        });

        // Add selected items.
        $('.improvedselect .add', context).click(function() {
          var sid = $(this).attr('sid');
          $('#improvedselect-' + sid + ' .improvedselect_all .selected', context).each(function() {
            $opt = $(this);
            $opt.removeClass('selected');
            improvedselectUpdateGroupVisibility($opt, 1);
            $('#improvedselect-' + sid + ' .improvedselect_sel', context).append($opt);
          });
          improvedselectUpdate(sid, context);
        });

        // Remove selected items.
        $('.improvedselect .del', context).click(function() {
          var sid = $(this).attr('sid');
          $('#improvedselect-' + sid + ' .improvedselect_sel .selected', context).each(function() {
            $opt = $(this);
            $opt.removeClass('selected');
            $('#improvedselect-' + sid + ' .improvedselect_all', context).append($opt);
            improvedselectUpdateGroupVisibility($opt, 0);
          });
          // Force re-filtering.
          $('#improvedselect-' + sid + ' .improvedselect_filter', context).attr('prev', '');
          // Re-filtering will handle the rest.
          improvedselectFilter(sid, options, context);
          improvedselectUpdate(sid, context);
        });

        // Add all items.
        $('.improvedselect .add_all', context).click(function() {
          var sid = $(this).attr('sid');
          $('#improvedselect-' + sid + ' .improvedselect_all li[isgroup!=isgroup]', context).each(function() {
            $opt = $(this);
            if ($opt.css('display') != 'none') {
              $opt.removeClass('selected');
              improvedselectUpdateGroupVisibility($opt, 1);
              $('#improvedselect-' + sid + ' .improvedselect_sel', context).append($opt);
            }
          });
          improvedselectUpdate(sid, context);
        });

        // Remove all items.
        $('.improvedselect .del_all', context).click(function() {
          var sid = $(this).attr('sid');
          $('#improvedselect-' + sid + ' .improvedselect_sel li', context).each(function() {
            $opt = $(this);
            $opt.removeClass('selected');
            $('#improvedselect-' + sid + ' .improvedselect_all', context).append($opt);
            improvedselectUpdateGroupVisibility($opt, 0);
          });
          // Force re-filtering.
          $('#improvedselect-' + sid + ' .improvedselect_filter', context).attr('prev', '');
          // Re-filtering will handle the rest.
          improvedselectFilter(sid, options, context);
          improvedselectUpdate(sid, context);
        });

        // Move selected items up.
        $('.improvedselect .move_up', context).click(function() {
          var sid = $(this).attr('sid');
          $('#improvedselect-' + sid + ' .improvedselect_sel .selected', context).each(function() {
            var $selected = $(this);
            // Don't move selected items past other selected items or there will
            // be problems when moving multiple items at once.
            $selected.prev(':not(.selected)').before($selected);
          });
          improvedselectUpdate(sid, context);
        });

        // Move selected items down.
        $('.improvedselect .move_down', context).click(function() {
          var sid = $(this).attr('sid');
          // Run through the selections in reverse, otherwise problems occur
          // when moving multiple items at once.
          $($('#improvedselect-' + sid + ' .improvedselect_sel .selected', context).get().reverse()).each(function() {
            var $selected = $(this);
            // Don't move selected items past other selected items or there will
            // be problems when moving multiple items at once.
            $selected.next(':not(.selected)').after($selected);
          });
          improvedselectUpdate(sid, context);
        });
        // Let other scripts know improvedSelect was initialized
        $.event.trigger('improvedMultiSelectInitialized', [$(this)]);
      }
      // Let other scripts know improvedSelect has been attached
      $.event.trigger('improvedMultiSelectAttached');
    }
  };

  /**
   * Filter the all options list.
   */
  function improvedselectFilter(sid, options, context) {
    $filter = $('#improvedselect-' + sid + ' .improvedselect_filter', context);
    // Get current selected group.
    var $selectedGroup = $('#improvedselect-' + sid + ' .improvedselect_tabs li.selected:not(.all) a', context),
      text = $filter.val(),
      pattern,
      regex,
      words;

    if (text.length && text != $filter.attr('prev')) {
      $filter.attr('prev', text);
      switch (options.filtertype) {
        case 'partial':
        default:
          pattern = text;
          break;
        case 'exact':
          pattern = '^' + text + '$';
          break;
        case 'anywords':
          words = text.split(' ');
          pattern = '';
          for (var i = 0; i < words.length; i++) {
            if (words[i]) {
              pattern += (pattern) ? '|\\b' + words[i] + '\\b' : '\\b' + words[i] + '\\b';
            }
          }
          break;
        case 'anywords_partial':
          words = text.split(' ');
          pattern = '';
          for (var i = 0; i < words.length; i++) {
            if (words[i]) {
              pattern += (pattern) ? '|' + words[i] + '' : words[i];
            }
          }
          break;
        case 'allwords':
          words = text.split(' ');
          pattern = '^';
          // Add a lookahead for each individual word.
          // Lookahead is used because the words can match in any order
          // so this makes it simpler and faster.
          for (var i = 0; i < words.length; i++) {
            if (words[i]) {
              pattern += '(?=.*?\\b' + words[i] + '\\b)';
            }
          }
          break;
        case 'allwords_partial':
          words = text.split(' ');
          pattern = '^';
          // Add a lookahead for each individual word.
          // Lookahead is used because the words can match in any order
          // so this makes it simpler and faster.
          for (var i = 0; i < words.length; i++) {
            if (words[i]) {
              pattern += '(?=.*?' + words[i] + ')';
            }
          }
          break;
      }

      regex = new RegExp(pattern,'i');
      $('#improvedselect-' + sid + ' .improvedselect_all li', context).each(function() {
        $opt = $(this);
        if ($opt.attr('isgroup') != 'isgroup') {
          var str = $opt.text();
          if (str.match(regex) && (!$selectedGroup.length || $selectedGroup.text() == $opt.attr('group'))) {
            $opt.show();
            if ($opt.attr('group')) {
              // If a group is selected we don't need to show groups.
              if (!$selectedGroup.length) {
                $opt.siblings('li[isgroup="isgroup"][so="---' + $opt.attr('group') + '---"]').show();
              }
              else {
                $opt.siblings('li[isgroup="isgroup"][so="---' + $opt.attr('group') + '---"]').hide();
              }
            }
          }
          else {
            $opt.hide();
            if ($opt.attr('group')) {
              if ($opt.siblings('li[isgroup!="isgroup"][group="' + $opt.attr('group') + '"]:visible').length == 0) {
                $opt.siblings('li[isgroup="isgroup"][so="---' + $opt.attr('group') + '---"]').hide();
              }
            }
          }
        }
      });
    }
    else {
      if (!text.length) {
        $filter.attr('prev', '');
      }
      $('#improvedselect-' + sid + ' .improvedselect_all li', context).each(function() {
        var $opt = $(this);
        if ($opt.attr('isgroup') != 'isgroup') {
          if (!$selectedGroup.length || $selectedGroup.text() == $opt.attr('group')) {
            $opt.show();
          }
          else {
            $opt.hide();
          }
          improvedselectUpdateGroupVisibility($opt, 0);
        }
      });
    }
  }

  /**
   * Update the visibility of an option's group.
   *
   * @param $opt
   *   A jQuery object of a select option.
   * @param numItems
   *   How many items should be considered an empty group. Generally zero or one
   *   depending on if an item has been or is going to be removed or added.
   */
  function improvedselectUpdateGroupVisibility($opt, numItems) {
    var $selectedGroup = $opt.parents('.improvedselect').first().find('.improvedselect_tabs li.selected:not(.all) a');

    // Don't show groups if a group is selected.
    if ($opt.parent().children('li[isgroup!="isgroup"][group="' + $opt.attr('group') + '"]:visible').length <= numItems || $selectedGroup.length) {
      $opt.siblings('li[isgroup="isgroup"][so="---' + $opt.attr('group') + '---"]').hide();
    }
    else {
      $opt.siblings('li[isgroup="isgroup"][so="---' + $opt.attr('group') + '---"]').show();
    }
  }

  function improvedselectUpdate(sid, context) {
    // If we have sorting enabled, make sure we have the results sorted.
    var $select = $('#' + sid),
      $cloned_select = $('#' + sid + '-cloned');

    if ($cloned_select.length) {
      $select.find('option, optgroup').remove();
      $('#improvedselect-' + sid + ' .improvedselect_sel li', context).each(function() {
        var $li = $(this);
        $select.append($('<option></option>').attr('value', $li.attr('so')).prop('selected', true).text($li.text()));
      });
      // Now that the select has the options in the correct order, use the
      // cloned select for resetting the ul values.
      $select = $cloned_select;
    }
    else {
      $select.find('option:selected').prop('selected', false);
      $('#improvedselect-' + sid + ' .improvedselect_sel li', context).each(function() {
        $('#' + sid + ' [value="' + $(this).attr('so') + '"]', context).prop('selected', true);
      });
    }

    $select.find('option, optgroup').each(function() {
      $opt = $(this);
      if ($opt[0].tagName == 'OPTGROUP') {
        if ($opt.has('option').length) {
          $('#improvedselect-' + sid + ' .improvedselect_all', context).append($('#improvedselect-' + sid + ' .improvedselect_all [so="---' + $opt.attr('label') + '---"]', context));
        }
      }
      else {
        // When using reordering, the options will be from the cloned select,
        // meaning that there will be none selected, which means that items
        // in the selected list will not be reordered, which is what we want.
        if ($opt.attr("selected")) {
          $('#improvedselect-' + sid + ' .improvedselect_sel', context).append($('#improvedselect-' + sid + ' .improvedselect_sel [so="' + $opt.attr('value') + '"]', context));
        }
        else {
          $('#improvedselect-' + sid + ' .improvedselect_all', context).append($('#improvedselect-' + sid + ' .improvedselect_all [so="' + $opt.attr('value') + '"]', context));
        }
      }
    });
    // Don't use the $select variable here as it might be the clone.
    // Tell the ajax system the select has changed.
    $('#' + sid, context).trigger('change');
  }

})(jQuery, Drupal);
;/*})'"*/;/*})'"*/
/*!
Waypoints - 3.1.1
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.invokeAll("enable")},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical);t&&e&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s],l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var n in t){var r=t[n];for(var s in this.waypoints[n]){var a,l,h,p,u,c=this.waypoints[n][s],d=c.options.offset,f=c.triggerPoint,w=0,y=null==f;c.element!==c.element.window&&(w=c.adapter.offset()[r.offsetProp]),"function"==typeof d?d=d.apply(c):"string"==typeof d&&(d=parseFloat(d),c.options.offset.indexOf("%")>-1&&(d=Math.ceil(r.contextDimension*d/100))),a=r.contextScroll-r.contextOffset,c.triggerPoint=w+a-d,l=f<r.oldScroll,h=c.triggerPoint>=r.oldScroll,p=l&&h,u=!l&&!h,!y&&p?(c.queueTrigger(r.backward),o[c.group.id]=c.group):!y&&u?(c.queueTrigger(r.forward),o[c.group.id]=c.group):y&&r.oldScroll>=c.triggerPoint&&(c.queueTrigger(r.forward),o[c.group.id]=c.group)}}for(var g in o)o[g].flushTriggers();return this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();
;/*})'"*/;/*})'"*/
/**
 * @file
 *
 * Implement a modal form.
 *
 * @see modal.inc for documentation.
 *
 * This javascript relies on the CTools ajax responder.
 */

(function ($) {
  // Make sure our objects are defined.
  Drupal.CTools = Drupal.CTools || {};
  Drupal.CTools.Modal = Drupal.CTools.Modal || {};

  /**
   * Display the modal
   *
   * @todo -- document the settings.
   */
  Drupal.CTools.Modal.show = function(choice) {
    var opts = {};

    if (choice && typeof choice == 'string' && Drupal.settings[choice]) {
      // This notation guarantees we are actually copying it.
      $.extend(true, opts, Drupal.settings[choice]);
    }
    else if (choice) {
      $.extend(true, opts, choice);
    }

    var defaults = {
      modalTheme: 'CToolsModalDialog',
      throbberTheme: 'CToolsModalThrobber',
      animation: 'show',
      animationSpeed: 'fast',
      modalSize: {
        type: 'scale',
        width: .8,
        height: .8,
        addWidth: 0,
        addHeight: 0,
        // How much to remove from the inner content to make space for the
        // theming.
        contentRight: 25,
        contentBottom: 45
      },
      modalOptions: {
        opacity: .55,
        background: '#fff'
      },
      modalClass: 'default'
    };

    var settings = {};
    $.extend(true, settings, defaults, Drupal.settings.CToolsModal, opts);

    if (Drupal.CTools.Modal.currentSettings && Drupal.CTools.Modal.currentSettings != settings) {
      Drupal.CTools.Modal.modal.remove();
      Drupal.CTools.Modal.modal = null;
    }

    Drupal.CTools.Modal.currentSettings = settings;

    var resize = function(e) {
      // When creating the modal, it actually exists only in a theoretical
      // place that is not in the DOM. But once the modal exists, it is in the
      // DOM so the context must be set appropriately.
      var context = e ? document : Drupal.CTools.Modal.modal;

      if (Drupal.CTools.Modal.currentSettings.modalSize.type == 'scale') {
        var width = $(window).width() * Drupal.CTools.Modal.currentSettings.modalSize.width;
        var height = $(window).height() * Drupal.CTools.Modal.currentSettings.modalSize.height;
      }
      else {
        var width = Drupal.CTools.Modal.currentSettings.modalSize.width;
        var height = Drupal.CTools.Modal.currentSettings.modalSize.height;
      }

      // Use the additionol pixels for creating the width and height.
      $('div.ctools-modal-content', context).css({
        'width': width + Drupal.CTools.Modal.currentSettings.modalSize.addWidth + 'px',
        'height': height + Drupal.CTools.Modal.currentSettings.modalSize.addHeight + 'px'
      });
      $('div.ctools-modal-content .modal-content', context).css({
        'width': (width - Drupal.CTools.Modal.currentSettings.modalSize.contentRight) + 'px',
        'height': (height - Drupal.CTools.Modal.currentSettings.modalSize.contentBottom) + 'px'
      });
    };

    if (!Drupal.CTools.Modal.modal) {
      Drupal.CTools.Modal.modal = $(Drupal.theme(settings.modalTheme));
      if (settings.modalSize.type == 'scale') {
        $(window).bind('resize', resize);
      }
    }

    resize();

    $('span.modal-title', Drupal.CTools.Modal.modal).html(Drupal.CTools.Modal.currentSettings.loadingText);
    Drupal.CTools.Modal.modalContent(Drupal.CTools.Modal.modal, settings.modalOptions, settings.animation, settings.animationSpeed, settings.modalClass);
    $('#modalContent .modal-content').html(Drupal.theme(settings.throbberTheme)).addClass('ctools-modal-loading');

    // Position autocomplete results based on the scroll position of the modal.
    $('#modalContent .modal-content').delegate('input.form-autocomplete', 'keyup', function() {
      $('#autocomplete').css('top', $(this).position().top + $(this).outerHeight() + $(this).offsetParent().filter('#modal-content').scrollTop());
    });
  };

  /**
   * Hide the modal
   */
  Drupal.CTools.Modal.dismiss = function() {
    if (Drupal.CTools.Modal.modal) {
      Drupal.CTools.Modal.unmodalContent(Drupal.CTools.Modal.modal);
    }
  };

  /**
   * Provide the HTML to create the modal dialog.
   */
  Drupal.theme.prototype.CToolsModalDialog = function () {
    var html = '';
    html += '<div id="ctools-modal">';
    html += '  <div class="ctools-modal-content">'; // panels-modal-content
    html += '    <div class="modal-header">';
    html += '      <a class="close" href="#">';
    html +=          Drupal.CTools.Modal.currentSettings.closeText + Drupal.CTools.Modal.currentSettings.closeImage;
    html += '      </a>';
    html += '      <span id="modal-title" class="modal-title">&nbsp;</span>';
    html += '    </div>';
    html += '    <div id="modal-content" class="modal-content">';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    return html;
  };

  /**
   * Provide the HTML to create the throbber.
   */
  Drupal.theme.prototype.CToolsModalThrobber = function () {
    var html = '';
    html += '<div id="modal-throbber">';
    html += '  <div class="modal-throbber-wrapper">';
    html +=      Drupal.CTools.Modal.currentSettings.throbber;
    html += '  </div>';
    html += '</div>';

    return html;
  };

  /**
   * Figure out what settings string to use to display a modal.
   */
  Drupal.CTools.Modal.getSettings = function (object) {
    var match = $(object).attr('class').match(/ctools-modal-(\S+)/);
    if (match) {
      return match[1];
    }
  };

  /**
   * Click function for modals that can be cached.
   */
  Drupal.CTools.Modal.clickAjaxCacheLink = function () {
    Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(this));
    return Drupal.CTools.AJAX.clickAJAXCacheLink.apply(this);
  };

  /**
   * Handler to prepare the modal for the response
   */
  Drupal.CTools.Modal.clickAjaxLink = function () {
    Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(this));
    return false;
  };

  /**
   * Submit responder to do an AJAX submit on all modal forms.
   */
  Drupal.CTools.Modal.submitAjaxForm = function(e) {
    var $form = $(this);
    var url = $form.attr('action');

    setTimeout(function() { Drupal.CTools.AJAX.ajaxSubmit($form, url); }, 1);
    return false;
  };

  /**
   * Bind links that will open modals to the appropriate function.
   */
  Drupal.behaviors.ZZCToolsModal = {
    attach: function(context) {
      // Bind links
      // Note that doing so in this order means that the two classes can be
      // used together safely.
      /*
       * @todo remimplement the warm caching feature
       $('a.ctools-use-modal-cache', context).once('ctools-use-modal', function() {
         $(this).click(Drupal.CTools.Modal.clickAjaxCacheLink);
         Drupal.CTools.AJAX.warmCache.apply(this);
       });
        */

      $('area.ctools-use-modal, a.ctools-use-modal', context).once('ctools-use-modal', function() {
        var $this = $(this);
        $this.click(Drupal.CTools.Modal.clickAjaxLink);
        // Create a drupal ajax object
        var element_settings = {};
        if ($this.attr('href')) {
          element_settings.url = $this.attr('href');
          element_settings.event = 'click';
          element_settings.progress = { type: 'throbber' };
        }
        var base = $this.attr('href');
        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
      });

      // Bind buttons
      $('input.ctools-use-modal, button.ctools-use-modal', context).once('ctools-use-modal', function() {
        var $this = $(this);
        $this.click(Drupal.CTools.Modal.clickAjaxLink);
        var button = this;
        var element_settings = {};

        // AJAX submits specified in this manner automatically submit to the
        // normal form action.
        element_settings.url = Drupal.CTools.Modal.findURL(this);
        if (element_settings.url == '') {
          element_settings.url = $(this).closest('form').attr('action');
        }
        element_settings.event = 'click';
        element_settings.setClick = true;

        var base = $this.attr('id');
        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);

        // Make sure changes to settings are reflected in the URL.
        $('.' + $(button).attr('id') + '-url').change(function() {
          Drupal.ajax[base].options.url = Drupal.CTools.Modal.findURL(button);
        });
      });

      // Bind our custom event to the form submit
      $('#modal-content form', context).once('ctools-use-modal', function() {
        var $this = $(this);
        var element_settings = {};

        element_settings.url = $this.attr('action');
        element_settings.event = 'submit';
        element_settings.progress = { 'type': 'throbber' };
        var base = $this.attr('id');

        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
        Drupal.ajax[base].form = $this;

        $('input[type=submit], button', this).click(function(event) {
          Drupal.ajax[base].element = this;
          this.form.clk = this;
          // Stop autocomplete from submitting.
          if (Drupal.autocompleteSubmit && !Drupal.autocompleteSubmit()) {
            return false;
          }
          // An empty event means we were triggered via .click() and
          // in jquery 1.4 this won't trigger a submit.
          // We also have to check jQuery version to prevent
          // IE8 + jQuery 1.4.4 to break on other events
          // bound to the submit button.
          if (jQuery.fn.jquery.substr(0, 3) === '1.4' && typeof event.bubbles === "undefined") {
            $(this.form).trigger('submit');
            return false;
          }
        });
      });

      // Bind a click handler to allow elements with the 'ctools-close-modal'
      // class to close the modal.
      $('.ctools-close-modal', context).once('ctools-close-modal')
        .click(function() {
          Drupal.CTools.Modal.dismiss();
          return false;
        });
    }
  };

  // The following are implementations of AJAX responder commands.

  /**
   * AJAX responder command to place HTML within the modal.
   */
  Drupal.CTools.Modal.modal_display = function(ajax, response, status) {
    var settings = response.settings || ajax.settings || Drupal.settings;
    // If the modal does not exist yet, create it.
    if ($('#modalContent').length == 0) {
      Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(ajax.element));
    }
    // If the modal exists run detachBehaviors before removing existing content.
    else {
      Drupal.detachBehaviors($('#modalContent'), settings, 'unload');
    }
    $('#modal-title').html(response.title);
    // Simulate an actual page load by scrolling to the top after adding the
    // content. This is helpful for allowing users to see error messages at the
    // top of a form, etc.
    $('#modal-content').html(response.output).scrollTop(0);
    $(document).trigger('CToolsAttachBehaviors', $('#modalContent'));

    // Attach behaviors within a modal dialog.
    Drupal.attachBehaviors($('#modalContent'), settings);

    if ($('#modal-content').hasClass('ctools-modal-loading')) {
      $('#modal-content').removeClass('ctools-modal-loading');
    }
    else {
      // If the modal was already shown, and we are simply replacing its
      // content, then focus on the first focusable element in the modal.
      // (When first showing the modal, focus will be placed on the close
      // button by the show() function called above.)
      $('#modal-content :focusable:first').focus();
    }
  };

  /**
   * AJAX responder command to dismiss the modal.
   */
  Drupal.CTools.Modal.modal_dismiss = function(command) {
    Drupal.CTools.Modal.dismiss();
    $('link.ctools-temporary-css').remove();
  };

  /**
   * Display loading
   */
  //Drupal.CTools.AJAX.commands.modal_loading = function(command) {
  Drupal.CTools.Modal.modal_loading = function(command) {
    Drupal.CTools.Modal.modal_display({
      output: Drupal.theme(Drupal.CTools.Modal.currentSettings.throbberTheme),
      title: Drupal.CTools.Modal.currentSettings.loadingText
    });
  };

  /**
   * Find a URL for an AJAX button.
   *
   * The URL for this gadget will be composed of the values of items by
   * taking the ID of this item and adding -url and looking for that
   * class. They need to be in the form in order since we will
   * concat them all together using '/'.
   */
  Drupal.CTools.Modal.findURL = function(item) {
    var url = '';
    var url_class = '.' + $(item).attr('id') + '-url';
    $(url_class).each(
      function() {
        var $this = $(this);
        if (url && $this.val()) {
          url += '/';
        }
        url += $this.val();
      });
    return url;
  };


  /**
   * modalContent
   * @param content string to display in the content box
   * @param css obj of css attributes
   * @param animation (fadeIn, slideDown, show)
   * @param speed (valid animation speeds slow, medium, fast or # in ms)
   * @param modalClass class added to div#modalContent
   */
  Drupal.CTools.Modal.modalContent = function(content, css, animation, speed, modalClass) {
    // If our animation isn't set, make it just show/pop
    if (!animation) {
      animation = 'show';
    }
    else {
      // If our animation isn't "fadeIn" or "slideDown" then it always is show
      if (animation != 'fadeIn' && animation != 'slideDown') {
        animation = 'show';
      }
    }

    if (!speed && 0 !== speed) {
      speed = 'fast';
    }

    // Build our base attributes and allow them to be overriden
    css = jQuery.extend({
      position: 'absolute',
      left: '0px',
      margin: '0px',
      background: '#000',
      opacity: '.55'
    }, css);

    // Add opacity handling for IE.
    css.filter = 'alpha(opacity=' + (100 * css.opacity) + ')';
    content.hide();

    // If we already have modalContent, remove it.
    if ($('#modalBackdrop').length) $('#modalBackdrop').remove();
    if ($('#modalContent').length) $('#modalContent').remove();

    // position code lifted from http://www.quirksmode.org/viewport/compatibility.html
    if (self.pageYOffset) { // all except Explorer
    var wt = self.pageYOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
      var wt = document.documentElement.scrollTop;
    } else if (document.body) { // all other Explorers
      var wt = document.body.scrollTop;
    }

    // Get our dimensions

    // Get the docHeight and (ugly hack) add 50 pixels to make sure we dont have a *visible* border below our div
    var docHeight = $(document).height() + 50;
    var docWidth = $(document).width();
    var winHeight = $(window).height();
    var winWidth = $(window).width();
    if( docHeight < winHeight ) docHeight = winHeight;

    // Create our divs
    $('body').append('<div id="modalBackdrop" class="backdrop-' + modalClass + '" style="z-index: 1000; display: none;"></div><div id="modalContent" class="modal-' + modalClass + '" style="z-index: 1001; position: absolute;">' + $(content).html() + '</div>');

    // Get a list of the tabbable elements in the modal content.
    var getTabbableElements = function () {
      var tabbableElements = $('#modalContent :tabbable'),
          radioButtons = tabbableElements.filter('input[type="radio"]');

      // The list of tabbable elements from jQuery is *almost* right. The
      // exception is with groups of radio buttons. The list from jQuery will
      // include all radio buttons, when in fact, only the selected radio button
      // is tabbable, and if no radio buttons in a group are selected, then only
      // the first is tabbable.
      if (radioButtons.length > 0) {
        // First, build up an index of which groups have an item selected or not.
        var anySelected = {};
        radioButtons.each(function () {
          var name = this.name;

          if (typeof anySelected[name] === 'undefined') {
            anySelected[name] = radioButtons.filter('input[name="' + name + '"]:checked').length !== 0;
          }
        });

        // Next filter out the radio buttons that aren't really tabbable.
        var found = {};
        tabbableElements = tabbableElements.filter(function () {
          var keep = true;

          if (this.type == 'radio') {
            if (anySelected[this.name]) {
              // Only keep the selected one.
              keep = this.checked;
            }
            else {
              // Only keep the first one.
              if (found[this.name]) {
                keep = false;
              }
              found[this.name] = true;
            }
          }

          return keep;
        });
      }

      return tabbableElements.get();
    };

    // Keyboard and focus event handler ensures only modal elements gain focus.
    modalEventHandler = function( event ) {
      target = null;
      if ( event ) { //Mozilla
        target = event.target;
      } else { //IE
        event = window.event;
        target = event.srcElement;
      }

      var parents = $(target).parents().get();
      for (var i = 0; i < parents.length; ++i) {
        var position = $(parents[i]).css('position');
        if (position == 'absolute' || position == 'fixed') {
          return true;
        }
      }

      if ($(target).is('#modalContent, body') || $(target).filter('*:visible').parents('#modalContent').length) {
        // Allow the event only if target is a visible child node
        // of #modalContent.
        return true;
      }
      else {
        getTabbableElements()[0].focus();
      }

      event.preventDefault();
    };
    $('body').bind( 'focus', modalEventHandler );
    $('body').bind( 'keypress', modalEventHandler );

    // Keypress handler Ensures you can only TAB to elements within the modal.
    // Based on the psuedo-code from WAI-ARIA 1.0 Authoring Practices section
    // 3.3.1 "Trapping Focus".
    modalTabTrapHandler = function (evt) {
      // We only care about the TAB key.
      if (evt.which != 9) {
        return true;
      }

      var tabbableElements = getTabbableElements(),
          firstTabbableElement = tabbableElements[0],
          lastTabbableElement = tabbableElements[tabbableElements.length - 1],
          singleTabbableElement = firstTabbableElement == lastTabbableElement,
          node = evt.target;

      // If this is the first element and the user wants to go backwards, then
      // jump to the last element.
      if (node == firstTabbableElement && evt.shiftKey) {
        if (!singleTabbableElement) {
          lastTabbableElement.focus();
        }
        return false;
      }
      // If this is the last element and the user wants to go forwards, then
      // jump to the first element.
      else if (node == lastTabbableElement && !evt.shiftKey) {
        if (!singleTabbableElement) {
          firstTabbableElement.focus();
        }
        return false;
      }
      // If this element isn't in the dialog at all, then jump to the first
      // or last element to get the user into the game.
      else if ($.inArray(node, tabbableElements) == -1) {
        // Make sure the node isn't in another modal (ie. WYSIWYG modal).
        var parents = $(node).parents().get();
        for (var i = 0; i < parents.length; ++i) {
          var position = $(parents[i]).css('position');
          if (position == 'absolute' || position == 'fixed') {
            return true;
          }
        }

        if (evt.shiftKey) {
          lastTabbableElement.focus();
        }
        else {
          firstTabbableElement.focus();
        }
      }
    };
    $('body').bind('keydown', modalTabTrapHandler);

    // Create our content div, get the dimensions, and hide it
    var modalContent = $('#modalContent').css('top','-1000px');
    var $modalHeader = modalContent.find('.modal-header');
    var mdcTop = wt + Math.max((winHeight / 2) - (modalContent.outerHeight() / 2), 0);
    var mdcLeft = ( winWidth / 2 ) - ( modalContent.outerWidth() / 2);
    $('#modalBackdrop').css(css).css('top', 0).css('height', docHeight + 'px').css('width', docWidth + 'px').show();
    modalContent.css({top: mdcTop + 'px', left: mdcLeft + 'px'}).hide()[animation](speed);

    // Bind a click for closing the modalContent
    modalContentClose = function(){close(); return false;};
    $('.close', $modalHeader).bind('click', modalContentClose);

    // Bind a keypress on escape for closing the modalContent
    modalEventEscapeCloseHandler = function(event) {
      if (event.keyCode == 27) {
        close();
        return false;
      }
    };

    $(document).bind('keydown', modalEventEscapeCloseHandler);

    // Per WAI-ARIA 1.0 Authoring Practices, initial focus should be on the
    // close button, but we should save the original focus to restore it after
    // the dialog is closed.
    var oldFocus = document.activeElement;
    $('.close', $modalHeader).focus();

    // Close the open modal content and backdrop
    function close() {
      // Unbind the events
      $(window).unbind('resize',  modalContentResize);
      $('body').unbind( 'focus', modalEventHandler);
      $('body').unbind( 'keypress', modalEventHandler );
      $('body').unbind( 'keydown', modalTabTrapHandler );
      $('.close', $modalHeader).unbind('click', modalContentClose);
      $(document).unbind('keydown', modalEventEscapeCloseHandler);
      $(document).trigger('CToolsCloseModalBehaviors', $('#modalContent'));
      $(document).trigger('CToolsDetachBehaviors', $('#modalContent'));

      // Closing animation.
      switch (animation) {
        case 'fadeIn':
          modalContent.fadeOut(speed, modalContentRemove);
          break;

        case 'slideDown':
          modalContent.slideUp(speed, modalContentRemove);
          break;

        case 'show':
          modalContent.hide(speed, modalContentRemove);
          break;
      }
    }

    // Remove the content.
    modalContentRemove = function () {
      $('#modalContent').remove();
      $('#modalBackdrop').remove();

      // Restore focus to where it was before opening the dialog.
      $(oldFocus).focus();
    };

    // Move and resize the modalBackdrop and modalContent on window resize.
    modalContentResize = function () {
      // Reset the backdrop height/width to get accurate document size.
      $('#modalBackdrop').css('height', '').css('width', '');

      // Position code lifted from:
      // http://www.quirksmode.org/viewport/compatibility.html
      if (self.pageYOffset) { // all except Explorer
        var wt = self.pageYOffset;
      } else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
        var wt = document.documentElement.scrollTop;
      } else if (document.body) { // all other Explorers
        var wt = document.body.scrollTop;
      }

      // Get our heights
      var docHeight = $(document).height();
      var docWidth = $(document).width();
      var winHeight = $(window).height();
      var winWidth = $(window).width();
      if( docHeight < winHeight ) docHeight = winHeight;

      // Get where we should move content to
      var modalContent = $('#modalContent');
      var mdcTop = wt + Math.max((winHeight / 2) - (modalContent.outerHeight() / 2), 0);
      var mdcLeft = ( winWidth / 2 ) - ( modalContent.outerWidth() / 2);

      // Apply the changes
      $('#modalBackdrop').css('height', docHeight + 'px').css('width', docWidth + 'px').show();
      modalContent.css('top', mdcTop + 'px').css('left', mdcLeft + 'px').show();
    };
    $(window).bind('resize', modalContentResize);
  };

  /**
   * unmodalContent
   * @param content (The jQuery object to remove)
   * @param animation (fadeOut, slideUp, show)
   * @param speed (valid animation speeds slow, medium, fast or # in ms)
   */
  Drupal.CTools.Modal.unmodalContent = function(content, animation, speed)
  {
    // If our animation isn't set, make it just show/pop
    if (!animation) { var animation = 'show'; } else {
      // If our animation isn't "fade" then it always is show
      if (( animation != 'fadeOut' ) && ( animation != 'slideUp')) animation = 'show';
    }
    // Set a speed if we dont have one
    if ( !speed ) var speed = 'fast';

    // Unbind the events we bound
    $(window).unbind('resize', modalContentResize);
    $('body').unbind('focus', modalEventHandler);
    $('body').unbind('keypress', modalEventHandler);
    $('body').unbind( 'keydown', modalTabTrapHandler );
    var $modalContent = $('#modalContent');
    var $modalHeader = $modalContent.find('.modal-header');
    $('.close', $modalHeader).unbind('click', modalContentClose);
    $(document).unbind('keydown', modalEventEscapeCloseHandler);
    $(document).trigger('CToolsDetachBehaviors', $modalContent);

    // jQuery magic loop through the instances and run the animations or removal.
    content.each(function(){
      if ( animation == 'fade' ) {
        $('#modalContent').fadeOut(speed, function() {
          $('#modalBackdrop').fadeOut(speed, function() {
            $(this).remove();
          });
          $(this).remove();
        });
      } else {
        if ( animation == 'slide' ) {
          $('#modalContent').slideUp(speed,function() {
            $('#modalBackdrop').slideUp(speed, function() {
              $(this).remove();
            });
            $(this).remove();
          });
        } else {
          $('#modalContent').remove();
          $('#modalBackdrop').remove();
        }
      }
    });
  };

$(function() {
  Drupal.ajax.prototype.commands.modal_display = Drupal.CTools.Modal.modal_display;
  Drupal.ajax.prototype.commands.modal_dismiss = Drupal.CTools.Modal.modal_dismiss;
});

})(jQuery);
;/*})'"*/;/*})'"*/
/* perfect-scrollbar v0.6.2 */
!function t(e,n,r){function o(l,s){if(!n[l]){if(!e[l]){var a="function"==typeof require&&require;if(!s&&a)return a(l,!0);if(i)return i(l,!0);var c=new Error("Cannot find module '"+l+"'");throw c.code="MODULE_NOT_FOUND",c}var u=n[l]={exports:{}};e[l][0].call(u.exports,function(t){var n=e[l][1][t];return o(n?n:t)},u,u.exports,t,e,n,r)}return n[l].exports}for(var i="function"==typeof require&&require,l=0;l<r.length;l++)o(r[l]);return o}({1:[function(t,e){"use strict";function n(t){t.fn.perfectScrollbar=function(e){return this.each(function(){if("object"==typeof e||"undefined"==typeof e){var n=e;o.get(this)||r.initialize(this,n)}else{var i=e;"update"===i?r.update(this):"destroy"===i&&r.destroy(this)}return t(this)})}}var r=t("../main"),o=t("../plugin/instances");if("function"==typeof define&&define.amd)define(["jquery"],n);else{var i=window.jQuery?window.jQuery:window.$;"undefined"!=typeof i&&n(i)}e.exports=n},{"../main":7,"../plugin/instances":18}],2:[function(t,e,n){"use strict";function r(t,e){var n=t.className.split(" ");n.indexOf(e)<0&&n.push(e),t.className=n.join(" ")}function o(t,e){var n=t.className.split(" "),r=n.indexOf(e);r>=0&&n.splice(r,1),t.className=n.join(" ")}n.add=function(t,e){t.classList?t.classList.add(e):r(t,e)},n.remove=function(t,e){t.classList?t.classList.remove(e):o(t,e)},n.list=function(t){return t.classList?t.classList:t.className.split(" ")}},{}],3:[function(t,e,n){"use strict";function r(t,e){return window.getComputedStyle(t)[e]}function o(t,e,n){return"number"==typeof n&&(n=n.toString()+"px"),t.style[e]=n,t}function i(t,e){for(var n in e){var r=e[n];"number"==typeof r&&(r=r.toString()+"px"),t.style[n]=r}return t}n.e=function(t,e){var n=document.createElement(t);return n.className=e,n},n.appendTo=function(t,e){return e.appendChild(t),t},n.css=function(t,e,n){return"object"==typeof e?i(t,e):"undefined"==typeof n?r(t,e):o(t,e,n)},n.matches=function(t,e){return"undefined"!=typeof t.matches?t.matches(e):"undefined"!=typeof t.matchesSelector?t.matchesSelector(e):"undefined"!=typeof t.webkitMatchesSelector?t.webkitMatchesSelector(e):"undefined"!=typeof t.mozMatchesSelector?t.mozMatchesSelector(e):"undefined"!=typeof t.msMatchesSelector?t.msMatchesSelector(e):void 0},n.remove=function(t){"undefined"!=typeof t.remove?t.remove():t.parentNode&&t.parentNode.removeChild(t)}},{}],4:[function(t,e){"use strict";var n=function(t){this.element=t,this.events={}};n.prototype.bind=function(t,e){"undefined"==typeof this.events[t]&&(this.events[t]=[]),this.events[t].push(e),this.element.addEventListener(t,e,!1)},n.prototype.unbind=function(t,e){var n="undefined"!=typeof e;this.events[t]=this.events[t].filter(function(r){return n&&r!==e?!0:(this.element.removeEventListener(t,r,!1),!1)},this)},n.prototype.unbindAll=function(){for(var t in this.events)this.unbind(t)};var r=function(){this.eventElements=[]};r.prototype.eventElement=function(t){var e=this.eventElements.filter(function(e){return e.element===t})[0];return"undefined"==typeof e&&(e=new n(t),this.eventElements.push(e)),e},r.prototype.bind=function(t,e,n){this.eventElement(t).bind(e,n)},r.prototype.unbind=function(t,e,n){this.eventElement(t).unbind(e,n)},r.prototype.unbindAll=function(){for(var t=0;t<this.eventElements.length;t++)this.eventElements[t].unbindAll()},r.prototype.once=function(t,e,n){var r=this.eventElement(t),o=function(t){r.unbind(e,o),n(t)};r.bind(e,o)},e.exports=r},{}],5:[function(t,e){"use strict";e.exports=function(){function t(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return function(){return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()}}()},{}],6:[function(t,e,n){"use strict";var r=t("./class"),o=t("./dom");n.toInt=function(t){return"string"==typeof t?parseInt(t,10):~~t},n.clone=function(t){if(null===t)return null;if("object"==typeof t){var e={};for(var n in t)e[n]=this.clone(t[n]);return e}return t},n.extend=function(t,e){var n=this.clone(t);for(var r in e)n[r]=this.clone(e[r]);return n},n.isEditable=function(t){return o.matches(t,"input,[contenteditable]")||o.matches(t,"select,[contenteditable]")||o.matches(t,"textarea,[contenteditable]")||o.matches(t,"button,[contenteditable]")},n.removePsClasses=function(t){for(var e=r.list(t),n=0;n<e.length;n++){var o=e[n];0===o.indexOf("ps-")&&r.remove(t,o)}},n.outerWidth=function(t){return this.toInt(o.css(t,"width"))+this.toInt(o.css(t,"paddingLeft"))+this.toInt(o.css(t,"paddingRight"))+this.toInt(o.css(t,"borderLeftWidth"))+this.toInt(o.css(t,"borderRightWidth"))},n.startScrolling=function(t,e){r.add(t,"ps-in-scrolling"),"undefined"!=typeof e?r.add(t,"ps-"+e):(r.add(t,"ps-x"),r.add(t,"ps-y"))},n.stopScrolling=function(t,e){r.remove(t,"ps-in-scrolling"),"undefined"!=typeof e?r.remove(t,"ps-"+e):(r.remove(t,"ps-x"),r.remove(t,"ps-y"))},n.env={isWebKit:"WebkitAppearance"in document.documentElement.style,supportsTouch:"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,supportsIePointer:null!==window.navigator.msMaxTouchPoints}},{"./class":2,"./dom":3}],7:[function(t,e){"use strict";var n=t("./plugin/destroy"),r=t("./plugin/initialize"),o=t("./plugin/update");e.exports={initialize:r,update:o,destroy:n}},{"./plugin/destroy":9,"./plugin/initialize":17,"./plugin/update":20}],8:[function(t,e){"use strict";e.exports={wheelSpeed:1,wheelPropagation:!1,swipePropagation:!0,minScrollbarLength:null,maxScrollbarLength:null,useBothWheelAxes:!1,useKeyboard:!0,suppressScrollX:!1,suppressScrollY:!1,scrollXMarginOffset:0,scrollYMarginOffset:0}},{}],9:[function(t,e){"use strict";var n=t("../lib/dom"),r=t("../lib/helper"),o=t("./instances");e.exports=function(t){var e=o.get(t);e.event.unbindAll(),n.remove(e.scrollbarX),n.remove(e.scrollbarY),n.remove(e.scrollbarXRail),n.remove(e.scrollbarYRail),r.removePsClasses(t),o.remove(t)}},{"../lib/dom":3,"../lib/helper":6,"./instances":18}],10:[function(t,e){"use strict";function n(t,e){function n(t){return t.getBoundingClientRect()}var o=window.Event.prototype.stopPropagation.bind;e.event.bind(e.scrollbarY,"click",o),e.event.bind(e.scrollbarYRail,"click",function(o){var l=r.toInt(e.scrollbarYHeight/2),s=o.pageY-n(e.scrollbarYRail).top-l,a=e.containerHeight-e.scrollbarYHeight,c=s/a;0>c?c=0:c>1&&(c=1),t.scrollTop=(e.contentHeight-e.containerHeight)*c,i(t)}),e.event.bind(e.scrollbarX,"click",o),e.event.bind(e.scrollbarXRail,"click",function(o){var l=r.toInt(e.scrollbarXWidth/2),s=o.pageX-n(e.scrollbarXRail).left-l;console.log(o.pageX,e.scrollbarXRail.offsetLeft);var a=e.containerWidth-e.scrollbarXWidth,c=s/a;0>c?c=0:c>1&&(c=1),t.scrollLeft=(e.contentWidth-e.containerWidth)*c,i(t)})}var r=t("../../lib/helper"),o=t("../instances"),i=t("../update-geometry");e.exports=function(t){var e=o.get(t);n(t,e)}},{"../../lib/helper":6,"../instances":18,"../update-geometry":19}],11:[function(t,e){"use strict";function n(t,e){function n(n){var o=r+n,l=e.containerWidth-e.scrollbarXWidth;e.scrollbarXLeft=0>o?0:o>l?l:o;var s=i.toInt(e.scrollbarXLeft*(e.contentWidth-e.containerWidth)/(e.containerWidth-e.scrollbarXWidth));t.scrollLeft=s}var r=null,l=null,a=function(e){n(e.pageX-l),s(t),e.stopPropagation(),e.preventDefault()},c=function(){i.stopScrolling(t,"x"),e.event.unbind(e.ownerDocument,"mousemove",a)};e.event.bind(e.scrollbarX,"mousedown",function(n){l=n.pageX,r=i.toInt(o.css(e.scrollbarX,"left")),i.startScrolling(t,"x"),e.event.bind(e.ownerDocument,"mousemove",a),e.event.once(e.ownerDocument,"mouseup",c),n.stopPropagation(),n.preventDefault()})}function r(t,e){function n(n){var o=r+n,l=e.containerHeight-e.scrollbarYHeight;e.scrollbarYTop=0>o?0:o>l?l:o;var s=i.toInt(e.scrollbarYTop*(e.contentHeight-e.containerHeight)/(e.containerHeight-e.scrollbarYHeight));t.scrollTop=s}var r=null,l=null,a=function(e){n(e.pageY-l),s(t),e.stopPropagation(),e.preventDefault()},c=function(){i.stopScrolling(t,"y"),e.event.unbind(e.ownerDocument,"mousemove",a)};e.event.bind(e.scrollbarY,"mousedown",function(n){l=n.pageY,r=i.toInt(o.css(e.scrollbarY,"top")),i.startScrolling(t,"y"),e.event.bind(e.ownerDocument,"mousemove",a),e.event.once(e.ownerDocument,"mouseup",c),n.stopPropagation(),n.preventDefault()})}var o=t("../../lib/dom"),i=t("../../lib/helper"),l=t("../instances"),s=t("../update-geometry");e.exports=function(t){var e=l.get(t);n(t,e),r(t,e)}},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19}],12:[function(t,e){"use strict";function n(t,e){function n(n,r){var o=t.scrollTop;if(0===n){if(!e.scrollbarYActive)return!1;if(0===o&&r>0||o>=e.contentHeight-e.containerHeight&&0>r)return!e.settings.wheelPropagation}var i=t.scrollLeft;if(0===r){if(!e.scrollbarXActive)return!1;if(0===i&&0>n||i>=e.contentWidth-e.containerWidth&&n>0)return!e.settings.wheelPropagation}return!0}var o=!1;e.event.bind(t,"mouseenter",function(){o=!0}),e.event.bind(t,"mouseleave",function(){o=!1});var l=!1;e.event.bind(e.ownerDocument,"keydown",function(s){if((!s.isDefaultPrevented||!s.isDefaultPrevented())&&o){var a=document.activeElement?document.activeElement:e.ownerDocument.activeElement;if(a){for(;a.shadowRoot;)a=a.shadowRoot.activeElement;if(r.isEditable(a))return}var c=0,u=0;switch(s.which){case 37:c=-30;break;case 38:u=30;break;case 39:c=30;break;case 40:u=-30;break;case 33:u=90;break;case 32:case 34:u=-90;break;case 35:u=s.ctrlKey?-e.contentHeight:-e.containerHeight;break;case 36:u=s.ctrlKey?t.scrollTop:e.containerHeight;break;default:return}t.scrollTop=t.scrollTop-u,t.scrollLeft=t.scrollLeft+c,i(t),l=n(c,u),l&&s.preventDefault()}})}var r=t("../../lib/helper"),o=t("../instances"),i=t("../update-geometry");e.exports=function(t){var e=o.get(t);n(t,e)}},{"../../lib/helper":6,"../instances":18,"../update-geometry":19}],13:[function(t,e){"use strict";function n(t,e){function n(n,r){var o=t.scrollTop;if(0===n){if(!e.scrollbarYActive)return!1;if(0===o&&r>0||o>=e.contentHeight-e.containerHeight&&0>r)return!e.settings.wheelPropagation}var i=t.scrollLeft;if(0===r){if(!e.scrollbarXActive)return!1;if(0===i&&0>n||i>=e.contentWidth-e.containerWidth&&n>0)return!e.settings.wheelPropagation}return!0}function o(t){var e=t.deltaX,n=-1*t.deltaY;return("undefined"==typeof e||"undefined"==typeof n)&&(e=-1*t.wheelDeltaX/6,n=t.wheelDeltaY/6),t.deltaMode&&1===t.deltaMode&&(e*=10,n*=10),e!==e&&n!==n&&(e=0,n=t.wheelDelta),[e,n]}function l(e,n){var r=t.querySelector("textarea:hover");if(r){var o=r.scrollHeight-r.clientHeight;if(o>0&&!(0===r.scrollTop&&n>0||r.scrollTop===o&&0>n))return!0;var i=r.scrollLeft-r.clientWidth;if(i>0&&!(0===r.scrollLeft&&0>e||r.scrollLeft===i&&e>0))return!0}return!1}function s(s){if(r.env.isWebKit||!t.querySelector("select:focus")){var c=o(s),u=c[0],d=c[1];l(u,d)||(a=!1,e.settings.useBothWheelAxes?e.scrollbarYActive&&!e.scrollbarXActive?(t.scrollTop=d?t.scrollTop-d*e.settings.wheelSpeed:t.scrollTop+u*e.settings.wheelSpeed,a=!0):e.scrollbarXActive&&!e.scrollbarYActive&&(t.scrollLeft=u?t.scrollLeft+u*e.settings.wheelSpeed:t.scrollLeft-d*e.settings.wheelSpeed,a=!0):(t.scrollTop=t.scrollTop-d*e.settings.wheelSpeed,t.scrollLeft=t.scrollLeft+u*e.settings.wheelSpeed),i(t),a=a||n(u,d),a&&(s.stopPropagation(),s.preventDefault()))}}var a=!1;"undefined"!=typeof window.onwheel?e.event.bind(t,"wheel",s):"undefined"!=typeof window.onmousewheel&&e.event.bind(t,"mousewheel",s)}var r=t("../../lib/helper"),o=t("../instances"),i=t("../update-geometry");e.exports=function(t){var e=o.get(t);n(t,e)}},{"../../lib/helper":6,"../instances":18,"../update-geometry":19}],14:[function(t,e){"use strict";function n(t,e){e.event.bind(t,"scroll",function(){o(t)})}var r=t("../instances"),o=t("../update-geometry");e.exports=function(t){var e=r.get(t);n(t,e)}},{"../instances":18,"../update-geometry":19}],15:[function(t,e){"use strict";function n(t,e){function n(){var t=window.getSelection?window.getSelection():document.getSelection?document.getSelection():"";return 0===t.toString().length?null:t.getRangeAt(0).commonAncestorContainer}function l(){a||(a=setInterval(function(){return o.get(t)?(t.scrollTop=t.scrollTop+c.top,t.scrollLeft=t.scrollLeft+c.left,void i(t)):void clearInterval(a)},50))}function s(){a&&(clearInterval(a),a=null),r.stopScrolling(t)}var a=null,c={top:0,left:0},u=!1;e.event.bind(e.ownerDocument,"selectionchange",function(){t.contains(n())?u=!0:(u=!1,s())}),e.event.bind(window,"mouseup",function(){u&&(u=!1,s())}),e.event.bind(window,"mousemove",function(e){if(u){var n={x:e.pageX,y:e.pageY},o={left:t.offsetLeft,right:t.offsetLeft+t.offsetWidth,top:t.offsetTop,bottom:t.offsetTop+t.offsetHeight};n.x<o.left+3?(c.left=-5,r.startScrolling(t,"x")):n.x>o.right-3?(c.left=5,r.startScrolling(t,"x")):c.left=0,n.y<o.top+3?(c.top=o.top+3-n.y<5?-5:-20,r.startScrolling(t,"y")):n.y>o.bottom-3?(c.top=n.y-o.bottom+3<5?5:20,r.startScrolling(t,"y")):c.top=0,0===c.top&&0===c.left?s():l()}})}var r=t("../../lib/helper"),o=t("../instances"),i=t("../update-geometry");e.exports=function(t){var e=o.get(t);n(t,e)}},{"../../lib/helper":6,"../instances":18,"../update-geometry":19}],16:[function(t,e){"use strict";function n(t,e,n,i){function l(n,r){var o=t.scrollTop,i=t.scrollLeft,l=Math.abs(n),s=Math.abs(r);if(s>l){if(0>r&&o===e.contentHeight-e.containerHeight||r>0&&0===o)return!e.settings.swipePropagation}else if(l>s&&(0>n&&i===e.contentWidth-e.containerWidth||n>0&&0===i))return!e.settings.swipePropagation;return!0}function s(e,n){t.scrollTop=t.scrollTop-n,t.scrollLeft=t.scrollLeft-e,o(t)}function a(){w=!0}function c(){w=!1}function u(t){return t.targetTouches?t.targetTouches[0]:t}function d(t){return t.targetTouches&&1===t.targetTouches.length?!0:t.pointerType&&"mouse"!==t.pointerType&&t.pointerType!==t.MSPOINTER_TYPE_MOUSE?!0:!1}function p(t){if(d(t)){y=!0;var e=u(t);b.pageX=e.pageX,b.pageY=e.pageY,g=(new Date).getTime(),null!==m&&clearInterval(m),t.stopPropagation()}}function f(t){if(!w&&y&&d(t)){var e=u(t),n={pageX:e.pageX,pageY:e.pageY},r=n.pageX-b.pageX,o=n.pageY-b.pageY;s(r,o),b=n;var i=(new Date).getTime(),a=i-g;a>0&&(v.x=r/a,v.y=o/a,g=i),l(r,o)&&(t.stopPropagation(),t.preventDefault())}}function h(){!w&&y&&(y=!1,clearInterval(m),m=setInterval(function(){return r.get(t)?Math.abs(v.x)<.01&&Math.abs(v.y)<.01?void clearInterval(m):(s(30*v.x,30*v.y),v.x*=.8,void(v.y*=.8)):void clearInterval(m)},10))}var b={},g=0,v={},m=null,w=!1,y=!1;n&&(e.event.bind(window,"touchstart",a),e.event.bind(window,"touchend",c),e.event.bind(t,"touchstart",p),e.event.bind(t,"touchmove",f),e.event.bind(t,"touchend",h)),i&&(window.PointerEvent?(e.event.bind(window,"pointerdown",a),e.event.bind(window,"pointerup",c),e.event.bind(t,"pointerdown",p),e.event.bind(t,"pointermove",f),e.event.bind(t,"pointerup",h)):window.MSPointerEvent&&(e.event.bind(window,"MSPointerDown",a),e.event.bind(window,"MSPointerUp",c),e.event.bind(t,"MSPointerDown",p),e.event.bind(t,"MSPointerMove",f),e.event.bind(t,"MSPointerUp",h)))}var r=t("../instances"),o=t("../update-geometry");e.exports=function(t,e,o){var i=r.get(t);n(t,i,e,o)}},{"../instances":18,"../update-geometry":19}],17:[function(t,e){"use strict";var n=t("../lib/class"),r=t("../lib/helper"),o=t("./instances"),i=t("./update-geometry"),l=t("./handler/click-rail"),s=t("./handler/drag-scrollbar"),a=t("./handler/keyboard"),c=t("./handler/mouse-wheel"),u=t("./handler/native-scroll"),d=t("./handler/selection"),p=t("./handler/touch");e.exports=function(t,e){e="object"==typeof e?e:{},n.add(t,"ps-container");var f=o.add(t);f.settings=r.extend(f.settings,e),l(t),s(t),c(t),u(t),d(t),(r.env.supportsTouch||r.env.supportsIePointer)&&p(t,r.env.supportsTouch,r.env.supportsIePointer),f.settings.useKeyboard&&a(t),i(t)}},{"../lib/class":2,"../lib/helper":6,"./handler/click-rail":10,"./handler/drag-scrollbar":11,"./handler/keyboard":12,"./handler/mouse-wheel":13,"./handler/native-scroll":14,"./handler/selection":15,"./handler/touch":16,"./instances":18,"./update-geometry":19}],18:[function(t,e,n){"use strict";function r(t){var e=this;e.settings=d.clone(a),e.containerWidth=null,e.containerHeight=null,e.contentWidth=null,e.contentHeight=null,e.isRtl="rtl"===s.css(t,"direction"),e.event=new c,e.ownerDocument=t.ownerDocument||document,e.scrollbarXRail=s.appendTo(s.e("div","ps-scrollbar-x-rail"),t),e.scrollbarX=s.appendTo(s.e("div","ps-scrollbar-x"),e.scrollbarXRail),e.scrollbarXActive=null,e.scrollbarXWidth=null,e.scrollbarXLeft=null,e.scrollbarXBottom=d.toInt(s.css(e.scrollbarXRail,"bottom")),e.isScrollbarXUsingBottom=e.scrollbarXBottom===e.scrollbarXBottom,e.scrollbarXTop=e.isScrollbarXUsingBottom?null:d.toInt(s.css(e.scrollbarXRail,"top")),e.railBorderXWidth=d.toInt(s.css(e.scrollbarXRail,"borderLeftWidth"))+d.toInt(s.css(e.scrollbarXRail,"borderRightWidth")),e.railXMarginWidth=d.toInt(s.css(e.scrollbarXRail,"marginLeft"))+d.toInt(s.css(e.scrollbarXRail,"marginRight")),e.railXWidth=null,e.scrollbarYRail=s.appendTo(s.e("div","ps-scrollbar-y-rail"),t),e.scrollbarY=s.appendTo(s.e("div","ps-scrollbar-y"),e.scrollbarYRail),e.scrollbarYActive=null,e.scrollbarYHeight=null,e.scrollbarYTop=null,e.scrollbarYRight=d.toInt(s.css(e.scrollbarYRail,"right")),e.isScrollbarYUsingRight=e.scrollbarYRight===e.scrollbarYRight,e.scrollbarYLeft=e.isScrollbarYUsingRight?null:d.toInt(s.css(e.scrollbarYRail,"left")),e.scrollbarYOuterWidth=e.isRtl?d.outerWidth(e.scrollbarY):null,e.railBorderYWidth=d.toInt(s.css(e.scrollbarYRail,"borderTopWidth"))+d.toInt(s.css(e.scrollbarYRail,"borderBottomWidth")),e.railYMarginHeight=d.toInt(s.css(e.scrollbarYRail,"marginTop"))+d.toInt(s.css(e.scrollbarYRail,"marginBottom")),e.railYHeight=null}function o(t){return"undefined"==typeof t.dataset?t.getAttribute("data-ps-id"):t.dataset.psId}function i(t,e){"undefined"==typeof t.dataset?t.setAttribute("data-ps-id",e):t.dataset.psId=e}function l(t){"undefined"==typeof t.dataset?t.removeAttribute("data-ps-id"):delete t.dataset.psId}var s=t("../lib/dom"),a=t("./default-setting"),c=t("../lib/event-manager"),u=t("../lib/guid"),d=t("../lib/helper"),p={};n.add=function(t){var e=u();return i(t,e),p[e]=new r(t),p[e]},n.remove=function(t){delete p[o(t)],l(t)},n.get=function(t){return p[o(t)]}},{"../lib/dom":3,"../lib/event-manager":4,"../lib/guid":5,"../lib/helper":6,"./default-setting":8}],19:[function(t,e){"use strict";function n(t,e){return t.settings.minScrollbarLength&&(e=Math.max(e,t.settings.minScrollbarLength)),t.settings.maxScrollbarLength&&(e=Math.min(e,t.settings.maxScrollbarLength)),e}function r(t,e){var n={width:e.railXWidth};n.left=e.isRtl?t.scrollLeft+e.containerWidth-e.contentWidth:t.scrollLeft,e.isScrollbarXUsingBottom?n.bottom=e.scrollbarXBottom-t.scrollTop:n.top=e.scrollbarXTop+t.scrollTop,i.css(e.scrollbarXRail,n);var r={top:t.scrollTop,height:e.railYHeight};e.isScrollbarYUsingRight?r.right=e.isRtl?e.contentWidth-t.scrollLeft-e.scrollbarYRight-e.scrollbarYOuterWidth:e.scrollbarYRight-t.scrollLeft:r.left=e.isRtl?t.scrollLeft+2*e.containerWidth-e.contentWidth-e.scrollbarYLeft-e.scrollbarYOuterWidth:e.scrollbarYLeft+t.scrollLeft,i.css(e.scrollbarYRail,r),i.css(e.scrollbarX,{left:e.scrollbarXLeft,width:e.scrollbarXWidth-e.railBorderXWidth}),i.css(e.scrollbarY,{top:e.scrollbarYTop,height:e.scrollbarYHeight-e.railBorderYWidth})}var o=t("../lib/class"),i=t("../lib/dom"),l=t("../lib/helper"),s=t("./instances");e.exports=function(t){var e=s.get(t);e.containerWidth=t.clientWidth,e.containerHeight=t.clientHeight,e.contentWidth=t.scrollWidth,e.contentHeight=t.scrollHeight,t.contains(e.scrollbarXRail)||i.appendTo(e.scrollbarXRail,t),t.contains(e.scrollbarYRail)||i.appendTo(e.scrollbarYRail,t),!e.settings.suppressScrollX&&e.containerWidth+e.settings.scrollXMarginOffset<e.contentWidth?(e.scrollbarXActive=!0,e.railXWidth=e.containerWidth-e.railXMarginWidth,e.scrollbarXWidth=n(e,l.toInt(e.railXWidth*e.containerWidth/e.contentWidth)),e.scrollbarXLeft=l.toInt(t.scrollLeft*(e.railXWidth-e.scrollbarXWidth)/(e.contentWidth-e.containerWidth))):(e.scrollbarXActive=!1,e.scrollbarXWidth=0,e.scrollbarXLeft=0,t.scrollLeft=0),!e.settings.suppressScrollY&&e.containerHeight+e.settings.scrollYMarginOffset<e.contentHeight?(e.scrollbarYActive=!0,e.railYHeight=e.containerHeight-e.railYMarginHeight,e.scrollbarYHeight=n(e,l.toInt(e.railYHeight*e.containerHeight/e.contentHeight)),e.scrollbarYTop=l.toInt(t.scrollTop*(e.railYHeight-e.scrollbarYHeight)/(e.contentHeight-e.containerHeight))):(e.scrollbarYActive=!1,e.scrollbarYHeight=0,e.scrollbarYTop=0,t.scrollTop=0),e.scrollbarXLeft>=e.railXWidth-e.scrollbarXWidth&&(e.scrollbarXLeft=e.railXWidth-e.scrollbarXWidth),e.scrollbarYTop>=e.railYHeight-e.scrollbarYHeight&&(e.scrollbarYTop=e.railYHeight-e.scrollbarYHeight),r(t,e),o[e.scrollbarXActive?"add":"remove"](t,"ps-active-x"),o[e.scrollbarYActive?"add":"remove"](t,"ps-active-y")}},{"../lib/class":2,"../lib/dom":3,"../lib/helper":6,"./instances":18}],20:[function(t,e){"use strict";var n=t("../lib/dom"),r=t("./instances"),o=t("./update-geometry");e.exports=function(t){var e=r.get(t);n.css(e.scrollbarXRail,"display","none"),n.css(e.scrollbarYRail,"display","none"),o(t),n.css(e.scrollbarXRail,"display","block"),n.css(e.scrollbarYRail,"display","block")}},{"../lib/dom":3,"./instances":18,"./update-geometry":19}]},{},[1]);
;/*})'"*/;/*})'"*/
(function($, Drupal) {
  Drupal.behaviors.RelaYoutubeEmbed = {
    attach: function(context, settings) {

      $('body', context).once('youtube-embed', function() {
        function hideControl() {
          $('.video-sound-toggle').fadeOut();
        }

        /**
         * Detect if audio autoplay is allowed by the browser.
         * Uses Web Audio API - no external files needed.
         * @returns {Promise<boolean>} Resolves true if autoplay allowed, false otherwise.
         */
        function canAutoplayAudio() {
          return new Promise(function(resolve) {
            try {
              var AudioContext = window.AudioContext || window.webkitAudioContext;
              if (!AudioContext) {
                resolve(false);
                return;
              }
              var ctx = new AudioContext();
              // If context starts suspended, autoplay is blocked
              if (ctx.state === 'suspended') {
                ctx.close();
                resolve(false);
              } else {
                // Create a silent oscillator and try to play it
                var oscillator = ctx.createOscillator();
                var gain = ctx.createGain();
                gain.gain.value = 0; // Silent
                oscillator.connect(gain);
                gain.connect(ctx.destination);
                oscillator.start(0);
                oscillator.stop(ctx.currentTime + 0.001);
                // Give it a moment to see if it gets suspended
                setTimeout(function() {
                  var allowed = ctx.state === 'running';
                  ctx.close();
                  resolve(allowed);
                }, 50);
              }
            } catch (e) {
              resolve(false);
            }
          });
        }
        if (typeof settings.relaVideo !== 'undefined') {
          if (settings.relaVideo.videoSource == 'youtube') {

            if (settings.relaVideo.sound == 'muted') {
              $('.video-sound-toggle').hide();
            }
            var videoID = settings.relaVideo.videoID;
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/player_api';
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            var tv,
              playerDefaults = {
                autoplay: 0,
                autohide: 1,
                modestbranding: 0,
                rel: 0,
                showinfo: 0,
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                iv_load_policy: 3,
                vq: 'hd1080'

              };

            var startTime = 0.5;
            if (videoID == 'ohhUuVPFFUY') {
              startTime = 0.5
            }
            var vid = [{
              'videoId': videoID,
              'startSeconds': startTime
            }];

            window.onYouTubePlayerAPIReady = function() {
              tv = new YT.Player('tv', {
                events: {
                  'onReady': onPlayerReady,
                  'onStateChange': onPlayerStateChange
                },
                playerVars: playerDefaults
              });

              vidRescale();

            }

            function onPlayerReady() {
              tv.loadVideoById(vid[0]);

              if (settings.relaVideo.sound == 'muted') {
                tv.mute();
                $('.video-sound-toggle').hide();
                return;
              }
              $('.overlay-trigger', context).click(function() {
                tv.mute();
              });

              // Check if autoplay is allowed using Web Audio API.
              canAutoplayAudio().then(function(allowed) {
                if (allowed) {
                  $('.video-sound-toggle').hide();
                } else {
                  tv.mute();
                  $('.video-sound-toggle').removeClass('hidden').addClass('animated');
                  setTimeout(hideControl, 8000);
                }
              });



            }

            function onPlayerStateChange(e) {

              if (e.data === 1) {
                $('#tv').addClass('active');
              } else if (e.data === 0) {
                tv.seekTo(vid[0].startSeconds)
              }
            }

            function vidRescale() {

              var w = $('.tv .screen').parent().width(),
                h = $('.tv .screen').parent().height() + 150;

              if (w / h > 16 / 9) {
                tv.setSize(w, w / 16 * 9);
                $('.tv .screen').css({
                  'left': '0px'
                });
              } else {
                tv.setSize(h / 9 * 16, h);
                $('.tv .screen').css({
                  'left': -($('.tv .screen').outerWidth() - w) / 2
                });
              }
            }

            $(window).on('resize', function() {
              if (tv) {
                vidRescale();
              }
            });

            $('.hi span').on('click', function() {
              $('#tv').toggleClass('mute');
              if ($('#tv').hasClass('mute')) {
                tv.mute();
              } else {
                tv.unMute();
              }
            });

            $('.video-sound-toggle').click(function() {
              if ($(this).hasClass('muted')) {
                tv.unMute();
                setTimeout(hideControl, 1000);
              } else {
                tv.mute();
              }

              $(this).toggleClass('muted');
            });

          } // end VideoID definition check.
        } // Youtube check
        if (typeof settings.relaVideo !== 'undefined') {
          if (settings.relaVideo.videoSource == 'vimeo') {
            $('.screen').addClass('active');

            var playerID = '#vimeo-fullscreen';
            var playerIframe = $(playerID)[0];
            var player = new Vimeo.Player(playerIframe);
            if (settings.relaVideo.sound == 'muted') {
              player.setVolume(0);
              $('.video-sound-toggle').hide();
            }
            vimeoRescale();
            player.play().then(function() {
              // the video was played
              $('.vimeo-play-btn .video-status-icon').removeClass('fa-play').addClass('fa-pause');
              $('.vimeo-play-btn').attr('data-status', 'playing');

            }).catch(function(error) {
              switch (error.name) {
                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  console.log('Pass error');
                  break;

                case 'PrivacyError':
                  console.log('Vimeo Video is private. Cannot play');
                  break;

                default:
                  console.log(error.name);
                  break;
              }
            });

            $('.vimeo-play-btn').click(function(){
              var status = $(this).attr('data-status');
              if (status == 'playing') {
                player.pause();
                $('.vimeo-play-btn .video-status-icon').removeClass('fa-pause').addClass('fa-play');
                $('.vimeo-play-btn').attr('data-status', 'paused');
              }
              if (status == 'paused') {
                player.play();
                $('.vimeo-play-btn .video-status-icon').removeClass('fa-play').addClass('fa-pause');
                $('.vimeo-play-btn').attr('data-status', 'playing');
              }

            });

            // Check if autoplay is allowed using Web Audio API.
            // Note: Due to a Vimeo bug, we always mute and show the toggle button.
            canAutoplayAudio().then(function(allowed) {
              player.setVolume(0);
              $('.video-sound-toggle').removeClass('hidden').addClass('animated');
              setTimeout(hideControl, allowed ? 10000 : 8000);
            });

            $('.video-sound-toggle').click(function() {
              if ($(this).hasClass('muted')) {
                player.setMuted(false);
                player.setVolume(1);
                setTimeout(hideControl, 1000);
              } else {
                player.setVolume(0);
              }

              $(this).toggleClass('muted');
            });

            $('.vimeo-sound-toggle').click(function() {
              if ($(this).hasClass('muted')) {
                player.setMuted(false);
                player.setVolume(1);
              } else {
                player.setMuted(true);
                player.setVolume(0);
              }

              $(this).toggleClass('muted');
            });

            function vimeoRescale() {
              var $player = $(playerID);
              if (!$player.length) {
                return;
              }

              var $screen = $player.closest('.screen');
              var $container = $screen.closest('.tv');
              if (!$screen.length) {
                $screen = $player.parent();
              }
              if (!$container.length) {
                $container = $screen.parent();
              }

              var w = $container.width(),
                h = $container.height() + 200;

              if (!w || !h) {
                return;
              }

              if (w / h > 16 / 9) {
                $screen.add($player).width(w).height(w / 16 * 9);
                $screen.add($player).css({
                  'left': '0px'
                });
              } else {
                $screen.add($player).width(h / 9 * 16).height(h);
                $screen.add($player).css({
                  'left': -(h / 9 * 16 - w) / 2
                });
              }
            } // End viemo rescale
            window.relaVimeoRescale = vimeoRescale;
            $(window).on('resize', function() {
              vimeoRescale();
            });
          } // End settings check.
        } // Emd Vimeo
      }); // end body

    } //end attach
  }
})(jQuery, Drupal);
;/*})'"*/;/*})'"*/
/*!
 * Packery PACKAGED v2.1.1
 * Gapless, draggable grid layouts
 *
 * Licensed GPLv3 for open source use
 * or Packery Commercial License for commercial use
 *
 * http://packery.metafizzy.co
 * Copyright 2016 Metafizzy
 */

! function(t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("jquery-bridget/jquery-bridget", ["jquery"], function(i) {
    e(t, i)
  }) : "object" == typeof module && module.exports ? module.exports = e(t, require("jquery")) : t.jQueryBridget = e(t, t.jQuery)
}(window, function(t, e) {
  "use strict";

  function i(i, s, a) {
    function h(t, e, n) {
      var o, s = "$()." + i + '("' + e + '")';
      return t.each(function(t, h) {
        var u = a.data(h, i);
        if (!u) return void r(i + " not initialized. Cannot call methods, i.e. " + s);
        var c = u[e];
        if (!c || "_" == e.charAt(0)) return void r(s + " is not a valid method");
        var d = c.apply(u, n);
        o = void 0 === o ? d : o
      }), void 0 !== o ? o : t
    }

    function u(t, e) {
      t.each(function(t, n) {
        var o = a.data(n, i);
        o ? (o.option(e), o._init()) : (o = new s(n, e), a.data(n, i, o))
      })
    }
    a = a || e || t.jQuery, a && (s.prototype.option || (s.prototype.option = function(t) {
      a.isPlainObject(t) && (this.options = a.extend(!0, this.options, t))
    }), a.fn[i] = function(t) {
      if ("string" == typeof t) {
        var e = o.call(arguments, 1);
        return h(this, t, e)
      }
      return u(this, t), this
    }, n(a))
  }

  function n(t) {
    !t || t && t.bridget || (t.bridget = i)
  }
  var o = Array.prototype.slice,
    s = t.console,
    r = "undefined" == typeof s ? function() {} : function(t) {
      s.error(t)
    };
  return n(e || t.jQuery), i
}),
function(t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("get-size/get-size", [], function() {
    return e()
  }) : "object" == typeof module && module.exports ? module.exports = e() : t.getSize = e()
}(window, function() {
  "use strict";

  function t(t) {
    var e = parseFloat(t),
      i = -1 == t.indexOf("%") && !isNaN(e);
    return i && e
  }

  function e() {}

  function i() {
    for (var t = {
        width: 0,
        height: 0,
        innerWidth: 0,
        innerHeight: 0,
        outerWidth: 0,
        outerHeight: 0
      }, e = 0; u > e; e++) {
      var i = h[e];
      t[i] = 0
    }
    return t
  }

  function n(t) {
    var e = getComputedStyle(t);
    return e || a("Style returned " + e + ". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"), e
  }

  function o() {
    if (!c) {
      c = !0;
      var e = document.createElement("div");
      e.style.width = "200px", e.style.padding = "1px 2px 3px 4px", e.style.borderStyle = "solid", e.style.borderWidth = "1px 2px 3px 4px", e.style.boxSizing = "border-box";
      var i = document.body || document.documentElement;
      i.appendChild(e);
      var o = n(e);
      s.isBoxSizeOuter = r = 200 == t(o.width), i.removeChild(e)
    }
  }

  function s(e) {
    if (o(), "string" == typeof e && (e = document.querySelector(e)), e && "object" == typeof e && e.nodeType) {
      var s = n(e);
      if ("none" == s.display) return i();
      var a = {};
      a.width = e.offsetWidth, a.height = e.offsetHeight;
      for (var c = a.isBorderBox = "border-box" == s.boxSizing, d = 0; u > d; d++) {
        var f = h[d],
          l = s[f],
          p = parseFloat(l);
        a[f] = isNaN(p) ? 0 : p
      }
      var g = a.paddingLeft + a.paddingRight,
        m = a.paddingTop + a.paddingBottom,
        y = a.marginLeft + a.marginRight,
        v = a.marginTop + a.marginBottom,
        _ = a.borderLeftWidth + a.borderRightWidth,
        x = a.borderTopWidth + a.borderBottomWidth,
        b = c && r,
        E = t(s.width);
      E !== !1 && (a.width = E + (b ? 0 : g + _));
      var T = t(s.height);
      return T !== !1 && (a.height = T + (b ? 0 : m + x)), a.innerWidth = a.width - (g + _), a.innerHeight = a.height - (m + x), a.outerWidth = a.width + y, a.outerHeight = a.height + v, a
    }
  }
  var r, a = "undefined" == typeof console ? e : function(t) {
      console.error(t)
    },
    h = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"],
    u = h.length,
    c = !1;
  return s
}),
function(t, e) {
  "function" == typeof define && define.amd ? define("ev-emitter/ev-emitter", e) : "object" == typeof module && module.exports ? module.exports = e() : t.EvEmitter = e()
}(this, function() {
  function t() {}
  var e = t.prototype;
  return e.on = function(t, e) {
    if (t && e) {
      var i = this._events = this._events || {},
        n = i[t] = i[t] || [];
      return -1 == n.indexOf(e) && n.push(e), this
    }
  }, e.once = function(t, e) {
    if (t && e) {
      this.on(t, e);
      var i = this._onceEvents = this._onceEvents || {},
        n = i[t] = i[t] || {};
      return n[e] = !0, this
    }
  }, e.off = function(t, e) {
    var i = this._events && this._events[t];
    if (i && i.length) {
      var n = i.indexOf(e);
      return -1 != n && i.splice(n, 1), this
    }
  }, e.emitEvent = function(t, e) {
    var i = this._events && this._events[t];
    if (i && i.length) {
      var n = 0,
        o = i[n];
      e = e || [];
      for (var s = this._onceEvents && this._onceEvents[t]; o;) {
        var r = s && s[o];
        r && (this.off(t, o), delete s[o]), o.apply(this, e), n += r ? 0 : 1, o = i[n]
      }
      return this
    }
  }, t
}),
function(t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("desandro-matches-selector/matches-selector", e) : "object" == typeof module && module.exports ? module.exports = e() : t.matchesSelector = e()
}(window, function() {
  "use strict";
  var t = function() {
    var t = Element.prototype;
    if (t.matches) return "matches";
    if (t.matchesSelector) return "matchesSelector";
    for (var e = ["webkit", "moz", "ms", "o"], i = 0; i < e.length; i++) {
      var n = e[i],
        o = n + "MatchesSelector";
      if (t[o]) return o
    }
  }();
  return function(e, i) {
    return e[t](i)
  }
}),
function(t, e) {
  "function" == typeof define && define.amd ? define("fizzy-ui-utils/utils", ["desandro-matches-selector/matches-selector"], function(i) {
    return e(t, i)
  }) : "object" == typeof module && module.exports ? module.exports = e(t, require("desandro-matches-selector")) : t.fizzyUIUtils = e(t, t.matchesSelector)
}(window, function(t, e) {
  var i = {};
  i.extend = function(t, e) {
    for (var i in e) t[i] = e[i];
    return t
  }, i.modulo = function(t, e) {
    return (t % e + e) % e
  }, i.makeArray = function(t) {
    var e = [];
    if (Array.isArray(t)) e = t;
    else if (t && "number" == typeof t.length)
      for (var i = 0; i < t.length; i++) e.push(t[i]);
    else e.push(t);
    return e
  }, i.removeFrom = function(t, e) {
    var i = t.indexOf(e); - 1 != i && t.splice(i, 1)
  }, i.getParent = function(t, i) {
    for (; t != document.body;)
      if (t = t.parentNode, e(t, i)) return t
  }, i.getQueryElement = function(t) {
    return "string" == typeof t ? document.querySelector(t) : t
  }, i.handleEvent = function(t) {
    var e = "on" + t.type;
    this[e] && this[e](t)
  }, i.filterFindElements = function(t, n) {
    t = i.makeArray(t);
    var o = [];
    return t.forEach(function(t) {
      if (t instanceof HTMLElement) {
        if (!n) return void o.push(t);
        e(t, n) && o.push(t);
        for (var i = t.querySelectorAll(n), s = 0; s < i.length; s++) o.push(i[s])
      }
    }), o
  }, i.debounceMethod = function(t, e, i) {
    var n = t.prototype[e],
      o = e + "Timeout";
    t.prototype[e] = function() {
      var t = this[o];
      t && clearTimeout(t);
      var e = arguments,
        s = this;
      this[o] = setTimeout(function() {
        n.apply(s, e), delete s[o]
      }, i || 100)
    }
  }, i.docReady = function(t) {
    "complete" == document.readyState ? t() : document.addEventListener("DOMContentLoaded", t)
  }, i.toDashed = function(t) {
    return t.replace(/(.)([A-Z])/g, function(t, e, i) {
      return e + "-" + i
    }).toLowerCase()
  };
  var n = t.console;
  return i.htmlInit = function(e, o) {
    i.docReady(function() {
      var s = i.toDashed(o),
        r = "data-" + s,
        a = document.querySelectorAll("[" + r + "]"),
        h = document.querySelectorAll(".js-" + s),
        u = i.makeArray(a).concat(i.makeArray(h)),
        c = r + "-options",
        d = t.jQuery;
      u.forEach(function(t) {
        var i, s = t.getAttribute(r) || t.getAttribute(c);
        try {
          i = s && JSON.parse(s)
        } catch (a) {
          return void(n && n.error("Error parsing " + r + " on " + t.className + ": " + a))
        }
        var h = new e(t, i);
        d && d.data(t, o, h)
      })
    })
  }, i
}),
function(t, e) {
  "function" == typeof define && define.amd ? define("outlayer/item", ["ev-emitter/ev-emitter", "get-size/get-size"], e) : "object" == typeof module && module.exports ? module.exports = e(require("ev-emitter"), require("get-size")) : (t.Outlayer = {}, t.Outlayer.Item = e(t.EvEmitter, t.getSize))
}(window, function(t, e) {
  "use strict";

  function i(t) {
    for (var e in t) return !1;
    return e = null, !0
  }

  function n(t, e) {
    t && (this.element = t, this.layout = e, this.position = {
      x: 0,
      y: 0
    }, this._create())
  }

  function o(t) {
    return t.replace(/([A-Z])/g, function(t) {
      return "-" + t.toLowerCase()
    })
  }
  var s = document.documentElement.style,
    r = "string" == typeof s.transition ? "transition" : "WebkitTransition",
    a = "string" == typeof s.transform ? "transform" : "WebkitTransform",
    h = {
      WebkitTransition: "webkitTransitionEnd",
      transition: "transitionend"
    }[r],
    u = {
      transform: a,
      transition: r,
      transitionDuration: r + "Duration",
      transitionProperty: r + "Property",
      transitionDelay: r + "Delay"
    },
    c = n.prototype = Object.create(t.prototype);
  c.constructor = n, c._create = function() {
    this._transn = {
      ingProperties: {},
      clean: {},
      onEnd: {}
    }, this.css({
      position: "absolute"
    })
  }, c.handleEvent = function(t) {
    var e = "on" + t.type;
    this[e] && this[e](t)
  }, c.getSize = function() {
    this.size = e(this.element)
  }, c.css = function(t) {
    var e = this.element.style;
    for (var i in t) {
      var n = u[i] || i;
      e[n] = t[i]
    }
  }, c.getPosition = function() {
    var t = getComputedStyle(this.element),
      e = this.layout._getOption("originLeft"),
      i = this.layout._getOption("originTop"),
      n = t[e ? "left" : "right"],
      o = t[i ? "top" : "bottom"],
      s = this.layout.size,
      r = -1 != n.indexOf("%") ? parseFloat(n) / 100 * s.width : parseInt(n, 10),
      a = -1 != o.indexOf("%") ? parseFloat(o) / 100 * s.height : parseInt(o, 10);
    r = isNaN(r) ? 0 : r, a = isNaN(a) ? 0 : a, r -= e ? s.paddingLeft : s.paddingRight, a -= i ? s.paddingTop : s.paddingBottom, this.position.x = r, this.position.y = a
  }, c.layoutPosition = function() {
    var t = this.layout.size,
      e = {},
      i = this.layout._getOption("originLeft"),
      n = this.layout._getOption("originTop"),
      o = i ? "paddingLeft" : "paddingRight",
      s = i ? "left" : "right",
      r = i ? "right" : "left",
      a = this.position.x + t[o];
    e[s] = this.getXValue(a), e[r] = "";
    var h = n ? "paddingTop" : "paddingBottom",
      u = n ? "top" : "bottom",
      c = n ? "bottom" : "top",
      d = this.position.y + t[h];
    e[u] = this.getYValue(d), e[c] = "", this.css(e), this.emitEvent("layout", [this])
  }, c.getXValue = function(t) {
    var e = this.layout._getOption("horizontal");
    return this.layout.options.percentPosition && !e ? t / this.layout.size.width * 100 + "%" : t + "px"
  }, c.getYValue = function(t) {
    var e = this.layout._getOption("horizontal");
    return this.layout.options.percentPosition && e ? t / this.layout.size.height * 100 + "%" : t + "px"
  }, c._transitionTo = function(t, e) {
    this.getPosition();
    var i = this.position.x,
      n = this.position.y,
      o = parseInt(t, 10),
      s = parseInt(e, 10),
      r = o === this.position.x && s === this.position.y;
    if (this.setPosition(t, e), r && !this.isTransitioning) return void this.layoutPosition();
    var a = t - i,
      h = e - n,
      u = {};
    u.transform = this.getTranslate(a, h), this.transition({
      to: u,
      onTransitionEnd: {
        transform: this.layoutPosition
      },
      isCleaning: !0
    })
  }, c.getTranslate = function(t, e) {
    var i = this.layout._getOption("originLeft"),
      n = this.layout._getOption("originTop");
    return t = i ? t : -t, e = n ? e : -e, "translate3d(" + t + "px, " + e + "px, 0)"
  }, c.goTo = function(t, e) {
    this.setPosition(t, e), this.layoutPosition()
  }, c.moveTo = c._transitionTo, c.setPosition = function(t, e) {
    this.position.x = parseInt(t, 10), this.position.y = parseInt(e, 10)
  }, c._nonTransition = function(t) {
    this.css(t.to), t.isCleaning && this._removeStyles(t.to);
    for (var e in t.onTransitionEnd) t.onTransitionEnd[e].call(this)
  }, c.transition = function(t) {
    if (!parseFloat(this.layout.options.transitionDuration)) return void this._nonTransition(t);
    var e = this._transn;
    for (var i in t.onTransitionEnd) e.onEnd[i] = t.onTransitionEnd[i];
    for (i in t.to) e.ingProperties[i] = !0, t.isCleaning && (e.clean[i] = !0);
    if (t.from) {
      this.css(t.from);
      var n = this.element.offsetHeight;
      n = null
    }
    this.enableTransition(t.to), this.css(t.to), this.isTransitioning = !0
  };
  var d = "opacity," + o(a);
  c.enableTransition = function() {
    if (!this.isTransitioning) {
      var t = this.layout.options.transitionDuration;
      t = "number" == typeof t ? t + "ms" : t, this.css({
        transitionProperty: d,
        transitionDuration: t,
        transitionDelay: this.staggerDelay || 0
      }), this.element.addEventListener(h, this, !1)
    }
  }, c.onwebkitTransitionEnd = function(t) {
    this.ontransitionend(t)
  }, c.onotransitionend = function(t) {
    this.ontransitionend(t)
  };
  var f = {
    "-webkit-transform": "transform"
  };
  c.ontransitionend = function(t) {
    if (t.target === this.element) {
      var e = this._transn,
        n = f[t.propertyName] || t.propertyName;
      if (delete e.ingProperties[n], i(e.ingProperties) && this.disableTransition(), n in e.clean && (this.element.style[t.propertyName] = "", delete e.clean[n]), n in e.onEnd) {
        var o = e.onEnd[n];
        o.call(this), delete e.onEnd[n]
      }
      this.emitEvent("transitionEnd", [this])
    }
  }, c.disableTransition = function() {
    this.removeTransitionStyles(), this.element.removeEventListener(h, this, !1), this.isTransitioning = !1
  }, c._removeStyles = function(t) {
    var e = {};
    for (var i in t) e[i] = "";
    this.css(e)
  };
  var l = {
    transitionProperty: "",
    transitionDuration: "",
    transitionDelay: ""
  };
  return c.removeTransitionStyles = function() {
    this.css(l)
  }, c.stagger = function(t) {
    t = isNaN(t) ? 0 : t, this.staggerDelay = t + "ms"
  }, c.removeElem = function() {
    this.element.parentNode.removeChild(this.element), this.css({
      display: ""
    }), this.emitEvent("remove", [this])
  }, c.remove = function() {
    return r && parseFloat(this.layout.options.transitionDuration) ? (this.once("transitionEnd", function() {
      this.removeElem()
    }), void this.hide()) : void this.removeElem()
  }, c.reveal = function() {
    delete this.isHidden, this.css({
      display: ""
    });
    var t = this.layout.options,
      e = {},
      i = this.getHideRevealTransitionEndProperty("visibleStyle");
    e[i] = this.onRevealTransitionEnd, this.transition({
      from: t.hiddenStyle,
      to: t.visibleStyle,
      isCleaning: !0,
      onTransitionEnd: e
    })
  }, c.onRevealTransitionEnd = function() {
    this.isHidden || this.emitEvent("reveal")
  }, c.getHideRevealTransitionEndProperty = function(t) {
    var e = this.layout.options[t];
    if (e.opacity) return "opacity";
    for (var i in e) return i
  }, c.hide = function() {
    this.isHidden = !0, this.css({
      display: ""
    });
    var t = this.layout.options,
      e = {},
      i = this.getHideRevealTransitionEndProperty("hiddenStyle");
    e[i] = this.onHideTransitionEnd, this.transition({
      from: t.visibleStyle,
      to: t.hiddenStyle,
      isCleaning: !0,
      onTransitionEnd: e
    })
  }, c.onHideTransitionEnd = function() {
    this.isHidden && (this.css({
      display: "none"
    }), this.emitEvent("hide"))
  }, c.destroy = function() {
    this.css({
      position: "",
      left: "",
      right: "",
      top: "",
      bottom: "",
      transition: "",
      transform: ""
    })
  }, n
}),
function(t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("outlayer/outlayer", ["ev-emitter/ev-emitter", "get-size/get-size", "fizzy-ui-utils/utils", "./item"], function(i, n, o, s) {
    return e(t, i, n, o, s)
  }) : "object" == typeof module && module.exports ? module.exports = e(t, require("ev-emitter"), require("get-size"), require("fizzy-ui-utils"), require("./item")) : t.Outlayer = e(t, t.EvEmitter, t.getSize, t.fizzyUIUtils, t.Outlayer.Item)
}(window, function(t, e, i, n, o) {
  "use strict";

  function s(t, e) {
    var i = n.getQueryElement(t);
    if (!i) return void(h && h.error("Bad element for " + this.constructor.namespace + ": " + (i || t)));
    this.element = i, u && (this.$element = u(this.element)), this.options = n.extend({}, this.constructor.defaults), this.option(e);
    var o = ++d;
    this.element.outlayerGUID = o, f[o] = this, this._create();
    var s = this._getOption("initLayout");
    s && this.layout()
  }

  function r(t) {
    function e() {
      t.apply(this, arguments)
    }
    return e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e
  }

  function a(t) {
    if ("number" == typeof t) return t;
    var e = t.match(/(^\d*\.?\d*)(\w*)/),
      i = e && e[1],
      n = e && e[2];
    if (!i.length) return 0;
    i = parseFloat(i);
    var o = p[n] || 1;
    return i * o
  }
  var h = t.console,
    u = t.jQuery,
    c = function() {},
    d = 0,
    f = {};
  s.namespace = "outlayer", s.Item = o, s.defaults = {
    containerStyle: {
      position: "relative"
    },
    initLayout: !0,
    originLeft: !0,
    originTop: !0,
    resize: !0,
    resizeContainer: !0,
    transitionDuration: "0.4s",
    hiddenStyle: {
      opacity: 0,
      transform: "scale(0.001)"
    },
    visibleStyle: {
      opacity: 1,
      transform: "scale(1)"
    }
  };
  var l = s.prototype;
  n.extend(l, e.prototype), l.option = function(t) {
    n.extend(this.options, t)
  }, l._getOption = function(t) {
    var e = this.constructor.compatOptions[t];
    return e && void 0 !== this.options[e] ? this.options[e] : this.options[t]
  }, s.compatOptions = {
    initLayout: "isInitLayout",
    horizontal: "isHorizontal",
    layoutInstant: "isLayoutInstant",
    originLeft: "isOriginLeft",
    originTop: "isOriginTop",
    resize: "isResizeBound",
    resizeContainer: "isResizingContainer"
  }, l._create = function() {
    this.reloadItems(), this.stamps = [], this.stamp(this.options.stamp), n.extend(this.element.style, this.options.containerStyle);
    var t = this._getOption("resize");
    t && this.bindResize()
  }, l.reloadItems = function() {
    this.items = this._itemize(this.element.children)
  }, l._itemize = function(t) {
    for (var e = this._filterFindItemElements(t), i = this.constructor.Item, n = [], o = 0; o < e.length; o++) {
      var s = e[o],
        r = new i(s, this);
      n.push(r)
    }
    return n
  }, l._filterFindItemElements = function(t) {
    return n.filterFindElements(t, this.options.itemSelector)
  }, l.getItemElements = function() {
    return this.items.map(function(t) {
      return t.element
    })
  }, l.layout = function() {
    this._resetLayout(), this._manageStamps();
    var t = this._getOption("layoutInstant"),
      e = void 0 !== t ? t : !this._isLayoutInited;
    this.layoutItems(this.items, e), this._isLayoutInited = !0
  }, l._init = l.layout, l._resetLayout = function() {
    this.getSize()
  }, l.getSize = function() {
    this.size = i(this.element)
  }, l._getMeasurement = function(t, e) {
    var n, o = this.options[t];
    o ? ("string" == typeof o ? n = this.element.querySelector(o) : o instanceof HTMLElement && (n = o), this[t] = n ? i(n)[e] : o) : this[t] = 0
  }, l.layoutItems = function(t, e) {
    t = this._getItemsForLayout(t), this._layoutItems(t, e), this._postLayout()
  }, l._getItemsForLayout = function(t) {
    return t.filter(function(t) {
      return !t.isIgnored
    })
  }, l._layoutItems = function(t, e) {
    if (this._emitCompleteOnItems("layout", t), t && t.length) {
      var i = [];
      t.forEach(function(t) {
        var n = this._getItemLayoutPosition(t);
        n.item = t, n.isInstant = e || t.isLayoutInstant, i.push(n)
      }, this), this._processLayoutQueue(i)
    }
  }, l._getItemLayoutPosition = function() {
    return {
      x: 0,
      y: 0
    }
  }, l._processLayoutQueue = function(t) {
    this.updateStagger(), t.forEach(function(t, e) {
      this._positionItem(t.item, t.x, t.y, t.isInstant, e)
    }, this)
  }, l.updateStagger = function() {
    var t = this.options.stagger;
    return null === t || void 0 === t ? void(this.stagger = 0) : (this.stagger = a(t), this.stagger)
  }, l._positionItem = function(t, e, i, n, o) {
    n ? t.goTo(e, i) : (t.stagger(o * this.stagger), t.moveTo(e, i))
  }, l._postLayout = function() {
    this.resizeContainer()
  }, l.resizeContainer = function() {
    var t = this._getOption("resizeContainer");
    if (t) {
      var e = this._getContainerSize();
      e && (this._setContainerMeasure(e.width, !0), this._setContainerMeasure(e.height, !1))
    }
  }, l._getContainerSize = c, l._setContainerMeasure = function(t, e) {
    if (void 0 !== t) {
      var i = this.size;
      i.isBorderBox && (t += e ? i.paddingLeft + i.paddingRight + i.borderLeftWidth + i.borderRightWidth : i.paddingBottom + i.paddingTop + i.borderTopWidth + i.borderBottomWidth), t = Math.max(t, 0), this.element.style[e ? "width" : "height"] = t + "px"
    }
  }, l._emitCompleteOnItems = function(t, e) {
    function i() {
      o.dispatchEvent(t + "Complete", null, [e])
    }

    function n() {
      r++, r == s && i()
    }
    var o = this,
      s = e.length;
    if (!e || !s) return void i();
    var r = 0;
    e.forEach(function(e) {
      e.once(t, n)
    })
  }, l.dispatchEvent = function(t, e, i) {
    var n = e ? [e].concat(i) : i;
    if (this.emitEvent(t, n), u)
      if (this.$element = this.$element || u(this.element), e) {
        var o = u.Event(e);
        o.type = t, this.$element.trigger(o, i)
      } else this.$element.trigger(t, i)
  }, l.ignore = function(t) {
    var e = this.getItem(t);
    e && (e.isIgnored = !0)
  }, l.unignore = function(t) {
    var e = this.getItem(t);
    e && delete e.isIgnored
  }, l.stamp = function(t) {
    t = this._find(t), t && (this.stamps = this.stamps.concat(t), t.forEach(this.ignore, this))
  }, l.unstamp = function(t) {
    t = this._find(t), t && t.forEach(function(t) {
      n.removeFrom(this.stamps, t), this.unignore(t)
    }, this)
  }, l._find = function(t) {
    return t ? ("string" == typeof t && (t = this.element.querySelectorAll(t)), t = n.makeArray(t)) : void 0
  }, l._manageStamps = function() {
    this.stamps && this.stamps.length && (this._getBoundingRect(), this.stamps.forEach(this._manageStamp, this))
  }, l._getBoundingRect = function() {
    var t = this.element.getBoundingClientRect(),
      e = this.size;
    this._boundingRect = {
      left: t.left + e.paddingLeft + e.borderLeftWidth,
      top: t.top + e.paddingTop + e.borderTopWidth,
      right: t.right - (e.paddingRight + e.borderRightWidth),
      bottom: t.bottom - (e.paddingBottom + e.borderBottomWidth)
    }
  }, l._manageStamp = c, l._getElementOffset = function(t) {
    var e = t.getBoundingClientRect(),
      n = this._boundingRect,
      o = i(t),
      s = {
        left: e.left - n.left - o.marginLeft,
        top: e.top - n.top - o.marginTop,
        right: n.right - e.right - o.marginRight,
        bottom: n.bottom - e.bottom - o.marginBottom
      };
    return s
  }, l.handleEvent = n.handleEvent, l.bindResize = function() {
    t.addEventListener("resize", this), this.isResizeBound = !0
  }, l.unbindResize = function() {
    t.removeEventListener("resize", this), this.isResizeBound = !1
  }, l.onresize = function() {
    this.resize()
  }, n.debounceMethod(s, "onresize", 100), l.resize = function() {
    this.isResizeBound && this.needsResizeLayout() && this.layout()
  }, l.needsResizeLayout = function() {
    var t = i(this.element),
      e = this.size && t;
    return e && t.innerWidth !== this.size.innerWidth
  }, l.addItems = function(t) {
    var e = this._itemize(t);
    return e.length && (this.items = this.items.concat(e)), e
  }, l.appended = function(t) {
    var e = this.addItems(t);
    e.length && (this.layoutItems(e, !0), this.reveal(e))
  }, l.prepended = function(t) {
    var e = this._itemize(t);
    if (e.length) {
      var i = this.items.slice(0);
      this.items = e.concat(i), this._resetLayout(), this._manageStamps(), this.layoutItems(e, !0), this.reveal(e), this.layoutItems(i)
    }
  }, l.reveal = function(t) {
    if (this._emitCompleteOnItems("reveal", t), t && t.length) {
      var e = this.updateStagger();
      t.forEach(function(t, i) {
        t.stagger(i * e), t.reveal()
      })
    }
  }, l.hide = function(t) {
    if (this._emitCompleteOnItems("hide", t), t && t.length) {
      var e = this.updateStagger();
      t.forEach(function(t, i) {
        t.stagger(i * e), t.hide()
      })
    }
  }, l.revealItemElements = function(t) {
    var e = this.getItems(t);
    this.reveal(e)
  }, l.hideItemElements = function(t) {
    var e = this.getItems(t);
    this.hide(e)
  }, l.getItem = function(t) {
    for (var e = 0; e < this.items.length; e++) {
      var i = this.items[e];
      if (i.element == t) return i
    }
  }, l.getItems = function(t) {
    t = n.makeArray(t);
    var e = [];
    return t.forEach(function(t) {
      var i = this.getItem(t);
      i && e.push(i)
    }, this), e
  }, l.remove = function(t) {
    var e = this.getItems(t);
    this._emitCompleteOnItems("remove", e), e && e.length && e.forEach(function(t) {
      t.remove(), n.removeFrom(this.items, t)
    }, this)
  }, l.destroy = function() {
    var t = this.element.style;
    t.height = "", t.position = "", t.width = "", this.items.forEach(function(t) {
      t.destroy()
    }), this.unbindResize();
    var e = this.element.outlayerGUID;
    delete f[e], delete this.element.outlayerGUID, u && u.removeData(this.element, this.constructor.namespace)
  }, s.data = function(t) {
    t = n.getQueryElement(t);
    var e = t && t.outlayerGUID;
    return e && f[e]
  }, s.create = function(t, e) {
    var i = r(s);
    return i.defaults = n.extend({}, s.defaults), n.extend(i.defaults, e), i.compatOptions = n.extend({}, s.compatOptions), i.namespace = t, i.data = s.data, i.Item = r(o), n.htmlInit(i, t), u && u.bridget && u.bridget(t, i), i
  };
  var p = {
    ms: 1,
    s: 1e3
  };
  return s.Item = o, s
}),
function(t, e) {
  "function" == typeof define && define.amd ? define("packery/js/rect", e) : "object" == typeof module && module.exports ? module.exports = e() : (t.Packery = t.Packery || {}, t.Packery.Rect = e())
}(window, function() {
  "use strict";

  function t(e) {
    for (var i in t.defaults) this[i] = t.defaults[i];
    for (i in e) this[i] = e[i]
  }
  t.defaults = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  var e = t.prototype;
  return e.contains = function(t) {
    var e = t.width || 0,
      i = t.height || 0;
    return this.x <= t.x && this.y <= t.y && this.x + this.width >= t.x + e && this.y + this.height >= t.y + i
  }, e.overlaps = function(t) {
    var e = this.x + this.width,
      i = this.y + this.height,
      n = t.x + t.width,
      o = t.y + t.height;
    return this.x < n && e > t.x && this.y < o && i > t.y
  }, e.getMaximalFreeRects = function(e) {
    if (!this.overlaps(e)) return !1;
    var i, n = [],
      o = this.x + this.width,
      s = this.y + this.height,
      r = e.x + e.width,
      a = e.y + e.height;
    return this.y < e.y && (i = new t({
      x: this.x,
      y: this.y,
      width: this.width,
      height: e.y - this.y
    }), n.push(i)), o > r && (i = new t({
      x: r,
      y: this.y,
      width: o - r,
      height: this.height
    }), n.push(i)), s > a && (i = new t({
      x: this.x,
      y: a,
      width: this.width,
      height: s - a
    }), n.push(i)), this.x < e.x && (i = new t({
      x: this.x,
      y: this.y,
      width: e.x - this.x,
      height: this.height
    }), n.push(i)), n
  }, e.canFit = function(t) {
    return this.width >= t.width && this.height >= t.height
  }, t
}),
function(t, e) {
  if ("function" == typeof define && define.amd) define("packery/js/packer", ["./rect"], e);
  else if ("object" == typeof module && module.exports) module.exports = e(require("./rect"));
  else {
    var i = t.Packery = t.Packery || {};
    i.Packer = e(i.Rect)
  }
}(window, function(t) {
  "use strict";

  function e(t, e, i) {
    this.width = t || 0, this.height = e || 0, this.sortDirection = i || "downwardLeftToRight", this.reset()
  }
  var i = e.prototype;
  i.reset = function() {
    this.spaces = [];
    var e = new t({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height
    });
    this.spaces.push(e), this.sorter = n[this.sortDirection] || n.downwardLeftToRight
  }, i.pack = function(t) {
    for (var e = 0; e < this.spaces.length; e++) {
      var i = this.spaces[e];
      if (i.canFit(t)) {
        this.placeInSpace(t, i);
        break
      }
    }
  }, i.columnPack = function(t) {
    for (var e = 0; e < this.spaces.length; e++) {
      var i = this.spaces[e],
        n = i.x <= t.x && i.x + i.width >= t.x + t.width && i.height >= t.height - .01;
      if (n) {
        t.y = i.y, this.placed(t);
        break
      }
    }
  }, i.rowPack = function(t) {
    for (var e = 0; e < this.spaces.length; e++) {
      var i = this.spaces[e],
        n = i.y <= t.y && i.y + i.height >= t.y + t.height && i.width >= t.width - .01;
      if (n) {
        t.x = i.x, this.placed(t);
        break
      }
    }
  }, i.placeInSpace = function(t, e) {
    t.x = e.x, t.y = e.y, this.placed(t)
  }, i.placed = function(t) {
    for (var e = [], i = 0; i < this.spaces.length; i++) {
      var n = this.spaces[i],
        o = n.getMaximalFreeRects(t);
      o ? e.push.apply(e, o) : e.push(n)
    }
    this.spaces = e, this.mergeSortSpaces()
  }, i.mergeSortSpaces = function() {
    e.mergeRects(this.spaces), this.spaces.sort(this.sorter)
  }, i.addSpace = function(t) {
    this.spaces.push(t), this.mergeSortSpaces()
  }, e.mergeRects = function(t) {
    var e = 0,
      i = t[e];
    t: for (; i;) {
      for (var n = 0, o = t[e + n]; o;) {
        if (o == i) n++;
        else {
          if (o.contains(i)) {
            t.splice(e, 1), i = t[e];
            continue t
          }
          i.contains(o) ? t.splice(e + n, 1) : n++
        }
        o = t[e + n]
      }
      e++, i = t[e]
    }
    return t
  };
  var n = {
    downwardLeftToRight: function(t, e) {
      return t.y - e.y || t.x - e.x
    },
    rightwardTopToBottom: function(t, e) {
      return t.x - e.x || t.y - e.y
    }
  };
  return e
}),
function(t, e) {
  "function" == typeof define && define.amd ? define("packery/js/item", ["outlayer/outlayer", "./rect"], e) : "object" == typeof module && module.exports ? module.exports = e(require("outlayer"), require("./rect")) : t.Packery.Item = e(t.Outlayer, t.Packery.Rect)
}(window, function(t, e) {
  "use strict";
  var i = document.documentElement.style,
    n = "string" == typeof i.transform ? "transform" : "WebkitTransform",
    o = function() {
      t.Item.apply(this, arguments)
    },
    s = o.prototype = Object.create(t.Item.prototype),
    r = s._create;
  s._create = function() {
    r.call(this), this.rect = new e
  };
  var a = s.moveTo;
  return s.moveTo = function(t, e) {
    var i = Math.abs(this.position.x - t),
      n = Math.abs(this.position.y - e),
      o = this.layout.dragItemCount && !this.isPlacing && !this.isTransitioning && 1 > i && 1 > n;
    return o ? void this.goTo(t, e) : void a.apply(this, arguments)
  }, s.enablePlacing = function() {
    this.removeTransitionStyles(), this.isTransitioning && n && (this.element.style[n] = "none"), this.isTransitioning = !1, this.getSize(), this.layout._setRectSize(this.element, this.rect), this.isPlacing = !0
  }, s.disablePlacing = function() {
    this.isPlacing = !1
  }, s.removeElem = function() {
    this.element.parentNode.removeChild(this.element), this.layout.packer.addSpace(this.rect), this.emitEvent("remove", [this])
  }, s.showDropPlaceholder = function() {
    var t = this.dropPlaceholder;
    t || (t = this.dropPlaceholder = document.createElement("div"), t.className = "packery-drop-placeholder", t.style.position = "absolute"), t.style.width = this.size.width + "px", t.style.height = this.size.height + "px", this.positionDropPlaceholder(), this.layout.element.appendChild(t)
  }, s.positionDropPlaceholder = function() {
    this.dropPlaceholder.style[n] = "translate(" + this.rect.x + "px, " + this.rect.y + "px)"
  }, s.hideDropPlaceholder = function() {
    var t = this.dropPlaceholder.parentNode;
    t && t.removeChild(this.dropPlaceholder)
  }, o
}),
function(t, e) {
  "function" == typeof define && define.amd ? define(["get-size/get-size", "outlayer/outlayer", "packery/js/rect", "packery/js/packer", "packery/js/item"], e) : "object" == typeof module && module.exports ? module.exports = e(require("get-size"), require("outlayer"), require("./rect"), require("./packer"), require("./item")) : t.Packery = e(t.getSize, t.Outlayer, t.Packery.Rect, t.Packery.Packer, t.Packery.Item)
}(window, function(t, e, i, n, o) {
  "use strict";

  function s(t, e) {
    return t.position.y - e.position.y || t.position.x - e.position.x
  }

  function r(t, e) {
    return t.position.x - e.position.x || t.position.y - e.position.y
  }

  function a(t, e) {
    var i = e.x - t.x,
      n = e.y - t.y;
    return Math.sqrt(i * i + n * n)
  }
  i.prototype.canFit = function(t) {
    return this.width >= t.width - 1 && this.height >= t.height - 1
  };
  var h = e.create("packery");
  h.Item = o;
  var u = h.prototype;
  u._create = function() {
    e.prototype._create.call(this), this.packer = new n, this.shiftPacker = new n, this.isEnabled = !0, this.dragItemCount = 0;
    var t = this;
    this.handleDraggabilly = {
      dragStart: function() {
        t.itemDragStart(this.element)
      },
      dragMove: function() {
        t.itemDragMove(this.element, this.position.x, this.position.y)
      },
      dragEnd: function() {
        t.itemDragEnd(this.element)
      }
    }, this.handleUIDraggable = {
      start: function(e, i) {
        i && t.itemDragStart(e.currentTarget)
      },
      drag: function(e, i) {
        i && t.itemDragMove(e.currentTarget, i.position.left, i.position.top)
      },
      stop: function(e, i) {
        i && t.itemDragEnd(e.currentTarget)
      }
    }
  }, u._resetLayout = function() {
    this.getSize(), this._getMeasurements();
    var t, e, i;
    this._getOption("horizontal") ? (t = 1 / 0, e = this.size.innerHeight + this.gutter, i = "rightwardTopToBottom") : (t = this.size.innerWidth + this.gutter, e = 1 / 0, i = "downwardLeftToRight"), this.packer.width = this.shiftPacker.width = t, this.packer.height = this.shiftPacker.height = e, this.packer.sortDirection = this.shiftPacker.sortDirection = i, this.packer.reset(), this.maxY = 0, this.maxX = 0
  }, u._getMeasurements = function() {
    this._getMeasurement("columnWidth", "width"), this._getMeasurement("rowHeight", "height"), this._getMeasurement("gutter", "width")
  }, u._getItemLayoutPosition = function(t) {
    if (this._setRectSize(t.element, t.rect), this.isShifting || this.dragItemCount > 0) {
      var e = this._getPackMethod();
      this.packer[e](t.rect)
    } else this.packer.pack(t.rect);
    return this._setMaxXY(t.rect), t.rect
  }, u.shiftLayout = function() {
    this.isShifting = !0, this.layout(), delete this.isShifting
  }, u._getPackMethod = function() {
    return this._getOption("horizontal") ? "rowPack" : "columnPack"
  }, u._setMaxXY = function(t) {
    this.maxX = Math.max(t.x + t.width, this.maxX), this.maxY = Math.max(t.y + t.height, this.maxY)
  }, u._setRectSize = function(e, i) {
    var n = t(e),
      o = n.outerWidth,
      s = n.outerHeight;
    (o || s) && (o = this._applyGridGutter(o, this.columnWidth), s = this._applyGridGutter(s, this.rowHeight)), i.width = Math.min(o, this.packer.width), i.height = Math.min(s, this.packer.height)
  }, u._applyGridGutter = function(t, e) {
    if (!e) return t + this.gutter;
    e += this.gutter;
    var i = t % e,
      n = i && 1 > i ? "round" : "ceil";
    return t = Math[n](t / e) * e
  }, u._getContainerSize = function() {
    return this._getOption("horizontal") ? {
      width: this.maxX - this.gutter
    } : {
      height: this.maxY - this.gutter
    }
  }, u._manageStamp = function(t) {
    var e, n = this.getItem(t);
    if (n && n.isPlacing) e = n.rect;
    else {
      var o = this._getElementOffset(t);
      e = new i({
        x: this._getOption("originLeft") ? o.left : o.right,
        y: this._getOption("originTop") ? o.top : o.bottom
      })
    }
    this._setRectSize(t, e), this.packer.placed(e), this._setMaxXY(e)
  }, u.sortItemsByPosition = function() {
    var t = this._getOption("horizontal") ? r : s;
    this.items.sort(t)
  }, u.fit = function(t, e, i) {
    var n = this.getItem(t);
    n && (this.stamp(n.element), n.enablePlacing(), this.updateShiftTargets(n), e = void 0 === e ? n.rect.x : e, i = void 0 === i ? n.rect.y : i, this.shift(n, e, i), this._bindFitEvents(n), n.moveTo(n.rect.x, n.rect.y), this.shiftLayout(), this.unstamp(n.element), this.sortItemsByPosition(), n.disablePlacing())
  }, u._bindFitEvents = function(t) {
    function e() {
      n++, 2 == n && i.dispatchEvent("fitComplete", null, [t])
    }
    var i = this,
      n = 0;
    t.once("layout", e), this.once("layoutComplete", e)
  }, u.resize = function() {
    this.isResizeBound && this.needsResizeLayout() && (this.options.shiftPercentResize ? this.resizeShiftPercentLayout() : this.layout())
  }, u.needsResizeLayout = function() {
    var e = t(this.element),
      i = this._getOption("horizontal") ? "innerHeight" : "innerWidth";
    return e[i] != this.size[i]
  }, u.resizeShiftPercentLayout = function() {
    var e = this._getItemsForLayout(this.items),
      i = this._getOption("horizontal"),
      n = i ? "y" : "x",
      o = i ? "height" : "width",
      s = i ? "rowHeight" : "columnWidth",
      r = i ? "innerHeight" : "innerWidth",
      a = this[s];
    if (a = a && a + this.gutter) {
      this._getMeasurements();
      var h = this[s] + this.gutter;
      e.forEach(function(t) {
        var e = Math.round(t.rect[n] / a);
        t.rect[n] = e * h
      })
    } else {
      var u = t(this.element)[r] + this.gutter,
        c = this.packer[o];
      e.forEach(function(t) {
        t.rect[n] = t.rect[n] / c * u
      })
    }
    this.shiftLayout()
  }, u.itemDragStart = function(t) {
    if (this.isEnabled) {
      this.stamp(t);
      var e = this.getItem(t);
      e && (e.enablePlacing(), e.showDropPlaceholder(), this.dragItemCount++, this.updateShiftTargets(e))
    }
  }, u.updateShiftTargets = function(t) {
    this.shiftPacker.reset(), this._getBoundingRect();
    var e = this._getOption("originLeft"),
      n = this._getOption("originTop");
    this.stamps.forEach(function(t) {
      var o = this.getItem(t);
      if (!o || !o.isPlacing) {
        var s = this._getElementOffset(t),
          r = new i({
            x: e ? s.left : s.right,
            y: n ? s.top : s.bottom
          });
        this._setRectSize(t, r), this.shiftPacker.placed(r)
      }
    }, this);
    var o = this._getOption("horizontal"),
      s = o ? "rowHeight" : "columnWidth",
      r = o ? "height" : "width";
    this.shiftTargetKeys = [], this.shiftTargets = [];
    var a, h = this[s];
    if (h = h && h + this.gutter) {
      var u = Math.ceil(t.rect[r] / h),
        c = Math.floor((this.shiftPacker[r] + this.gutter) / h);
      a = (c - u) * h;
      for (var d = 0; c > d; d++) {
        var f = o ? 0 : d * h,
          l = o ? d * h : 0;
        this._addShiftTarget(f, l, a)
      }
    } else a = this.shiftPacker[r] + this.gutter - t.rect[r], this._addShiftTarget(0, 0, a);
    var p = this._getItemsForLayout(this.items),
      g = this._getPackMethod();
    p.forEach(function(t) {
      var e = t.rect;
      this._setRectSize(t.element, e), this.shiftPacker[g](e), this._addShiftTarget(e.x, e.y, a);
      var i = o ? e.x + e.width : e.x,
        n = o ? e.y : e.y + e.height;
      if (this._addShiftTarget(i, n, a), h)
        for (var s = Math.round(e[r] / h), u = 1; s > u; u++) {
          var c = o ? i : e.x + h * u,
            d = o ? e.y + h * u : n;
          this._addShiftTarget(c, d, a)
        }
    }, this)
  }, u._addShiftTarget = function(t, e, i) {
    var n = this._getOption("horizontal") ? e : t;
    if (!(0 !== n && n > i)) {
      var o = t + "," + e,
        s = -1 != this.shiftTargetKeys.indexOf(o);
      s || (this.shiftTargetKeys.push(o), this.shiftTargets.push({
        x: t,
        y: e
      }))
    }
  }, u.shift = function(t, e, i) {
    var n, o = 1 / 0,
      s = {
        x: e,
        y: i
      };
    this.shiftTargets.forEach(function(t) {
      var e = a(t, s);
      o > e && (n = t, o = e)
    }), t.rect.x = n.x, t.rect.y = n.y
  };
  var c = 120;
  u.itemDragMove = function(t, e, i) {
    function n() {
      s.shift(o, e, i), o.positionDropPlaceholder(), s.layout()
    }
    var o = this.isEnabled && this.getItem(t);
    if (o) {
      e -= this.size.paddingLeft, i -= this.size.paddingTop;
      var s = this,
        r = new Date;
      this._itemDragTime && r - this._itemDragTime < c ? (clearTimeout(this.dragTimeout), this.dragTimeout = setTimeout(n, c)) : (n(), this._itemDragTime = r)
    }
  }, u.itemDragEnd = function(t) {
    function e() {
      n++, 2 == n && (i.element.classList.remove("is-positioning-post-drag"), i.hideDropPlaceholder(), o.dispatchEvent("dragItemPositioned", null, [i]))
    }
    var i = this.isEnabled && this.getItem(t);
    if (i) {
      clearTimeout(this.dragTimeout), i.element.classList.add("is-positioning-post-drag");
      var n = 0,
        o = this;
      i.once("layout", e), this.once("layoutComplete", e), i.moveTo(i.rect.x, i.rect.y), this.layout(), this.dragItemCount = Math.max(0, this.dragItemCount - 1), this.sortItemsByPosition(), i.disablePlacing(), this.unstamp(i.element)
    }
  }, u.bindDraggabillyEvents = function(t) {
    this._bindDraggabillyEvents(t, "on")
  }, u.unbindDraggabillyEvents = function(t) {
    this._bindDraggabillyEvents(t, "off")
  }, u._bindDraggabillyEvents = function(t, e) {
    var i = this.handleDraggabilly;
    t[e]("dragStart", i.dragStart), t[e]("dragMove", i.dragMove), t[e]("dragEnd", i.dragEnd)
  }, u.bindUIDraggableEvents = function(t) {
    this._bindUIDraggableEvents(t, "on")
  }, u.unbindUIDraggableEvents = function(t) {
    this._bindUIDraggableEvents(t, "off")
  }, u._bindUIDraggableEvents = function(t, e) {
    var i = this.handleUIDraggable;
    t[e]("dragstart", i.start)[e]("drag", i.drag)[e]("dragstop", i.stop)
  };
  var d = u.destroy;
  return u.destroy = function() {
    d.apply(this, arguments), this.isEnabled = !1
  }, h.Rect = i, h.Packer = n, h
});
;/*})'"*/;/*})'"*/
(function($, Drupal, undefined) {

  Drupal.behaviors.Isotopes = {
    attach: function(context, settings) {
      if ($('.packery').length > 0) {
        $('.packery').packery({
          itemSelector: '.grid-item',
          transitionDuration: '0.2s',
        });
      }
      if ($('.packery-gutter').length > 0) {
        $('.packery-gutter').packery({
          itemSelector: '.grid-item',
          transitionDuration: '0.2s',
          gutter: 10
        });
      }

    }
  }








})(jQuery, Drupal);
;/*})'"*/;/*})'"*/
/*
 * FlowType.JS v1.1
 * Copyright 2013-2014, Simple Focus http://simplefocus.com/
 *
 * FlowType.JS by Simple Focus (http://simplefocus.com/)
 * is licensed under the MIT License. Read a copy of the
 * license in the LICENSE.txt file or at
 * http://choosealicense.com/licenses/mit
 *
 * Thanks to Giovanni Difeterici (http://www.gdifeterici.com/)
 */

(function($) {
  $.fn.flowtype = function(options) {

    // Establish default settings/variables
    // ====================================
    var settings = $.extend({
        maximum: 9999,
        minimum: 1,
        maxFont: 9999,
        minFont: 1,
        fontRatio: 35
      }, options),

      // Do the magic math
      // =================
      changes = function(el) {
        var $el = $(el),
          elw = $el.width(),
          width = elw > settings.maximum ? settings.maximum : elw < settings.minimum ? settings.minimum : elw,
          fontBase = width / settings.fontRatio,
          fontSize = fontBase > settings.maxFont ? settings.maxFont : fontBase < settings.minFont ? settings.minFont : fontBase;
        $el.css('font-size', fontSize + 'px');
      };

    // Make the magic visible
    // ======================
    return this.each(function() {
      // Context for resize callback
      var that = this;
      // Make changes upon resize
      $(window).resize(function() {
        changes(that);
      });
      // Set changes on load
      changes(this);
    });
  };
}(jQuery));
;/*})'"*/;/*})'"*/
// DD Exit Intent Pop Up Script
// By Dynamic Drive: http://www.dynamicdrive.com
// Oct 5th 17'- Creation Date

var ddexitpop = (function($) {

  var defaults = {
    delayregister: 0,
    delayshow: 200,
    hideaftershow: true,
    displayfreq: 'always',
    persistcookie: 'ddexitpop_shown',
    fxclass: 'rubberBand',
    mobileshowafter: 3000,
    onddexitpop: function() {}
  }
  var animatedcssclasses = ["bounce", "flash", "pulse", "rubberBand", "shake", "swing", "tada", "wobble", "jello", "bounceIn", "bounceInDown", "bounceInLeft", "bounceInRight", "bounceInUp", "fadeIn", "fadeInDown", "fadeInDownBig", "fadeInLeft", "fadeInLeftBig", "fadeInRight", "fadeInRightBig", "fadeInUp", "fadeInUpBig", "flipInX", "flipInY", "lightSpeedIn", "rotateIn", "rotateInDownLeft", "rotateInDownRight", "rotateInUpLeft", "rotateInUpRight", "slideInUp", "slideInDown", "slideInLeft", "slideInRight", "zoomIn", "zoomInDown", "zoomInLeft", "zoomInRight", "zoomInUp", "rollIn"]

  var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
  var crossdeviceclickevt = isTouch ? 'touchstart' : 'click'

  function getCookie(Name) {
    var re = new RegExp(Name + "=[^;]+", "i"); //construct RE to search for target name/value pair
    if (document.cookie.match(re)) //if cookie found
      return document.cookie.match(re)[0].split("=")[1] //return its value
    return null
  }

  function setCookie(name, value, duration) {
    var expirestr = '',
      expiredate = new Date()
    if (typeof duration != "undefined") { //if set persistent cookie
      var offsetmin = parseInt(duration) * (/hr/i.test(duration) ? 60 : /day/i.test(duration) ? 60 * 24 : 1)
      expiredate.setMinutes(expiredate.getMinutes() + offsetmin)
      expirestr = "; expires=" + expiredate.toUTCString()
    }
    document.cookie = name + "=" + value + "; path=/" + expirestr
  }

  function makeajaxfriendly(url) { // function to ensure hostname portion of URL 'http://mysite.com/pathtofile' is same origin as current hostname (ie: www.mysite.com)
    if (/^http/i.test(url)) {
      var dummyurl = document.createElement('a')
      dummyurl.href = url
      return dummyurl.href.replace(RegExp(dummyurl.hostname, 'i'), location.hostname)
    } else {
      return url
    }
  }

  var ddexitpop = {

    wrappermarkup: '',
    $wrapperref: null,
    $contentref: null,
    displaypopup: true, // Boolean to ensure popup is only opened once when showpopup() is called
    delayshowtimer: null, // setTimeout reference to delay showing of exit pop after mouse moves outside  browser top edge
    settings: null,

    ajaxrequest: function(filepath) {
      var ajaxfriendlyurl = makeajaxfriendly(filepath)
      $.ajax({
        url: ajaxfriendlyurl,
        dataType: 'html',
        error: function(ajaxrequest) {
          alert('Error fetching content.<br />Server Response: ' + ajaxrequest.responseText)
        },
        success: function(content) {
          ddexitpop.$contentref = $(content).appendTo(document.body)
          ddexitpop.setup(ddexitpop.$contentref)
        }
      })
    },

    detectexit: function(e) {
      if (e.clientY < 60) {
        this.delayshowtimer = setTimeout(function() {
          ddexitpop.showpopup()
          ddexitpop.settings.onddexitpop(ddexitpop.$contentref)
        }, this.settings.delayshow)
      }
    },

    detectenter: function(e) {
      if (e.clientY < 60) {
        clearTimeout(this.delayshowtimer)
      }
    },

    showpopup: function() {
      if (this.$contentref != null && this.displaypopup == true) {
        if (this.settings.randomizefxclass === true) {
          this.settings.fxclass = animatedcssclasses[Math.floor(Math.random() * animatedcssclasses.length)]
        }
        this.$wrapperref.addClass('open')
        this.$contentref.addClass(this.settings.fxclass)
        this.displaypopup = false
        if (this.settings.hideaftershow) {
          $(document).off('mouseleave.registerexit')
        }
      }
    },

    hidepopup: function() {
      this.$wrapperref.removeClass('open')
      this.$contentref.removeClass(this.settings.fxclass)
      this.displaypopup = true
    },

    setup: function($content) {
      this.$contentref.addClass('animated')
      this.$wrapperref = $(this.wrappermarkup).appendTo(document.body)
      this.$wrapperref.append(this.$contentref)
      this.$wrapperref.find('.veil').on(crossdeviceclickevt, function() {
        ddexitpop.hidepopup()
      })
      if (this.settings.displayfreq != 'always') {
        if (this.settings.displayfreq == 'session') {
          setCookie(this.settings.persistcookie, 'yes')
        } else if (/\d+(hr|day)/i.test(this.settings.displayfreq)) {
          setCookie(this.settings.persistcookie, 'yes', this.settings.displayfreq)
          setCookie(this.settings.persistcookie + '_duration', this.settings.displayfreq, this.settings.displayfreq) // remember the duration of persistence
        }
      }
    },

    init: function(options) {

      var s = $.extend({}, defaults, options)

      var persistduration = getCookie(s.persistcookie + '_duration')
      if (persistduration && (s.displayfreq == 'session' || s.displayfreq != persistduration)) {
        setCookie(s.persistcookie, 'yes', -1) // delete persistent cookie (if stored)
        setCookie(s.persistcookie + '_duration', '', -1) // delete persistent cookie duration (if stored)
      }
      if (s.displayfreq != 'always' && getCookie(s.persistcookie)) {
        return
      }

      if (s.fxclass == 'random') {
        s.randomizefxclass = true
      }
      this.settings = s
      if (s.contentsource[0] == 'ajax') {
        this.ajaxrequest(s.contentsource[1])
      } else if (s.contentsource[0] == 'id') {
        this.$contentref = $('#' + s.contentsource[1]).appendTo(document.body)
        this.setup(this.$contentref)
      } else if (s.contentsource[0] == 'inline') {
        this.$contentref = $(s.contentsource[1]).appendTo(document.body)
        this.setup(this.$contentref)
      }
      setTimeout(function() {
        $(document).on('mouseleave.registerexit', function(e) {
          ddexitpop.detectexit(e)
        })
        $(document).on('mouseenter.registerenter', function(e) {
          ddexitpop.detectenter(e)
        })
      }, s.delayregister)

      if (s.mobileshowafter > 0) {
        $(document).one('touchstart', function() {
          setTimeout(function() {
            ddexitpop.showpopup()
          }, s.mobileshowafter)
        })
      }
    }
  }

  return ddexitpop


})(jQuery);
;/*})'"*/;/*})'"*/
/**
 * @file
 * Some basic behaviors and utility functions for Views.
 */
(function ($) {

  Drupal.Views = {};

  /**
   * JQuery UI tabs, Views integration component.
   */
  Drupal.behaviors.viewsTabs = {
    attach: function (context) {
      if ($.viewsUi && $.viewsUi.tabs) {
        $('#views-tabset').once('views-processed').viewsTabs({
          selectedClass: 'active'
        });
      }

      $('a.views-remove-link').once('views-processed').click(function (event) {
        var id = $(this).attr('id').replace('views-remove-link-', '');
        $('#views-row-' + id).hide();
        $('#views-removed-' + id).get(0).checked = true;
        event.preventDefault();
      });
      // Here is to handle display deletion
      // (checking in the hidden checkbox and hiding out the row).
      $('a.display-remove-link')
        .addClass('display-processed')
        .click(function () {
          var id = $(this).attr('id').replace('display-remove-link-', '');
          $('#display-row-' + id).hide();
          $('#display-removed-' + id).get(0).checked = true;
          return false;
        });
    }
  };

  /**
   * Helper function to parse a querystring.
   */
  Drupal.Views.parseQueryString = function (query) {
    var args = {};
    var pos = query.indexOf('?');
    if (pos != -1) {
      query = query.substring(pos + 1);
    }
    var pairs = query.split('&');
    for (var i in pairs) {
      if (typeof(pairs[i]) == 'string') {
        var pair = pairs[i].split('=');
        // Ignore the 'q' path argument, if present.
        if (pair[0] != 'q' && pair[1]) {
          args[decodeURIComponent(pair[0].replace(/\+/g, ' '))] = decodeURIComponent(pair[1].replace(/\+/g, ' '));
        }
      }
    }
    return args;
  };

  /**
   * Helper function to return a view's arguments based on a path.
   */
  Drupal.Views.parseViewArgs = function (href, viewPath) {
    // Provide language prefix.
    if (Drupal.settings.pathPrefix) {
      var viewPath = Drupal.settings.pathPrefix + viewPath;
    }
    var returnObj = {};
    var path = Drupal.Views.getPath(href);
    // Ensure there is a correct path.
    if (viewPath && path.substring(0, viewPath.length + 1) == viewPath + '/') {
      var args = decodeURIComponent(path.substring(viewPath.length + 1, path.length));
      returnObj.view_args = args;
      returnObj.view_path = path;
    }
    return returnObj;
  };

  /**
   * Strip off the protocol plus domain from an href.
   */
  Drupal.Views.pathPortion = function (href) {
    // Remove e.g. http://example.com if present.
    var protocol = window.location.protocol;
    if (href.substring(0, protocol.length) == protocol) {
      // 2 is the length of the '//' that normally follows the protocol.
      href = href.substring(href.indexOf('/', protocol.length + 2));
    }
    return href;
  };

  /**
   * Return the Drupal path portion of an href.
   */
  Drupal.Views.getPath = function (href) {
    href = Drupal.Views.pathPortion(href);
    href = href.substring(Drupal.settings.basePath.length, href.length);
    // 3 is the length of the '?q=' added to the URL without clean URLs.
    if (href.substring(0, 3) == '?q=') {
      href = href.substring(3, href.length);
    }
    var chars = ['#', '?', '&'];
    for (var i in chars) {
      if (href.indexOf(chars[i]) > -1) {
        href = href.substr(0, href.indexOf(chars[i]));
      }
    }
    return href;
  };

})(jQuery);
;/*})'"*/;/*})'"*/
/*! skrollr 0.6.30 (2015-08-12) | Alexander Prinzhorn - https://github.com/Prinzhorn/skrollr | Free to use under terms of MIT license */
!function(a,b,c){"use strict";function d(c){if(e=b.documentElement,f=b.body,T(),ha=this,c=c||{},ma=c.constants||{},c.easing)for(var d in c.easing)W[d]=c.easing[d];ta=c.edgeStrategy||"set",ka={beforerender:c.beforerender,render:c.render,keyframe:c.keyframe},la=c.forceHeight!==!1,la&&(Ka=c.scale||1),na=c.mobileDeceleration||y,pa=c.smoothScrolling!==!1,qa=c.smoothScrollingDuration||A,ra={targetTop:ha.getScrollTop()},Sa=(c.mobileCheck||function(){return/Android|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent||navigator.vendor||a.opera)})(),Sa?(ja=b.getElementById(c.skrollrBody||z),ja&&ga(),X(),Ea(e,[s,v],[t])):Ea(e,[s,u],[t]),ha.refresh(),wa(a,"resize orientationchange",function(){var a=e.clientWidth,b=e.clientHeight;(b!==Pa||a!==Oa)&&(Pa=b,Oa=a,Qa=!0)});var g=U();return function h(){$(),va=g(h)}(),ha}var e,f,g={get:function(){return ha},init:function(a){return ha||new d(a)},VERSION:"0.6.30"},h=Object.prototype.hasOwnProperty,i=a.Math,j=a.getComputedStyle,k="touchstart",l="touchmove",m="touchcancel",n="touchend",o="skrollable",p=o+"-before",q=o+"-between",r=o+"-after",s="skrollr",t="no-"+s,u=s+"-desktop",v=s+"-mobile",w="linear",x=1e3,y=.004,z="skrollr-body",A=200,B="start",C="end",D="center",E="bottom",F="___skrollable_id",G=/^(?:input|textarea|button|select)$/i,H=/^\s+|\s+$/g,I=/^data(?:-(_\w+))?(?:-?(-?\d*\.?\d+p?))?(?:-?(start|end|top|center|bottom))?(?:-?(top|center|bottom))?$/,J=/\s*(@?[\w\-\[\]]+)\s*:\s*(.+?)\s*(?:;|$)/gi,K=/^(@?[a-z\-]+)\[(\w+)\]$/,L=/-([a-z0-9_])/g,M=function(a,b){return b.toUpperCase()},N=/[\-+]?[\d]*\.?[\d]+/g,O=/\{\?\}/g,P=/rgba?\(\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+/g,Q=/[a-z\-]+-gradient/g,R="",S="",T=function(){var a=/^(?:O|Moz|webkit|ms)|(?:-(?:o|moz|webkit|ms)-)/;if(j){var b=j(f,null);for(var c in b)if(R=c.match(a)||+c==c&&b[c].match(a))break;if(!R)return void(R=S="");R=R[0],"-"===R.slice(0,1)?(S=R,R={"-webkit-":"webkit","-moz-":"Moz","-ms-":"ms","-o-":"O"}[R]):S="-"+R.toLowerCase()+"-"}},U=function(){var b=a.requestAnimationFrame||a[R.toLowerCase()+"RequestAnimationFrame"],c=Ha();return(Sa||!b)&&(b=function(b){var d=Ha()-c,e=i.max(0,1e3/60-d);return a.setTimeout(function(){c=Ha(),b()},e)}),b},V=function(){var b=a.cancelAnimationFrame||a[R.toLowerCase()+"CancelAnimationFrame"];return(Sa||!b)&&(b=function(b){return a.clearTimeout(b)}),b},W={begin:function(){return 0},end:function(){return 1},linear:function(a){return a},quadratic:function(a){return a*a},cubic:function(a){return a*a*a},swing:function(a){return-i.cos(a*i.PI)/2+.5},sqrt:function(a){return i.sqrt(a)},outCubic:function(a){return i.pow(a-1,3)+1},bounce:function(a){var b;if(.5083>=a)b=3;else if(.8489>=a)b=9;else if(.96208>=a)b=27;else{if(!(.99981>=a))return 1;b=91}return 1-i.abs(3*i.cos(a*b*1.028)/b)}};d.prototype.refresh=function(a){var d,e,f=!1;for(a===c?(f=!0,ia=[],Ra=0,a=b.getElementsByTagName("*")):a.length===c&&(a=[a]),d=0,e=a.length;e>d;d++){var g=a[d],h=g,i=[],j=pa,k=ta,l=!1;if(f&&F in g&&delete g[F],g.attributes){for(var m=0,n=g.attributes.length;n>m;m++){var p=g.attributes[m];if("data-anchor-target"!==p.name)if("data-smooth-scrolling"!==p.name)if("data-edge-strategy"!==p.name)if("data-emit-events"!==p.name){var q=p.name.match(I);if(null!==q){var r={props:p.value,element:g,eventType:p.name.replace(L,M)};i.push(r);var s=q[1];s&&(r.constant=s.substr(1));var t=q[2];/p$/.test(t)?(r.isPercentage=!0,r.offset=(0|t.slice(0,-1))/100):r.offset=0|t;var u=q[3],v=q[4]||u;u&&u!==B&&u!==C?(r.mode="relative",r.anchors=[u,v]):(r.mode="absolute",u===C?r.isEnd=!0:r.isPercentage||(r.offset=r.offset*Ka))}}else l=!0;else k=p.value;else j="off"!==p.value;else if(h=b.querySelector(p.value),null===h)throw'Unable to find anchor target "'+p.value+'"'}if(i.length){var w,x,y;!f&&F in g?(y=g[F],w=ia[y].styleAttr,x=ia[y].classAttr):(y=g[F]=Ra++,w=g.style.cssText,x=Da(g)),ia[y]={element:g,styleAttr:w,classAttr:x,anchorTarget:h,keyFrames:i,smoothScrolling:j,edgeStrategy:k,emitEvents:l,lastFrameIndex:-1},Ea(g,[o],[])}}}for(Aa(),d=0,e=a.length;e>d;d++){var z=ia[a[d][F]];z!==c&&(_(z),ba(z))}return ha},d.prototype.relativeToAbsolute=function(a,b,c){var d=e.clientHeight,f=a.getBoundingClientRect(),g=f.top,h=f.bottom-f.top;return b===E?g-=d:b===D&&(g-=d/2),c===E?g+=h:c===D&&(g+=h/2),g+=ha.getScrollTop(),g+.5|0},d.prototype.animateTo=function(a,b){b=b||{};var d=Ha(),e=ha.getScrollTop(),f=b.duration===c?x:b.duration;return oa={startTop:e,topDiff:a-e,targetTop:a,duration:f,startTime:d,endTime:d+f,easing:W[b.easing||w],done:b.done},oa.topDiff||(oa.done&&oa.done.call(ha,!1),oa=c),ha},d.prototype.stopAnimateTo=function(){oa&&oa.done&&oa.done.call(ha,!0),oa=c},d.prototype.isAnimatingTo=function(){return!!oa},d.prototype.isMobile=function(){return Sa},d.prototype.setScrollTop=function(b,c){return sa=c===!0,Sa?Ta=i.min(i.max(b,0),Ja):a.scrollTo(0,b),ha},d.prototype.getScrollTop=function(){return Sa?Ta:a.pageYOffset||e.scrollTop||f.scrollTop||0},d.prototype.getMaxScrollTop=function(){return Ja},d.prototype.on=function(a,b){return ka[a]=b,ha},d.prototype.off=function(a){return delete ka[a],ha},d.prototype.destroy=function(){var a=V();a(va),ya(),Ea(e,[t],[s,u,v]);for(var b=0,d=ia.length;d>b;b++)fa(ia[b].element);e.style.overflow=f.style.overflow="",e.style.height=f.style.height="",ja&&g.setStyle(ja,"transform","none"),ha=c,ja=c,ka=c,la=c,Ja=0,Ka=1,ma=c,na=c,La="down",Ma=-1,Oa=0,Pa=0,Qa=!1,oa=c,pa=c,qa=c,ra=c,sa=c,Ra=0,ta=c,Sa=!1,Ta=0,ua=c};var X=function(){var d,g,h,j,o,p,q,r,s,t,u,v;wa(e,[k,l,m,n].join(" "),function(a){var e=a.changedTouches[0];for(j=a.target;3===j.nodeType;)j=j.parentNode;switch(o=e.clientY,p=e.clientX,t=a.timeStamp,G.test(j.tagName)||a.preventDefault(),a.type){case k:d&&d.blur(),ha.stopAnimateTo(),d=j,g=q=o,h=p,s=t;break;case l:G.test(j.tagName)&&b.activeElement!==j&&a.preventDefault(),r=o-q,v=t-u,ha.setScrollTop(Ta-r,!0),q=o,u=t;break;default:case m:case n:var f=g-o,w=h-p,x=w*w+f*f;if(49>x){if(!G.test(d.tagName)){d.focus();var y=b.createEvent("MouseEvents");y.initMouseEvent("click",!0,!0,a.view,1,e.screenX,e.screenY,e.clientX,e.clientY,a.ctrlKey,a.altKey,a.shiftKey,a.metaKey,0,null),d.dispatchEvent(y)}return}d=c;var z=r/v;z=i.max(i.min(z,3),-3);var A=i.abs(z/na),B=z*A+.5*na*A*A,C=ha.getScrollTop()-B,D=0;C>Ja?(D=(Ja-C)/B,C=Ja):0>C&&(D=-C/B,C=0),A*=1-D,ha.animateTo(C+.5|0,{easing:"outCubic",duration:A})}}),a.scrollTo(0,0),e.style.overflow=f.style.overflow="hidden"},Y=function(){var a,b,c,d,f,g,h,j,k,l,m,n=e.clientHeight,o=Ba();for(j=0,k=ia.length;k>j;j++)for(a=ia[j],b=a.element,c=a.anchorTarget,d=a.keyFrames,f=0,g=d.length;g>f;f++)h=d[f],l=h.offset,m=o[h.constant]||0,h.frame=l,h.isPercentage&&(l*=n,h.frame=l),"relative"===h.mode&&(fa(b),h.frame=ha.relativeToAbsolute(c,h.anchors[0],h.anchors[1])-l,fa(b,!0)),h.frame+=m,la&&!h.isEnd&&h.frame>Ja&&(Ja=h.frame);for(Ja=i.max(Ja,Ca()),j=0,k=ia.length;k>j;j++){for(a=ia[j],d=a.keyFrames,f=0,g=d.length;g>f;f++)h=d[f],m=o[h.constant]||0,h.isEnd&&(h.frame=Ja-h.offset+m);a.keyFrames.sort(Ia)}},Z=function(a,b){for(var c=0,d=ia.length;d>c;c++){var e,f,i=ia[c],j=i.element,k=i.smoothScrolling?a:b,l=i.keyFrames,m=l.length,n=l[0],s=l[l.length-1],t=k<n.frame,u=k>s.frame,v=t?n:s,w=i.emitEvents,x=i.lastFrameIndex;if(t||u){if(t&&-1===i.edge||u&&1===i.edge)continue;switch(t?(Ea(j,[p],[r,q]),w&&x>-1&&(za(j,n.eventType,La),i.lastFrameIndex=-1)):(Ea(j,[r],[p,q]),w&&m>x&&(za(j,s.eventType,La),i.lastFrameIndex=m)),i.edge=t?-1:1,i.edgeStrategy){case"reset":fa(j);continue;case"ease":k=v.frame;break;default:case"set":var y=v.props;for(e in y)h.call(y,e)&&(f=ea(y[e].value),0===e.indexOf("@")?j.setAttribute(e.substr(1),f):g.setStyle(j,e,f));continue}}else 0!==i.edge&&(Ea(j,[o,q],[p,r]),i.edge=0);for(var z=0;m-1>z;z++)if(k>=l[z].frame&&k<=l[z+1].frame){var A=l[z],B=l[z+1];for(e in A.props)if(h.call(A.props,e)){var C=(k-A.frame)/(B.frame-A.frame);C=A.props[e].easing(C),f=da(A.props[e].value,B.props[e].value,C),f=ea(f),0===e.indexOf("@")?j.setAttribute(e.substr(1),f):g.setStyle(j,e,f)}w&&x!==z&&("down"===La?za(j,A.eventType,La):za(j,B.eventType,La),i.lastFrameIndex=z);break}}},$=function(){Qa&&(Qa=!1,Aa());var a,b,d=ha.getScrollTop(),e=Ha();if(oa)e>=oa.endTime?(d=oa.targetTop,a=oa.done,oa=c):(b=oa.easing((e-oa.startTime)/oa.duration),d=oa.startTop+b*oa.topDiff|0),ha.setScrollTop(d,!0);else if(!sa){var f=ra.targetTop-d;f&&(ra={startTop:Ma,topDiff:d-Ma,targetTop:d,startTime:Na,endTime:Na+qa}),e<=ra.endTime&&(b=W.sqrt((e-ra.startTime)/qa),d=ra.startTop+b*ra.topDiff|0)}if(sa||Ma!==d){La=d>Ma?"down":Ma>d?"up":La,sa=!1;var h={curTop:d,lastTop:Ma,maxTop:Ja,direction:La},i=ka.beforerender&&ka.beforerender.call(ha,h);i!==!1&&(Z(d,ha.getScrollTop()),Sa&&ja&&g.setStyle(ja,"transform","translate(0, "+-Ta+"px) "+ua),Ma=d,ka.render&&ka.render.call(ha,h)),a&&a.call(ha,!1)}Na=e},_=function(a){for(var b=0,c=a.keyFrames.length;c>b;b++){for(var d,e,f,g,h=a.keyFrames[b],i={};null!==(g=J.exec(h.props));)f=g[1],e=g[2],d=f.match(K),null!==d?(f=d[1],d=d[2]):d=w,e=e.indexOf("!")?aa(e):[e.slice(1)],i[f]={value:e,easing:W[d]};h.props=i}},aa=function(a){var b=[];return P.lastIndex=0,a=a.replace(P,function(a){return a.replace(N,function(a){return a/255*100+"%"})}),S&&(Q.lastIndex=0,a=a.replace(Q,function(a){return S+a})),a=a.replace(N,function(a){return b.push(+a),"{?}"}),b.unshift(a),b},ba=function(a){var b,c,d={};for(b=0,c=a.keyFrames.length;c>b;b++)ca(a.keyFrames[b],d);for(d={},b=a.keyFrames.length-1;b>=0;b--)ca(a.keyFrames[b],d)},ca=function(a,b){var c;for(c in b)h.call(a.props,c)||(a.props[c]=b[c]);for(c in a.props)b[c]=a.props[c]},da=function(a,b,c){var d,e=a.length;if(e!==b.length)throw"Can't interpolate between \""+a[0]+'" and "'+b[0]+'"';var f=[a[0]];for(d=1;e>d;d++)f[d]=a[d]+(b[d]-a[d])*c;return f},ea=function(a){var b=1;return O.lastIndex=0,a[0].replace(O,function(){return a[b++]})},fa=function(a,b){a=[].concat(a);for(var c,d,e=0,f=a.length;f>e;e++)d=a[e],c=ia[d[F]],c&&(b?(d.style.cssText=c.dirtyStyleAttr,Ea(d,c.dirtyClassAttr)):(c.dirtyStyleAttr=d.style.cssText,c.dirtyClassAttr=Da(d),d.style.cssText=c.styleAttr,Ea(d,c.classAttr)))},ga=function(){ua="translateZ(0)",g.setStyle(ja,"transform",ua);var a=j(ja),b=a.getPropertyValue("transform"),c=a.getPropertyValue(S+"transform"),d=b&&"none"!==b||c&&"none"!==c;d||(ua="")};g.setStyle=function(a,b,c){var d=a.style;if(b=b.replace(L,M).replace("-",""),"zIndex"===b)isNaN(c)?d[b]=c:d[b]=""+(0|c);else if("float"===b)d.styleFloat=d.cssFloat=c;else try{R&&(d[R+b.slice(0,1).toUpperCase()+b.slice(1)]=c),d[b]=c}catch(e){}};var ha,ia,ja,ka,la,ma,na,oa,pa,qa,ra,sa,ta,ua,va,wa=g.addEvent=function(b,c,d){var e=function(b){return b=b||a.event,b.target||(b.target=b.srcElement),b.preventDefault||(b.preventDefault=function(){b.returnValue=!1,b.defaultPrevented=!0}),d.call(this,b)};c=c.split(" ");for(var f,g=0,h=c.length;h>g;g++)f=c[g],b.addEventListener?b.addEventListener(f,d,!1):b.attachEvent("on"+f,e),Ua.push({element:b,name:f,listener:d})},xa=g.removeEvent=function(a,b,c){b=b.split(" ");for(var d=0,e=b.length;e>d;d++)a.removeEventListener?a.removeEventListener(b[d],c,!1):a.detachEvent("on"+b[d],c)},ya=function(){for(var a,b=0,c=Ua.length;c>b;b++)a=Ua[b],xa(a.element,a.name,a.listener);Ua=[]},za=function(a,b,c){ka.keyframe&&ka.keyframe.call(ha,a,b,c)},Aa=function(){var a=ha.getScrollTop();Ja=0,la&&!Sa&&(f.style.height=""),Y(),la&&!Sa&&(f.style.height=Ja+e.clientHeight+"px"),Sa?ha.setScrollTop(i.min(ha.getScrollTop(),Ja)):ha.setScrollTop(a,!0),sa=!0},Ba=function(){var a,b,c=e.clientHeight,d={};for(a in ma)b=ma[a],"function"==typeof b?b=b.call(ha):/p$/.test(b)&&(b=b.slice(0,-1)/100*c),d[a]=b;return d},Ca=function(){var a,b=0;return ja&&(b=i.max(ja.offsetHeight,ja.scrollHeight)),a=i.max(b,f.scrollHeight,f.offsetHeight,e.scrollHeight,e.offsetHeight,e.clientHeight),a-e.clientHeight},Da=function(b){var c="className";return a.SVGElement&&b instanceof a.SVGElement&&(b=b[c],c="baseVal"),b[c]},Ea=function(b,d,e){var f="className";if(a.SVGElement&&b instanceof a.SVGElement&&(b=b[f],f="baseVal"),e===c)return void(b[f]=d);for(var g=b[f],h=0,i=e.length;i>h;h++)g=Ga(g).replace(Ga(e[h])," ");g=Fa(g);for(var j=0,k=d.length;k>j;j++)-1===Ga(g).indexOf(Ga(d[j]))&&(g+=" "+d[j]);b[f]=Fa(g)},Fa=function(a){return a.replace(H,"")},Ga=function(a){return" "+a+" "},Ha=Date.now||function(){return+new Date},Ia=function(a,b){return a.frame-b.frame},Ja=0,Ka=1,La="down",Ma=-1,Na=Ha(),Oa=0,Pa=0,Qa=!1,Ra=0,Sa=!1,Ta=0,Ua=[];"function"==typeof define&&define.amd?define([],function(){return g}):"undefined"!=typeof module&&module.exports?module.exports=g:a.skrollr=g}(window,document);
;/*})'"*/;/*})'"*/
/**
 * @file
 * Handles AJAX fetching of views, including filter submission and response.
 */
(function ($) {

  /**
   * Attaches the AJAX behavior to exposed filter forms and key views links.
   */
  Drupal.behaviors.ViewsAjaxView = {};
  Drupal.behaviors.ViewsAjaxView.attach = function () {
    if (Drupal.settings && Drupal.settings.views && Drupal.settings.views.ajaxViews) {
      $.each(Drupal.settings.views.ajaxViews, function (i, settings) {
        Drupal.views.instances[i] = new Drupal.views.ajaxView(settings);
      });
    }
  };

  Drupal.views = {};
  Drupal.views.instances = {};

  /**
   * JavaScript object for a certain view.
   */
  Drupal.views.ajaxView = function (settings) {
    var selector = '.view-dom-id-' + settings.view_dom_id;
    this.$view = $(selector);

    // If view is not present return to prevent errors.
    if (!this.$view.length) {
      return;
    }

    // Retrieve the path to use for views' ajax.
    var ajax_path = Drupal.settings.views.ajax_path;

    // If there are multiple views this might've ended up showing up multiple
    // times.
    if (ajax_path.constructor.toString().indexOf("Array") != -1) {
      ajax_path = ajax_path[0];
    }

    // Check if there are any GET parameters to send to views.
    var queryString = window.location.search || '';
    if (queryString !== '') {
      // Remove the question mark and Drupal path component if any.
      var queryString = queryString.slice(1).replace(/q=[^&]+&?|&?render=[^&]+/, '');
      if (queryString !== '') {
        // If there is a '?' in ajax_path, clean url are on and & should be
        // used to add parameters.
        queryString = ((/\?/.test(ajax_path)) ? '&' : '?') + queryString;
      }
    }

    this.element_settings = {
      url: ajax_path + queryString,
      submit: settings,
      setClick: true,
      event: 'click',
      selector: selector,
      progress: {
        type: 'throbber'
      }
    };

    this.settings = settings;

    // Add the ajax to exposed forms.
    this.$exposed_form = $('#views-exposed-form-' + settings.view_dom_id.replace(/_/g, '-'));
    this.$exposed_form.once(jQuery.proxy(this.attachExposedFormAjax, this));

    // Store Drupal.ajax objects here for all pager links.
    this.links = [];

    // Add the ajax to pagers.
    this.$view
      .once(jQuery.proxy(this.attachPagerAjax, this));

    // Add a trigger to update this view specifically. In order to trigger a
    // refresh use the following code.
    //
    // @code
    // jQuery('.view-name').trigger('RefreshView');
    // @endcode
    // Add a trigger to update this view specifically.
    var self_settings = this.element_settings;
    self_settings.event = 'RefreshView';
    var self = this;
    this.$view.once('refresh', function () {
      self.refreshViewAjax = new Drupal.ajax(self.selector, self.$view, self_settings);
    });
  };

  Drupal.views.ajaxView.prototype.attachExposedFormAjax = function () {
    var button = $('input[type=submit], button[type=submit], input[type=image]', this.$exposed_form);
    button = button[0];

    // Call the autocomplete submit before doing AJAX.
    $(button).click(function () {
      if (Drupal.autocompleteSubmit) {
        Drupal.autocompleteSubmit();
      }
    });

    this.exposedFormAjax = new Drupal.ajax($(button).attr('id'), button, this.element_settings);
  };

  /**
   * Attach the ajax behavior to each link.
   */
  Drupal.views.ajaxView.prototype.attachPagerAjax = function () {
    this.$view.find('ul.pager > li > a, ol.pager > li > a, th.views-field a, .attachment .views-summary a')
      .each(jQuery.proxy(this.attachPagerLinkAjax, this));
  };

  /**
   * Attach the ajax behavior to a single link.
   */
  Drupal.views.ajaxView.prototype.attachPagerLinkAjax = function (id, link) {
    var $link = $(link);
    var viewData = {};
    var href = $link.attr('href');
    // Don't attach to pagers inside nested views.
    if ($link.closest('.view')[0] !== this.$view[0] &&
      $link.closest('.view').parent().hasClass('attachment') === false) {
      return;
    }

    // Provide a default page if none has been set. This must be done
    // prior to merging with settings to avoid accidentally using the
    // page landed on instead of page 1.
    if (typeof(viewData.page) === 'undefined') {
      viewData.page = 0;
    }

    // Construct an object using the settings defaults and then overriding
    // with data specific to the link.
    $.extend(
      viewData,
      this.settings,
      Drupal.Views.parseQueryString(href),
      // Extract argument data from the URL.
      Drupal.Views.parseViewArgs(href, this.settings.view_base_path)
    );

    // For anchor tags, these will go to the target of the anchor rather
    // than the usual location.
    $.extend(viewData, Drupal.Views.parseViewArgs(href, this.settings.view_base_path));

    // Construct an object using the element settings defaults,
    // then overriding submit with viewData.
    var pager_settings = $.extend({}, this.element_settings);
    pager_settings.submit = viewData;
    this.pagerAjax = new Drupal.ajax(false, $link, pager_settings);
    this.links.push(this.pagerAjax);
  };

  Drupal.ajax.prototype.commands.viewsScrollTop = function (ajax, response, status) {
    // Scroll to the top of the view. This will allow users
    // to browse newly loaded content after e.g. clicking a pager
    // link.
    var offset = $(response.selector).offset();
    // We can't guarantee that the scrollable object should be
    // the body, as the view could be embedded in something
    // more complex such as a modal popup. Recurse up the DOM
    // and scroll the first element that has a non-zero top.
    var scrollTarget = response.selector;
    while ($(scrollTarget).scrollTop() == 0 && $(scrollTarget).parent()) {
      scrollTarget = $(scrollTarget).parent();
    }
    // Only scroll upward.
    if (offset.top - 10 < $(scrollTarget).scrollTop()) {
      $(scrollTarget).animate({scrollTop: (offset.top - 10)}, 500);
    }
  };

})(jQuery);
;/*})'"*/;/*})'"*/
/**
 * @file
 * Adds draggable functionality to the html list display of the view.
 */

(function($) {
  Drupal.behaviors.draggableViews = {
    attach: function(context, settings) {
      $(Drupal.settings.draggableviews_row_class).each(function(index, row_class) {
        if (Drupal.settings.draggableviews_multilist != 0) {
          return;
        }

        $('.views-form .' + row_class + ':not(.draggableviews-processed)', context)
          // Add class for theming.
          .addClass('draggableviews-processed')
          // Add sortable effect.
          .sortable({
            update: function(event, ui) {
              $(".draggableviews-weight").each(function(i, Val) {
                $(this).val(i);
              });

              if (!Drupal.settings.draggableviews_hide_confirmation) {
                if (!$(this).hasClass('draggableviews-changed')) {
                  // If view is not ajaxified.
                  if (!Drupal.settings.draggableviews_ajax) {
                    $('<div class="draggableviews-changed-warning messages warning">' + Drupal.t('Changes made in this list will not be saved until the form is submitted.') + '</div>')
                      .insertBefore($(this).parents('form div.item-list')).hide().fadeIn('slow');
                    $(this).addClass('draggableviews-changed');
                  } else {
                    // If view ajaxified.
                    if ($('.draggableviews-changed-notice').length) {
                      $('.draggableviews-changed-notice').fadeIn('slow').delay(3000).fadeOut('slow')
                    } else {
                      $('<div class="draggableviews-changed-notice messages warning">' + Drupal.t('Order of this view has been changed.') + '</div>')
                        .insertBefore($(this).parents('form div.item-list')).hide().fadeIn('slow').delay(3000).fadeOut('slow');
                      $(this).addClass('draggableviews-changed');
                    }
                  }
                }
              }
              // If Ajax enabled, we should submit the form.
              if (Drupal.settings.draggableviews_ajax) {
                $(this).parent().parent().find('.form-actions [id^="edit-submit"]').trigger('mousedown');
              }
            },
            containment: 'parent',
            cursor: 'move',
            tolerance: 'pointer',
          });
        if (Drupal.settings.draggableviews_ajax) {
          $('.views-form .' + row_class).parent().parent().find('.form-actions [id^="edit-submit"]').hide();
        }
      });
    }
  }
})(jQuery);
;/*})'"*/;/*})'"*/
(function($) {

/**
 * Drupal FieldGroup object.
 */
Drupal.FieldGroup = Drupal.FieldGroup || {};
Drupal.FieldGroup.Effects = Drupal.FieldGroup.Effects || {};
Drupal.FieldGroup.groupWithfocus = null;

Drupal.FieldGroup.setGroupWithfocus = function(element) {
  element.css({display: 'block'});
  Drupal.FieldGroup.groupWithfocus = element;
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processFieldset = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any fieldsets containing required fields
      $('fieldset.fieldset', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $('legend span.fieldset-legend', $(this)).eq(0).append(' ').append($('.form-required').eq(0).clone());
        }
        if ($('.error', $(this)).length) {
          $('legend span.fieldset-legend', $(this)).eq(0).addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processAccordion = {
  execute: function (context, settings, type) {
    $('div.field-group-accordion-wrapper', context).once('fieldgroup-effects', function () {
      var wrapper = $(this);

      // Get the index to set active.
      var active_index = false;
      wrapper.find('.accordion-item').each(function(i) {
        if ($(this).hasClass('field-group-accordion-active')) {
          active_index = i;
        }
      });

      wrapper.accordion({
        heightStyle: "content", // jQuery UI >= v1.9
        autoHeight: false,      // jQuery UI < v1.9
        active: active_index,
        collapsible: true,
        changestart: function(event, ui) {
          if ($(this).hasClass('effect-none')) {
            ui.options.animated = false;
          }
          else {
            ui.options.animated = 'slide';
          }
        }
      });

      if (type == 'form') {

        var $firstErrorItem = false;

        // Add required fields mark to any element containing required fields
        wrapper.find('div.field-group-accordion-item').each(function(i) {

          if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
            $('h3.ui-accordion-header a').eq(i).append(' ').append($('.form-required').eq(0).clone());
          }
          if ($('.error', $(this)).length) {
            // Save first error item, for focussing it.
            if (!$firstErrorItem) {
              $firstErrorItem = $(this).parent().accordion("option", "active", i);
            }
            $('h3.ui-accordion-header').eq(i).addClass('error');
          }
        });

        // Save first error item, for focussing it.
        if (!$firstErrorItem) {
          $('.ui-accordion-content-active', $firstErrorItem).css({height: 'auto', width: 'auto', display: 'block'});
        }

      }
    });
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processHtabs = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any element containing required fields
      $('fieldset.horizontal-tabs-pane', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $(this).data('horizontalTab').link.find('strong:first').after($('.form-required').eq(0).clone()).after(' ');
        }
        if ($('.error', $(this)).length) {
          $(this).data('horizontalTab').link.parent().addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
          $(this).data('horizontalTab').focus();
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processTabs = {
  execute: function (context, settings, type) {
    if (type == 'form') {

      var errorFocussed = false;

      // Add required fields mark to any fieldsets containing required fields
      $('fieldset.vertical-tabs-pane', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $(this).data('verticalTab').link.find('strong:first').after($('.form-required').eq(0).clone()).after(' ');
        }
        if ($('.error', $(this)).length) {
          $(this).data('verticalTab').link.parent().addClass('error');
          // Focus the first tab with error.
          if (!errorFocussed) {
            Drupal.FieldGroup.setGroupWithfocus($(this));
            $(this).data('verticalTab').focus();
            errorFocussed = true;
          }
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 *
 * TODO clean this up meaning check if this is really
 *      necessary.
 */
Drupal.FieldGroup.Effects.processDiv = {
  execute: function (context, settings, type) {

    $('div.collapsible', context).once('fieldgroup-effects', function() {
      var $wrapper = $(this);

      // Turn the legend into a clickable link, but retain span.field-group-format-toggler
      // for CSS positioning.

      var $toggler = $('span.field-group-format-toggler:first', $wrapper);
      var $link = $('<a class="field-group-format-title" href="#"></a>');
      $link.prepend($toggler.contents());

      // Add required field markers if needed
      if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
        $link.append(' ').append($('.form-required').eq(0).clone());
      }

      $link.appendTo($toggler);

      // .wrapInner() does not retain bound events.
      $link.click(function () {
        var wrapper = $wrapper.get(0);
        // Don't animate multiple times.
        if (!wrapper.animating) {
          wrapper.animating = true;
          var speed = $wrapper.hasClass('speed-fast') ? 300 : 1000;
          if ($wrapper.hasClass('effect-none') && $wrapper.hasClass('speed-none')) {
            $('> .field-group-format-wrapper', wrapper).toggle();
            wrapper.animating = false;
          }
          else if ($wrapper.hasClass('effect-blind')) {
            $('> .field-group-format-wrapper', wrapper).toggle('blind', {}, speed);
            wrapper.animating = false;
          }
          else {
            $('> .field-group-format-wrapper', wrapper).toggle(speed, function() {
              wrapper.animating = false;
            });
          }
        }
        $wrapper.toggleClass('collapsed');
        return false;
      });

    });
  }
};

/**
 * Behaviors.
 */
Drupal.behaviors.fieldGroup = {
  attach: function (context, settings) {
    settings.field_group = settings.field_group || Drupal.settings.field_group;
    if (settings.field_group == undefined) {
      return;
    }

    // Execute all of them.
    $.each(Drupal.FieldGroup.Effects, function (func) {
      // We check for a wrapper function in Drupal.field_group as
      // alternative for dynamic string function calls.
      var type = func.toLowerCase().replace("process", "");
      if (settings.field_group[type] != undefined && $.isFunction(this.execute)) {
        this.execute(context, settings, settings.field_group[type]);
      }
    });

    // Fixes css for fieldgroups under vertical tabs.
    $('.fieldset-wrapper .fieldset > legend').css({display: 'block'});
    $('.vertical-tabs fieldset.fieldset').addClass('default-fallback');

    // Add a new ID to each fieldset.
    $('.group-wrapper .horizontal-tabs-panes > fieldset', context).once('group-wrapper-panes-processed', function() {
      // Tats bad, but we have to keep the actual id to prevent layouts to break.
      var fieldgroupID = 'field_group-' + $(this).attr('id');
      $(this).attr('id', fieldgroupID);
    });
    // Set the hash in url to remember last userselection.
    $('.group-wrapper ul li').once('group-wrapper-ul-processed', function() {
      var fieldGroupNavigationListIndex = $(this).index();
      $(this).children('a').click(function() {
        var fieldset = $('.group-wrapper fieldset').get(fieldGroupNavigationListIndex);
        // Grab the first id, holding the wanted hashurl.
        var hashUrl = $(fieldset).attr('id').replace(/^field_group-/, '').split(' ')[0];
        window.location.hash = hashUrl;
      });
    });

  }
};

})(jQuery);
;/*})'"*/;/*})'"*/
// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/maps/google_maps_api_v3_16.js
// ==/ClosureCompiler==

/**
 * @name CSS3 InfoBubble with tabs for Google Maps API V3
 * @version 0.8
 * @author Luke Mahe
 * @fileoverview
 * This library is a CSS Infobubble with tabs. It uses css3 rounded corners and
 * drop shadows and animations. It also allows tabs
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * A CSS3 InfoBubble v0.8
 * @param {Object.<string, *>=} opt_options Optional properties to set.
 * @extends {google.maps.OverlayView}
 * @constructor
 */
function InfoBubble(opt_options) {
  this.extend(InfoBubble, google.maps.OverlayView);
  this.tabs_ = [];
  this.activeTab_ = null;
  this.baseZIndex_ = 100;
  this.isOpen_ = false;

  var options = opt_options || {};

  if (options['backgroundColor'] == undefined) {
    options['backgroundColor'] = this.BACKGROUND_COLOR_;
  }

  if (options['borderColor'] == undefined) {
    options['borderColor'] = this.BORDER_COLOR_;
  }

  if (options['borderRadius'] == undefined) {
    options['borderRadius'] = this.BORDER_RADIUS_;
  }

  if (options['borderWidth'] == undefined) {
    options['borderWidth'] = this.BORDER_WIDTH_;
  }

  if (options['padding'] == undefined) {
    options['padding'] = this.PADDING_;
  }

  if (options['arrowPosition'] == undefined) {
    options['arrowPosition'] = this.ARROW_POSITION_;
  }

  if (options['disableAutoPan'] == undefined) {
    options['disableAutoPan'] = false;
  }

  if (options['disableAnimation'] == undefined) {
    options['disableAnimation'] = false;
  }

  if (options['minWidth'] == undefined) {
    options['minWidth'] = this.MIN_WIDTH_;
  }

  if (options['shadowStyle'] == undefined) {
    options['shadowStyle'] = this.SHADOW_STYLE_;
  }

  if (options['arrowSize'] == undefined) {
    options['arrowSize'] = this.ARROW_SIZE_;
  }

  if (options['arrowStyle'] == undefined) {
    options['arrowStyle'] = this.ARROW_STYLE_;
  }

  if (options['closeSrc'] == undefined) {
    options['closeSrc'] = this.CLOSE_SRC_;
  }

  this.buildDom_();
  this.setValues(options);
}
window['InfoBubble'] = InfoBubble;


/**
 * Default arrow size
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_SIZE_ = 15;


/**
 * Default arrow style
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_STYLE_ = 0;


/**
 * Default shadow style
 * @const
 * @private
 */
InfoBubble.prototype.SHADOW_STYLE_ = 1;


/**
 * Default min width
 * @const
 * @private
 */
InfoBubble.prototype.MIN_WIDTH_ = 50;


/**
 * Default arrow position
 * @const
 * @private
 */
InfoBubble.prototype.ARROW_POSITION_ = 50;


/**
 * Default padding
 * @const
 * @private
 */
InfoBubble.prototype.PADDING_ = 10;


/**
 * Default border width
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_WIDTH_ = 1;


/**
 * Default border color
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_COLOR_ = '#ccc';


/**
 * Default border radius
 * @const
 * @private
 */
InfoBubble.prototype.BORDER_RADIUS_ = 10;


/**
 * Default background color
 * @const
 * @private
 */
InfoBubble.prototype.BACKGROUND_COLOR_ = '#fff';

/**
 * Default close image source
 * @const
 * @private
 */
InfoBubble.prototype.CLOSE_SRC_ = 'https://maps.gstatic.com/intl/en_us/mapfiles/iw_close.gif';

/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
InfoBubble.prototype.extend = function(obj1, obj2) {
  return (function(object) {
    for (var property in object.prototype) {
      this.prototype[property] = object.prototype[property];
    }
    return this;
  }).apply(obj1, [obj2]);
};


/**
 * Builds the InfoBubble dom
 * @private
 */
InfoBubble.prototype.buildDom_ = function() {
  var bubble = this.bubble_ = document.createElement('DIV');
  bubble.style['position'] = 'absolute';
  bubble.style['zIndex'] = this.baseZIndex_;

  var tabsContainer = this.tabsContainer_ = document.createElement('DIV');
  tabsContainer.style['position'] = 'relative';

  // Close button
  var close = this.close_ = document.createElement('IMG');
  close.style['position'] = 'absolute';
  close.style['border'] = 0;
  close.style['zIndex'] = this.baseZIndex_ + 1;
  close.style['cursor'] = 'pointer';
  close.src = this.get('closeSrc');

  var that = this;
  google.maps.event.addDomListener(close, 'click', function() {
    that.close();
    google.maps.event.trigger(that, 'closeclick');
  });

  // Content area
  var contentContainer = this.contentContainer_ = document.createElement('DIV');
  contentContainer.style['overflowX'] = 'auto';
  contentContainer.style['overflowY'] = 'auto';
  contentContainer.style['cursor'] = 'default';
  contentContainer.style['clear'] = 'both';
  contentContainer.style['position'] = 'relative';

  var content = this.content_ = document.createElement('DIV');
  contentContainer.appendChild(content);

  // Arrow
  var arrow = this.arrow_ = document.createElement('DIV');
  arrow.style['position'] = 'relative';

  var arrowOuter = this.arrowOuter_ = document.createElement('DIV');
  var arrowInner = this.arrowInner_ = document.createElement('DIV');

  var arrowSize = this.getArrowSize_();

  arrowOuter.style['position'] = arrowInner.style['position'] = 'absolute';
  arrowOuter.style['left'] = arrowInner.style['left'] = '50%';
  arrowOuter.style['height'] = arrowInner.style['height'] = '0';
  arrowOuter.style['width'] = arrowInner.style['width'] = '0';
  arrowOuter.style['marginLeft'] = this.px(-arrowSize);
  arrowOuter.style['borderWidth'] = this.px(arrowSize);
  arrowOuter.style['borderBottomWidth'] = 0;

  // Shadow
  var bubbleShadow = this.bubbleShadow_ = document.createElement('DIV');
  bubbleShadow.style['position'] = 'absolute';

  // Hide the InfoBubble by default
  bubble.style['display'] = bubbleShadow.style['display'] = 'none';

  bubble.appendChild(this.tabsContainer_);
  bubble.appendChild(close);
  bubble.appendChild(contentContainer);
  arrow.appendChild(arrowOuter);
  arrow.appendChild(arrowInner);
  bubble.appendChild(arrow);

  var stylesheet = document.createElement('style');
  stylesheet.setAttribute('type', 'text/css');

  /**
   * The animation for the infobubble
   * @type {string}
   */
  this.animationName_ = '_ibani_' + Math.round(Math.random() * 10000);

  var css = '.' + this.animationName_ + '{-webkit-animation-name:' +
      this.animationName_ + ';-webkit-animation-duration:0.5s;' +
      '-webkit-animation-iteration-count:1;}' +
      '@-webkit-keyframes ' + this.animationName_ + ' {from {' +
      '-webkit-transform: scale(0)}50% {-webkit-transform: scale(1.2)}90% ' +
      '{-webkit-transform: scale(0.95)}to {-webkit-transform: scale(1)}}';

  stylesheet.textContent = css;
  document.getElementsByTagName('head')[0].appendChild(stylesheet);
};


/**
 * Sets the background class name
 *
 * @param {string} className The class name to set.
 */
InfoBubble.prototype.setBackgroundClassName = function(className) {
  this.set('backgroundClassName', className);
};
InfoBubble.prototype['setBackgroundClassName'] = InfoBubble.prototype.setBackgroundClassName;


/**
 * changed MVC callback
 */
InfoBubble.prototype.backgroundClassName_changed = function() {
  this.content_.className = this.get('backgroundClassName');
};
InfoBubble.prototype['backgroundClassName_changed'] = InfoBubble.prototype.backgroundClassName_changed;


/**
 * Sets the class of the tab
 *
 * @param {string} className the class name to set.
 */
InfoBubble.prototype.setTabClassName = function(className) {
  this.set('tabClassName', className);
};
InfoBubble.prototype['setTabClassName'] = InfoBubble.prototype.setTabClassName;


/**
 * tabClassName changed MVC callback
 */
InfoBubble.prototype.tabClassName_changed = function() {
  this.updateTabStyles_();
};
InfoBubble.prototype['tabClassName_changed'] = InfoBubble.prototype.tabClassName_changed;


/**
 * Gets the style of the arrow
 *
 * @private
 * @return {number} The style of the arrow.
 */
InfoBubble.prototype.getArrowStyle_ = function() {
  return parseInt(this.get('arrowStyle'), 10) || 0;
};


/**
 * Sets the style of the arrow
 *
 * @param {number} style The style of the arrow.
 */
InfoBubble.prototype.setArrowStyle = function(style) {
  this.set('arrowStyle', style);
};
InfoBubble.prototype['setArrowStyle'] = InfoBubble.prototype.setArrowStyle;


/**
 * Arrow style changed MVC callback
 */
InfoBubble.prototype.arrowStyle_changed = function() {
  this.arrowSize_changed();
};
InfoBubble.prototype['arrowStyle_changed'] = InfoBubble.prototype.arrowStyle_changed;


/**
 * Gets the size of the arrow
 *
 * @private
 * @return {number} The size of the arrow.
 */
InfoBubble.prototype.getArrowSize_ = function() {
  return parseInt(this.get('arrowSize'), 10) || 0;
};


/**
 * Sets the size of the arrow
 *
 * @param {number} size The size of the arrow.
 */
InfoBubble.prototype.setArrowSize = function(size) {
  this.set('arrowSize', size);
};
InfoBubble.prototype['setArrowSize'] = InfoBubble.prototype.setArrowSize;


/**
 * Arrow size changed MVC callback
 */
InfoBubble.prototype.arrowSize_changed = function() {
  this.borderWidth_changed();
};
InfoBubble.prototype['arrowSize_changed'] = InfoBubble.prototype.arrowSize_changed;


/**
 * Set the position of the InfoBubble arrow
 *
 * @param {number} pos The position to set.
 */
InfoBubble.prototype.setArrowPosition = function(pos) {
  this.set('arrowPosition', pos);
};
InfoBubble.prototype['setArrowPosition'] = InfoBubble.prototype.setArrowPosition;


/**
 * Get the position of the InfoBubble arrow
 *
 * @private
 * @return {number} The position..
 */
InfoBubble.prototype.getArrowPosition_ = function() {
  return parseInt(this.get('arrowPosition'), 10) || 0;
};


/**
 * arrowPosition changed MVC callback
 */
InfoBubble.prototype.arrowPosition_changed = function() {
  var pos = this.getArrowPosition_();
  this.arrowOuter_.style['left'] = this.arrowInner_.style['left'] = pos + '%';

  this.redraw_();
};
InfoBubble.prototype['arrowPosition_changed'] = InfoBubble.prototype.arrowPosition_changed;


/**
 * Set the zIndex of the InfoBubble
 *
 * @param {number} zIndex The zIndex to set.
 */
InfoBubble.prototype.setZIndex = function(zIndex) {
  this.set('zIndex', zIndex);
};
InfoBubble.prototype['setZIndex'] = InfoBubble.prototype.setZIndex;


/**
 * Get the zIndex of the InfoBubble
 *
 * @return {number} The zIndex to set.
 */
InfoBubble.prototype.getZIndex = function() {
  return parseInt(this.get('zIndex'), 10) || this.baseZIndex_;
};


/**
 * zIndex changed MVC callback
 */
InfoBubble.prototype.zIndex_changed = function() {
  var zIndex = this.getZIndex();

  this.bubble_.style['zIndex'] = this.baseZIndex_ = zIndex;
  this.close_.style['zIndex'] = zIndex + 1;
};
InfoBubble.prototype['zIndex_changed'] = InfoBubble.prototype.zIndex_changed;


/**
 * Set the style of the shadow
 *
 * @param {number} shadowStyle The style of the shadow.
 */
InfoBubble.prototype.setShadowStyle = function(shadowStyle) {
  this.set('shadowStyle', shadowStyle);
};
InfoBubble.prototype['setShadowStyle'] = InfoBubble.prototype.setShadowStyle;


/**
 * Get the style of the shadow
 *
 * @private
 * @return {number} The style of the shadow.
 */
InfoBubble.prototype.getShadowStyle_ = function() {
  return parseInt(this.get('shadowStyle'), 10) || 0;
};


/**
 * shadowStyle changed MVC callback
 */
InfoBubble.prototype.shadowStyle_changed = function() {
  var shadowStyle = this.getShadowStyle_();

  var display = '';
  var shadow = '';
  var backgroundColor = '';
  switch (shadowStyle) {
    case 0:
      display = 'none';
      break;
    case 1:
      shadow = '40px 15px 10px rgba(33,33,33,0.3)';
      backgroundColor = 'transparent';
      break;
    case 2:
      shadow = '0 0 2px rgba(33,33,33,0.3)';
      backgroundColor = 'rgba(33,33,33,0.35)';
      break;
  }
  this.bubbleShadow_.style['boxShadow'] =
      this.bubbleShadow_.style['webkitBoxShadow'] =
      this.bubbleShadow_.style['MozBoxShadow'] = shadow;
  this.bubbleShadow_.style['backgroundColor'] = backgroundColor;
  if (this.isOpen_) {
    this.bubbleShadow_.style['display'] = display;
    this.draw();
  }
};
InfoBubble.prototype['shadowStyle_changed'] = InfoBubble.prototype.shadowStyle_changed;


/**
 * Show the close button
 */
InfoBubble.prototype.showCloseButton = function() {
  this.set('hideCloseButton', false);
};
InfoBubble.prototype['showCloseButton'] = InfoBubble.prototype.showCloseButton;


/**
 * Hide the close button
 */
InfoBubble.prototype.hideCloseButton = function() {
  this.set('hideCloseButton', true);
};
InfoBubble.prototype['hideCloseButton'] = InfoBubble.prototype.hideCloseButton;


/**
 * hideCloseButton changed MVC callback
 */
InfoBubble.prototype.hideCloseButton_changed = function() {
  this.close_.style['display'] = this.get('hideCloseButton') ? 'none' : '';
};
InfoBubble.prototype['hideCloseButton_changed'] = InfoBubble.prototype.hideCloseButton_changed;


/**
 * Set the background color
 *
 * @param {string} color The color to set.
 */
InfoBubble.prototype.setBackgroundColor = function(color) {
  if (color) {
    this.set('backgroundColor', color);
  }
};
InfoBubble.prototype['setBackgroundColor'] = InfoBubble.prototype.setBackgroundColor;


/**
 * backgroundColor changed MVC callback
 */
InfoBubble.prototype.backgroundColor_changed = function() {
  var backgroundColor = this.get('backgroundColor');
  this.contentContainer_.style['backgroundColor'] = backgroundColor;

  this.arrowInner_.style['borderColor'] = backgroundColor +
      ' transparent transparent';
  this.updateTabStyles_();
};
InfoBubble.prototype['backgroundColor_changed'] = InfoBubble.prototype.backgroundColor_changed;


/**
 * Set the border color
 *
 * @param {string} color The border color.
 */
InfoBubble.prototype.setBorderColor = function(color) {
  if (color) {
    this.set('borderColor', color);
  }
};
InfoBubble.prototype['setBorderColor'] = InfoBubble.prototype.setBorderColor;


/**
 * borderColor changed MVC callback
 */
InfoBubble.prototype.borderColor_changed = function() {
  var borderColor = this.get('borderColor');

  var contentContainer = this.contentContainer_;
  var arrowOuter = this.arrowOuter_;
  contentContainer.style['borderColor'] = borderColor;

  arrowOuter.style['borderColor'] = borderColor +
      ' transparent transparent';

  contentContainer.style['borderStyle'] =
      arrowOuter.style['borderStyle'] =
      this.arrowInner_.style['borderStyle'] = 'solid';

  this.updateTabStyles_();
};
InfoBubble.prototype['borderColor_changed'] = InfoBubble.prototype.borderColor_changed;


/**
 * Set the radius of the border
 *
 * @param {number} radius The radius of the border.
 */
InfoBubble.prototype.setBorderRadius = function(radius) {
  this.set('borderRadius', radius);
};
InfoBubble.prototype['setBorderRadius'] = InfoBubble.prototype.setBorderRadius;


/**
 * Get the radius of the border
 *
 * @private
 * @return {number} The radius of the border.
 */
InfoBubble.prototype.getBorderRadius_ = function() {
  return parseInt(this.get('borderRadius'), 10) || 0;
};


/**
 * borderRadius changed MVC callback
 */
InfoBubble.prototype.borderRadius_changed = function() {
  var borderRadius = this.getBorderRadius_();
  var borderWidth = this.getBorderWidth_();

  this.contentContainer_.style['borderRadius'] =
      this.contentContainer_.style['MozBorderRadius'] =
      this.contentContainer_.style['webkitBorderRadius'] =
      this.bubbleShadow_.style['borderRadius'] =
      this.bubbleShadow_.style['MozBorderRadius'] =
      this.bubbleShadow_.style['webkitBorderRadius'] = this.px(borderRadius);

  this.tabsContainer_.style['paddingLeft'] =
      this.tabsContainer_.style['paddingRight'] =
      this.px(borderRadius + borderWidth);

  this.redraw_();
};
InfoBubble.prototype['borderRadius_changed'] = InfoBubble.prototype.borderRadius_changed;


/**
 * Get the width of the border
 *
 * @private
 * @return {number} width The width of the border.
 */
InfoBubble.prototype.getBorderWidth_ = function() {
  return parseInt(this.get('borderWidth'), 10) || 0;
};


/**
 * Set the width of the border
 *
 * @param {number} width The width of the border.
 */
InfoBubble.prototype.setBorderWidth = function(width) {
  this.set('borderWidth', width);
};
InfoBubble.prototype['setBorderWidth'] = InfoBubble.prototype.setBorderWidth;


/**
 * borderWidth change MVC callback
 */
InfoBubble.prototype.borderWidth_changed = function() {
  var borderWidth = this.getBorderWidth_();

  this.contentContainer_.style['borderWidth'] = this.px(borderWidth);
  this.tabsContainer_.style['top'] = this.px(borderWidth);

  this.updateArrowStyle_();
  this.updateTabStyles_();
  this.borderRadius_changed();
  this.redraw_();
};
InfoBubble.prototype['borderWidth_changed'] = InfoBubble.prototype.borderWidth_changed;


/**
 * Update the arrow style
 * @private
 */
InfoBubble.prototype.updateArrowStyle_ = function() {
  var borderWidth = this.getBorderWidth_();
  var arrowSize = this.getArrowSize_();
  var arrowStyle = this.getArrowStyle_();
  var arrowOuterSizePx = this.px(arrowSize);
  var arrowInnerSizePx = this.px(Math.max(0, arrowSize - borderWidth));

  var outer = this.arrowOuter_;
  var inner = this.arrowInner_;

  this.arrow_.style['marginTop'] = this.px(-borderWidth);
  outer.style['borderTopWidth'] = arrowOuterSizePx;
  inner.style['borderTopWidth'] = arrowInnerSizePx;

  // Full arrow or arrow pointing to the left
  if (arrowStyle == 0 || arrowStyle == 1) {
    outer.style['borderLeftWidth'] = arrowOuterSizePx;
    inner.style['borderLeftWidth'] = arrowInnerSizePx;
  } else {
    outer.style['borderLeftWidth'] = inner.style['borderLeftWidth'] = 0;
  }

  // Full arrow or arrow pointing to the right
  if (arrowStyle == 0 || arrowStyle == 2) {
    outer.style['borderRightWidth'] = arrowOuterSizePx;
    inner.style['borderRightWidth'] = arrowInnerSizePx;
  } else {
    outer.style['borderRightWidth'] = inner.style['borderRightWidth'] = 0;
  }

  if (arrowStyle < 2) {
    outer.style['marginLeft'] = this.px(-(arrowSize));
    inner.style['marginLeft'] = this.px(-(arrowSize - borderWidth));
  } else {
    outer.style['marginLeft'] = inner.style['marginLeft'] = 0;
  }

  // If there is no border then don't show thw outer arrow
  if (borderWidth == 0) {
    outer.style['display'] = 'none';
  } else {
    outer.style['display'] = '';
  }
};


/**
 * Set the padding of the InfoBubble
 *
 * @param {number} padding The padding to apply.
 */
InfoBubble.prototype.setPadding = function(padding) {
  this.set('padding', padding);
};
InfoBubble.prototype['setPadding'] = InfoBubble.prototype.setPadding;


/**
 * Set the close image url
 *
 * @param {string} src The url of the image used as a close icon
 */
InfoBubble.prototype.setCloseSrc = function(src) {
  if (src && this.close_) {
    this.close_.src = src;
  }
};
InfoBubble.prototype['setCloseSrc'] = InfoBubble.prototype.setCloseSrc;


/**
 * Set the padding of the InfoBubble
 *
 * @private
 * @return {number} padding The padding to apply.
 */
InfoBubble.prototype.getPadding_ = function() {
  return parseInt(this.get('padding'), 10) || 0;
};


/**
 * padding changed MVC callback
 */
InfoBubble.prototype.padding_changed = function() {
  var padding = this.getPadding_();
  this.contentContainer_.style['padding'] = this.px(padding);
  this.updateTabStyles_();

  this.redraw_();
};
InfoBubble.prototype['padding_changed'] = InfoBubble.prototype.padding_changed;


/**
 * Add px extention to the number
 *
 * @param {number} num The number to wrap.
 * @return {string|number} A wrapped number.
 */
InfoBubble.prototype.px = function(num) {
  if (num) {
    // 0 doesn't need to be wrapped
    return num + 'px';
  }
  return num;
};


/**
 * Add events to stop propagation
 * @private
 */
InfoBubble.prototype.addEvents_ = function() {
  // We want to cancel all the events so they do not go to the map
  var events = ['mousedown', 'mousemove', 'mouseover', 'mouseout', 'mouseup',
      'mousewheel', 'DOMMouseScroll', 'touchstart', 'touchend', 'touchmove',
      'dblclick', 'contextmenu', 'click'];

  var bubble = this.bubble_;
  this.listeners_ = [];
  for (var i = 0, event; event = events[i]; i++) {
    this.listeners_.push(
      google.maps.event.addDomListener(bubble, event, function(e) {
        e.cancelBubble = true;
        if (e.stopPropagation) {
          e.stopPropagation();
        }
      })
    );
  }
};


/**
 * On Adding the InfoBubble to a map
 * Implementing the OverlayView interface
 */
InfoBubble.prototype.onAdd = function() {
  if (!this.bubble_) {
    this.buildDom_();
  }

  this.addEvents_();

  var panes = this.getPanes();
  if (panes) {
    panes.floatPane.appendChild(this.bubble_);
    panes.floatShadow.appendChild(this.bubbleShadow_);
  }

  /* once the infoBubble has been added to the DOM, fire 'domready' event */
  google.maps.event.trigger(this, 'domready');
};
InfoBubble.prototype['onAdd'] = InfoBubble.prototype.onAdd;


/**
 * Draw the InfoBubble
 * Implementing the OverlayView interface
 */
InfoBubble.prototype.draw = function() {
  var projection = this.getProjection();

  if (!projection) {
    // The map projection is not ready yet so do nothing
    return;
  }

  var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));

  if (!latLng) {
    this.close();
    return;
  }

  var tabHeight = 0;

  if (this.activeTab_) {
    tabHeight = this.activeTab_.offsetHeight;
  }

  var anchorHeight = this.getAnchorHeight_();
  var arrowSize = this.getArrowSize_();
  var arrowPosition = this.getArrowPosition_();

  arrowPosition = arrowPosition / 100;

  var pos = projection.fromLatLngToDivPixel(latLng);
  var width = this.contentContainer_.offsetWidth;
  var height = this.bubble_.offsetHeight;

  if (!width) {
    return;
  }

  // Adjust for the height of the info bubble
  var top = pos.y - (height + arrowSize);

  if (anchorHeight) {
    // If there is an anchor then include the height
    top -= anchorHeight;
  }

  var left = pos.x - (width * arrowPosition);

  this.bubble_.style['top'] = this.px(top);
  this.bubble_.style['left'] = this.px(left);

  var shadowStyle = parseInt(this.get('shadowStyle'), 10);

  switch (shadowStyle) {
    case 1:
      // Shadow is behind
      this.bubbleShadow_.style['top'] = this.px(top + tabHeight - 1);
      this.bubbleShadow_.style['left'] = this.px(left);
      this.bubbleShadow_.style['width'] = this.px(width);
      this.bubbleShadow_.style['height'] =
          this.px(this.contentContainer_.offsetHeight - arrowSize);
      break;
    case 2:
      // Shadow is below
      width = width * 0.8;
      if (anchorHeight) {
        this.bubbleShadow_.style['top'] = this.px(pos.y);
      } else {
        this.bubbleShadow_.style['top'] = this.px(pos.y + arrowSize);
      }
      this.bubbleShadow_.style['left'] = this.px(pos.x - width * arrowPosition);

      this.bubbleShadow_.style['width'] = this.px(width);
      this.bubbleShadow_.style['height'] = this.px(2);
      break;
  }
};
InfoBubble.prototype['draw'] = InfoBubble.prototype.draw;


/**
 * Removing the InfoBubble from a map
 */
InfoBubble.prototype.onRemove = function() {
  if (this.bubble_ && this.bubble_.parentNode) {
    this.bubble_.parentNode.removeChild(this.bubble_);
  }
  if (this.bubbleShadow_ && this.bubbleShadow_.parentNode) {
    this.bubbleShadow_.parentNode.removeChild(this.bubbleShadow_);
  }

  for (var i = 0, listener; listener = this.listeners_[i]; i++) {
    google.maps.event.removeListener(listener);
  }
};
InfoBubble.prototype['onRemove'] = InfoBubble.prototype.onRemove;


/**
 * Is the InfoBubble open
 *
 * @return {boolean} If the InfoBubble is open.
 */
InfoBubble.prototype.isOpen = function() {
  return this.isOpen_;
};
InfoBubble.prototype['isOpen'] = InfoBubble.prototype.isOpen;


/**
 * Close the InfoBubble
 */
InfoBubble.prototype.close = function() {
  if (this.bubble_) {
    this.bubble_.style['display'] = 'none';
    // Remove the animation so we next time it opens it will animate again
    this.bubble_.className =
        this.bubble_.className.replace(this.animationName_, '');
  }

  if (this.bubbleShadow_) {
    this.bubbleShadow_.style['display'] = 'none';
    this.bubbleShadow_.className =
        this.bubbleShadow_.className.replace(this.animationName_, '');
  }
  this.isOpen_ = false;
};
InfoBubble.prototype['close'] = InfoBubble.prototype.close;


/**
 * Open the InfoBubble (asynchronous).
 *
 * @param {google.maps.Map=} opt_map Optional map to open on.
 * @param {google.maps.MVCObject=} opt_anchor Optional anchor to position at.
 */
InfoBubble.prototype.open = function(opt_map, opt_anchor) {
  var that = this;
  window.setTimeout(function() {
    that.open_(opt_map, opt_anchor);
  }, 0);
};


/**
 * Open the InfoBubble
 * @private
 * @param {google.maps.Map=} opt_map Optional map to open on.
 * @param {google.maps.MVCObject=} opt_anchor Optional anchor to position at.
 */
InfoBubble.prototype.open_ = function(opt_map, opt_anchor) {
  this.updateContent_();

  if (opt_map) {
    this.setMap(opt_map);
  }

  if (opt_anchor) {
    this.set('anchor', opt_anchor);
    this.bindTo('anchorPoint', opt_anchor);
    this.bindTo('position', opt_anchor);
  }

  // Show the bubble and the show
  this.bubble_.style['display'] = this.bubbleShadow_.style['display'] = '';
  var animation = !this.get('disableAnimation');

  if (animation) {
    // Add the animation
    this.bubble_.className += ' ' + this.animationName_;
    this.bubbleShadow_.className += ' ' + this.animationName_;
  }

  this.redraw_();
  this.isOpen_ = true;

  var pan = !this.get('disableAutoPan');
  if (pan) {
    var that = this;
    window.setTimeout(function() {
      // Pan into view, done in a time out to make it feel nicer :)
      that.panToView();
    }, 200);
  }
};
InfoBubble.prototype['open'] = InfoBubble.prototype.open;


/**
 * Set the position of the InfoBubble
 *
 * @param {google.maps.LatLng} position The position to set.
 */
InfoBubble.prototype.setPosition = function(position) {
  if (position) {
    this.set('position', position);
  }
};
InfoBubble.prototype['setPosition'] = InfoBubble.prototype.setPosition;


/**
 * Returns the position of the InfoBubble
 *
 * @return {google.maps.LatLng} the position.
 */
InfoBubble.prototype.getPosition = function() {
  return /** @type {google.maps.LatLng} */ (this.get('position'));
};
InfoBubble.prototype['getPosition'] = InfoBubble.prototype.getPosition;


/**
 * position changed MVC callback
 */
InfoBubble.prototype.position_changed = function() {
  this.draw();
};
InfoBubble.prototype['position_changed'] = InfoBubble.prototype.position_changed;


/**
 * Pan the InfoBubble into view
 */
InfoBubble.prototype.panToView = function() {
  var projection = this.getProjection();

  if (!projection) {
    // The map projection is not ready yet so do nothing
    return;
  }

  if (!this.bubble_) {
    // No Bubble yet so do nothing
    return;
  }

  var anchorHeight = this.getAnchorHeight_();
  var height = this.bubble_.offsetHeight + anchorHeight;
  var map = this.get('map');
  var mapDiv = map.getDiv();
  var mapHeight = mapDiv.offsetHeight;

  var latLng = this.getPosition();
  var centerPos = projection.fromLatLngToContainerPixel(map.getCenter());
  var pos = projection.fromLatLngToContainerPixel(latLng);

  // Find out how much space at the top is free
  var spaceTop = centerPos.y - height;

  // Fine out how much space at the bottom is free
  var spaceBottom = mapHeight - centerPos.y;

  var needsTop = spaceTop < 0;
  var deltaY = 0;

  if (needsTop) {
    spaceTop *= -1;
    deltaY = (spaceTop + spaceBottom) / 2;
  }

  pos.y -= deltaY;
  latLng = projection.fromContainerPixelToLatLng(pos);

  if (map.getCenter() != latLng) {
    map.panTo(latLng);
  }
};
InfoBubble.prototype['panToView'] = InfoBubble.prototype.panToView;


/**
 * Converts a HTML string to a document fragment.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {Node} A HTML document fragment.
 * @private
 */
InfoBubble.prototype.htmlToDocumentFragment_ = function(htmlString) {
  htmlString = htmlString.replace(/^\s*([\S\s]*)\b\s*$/, '$1');
  var tempDiv = document.createElement('DIV');
  tempDiv.innerHTML = htmlString;
  if (tempDiv.childNodes.length == 1) {
    return /** @type {!Node} */ (tempDiv.removeChild(tempDiv.firstChild));
  } else {
    var fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  }
};


/**
 * Removes all children from the node.
 *
 * @param {Node} node The node to remove all children from.
 * @private
 */
InfoBubble.prototype.removeChildren_ = function(node) {
  if (!node) {
    return;
  }

  var child;
  while (child = node.firstChild) {
    node.removeChild(child);
  }
};


/**
 * Sets the content of the infobubble.
 *
 * @param {string|Node} content The content to set.
 */
InfoBubble.prototype.setContent = function(content) {
  this.set('content', content);
};
InfoBubble.prototype['setContent'] = InfoBubble.prototype.setContent;


/**
 * Get the content of the infobubble.
 *
 * @return {string|Node} The marker content.
 */
InfoBubble.prototype.getContent = function() {
  return /** @type {Node|string} */ (this.get('content'));
};
InfoBubble.prototype['getContent'] = InfoBubble.prototype.getContent;


/**
 * Sets the marker content and adds loading events to images
 */
InfoBubble.prototype.updateContent_ = function() {
  if (!this.content_) {
    // The Content area doesnt exist.
    return;
  }

  this.removeChildren_(this.content_);
  var content = this.getContent();
  if (content) {
    if (typeof content == 'string') {
      content = this.htmlToDocumentFragment_(content);
    }
    this.content_.appendChild(content);

    var that = this;
    var images = this.content_.getElementsByTagName('IMG');
    for (var i = 0, image; image = images[i]; i++) {
      // Because we don't know the size of an image till it loads, add a
      // listener to the image load so the marker can resize and reposition
      // itself to be the correct height.
      google.maps.event.addDomListener(image, 'load', function() {
        that.imageLoaded_();
      });
    }
  }
  this.redraw_();
};


/**
 * Image loaded
 * @private
 */
InfoBubble.prototype.imageLoaded_ = function() {
  var pan = !this.get('disableAutoPan');
  this.redraw_();
  if (pan && (this.tabs_.length == 0 || this.activeTab_.index == 0)) {
    this.panToView();
  }
};


/**
 * Updates the styles of the tabs
 * @private
 */
InfoBubble.prototype.updateTabStyles_ = function() {
  if (this.tabs_ && this.tabs_.length) {
    for (var i = 0, tab; tab = this.tabs_[i]; i++) {
      this.setTabStyle_(tab.tab);
    }
    this.activeTab_.style['zIndex'] = this.baseZIndex_;
    var borderWidth = this.getBorderWidth_();
    var padding = this.getPadding_() / 2;
    this.activeTab_.style['borderBottomWidth'] = 0;
    this.activeTab_.style['paddingBottom'] = this.px(padding + borderWidth);
  }
};


/**
 * Sets the style of a tab
 * @private
 * @param {Element} tab The tab to style.
 */
InfoBubble.prototype.setTabStyle_ = function(tab) {
  var backgroundColor = this.get('backgroundColor');
  var borderColor = this.get('borderColor');
  var borderRadius = this.getBorderRadius_();
  var borderWidth = this.getBorderWidth_();
  var padding = this.getPadding_();

  var marginRight = this.px(-(Math.max(padding, borderRadius)));
  var borderRadiusPx = this.px(borderRadius);

  var index = this.baseZIndex_;
  if (tab.index) {
    index -= tab.index;
  }

  // The styles for the tab
  var styles = {
    'cssFloat': 'left',
    'position': 'relative',
    'cursor': 'pointer',
    'backgroundColor': backgroundColor,
    'border': this.px(borderWidth) + ' solid ' + borderColor,
    'padding': this.px(padding / 2) + ' ' + this.px(padding),
    'marginRight': marginRight,
    'whiteSpace': 'nowrap',
    'borderRadiusTopLeft': borderRadiusPx,
    'MozBorderRadiusTopleft': borderRadiusPx,
    'webkitBorderTopLeftRadius': borderRadiusPx,
    'borderRadiusTopRight': borderRadiusPx,
    'MozBorderRadiusTopright': borderRadiusPx,
    'webkitBorderTopRightRadius': borderRadiusPx,
    'zIndex': index,
    'display': 'inline'
  };

  for (var style in styles) {
    tab.style[style] = styles[style];
  }

  var className = this.get('tabClassName');
  if (className != undefined) {
    tab.className += ' ' + className;
  }
};


/**
 * Add user actions to a tab
 * @private
 * @param {Object} tab The tab to add the actions to.
 */
InfoBubble.prototype.addTabActions_ = function(tab) {
  var that = this;
  tab.listener_ = google.maps.event.addDomListener(tab, 'click', function() {
    that.setTabActive_(this);
  });
};


/**
 * Set a tab at a index to be active
 *
 * @param {number} index The index of the tab.
 */
InfoBubble.prototype.setTabActive = function(index) {
  var tab = this.tabs_[index - 1];

  if (tab) {
    this.setTabActive_(tab.tab);
  }
};
InfoBubble.prototype['setTabActive'] = InfoBubble.prototype.setTabActive;


/**
 * Set a tab to be active
 * @private
 * @param {Object} tab The tab to set active.
 */
InfoBubble.prototype.setTabActive_ = function(tab) {
  if (!tab) {
    this.setContent('');
    this.updateContent_();
    return;
  }

  var padding = this.getPadding_() / 2;
  var borderWidth = this.getBorderWidth_();

  if (this.activeTab_) {
    var activeTab = this.activeTab_;
    activeTab.style['zIndex'] = this.baseZIndex_ - activeTab.index;
    activeTab.style['paddingBottom'] = this.px(padding);
    activeTab.style['borderBottomWidth'] = this.px(borderWidth);
  }

  tab.style['zIndex'] = this.baseZIndex_;
  tab.style['borderBottomWidth'] = 0;
  tab.style['marginBottomWidth'] = '-10px';
  tab.style['paddingBottom'] = this.px(padding + borderWidth);

  this.setContent(this.tabs_[tab.index].content);
  this.updateContent_();

  this.activeTab_ = tab;

  this.redraw_();
};


/**
 * Set the max width of the InfoBubble
 *
 * @param {number} width The max width.
 */
InfoBubble.prototype.setMaxWidth = function(width) {
  this.set('maxWidth', width);
};
InfoBubble.prototype['setMaxWidth'] = InfoBubble.prototype.setMaxWidth;


/**
 * maxWidth changed MVC callback
 */
InfoBubble.prototype.maxWidth_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['maxWidth_changed'] = InfoBubble.prototype.maxWidth_changed;


/**
 * Set the max height of the InfoBubble
 *
 * @param {number} height The max height.
 */
InfoBubble.prototype.setMaxHeight = function(height) {
  this.set('maxHeight', height);
};
InfoBubble.prototype['setMaxHeight'] = InfoBubble.prototype.setMaxHeight;


/**
 * maxHeight changed MVC callback
 */
InfoBubble.prototype.maxHeight_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['maxHeight_changed'] = InfoBubble.prototype.maxHeight_changed;


/**
 * Set the min width of the InfoBubble
 *
 * @param {number} width The min width.
 */
InfoBubble.prototype.setMinWidth = function(width) {
  this.set('minWidth', width);
};
InfoBubble.prototype['setMinWidth'] = InfoBubble.prototype.setMinWidth;


/**
 * minWidth changed MVC callback
 */
InfoBubble.prototype.minWidth_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['minWidth_changed'] = InfoBubble.prototype.minWidth_changed;


/**
 * Set the min height of the InfoBubble
 *
 * @param {number} height The min height.
 */
InfoBubble.prototype.setMinHeight = function(height) {
  this.set('minHeight', height);
};
InfoBubble.prototype['setMinHeight'] = InfoBubble.prototype.setMinHeight;


/**
 * minHeight changed MVC callback
 */
InfoBubble.prototype.minHeight_changed = function() {
  this.redraw_();
};
InfoBubble.prototype['minHeight_changed'] = InfoBubble.prototype.minHeight_changed;


/**
 * Add a tab
 *
 * @param {string} label The label of the tab.
 * @param {string|Element} content The content of the tab.
 */
InfoBubble.prototype.addTab = function(label, content) {
  var tab = document.createElement('DIV');
  tab.innerHTML = label;

  this.setTabStyle_(tab);
  this.addTabActions_(tab);

  this.tabsContainer_.appendChild(tab);

  this.tabs_.push({
    label: label,
    content: content,
    tab: tab
  });

  tab.index = this.tabs_.length - 1;
  tab.style['zIndex'] = this.baseZIndex_ - tab.index;

  if (!this.activeTab_) {
    this.setTabActive_(tab);
  }

  tab.className = tab.className + ' ' + this.animationName_;

  this.redraw_();
};
InfoBubble.prototype['addTab'] = InfoBubble.prototype.addTab;


/**
 * Update a tab at a speicifc index
 *
 * @param {number} index The index of the tab.
 * @param {?string} opt_label The label to change to.
 * @param {?string} opt_content The content to update to.
 */
InfoBubble.prototype.updateTab = function(index, opt_label, opt_content) {
  if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) {
    return;
  }

  var tab = this.tabs_[index];
  if (opt_label != undefined) {
    tab.tab.innerHTML = tab.label = opt_label;
  }

  if (opt_content != undefined) {
    tab.content = opt_content;
  }

  if (this.activeTab_ == tab.tab) {
    this.setContent(tab.content);
    this.updateContent_();
  }
  this.redraw_();
};
InfoBubble.prototype['updateTab'] = InfoBubble.prototype.updateTab;


/**
 * Remove a tab at a specific index
 *
 * @param {number} index The index of the tab to remove.
 */
InfoBubble.prototype.removeTab = function(index) {
  if (!this.tabs_.length || index < 0 || index >= this.tabs_.length) {
    return;
  }

  var tab = this.tabs_[index];
  tab.tab.parentNode.removeChild(tab.tab);

  google.maps.event.removeListener(tab.tab.listener_);

  this.tabs_.splice(index, 1);

  delete tab;

  for (var i = 0, t; t = this.tabs_[i]; i++) {
    t.tab.index = i;
  }

  if (tab.tab == this.activeTab_) {
    // Removing the current active tab
    if (this.tabs_[index]) {
      // Show the tab to the right
      this.activeTab_ = this.tabs_[index].tab;
    } else if (this.tabs_[index - 1]) {
      // Show a tab to the left
      this.activeTab_ = this.tabs_[index - 1].tab;
    } else {
      // No tabs left to sho
      this.activeTab_ = undefined;
    }

    this.setTabActive_(this.activeTab_);
  }

  this.redraw_();
};
InfoBubble.prototype['removeTab'] = InfoBubble.prototype.removeTab;


/**
 * Get the size of an element
 * @private
 * @param {Node|string} element The element to size.
 * @param {number=} opt_maxWidth Optional max width of the element.
 * @param {number=} opt_maxHeight Optional max height of the element.
 * @return {google.maps.Size} The size of the element.
 */
InfoBubble.prototype.getElementSize_ = function(element, opt_maxWidth,
                                                opt_maxHeight) {
  var sizer = document.createElement('DIV');
  sizer.style['display'] = 'inline';
  sizer.style['position'] = 'absolute';
  sizer.style['visibility'] = 'hidden';

  if (typeof element == 'string') {
    sizer.innerHTML = element;
  } else {
    sizer.appendChild(element.cloneNode(true));
  }

  document.body.appendChild(sizer);
  var size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);

  // If the width is bigger than the max width then set the width and size again
  if (opt_maxWidth && size.width > opt_maxWidth) {
    sizer.style['width'] = this.px(opt_maxWidth);
    size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
  }

  // If the height is bigger than the max height then set the height and size
  // again
  if (opt_maxHeight && size.height > opt_maxHeight) {
    sizer.style['height'] = this.px(opt_maxHeight);
    size = new google.maps.Size(sizer.offsetWidth, sizer.offsetHeight);
  }

  document.body.removeChild(sizer);
  delete sizer;
  return size;
};


/**
 * Redraw the InfoBubble
 * @private
 */
InfoBubble.prototype.redraw_ = function() {
  this.figureOutSize_();
  this.positionCloseButton_();
  this.draw();
};


/**
 * Figure out the optimum size of the InfoBubble
 * @private
 */
InfoBubble.prototype.figureOutSize_ = function() {
  var map = this.get('map');

  if (!map) {
    return;
  }

  var padding = this.getPadding_();
  var borderWidth = this.getBorderWidth_();
  var borderRadius = this.getBorderRadius_();
  var arrowSize = this.getArrowSize_();

  var mapDiv = map.getDiv();
  var gutter = arrowSize * 2;
  var mapWidth = mapDiv.offsetWidth - gutter;
  var mapHeight = mapDiv.offsetHeight - gutter - this.getAnchorHeight_();
  var tabHeight = 0;
  var width = /** @type {number} */ (this.get('minWidth') || 0);
  var height = /** @type {number} */ (this.get('minHeight') || 0);
  var maxWidth = /** @type {number} */ (this.get('maxWidth') || 0);
  var maxHeight = /** @type {number} */ (this.get('maxHeight') || 0);

  maxWidth = Math.min(mapWidth, maxWidth);
  maxHeight = Math.min(mapHeight, maxHeight);

  var tabWidth = 0;
  if (this.tabs_.length) {
    // If there are tabs then you need to check the size of each tab's content
    for (var i = 0, tab; tab = this.tabs_[i]; i++) {
      var tabSize = this.getElementSize_(tab.tab, maxWidth, maxHeight);
      var contentSize = this.getElementSize_(tab.content, maxWidth, maxHeight);

      if (width < tabSize.width) {
        width = tabSize.width;
      }

      // Add up all the tab widths because they might end up being wider than
      // the content
      tabWidth += tabSize.width;

      if (height < tabSize.height) {
        height = tabSize.height;
      }

      if (tabSize.height > tabHeight) {
        tabHeight = tabSize.height;
      }

      if (width < contentSize.width) {
        width = contentSize.width;
      }

      if (height < contentSize.height) {
        height = contentSize.height;
      }
    }
  } else {
    var content = /** @type {string|Node} */ (this.get('content'));
    if (typeof content == 'string') {
      content = this.htmlToDocumentFragment_(content);
    }
    if (content) {
      var contentSize = this.getElementSize_(content, maxWidth, maxHeight);

      if (width < contentSize.width) {
        width = contentSize.width;
      }

      if (height < contentSize.height) {
        height = contentSize.height;
      }
    }
  }

  if (maxWidth) {
    width = Math.min(width, maxWidth);
  }

  if (maxHeight) {
    height = Math.min(height, maxHeight);
  }

  width = Math.max(width, tabWidth);

  if (width == tabWidth) {
    width = width + 2 * padding;
  }

  arrowSize = arrowSize * 2;
  width = Math.max(width, arrowSize);

  // Maybe add this as a option so they can go bigger than the map if the user
  // wants
  if (width > mapWidth) {
    width = mapWidth;
  }

  if (height > mapHeight) {
    height = mapHeight - tabHeight;
  }

  if (this.tabsContainer_) {
    this.tabHeight_ = tabHeight;
    this.tabsContainer_.style['width'] = this.px(tabWidth);
  }

  this.contentContainer_.style['width'] = this.px(width);
  this.contentContainer_.style['height'] = this.px(height);
};


/**
 *  Get the height of the anchor
 *
 *  This function is a hack for now and doesn't really work that good, need to
 *  wait for pixelBounds to be correctly exposed.
 *  @private
 *  @return {number} The height of the anchor.
 */
InfoBubble.prototype.getAnchorHeight_ = function() {
  var anchor = this.get('anchor');
  if (anchor) {
    var anchorPoint = /** @type google.maps.Point */(this.get('anchorPoint'));

    if (anchorPoint) {
      return -1 * anchorPoint.y;
    }
  }
  return 0;
};

InfoBubble.prototype.anchorPoint_changed = function() {
  this.draw();
};
InfoBubble.prototype['anchorPoint_changed'] = InfoBubble.prototype.anchorPoint_changed;


/**
 * Position the close button in the right spot.
 * @private
 */
InfoBubble.prototype.positionCloseButton_ = function() {
  var br = this.getBorderRadius_();
  var bw = this.getBorderWidth_();

  var right = 2;
  var top = 2;

  if (this.tabs_.length && this.tabHeight_) {
    top += this.tabHeight_;
  }

  top += bw;
  right += bw;

  var c = this.contentContainer_;
  if (c && c.clientHeight < c.scrollHeight) {
    // If there are scrollbars then move the cross in so it is not over
    // scrollbar
    right += 15;
  }

  this.close_.style['right'] = this.px(right);
  this.close_.style['top'] = this.px(top);
};
;/*})'"*/;/*})'"*/
/**
 * @file
 * Initiates map(s) for the Styled Google Map module.
 *
 * A single or multiple Styled Google Maps will be initiated.
 * Drupal behaviors are used to make sure ajax called map(s) are correctly loaded.
 */

(function ($) {

  $.fn.isInViewport = function(y) {
    var y = y || 1;
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var elementHeight = $(this).height();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    var deltaTop = Math.min(1, (elementBottom - viewportTop) / elementHeight);
    var deltaBottom = Math.min(1, (viewportBottom - elementTop) / elementHeight);
    return deltaTop * deltaBottom >= y;
  };

  Drupal.behaviors.styled_google_map = {
    attach: function (context, settings) {

      var maps = settings.styled_google_map;
      var markers = [];
      for (i in maps) {
        var current_map = settings['id' + maps[i]];
        var map_id = current_map.id;
        console.log(current_map);
        if (current_map.scroll_delay == true) {
          $(window).on('resize scroll', function() {
            if ($('#' + map_id).isInViewport(0.5) && !$('#' + map_id).hasClass('processed')) {
              console.log('mld');
              loadMap();
            }
          });
        }
        else {
          console.log('asdf');
          loadMap();
        }


        function loadMap() {

          if ($('#' + map_id).length) {
            var map_locations = current_map.locations;
            var map_settings = current_map.settings;
            var bounds = new google.maps.LatLngBounds();
            var map_types = {
              'ROADMAP': google.maps.MapTypeId.ROADMAP,
              'SATELLITE': google.maps.MapTypeId.SATELLITE,
              'HYBRID': google.maps.MapTypeId.HYBRID,
              'TERRAIN': google.maps.MapTypeId.TERRAIN
            }
            var map_style = (map_settings.style.style != '' ? map_settings.style.style : '[]');

            map_settings.draggable = $(window).width() > 480 ? map_settings.draggable : map_settings.mobile_draggable;

            var init_map = {
              zoom: parseInt(map_settings.zoom.default),
              mapTypeId: map_types[map_settings.style.maptype],
              disableDefaultUI: !map_settings.ui,
              maxZoom: parseInt(map_settings.zoom.max),
              minZoom: parseInt(map_settings.zoom.min),
              styles: JSON.parse(map_style),
              mapTypeControl: map_settings.maptypecontrol,
              scaleControl: map_settings.scalecontrol,
              rotateControl: map_settings.rotatecontrol,
              streetViewControl: map_settings.streetviewcontrol,
              zoomControl: map_settings.zoomcontrol,
              //scrollwheel: map_settings.scrollwheel,
              draggable: map_settings.draggable,
              gestureHandling: "cooperative",
            }
            var map = new google.maps.Map(document.getElementById(map_id), init_map);

            $('#' + map_id).addClass('processed');

            var infoBubble = new InfoBubble({
              shadowStyle: parseInt(map_settings.popup.shadow_style),
              padding: parseInt(map_settings.popup.padding),
              borderRadius: parseInt(map_settings.popup.border_radius),
              borderWidth: parseInt(map_settings.popup.border_width),
              borderColor: map_settings.popup.border_color,
              backgroundColor: map_settings.popup.background_color,
              minWidth: map_settings.popup.min_width,
              maxWidth: map_settings.popup.max_width,
              maxHeight: map_settings.popup.min_height,
              minHeight: map_settings.popup.max_height,
              arrowStyle: parseInt(map_settings.popup.arrow_style),
              arrowSize: parseInt(map_settings.popup.arrow_size),
              arrowPosition: parseInt(map_settings.popup.arrow_position),
              disableAutoPan: map_settings.popup.disable_autopan,
              disableAnimation: parseInt(map_settings.popup.disable_animation),
              hideCloseButton: parseInt(map_settings.popup.hide_close_button),
              backgroundClassName: map_settings.popup.classes.background,
            });
            // Set extra custom classes for easy styling.
            infoBubble.bubble_.className = 'sgmpopup sgmpopup-' + this.category;
            // infoBubble.close_.src = map_settings.style.active_pin;
            infoBubble.contentContainer_.className = map_settings.popup.classes.container;
            infoBubble.arrow_.className = map_settings.popup.classes.arrow;
            infoBubble.arrowOuter_.className = map_settings.popup.classes.arrow_outer;
            infoBubble.arrowInner_.className = map_settings.popup.classes.arrow_inner;
            if (map_settings.style.cluster_pin) {
              var clusterStyles = [
                {
                  textColor: 'white',
                  url: map_settings.style.cluster_pin,
                  height: 73,
                  width: 73,
                  textSize: 17
                },
                {
                  textColor: 'white',
                  url: map_settings.style.cluster_pin,
                  height: 73,
                  width: 73,
                  textSize: 17
                },
                {
                  textColor: 'white',
                  url: map_settings.style.cluster_pin,
                  height: 73,
                  width: 73,
                  textSize: 17
                }
              ];
              var mcOptions = {
                gridSize: 60,
                styles: clusterStyles,
                minimumClusterSize: 2,
              };
            }
            for (j in map_locations) {

              var relaCustomIcon = map_locations[j].pin;
              if (map_locations[j].pinAttributes !== undefined) {
                 var h = map_locations[j].pinAttributes['pinHeight'];
                 var w = map_locations[j].pinAttributes['pinWidth'];
                 //console.log(w);
                 relaCustomIcon = {
                  url: map_locations[j].pin, // url
                  scaledSize: new google.maps.Size(w, h), // scaled size
                  origin: new google.maps.Point(0,0), // origin
                  anchor: new google.maps.Point((w/2), (h/2)) // anchor
                }
              }


              var marker = new google.maps.Marker({
                position: new google.maps.LatLng(map_locations[j].lat , map_locations[j].lon),
                map: map,
                html: map_locations[j].popup,
                icon: relaCustomIcon,
                original_icon: map_locations[j].pin,
                active_icon: !map_locations[j].pin_active ? map_locations[j].pin : map_locations[j].pin_active,
                category: map_locations[j].category,
                nid: map_locations[j].nid // ML Added dis.
              });

              markers.push(marker);
              if (map_locations[j].popup) {
                google.maps.event.addListener(marker, 'click', (function(map){
                    return function() {
                        infoBubble.setContent(this.html);
                        for (var i = 0; i < markers.length; i++) {
                           markers[i].setIcon(markers[i].original_icon);
                        }
                        this.setIcon(this.active_icon);
                        infoBubble.open(map, this);
                    };
                }(map)));
              }
              bounds.extend(marker.getPosition());
            }


            if (map_settings.style.cluster_pin) {
              var markerCluster = new MarkerClusterer(map, markers, mcOptions);
            }
          }
          if (map_settings !== undefined) {
            if (map_settings.map_center && map_settings.map_center.center_coordinates.lat) {
              var map_center = new google.maps.LatLng(map_settings.map_center.center_coordinates.lat , map_settings.map_center.center_coordinates.lon);
              bounds.extend(map_center);
              map.setCenter(map_center);
            } else {
              map.setCenter(bounds.getCenter());
              if (map_locations.length > 1) {
                map.fitBounds(bounds);
              }
            }
         }
        }
        // Add the map to the data attr to easily access from other function.
        $('#' + map_id).data('map', map);
        $('#' + map_id).data('markers', markers);
        // Prevents piling up generated map ids.
        settings.styled_google_map = [];

      }
    }
  }
  if (Drupal.ajax !== undefined) {

    // Fixes ajax view filters with refreshed settings

    // MIKE 10.24.17 - What the fuck this breaks our form ajax.
    // Drupal.ajax.prototype.commands.settings = function (ajax, response, status) {

    //   if (ajax.element_settings.event == 'RefreshView') {
    //    // ajax.settings = response.settings;
    //   }
    // };
  }
})(jQuery);
;/*})'"*/;/*})'"*/
/**
 * Owl carousel
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 * @todo Lazy Load Icon
 * @todo prevent animationend bubling
 * @todo itemsScaleUp
 * @todo Test Zepto
 * @todo stagePadding calculate wrong active classes
 */
;
(function($, window, document, undefined) {

  var drag, state, e;

  /**
   * Template for status information about drag and touch events.
   * @private
   */
  drag = {
    start: 0,
    startX: 0,
    startY: 0,
    current: 0,
    currentX: 0,
    currentY: 0,
    offsetX: 0,
    offsetY: 0,
    distance: null,
    startTime: 0,
    endTime: 0,
    updatedX: 0,
    targetEl: null
  };

  /**
   * Template for some status informations.
   * @private
   */
  state = {
    isTouch: false,
    isScrolling: false,
    isSwiping: false,
    direction: false,
    inMotion: false
  };

  /**
   * Event functions references.
   * @private
   */
  e = {
    _onDragStart: null,
    _onDragMove: null,
    _onDragEnd: null,
    _transitionEnd: null,
    _resizer: null,
    _responsiveCall: null,
    _goToLoop: null,
    _checkVisibile: null
  };

  /**
   * Creates a carousel.
   * @class The Owl Carousel.
   * @public
   * @param {HTMLElement|jQuery} element - The element to create the carousel for.
   * @param {Object} [options] - The options
   */
  function Owl(element, options) {

    /**
     * Current settings for the carousel.
     * @public
     */
    this.settings = null;

    /**
     * Current options set by the caller including defaults.
     * @public
     */
    this.options = $.extend({}, Owl.Defaults, options);

    /**
     * Plugin element.
     * @public
     */
    this.$element = $(element);

    /**
     * Caches informations about drag and touch events.
     */
    this.drag = $.extend({}, drag);

    /**
     * Caches some status informations.
     * @protected
     */
    this.state = $.extend({}, state);

    /**
     * @protected
     * @todo Must be documented
     */
    this.e = $.extend({}, e);

    /**
     * References to the running plugins of this carousel.
     * @protected
     */
    this._plugins = {};

    /**
 *    Currently suppressed events to prevent them from beeing retriggered.
     * @protected
     */
    this._supress = {};

    /**
     * Absolute current position.
     * @protected
     */
    this._current = null;

    /**
     * Animation speed in milliseconds.
     * @protected
     */
    this._speed = null;

    /**
     * Coordinates of all items in pixel.
     * @todo The name of this member is missleading.
     * @protected
     */
    this._coordinates = [];

    /**
     * Current breakpoint.
     * @todo Real media queries would be nice.
     * @protected
     */
    this._breakpoint = null;

    /**
     * Current width of the plugin element.
     */
    this._width = null;

    /**
     * All real items.
     * @protected
     */
    this._items = [];

    /**
     * All cloned items.
     * @protected
     */
    this._clones = [];

    /**
     * Merge values of all items.
     * @todo Maybe this could be part of a plugin.
     * @protected
     */
    this._mergers = [];

    /**
     * Invalidated parts within the update process.
     * @protected
     */
    this._invalidated = {};

    /**
     * Ordered list of workers for the update process.
     * @protected
     */
    this._pipe = [];

    $.each(Owl.Plugins, $.proxy(function(key, plugin) {
      this._plugins[key[0].toLowerCase() + key.slice(1)] = new plugin(this);
    }, this));

    $.each(Owl.Pipe, $.proxy(function(priority, worker) {
      this._pipe.push({
        'filter': worker.filter,
        'run': $.proxy(worker.run, this)
      });
    }, this));

    this.setup();
    this.initialize();
  }

  /**
   * Default options for the carousel.
   * @public
   */
  Owl.Defaults = {
    items: 3,
    loop: false,
    center: false,

    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    freeDrag: false,

    margin: 0,
    stagePadding: 0,

    merge: false,
    mergeFit: true,
    autoWidth: false,

    startPosition: 0,
    rtl: false,

    smartSpeed: 250,
    fluidSpeed: false,
    dragEndSpeed: false,

    responsive: {},
    responsiveRefreshRate: 200,
    responsiveBaseElement: window,
    responsiveClass: false,

    fallbackEasing: 'swing',

    info: false,

    nestedItemSelector: false,
    itemElement: 'div',
    stageElement: 'div',

    // Classes and Names
    themeClass: 'owl-theme',
    baseClass: 'owl-carousel',
    itemClass: 'owl-item',
    centerClass: 'center',
    activeClass: 'active'
  };

  /**
   * Enumeration for width.
   * @public
   * @readonly
   * @enum {String}
   */
  Owl.Width = {
    Default: 'default',
    Inner: 'inner',
    Outer: 'outer'
  };

  /**
   * Contains all registered plugins.
   * @public
   */
  Owl.Plugins = {};

  /**
   * Update pipe.
   */
  Owl.Pipe = [{
    filter: ['width', 'items', 'settings'],
    run: function(cache) {
      cache.current = this._items && this._items[this.relative(this._current)];
    }
  }, {
    filter: ['items', 'settings'],
    run: function() {
      var cached = this._clones,
        clones = this.$stage.children('.cloned');

      if (clones.length !== cached.length || (!this.settings.loop && cached.length > 0)) {
        this.$stage.children('.cloned').remove();
        this._clones = [];
      }
    }
  }, {
    filter: ['items', 'settings'],
    run: function() {
      var i, n,
        clones = this._clones,
        items = this._items,
        delta = this.settings.loop ? clones.length - Math.max(this.settings.items * 2, 4) : 0;

      for (i = 0, n = Math.abs(delta / 2); i < n; i++) {
        if (delta > 0) {
          this.$stage.children().eq(items.length + clones.length - 1).remove();
          clones.pop();
          this.$stage.children().eq(0).remove();
          clones.pop();
        } else {
          clones.push(clones.length / 2);
          this.$stage.append(items[clones[clones.length - 1]].clone().addClass('cloned'));
          clones.push(items.length - 1 - (clones.length - 1) / 2);
          this.$stage.prepend(items[clones[clones.length - 1]].clone().addClass('cloned'));
        }
      }
    }
  }, {
    filter: ['width', 'items', 'settings'],
    run: function() {
      var rtl = (this.settings.rtl ? 1 : -1),
        width = (this.width() / this.settings.items).toFixed(3),
        coordinate = 0,
        merge, i, n;

      this._coordinates = [];
      for (i = 0, n = this._clones.length + this._items.length; i < n; i++) {
        merge = this._mergers[this.relative(i)];
        merge = (this.settings.mergeFit && Math.min(merge, this.settings.items)) || merge;
        coordinate += (this.settings.autoWidth ? this._items[this.relative(i)].width() + this.settings.margin : width * merge) * rtl;

        this._coordinates.push(coordinate);
      }
    }
  }, {
    filter: ['width', 'items', 'settings'],
    run: function() {
      var i, n, width = (this.width() / this.settings.items).toFixed(3),
        css = {
          'width': Math.abs(this._coordinates[this._coordinates.length - 1]) + this.settings.stagePadding * 2,
          'padding-left': this.settings.stagePadding || '',
          'padding-right': this.settings.stagePadding || ''
        };

      this.$stage.css(css);

      css = {
        'width': this.settings.autoWidth ? 'auto' : width - this.settings.margin
      };
      css[this.settings.rtl ? 'margin-left' : 'margin-right'] = this.settings.margin;

      if (!this.settings.autoWidth && $.grep(this._mergers, function(v) {
          return v > 1
        }).length > 0) {
        for (i = 0, n = this._coordinates.length; i < n; i++) {
          css.width = Math.abs(this._coordinates[i]) - Math.abs(this._coordinates[i - 1] || 0) - this.settings.margin;
          this.$stage.children().eq(i).css(css);
        }
      } else {
        this.$stage.children().css(css);
      }
    }
  }, {
    filter: ['width', 'items', 'settings'],
    run: function(cache) {
      cache.current && this.reset(this.$stage.children().index(cache.current));
    }
  }, {
    filter: ['position'],
    run: function() {
      this.animate(this.coordinates(this._current));
    }
  }, {
    filter: ['width', 'position', 'items', 'settings'],
    run: function() {
      var rtl = this.settings.rtl ? 1 : -1,
        padding = this.settings.stagePadding * 2,
        begin = this.coordinates(this.current()) + padding,
        end = begin + this.width() * rtl,
        inner, outer, matches = [],
        i, n;

      for (i = 0, n = this._coordinates.length; i < n; i++) {
        inner = this._coordinates[i - 1] || 0;
        outer = Math.abs(this._coordinates[i]) + padding * rtl;

        if ((this.op(inner, '<=', begin) && (this.op(inner, '>', end))) ||
          (this.op(outer, '<', begin) && this.op(outer, '>', end))) {
          matches.push(i);
        }
      }

      this.$stage.children('.' + this.settings.activeClass).removeClass(this.settings.activeClass);
      this.$stage.children(':eq(' + matches.join('), :eq(') + ')').addClass(this.settings.activeClass);

      if (this.settings.center) {
        this.$stage.children('.' + this.settings.centerClass).removeClass(this.settings.centerClass);
        this.$stage.children().eq(this.current()).addClass(this.settings.centerClass);
      }
    }
  }];

  /**
   * Initializes the carousel.
   * @protected
   */
  Owl.prototype.initialize = function() {
    this.trigger('initialize');

    this.$element
      .addClass(this.settings.baseClass)
      .addClass(this.settings.themeClass)
      .toggleClass('owl-rtl', this.settings.rtl);

    // check support
    this.browserSupport();

    if (this.settings.autoWidth && this.state.imagesLoaded !== true) {
      var imgs, nestedSelector, width;
      imgs = this.$element.find('img');
      nestedSelector = this.settings.nestedItemSelector ? '.' + this.settings.nestedItemSelector : undefined;
      width = this.$element.children(nestedSelector).width();

      if (imgs.length && width <= 0) {
        this.preloadAutoWidthImages(imgs);
        return false;
      }
    }

    this.$element.addClass('owl-loading');

    // create stage
    this.$stage = $('<' + this.settings.stageElement + ' class="owl-stage"/>')
      .wrap('<div class="owl-stage-outer">');

    // append stage
    this.$element.append(this.$stage.parent());

    // append content
    this.replace(this.$element.children().not(this.$stage.parent()));

    // set view width
    this._width = this.$element.width();

    // update view
    this.refresh();

    this.$element.removeClass('owl-loading').addClass('owl-loaded');

    // attach generic events
    this.eventsCall();

    // attach generic events
    this.internalEvents();

    // attach custom control events
    this.addTriggerableEvents();

    this.trigger('initialized');
  };

  /**
   * Setups the current settings.
   * @todo Remove responsive classes. Why should adaptive designs be brought into IE8?
   * @todo Support for media queries by using `matchMedia` would be nice.
   * @public
   */
  Owl.prototype.setup = function() {
    var viewport = this.viewport(),
      overwrites = this.options.responsive,
      match = -1,
      settings = null;

    if (!overwrites) {
      settings = $.extend({}, this.options);
    } else {
      $.each(overwrites, function(breakpoint) {
        if (breakpoint <= viewport && breakpoint > match) {
          match = Number(breakpoint);
        }
      });

      settings = $.extend({}, this.options, overwrites[match]);
      delete settings.responsive;

      // responsive class
      if (settings.responsiveClass) {
        this.$element.attr('class', function(i, c) {
          return c.replace(/\b owl-responsive-\S+/g, '');
        }).addClass('owl-responsive-' + match);
      }
    }

    if (this.settings === null || this._breakpoint !== match) {
      this.trigger('change', {
        property: {
          name: 'settings',
          value: settings
        }
      });
      this._breakpoint = match;
      this.settings = settings;
      this.invalidate('settings');
      this.trigger('changed', {
        property: {
          name: 'settings',
          value: this.settings
        }
      });
    }
  };

  /**
   * Updates option logic if necessery.
   * @protected
   */
  Owl.prototype.optionsLogic = function() {
    // Toggle Center class
    this.$element.toggleClass('owl-center', this.settings.center);

    // if items number is less than in body
    if (this.settings.loop && this._items.length < this.settings.items) {
      this.settings.loop = false;
    }

    if (this.settings.autoWidth) {
      this.settings.stagePadding = false;
      this.settings.merge = false;
    }
  };

  /**
   * Prepares an item before add.
   * @todo Rename event parameter `content` to `item`.
   * @protected
   * @returns {jQuery|HTMLElement} - The item container.
   */
  Owl.prototype.prepare = function(item) {
    var event = this.trigger('prepare', {
      content: item
    });

    if (!event.data) {
      event.data = $('<' + this.settings.itemElement + '/>')
        .addClass(this.settings.itemClass).append(item)
    }

    this.trigger('prepared', {
      content: event.data
    });

    return event.data;
  };

  /**
   * Updates the view.
   * @public
   */
  Owl.prototype.update = function() {
    var i = 0,
      n = this._pipe.length,
      filter = $.proxy(function(p) {
        return this[p]
      }, this._invalidated),
      cache = {};

    while (i < n) {
      if (this._invalidated.all || $.grep(this._pipe[i].filter, filter).length > 0) {
        this._pipe[i].run(cache);
      }
      i++;
    }

    this._invalidated = {};
  };

  /**
   * Gets the width of the view.
   * @public
   * @param {Owl.Width} [dimension=Owl.Width.Default] - The dimension to return.
   * @returns {Number} - The width of the view in pixel.
   */
  Owl.prototype.width = function(dimension) {
    dimension = dimension || Owl.Width.Default;
    switch (dimension) {
      case Owl.Width.Inner:
      case Owl.Width.Outer:
        return this._width;
      default:
        return this._width - this.settings.stagePadding * 2 + this.settings.margin;
    }
  };

  /**
   * Refreshes the carousel primarily for adaptive purposes.
   * @public
   */
  Owl.prototype.refresh = function() {
    if (this._items.length === 0) {
      return false;
    }

    var start = new Date().getTime();

    this.trigger('refresh');

    this.setup();

    this.optionsLogic();

    // hide and show methods helps here to set a proper widths,
    // this prevents scrollbar to be calculated in stage width
    this.$stage.addClass('owl-refresh');

    this.update();

    this.$stage.removeClass('owl-refresh');

    this.state.orientation = window.orientation;

    this.watchVisibility();

    this.trigger('refreshed');
  };

  /**
   * Save internal event references and add event based functions.
   * @protected
   */
  Owl.prototype.eventsCall = function() {
    // Save events references
    this.e._onDragStart = $.proxy(function(e) {
      this.onDragStart(e);
    }, this);
    this.e._onDragMove = $.proxy(function(e) {
      this.onDragMove(e);
    }, this);
    this.e._onDragEnd = $.proxy(function(e) {
      this.onDragEnd(e);
    }, this);
    this.e._onResize = $.proxy(function(e) {
      this.onResize(e);
    }, this);
    this.e._transitionEnd = $.proxy(function(e) {
      this.transitionEnd(e);
    }, this);
    this.e._preventClick = $.proxy(function(e) {
      this.preventClick(e);
    }, this);
  };

  /**
   * Checks window `resize` event.
   * @protected
   */
  Owl.prototype.onThrottledResize = function() {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(this.e._onResize, this.settings.responsiveRefreshRate);
  };

  /**
   * Checks window `resize` event.
   * @protected
   */
  Owl.prototype.onResize = function() {
    if (!this._items.length) {
      return false;
    }

    if (this._width === this.$element.width()) {
      return false;
    }

    if (this.trigger('resize').isDefaultPrevented()) {
      return false;
    }

    this._width = this.$element.width();

    this.invalidate('width');

    this.refresh();

    this.trigger('resized');
  };

  /**
   * Checks for touch/mouse drag event type and add run event handlers.
   * @protected
   */
  Owl.prototype.eventsRouter = function(event) {
    var type = event.type;

    if (type === "mousedown" || type === "touchstart") {
      this.onDragStart(event);
    } else if (type === "mousemove" || type === "touchmove") {
      this.onDragMove(event);
    } else if (type === "mouseup" || type === "touchend") {
      this.onDragEnd(event);
    } else if (type === "touchcancel") {
      this.onDragEnd(event);
    }
  };

  /**
   * Checks for touch/mouse drag options and add necessery event handlers.
   * @protected
   */
  Owl.prototype.internalEvents = function() {
    var isTouch = isTouchSupport(),
      isTouchIE = isTouchSupportIE();

    if (this.settings.mouseDrag) {
      this.$stage.on('mousedown', $.proxy(function(event) {
        this.eventsRouter(event)
      }, this));
      this.$stage.on('dragstart', function() {
        return false
      });
      this.$stage.get(0).onselectstart = function() {
        return false
      };
    } else {
      this.$element.addClass('owl-text-select-on');
    }

    if (this.settings.touchDrag && !isTouchIE) {
      this.$stage.on('touchstart touchcancel', $.proxy(function(event) {
        this.eventsRouter(event)
      }, this));
    }

    // catch transitionEnd event
    if (this.transitionEndVendor) {
      this.on(this.$stage.get(0), this.transitionEndVendor, this.e._transitionEnd, false);
    }

    // responsive
    if (this.settings.responsive !== false) {
      this.on(window, 'resize', $.proxy(this.onThrottledResize, this));
    }
  };

  /**
   * Handles touchstart/mousedown event.
   * @protected
   * @param {Event} event - The event arguments.
   */
  Owl.prototype.onDragStart = function(event) {
    var ev, isTouchEvent, pageX, pageY, animatedPos;

    ev = event.originalEvent || event || window.event;

    // prevent right click
    if (ev.which === 3 || this.state.isTouch) {
      return false;
    }

    if (ev.type === 'mousedown') {
      this.$stage.addClass('owl-grab');
    }

    this.trigger('drag');
    this.drag.startTime = new Date().getTime();
    this.speed(0);
    this.state.isTouch = true;
    this.state.isScrolling = false;
    this.state.isSwiping = false;
    this.drag.distance = 0;

    pageX = getTouches(ev).x;
    pageY = getTouches(ev).y;

    // get stage position left
    this.drag.offsetX = this.$stage.position().left;
    this.drag.offsetY = this.$stage.position().top;

    if (this.settings.rtl) {
      this.drag.offsetX = this.$stage.position().left + this.$stage.width() - this.width() +
        this.settings.margin;
    }

    // catch position // ie to fix
    if (this.state.inMotion && this.support3d) {
      animatedPos = this.getTransformProperty();
      this.drag.offsetX = animatedPos;
      this.animate(animatedPos);
      this.state.inMotion = true;
    } else if (this.state.inMotion && !this.support3d) {
      this.state.inMotion = false;
      return false;
    }

    this.drag.startX = pageX - this.drag.offsetX;
    this.drag.startY = pageY - this.drag.offsetY;

    this.drag.start = pageX - this.drag.startX;
    this.drag.targetEl = ev.target || ev.srcElement;
    this.drag.updatedX = this.drag.start;

    // to do/check
    // prevent links and images dragging;
    if (this.drag.targetEl.tagName === "IMG" || this.drag.targetEl.tagName === "A") {
      this.drag.targetEl.draggable = false;
    }

    $(document).on('mousemove.owl.dragEvents mouseup.owl.dragEvents touchmove.owl.dragEvents touchend.owl.dragEvents', $.proxy(function(event) {
      this.eventsRouter(event)
    }, this));
  };

  /**
   * Handles the touchmove/mousemove events.
   * @todo Simplify
   * @protected
   * @param {Event} event - The event arguments.
   */
  Owl.prototype.onDragMove = function(event) {
    var ev, isTouchEvent, pageX, pageY, minValue, maxValue, pull;

    if (!this.state.isTouch) {
      return;
    }

    if (this.state.isScrolling) {
      return;
    }

    ev = event.originalEvent || event || window.event;

    pageX = getTouches(ev).x;
    pageY = getTouches(ev).y;

    // Drag Direction
    this.drag.currentX = pageX - this.drag.startX;
    this.drag.currentY = pageY - this.drag.startY;
    this.drag.distance = this.drag.currentX - this.drag.offsetX;

    // Check move direction
    if (this.drag.distance < 0) {
      this.state.direction = this.settings.rtl ? 'right' : 'left';
    } else if (this.drag.distance > 0) {
      this.state.direction = this.settings.rtl ? 'left' : 'right';
    }
    // Loop
    if (this.settings.loop) {
      if (this.op(this.drag.currentX, '>', this.coordinates(this.minimum())) && this.state.direction === 'right') {
        this.drag.currentX -= (this.settings.center && this.coordinates(0)) - this.coordinates(this._items.length);
      } else if (this.op(this.drag.currentX, '<', this.coordinates(this.maximum())) && this.state.direction === 'left') {
        this.drag.currentX += (this.settings.center && this.coordinates(0)) - this.coordinates(this._items.length);
      }
    } else {
      // pull
      minValue = this.settings.rtl ? this.coordinates(this.maximum()) : this.coordinates(this.minimum());
      maxValue = this.settings.rtl ? this.coordinates(this.minimum()) : this.coordinates(this.maximum());
      pull = this.settings.pullDrag ? this.drag.distance / 5 : 0;
      this.drag.currentX = Math.max(Math.min(this.drag.currentX, minValue + pull), maxValue + pull);
    }

    // Lock browser if swiping horizontal

    if ((this.drag.distance > 8 || this.drag.distance < -8)) {
      if (ev.preventDefault !== undefined) {
        ev.preventDefault();
      } else {
        ev.returnValue = false;
      }
      this.state.isSwiping = true;
    }

    this.drag.updatedX = this.drag.currentX;

    // Lock Owl if scrolling
    if ((this.drag.currentY > 16 || this.drag.currentY < -16) && this.state.isSwiping === false) {
      this.state.isScrolling = true;
      this.drag.updatedX = this.drag.start;
    }

    this.animate(this.drag.updatedX);
  };

  /**
   * Handles the touchend/mouseup events.
   * @protected
   */
  Owl.prototype.onDragEnd = function(event) {
    var compareTimes, distanceAbs, closest;

    if (!this.state.isTouch) {
      return;
    }

    if (event.type === 'mouseup') {
      this.$stage.removeClass('owl-grab');
    }

    this.trigger('dragged');

    // prevent links and images dragging;
    this.drag.targetEl.removeAttribute("draggable");

    // remove drag event listeners

    this.state.isTouch = false;
    this.state.isScrolling = false;
    this.state.isSwiping = false;

    // to check
    if (this.drag.distance === 0 && this.state.inMotion !== true) {
      this.state.inMotion = false;
      return false;
    }

    // prevent clicks while scrolling

    this.drag.endTime = new Date().getTime();
    compareTimes = this.drag.endTime - this.drag.startTime;
    distanceAbs = Math.abs(this.drag.distance);

    // to test
    if (distanceAbs > 3 || compareTimes > 300) {
      this.removeClick(this.drag.targetEl);
    }

    closest = this.closest(this.drag.updatedX);

    this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed);
    this.current(closest);
    this.invalidate('position');
    this.update();

    // if pullDrag is off then fire transitionEnd event manually when stick
    // to border
    if (!this.settings.pullDrag && this.drag.updatedX === this.coordinates(closest)) {
      this.transitionEnd();
    }

    this.drag.distance = 0;

    $(document).off('.owl.dragEvents');
  };

  /**
   * Attaches `preventClick` to disable link while swipping.
   * @protected
   * @param {HTMLElement} [target] - The target of the `click` event.
   */
  Owl.prototype.removeClick = function(target) {
    this.drag.targetEl = target;
    $(target).on('click.preventClick', this.e._preventClick);
    // to make sure click is removed:
    window.setTimeout(function() {
      $(target).off('click.preventClick');
    }, 300);
  };

  /**
   * Suppresses click event.
   * @protected
   * @param {Event} ev - The event arguments.
   */
  Owl.prototype.preventClick = function(ev) {
    if (ev.preventDefault) {
      ev.preventDefault();
    } else {
      ev.returnValue = false;
    }
    if (ev.stopPropagation) {
      ev.stopPropagation();
    }
    $(ev.target).off('click.preventClick');
  };

  /**
   * Catches stage position while animate (only CSS3).
   * @protected
   * @returns
   */
  Owl.prototype.getTransformProperty = function() {
    var transform, matrix3d;

    transform = window.getComputedStyle(this.$stage.get(0), null).getPropertyValue(this.vendorName + 'transform');
    // var transform = this.$stage.css(this.vendorName + 'transform')
    transform = transform.replace(/matrix(3d)?\(|\)/g, '').split(',');
    matrix3d = transform.length === 16;

    return matrix3d !== true ? transform[4] : transform[12];
  };

  /**
   * Gets absolute position of the closest item for a coordinate.
   * @todo Setting `freeDrag` makes `closest` not reusable. See #165.
   * @protected
   * @param {Number} coordinate - The coordinate in pixel.
   * @return {Number} - The absolute position of the closest item.
   */
  Owl.prototype.closest = function(coordinate) {
    var position = -1,
      pull = 30,
      width = this.width(),
      coordinates = this.coordinates();

    if (!this.settings.freeDrag) {
      // check closest item
      $.each(coordinates, $.proxy(function(index, value) {
        if (coordinate > value - pull && coordinate < value + pull) {
          position = index;
        } else if (this.op(coordinate, '<', value) &&
          this.op(coordinate, '>', coordinates[index + 1] || value - width)) {
          position = this.state.direction === 'left' ? index + 1 : index;
        }
        return position === -1;
      }, this));
    }

    if (!this.settings.loop) {
      // non loop boundries
      if (this.op(coordinate, '>', coordinates[this.minimum()])) {
        position = coordinate = this.minimum();
      } else if (this.op(coordinate, '<', coordinates[this.maximum()])) {
        position = coordinate = this.maximum();
      }
    }

    return position;
  };

  /**
   * Animates the stage.
   * @public
   * @param {Number} coordinate - The coordinate in pixels.
   */
  Owl.prototype.animate = function(coordinate) {
    this.trigger('translate');
    this.state.inMotion = this.speed() > 0;

    if (this.support3d) {
      this.$stage.css({
        transform: 'translate3d(' + coordinate + 'px' + ',0px, 0px)',
        transition: (this.speed() / 1000) + 's'
      });
    } else if (this.state.isTouch) {
      this.$stage.css({
        left: coordinate + 'px'
      });
    } else {
      this.$stage.animate({
        left: coordinate
      }, this.speed() / 1000, this.settings.fallbackEasing, $.proxy(function() {
        if (this.state.inMotion) {
          this.transitionEnd();
        }
      }, this));
    }
  };

  /**
   * Sets the absolute position of the current item.
   * @public
   * @param {Number} [position] - The new absolute position or nothing to leave it unchanged.
   * @returns {Number} - The absolute position of the current item.
   */
  Owl.prototype.current = function(position) {
    if (position === undefined) {
      return this._current;
    }

    if (this._items.length === 0) {
      return undefined;
    }

    position = this.normalize(position);

    if (this._current !== position) {
      var event = this.trigger('change', {
        property: {
          name: 'position',
          value: position
        }
      });

      if (event.data !== undefined) {
        position = this.normalize(event.data);
      }

      this._current = position;

      this.invalidate('position');

      this.trigger('changed', {
        property: {
          name: 'position',
          value: this._current
        }
      });
    }

    return this._current;
  };

  /**
   * Invalidates the given part of the update routine.
   * @param {String} part - The part to invalidate.
   */
  Owl.prototype.invalidate = function(part) {
    this._invalidated[part] = true;
  }

  /**
   * Resets the absolute position of the current item.
   * @public
   * @param {Number} position - The absolute position of the new item.
   */
  Owl.prototype.reset = function(position) {
    position = this.normalize(position);

    if (position === undefined) {
      return;
    }

    this._speed = 0;
    this._current = position;

    this.suppress(['translate', 'translated']);

    this.animate(this.coordinates(position));

    this.release(['translate', 'translated']);
  };

  /**
   * Normalizes an absolute or a relative position for an item.
   * @public
   * @param {Number} position - The absolute or relative position to normalize.
   * @param {Boolean} [relative=false] - Whether the given position is relative or not.
   * @returns {Number} - The normalized position.
   */
  Owl.prototype.normalize = function(position, relative) {
    var n = (relative ? this._items.length : this._items.length + this._clones.length);

    if (!$.isNumeric(position) || n < 1) {
      return undefined;
    }

    if (this._clones.length) {
      position = ((position % n) + n) % n;
    } else {
      position = Math.max(this.minimum(relative), Math.min(this.maximum(relative), position));
    }

    return position;
  };

  /**
   * Converts an absolute position for an item into a relative position.
   * @public
   * @param {Number} position - The absolute position to convert.
   * @returns {Number} - The converted position.
   */
  Owl.prototype.relative = function(position) {
    position = this.normalize(position);
    position = position - this._clones.length / 2;
    return this.normalize(position, true);
  };

  /**
   * Gets the maximum position for an item.
   * @public
   * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
   * @returns {Number}
   */
  Owl.prototype.maximum = function(relative) {
    var maximum, width, i = 0,
      coordinate,
      settings = this.settings;

    if (relative) {
      return this._items.length - 1;
    }

    if (!settings.loop && settings.center) {
      maximum = this._items.length - 1;
    } else if (!settings.loop && !settings.center) {
      maximum = this._items.length - settings.items;
    } else if (settings.loop || settings.center) {
      maximum = this._items.length + settings.items;
    } else if (settings.autoWidth || settings.merge) {
      revert = settings.rtl ? 1 : -1;
      width = this.$stage.width() - this.$element.width();
      while (coordinate = this.coordinates(i)) {
        if (coordinate * revert >= width) {
          break;
        }
        maximum = ++i;
      }
    } else {
      throw 'Can not detect maximum absolute position.'
    }

    return maximum;
  };

  /**
   * Gets the minimum position for an item.
   * @public
   * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
   * @returns {Number}
   */
  Owl.prototype.minimum = function(relative) {
    if (relative) {
      return 0;
    }

    return this._clones.length / 2;
  };

  /**
   * Gets an item at the specified relative position.
   * @public
   * @param {Number} [position] - The relative position of the item.
   * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
   */
  Owl.prototype.items = function(position) {
    if (position === undefined) {
      return this._items.slice();
    }

    position = this.normalize(position, true);
    return this._items[position];
  };

  /**
   * Gets an item at the specified relative position.
   * @public
   * @param {Number} [position] - The relative position of the item.
   * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
   */
  Owl.prototype.mergers = function(position) {
    if (position === undefined) {
      return this._mergers.slice();
    }

    position = this.normalize(position, true);
    return this._mergers[position];
  };

  /**
   * Gets the absolute positions of clones for an item.
   * @public
   * @param {Number} [position] - The relative position of the item.
   * @returns {Array.<Number>} - The absolute positions of clones for the item or all if no position was given.
   */
  Owl.prototype.clones = function(position) {
    var odd = this._clones.length / 2,
      even = odd + this._items.length,
      map = function(index) {
        return index % 2 === 0 ? even + index / 2 : odd - (index + 1) / 2
      };

    if (position === undefined) {
      return $.map(this._clones, function(v, i) {
        return map(i)
      });
    }

    return $.map(this._clones, function(v, i) {
      return v === position ? map(i) : null
    });
  };

  /**
   * Sets the current animation speed.
   * @public
   * @param {Number} [speed] - The animation speed in milliseconds or nothing to leave it unchanged.
   * @returns {Number} - The current animation speed in milliseconds.
   */
  Owl.prototype.speed = function(speed) {
    if (speed !== undefined) {
      this._speed = speed;
    }

    return this._speed;
  };

  /**
   * Gets the coordinate of an item.
   * @todo The name of this method is missleanding.
   * @public
   * @param {Number} position - The absolute position of the item within `minimum()` and `maximum()`.
   * @returns {Number|Array.<Number>} - The coordinate of the item in pixel or all coordinates.
   */
  Owl.prototype.coordinates = function(position) {
    var coordinate = null;

    if (position === undefined) {
      return $.map(this._coordinates, $.proxy(function(coordinate, index) {
        return this.coordinates(index);
      }, this));
    }

    if (this.settings.center) {
      coordinate = this._coordinates[position];
      coordinate += (this.width() - coordinate + (this._coordinates[position - 1] || 0)) / 2 * (this.settings.rtl ? -1 : 1);
    } else {
      coordinate = this._coordinates[position - 1] || 0;
    }

    return coordinate;
  };

  /**
   * Calculates the speed for a translation.
   * @protected
   * @param {Number} from - The absolute position of the start item.
   * @param {Number} to - The absolute position of the target item.
   * @param {Number} [factor=undefined] - The time factor in milliseconds.
   * @returns {Number} - The time in milliseconds for the translation.
   */
  Owl.prototype.duration = function(from, to, factor) {
    return Math.min(Math.max(Math.abs(to - from), 1), 6) * Math.abs((factor || this.settings.smartSpeed));
  };

  /**
   * Slides to the specified item.
   * @public
   * @param {Number} position - The position of the item.
   * @param {Number} [speed] - The time in milliseconds for the transition.
   */
  Owl.prototype.to = function(position, speed) {
    if (this.settings.loop) {
      var distance = position - this.relative(this.current()),
        revert = this.current(),
        before = this.current(),
        after = this.current() + distance,
        direction = before - after < 0 ? true : false,
        items = this._clones.length + this._items.length;

      if (after < this.settings.items && direction === false) {
        revert = before + this._items.length;
        this.reset(revert);
      } else if (after >= items - this.settings.items && direction === true) {
        revert = before - this._items.length;
        this.reset(revert);
      }
      window.clearTimeout(this.e._goToLoop);
      this.e._goToLoop = window.setTimeout($.proxy(function() {
        this.speed(this.duration(this.current(), revert + distance, speed));
        this.current(revert + distance);
        this.update();
      }, this), 30);
    } else {
      this.speed(this.duration(this.current(), position, speed));
      this.current(position);
      this.update();
    }
  };

  /**
   * Slides to the next item.
   * @public
   * @param {Number} [speed] - The time in milliseconds for the transition.
   */
  Owl.prototype.next = function(speed) {
    speed = speed || false;
    this.to(this.relative(this.current()) + 1, speed);
  };

  /**
   * Slides to the previous item.
   * @public
   * @param {Number} [speed] - The time in milliseconds for the transition.
   */
  Owl.prototype.prev = function(speed) {
    speed = speed || false;
    this.to(this.relative(this.current()) - 1, speed);
  };

  /**
   * Handles the end of an animation.
   * @protected
   * @param {Event} event - The event arguments.
   */
  Owl.prototype.transitionEnd = function(event) {

    // if css2 animation then event object is undefined
    if (event !== undefined) {
      event.stopPropagation();

      // Catch only owl-stage transitionEnd event
      if ((event.target || event.srcElement || event.originalTarget) !== this.$stage.get(0)) {
        return false;
      }
    }

    this.state.inMotion = false;
    this.trigger('translated');
  };

  /**
   * Gets viewport width.
   * @protected
   * @return {Number} - The width in pixel.
   */
  Owl.prototype.viewport = function() {
    var width;
    if (this.options.responsiveBaseElement !== window) {
      width = $(this.options.responsiveBaseElement).width();
    } else if (window.innerWidth) {
      width = window.innerWidth;
    } else if (document.documentElement && document.documentElement.clientWidth) {
      width = document.documentElement.clientWidth;
    } else {
      throw 'Can not detect viewport width.';
    }
    return width;
  };

  /**
   * Replaces the current content.
   * @public
   * @param {HTMLElement|jQuery|String} content - The new content.
   */
  Owl.prototype.replace = function(content) {
    this.$stage.empty();
    this._items = [];

    if (content) {
      content = (content instanceof jQuery) ? content : $(content);
    }

    if (this.settings.nestedItemSelector) {
      content = content.find('.' + this.settings.nestedItemSelector);
    }

    content.filter(function() {
      return this.nodeType === 1;
    }).each($.proxy(function(index, item) {
      item = this.prepare(item);
      this.$stage.append(item);
      this._items.push(item);
      this._mergers.push(item.find('[data-merge]').andSelf('[data-merge]').attr('data-merge') * 1 || 1);
    }, this));

    this.reset($.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0);

    this.invalidate('items');
  };

  /**
   * Adds an item.
   * @todo Use `item` instead of `content` for the event arguments.
   * @public
   * @param {HTMLElement|jQuery|String} content - The item content to add.
   * @param {Number} [position] - The relative position at which to insert the item otherwise the item will be added to the end.
   */
  Owl.prototype.add = function(content, position) {
    position = position === undefined ? this._items.length : this.normalize(position, true);

    this.trigger('add', {
      content: content,
      position: position
    });

    if (this._items.length === 0 || position === this._items.length) {
      this.$stage.append(content);
      this._items.push(content);
      this._mergers.push(content.find('[data-merge]').andSelf('[data-merge]').attr('data-merge') * 1 || 1);
    } else {
      this._items[position].before(content);
      this._items.splice(position, 0, content);
      this._mergers.splice(position, 0, content.find('[data-merge]').andSelf('[data-merge]').attr('data-merge') * 1 || 1);
    }

    this.invalidate('items');

    this.trigger('added', {
      content: content,
      position: position
    });
  };

  /**
   * Removes an item by its position.
   * @todo Use `item` instead of `content` for the event arguments.
   * @public
   * @param {Number} position - The relative position of the item to remove.
   */
  Owl.prototype.remove = function(position) {
    position = this.normalize(position, true);

    if (position === undefined) {
      return;
    }

    this.trigger('remove', {
      content: this._items[position],
      position: position
    });

    this._items[position].remove();
    this._items.splice(position, 1);
    this._mergers.splice(position, 1);

    this.invalidate('items');

    this.trigger('removed', {
      content: null,
      position: position
    });
  };

  /**
   * Adds triggerable events.
   * @protected
   */
  Owl.prototype.addTriggerableEvents = function() {
    var handler = $.proxy(function(callback, event) {
      return $.proxy(function(e) {
        if (e.relatedTarget !== this) {
          this.suppress([event]);
          callback.apply(this, [].slice.call(arguments, 1));
          this.release([event]);
        }
      }, this);
    }, this);

    $.each({
      'next': this.next,
      'prev': this.prev,
      'to': this.to,
      'destroy': this.destroy,
      'refresh': this.refresh,
      'replace': this.replace,
      'add': this.add,
      'remove': this.remove
    }, $.proxy(function(event, callback) {
      this.$element.on(event + '.owl.carousel', handler(callback, event + '.owl.carousel'));
    }, this));

  };

  /**
   * Watches the visibility of the carousel element.
   * @protected
   */
  Owl.prototype.watchVisibility = function() {

    // test on zepto
    if (!isElVisible(this.$element.get(0))) {
      this.$element.addClass('owl-hidden');
      window.clearInterval(this.e._checkVisibile);
      this.e._checkVisibile = window.setInterval($.proxy(checkVisible, this), 500);
    }

    function isElVisible(el) {
      return el.offsetWidth > 0 && el.offsetHeight > 0;
    }

    function checkVisible() {
      if (isElVisible(this.$element.get(0))) {
        this.$element.removeClass('owl-hidden');
        this.refresh();
        window.clearInterval(this.e._checkVisibile);
      }
    }
  };

  /**
   * Preloads images with auto width.
   * @protected
   * @todo Still to test
   */
  Owl.prototype.preloadAutoWidthImages = function(imgs) {
    var loaded, that, $el, img;

    loaded = 0;
    that = this;
    imgs.each(function(i, el) {
      $el = $(el);
      img = new Image();

      img.onload = function() {
        loaded++;
        $el.attr('src', img.src);
        $el.css('opacity', 1);
        if (loaded >= imgs.length) {
          that.state.imagesLoaded = true;
          that.initialize();
        }
      };

      img.src = $el.attr('src') || $el.attr('data-src') || $el.attr('data-src-retina');
    });
  };

  /**
   * Destroys the carousel.
   * @public
   */
  Owl.prototype.destroy = function() {

    if (this.$element.hasClass(this.settings.themeClass)) {
      this.$element.removeClass(this.settings.themeClass);
    }

    if (this.settings.responsive !== false) {
      $(window).off('resize.owl.carousel');
    }

    if (this.transitionEndVendor) {
      this.off(this.$stage.get(0), this.transitionEndVendor, this.e._transitionEnd);
    }

    for (var i in this._plugins) {
      this._plugins[i].destroy();
    }

    if (this.settings.mouseDrag || this.settings.touchDrag) {
      this.$stage.off('mousedown touchstart touchcancel');
      $(document).off('.owl.dragEvents');
      this.$stage.get(0).onselectstart = function() {};
      this.$stage.off('dragstart', function() {
        return false
      });
    }

    // remove event handlers in the ".owl.carousel" namespace
    this.$element.off('.owl');

    this.$stage.children('.cloned').remove();
    this.e = null;
    this.$element.removeData('owlCarousel');

    this.$stage.children().contents().unwrap();
    this.$stage.children().unwrap();
    this.$stage.unwrap();
  };

  /**
   * Operators to calculate right-to-left and left-to-right.
   * @protected
   * @param {Number} [a] - The left side operand.
   * @param {String} [o] - The operator.
   * @param {Number} [b] - The right side operand.
   */
  Owl.prototype.op = function(a, o, b) {
    var rtl = this.settings.rtl;
    switch (o) {
      case '<':
        return rtl ? a > b : a < b;
      case '>':
        return rtl ? a < b : a > b;
      case '>=':
        return rtl ? a <= b : a >= b;
      case '<=':
        return rtl ? a >= b : a <= b;
      default:
        break;
    }
  };

  /**
   * Attaches to an internal event.
   * @protected
   * @param {HTMLElement} element - The event source.
   * @param {String} event - The event name.
   * @param {Function} listener - The event handler to attach.
   * @param {Boolean} capture - Wether the event should be handled at the capturing phase or not.
   */
  Owl.prototype.on = function(element, event, listener, capture) {
    if (element.addEventListener) {
      element.addEventListener(event, listener, capture);
    } else if (element.attachEvent) {
      element.attachEvent('on' + event, listener);
    }
  };

  /**
   * Detaches from an internal event.
   * @protected
   * @param {HTMLElement} element - The event source.
   * @param {String} event - The event name.
   * @param {Function} listener - The attached event handler to detach.
   * @param {Boolean} capture - Wether the attached event handler was registered as a capturing listener or not.
   */
  Owl.prototype.off = function(element, event, listener, capture) {
    if (element.removeEventListener) {
      element.removeEventListener(event, listener, capture);
    } else if (element.detachEvent) {
      element.detachEvent('on' + event, listener);
    }
  };

  /**
   * Triggers an public event.
   * @protected
   * @param {String} name - The event name.
   * @param {*} [data=null] - The event data.
   * @param {String} [namespace=.owl.carousel] - The event namespace.
   * @returns {Event} - The event arguments.
   */
  Owl.prototype.trigger = function(name, data, namespace) {
    var status = {
        item: {
          count: this._items.length,
          index: this.current()
        }
      },
      handler = $.camelCase(
        $.grep(['on', name, namespace], function(v) {
          return v
        })
        .join('-').toLowerCase()
      ),
      event = $.Event(
        [name, 'owl', namespace || 'carousel'].join('.').toLowerCase(),
        $.extend({
          relatedTarget: this
        }, status, data)
      );

    if (!this._supress[name]) {
      $.each(this._plugins, function(name, plugin) {
        if (plugin.onTrigger) {
          plugin.onTrigger(event);
        }
      });

      this.$element.trigger(event);

      if (this.settings && typeof this.settings[handler] === 'function') {
        this.settings[handler].apply(this, event);
      }
    }

    return event;
  };

  /**
   * Suppresses events.
   * @protected
   * @param {Array.<String>} events - The events to suppress.
   */
  Owl.prototype.suppress = function(events) {
    $.each(events, $.proxy(function(index, event) {
      this._supress[event] = true;
    }, this));
  }

  /**
   * Releases suppressed events.
   * @protected
   * @param {Array.<String>} events - The events to release.
   */
  Owl.prototype.release = function(events) {
    $.each(events, $.proxy(function(index, event) {
      delete this._supress[event];
    }, this));
  }

  /**
   * Checks the availability of some browser features.
   * @protected
   */
  Owl.prototype.browserSupport = function() {
    this.support3d = isPerspective();

    if (this.support3d) {
      this.transformVendor = isTransform();

      // take transitionend event name by detecting transition
      var endVendors = ['transitionend', 'webkitTransitionEnd', 'transitionend', 'oTransitionEnd'];
      this.transitionEndVendor = endVendors[isTransition()];

      // take vendor name from transform name
      this.vendorName = this.transformVendor.replace(/Transform/i, '');
      this.vendorName = this.vendorName !== '' ? '-' + this.vendorName.toLowerCase() + '-' : '';
    }

    this.state.orientation = window.orientation;
  };

  /**
   * Get touch/drag coordinats.
   * @private
   * @param {event} - mousedown/touchstart event
   * @returns {object} - Contains X and Y of current mouse/touch position
   */

  function getTouches(event) {
    if (event.touches !== undefined) {
      return {
        x: event.touches[0].pageX,
        y: event.touches[0].pageY
      };
    }

    if (event.touches === undefined) {
      if (event.pageX !== undefined) {
        return {
          x: event.pageX,
          y: event.pageY
        };
      }

      if (event.pageX === undefined) {
        return {
          x: event.clientX,
          y: event.clientY
        };
      }
    }
  }

  /**
   * Checks for CSS support.
   * @private
   * @param {Array} array - The CSS properties to check for.
   * @returns {Array} - Contains the supported CSS property name and its index or `false`.
   */
  function isStyleSupported(array) {
    var p, s, fake = document.createElement('div'),
      list = array;
    for (p in list) {
      s = list[p];
      if (typeof fake.style[s] !== 'undefined') {
        fake = null;
        return [s, p];
      }
    }
    return [false];
  }

  /**
   * Checks for CSS transition support.
   * @private
   * @todo Realy bad design
   * @returns {Number}
   */
  function isTransition() {
    return isStyleSupported(['transition', 'WebkitTransition', 'MozTransition', 'OTransition'])[1];
  }

  /**
   * Checks for CSS transform support.
   * @private
   * @returns {String} The supported property name or false.
   */
  function isTransform() {
    return isStyleSupported(['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'])[0];
  }

  /**
   * Checks for CSS perspective support.
   * @private
   * @returns {String} The supported property name or false.
   */
  function isPerspective() {
    return isStyleSupported(['perspective', 'webkitPerspective', 'MozPerspective', 'OPerspective', 'MsPerspective'])[0];
  }

  /**
   * Checks wether touch is supported or not.
   * @private
   * @returns {Boolean}
   */
  function isTouchSupport() {
    return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);
  }

  /**
   * Checks wether touch is supported or not for IE.
   * @private
   * @returns {Boolean}
   */
  function isTouchSupportIE() {
    return window.navigator.msPointerEnabled;
  }

  /**
   * The jQuery Plugin for the Owl Carousel
   * @public
   */
  $.fn.owlCarousel = function(options) {
    return this.each(function() {
      if (!$(this).data('owlCarousel')) {
        $(this).data('owlCarousel', new Owl(this, options));
      }
    });
  };

  /**
   * The constructor for the jQuery Plugin
   * @public
   */
  $.fn.owlCarousel.Constructor = Owl;

})(window.Zepto || window.jQuery, window, document);

/**
 * Lazy Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

  /**
   * Creates the lazy plugin.
   * @class The Lazy Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var Lazy = function(carousel) {

    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Already loaded items.
     * @protected
     * @type {Array.<jQuery>}
     */
    //this._loaded = [];

    /**
     * Event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'initialized.owl.carousel change.owl.carousel': $.proxy(function(e) {
        if (!e.namespace) {
          return;
        }

        if (!this._core.settings || !this._core.settings.lazyLoad) {
          return;
        }

        if ((e.property && e.property.name == 'position') || e.type == 'initialized') {
          var settings = this._core.settings,
            n = (settings.center && Math.ceil(settings.items / 2) || settings.items),
            i = ((settings.center && n * -1) || 0),
            position = ((e.property && e.property.value) || this._core.current()) + i,
            clones = this._core.clones().length,
            load = $.proxy(function(i, v) {
              this.load(v)
            }, this);

          while (i++ < n) {
            this.load(clones / 2 + this._core.relative(position));
            clones && $.each(this._core.clones(this._core.relative(position++)), load);
          }
        }
      }, this)
    };

    // set the default options
    this._core.options = $.extend({}, Lazy.Defaults, this._core.options);

    // register event handler
    this._core.$element.on(this._handlers);
  }

  /**
   * Default options.
   * @public
   */
  Lazy.Defaults = {
    lazyLoad: false
  }

  /**
   * Loads all resources of an item at the specified position.
   * @param {Number} position - The absolute position of the item.
   * @protected
   */
  Lazy.prototype.load = function(position) {
    var $item = this._core.$stage.children().eq(position),
      $elements = $item && $item.find('.owl-lazy');

    // if (!$elements || $.inArray($item.get(0), this._loaded) > -1) {
    //   return;
    // }

    $elements.each($.proxy(function(index, element) {
      var $element = $(element),
        image,
        url = (window.devicePixelRatio > 1 && $element.attr('data-src-retina')) || $element.attr('data-src');

      this._core.trigger('load', {
        element: $element,
        url: url
      }, 'lazy');

      if ($element.is('img')) {
        $element.one('load.owl.lazy', $.proxy(function() {
          $element.css('opacity', 1);
          this._core.trigger('loaded', {
            element: $element,
            url: url
          }, 'lazy');
        }, this)).attr('src', url);
      } else {
        image = new Image();
        image.onload = $.proxy(function() {
          $element.css({
            'background-image': 'url(' + url + ')',
            'opacity': '1'
          });
          this._core.trigger('loaded', {
            element: $element,
            url: url
          }, 'lazy');
        }, this);
        image.src = url;
      }
    }, this));

    //this._loaded.push($item.get(0));
  }

  /**
   * Destroys the plugin.
   * @public
   */
  Lazy.prototype.destroy = function() {
    var handler, property;

    for (handler in this.handlers) {
      this._core.$element.off(handler, this.handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  }

  $.fn.owlCarousel.Constructor.Plugins.Lazy = Lazy;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoHeight Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

  /**
   * Creates the auto height plugin.
   * @class The Auto Height Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var AutoHeight = function(carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'initialized.owl.carousel': $.proxy(function() {
        if (this._core.settings.autoHeight) {
          this.update();
        }
      }, this),
      'changed.owl.carousel': $.proxy(function(e) {
        if (this._core.settings.autoHeight && e.property.name == 'position') {
          this.update();
        }
      }, this),
      'loaded.owl.lazy': $.proxy(function(e) {
        if (this._core.settings.autoHeight && e.element.closest('.' + this._core.settings.itemClass) ===
          this._core.$stage.children().eq(this._core.current())) {
          this.update();
        }
      }, this)
    };

    // set default options
    this._core.options = $.extend({}, AutoHeight.Defaults, this._core.options);

    // register event handlers
    this._core.$element.on(this._handlers);
  };

  /**
   * Default options.
   * @public
   */
  AutoHeight.Defaults = {
    autoHeight: false,
    autoHeightClass: 'owl-height'
  };

  /**
   * Updates the view.
   */
  AutoHeight.prototype.update = function() {
    this._core.$stage.parent()
      .height(this._core.$stage.children().eq(this._core.current()).height())
      .addClass(this._core.settings.autoHeightClass);
  };

  AutoHeight.prototype.destroy = function() {
    var handler, property;

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.AutoHeight = AutoHeight;

})(window.Zepto || window.jQuery, window, document);

/**
 * Video Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

  /**
   * Creates the video plugin.
   * @class The Video Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var Video = function(carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Cache all video URLs.
     * @protected
     * @type {Object}
     */
    this._videos = {};

    /**
     * Current playing item.
     * @protected
     * @type {jQuery}
     */
    this._playing = null;

    /**
     * Whether this is in fullscreen or not.
     * @protected
     * @type {Boolean}
     */
    this._fullscreen = false;

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'resize.owl.carousel': $.proxy(function(e) {
        if (this._core.settings.video && !this.isInFullScreen()) {
          e.preventDefault();
        }
      }, this),
      'refresh.owl.carousel changed.owl.carousel': $.proxy(function(e) {
        if (this._playing) {
          this.stop();
        }
      }, this),
      'prepared.owl.carousel': $.proxy(function(e) {
        var $element = $(e.content).find('.owl-video');
        if ($element.length) {
          $element.css('display', 'none');
          this.fetch($element, $(e.content));
        }
      }, this)
    };

    // set default options
    this._core.options = $.extend({}, Video.Defaults, this._core.options);

    // register event handlers
    this._core.$element.on(this._handlers);

    this._core.$element.on('click.owl.video', '.owl-video-play-icon', $.proxy(function(e) {
      this.play(e);
    }, this));
  };

  /**
   * Default options.
   * @public
   */
  Video.Defaults = {
    video: false,
    videoHeight: false,
    videoWidth: false
  };

  /**
   * Gets the video ID and the type (YouTube/Vimeo only).
   * @protected
   * @param {jQuery} target - The target containing the video data.
   * @param {jQuery} item - The item containing the video.
   */
  Video.prototype.fetch = function(target, item) {

    var type = target.attr('data-vimeo-id') ? 'vimeo' : 'youtube',
      id = target.attr('data-vimeo-id') || target.attr('data-youtube-id'),
      width = target.attr('data-width') || this._core.settings.videoWidth,
      height = target.attr('data-height') || this._core.settings.videoHeight,
      url = target.attr('href');

    if (url) {
      id = url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

      if (id[3].indexOf('youtu') > -1) {
        type = 'youtube';
      } else if (id[3].indexOf('vimeo') > -1) {
        type = 'vimeo';
      } else {
        throw new Error('Video URL not supported.');
      }
      id = id[6];
    } else {
      throw new Error('Missing video URL.');
    }

    this._videos[url] = {
      type: type,
      id: id,
      width: width,
      height: height
    };

    item.attr('data-video', url);

    this.thumbnail(target, this._videos[url]);
  };

  /**
   * Creates video thumbnail.
   * @protected
   * @param {jQuery} target - The target containing the video data.
   * @param {Object} info - The video info object.
   * @see `fetch`
   */
  Video.prototype.thumbnail = function(target, video) {

    var tnLink,
      icon,
      path,
      dimensions = video.width && video.height ? 'style="width:' + video.width + 'px;height:' + video.height + 'px;"' : '',
      customTn = target.find('img'),
      srcType = 'src',
      lazyClass = '',
      settings = this._core.settings,
      create = function(path) {
        icon = '<div class="owl-video-play-icon"></div>';

        if (settings.lazyLoad) {
          tnLink = '<div class="owl-video-tn ' + lazyClass + '" ' + srcType + '="' + path + '"></div>';
        } else {
          tnLink = '<div class="owl-video-tn" style="opacity:1;background-image:url(' + path + ')"></div>';
        }
        target.after(tnLink);
        target.after(icon);
      };

    // wrap video content into owl-video-wrapper div
    target.wrap('<div class="owl-video-wrapper"' + dimensions + '></div>');

    if (this._core.settings.lazyLoad) {
      srcType = 'data-src';
      lazyClass = 'owl-lazy';
    }

    // custom thumbnail
    if (customTn.length) {
      create(customTn.attr(srcType));
      customTn.remove();
      return false;
    }

    if (video.type === 'youtube') {
      path = "http://img.youtube.com/vi/" + video.id + "/hqdefault.jpg";
      create(path);
    } else if (video.type === 'vimeo') {
      $.ajax({
        type: 'GET',
        url: 'http://vimeo.com/api/v2/video/' + video.id + '.json',
        jsonp: 'callback',
        dataType: 'jsonp',
        success: function(data) {
          path = data[0].thumbnail_large;
          create(path);
        }
      });
    }
  };

  /**
   * Stops the current video.
   * @public
   */
  Video.prototype.stop = function() {
    this._core.trigger('stop', null, 'video');
    this._playing.find('.owl-video-frame').remove();
    this._playing.removeClass('owl-video-playing');
    this._playing = null;
  };

  /**
   * Starts the current video.
   * @public
   * @param {Event} ev - The event arguments.
   */
  Video.prototype.play = function(ev) {
    this._core.trigger('play', null, 'video');

    if (this._playing) {
      this.stop();
    }

    var target = $(ev.target || ev.srcElement),
      item = target.closest('.' + this._core.settings.itemClass),
      video = this._videos[item.attr('data-video')],
      width = video.width || '100%',
      height = video.height || this._core.$stage.height(),
      html, wrap;

    if (video.type === 'youtube') {
      html = '<iframe width="' + width + '" height="' + height + '" src="http://www.youtube.com/embed/' +
        video.id + '?autoplay=1&v=' + video.id + '" frameborder="0" allowfullscreen></iframe>';
    } else if (video.type === 'vimeo') {
      html = '<iframe src="http://player.vimeo.com/video/' + video.id + '?autoplay=1" width="' + width +
        '" height="' + height +
        '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    }

    item.addClass('owl-video-playing');
    this._playing = item;

    wrap = $('<div style="height:' + height + 'px; width:' + width + 'px" class="owl-video-frame">' +
      html + '</div>');
    target.after(wrap);
  };

  /**
   * Checks whether an video is currently in full screen mode or not.
   * @todo Bad style because looks like a readonly method but changes members.
   * @protected
   * @returns {Boolean}
   */
  Video.prototype.isInFullScreen = function() {

    // if Vimeo Fullscreen mode
    var element = document.fullscreenElement || document.mozFullScreenElement ||
      document.webkitFullscreenElement;

    if (element && $(element).parent().hasClass('owl-video-frame')) {
      this._core.speed(0);
      this._fullscreen = true;
    }

    if (element && this._fullscreen && this._playing) {
      return false;
    }

    // comming back from fullscreen
    if (this._fullscreen) {
      this._fullscreen = false;
      return false;
    }

    // check full screen mode and window orientation
    if (this._playing) {
      if (this._core.state.orientation !== window.orientation) {
        this._core.state.orientation = window.orientation;
        return false;
      }
    }

    return true;
  };

  /**
   * Destroys the plugin.
   */
  Video.prototype.destroy = function() {
    var handler, property;

    this._core.$element.off('click.owl.video');

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Video = Video;

})(window.Zepto || window.jQuery, window, document);

/**
 * Animate Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

  /**
   * Creates the animate plugin.
   * @class The Navigation Plugin
   * @param {Owl} scope - The Owl Carousel
   */
  var Animate = function(scope) {
    this.core = scope;
    this.core.options = $.extend({}, Animate.Defaults, this.core.options);
    this.swapping = true;
    this.previous = undefined;
    this.next = undefined;

    this.handlers = {
      'change.owl.carousel': $.proxy(function(e) {
        if (e.property.name == 'position') {
          this.previous = this.core.current();
          this.next = e.property.value;
        }
      }, this),
      'drag.owl.carousel dragged.owl.carousel translated.owl.carousel': $.proxy(function(e) {
        this.swapping = e.type == 'translated';
      }, this),
      'translate.owl.carousel': $.proxy(function(e) {
        if (this.swapping && (this.core.options.animateOut || this.core.options.animateIn)) {
          this.swap();
        }
      }, this)
    };

    this.core.$element.on(this.handlers);
  };

  /**
   * Default options.
   * @public
   */
  Animate.Defaults = {
    animateOut: false,
    animateIn: false
  };

  /**
   * Toggles the animation classes whenever an translations starts.
   * @protected
   * @returns {Boolean|undefined}
   */
  Animate.prototype.swap = function() {

    if (this.core.settings.items !== 1 || !this.core.support3d) {
      return;
    }

    this.core.speed(0);

    var left,
      clear = $.proxy(this.clear, this),
      previous = this.core.$stage.children().eq(this.previous),
      next = this.core.$stage.children().eq(this.next),
      incoming = this.core.settings.animateIn,
      outgoing = this.core.settings.animateOut;

    if (this.core.current() === this.previous) {
      return;
    }

    if (outgoing) {
      left = this.core.coordinates(this.previous) - this.core.coordinates(this.next);
      previous.css({
          'left': left + 'px'
        })
        .addClass('animated owl-animated-out')
        .addClass(outgoing)
        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', clear);
    }

    if (incoming) {
      next.addClass('animated owl-animated-in')
        .addClass(incoming)
        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', clear);
    }
  };

  Animate.prototype.clear = function(e) {
    $(e.target).css({
        'left': ''
      })
      .removeClass('animated owl-animated-out owl-animated-in')
      .removeClass(this.core.settings.animateIn)
      .removeClass(this.core.settings.animateOut);
    this.core.transitionEnd();
  }

  /**
   * Destroys the plugin.
   * @public
   */
  Animate.prototype.destroy = function() {
    var handler, property;

    for (handler in this.handlers) {
      this.core.$element.off(handler, this.handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Animate = Animate;

})(window.Zepto || window.jQuery, window, document);

/**
 * Autoplay Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

  /**
   * Creates the autoplay plugin.
   * @class The Autoplay Plugin
   * @param {Owl} scope - The Owl Carousel
   */
  var Autoplay = function(scope) {
    this.core = scope;
    this.core.options = $.extend({}, Autoplay.Defaults, this.core.options);

    this.handlers = {
      'translated.owl.carousel refreshed.owl.carousel': $.proxy(function() {
        this.autoplay();
      }, this),
      'play.owl.autoplay': $.proxy(function(e, t, s) {
        this.play(t, s);
      }, this),
      'stop.owl.autoplay': $.proxy(function() {
        this.stop();
      }, this),
      'mouseover.owl.autoplay': $.proxy(function() {
        if (this.core.settings.autoplayHoverPause) {
          this.pause();
        }
      }, this),
      'mouseleave.owl.autoplay': $.proxy(function() {
        if (this.core.settings.autoplayHoverPause) {
          this.autoplay();
        }
      }, this)
    };

    this.core.$element.on(this.handlers);
  };

  /**
   * Default options.
   * @public
   */
  Autoplay.Defaults = {
    autoplay: false,
    autoplayTimeout: 5000,
    autoplayHoverPause: false,
    autoplaySpeed: false
  };

  /**
   * @protected
   * @todo Must be documented.
   */
  Autoplay.prototype.autoplay = function() {
    if (this.core.settings.autoplay && !this.core.state.videoPlay) {
      window.clearInterval(this.interval);

      this.interval = window.setInterval($.proxy(function() {
        this.play();
      }, this), this.core.settings.autoplayTimeout);
    } else {
      window.clearInterval(this.interval);
    }
  };

  /**
   * Starts the autoplay.
   * @public
   * @param {Number} [timeout] - ...
   * @param {Number} [speed] - ...
   * @returns {Boolean|undefined} - ...
   * @todo Must be documented.
   */
  Autoplay.prototype.play = function(timeout, speed) {
    // if tab is inactive - doesnt work in <IE10
    if (document.hidden === true) {
      return;
    }

    if (this.core.state.isTouch || this.core.state.isScrolling ||
      this.core.state.isSwiping || this.core.state.inMotion) {
      return;
    }

    if (this.core.settings.autoplay === false) {
      window.clearInterval(this.interval);
      return;
    }

    this.core.next(this.core.settings.autoplaySpeed);
  };

  /**
   * Stops the autoplay.
   * @public
   */
  Autoplay.prototype.stop = function() {
    window.clearInterval(this.interval);
  };

  /**
   * Pauses the autoplay.
   * @public
   */
  Autoplay.prototype.pause = function() {
    window.clearInterval(this.interval);
  };

  /**
   * Destroys the plugin.
   */
  Autoplay.prototype.destroy = function() {
    var handler, property;

    window.clearInterval(this.interval);

    for (handler in this.handlers) {
      this.core.$element.off(handler, this.handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;

})(window.Zepto || window.jQuery, window, document);

/**
 * Navigation Plugin
 * @version 2.0.0
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {
  'use strict';

  /**
   * Creates the navigation plugin.
   * @class The Navigation Plugin
   * @param {Owl} carousel - The Owl Carousel.
   */
  var Navigation = function(carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Indicates whether the plugin is initialized or not.
     * @protected
     * @type {Boolean}
     */
    this._initialized = false;

    /**
     * The current paging indexes.
     * @protected
     * @type {Array}
     */
    this._pages = [];

    /**
     * All DOM elements of the user interface.
     * @protected
     * @type {Object}
     */
    this._controls = {};

    /**
     * Markup for an indicator.
     * @protected
     * @type {Array.<String>}
     */
    this._templates = [];

    /**
     * The carousel element.
     * @type {jQuery}
     */
    this.$element = this._core.$element;

    /**
     * Overridden methods of the carousel.
     * @protected
     * @type {Object}
     */
    this._overrides = {
      next: this._core.next,
      prev: this._core.prev,
      to: this._core.to
    };

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'prepared.owl.carousel': $.proxy(function(e) {
        if (this._core.settings.dotsData) {
          this._templates.push($(e.content).find('[data-dot]').andSelf('[data-dot]').attr('data-dot'));
        }
      }, this),
      'add.owl.carousel': $.proxy(function(e) {
        if (this._core.settings.dotsData) {
          this._templates.splice(e.position, 0, $(e.content).find('[data-dot]').andSelf('[data-dot]').attr('data-dot'));
        }
      }, this),
      'remove.owl.carousel prepared.owl.carousel': $.proxy(function(e) {
        if (this._core.settings.dotsData) {
          this._templates.splice(e.position, 1);
        }
      }, this),
      'change.owl.carousel': $.proxy(function(e) {
        if (e.property.name == 'position') {
          if (!this._core.state.revert && !this._core.settings.loop && this._core.settings.navRewind) {
            var current = this._core.current(),
              maximum = this._core.maximum(),
              minimum = this._core.minimum();
            e.data = e.property.value > maximum ?
              current >= maximum ? minimum : maximum :
              e.property.value < minimum ? maximum : e.property.value;
          }
        }
      }, this),
      'changed.owl.carousel': $.proxy(function(e) {
        if (e.property.name == 'position') {
          this.draw();
        }
      }, this),
      'refreshed.owl.carousel': $.proxy(function() {
        if (!this._initialized) {
          this.initialize();
          this._initialized = true;
        }
        this._core.trigger('refresh', null, 'navigation');
        this.update();
        this.draw();
        this._core.trigger('refreshed', null, 'navigation');
      }, this)
    };

    // set default options
    this._core.options = $.extend({}, Navigation.Defaults, this._core.options);

    // register event handlers
    this.$element.on(this._handlers);
  }

  /**
   * Default options.
   * @public
   * @todo Rename `slideBy` to `navBy`
   */
  Navigation.Defaults = {
    nav: false,
    navRewind: true,
    navText: ['prev', 'next'],
    navSpeed: false,
    navElement: 'div',
    navContainer: false,
    navContainerClass: 'owl-nav',
    navClass: ['owl-prev', 'owl-next'],
    slideBy: 1,
    dotClass: 'owl-dot',
    dotsClass: 'owl-dots',
    dots: true,
    dotsEach: false,
    dotData: false,
    dotsSpeed: false,
    dotsContainer: false,
    controlsClass: 'owl-controls'
  }

  /**
   * Initializes the layout of the plugin and extends the carousel.
   * @protected
   */
  Navigation.prototype.initialize = function() {
    var $container, override,
      options = this._core.settings;

    // create the indicator template
    if (!options.dotsData) {
      this._templates = [$('<div>')
        .addClass(options.dotClass)
        .append($('<span>'))
        .prop('outerHTML')
      ];
    }

    // create controls container if needed
    if (!options.navContainer || !options.dotsContainer) {
      this._controls.$container = $('<div>')
        .addClass(options.controlsClass)
        .appendTo(this.$element);
    }

    // create DOM structure for absolute navigation
    this._controls.$indicators = options.dotsContainer ? $(options.dotsContainer) :
      $('<div>').hide().addClass(options.dotsClass).appendTo(this._controls.$container);

    this._controls.$indicators.on('click', 'div', $.proxy(function(e) {
      var index = $(e.target).parent().is(this._controls.$indicators) ?
        $(e.target).index() : $(e.target).parent().index();

      e.preventDefault();

      this.to(index, options.dotsSpeed);
    }, this));

    // create DOM structure for relative navigation
    $container = options.navContainer ? $(options.navContainer) :
      $('<div>').addClass(options.navContainerClass).prependTo(this._controls.$container);

    this._controls.$next = $('<' + options.navElement + '>');
    this._controls.$previous = this._controls.$next.clone();

    this._controls.$previous
      .addClass(options.navClass[0])
      .html(options.navText[0])
      .hide()
      .prependTo($container)
      .on('click', $.proxy(function(e) {
        this.prev(options.navSpeed);
      }, this));
    this._controls.$next
      .addClass(options.navClass[1])
      .html(options.navText[1])
      .hide()
      .appendTo($container)
      .on('click', $.proxy(function(e) {
        this.next(options.navSpeed);
      }, this));

    // override public methods of the carousel
    for (override in this._overrides) {
      this._core[override] = $.proxy(this[override], this);
    }
  }

  /**
   * Destroys the plugin.
   * @protected
   */
  Navigation.prototype.destroy = function() {
    var handler, control, property, override;

    for (handler in this._handlers) {
      this.$element.off(handler, this._handlers[handler]);
    }
    for (control in this._controls) {
      this._controls[control].remove();
    }
    for (override in this.overides) {
      this._core[override] = this._overrides[override];
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  }

  /**
   * Updates the internal state.
   * @protected
   */
  Navigation.prototype.update = function() {
    var i, j, k,
      options = this._core.settings,
      lower = this._core.clones().length / 2,
      upper = lower + this._core.items().length,
      size = options.center || options.autoWidth || options.dotData ?
      1 : options.dotsEach || options.items;

    if (options.slideBy !== 'page') {
      options.slideBy = Math.min(options.slideBy, options.items);
    }

    if (options.dots || options.slideBy == 'page') {
      this._pages = [];

      for (i = lower, j = 0, k = 0; i < upper; i++) {
        if (j >= size || j === 0) {
          this._pages.push({
            start: i - lower,
            end: i - lower + size - 1
          });
          j = 0, ++k;
        }
        j += this._core.mergers(this._core.relative(i));
      }
    }
  }

  /**
   * Draws the user interface.
   * @todo The option `dotData` wont work.
   * @protected
   */
  Navigation.prototype.draw = function() {
    var difference, i, html = '',
      options = this._core.settings,
      $items = this._core.$stage.children(),
      index = this._core.relative(this._core.current());

    if (options.nav && !options.loop && !options.navRewind) {
      this._controls.$previous.toggleClass('disabled', index <= 0);
      this._controls.$next.toggleClass('disabled', index >= this._core.maximum());
    }

    this._controls.$previous.toggle(options.nav);
    this._controls.$next.toggle(options.nav);

    if (options.dots) {
      difference = this._pages.length - this._controls.$indicators.children().length;
      if (options.dotData && difference !== 0) {

        for (i = 0; i < this._controls.$indicators.children().length; i++) {
          html += this._templates[this._core.relative(i)];
        }
        this._controls.$indicators.html(html);
      } else if (difference > 0) {
        html = new Array(difference + 1).join(this._templates[0]);
        this._controls.$indicators.append(html);
      } else if (difference < 0) {
        this._controls.$indicators.children().slice(difference).remove();
      }

      this._controls.$indicators.find('.active').removeClass('active');
      this._controls.$indicators.children().eq($.inArray(this.current(), this._pages)).addClass('active');
    }

    this._controls.$indicators.toggle(options.dots);
  }

  /**
   * Extends event data.
   * @protected
   * @param {Event} event - The event object which gets thrown.
   */
  Navigation.prototype.onTrigger = function(event) {
    var settings = this._core.settings;

    event.page = {
      index: $.inArray(this.current(), this._pages),
      count: this._pages.length,
      size: settings && (settings.center || settings.autoWidth || settings.dotData ?
        1 : settings.dotsEach || settings.items)
    };
  }

  /**
   * Gets the current page position of the carousel.
   * @protected
   * @returns {Number}
   */
  Navigation.prototype.current = function() {
    var index = this._core.relative(this._core.current());
    return $.grep(this._pages, function(o) {
      return o.start <= index && o.end >= index;
    }).pop();
  }

  /**
   * Gets the current succesor/predecessor position.
   * @protected
   * @returns {Number}
   */
  Navigation.prototype.getPosition = function(successor) {
    var position, length,
      options = this._core.settings;

    if (options.slideBy == 'page') {
      position = $.inArray(this.current(), this._pages);
      length = this._pages.length;
      successor ? ++position : --position;
      position = this._pages[((position % length) + length) % length].start;
    } else {
      position = this._core.relative(this._core.current());
      length = this._core.items().length;
      successor ? position += options.slideBy : position -= options.slideBy;
    }
    return position;
  }

  /**
   * Slides to the next item or page.
   * @public
   * @param {Number} [speed=false] - The time in milliseconds for the transition.
   */
  Navigation.prototype.next = function(speed) {
    $.proxy(this._overrides.to, this._core)(this.getPosition(true), speed);
  }

  /**
   * Slides to the previous item or page.
   * @public
   * @param {Number} [speed=false] - The time in milliseconds for the transition.
   */
  Navigation.prototype.prev = function(speed) {
    $.proxy(this._overrides.to, this._core)(this.getPosition(false), speed);
  }

  /**
   * Slides to the specified item or page.
   * @public
   * @param {Number} position - The position of the item or page.
   * @param {Number} [speed] - The time in milliseconds for the transition.
   * @param {Boolean} [standard=false] - Whether to use the standard behaviour or not.
   */
  Navigation.prototype.to = function(position, speed, standard) {
    var length;

    if (!standard) {
      length = this._pages.length;
      $.proxy(this._overrides.to, this._core)(this._pages[((position % length) + length) % length].start, speed);
    } else {
      $.proxy(this._overrides.to, this._core)(position, speed);
    }
  }

  $.fn.owlCarousel.Constructor.Plugins.Navigation = Navigation;

})(window.Zepto || window.jQuery, window, document);

/**
 * Hash Plugin
 * @version 2.0.0
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {
  'use strict';

  /**
   * Creates the hash plugin.
   * @class The Hash Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var Hash = function(carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Hash table for the hashes.
     * @protected
     * @type {Object}
     */
    this._hashes = {};

    /**
     * The carousel element.
     * @type {jQuery}
     */
    this.$element = this._core.$element;

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      'initialized.owl.carousel': $.proxy(function() {
        if (this._core.settings.startPosition == 'URLHash') {
          $(window).trigger('hashchange.owl.navigation');
        }
      }, this),
      'prepared.owl.carousel': $.proxy(function(e) {
        var hash = $(e.content).find('[data-hash]').andSelf('[data-hash]').attr('data-hash');
        this._hashes[hash] = e.content;
      }, this)
    };

    // set default options
    this._core.options = $.extend({}, Hash.Defaults, this._core.options);

    // register the event handlers
    this.$element.on(this._handlers);

    // register event listener for hash navigation
    $(window).on('hashchange.owl.navigation', $.proxy(function() {
      var hash = window.location.hash.substring(1),
        items = this._core.$stage.children(),
        position = this._hashes[hash] && items.index(this._hashes[hash]) || 0;

      if (!hash) {
        return false;
      }

      this._core.to(position, false, true);
    }, this));
  }

  /**
   * Default options.
   * @public
   */
  Hash.Defaults = {
    URLhashListener: false
  }

  /**
   * Destroys the plugin.
   * @public
   */
  Hash.prototype.destroy = function() {
    var handler, property;

    $(window).off('hashchange.owl.navigation');

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != 'function' && (this[property] = null);
    }
  }

  $.fn.owlCarousel.Constructor.Plugins.Hash = Hash;

})(window.Zepto || window.jQuery, window, document);
;/*})'"*/;/*})'"*/
(function ($) {

  Drupal.behaviors.owlCarousel = {
    attach: function (context, settings) {



      var owl = $("#widget_pager_bottom_property_gallery-block_m", context).owlCarousel({
        items: 7,
        loop: false,
        //nav: true,
        navText: ['<span class="fa fa-chevron-left"></span>', '<span class="fa fa-chevron-right"></span>' ],
        pagination: false,
        margin:10,
        //autoWidth:true,
        responsive : {
          // breakpoint from 0 up
          0 : {
              items: 3,
              center: true
          },
          // breakpoint from 480 up
          480 : {
              items: 3
          },
          // breakpoint from 768 up
          768 : {
              items: 7
          },
          970 : {
              items: 7
          }
        }
      });
    }
  }

}(jQuery));
;/*})'"*/;/*})'"*/
(function($, Drupal, undefined) {



  Drupal.behaviors.MainPropertyOwl = {
    attach: function(context, settings) {



      var mainOwlBig = $('.property-main-owl:first').find('.view-content:first'),
        mainOwlThumb = $('.property-gallery--small .view-content'),
        flag = false,
        duration = 300,
        relaLazyDict = {};

      var owlFullBg = $(mainOwlBig, context)
        .on('initialized.owl.carousel changed.owl.carousel', function(e) {
          if (!e.namespace) return
          var carousel = e.relatedTarget
          $('#owl-page').text(carousel.relative(carousel.current()) + 1 + ' of ' + carousel.items().length)
        })
        .owlCarousel({
          items: 1,
          margin: 0,
          nav: true,
          navText: [
            '<div class="pe-7s-angle-left"></div>',
            '<div class="pe-7s-angle-right"></div>'
          ],
          responsive: {
            0: {
              smartSpeed: 250
            },
            768: {
              smartSpeed: 750
            }
          }

        })
        .on('changed.owl.carousel', function(e) {
          relaLazyUnload(e);
          relaLazyLoad(e);
          if (!flag) {
            flag = true;
            mainOwlThumb.trigger('to.owl.carousel', [e.item.index, duration, true]);
            flag = false;
          }
        })




      var owlThumbs = $(mainOwlThumb, context).owlCarousel({
          items: 7,
          margin: 10,
          smartSpeed: 750,
        })
        .on('click', '.owl-item', function() {
          mainOwlBig.trigger('to.owl.carousel', [$(this).index(), duration, true]);

        })
        .on('changed.owl.carousel', function(e) {
          if (!flag) {
            flag = true;
            mainOwlBig.trigger('to.owl.carousel', [e.item.index, duration, true]);
            flag = false;
          }
        });

      $('div[data="block-views-property-gallery-block-main-owl"]', context).click(function() {
        var stageWidth = $('#block-views-property-gallery-block-main-owl').width();

        var carouselMain = $(mainOwlBig).data('owlCarousel');
        carouselMain._width = stageWidth;
        carouselMain.invalidate('width');
        carouselMain.refresh();

        var carouselThumbs = $(mainOwlThumb).data('owlCarousel');
        carouselThumbs._width = stageWidth;
        carouselThumbs.invalidate('width');
        carouselThumbs.refresh();

        relaLazyInit(carouselMain);
      });

      $('a[data="block-views-property-gallery-block-main-owl"]', context).click(function() {
        var stageWidth = $('#block-views-property-gallery-block-main-owl').width();

        var carouselMain = $(mainOwlBig).data('owlCarousel');
        carouselMain._width = stageWidth;
        carouselMain.invalidate('width');
        carouselMain.refresh();

        var carouselThumbs = $(mainOwlThumb).data('owlCarousel');
        carouselThumbs._width = stageWidth;
        carouselThumbs.invalidate('width');
        carouselThumbs.refresh();

        relaLazyInit(carouselMain);
      });

      /**
       * Loads the first two images in the carousel on init
       */
      function relaLazyInit(e) {
        for (i = 0; i < 2; i++) {
          var owlItem = e._items[i];
          var owlImage = $(owlItem).find('img.owl-lazy');
          $(owlImage).attr('src', $(owlImage).attr('data-src'));
          $(owlImage).css('opacity', '1');
          relaLazyArrayPush(owlImage, i);
        }
      };

      /**
       * Unloads an image to save on physical memory
       */
      function relaLazyUnload(e) {
        if (e.item.index >= 2) {
          var nums = [-2, 2];
          for (i in nums) {
            var preIndex = e.item.index + nums[i];
            var owlItem = e.relatedTarget._items[preIndex];
            var owlImage = $(owlItem).find('img.owl-lazy');
            if ($(owlImage).attr('src')) {
              $(owlImage).removeAttr('src');
              relaLazyIncinerator(preIndex, e.item.index);
            }
          }
        }
      };

      /**
       * loads the image when it is one away
       */
      function relaLazyLoad(e) {
        if (e.item.index >= 1) {
          for (i = -1; i < 2; i++) {
            var owlItem = e.relatedTarget._items[e.item.index + i];
            var owlImage = $(owlItem).find('img.owl-lazy');
            if (!$(owlImage).attr('src')) {
              $(owlImage).attr('src', $(owlImage).attr('data-src'));
              $(owlImage).css('opacity', '1');
              relaLazyArrayPush(owlImage, e.item.index + i);
            }
          }
        }
      };

      /**
       * Moves the image element into an dictionary with its index being the key for
       * incineration later
       */
      function relaLazyArrayPush(el, indexKey) {
        relaLazyDict[indexKey] = el;
      };

      /**
       * incinerates any loaded photos out of range of carousel
       */
      function relaLazyIncinerator(indexKey, currentIndex) {
        delete relaLazyDict[indexKey];
        //the +1 is because it kept returning one less than there actually was
        var dictLength = Object.keys(relaLazyDict).length + 1;
        if (dictLength > 3) {
          for (i in relaLazyDict) {
            if (i > currentIndex + 1 || i < currentIndex - 1) {
              delete relaLazyDict[i];
            }
          }
        }
      };


    }
  }



  Drupal.behaviors.OwlinPage = {
    attach: function(context, settings) {
      if ($(".view-display-id-embed_owl_main").length > 0) {
        var owl = $(".view-display-id-embed_owl_main .view-content", context).owlCarousel({
          loop: false,
          items: 3,
          nav: true,
          margin: 20,
          navText: ['<span class="icon icon-arrow-67"></span>', '<span class="icon icon-arrow-68"></span>'],
          pagination: false,
          video: true,
          responsive: {
            // breakpoint from 0 up
            0: {
              items: 1,
              margin: 20,

              center: true,

            },
            // breakpoint from 480 up
            480: {
              items: 2,
            },

            // breakpoint from 768 up
            768: {
              items: 3,
            }
          }
        });
      }
    }
  }




  Drupal.behaviors.OwlThemesSlider = {
    attach: function(context, settings) {
      var owlFullBg = $(".owl-themes-slider .view-content", context).owlCarousel({
        loop: true,
        items: 1,
        margin: 0,
        pagination: false,
        autoplay: true,
        autoplayTimeout: 5000,
        smartSpeed: 750,
        autoplayHoverPause: true,
      });
    }
  }


  Drupal.behaviors.RelazTestimonial = {
    attach: function(context, settings) {
      if ($("#aa-testimonials .view-content").length > 0) {
        var showNav = false;
        var target = '#aa-testimonials .view-content';
        if ($(target + ' .views-row').length > 1) {
          showNav = true;
        }
        var owlOpenHouse = $(target, context)
          .owlCarousel({
            items: 1,
            autoplay: true,
            smartSpeed: 1100,
            nav: showNav,
            loop: showNav,
            navText: ['<span class="icon icon-arrow-67"></span>', '<span class="icon icon-arrow-68"></span>'],
            responsive: {
              // breakpoint from 0 up
              0: {
                nav: false,
              },
              // breakpoint from 480 up
              768: {
                nav: true,


              }
            }
          });
      }
    }
  }

  Drupal.behaviors.RelazOpenHouz = {
    attach: function(context, settings) {
      if ($(".open-house-slider .view-content").length > 0) {
        var showNav = false;
        var target = '.open-house-slider .view-content';
        if ($(target + ' .views-row').length > 1) {
          showNav = true;
        }
        var owlOpenHouse = $(target, context)
          .owlCarousel({
            items: 1,
            autoplay: true,
            smartSpeed: 750,
            nav: showNav,
            loop: showNav,
            navText: ['<span class="icon icon-arrow-67"></span>', '<span class="icon icon-arrow-68"></span>'],
          });
      }
    }
  }

  Drupal.behaviors.RelazVOpenHouz = {
    attach: function(context, settings) {
      if ($(".voh-slider .view-content").length > 0) {
        var showNav = false;
        var target = '.voh-slider .view-content';
        if ($(target + ' .views-row').length > 1) {
          showNav = true;
        }
        var owlOpenHouse = $(target, context)
          .owlCarousel({
            items: 1,
            autoplay: true,
            smartSpeed: 750,
            nav: showNav,
            loop: showNav,
            navText: ['<span class="icon icon-arrow-67"></span>', '<span class="icon icon-arrow-68"></span>'],
          });
      }
    }
  }
  Drupal.behaviors.RelazSwiperFullBG = {
    attach: function(context, settings) {

      var owlFullBg = $(".owl-fullbg .view-content", context).owlCarousel({
        loop: false,
        items: 1,
        // nav:true,
        margin: 0,
        //navText: ['<span class="icon icon-arrow-67"></span>', '<span class="icon icon-arrow-68"></span>' ],
        pagination: false,

      });

      var owlThumbs = $(".owl-thumbs .view-content", context).owlCarousel({
        loop: false,
        //items: 8,
        nav: true,
        margin: 10,
        stagePadding: 20,
        navText: ['<span class="icon icon-arrow-67"></span>', '<span class="icon icon-arrow-68"></span>'],
        pagination: false,
        //autoWidth:true,
        responsiveClass: true,
        responsive: {
          // breakpoint from 0 up
          0: {
            items: 1,
            //stagePadding: 0,
            //autoWidth:true,
            loop: true,
            nav: false,
            center: true,
            touchDrag: true,
            mouseDrag: true
          },
          // breakpoint from 480 up
          480: {
            items: 1,

            nav: true,
            //center:true,
            //stagePadding: 0,
            touchDrag: true,
            mouseDrag: true

          },
          // breakpoint from 768 up
          768: {
            items: 6,
            //stagePadding:0,
            //touchDrag: false,
            // mouseDrag: false
          },
          // breakpoint from 768 up
          1200: {
            items: 8,
            // stagePadding:0,
            //touchDrag: false,
            //mouseDrag: false
          }
        }


      });



      $(".owl-thumbs").on('click', '.owl-item', function() {

        owlFullBg.trigger('to.owl.carousel', [$(this).index(), 500]);
        owlThumbs.trigger('next.owl.carousel', [500]);


      });

      var playerID = '.view-display-id-owl_embed_fullbg .views-field-field-property-video-url .field-content';

      function vimeoRescale() {
        var w = $(window).width() + 0,
          h = $(window).height() + 0;

        if (w / h > 16 / 9) {
          $(playerID).width(w).height(w / 16 * 9);
          $(playerID).css({
            'left': '0px'
          });
        } else {
          $(playerID).width(h / 9 * 16).height(h);
          $(playerID).css({
            'left': -($(playerID).outerWidth() - w) / 2
          });
        }
      } // End viemo rescale
      $(window).on('load resize', function() {
        vimeoRescale();
      });
    }
  }


  Drupal.behaviors.EmbeddableSingleOwlCarousel = {
    attach: function(context, settings) {
      if ($(".property-plain-owl").length > 0) {
        $('.property-plain-owl .view-content').owlCarousel({
          items: 1,
          nav: true,
          navText: ['<div class="pe-7s-angle-left"></div>', '<div class="pe-7s-angle-right"></div>'],
          lazyLoad: true,
          autoplay: true,
          autoplayHoverPause: true,
        });
      }
    }
  }

  Drupal.behaviors.EmbeddableCarousel = {
    attach: function(context, settings) {
      if ($(".embed-owl-carousel").length > 0) {
        $('.embed-owl-carousel .view-content').owlCarousel({
          items: 1,
          nav: true,
          navText: ['<div class="pe-7s-angle-left"></div>', '<div class="pe-7s-angle-right"></div>'],
        });
      }
    }
  }

  Drupal.behaviors.logoCarousel = {
    attach: function(context, settings) {
      if ($(".view-display-id-pane_customer_logos").length > 0) {
        $('.view-display-id-pane_customer_logos .view-content ul').owlCarousel({
          items: 3,
          nav: false,
          autoplay: true,
          loop: true,

        });
      }
    }
  }

  Drupal.behaviors.floorplanGallery = {
    attach: function(context, settings) {
      if ($(".aview-display-id-embed_floorplan_gallery").length > 0) {
        $('.view-display-id-embed_floorplan_gallery .view-content').owlCarousel({
          items: 2,

          nav: false,
          autoplay: false,
          autoWidth:true,
          loop: false,
          center: true,
          responsive: {
          // breakpoint from 0 up
          0: {
            items: 1,
            //stagePadding: 0,
            //autoWidth:true,
            loop: true,
            nav: false,
            center: true,
            touchDrag: true,
            mouseDrag: true
          },

          // breakpoint from 768 up
          768: {
            items: 2
          }
        }
        });
      }
    }
  }

  Drupal.behaviors.PropertyPSPWthumbs = {
    attach: function(context, settings) {
      if ($('#pspw-gallery-thumbs').length > 0) {
        $('#pspw-gallery-thumbs .inner').owlCarousel({
          items:8,
          nav: true,
          navText: ['<div class="icon-arrow-left"></div>', '<div class="icon-arrow-right"></div>'],
          autoplay: false,
          loop: false,
          margin:10,

          responsive: {

            0: {
              items:4
            },

            768: {
              items:6
            },
            1199:{
              items:8
            },
          },
        });
      }
    }
  }

})(jQuery, Drupal);
;/*})'"*/;/*})'"*/
