/*!
 * Bootstrap v3.3.4 (http://getbootstrap.com)
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";var b=a.fn.jquery.split(" ")[0].split(".");if(b[0]<2&&b[1]<9||1==b[0]&&9==b[1]&&b[2]<1)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher")}(jQuery),+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){return a(b.target).is(this)?b.handleObj.handler.apply(this,arguments):void 0}})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.3.4",d.TRANSITION_DURATION=150,d.prototype.close=function(b){function c(){g.detach().trigger("closed.bs.alert").remove()}var e=a(this),f=e.attr("data-target");f||(f=e.attr("href"),f=f&&f.replace(/.*(?=#[^\s]*$)/,""));var g=a(f);b&&b.preventDefault(),g.length||(g=e.closest(".alert")),g.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(g.removeClass("in"),a.support.transition&&g.hasClass("fade")?g.one("bsTransitionEnd",c).emulateTransitionEnd(d.TRANSITION_DURATION):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.3.4",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),setTimeout(a.proxy(function(){d[e](null==f[b]?this.options[b]:f[b]),"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?a=!1:b.find(".active").removeClass("active")),a&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active"));a&&this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target);d.hasClass("btn")||(d=d.closest(".btn")),b.call(d,"toggle"),c.preventDefault()}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(b){a(b.target).closest(".btn").toggleClass("focus",/^focus(in)?$/.test(b.type))})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=null,this.sliding=null,this.interval=null,this.$active=null,this.$items=null,this.options.keyboard&&this.$element.on("keydown.bs.carousel",a.proxy(this.keydown,this)),"hover"==this.options.pause&&!("ontouchstart"in document.documentElement)&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.3.4",c.TRANSITION_DURATION=600,c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0,keyboard:!0},c.prototype.keydown=function(a){if(!/input|textarea/i.test(a.target.tagName)){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()}},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.getItemForDirection=function(a,b){var c=this.getItemIndex(b),d="prev"==a&&0===c||"next"==a&&c==this.$items.length-1;if(d&&!this.options.wrap)return b;var e="prev"==a?-1:1,f=(c+e)%this.$items.length;return this.$items.eq(f)},c.prototype.to=function(a){var b=this,c=this.getItemIndex(this.$active=this.$element.find(".item.active"));return a>this.$items.length-1||0>a?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){b.to(a)}):c==a?this.pause().cycle():this.slide(a>c?"next":"prev",this.$items.eq(a))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){return this.sliding?void 0:this.slide("next")},c.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},c.prototype.slide=function(b,d){var e=this.$element.find(".item.active"),f=d||this.getItemForDirection(b,e),g=this.interval,h="next"==b?"left":"right",i=this;if(f.hasClass("active"))return this.sliding=!1;var j=f[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:h});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,g&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(f)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:h});return a.support.transition&&this.$element.hasClass("slide")?(f.addClass(b),f[0].offsetWidth,e.addClass(h),f.addClass(h),e.one("bsTransitionEnd",function(){f.removeClass([b,h].join(" ")).addClass("active"),e.removeClass(["active",h].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger(m)},0)}).emulateTransitionEnd(c.TRANSITION_DURATION)):(e.removeClass("active"),f.addClass("active"),this.sliding=!1,this.$element.trigger(m)),g&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this};var e=function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}};a(document).on("click.bs.carousel.data-api","[data-slide]",e).on("click.bs.carousel.data-api","[data-slide-to]",e),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(jQuery),+function(a){"use strict";function b(b){var c,d=b.attr("data-target")||(c=b.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"");return a(d)}function c(b){return this.each(function(){var c=a(this),e=c.data("bs.collapse"),f=a.extend({},d.DEFAULTS,c.data(),"object"==typeof b&&b);!e&&f.toggle&&/show|hide/.test(b)&&(f.toggle=!1),e||c.data("bs.collapse",e=new d(this,f)),"string"==typeof b&&e[b]()})}var d=function(b,c){this.$element=a(b),this.options=a.extend({},d.DEFAULTS,c),this.$trigger=a('[data-toggle="collapse"][href="#'+b.id+'"],[data-toggle="collapse"][data-target="#'+b.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};d.VERSION="3.3.4",d.TRANSITION_DURATION=350,d.DEFAULTS={toggle:!0},d.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},d.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b,e=this.$parent&&this.$parent.children(".panel").children(".in, .collapsing");if(!(e&&e.length&&(b=e.data("bs.collapse"),b&&b.transitioning))){var f=a.Event("show.bs.collapse");if(this.$element.trigger(f),!f.isDefaultPrevented()){e&&e.length&&(c.call(e,"hide"),b||e.data("bs.collapse",null));var g=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var h=function(){this.$element.removeClass("collapsing").addClass("collapse in")[g](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return h.call(this);var i=a.camelCase(["scroll",g].join("-"));this.$element.one("bsTransitionEnd",a.proxy(h,this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i])}}}},d.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var e=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(e,this)).emulateTransitionEnd(d.TRANSITION_DURATION):e.call(this)}}},d.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},d.prototype.getParent=function(){return a(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(a.proxy(function(c,d){var e=a(d);this.addAriaAndCollapsedClass(b(e),e)},this)).end()},d.prototype.addAriaAndCollapsedClass=function(a,b){var c=a.hasClass("in");a.attr("aria-expanded",c),b.toggleClass("collapsed",!c).attr("aria-expanded",c)};var e=a.fn.collapse;a.fn.collapse=c,a.fn.collapse.Constructor=d,a.fn.collapse.noConflict=function(){return a.fn.collapse=e,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(d){var e=a(this);e.attr("data-target")||d.preventDefault();var f=b(e),g=f.data("bs.collapse"),h=g?"toggle":e.data();c.call(f,h)})}(jQuery),+function(a){"use strict";function b(b){b&&3===b.which||(a(e).remove(),a(f).each(function(){var d=a(this),e=c(d),f={relatedTarget:this};e.hasClass("open")&&(e.trigger(b=a.Event("hide.bs.dropdown",f)),b.isDefaultPrevented()||(d.attr("aria-expanded","false"),e.removeClass("open").trigger("hidden.bs.dropdown",f)))}))}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.3.4",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus").attr("aria-expanded","true"),f.toggleClass("open").trigger("shown.bs.dropdown",h)}return!1}},g.prototype.keydown=function(b){if(/(38|40|27|32)/.test(b.which)&&!/input|textarea/i.test(b.target.tagName)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var e=c(d),g=e.hasClass("open");if(!g&&27!=b.which||g&&27==b.which)return 27==b.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.disabled):visible a",i=e.find('[role="menu"]'+h+', [role="listbox"]'+h);if(i.length){var j=i.index(b.target);38==b.which&&j>0&&j--,40==b.which&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f,g.prototype.keydown).on("keydown.bs.dropdown.data-api",'[role="menu"]',g.prototype.keydown).on("keydown.bs.dropdown.data-api",'[role="listbox"]',g.prototype.keydown)}(jQuery),+function(a){"use strict";function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$dialog=this.$element.find(".modal-dialog"),this.$backdrop=null,this.isShown=null,this.originalBodyPad=null,this.scrollbarWidth=0,this.ignoreBackdropClick=!1,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.3.4",c.TRANSITION_DURATION=300,c.BACKDROP_TRANSITION_DURATION=150,c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var d=this,e=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(e),this.isShown||e.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.setScrollbar(),this.$body.addClass("modal-open"),this.escape(),this.resize(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.$dialog.on("mousedown.dismiss.bs.modal",function(){d.$element.one("mouseup.dismiss.bs.modal",function(b){a(b.target).is(d.$element)&&(d.ignoreBackdropClick=!0)})}),this.backdrop(function(){var e=a.support.transition&&d.$element.hasClass("fade");d.$element.parent().length||d.$element.appendTo(d.$body),d.$element.show().scrollTop(0),d.adjustDialog(),e&&d.$element[0].offsetWidth,d.$element.addClass("in").attr("aria-hidden",!1),d.enforceFocus();var f=a.Event("shown.bs.modal",{relatedTarget:b});e?d.$dialog.one("bsTransitionEnd",function(){d.$element.trigger("focus").trigger(f)}).emulateTransitionEnd(c.TRANSITION_DURATION):d.$element.trigger("focus").trigger(f)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),this.resize(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"),this.$dialog.off("mousedown.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(c.TRANSITION_DURATION):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},c.prototype.resize=function(){this.isShown?a(window).on("resize.bs.modal",a.proxy(this.handleUpdate,this)):a(window).off("resize.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$body.removeClass("modal-open"),a.resetAdjustments(),a.resetScrollbar(),a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var d=this,e=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var f=a.support.transition&&e;if(this.$backdrop=a('<div class="modal-backdrop '+e+'" />').appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){return this.ignoreBackdropClick?void(this.ignoreBackdropClick=!1):void(a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus():this.hide()))},this)),f&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;f?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var g=function(){d.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):g()}else b&&b()},c.prototype.handleUpdate=function(){this.adjustDialog()},c.prototype.adjustDialog=function(){var a=this.$element[0].scrollHeight>document.documentElement.clientHeight;this.$element.css({paddingLeft:!this.bodyIsOverflowing&&a?this.scrollbarWidth:"",paddingRight:this.bodyIsOverflowing&&!a?this.scrollbarWidth:""})},c.prototype.resetAdjustments=function(){this.$element.css({paddingLeft:"",paddingRight:""})},c.prototype.checkScrollbar=function(){var a=window.innerWidth;if(!a){var b=document.documentElement.getBoundingClientRect();a=b.right-Math.abs(b.left)}this.bodyIsOverflowing=document.body.clientWidth<a,this.scrollbarWidth=this.measureScrollbar()},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.originalBodyPad=document.body.style.paddingRight||"",this.bodyIsOverflowing&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right",this.originalBodyPad)},c.prototype.measureScrollbar=function(){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;(e||!/destroy|hide/.test(b))&&(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.init("tooltip",a,b)};c.VERSION="3.3.4",c.TRANSITION_DURATION=150,c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){if(this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(this.options.viewport.selector||this.options.viewport),this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c&&c.$tip&&c.$tip.is(":visible")?void(c.hoverState="in"):(c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show())},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var d=a.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!d)return;var e=this,f=this.tip(),g=this.getUID(this.type);this.setContent(),f.attr("id",g),this.$element.attr("aria-describedby",g),this.options.animation&&f.addClass("fade");var h="function"==typeof this.options.placement?this.options.placement.call(this,f[0],this.$element[0]):this.options.placement,i=/\s?auto?\s?/i,j=i.test(h);j&&(h=h.replace(i,"")||"top"),f.detach().css({top:0,left:0,display:"block"}).addClass(h).data("bs."+this.type,this),this.options.container?f.appendTo(this.options.container):f.insertAfter(this.$element);var k=this.getPosition(),l=f[0].offsetWidth,m=f[0].offsetHeight;if(j){var n=h,o=this.options.container?a(this.options.container):this.$element.parent(),p=this.getPosition(o);h="bottom"==h&&k.bottom+m>p.bottom?"top":"top"==h&&k.top-m<p.top?"bottom":"right"==h&&k.right+l>p.width?"left":"left"==h&&k.left-l<p.left?"right":h,f.removeClass(n).addClass(h)}var q=this.getCalculatedOffset(h,k,l,m);this.applyPlacement(q,h);var r=function(){var a=e.hoverState;e.$element.trigger("shown.bs."+e.type),e.hoverState=null,"out"==a&&e.leave(e)};a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",r).emulateTransitionEnd(c.TRANSITION_DURATION):r()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top=b.top+g,b.left=b.left+h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=/top|bottom/.test(c),m=l?2*k.left-e+i:2*k.top-f+j,n=l?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(m,d[0][n],l)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c?"left":"top",50*(1-a/b)+"%").css(c?"top":"left","")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(b){function d(){"in"!=e.hoverState&&f.detach(),e.$element.removeAttr("aria-describedby").trigger("hidden.bs."+e.type),b&&b()}var e=this,f=a(this.$tip),g=a.Event("hide.bs."+this.type);return this.$element.trigger(g),g.isDefaultPrevented()?void 0:(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",d).emulateTransitionEnd(c.TRANSITION_DURATION):d(),this.hoverState=null,this)},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName,e=c.getBoundingClientRect();null==e.width&&(e=a.extend({},e,{width:e.right-e.left,height:e.bottom-e.top}));var f=d?{top:0,left:0}:b.offset(),g={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop()},h=d?{width:a(window).width(),height:a(window).height()}:null;return a.extend({},e,g,h,f)},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.width&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){return this.$tip=this.$tip||a(this.options.template)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){var a=this;clearTimeout(this.timeout),this.hide(function(){a.$element.off("."+a.type).removeData("bs."+a.type)})};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;(e||!/destroy|hide/.test(b))&&(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.3.4",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(jQuery),+function(a){"use strict";function b(c,d){this.$body=a(document.body),this.$scrollElement=a(a(c).is(document.body)?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",a.proxy(this.process,this)),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.3.4",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b=this,c="offset",d=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),a.isWindow(this.$scrollElement[0])||(c="position",d=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var b=a(this),e=b.data("target")||b.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[c]().top+d,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){b.offsets.push(this[0]),b.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<e[0])return this.activeTarget=null,this.clear();for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(void 0===e[a+1]||b<e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,this.clear();var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")},b.prototype.clear=function(){a(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.3.4",c.TRANSITION_DURATION=150,c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a"),f=a.Event("hide.bs.tab",{relatedTarget:b[0]}),g=a.Event("show.bs.tab",{relatedTarget:e[0]});
if(e.trigger(f),b.trigger(g),!g.isDefaultPrevented()&&!f.isDefaultPrevented()){var h=a(d);this.activate(b.closest("li"),c),this.activate(h,h.parent(),function(){e.trigger({type:"hidden.bs.tab",relatedTarget:b[0]}),b.trigger({type:"shown.bs.tab",relatedTarget:e[0]})})}}},c.prototype.activate=function(b,d,e){function f(){g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),h?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu").length&&b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),e&&e()}var g=d.find("> .active"),h=e&&a.support.transition&&(g.length&&g.hasClass("fade")||!!d.find("> .fade").length);g.length&&h?g.one("bsTransitionEnd",f).emulateTransitionEnd(c.TRANSITION_DURATION):f(),g.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this};var e=function(c){c.preventDefault(),b.call(a(this),"show")};a(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',e).on("click.bs.tab.data-api",'[data-toggle="pill"]',e)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=null,this.unpin=null,this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.3.4",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getState=function(a,b,c,d){var e=this.$target.scrollTop(),f=this.$element.offset(),g=this.$target.height();if(null!=c&&"top"==this.affixed)return c>e?"top":!1;if("bottom"==this.affixed)return null!=c?e+this.unpin<=f.top?!1:"bottom":a-d>=e+g?!1:"bottom";var h=null==this.affixed,i=h?e:f.top,j=h?g:b;return null!=c&&c>=e?"top":null!=d&&i+j>=a-d?"bottom":!1},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=this.$element.height(),d=this.options.offset,e=d.top,f=d.bottom,g=a(document.body).height();"object"!=typeof d&&(f=e=d),"function"==typeof e&&(e=d.top(this.$element)),"function"==typeof f&&(f=d.bottom(this.$element));var h=this.getState(g,b,e,f);if(this.affixed!=h){null!=this.unpin&&this.$element.css("top","");var i="affix"+(h?"-"+h:""),j=a.Event(i+".bs.affix");if(this.$element.trigger(j),j.isDefaultPrevented())return;this.affixed=h,this.unpin="bottom"==h?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix","affixed")+".bs.affix")}"bottom"==h&&this.$element.offset({top:g-b-f})}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},null!=d.offsetBottom&&(d.offset.bottom=d.offsetBottom),null!=d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);
;/*})'"*/;/*})'"*/
/*!
 * hoverIntent v1.8.0 // 2014.06.29 // jQuery v1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2014 Brian Cherne
 */
(function($){$.fn.hoverIntent=function(handlerIn,handlerOut,selector){var cfg={interval:100,sensitivity:6,timeout:0};if(typeof handlerIn==="object"){cfg=$.extend(cfg,handlerIn)}else{if($.isFunction(handlerOut)){cfg=$.extend(cfg,{over:handlerIn,out:handlerOut,selector:selector})}else{cfg=$.extend(cfg,{over:handlerIn,out:handlerIn,selector:handlerOut})}}var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if(Math.sqrt((pX-cX)*(pX-cX)+(pY-cY)*(pY-cY))<cfg.sensitivity){$(ob).off("mousemove.hoverIntent",track);ob.hoverIntent_s=true;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=false;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=$.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type==="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).on("mousemove.hoverIntent",track);if(!ob.hoverIntent_s){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).off("mousemove.hoverIntent",track);if(ob.hoverIntent_s){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.on({"mouseenter.hoverIntent":handleHover,"mouseleave.hoverIntent":handleHover},cfg.selector)}})(jQuery);
;/*})'"*/;/*})'"*/
/*! modernizr 3.6.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-webp-setclasses !*/
!function(e,n,A){function o(e,n){return typeof e===n}function t(){var e,n,A,t,a,i,l;for(var f in r)if(r.hasOwnProperty(f)){if(e=[],n=r[f],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(A=0;A<n.options.aliases.length;A++)e.push(n.options.aliases[A].toLowerCase());for(t=o(n.fn,"function")?n.fn():n.fn,a=0;a<e.length;a++)i=e[a],l=i.split("."),1===l.length?Modernizr[l[0]]=t:(!Modernizr[l[0]]||Modernizr[l[0]]instanceof Boolean||(Modernizr[l[0]]=new Boolean(Modernizr[l[0]])),Modernizr[l[0]][l[1]]=t),s.push((t?"":"no-")+l.join("-"))}}function a(e){var n=u.className,A=Modernizr._config.classPrefix||"";if(c&&(n=n.baseVal),Modernizr._config.enableJSClass){var o=new RegExp("(^|\\s)"+A+"no-js(\\s|$)");n=n.replace(o,"$1"+A+"js$2")}Modernizr._config.enableClasses&&(n+=" "+A+e.join(" "+A),c?u.className.baseVal=n:u.className=n)}function i(e,n){if("object"==typeof e)for(var A in e)f(e,A)&&i(A,e[A]);else{e=e.toLowerCase();var o=e.split("."),t=Modernizr[o[0]];if(2==o.length&&(t=t[o[1]]),"undefined"!=typeof t)return Modernizr;n="function"==typeof n?n():n,1==o.length?Modernizr[o[0]]=n:(!Modernizr[o[0]]||Modernizr[o[0]]instanceof Boolean||(Modernizr[o[0]]=new Boolean(Modernizr[o[0]])),Modernizr[o[0]][o[1]]=n),a([(n&&0!=n?"":"no-")+o.join("-")]),Modernizr._trigger(e,n)}return Modernizr}var s=[],r=[],l={_version:"3.6.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var A=this;setTimeout(function(){n(A[e])},0)},addTest:function(e,n,A){r.push({name:e,fn:n,options:A})},addAsyncTest:function(e){r.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=l,Modernizr=new Modernizr;var f,u=n.documentElement,c="svg"===u.nodeName.toLowerCase();!function(){var e={}.hasOwnProperty;f=o(e,"undefined")||o(e.call,"undefined")?function(e,n){return n in e&&o(e.constructor.prototype[n],"undefined")}:function(n,A){return e.call(n,A)}}(),l._l={},l.on=function(e,n){this._l[e]||(this._l[e]=[]),this._l[e].push(n),Modernizr.hasOwnProperty(e)&&setTimeout(function(){Modernizr._trigger(e,Modernizr[e])},0)},l._trigger=function(e,n){if(this._l[e]){var A=this._l[e];setTimeout(function(){var e,o;for(e=0;e<A.length;e++)(o=A[e])(n)},0),delete this._l[e]}},Modernizr._q.push(function(){l.addTest=i}),Modernizr.addAsyncTest(function(){function e(e,n,A){function o(n){var o=n&&"load"===n.type?1==t.width:!1,a="webp"===e;i(e,a&&o?new Boolean(o):o),A&&A(n)}var t=new Image;t.onerror=o,t.onload=o,t.src=n}var n=[{uri:"data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",name:"webp"},{uri:"data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==",name:"webp.alpha"},{uri:"data:image/webp;base64,UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA",name:"webp.animation"},{uri:"data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=",name:"webp.lossless"}],A=n.shift();e(A.name,A.uri,function(A){if(A&&"load"===A.type)for(var o=0;o<n.length;o++)e(n[o].name,n[o].uri)})}),t(),a(s),delete l.addTest,delete l.addAsyncTest;for(var p=0;p<Modernizr._q.length;p++)Modernizr._q[p]();e.Modernizr=Modernizr}(window,document);

jQuery(window).bind("load resize scroll", function(e) {
  var $ = jQuery;
  var y = jQuery(window).scrollTop();


  jQuery(".parallax-move-up").filter(function() {

    return jQuery(this).offset().top < (y + jQuery(window).height()) &&
      jQuery(this).offset().top + jQuery(this).height() > y;
  }).css('background-position', '50% ' + parseInt(-y / 20) + 'px');
  //console.log($(window).height());
  var windowHeight = $(window).height();
  var footerHeight = $('footer').height()
  $('#property-list-scroll').height(windowHeight - footerHeight);
});

  jQuery.fn.isInViewport = function(y) {
    var y = y || 1;
    var elementTop = jQuery(this).offset().top;
    var elementBottom = elementTop + jQuery(this).outerHeight();
    var elementHeight = jQuery(this).height();
    var viewportTop = jQuery(window).scrollTop();
    var viewportBottom = viewportTop + jQuery(window).height();
    var deltaTop = Math.min(1, (elementBottom - viewportTop) / elementHeight);
    var deltaBottom = Math.min(1, (viewportBottom - elementTop) / elementHeight);
    return deltaTop * deltaBottom >= y;
  };
// https://github.com/daneden/animate.css
jQuery.fn.extend({
  animateCss: function(animationName, callback) {
    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    jQuery(this).removeClass('animated-processed').addClass('animated ' + animationName).one(animationEnd, function() {
      jQuery(this).removeClass('animated ' + animationName);
      if (typeof callback === 'function') callback();

    });
  }
});
// Open social share popup.
jQuery.fn.extend({
  openSocialShare: function(url, name, options) {
    var newWin = window.open(url, name, options);
    if (!newWin || newWin.closed || typeof newWin.closed == 'undefined') {
      jQuery('#social-block-alert').slideDown().delay(2000).slideUp();
    }
  }
});

jQuery.fn.extend({
  makeCloseLink: function(nid) {
    var selector = '.lead-summary-' + nid + ' a';
    var newLink = '<a href="#" class="summary-link opened">Close</a>';
    jQuery(selector).replaceWith(newLink);
  }
});

jQuery.fn.extend({
  openModal: function() {
    if (jQuery('.overlay-open').length == 0) {
      jQuery('#ajax-content-overlay').fadeIn();
      jQuery('.overlay-content').html('<div class="loader"></div>');
      jQuery('body').addClass('overlay-open');
    }
  }
});

jQuery.fn.extend({
  closeModal: function() {
    if (jQuery('.overlay-open').length > 0) {
      jQuery('#ajax-content-overlay').fadeOut();
      jQuery('.right-overlay-close').click();
      jQuery('.overlay-content').html('<div class="loader"></div>');
      jQuery('body').removeClass('overlay-open');
    }
  }
});

jQuery.fn.extend({
  openRightOverlay: function() {
    if (jQuery('.right-overlay-open').length == 0) {

      jQuery('#right-edit-overlay').addClass('right-overlay-open');
      jQuery('#right-edit-overlay').after('<div class="right-underlay"></div>');
      jQuery('#right-edit-overlay .overlay-inner').html('<i class="loader loader-grey"></i>');
      jQuery('#right-edit-overlay').animate({
        right: 0
      }, 500, "easeOutCubic");
      jQuery('body').addClass('right-overlay-open');
      var scroll = false;
      if (jQuery('#right-edit-overlay').hasClass('scroll-top')) {
        scroll = true;
      }
      if (scroll) {
        jQuery("html, body").animate({
          scrollTop: 0
        }, "normal");
      }

    }
  }
});

jQuery.fn.extend({
  closeRightOverlay: function() {
    if (jQuery('.right-overlay-open').length > 0) {
      jQuery('#right-edit-overlay').removeClass('right-overlay-open');
      jQuery('.right-underlay').remove();
      jQuery('#right-edit-overlay').animate({
        right: '-100%'
      }, 500, "easeOutCubic", function() {
        jQuery('#right-edit-overlay .overlay-title').text('Loading...');
        jQuery('#right-edit-overlay .overlay-inner').html('<i class="loader loader-grey"></i>');
      });
      jQuery('body').removeClass('right-overlay-open');
    }
  }
});

(function($, Drupal, undefined) {

  // custom global functions that can be called in other js files.
  // Call them like this Drupal.relaGlobalFunctions.isMobile()
  Drupal.relaGlobalFunctions = {
    isMobile: function () {

      return function() {
        // Check for mobile and iPad inside the function
        // //https://stackoverflow.com/a/3540295
        var mobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent || navigator.vendor || window.opera);
        //https://stackoverflow.com/a/58017456 checks for ipad
        var isIpad = navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2;

        return mobile || isIpad;
      };

      }(),
      // other functions defined here
  };

  window.getUrlParameter = function(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  };

  window.relaAjaxPost = function(url, params) {
    // Only allow this for relajax/ urls.
    if (url.indexOf('/relajax/nojs/global/') === 0) {
      var id = 'relaAjaxLink-wrapper';
      $wrapper = $('<div></div>', {id: id});

      var element_settings = {
        url: url,
        event: 'click',
        submit: params
      };

      Drupal.ajax[id] = new Drupal.ajax(id, $wrapper[0], element_settings);
      $wrapper.click();
    }
  }

  // Add Drupal ajax link.
  window.relaAjaxLink = function(url) {
    // Only allow this for relajax/ urls.
    if (url.indexOf('/relajax/') == 0) {
      var id = 'relaAjaxLink-wrapper';
      $wrapper = $('<div></div>', {id: id});

      var element_settings = {
        url: url,
        event: 'click'
      };

      Drupal.ajax[id] = new Drupal.ajax(id, $wrapper[0], element_settings);
      $wrapper.click();
    }
  }

  window.getTextColor = function($element) {
    var bgColor = $element.css('background-color');
    var count = 0;

    while (!bgColor || bgColor == 'rgba(0, 0, 0, 0)') {
      count += 1;
      $element = $element.parent();
      if ($element.is('body') || count >= 100) {
        bgColor = 'rgba(255, 255, 255)';
      }
      else {
        bgColor = $element.css('background-color');
      }
    }

    var bkg = bgColor.replace(/[^0-9,\.]/g, '').split(',');
    var a = 1 - (0.299 * bkg[0] + 0.587 * bkg[1] + 0.114 * bkg[2]) / 255;
    if (a < 0.25) {
      return '#000';
    }
    else {
      return '#FFF';
    }
  }

  window.isDefined = function(something) {
    return typeof something !== "undefined";
  }

  $(document).ready(function() {

    // AJAX reload the sort images for bulk upload background process.
    if (Drupal.settings.relaPhotos) {
      $('.view-id-property_images .empty-text').css({
        'opacity': '0'
      });
      var bid = Drupal.settings.relaPhotos.imageProcessing.bid;
      var nid = Drupal.settings.relaPhotos.imageProcessing.nid;
      var query = "?timestamp=" + $.now() + "&bid=" + bid;

      var photosPercentageInterval = setInterval(function() {
        photosGetPercentage();
      }, 6000);

      var photosViewInterval = setInterval(function() {
        //photosReloadView();

        relaAjaxLink('/relajax/photos/nojs/reload-sort-view-placeholder/' + nid);
      }, 10000);

      var photosGetPercentage = function() {
        $.ajax({
          url: '/batch_percentage.php' + query,
          complete: function(data) {

            // Update the percentage.
            $('#image-processing-' + nid + ' .image-processing-status').text(data.responseText);
            $.cookie(bid, data.responseText, {
              path: '/'
            });

            if (data.responseText == 'Done') {
              $.cookie(bid, null, {
                path: '/'
              });
              clearInterval(photosPercentageInterval);
              $.ajax({
                url: '/relajax/photos/nojs/processing-complete/' + nid,
                complete: function(data) {
                  clearInterval(photosViewInterval);
                  // photosReloadView();

                  relaAjaxLink('/relajax/photos/nojs/reload-sort-view/' + nid);
                  setTimeout(function() {
                    $('.image-processing-wrapper').remove();
                  }, 4000);

                }
              });
            }
          }
        });
      };

      var photosReloadView = function() {
        if ($('.reload-image-sort-view').length) {
          $('.reload-image-sort-view').trigger('click');
        }
      };
    }

    // Something else.
    $('.promo-activation .pane-title').click(function() {
      var parent = $(this).parent();
      if (parent.hasClass('expanded')) {
        $(this).parent().removeClass('expanded');
        $(this).next().slideUp('slow');
      } else {
        $(this).parent().addClass('expanded');
        $(this).next().slideDown('slow');
      }
    });
  });


  // Custom AJAX callback to send GA event.
  Drupal.ajax.prototype.commands.sendGAEventAJAX = function(ajax, response, status) {
    var category = response.data.category || 'Category';
    var action = response.data.action || 'Action';
    var label = response.data.label || 0;
    var value = response.data.value || 0;

    sendGAEvent(category, action, label, value);
  }

  // This is literally copied from ajax.js line 501 to define
  // Drupal.ajax.prototype.commands. We're doing this so we don't wrap replaced
  // content in a stupid div.
  Drupal.ajax.prototype.commands.relaInsert = function (ajax, response, status) {
    var wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);
    var method = response.method || ajax.method;
    var effect = ajax.getEffect(response);

    var new_content_wrapped = $('<div></div>').html(response.data);
    var new_content = new_content_wrapped.contents();

    switch (method) {
      case 'html':
      case 'replaceWith':
      case 'replaceAll':
      case 'empty':
      case 'remove':
        var settings = response.settings || ajax.settings || Drupal.settings;
        Drupal.detachBehaviors(wrapper, settings);
    }

    wrapper[method](new_content);

    if (effect.showEffect != 'show') {
      new_content.hide();
    }

    if ($('.ajax-new-content', new_content).length > 0) {
      $('.ajax-new-content', new_content).hide();
      new_content.show();
      $('.ajax-new-content', new_content)[effect.showEffect](effect.showSpeed);
    }
    else if (effect.showEffect != 'show') {
      new_content[effect.showEffect](effect.showSpeed);
    }

    if (new_content.parents('html').length > 0) {
      var settings = response.settings || ajax.settings || Drupal.settings;
      Drupal.attachBehaviors(new_content, settings);
    }
  };


  Drupal.behaviors.propertyGalleryProtect = {
    attach: function(context, settings) {

      $('.pswp__item').on('contextmenu', 'img', function(e) {
        return false;
      });
    }
  }

  // Send GA on checkout
  Drupal.behaviors.relaAnalytics = {
    attach: function(context, settings) {


      // Check for UTMs.
      var utmSource = getUrlParameter('utm_source') || '';
      if (utmSource.length) {
        var utms = {
          utm_source: utmSource,
          utm_medium: getUrlParameter('utm_medium') || '',
          utm_campaign: getUrlParameter('utm_campaign') || '',
          utm_term: getUrlParameter('utm_term') || '',
          utm_content: getUrlParameter('utm_content') || '',
        }

        $.cookie('rela_utms', JSON.stringify(utms), {
          expires: 30,
          path: '/'
        });
      }

      function sendGAEvent(category, action, label, value) {
        if (typeof gtag !== 'undefined') {
          if (label === undefined) {
            label = '';
          }

          if (value === undefined) {
            value = 0;
          }
      // console.log(category, 'sendtoGA');
          gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
          });
        }
      }

      if (!$.isEmptyObject(Drupal.settings.relaAnalytics)) {
        $.each(Drupal.settings.relaAnalytics, function(k, analytics) {
          //console.log(analytics, 'analyt');
          delete Drupal.settings.relaAnalytics[k];
          sendGAEvent(analytics.category, analytics.action, analytics.label, analytics.value);
        });
      }

    }
  }

  Drupal.behaviors.bef_bootstrap_fix = {
    attach: function (context, settings) {
      var views_exposed_form = jQuery('.views-exposed-form', context);

      views_exposed_form.hide();
      views_exposed_form.find('.form-control').not('.form-text, .form-select').removeClass('form-control');
      views_exposed_form.show();
    }
  };

  Drupal.behaviors.RelazGeneral = {
    attach: function(context, settings) {

      $('.forgot-pass-login-link').click(function() {
        $('.login-form-wrapper').removeClass('hidden');
        $('.pass-reset-form-wrapper').addClass('hidden');
      });

      $('.forgot-pass-link').click(function() {
        $('.login-form-wrapper').addClass('hidden');
        $('.pass-reset-form-wrapper').removeClass('hidden');
      });

      // Checks if user loads page via backbutton history and reloads it.
      if (performance.navigation.type == 2) {
        location.reload(true);
      }
      // Automatically change text color.
      if ($('.auto-text-color', context).length) {
        $('.auto-text-color').each(function() {
          $(this).removeClass('auto-text-color');
          $(this).css('color', getTextColor($(this)));
        });
      }

      if ($('.auto-border-color', context).length) {
        $('.auto-border-color').each(function() {
          $(this).removeClass('auto-border-color');
          var bkg = $(this).css('background-color').replace(/[^0-9,\.]/g, '').split(',');
          var a = 1 - (0.299 * bkg[0] + 0.587 * bkg[1] + 0.114 * bkg[2]) / 255;
          if (a < 0.5) {
            $(this).css('border-color', '#000');
          }
          else {
            $(this).css('border-color', '#FFF');
          }
        });
      }

        // Show/hide currency in property details form.
        if ($('.change-currency').length) {
          $('.change-currency').unbind('click');
          $('.change-currency').click(function() {
            var parent = $(this).closest('.group-pricing');
            $(parent).toggleClass('us-based');
          })
        }

        // Disable submit on click.
        $('.submit-disable').on('click', function() {
          $(this).addClass('disabled');
        });

        if ($('.submit-disable').is(":disabled")) {
          $(this).addClass('disabled');
        }

        // Doing this to re-enable the button after the user changes any details
        // for their card in the form so they re-submit.
        $('.commerce_payment input, .commerce_payment select').change(function(){
          $('.submit-disable').removeClass('disabled');
          $('.payment-errors').html('');
        });

        $('.commerce_payment input').keyup(function(){
          $('.submit-disable').removeClass('disabled');
          $('.payment-errors').html('');
        });

        // Disable submit on mousedown.
        $('.submit-disable-md').on('mousedown', function() {
          $(this).addClass('disabled');
        });

        if ($('.submit-disable-md').is(":disabled")) {
          $(this).addClass('disabled');
        }

        // Auto click links.
        if ($('.auto-download').length) {
          $('.auto-download', context).each(function() {
            $this = $(this);
            var url = $this.attr('data-url') || '';
            if (url.length) {
              var delay = $this.attr('data-delay') || 0;
              setTimeout(function() {
                $this.removeClass('auto-download').hide();
                window.location.href = '/relajax/nojs/general/auto-download?url=' + url;
              }, delay);
            }
          });
        }

        // if ($('a.auto-click').length) {
          $('a.auto-click').once(function() {
            var $this = $(this);
            var delay = $this.attr('data-delay') || 0;
            if (delay == 'in-viewport') {
              if ($this.isInViewport(0.5) && !$($this).hasClass('click-processed')){
                $this.click().removeClass('auto-click').hide()
                $this.click().addClass('click-processed');
              }

              $(window).scroll(function() {
                if ($this.isInViewport(0.5) && !$($this).hasClass('click-processed')) {
                  $this.click().removeClass('auto-click').hide()
                  $this.click().addClass('click-processed');
                }
              });
            }
            else {
              setTimeout(function() {
                $this.click().removeClass('auto-click').hide();
              }, delay);
            }

          });
        // }

        $('a.auto-redirect', context).each(function() {
          var $this = $(this);
          var delay = $this.attr('data-delay') || 0;
          var countdown = $this.attr('data-countdown') || 0;

          if (countdown && delay > 0) {
            var countdownTime = delay / 1000;
            $this.before('<div class="ar-countdown">You will be redirected in <span class="ar-countdown-time">' + countdownTime + '</span> seconds.</div>');
            var countdownInt = setInterval(function() {
              var currentCountdown = parseInt($('.ar-countdown .ar-countdown-time').text());
              if (currentCountdown == 1) {
                clearInterval(countdownInt);
              }
              $('.ar-countdown .ar-countdown-time').text(currentCountdown - 1);
            }, 1000);
          }

          setTimeout(function() {
            window.location.replace($this.attr('href'));
          }, delay);

        });

        $('.right-overlay-trigger', context).click(function() {
          if (!$('#right-edit-overlay').hasClass('right-overlay-open')) {
            $('#right-edit-overlay').addClass('right-overlay-open');
            $('#right-edit-overlay').after('<div class="right-underlay"></div>');
            $('#right-edit-overlay .overlay-inner').html('<i class="loader loader-grey"></i>');
            $('#right-edit-overlay').animate({
              right: 0
            }, 500, "easeOutCubic");

            var scroll = false;
            if (jQuery('#right-edit-overlay').hasClass('scroll-top')) {
              scroll = true;
            }
            if (scroll) {
              jQuery("html, body").animate({
                scrollTop: 0
              }, "normal");
            }
          }


          return false;
        });

      $('.right-overlay-close', context).click(function() {
        $('#right-edit-overlay').removeAttr('class');
        $('.right-underlay').remove();
        $('#right-edit-overlay').animate({
          right: '-100%'
        }, 500, "easeOutCubic", function() {
          $('#right-edit-overlay .overlay-title').text('Loading...');
          $('#right-edit-overlay .overlay-inner').html('<i class="loader loader-grey"></i>');
        });
        $('body').removeClass('right-overlay-open');
        //$('.right-overlay-close').trigger('closeRightOverlay');
      });
        // Close modal on escape key.
        if ($('body.overlay-open').length) {
          $(document).keyup(function(e) {
            if ($('.rela-modal.locked').length == 0) {
              if (e.keyCode == 27) {
                $.fn.closeModal();
              }
            }
          });
        }

        // Also hide overlay close if locked.
        $('.overlay-close').show();
        if ($('.rela-modal.locked').length) {
          $('.overlay-header .overlay-close').hide();
        }

        // Add slideDown animation to Bootstrap dropdown when expanding.
        $('.dropdown').on('show.bs.dropdown', function() {
          $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
        });

        // Add slideUp animation to Bootstrap dropdown when collapsing.
        $('.dropdown').on('hide.bs.dropdown', function() {
          $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
        });

        // Villa real estate phone format.
        $('.auth-20886 .field-name-field-user-phone').text(function(_, text) {
          return text.replace(/\(|\)/g, '').replace(/-/g, ' ');
        })

        // Reattach behaviors.
        $.fn.reattachBehaviors = function(selector) {
          Drupal.attachBehaviors(selector);
        };

        // Hide CC on share email for WL.
        $('#rela-property-email-share .form-type-checkbox input').change(function() {
          var checkedAgents = $('#rela-property-email-share .form-type-checkbox input:checked');
          var mail = $(this).val();
          if (this.checked) {
            $('#rela-property-email-share .cc-wrapper').slideDown();
            $('#rela-property-email-share div[data-mail="' + mail + '"]').slideDown();
          } else {
            $('#rela-property-email-share div[data-mail="' + mail + '"]').slideUp();
            if (checkedAgents.length == 0) {
              $('#rela-property-email-share .cc-wrapper').slideUp();
            } else {
              $('#rela-property-email-share .cc-wrapper').slideDown();
            }
          }
        })

        // Check DNS.
        if ($('.dns-check', context).length) {
          // Setup domain.
          if ($('td[data-domain-order]', context).length) {
            $('.dns-check', context).html('<div class="dns-check-result"><span class="fa fa-refresh fa-spin"></span> ' + Drupal.t('Processing') + '</div>');
          }
          // Check DNS Settings.
          else {
            $('.dns-check', context).each(function(k, v) {
              $this = $(this);
              if ($this.next('.dns-instructions-table').length > 0) {
                return;
              }

              $this.addClass('dns-check-' + k);

              var aRecord = $this.attr('data-arecord') || '';
              var cname = $this.attr('data-cname') || '';
              var srv = $this.attr('data-srv') || '';
              $this.html('<div class="dns-check-result"><span class="fa fa-refresh fa-spin"></span></div>');
              $.ajax({
                  method: 'POST',
                  url: '/relajax/nojs/domains/dns-check',
                  data: {
                    aRecord: aRecord,
                    cname: cname,
                    srv: srv
                  },
                })
                .done(function(data) {
                  var status = data.status;
                  var error = data.error;

                  $this = $('.dns-check-' + k);

                  var cls = status.replace(/\s+/g, '').toLowerCase();
                  $this.html('<div class="dns-check-result"><span class="fa fa-circle domain-status-' + cls + '"></span> ' + status + '</div>');

                  if (status.indexOf('Action Required') >= 0) {
                    $('body').addClass('show-dns-instructions');
                    $this.addClass('dns-invalid');

                    var showInstructions = $this.attr('data-show-errors') || false;
                    if (showInstructions && error.length > 0) {
                      $this.after(error);
                    }
                  }
                  else {
                    $('body').removeClass('show-dns-instructions');
                    if (status == 'OK') {
                      $this.removeClass('dns-invalid');
                      $this.html('<div class="dns-check-result"><span class="fa fa-check ico-green"></span> OK</div>');
                      if ($('.dns-check.wl-domain').length) {
                        $.post('/relajax/white-label/nojs/set-valid-wl-domain', {
                          cname: cname
                        });
                      }

                    }
                  }
                });
            });
          }
        }

        // Disable buttons on PLUpload submit.
        $('#rela-property-bulk-media-upload-upload-form', context).once('plupload-form', function() {
          if (0 < $(this).find('.plupload-element').length) {
            $(this).submit(function(e) {
              $('button').prop("disabled", true);
            })
          }
        });


        // Video upload stuff.
        $(window).on('beforeunload', function() {
          var ytInProgress = $.cookie['ytInProgress'];
          if (ytInProgress) {
            return Drupal.t('Warning: Your video is still uploading. Leaving this page will cancel the upload.');
          }
        });

        // Height for property header
        $('.property-header').height($('.group-property-details-right').height());

        var topOffset = $('.group-property-details-right').outerHeight() + $('.property-details-title').outerHeight();
        $('.details-group-wrap').css('margin-top', -topOffset);

        $('.no-brochure', context).click(function() {
          $('.no-brochure-message').slideDown('normal');
          return false;
        });

        if ($('.phone-format').length && !$('body').hasClass('user-21906')) {
          $('.phone-format input').mask("(999) 999-9999");
        }

        if ($('#property-edit-messages').hasClass('showing')) {
          setTimeout(
            function() {
              // $('#property-edit-messages').fadeOut(500, function(){
              //   $(this).removeClass('showing');
              // });
              $("#property-edit-messages").animate({
                top: -10 + "px"
              }, 200, function() {
                //Animation complete
                $(this).hide();
                $(this).css("top", "90px");
              });
            }, 2000);
        }

        $('.overlay-trigger', context).click(function() {
          var style = $(this).data('style');

          if (style !== undefined) {
            $('.overlay-content').attr('class', 'overlay-content');
            $('.overlay-content').addClass(style);
          } else {
            $('.overlay-content').attr('class', 'overlay-content');
          }
          $('#ajax-content-overlay').fadeIn();

          $('.overlay-content').show();
          $('#overlay-content-static').hide();
          $('.overlay-content').html('<div class="loader"></div>');
          $('body').addClass('overlay-open');

          if ($(this).attr('data-youtube-id')) {
            var videoID = $(this).attr('data-youtube-id');
            var embedURL = 'https://www.youtube.com/embed/' + videoID + '?autoplay=1&modestbranding=1&rel=0&showInfo=0&vq=hd720';
            var videoIframe = '<div id="property-video-modal" class="aspect-ratio-content">';
            videoIframe += '<iframe width="100%" height="100%" src="' + embedURL + '" frameborder="0" allowfullscreen></iframe></div>';
            $('.overlay-content').addClass('overlay-sixteen-nine').html(videoIframe);
          }

        });

        $('.overlay-close', context).click(function() {
          $('#ajax-content-overlay').fadeOut();
          $('.overlay-content').html('');
          $('.overlay-content').attr('class', 'overlay-content');
          $('body').removeClass('overlay-open');
          $('#overlay-content-static').hide();
          setTimeout(function() {
            $('#ajax-content-overlay').removeClass();
          }, 500);
          return false;
        });


        // Doing all leadop cookie checks in the front end and not in backend.
        $('#lead-pop-check', context).click(function() {
          if ($('body').hasClass('ppss-required')) {
            return false;
          }
          var pid = $(this).data('pid');
          var type = $(this).data('type');
          var lpid = getUrlParameter('lpid')
          var setLPcookie = false;
          var mls = getUrlParameter('mls');
          var utmMedium = getUrlParameter('utm_medium');

          var path = $(location).attr('href');
          path = path.split("/");
          if (mls === true || path[3] === 'mls' || path[3] === 'pv' || utmMedium === 'property_fb_ad') {
            setLPcookie = true;
            if (type == 'click for price') {
              var price = $('.click-for-price').data('price');
              if (price !== null) {
                $('.price-field').html(price);
              }

              return;
            }
          }

          // Check url param and hash in settinsg and set cookie if match.
          if (settings.relaPIDhash !== undefined) {
            if (lpid !== undefined) {
              if (lpid == settings.relaPIDhash) {
                setLPcookie = true;
              }
            }
          }
          // If cookie doesnt exists and set flag is true, then set.
          if ($.cookie('rela_leadpop') === null) {
            if (setLPcookie == true) {

              var dis = [];
              dis.push(pid);
              $.cookie('rela_leadpop', JSON.stringify(dis), {
                expires: 14,
                path: '/'
              });
              // click this check link again and it should run through.
              $('#lead-pop-check').click();

            }
            else {
              // if no cookie, and not ready to set, then click the link.
              $('.lead-pop-link-auto').click();
              setExitPop();
            }
          }
          // If we have the cookie, check if correct one, if not, then click
          else {
            //have cookie
            var cooky = $.parseJSON($.cookie('rela_leadpop'));
            if (typeof pid !== 'string') {
              // if the shit is set from php it's not a string so check and covert
              // so we can check the inarray correctly.
              pid = pid.toString();
            }
            if ($.inArray(pid, cooky) !== -1) {
             // Cookie validates against property, so show price.
             if (type == 'click for price') {
              var price = $('.click-for-price').data('price');
              $('.price-field').html(price);
             }
            }
            else if (setLPcookie == true) {
              cooky.push(pid);
              $.cookie('rela_leadpop', JSON.stringify(cooky), {
                expires: 14,
                path: '/'
              });
            }
            else {
              // click the leadpop link, but not price or the exit intent
              $('.lead-pop-link-auto').click();
              setExitPop();

            }
          }
        });

        function setExitPop(){
          $('.lead-pop-exit', context).each(function(){
            $(function() {
              ddexitpop.init({
                contentsource: ['id', 'ph'],
                fxclass: 'random',
                displayfreq: 'always',
                onddexitpop: function($popup) {
                  $('.lead-pop-exit').click();
                }
              })
            });
          })
        }
        // $('.overlay-trigger-static', context).click(function() {
        //   $('#overlay-content-static').show();
        //   $('#ajax-content-overlay').fadeIn('fast');
        //   $('.overlay-content').hide();

        //   var target = $(this).attr('data');
        //   var style = $(this).data('style');
        //   $('.static-content').hide();
        //   $(target + '.static-content').show();
        //   if (style !== undefined) {
        //     $('#overlay-content-static').removeClass();
        //     $('#overlay-content-static').addClass(style);
        //   } else {
        //     $('#overlay-content-static').removeClass();
        //   }
        //   $('#' + target).addClass('static-content');
        //   $('#' + target).detach().appendTo('#ajax-content-overlay #overlay-content-static');
        //   $('#' + target).show();
        //   return false;
        // });



        // Property image delete confirm open/close
        $('.prop-image-delete', context).unbind().click(function() {
          var wrapper = $(this).parent().find('.prop-image-delete-confirm-wrapper');
          $('.prop-image-delete-confirm-wrapper').not(wrapper).slideUp();
          $('.prop-image-download-select-wrapper').slideUp();
          wrapper.slideToggle();
        });

        $('.prop-image-delete-cancel', context).click(function() {
          $(this).parent().slideUp();
        });

        // Property image download.
        $('.prop-image-download', context).unbind().click(function() {
          var wrapper = $(this).parent().find('.prop-image-download-select-wrapper');
          $('.prop-image-download-select-wrapper').not(wrapper).slideUp();
          $('.prop-image-delete-confirm-wrapper').slideUp();
          wrapper.slideToggle();
        });

        // Send An Invite form.

        // Modal email link
        // $('.overlay-content .send-invite-email', context).click(function() {
        //   $('.overlay-content #send-invite-links').addClass('hidden');
        //   $('.overlay-content #rela-referrals-send-email-invite').removeClass('hidden');
        // });

        $('.overlay-content .send-invite-back, .overlay-close', context).click(function() {
          $('.overlay-content #send-invite-links').removeClass('hidden');
          $('.overlay-content #rela-referrals-send-email-invite').addClass('hidden');
          $('.alert-block').remove();
        });

        $('.status-switch', context).click(function() {
          if ($(this).hasClass('open')) {
            $('.switch-link').slideUp();
            $(this).removeClass('open');
            $('.switch-icon').removeClass('fa-rotate-180');
          } else {
            $('.switch-link').slideDown();
            $(this).addClass('open');
            $('.switch-icon').addClass('fa-rotate-180');
          }
        });


        $("#dashboard-left-nav", context).hoverIntent({
          over: expandMenu,
          out: collapseMenu,
          // selector: 'div'
        });

        function expandMenu() {
          $("#dashboard-left-nav").addClass('expanded');

        }

        function collapseMenu() {
          $("#dashboard-left-nav").removeClass('expanded');
          $('#dashboard-left-nav .dropup').removeClass('open');

        }

        $.fn.fakeSaveTriggered = function() {
          $('.fake-save').clearQueue();
          var btnText = 'Save';
          //console.log(btnText);
          $('.fake-save').html(btnText + ' <span class="fa fa-refresh fa-spin"></span>');
          setTimeout(function() {
            $('.fake-save').html('Saved <span class="fa fa-check"></span>');
          }, 1000);
          setTimeout(function() {
            if ($('.fake-save').hasClass('no-text')) {
              btnText = '';
            }
            $('.fake-save').text(btnText);
          }, 3000);

          $('#property-edit-messages .pane-content').html('Property Saved!');
          $('#property-edit-messages')
            .delay(500).addClass('animated').removeClass('slideOutUp').addClass('slideInDown').show()
          setTimeout(function() {
            $('#property-edit-messages').removeClass('slideInDown').addClass('slideOutUp');
          }, 2000);

          var pid = $(this).attr('data-pid') || 0;
          if (pid > 0) {
            $.post('/relajax/nojs/property/' + pid + '/clearcache');
          }
        };

        $('.fake-save-disabled', context).click(function() {
          $(this).html('Save <span class="fa fa-refresh fa-spin"></span>').fakeSaveTriggered();
        });

        $('.fake-save-enabled', context).click(function() {
          $(this).html('Save <span class="fa fa-refresh fa-spin"></span>')

          var $formBtn = $('.form-actions .form-submit');

          if ($formBtn.length) {
            $('.form-actions .form-submit').click();
            $('.form-actions .form-submit').mousedown();
          }
          else {
            $(this).fakeSaveTriggered();
          }

          return false;
        });

        if ($.isFunction($.fn.perfectScrollbar)) {
          $("#property-list-scroll").perfectScrollbar();
          $('.property-template-focal .field-name-field-property-description .field-item').perfectScrollbar({
            //wheelPropagation: true
          });
        }

        $('.flag-admin-message-mark-as-read a').each(function() {
          if ($(this).hasClass('unflag-action')) {
            $(this).parent().parent().parent().addClass('message-read');
            $(this).parent().parent().parent().removeClass('message-unread');
          } else {
            $(this).parent().parent().parent().addClass('message-unread');
            $(this).parent().parent().parent().removeClass('message-read');
          }
        });

        $('.animate-bg-x').animate({
          'background-position-x': '100%',
        }, 10000, 'linear', function() {
          $(this).animate({
            'background-position-x': '0%',
          }, 100000, 'linear');
        });

        $('.exit-cta').on('click', function() {
          $('#exit_intent_lead_node_form_wrapper').animateCss('fadeInUp', function() {
            $('#exit_intent_lead_node_form_wrapper').addClass('active');
        })
      });

      } // End Attach Behaves
  }; //End Function

  Drupal.behaviors.relaFlyerDownload = {
    attach: function(context, settings) {
      if ($('.prompt-claim').length) {
        $('body').once('prompt-claim', function() {
          setTimeout(function() {
            $('.prompt-claim').trigger('click');
          }, 5000);
        });
      }
    }
  }

  Drupal.behaviors.liveImageStyleRefresh = {
    attach: function(context, settings) {

      if (settings.relaDemo !== undefined) {

        $('.live-image-refresh img').once('image-refresh', function() {
          var imagePath = $(this).attr('src');
          $(this).attr('src', imagePath + '?' + settings.relaDemo.refreshStyle);

        })

      }
    }
  }

  /**
   * Default text for textfields.
   * @type {Object}
   */
  Drupal.behaviors.defaultFormText = {
    attach: function(context, settings) {

        var inputs = $('.clear-text:not(.processed)');

        // Store the orginal values
        inputs.each(function() {
          $this = $(this);
          $this.data('default', $this.val());
        }).addClass('processed grey-text');

        inputs
          .focus(function() {
            $this = $(this);
            if ($this.val() == $this.data('default')) {
              $this.val('');
              $this.removeClass('grey-text');
            }
          })
          .blur(function() {
            $this = $(this);
            if ($this.val() == '') {
              $this.val($this.data('default'));
              $this.addClass('grey-text');
            }
          });

        // Add a pseudo checkbox.
        var checkIcon = '<img width="13" height="13" src="/sites/all/themes/relaz/images/svg/checkmark_white.svg">';
        $('.pseudo-checkbox').each(function() {
          $realCheckbox = $(this);
          if ($realCheckbox.next('.pseudo-checkbox-input').length == 0) {

            $pseudoCheckbox = $('<div class="pseudo-checkbox-input"><span class="pseudo-checkbox-check">' + checkIcon + '</span></div>');
            $pseudoCheckbox.attr('style', $realCheckbox.attr('style'));
            $pseudoCheckbox.css('color', getTextColor($realCheckbox));

            if ($realCheckbox.attr('checked') == 'checked') {
              $pseudoCheckbox.addClass('checked');
            }
            else {
              $pseudoCheckbox.removeClass('checked');
            }
            $realCheckbox.after($pseudoCheckbox);
          }
        });

        $('.pseudo-checkbox-input').once().click(function() {
          $(this).prev('.pseudo-checkbox').click();
        });

        $('.pseudo-checkbox').once().click(function() {
          $(this).next('.pseudo-checkbox-input').toggleClass('checked');
        });

      } // End Attach Behaves
  }; //End Function

  /**
   * Waypoints
   */
  Drupal.behaviors.Waypoints = {
    attach: function(context, settings) {

        // Add this class to a div in the template to trigger the waypoint.
        var waypointTrigger = $('.waypoint-trigger');
        var waypointOffset = 0;
        if ($(waypointTrigger).attr('waypoint-offset')) {

          waypointOffset = $(waypointTrigger).attr('waypoint-offset');
        }
        var waypoints = $(waypointTrigger, context).waypoint(function(direction) {
          if (direction == 'down') {
            $('#sticky-menu').addClass('stuck');
            $('body').addClass('scrolled');
          }
        }, {
          offset: waypointOffset
        })

        var waypointOffsetUp = 100;
        if ($(waypointTrigger).attr('waypoint-offset-up')) {
          waypointOffsetUp = $(waypointTrigger).attr('waypoint-offset-up');
        }
        $(waypointTrigger, context).waypoint(function(direction) {
          if (direction == 'up') {
            $('#sticky-menu').removeClass('stuck');
            $('body').removeClass('scrolled');
          }
        }, {
          offset: waypointOffsetUp
        });

        var waySpy = $('.spy-nav', context).waypoint(function(direction) {
          if (direction == 'down') {

            var spyID = this.element.id;
            $('.region-content .active-spy').removeClass('active-spy');
            $('a[href="#' + spyID + '"]').addClass('active-spy');
          }
        }, {
          offset: '25%'
        })

        var waySpy = $('.spy-nav', context).waypoint(function(direction) {
          if (direction == 'up') {

            var spyID = this.element.id;
            $('.region-content .active-spy').removeClass('active-spy');
            $('a[href="#' + spyID + '"]').addClass('active-spy');
          }
        }, {
          offset: '-25%'
        })


        var navHeight = $('#navbar').outerHeight(true)
        var wizardWaypoints = $('#wizard-steps-pane', context).waypoint(function(direction) {

          if (direction == 'down') {
            var offset1 = $('#wizard-steps-pane').outerHeight(true)
            $('#wizard-steps-pane').addClass('affix');
            var marginTop = $('#wizard-steps-pane').outerHeight(true) + $('#wizard-top-submit-pane').outerHeight(true);
            $('#wizard-top-submit-pane').addClass('affix').css('top', offset1 - 15);
            $('body').css('margin-top', marginTop);
            $('body').addClass('wizard-scrolled')
          }
        }, {
          offset: 0
        });

        $('#wizard-steps-pane', context).waypoint(function(direction) {
          if (direction == 'up') {
            $('#wizard-steps-pane').removeClass('affix');
            $('#wizard-top-submit-pane').removeClass('affix');
            $('body').css('margin-top', 0);
            $('body').removeClass('wizard-scrolled')
          }
        }, {
          offset: 0
        });

        $('#navbar.navbar-fixed-top', context).affix({
          offset: {
            top: 80
              //bottom: -80
          }

        });


        // $('#wizard-steps-pane', context).affix({
        //   offset: {
        //     top: function() {

        //       return (this.top = $('#navbar').outerHeight(true))
        //     }
        //   }
        // });

        // $('#wizard-top-submit-pane', context).affix({
        //   offset: {
        //     top: function() {
        //       var topPos = $('#wizard-steps-pane').outerHeight(true);
        //       $('#wizard-top-submit-pane').css("top", topPos);
        //       $('body').addClass("wizard-scrolled");
        //       console.log(topPos);
        //       return (this.top = $('#navbar').outerHeight(true))
        //     }
        //   }
        // });


        //}// End check waypoint function
      } // End Attach Behaves
  }; //End Function

  Drupal.behaviors.LinkScroll = {
    attach: function(context, settings) {

      $('.sticky-link a', context).click(function() {
        var sectionId = $(this).attr('href');
        var menuHeight = $('#navbar').height()
        var scrollOffset = 0;

        if ($(this).attr('data-scroll-to')) {
          sectionId = $(this).attr('data-scroll-to')
        }

        if ($(this).attr('data-scroll-offset')) {
          scrollOffset = $(this).attr('data-scroll-offset');
        }
        if ($(sectionId).attr('data-scroll-offset')) {
          scrollOffset = $(sectionId).attr('data-scroll-offset');
        }
        if ($(sectionId).length) {
          $('.sticky-link a.active').removeClass('active');
          $(this).addClass('active');
          $('html, body').animate({
            scrollTop: $(sectionId).offset().top - menuHeight - scrollOffset
          }, 1000);
        }
        if ($('.navbar-collapse').hasClass('in')) {
          $('.navbar-collapse').removeClass('in');
        }
        return false;
      });
    }
  }; // End Function

  /**
   * Custom tabs for the dashboard. This can be used globally as well.
   */
  Drupal.behaviors.TabContent = {
    attach: function(context, settings) {

        if ($('.tabs-wrapper', context).not('.static').length > 0) {
          $('.tabs-wrapper').not('.static').each(function() {
            var tabsWrapper = $(this);
            var tabsContentWrapper = $(tabsWrapper).next('.tab-content-wrapper');

            $(tabsWrapper).find('.tab a').click(function() {
              $(tabsWrapper).find('.active-tab').removeClass('active-tab');
              $(tabsWrapper).find('.active-tab-parent').removeClass('active-tab-parent');
              $(this).addClass('active-tab');
              $(this).parent().addClass('active-tab-parent');
              $(tabsContentWrapper).children('.tab-content-active').removeClass('tab-content-active').hide();
              var tabContentHref = $(this).attr('href').split('#');
              var tabContentID = '#' + tabContentHref[1];
              //#tab-x-content
              $(tabContentID).fadeIn().addClass('tab-content-active');
              var resizeEvent = new Event('resize');

              window.dispatchEvent(resizeEvent);
              return false;
            });

            var firstTab = $(tabsWrapper).find('.tab:first a');
            var firstTabID = firstTab.attr('href');

            // This fixes ajax reloads from grabbing the first tab again.
            $(tabsWrapper).find('.tab a').each(function() {
              if ($(this).hasClass('active-tab')) {
                firstTab = $(this);
              }
            });

            // You can set the active tab via php if you send in drupal settings.
            // Helpful for form submits and shit.
            if (Drupal.settings.relaTabs !== undefined) {
              firstTabID = Drupal.settings.relaTabs.activeTab;
              firstTab = $(tabsWrapper).find('.tab a[href="' + firstTabID + '"]');
              firstTab.click();
              Drupal.settings.relaTabs = undefined;
            }

            // if ?active_tab=xxxx is a query in the url.
            var active_tab_query = getUrlParameter('active_tab') || '';
            if (active_tab_query) {

              $('body').once('active_tab_in_url', function() {
                // get rid of the param so a reload doesnt fire it again.
                // This will also remove it from history so they can go back to the
                // original tab @see https://stackoverflow.com/a/22753103

                var newURL = location.href.split("?")[0];
                window.history.replaceState('object', document.title, newURL);
                firstTabID = '#' + active_tab_query;
                firstTab = $(tabsWrapper).find('.tab a[href="' + firstTabID + '"]');
              });
            }

            $(firstTab, context).parent().addClass('active-tab-parent');
            $(firstTab, context).addClass('active-tab');
            $(tabsContentWrapper).children('.tab-content').hide();
            // Make sure this isn't a link
            if (firstTabID[0] != '/') {
              $(firstTabID, context).addClass('tab-content-active');
            }
          });
        }

        // WL Onboard Sidebar.
        if (Drupal.settings.wlOnboardStatus !== undefined) {
          if ($('#wl-show-onboard-link').length) {
            setTimeout(function() {
              $('#wl-show-onboard-link', context).click();
            }, 1000);

          }
        }

      } // End Attach Behaves
  }; //End Function

  Drupal.behaviors.TogglePricing = {
    attach: function(context, settings) {
      $('.toggle-yearly', context).click(function() {
        $('.price-toggle-wrapper').removeClass('prices-show-monthly');
        $('.price-toggle-wrapper').addClass('prices-show-yearly');
        return false;
      });

      $('.toggle-monthly', context).click(function() {
        $('.price-toggle-wrapper').removeClass('prices-show-yearly');
        $('.price-toggle-wrapper').addClass('prices-show-monthly');
        return false;
      });

      $('.price-toggle a', context).click(function() {
        $('.price-toggle-wrapper .active-toggle').removeClass('active-toggle');
        $('.price-toggle-wrapper .active-toggle-parent').removeClass('active-toggle-parent');
        $(this).addClass('active-toggle');
        $(this).parent().addClass('active-toggle-parent');
        return false;
      });

      $('.product-frequency-switch a').click(function() {
        $('.product-frequency-switch a.active').removeClass('active');
        $(this).addClass('active');
        var activeFreq = $(this).attr('data-toggle-group')
        $('.show').removeClass('show');
        $('.' + activeFreq).addClass('show');
        return false;

      });

      // Pricing quick pick.
      $('.product-frequency-switch a.active').each(function() {
        var activeFreq = $(this).attr('data-toggle-group')
        $('.' + activeFreq).addClass('show');
      });

    }
  }

  Drupal.behaviors.ToggleGroups = {
    attach: function(context, settings) {
      $('.toggle-trigger').unbind('click');
      $('.toggle-trigger').click(function() {
        if ($(this).hasClass('toggle-on')) {
          // Remove everything with toggle-on class.
          $('.toggle-on').removeClass('toggle-on');
        } else {
          // Remove everything with toggle-on class.
          $('.toggle-on').removeClass('toggle-on');

          // Toggle class toggle-on for this trigger.
          $(this).toggleClass('toggle-on');

          // Add toggle-on class to extra element.
          if ($(this).attr('data-target').length) {
            var target = $(this).attr('data-target');
            $(target).addClass('toggle-on');
          }
        }

      });

      $('.toggle-first', context).find('.toggler:first').addClass('active');

      $('.toggler', context).click(function() {
        var showToggle = $(this).attr('id') + '-toggled';
        if ($(this).hasClass('toggler-single')) {
          $(this).removeClass('active');
        }
        else {
          $('.toggler.active').removeClass('active');
        }

        $('.toggled.toggled-active').removeClass('toggled-active');
        $(this).addClass('active');

        $('#' + showToggle + '.toggled').addClass('toggled-active');
      });
    }
  }

  Drupal.behaviors.DropdownToggle = {
    attach: function(context, settings) {
      $('.dropdown-link-wrapper .dropdown-link-title-wrapper', context).on('click', function() {
        if ($(this).parent().hasClass('collapsed')) {
          $('body').find('.dropdown-link-wrapper.open .dropdown-link-title-wrapper').each(function() {
            dropdown_close($(this))
          });
          dropdown_open($(this));
        } else {
          dropdown_close($(this));
        }
      });

      function dropdown_open(drop_item) {
        // $(drop_item).parent().find('.dropdown-link-content-wrapper').slideDown();
        $(drop_item).parent().removeClass('collapsed');
        $(drop_item).parent().addClass('open');
        $(drop_item).find('.fa-chevron-down').addClass('fa-rotate-180');
      }

      function dropdown_close(drop_item) {
        // $(drop_item).parent().find('.dropdown-link-content-wrapper').slideUp('fast');
        $(drop_item).parent().removeClass('open');
        $(drop_item).parent().addClass('collapsed');
        $(drop_item).find('.fa-chevron-down').removeClass('fa-rotate-180');
      }

      // Show-hide toggler.
      $('.show-hide-toggle-trigger').click(function(e) {
        e.stopImmediatePropagation();
        if ($(this).hasClass('showing')) {
          $(this).next('.show-hide-toggle-content').slideUp();
        } else {
          $(this).next('.show-hide-toggle-content').slideDown();
        }

        $(this).toggleClass('showing');
        $(this).parent().toggleClass('showing');
      });
    }
  }

  Drupal.behaviors.LiveSearch = {
    attach: function(context, settings) {
      $('#property-search', context).keyup(function() {
        var filter = $(this).val();
        $('.search-icon-default').hide();
        $(".property-list-row").each(function() {
          if ($(this).text().search(new RegExp(filter, "i")) < 0) {
            $(this).fadeOut();
          } else {
            $(this).show();
          }
        })
      });

      $('.search-icon-clear', context).click(function() {
        $('#property-search').val('');
        $('.search-icon-default').show();
        $(".property-list-row").each(function() {
          $(this).show();
        });
      });

      $('.prefill-btn', context).click(function() {

        var prefillText = $(this).data('prefill-text');

        // If the button option is already clicked then clear the filter.
        if ($('#property-search').val() == prefillText) {
          $('#property-search').val("");
          $('.search-icon-default').show();
          $(".property-list-row").each(function() {
            $(this).show();
          });
        } else {
          $('#property-search').val(prefillText);
          $('.search-icon-default').hide();
          $(".property-list-row").each(function() {
            if ($(this).text().search(new RegExp(prefillText, "i")) < 0) {
              $(this).fadeOut();
            } else {
              $(this).show();
            }
          })
        }
      });
    }
  }

  Drupal.behaviors.Leadfilter = {
    attach: function(context, settings) {
      var noResults = function() {
        if ($('.view-display-id-block_property_leads .view-content', context).children(':visible').length == 0) {

          $('.view-display-id-block_property_leads .view-footer').show();
        } else {
          $('.view-display-id-block_property_leads .view-footer').hide();
        }
      }

      $("[id^='edit-ratings-']", context).change(function() {

        var countChecked = $("[id^='edit-ratings-']").filter(":checked").length;

        if (countChecked == 0) {
          $('.views-row-lead').show();
          noResults();
        } else {

          $('.views-row-lead').hide();
          $("[id^='edit-ratings-']:checked", context).each(function() {
            var filterVal = $(this).attr('value');
            console.log(filterVal);
            $('.rating-' + filterVal).show();
          });
          noResults();
        }
      });

    }
  }

  Drupal.behaviors.LeadToggle = {
    attach: function(context, settings) {
      $('.lead-toggle', context).click(function() {
        var leadID = $(this).attr('id') + '-content';
        var rowID = $(this).attr('id') + '-row';

        if ($('.' + leadID).hasClass('lead-toggle-content-open')) {
          $('.' + leadID).slideUp(function() {
            $('.' + leadID).removeClass('lead-toggle-content-open');
            $('.' + leadID).addClass('lead-toggle-content-closed');
            $('.' + rowID).removeClass('views-row-lead-open');
          });
        }

        if ($('.' + leadID).hasClass('lead-toggle-content-closed')) {
          $('.' + rowID).addClass('views-row-lead-open');
          $('.' + leadID).slideDown(function() {
            $('.' + leadID).removeClass('lead-toggle-content-closed');
            $('.' + leadID).addClass('lead-toggle-content-open');
          });
        }

      });
    }
  }

  Drupal.behaviors.RelazProviders = {
    attach: function(context, settings) {

      $('.field-name-field-agency-whitelabel-domain input').keyup(function() {
        $('.edit-wl-domain').text($(this).val());
      });

      $('.whitelabel-modal-trigger', context).click(function() {
        $('#whitelabel-modal').fadeIn('slow');
        $('body').addClass('overlay-open');
      })

      $('.whitelabel-modal-close', context).click(function() {
        $('#whitelabel-modal').fadeOut('slow');
        $('#whitelabel-modal').html('');
        $('body').removeClass('overlay-open');
      })
    }
  }

    Drupal.behaviors.RelazPhotoProcessing = {
    attach: function(context, settings) {

      $('.status-check-link', context).each(function() {
        var $this = $(this);
        var delay = $this.data('delay');
        var count = $this.data('count');

        // Click this once to get it going, then the delay will
        // click on the interval up to the count limit.
        $this.click();
        $progressBar = $('.progress-bar');
        if (!$progressBar.length) {
          var noBarInterval = setInterval(function () {
            if (count > 0) {
             $this.click();
             //console.log(count);
            }
            else {
              clearInterval(noBarInterval);
              //console.log('done');
            }


             count--;
          }, delay);
        }
        else {

          //return
          var progress = parseInt($progressBar.prop('style')['width']);
          var increase = 100 / (count) + 3;
          var interval = setInterval(function () {
            if (!$progressBar.length) {
              clearInterval(interval);
            }

            if (count > 0) {
              $this.click();
              //console.log(count);
            }
            else {
              clearInterval(interval);
              //console.log('done');
            }
            count--;

            }, delay);
          }

      });
   }
  }

  Drupal.behaviors.EditableAutoSave = {
    attach: function(context, settings) {

      // $('.property-photo-manage-grid .editablefield-item').blur(function(){
      //   var id = $(this + 'textarea').attr('id');
      //   var idParts = id.split("-");
      //   //edit-field-property-image-description-1-field-property-image-description-und-0-value
      //   $('#edit-field-property-image-description-' + idParts[5] + '-actions-submit').click();
      //   console.log(idParts[5]);
      // });
    }
  }


  // Drupal.behaviors.RelaYoutubeModal = {
  //   attach: function(context, settings) {
  //     var uploadingCookie = $.cookie('ytInProgress', true);
  //     if (uploadingCookie == true) {
  //       console.log('hhhhaie')
  //     }
  //   }
  // }

  Drupal.behaviors.AutoFileUpload = {
    attach: function(context, settings) {
      $('form').delegate('input.form-file', 'change', function() {
        var target = $(this).next('button[type="submit"]');
        target.mousedown();
      });

    }
  }

  Drupal.behaviors.radioActive = {
    attach: function(context, settings) {

      $('.form-type-radio input', context).each(function() {
        if ($(this).is(':checked')) {
          $(this).parent().addClass('radio-active');
        }
      });

      $('.form-type-radio input', context).click(function() {
        $(this).closest('.form-radios').find('.form-type-radio.radio-active').removeClass('radio-active');
        $(this).parent().addClass('radio-active');
      });

    }
  }

  Drupal.behaviors.scheduleBooking = {
    attach: function(context, settings) {

      $.each($('#rela_property_book_showing_form-wrapper .alert-messages-wrapper'), function() {
        $('.initial-wrapper').removeClass('active');
        $('.finish-wrapper').addClass('active');
      });

      $('#rela_property_book_showing_form-wrapper .btn-showing-next').unbind('click');
      $('#rela_property_book_showing_form-wrapper .btn-showing-next').click(function() {
        $initWrapper = $(this).closest('.initial-wrapper');
        $finishWrapper = $initWrapper.next('.finish-wrapper');

        $inputs = $initWrapper.find('.radio-active');
        if ($inputs.length == 3) {
          var displayDate = $.datepicker.formatDate('DD, MM d, yy', new Date($('.form-item-appointment-date .radio-active input').val()));
          $(this).datepicker('destroy');

          $('#rela_property_book_showing_form-wrapper .date-info').remove();
          var dateInfo = '<div class="date-info text-center">' +
          '<div class="date-type text-capitalize">' + $('.form-item-appointment-type .radio-active label').text() + '</div>' +
          '<div class="date-date h4">' + displayDate + '</div>' +
          '<div class="date-time h5">' + $('.form-item-preferred-time .radio-active label').text() + '</div>' +
          '</div>';
          $finishWrapper.remove('.date-info');
          $finishWrapper.prepend(dateInfo);

          $initWrapper.removeClass('active');
          $finishWrapper.addClass('active');
          $('.book-showing-back').show();
        }
        else {
          $('#booking-request-error').text('Please choose an Appointment Type, Date, and Preferred Time');
        }
      });

      $('.book-showing-back').unbind('click');
      $('.book-showing-back').click(function() {
        $('#booking-request-error').text('');
        $(this).hide();
        $('.finish-wrapper').removeClass('active');
        $('.initial-wrapper').addClass('active');
        $('#rela_property_book_showing_form-wrapper .btn-showing-next').show();
      });

    }
  }

  Drupal.behaviors.Owlz = {
    attach: function(context, settings) {
      $('.form-item-appointment-date .form-radios').owlCarousel({
        items: 3,
        nav: true,
        navText: ['<div class="fa fa-angle-left"></div>','<div class="fa fa-angle-right"></div>']
        // nestedItemSelector: 'form-type-radio',
      });

      if ($(".view-owl-pricing-table").length > 0) {
        var owl = $(".view-owl-pricing-table .view-content", context).owlCarousel({
          loop: false,

          navText: ['<span class="fa fa-chevron-left"></span>', '<span class="fa fa-chevron-right"></span>'],
          pagination: false,

          responsive: {
            // breakpoint from 0 up
            0: {
              items: 1,
              stagePadding: 0,
              loop: true,
              nav: true,
              center: true,
              touchDrag: true,
              mouseDrag: true
            },
            // breakpoint from 480 up
            480: {
              items: 1,
              loop: true,
              nav: true,
              center: true,
              stagePadding: 0,
              touchDrag: true,
              mouseDrag: true

            },
            // breakpoint from 768 up
            768: {
              items: 3,
              stagePadding: 0,
              //touchDrag: false,
              mouseDrag: false
            }
          }
        });
      }
    }
  }

  Drupal.behaviors.OwlzPropertyGallery = {
    attach: function(context, settings) {
      if ($(".property-gallery--owl-full").length > 0) {
        var owl = $(".property-gallery--owl-full .view-content", context).owlCarousel({
          loop: false,
          items: 1,
          nav: true,
          margin: 0,
          navText: ['<span class="icon icon-arrow-67"></span>', '<span class="icon icon-arrow-68"></span>'],
          pagination: false,
          video: true

        });
      }
    }
  }

  Drupal.behaviors.OwlzVideoGallery = {
    attach: function(context, settings) {
      if ($(".video-gallery-tabbed").length > 0) {
        var owl = $('.video-gallery-tabbed .view-content', context).owlCarousel({
          // loop: true,
          items: 1,
          thumbs: true,
          // thumbsPrerendered: true,
          thumbContainerClass: 'owl-thumbs',
          thumbItemClass: 'owl-thumb-item'
        });
      }
    }
  }

  Drupal.behaviors.DashmenuToggle = {
    attach: function(context, settings) {

      // $('.dashmenu-toggle').sidr({
      //   name: 'sidr-left',
      //   source: '#dashboard-left-nav'
      // });

      $('.dashmenu-toggle', context).click(function() {
        if ($('body').hasClass('sidemenu-open')) {
          $('body').removeClass('sidemenu-open');
        } else {
          $('body').addClass('sidemenu-open');
        }
      });

      if (typeof breaky !== 'undefined') {
        breaky.at("md", function() {
          $('body').removeClass('sidemenu-open');

        })

        breaky.above("md", function() {

          $('body').addClass('sidemenu-open');
        })

        breaky.at("xs", function() {

          $('body').removeClass('sidemenu-open');
        })
      }

      // var open = false;
      // var duration = 400;

      // // if(settings.DashmenuToggle === undefined){
      // //   // Do nothing.
      // //   console.log('pong');
      // // }
      // // else {
      // //   // this is reset when a user taps a property link from the sidebar menu.
      // //   // rela_property_manage_load_property();
      // //   open = settings.DashmenuToggle.sideBarOpen;

      // // }

      //   $('.pane-dashboard-main-content', context).click(function(){
      //     if ($('body').hasClass('fuck')) {
      //       if(open == true){
      //        closeMenu();
      //       }
      //     }

      //   });

      //   $('.dashmenu-toggle', context).click(function(){
      //     if ($('body').hasClass('fuck')) {
      //      if (open == false ) {
      //         openMenu();
      //       }
      //     }

      //   });

      // breaky.below("xs", function(){
      //   closeMenu();
      //   $('body').addClass('fuck');
      // });
      // breaky.at("sm", function(e){
      //   $('body').removeClass('fuck');
      //   openMenu();

      // });

      // function openMenu() {
      //   $('#dashboard-left-nav').animate({"left": "0px"}, 100, function(){open = true });
      //   $('#dashboard-left-submenu').animate({"left": "0px"}, duration, function(){/*Animation complete */  });
      // }

      // function closeMenu() {
      //   $('#dashboard-left-nav').animate({"left": "-255px"}, 100, function(){open = false  });
      //   $('#dashboard-left-submenu').animate({"left": "-300px"}, duration, function(){ /*Animation complete */ });
      // }
    }

  }

  Drupal.behaviors.LogoResizer = {
    attach: function(context, settings) {
      //var logo = $('.field-name-field-property-logo-reference img');
      // $(logo).resizable({
      //   maxHeight: 195,
      //   maxWidth: 350,
      //   minHeight:50,
      //   minWidth: 50,
      //   aspectRatio: true,
      //   stop: function(event, ui) {
      //     console.log(ui.size.height);
      //     console.log(ui.size.width);
      //   }
      // });
      // $(logo).draggable({
      //   containment: ".field-name-field-property-logo-reference",
      //   stop: function( event, ui ) {
      //      console.log(ui.position.left);
      //      console.log(ui.position.top);
      //   }
      // });

    }
  }

  Drupal.behaviors.FlyerLogoResizer = {
    attach: function(context, settings) {

      $('.flyer-scale-wrapper', context).each(function() {
        setTimeout(function() {
          $('body').addClass('flyer-scale-wrapper-loaded');
        }, 700);

      });



      var nid = "";
      var pid = "";
      var coordsHWTL = [];
      var logoImg = $('.demo-logo img');
      var container = $('.logo-wrapper');

      var maxImgW = 395;
      var maxImgH = 130;
      var zoomScale = 1;
      var containerArray = [];




      function getLogoBounds() {
        maxImgH = $('.logo-wrapper').css("height");
        maxImgW = $('.logo-wrapper').css("width");
      };

      function getZoomScale() {
        var obj = $('.flyer-scale-wrapper-loaded .flyer-scale-wrapper');
        var transformMatrix = obj.css("-webkit-transform") ||
          obj.css("-moz-transform") ||
          obj.css("-ms-transform") ||
          obj.css("-o-transform") ||
          obj.css("transform");
        var matrix = transformMatrix.replace(/[^0-9\-.,]/g, '').split(',');
        if (matrix[0] == matrix[3] && matrix[0] != 0) {
          zoomScale = matrix[0];
        };
      };



      // Ajax call after resize or drag has stopped to save coords into database
      // order of xy === hw, xy === tl
      function saveCoords(x, y, type) {
        x = x || 0;
        y = y || 0;
        if (type === "hw") {
          coordsHWTL[0] = Math.floor(x);
          coordsHWTL[1] = Math.floor(y);
        };
        if (type === "tl") {
          coordsHWTL[2] = Math.floor(x);
          coordsHWTL[3] = Math.floor(y);
        };
        var url = '/relajax/nojs/marketing/logo-pos/' + pid + '/' + nid;
        $.ajax({
          url: url,
          type: "POST",
          data: {
            coords: coordsHWTL
          }
        });
      };


      // Options for the resizable initialization includes autosave
      var resizeOpt = {
        containment: ".logo-wrapper",
        grid: [2, 1],
        maxHeight: maxImgH,
        maxWidth: maxImgW,
        minHeight: 25,
        minWidth: 25,
        aspectRatio: true,
        stop: function(event, ui) {
          $h = ui.size.height;
          $w = ui.size.width;
          if (zoomScale != 1) {
            $h *= zoomScale;
            $w *= zoomScale;
          }
          if (typeof saveTime !== "undefined") {
            clearTimeout(saveTime);
          };
          saveTime = setTimeout(saveCoords($h, $w, "hw"), 2000);

        },
        resize: function(event, ui) {
          if (zoomScale != 1) {
            var changeWidth = ui.size.width - ui.originalSize.width;
            var newWidth = (ui.originalSize.width + changeWidth) / zoomScale;

            var changeHeight = ui.size.height - ui.originalSize.height;
            var newHeight = (ui.originalSize.height + changeHeight) / zoomScale;

            ui.size.width = newWidth;
            ui.size.height = newHeight;
          }
        },
      };

      // Options for the draggable initialization
      var dragOpt = {
        containment: ".logo-wrapper",
        stop: function(event, ui) {
          $t = ui.position.top / zoomScale;
          $l = ui.position.left / zoomScale;
          if ($t < 0) {
            $t = 0;
          }
          if ($l < 0) {
            $l = 0;
          }
          if (zoomScale != 1) {
            $t *= zoomScale;
            $l *= zoomScale;
          }
          if (typeof saveTime !== "undefined") {
            clearTimeout(saveTime);
          };
          saveTime = setTimeout(saveCoords($t, $l, "tl"), 2000);
        },
        drag: function(event, ui) {
          if (zoomScale != 1) {
            var contWidth = container.width(),
              contHeight = container.height();
            ui.position.left = Math.max(0, Math.min(ui.position.left / zoomScale, contWidth - ui.helper.width()));
            ui.position.top = Math.max(0, Math.min(ui.position.top / zoomScale, contHeight - ui.helper.height()));
          }
        },
      };


      $('#image-adjust', context).click(function() {

        if (!$('body').hasClass("image-editor")) {
          $('body').toggleClass('image-editor');
        };

        getLogoBounds();
        getZoomScale();


        nid = $(this).attr("data-nid");
        pid = $(this).attr("data-pid");

        // Initializes Resizable and Draggable in one go
        $(logoImg).resizable(resizeOpt)
          .parent('.ui-wrapper')
          .draggable(dragOpt);

        // Saves coords to array after converting them into integers
        var coordsDict = $('.demo-logo .ui-wrapper').css(["height", "width", "top", "left"]);
        coordsHWTL = Object.keys(coordsDict).map(function(key) {
          return parseInt(coordsDict[key]);
        });
      });


      $('#image-save', context).click(function() {
        $(logoImg).resizable("destroy").parent('.ui-wrapper').draggable("destroy");
        $('body').toggleClass('image-editor');
      });

      $.fn.resetForAjax = function() {
        if ($('body').hasClass("image-editor")) {
          $(logoImg).resizable("destroy").parent('.ui-wrapper').draggable("destroy");
          $('body').toggleClass('image-editor');
        };
      };

    }
  }

  Drupal.behaviors.contactCardForm = {
    attach: function(context, settings) {
      $('.field-name-field-user-headshot .droppable-browse-button').text('Add Photo');
      $('.rela-contact-form__social-remove', context).once('rela-contact-social-remove').on('click', function(e) {
        e.preventDefault();
        var $trigger = $(this).closest('.rela-contact-form__social-actions').find('.rela-contact-form__social-remove-trigger input, .rela-contact-form__social-remove-trigger button').first();
        if ($trigger.length) {
          $trigger.trigger('mousedown');
        }
      });
      $('.rela-contact-form__social-add', context).once('rela-contact-social-add').on('click', function(e) {
        if ($(e.target).is('select')) {
          return;
        }
        $(this).find('select.rela-contact-form__social-add-select').first().focus();
      });

      // Office search-select — progressively enhances the hidden checkboxes
      // emitted by rela_white_label_form_rela_agent_card_form_alter() when
      // the brokerage has 10+ offices. Chips render selected offices inline
      // with a search input; the dropdown lists unchecked options. Toggling
      // a chip or option flips the underlying checkbox so submit values
      // stay identical to the small-list checkbox variant.
      $('.rela-contact-form__office--search', context).once('rela-office-search').each(function() {
        var $container = $(this);
        var $checkboxes = $container.find('input[type="checkbox"]');
        if (!$checkboxes.length) return;

        // Build options model from the native checkboxes.
        var options = [];
        $checkboxes.each(function() {
          var $cb = $(this);
          var $label = $('label[for="' + $cb.attr('id') + '"]', $container);
          options.push({
            value: $cb.val(),
            label: $.trim($label.text()) || $cb.val(),
            $cb: $cb
          });
        });

        var $shell = $('<div class="rela-contact-form__office-search"></div>');
        var $row = $('<div class="rela-contact-form__office-search-input-row"></div>');
        var $input = $('<input type="text" class="rela-contact-form__office-search-input" placeholder="Search offices…" autocomplete="off" />');
        var $dropdown = $('<div class="rela-contact-form__office-dropdown" role="listbox"></div>');
        $row.append($input);
        $shell.append($row).append($dropdown);
        $container.append($shell);

        var renderChips = function() {
          $row.find('.rela-contact-form__office-chip').remove();
          var chips = [];
          options.forEach(function(opt) {
            if (!opt.$cb.is(':checked')) return;
            var modCls = opt.value === 'base_location' ? ' rela-contact-form__office-chip--base' : '';
            var $chip = $(
              '<span class="rela-contact-form__office-chip' + modCls + '">' +
                '<span class="rela-contact-form__office-chip-label"></span>' +
                '<button type="button" class="rela-contact-form__office-chip-remove" aria-label="Remove">×</button>' +
              '</span>'
            );
            $chip.find('.rela-contact-form__office-chip-label').text(opt.label);
            $chip.data('office-value', opt.value);
            chips.push($chip);
          });
          // Insert chips before the input.
          $input.before(chips);
        };

        var renderDropdown = function() {
          var query = $.trim($input.val()).toLowerCase();
          $dropdown.empty();
          var matches = options.filter(function(opt) {
            if (opt.$cb.is(':checked')) return false;
            if (!query) return true;
            return opt.label.toLowerCase().indexOf(query) !== -1;
          });
          if (!matches.length) {
            $dropdown.append('<div class="rela-contact-form__office-option rela-contact-form__office-option--empty">No matches</div>');
            return;
          }
          matches.forEach(function(opt) {
            var $opt = $('<div class="rela-contact-form__office-option" role="option"></div>')
              .text(opt.label)
              .attr('data-office-value', opt.value);
            $dropdown.append($opt);
          });
        };

        var openDropdown = function() {
          renderDropdown();
          $dropdown.addClass('is-open');
          $row.addClass('is-open');
        };
        var closeDropdown = function() {
          $dropdown.removeClass('is-open');
          $row.removeClass('is-open');
        };

        // Click on a row that isn't a chip / chip-remove focuses the input.
        $row.on('mousedown', function(e) {
          if ($(e.target).closest('.rela-contact-form__office-chip').length) return;
          if ($(e.target).is($input)) return;
          e.preventDefault();
          $input.focus();
        });

        $input.on('focus', openDropdown);
        $input.on('input', function() {
          if (!$dropdown.hasClass('is-open')) openDropdown();
          else renderDropdown();
        });
        $input.on('keydown', function(e) {
          if (e.key === 'Escape') {
            closeDropdown();
            $input.blur();
          } else if (e.key === 'Backspace' && $input.val() === '') {
            // Remove the last chip on backspace from empty input.
            var checked = options.filter(function(o) { return o.$cb.is(':checked'); });
            if (checked.length) {
              var last = checked[checked.length - 1];
              last.$cb.prop('checked', false).trigger('change');
            }
          }
        });

        $shell.on('click', '.rela-contact-form__office-option', function() {
          var val = $(this).attr('data-office-value');
          var opt = options.filter(function(o) { return o.value === val; })[0];
          if (!opt) return;
          opt.$cb.prop('checked', true).trigger('change');
          $input.val('').focus();
        });

        $shell.on('click', '.rela-contact-form__office-chip-remove', function(e) {
          e.stopPropagation();
          var val = $(this).closest('.rela-contact-form__office-chip').data('office-value');
          var opt = options.filter(function(o) { return o.value === val; })[0];
          if (!opt) return;
          opt.$cb.prop('checked', false).trigger('change');
        });

        $checkboxes.on('change', function() {
          renderChips();
          if ($dropdown.hasClass('is-open')) renderDropdown();
        });

        // Close dropdown when clicking outside the shell.
        $(document).on('mousedown.relaOfficeSearch_' + ($container.attr('id') || ''), function(e) {
          if (!$(e.target).closest($shell).length) closeDropdown();
        });

        renderChips();
      });
    }
  }


  Drupal.behaviors.screenWidth = {
    attach: function(context, settings) {

      if (typeof breaky !== 'undefined') {
        breaky.at("xs", function() {
          removeWidthClasses()
          $('body').addClass('screen-width-xs').trigger('screenXs');
        })

        breaky.at("sm", function() {
          removeWidthClasses()
          $('body').addClass('screen-width-sm').trigger('screenSm');

        })

        breaky.at("md", function() {
          removeWidthClasses()
          $('body').addClass('screen-width-md').trigger('screenMd');
        })
        breaky.at("lg", function() {
          removeWidthClasses()
          $('body').addClass('screen-width-lg').trigger('screenLG');
        })
      }

      function removeWidthClasses() {
        $('body').removeClass(function(index, css) {
          return (css.match(/(^|\s)screen-width-\S+/g) || []).join(' ');
        });
      }
    }
  }

  Drupal.behaviors.relaPhotosGrid = {
    attach: function(context, settings) {

      // Re-number images.
      $('.draggableviews-grid-property_images-sort_block').unbind('sortstop');
      $('.draggableviews-grid-property_images-sort_block').on('sortstop', function(e, ui) {
        $this = $(this);
        if ($this.find('.views-row .views-field-counter')) {
          var count = 0;
          $this.find('.views-row').each(function() {
            count += 1;
            $(this).find('.views-field-counter .field-content').text(count);
          });
        }
      });

      // Favoriting images.
      $('.views-field-field-image-favorite a').unbind('click');
      $('.views-field-field-image-favorite a').on('click', function(e) {
        e.preventDefault();

        var enabled = $(this).hasClass('favorite-1');
        if (enabled) {
          $(this).removeClass('favorite-1').addClass('favorite-0');
        }
        else {
          $(this).removeClass('favorite-0').addClass('favorite-1');
        }

        $.post($(this).attr('href'));
      });
    }
  }

  Drupal.behaviors.relaClipboard = {
    attach: function(context, settings) {

      $('.clip-btn', context).each(function() {
        $(this).tooltip({
          trigger: 'click',
          placement: 'right'
        });

        var clipboard = new Clipboard(this);

        clipboard.on('success', function(e) {
          $(e.trigger).attr('data-original-title', 'Copied!').tooltip('show').attr("disabled", "disabled");

          setTimeout(function() {
            $(e.trigger).tooltip('hide').removeAttr('disabled')
          }, 3000);
        });

        clipboard.on('error', function(e) {
          $(e.trigger).attr('data-original-title', 'Error!').tooltip('show');
          setTimeout(function() {
            $(e.trigger).tooltip('hide').removeAttr('disabled')
          }, 5000);
        });
      })
    }
  }

  // Drupal.behaviors.resizeVideo = {
  //   attach: function(context, settings) {
  //     $('body.property-template-focal', context).once('video-embed', function(){
  //     var playerID = '.player iframe';
  //     var wrapper = '#photos';
  //     function vRescale(){
  //       var w = $(wrapper).width()+200,
  //           h = $(wrapper).height()+200;

  //       if (w/h > 16/9){
  //         $(playerID).width(w).height(w/16*9);
  //         $(playerID).css({'left': '0px'});
  //       }
  //       else {
  //         $(playerID).width(h/9*16).height(h);
  //         $(playerID).css({'left': -($(playerID).outerWidth()-w)/2});
  //       }
  //     } // End viemo rescale
  //     $(window).on('load resize', function(){

  //       vRescale();
  //     });
  //   }); // End once
  //   }
  // }

  Drupal.behaviors.MTOptionToolbarDraggable = {
    attach: function(context, settings) {
      if ($(".mt-option-select-wrapper").length > 0) {
        $('.mt-option-select-wrapper').owlCarousel({
          autoWidth: true,
          items: 1,
          nav: true,
          navText: ['<div class="pe-7s-angle-left"></div>', '<div class="pe-7s-angle-right"></div>'],
        });

      }
    }
  }


  Drupal.behaviors.relaVtourShow = {
    attach: function(context, settings) {

      if ($('.vtour-overlay-trigger').length > 0) {
        $(".vtour-overlay-trigger").click(function() {
          $(this).addClass('vtour-open');
          $vtour = $(this).find('iframe');
          var src = $vtour.attr('src');
          if (~src.indexOf('matterport.com')) {
            $vtour.attr('src', src + '&play=1');
          }
        });
      }

    }
  }

  Drupal.behaviors.propertyContentOverlay = {
    attach: function(context, settings) {
      var content = false;

      $('.property-overlay-link a', context).not('.property-overlay-link-photos a').click(function() {
        $('body').removeClass('show-photos-full-bg');
        if (content && content == $(this).attr('href')) {
          return false;
        }
        content = $(this).attr('href');
        if ($('#property-overlay').hasClass('overlay-in')) {
          $('#property-overlay').animate({
            "top": "100%"
          }, 300, function() {
            $('#property-overlay').css({
              "top": "0"
            });
            animateIn(content, false);
          });
          setTimeout(function() {
            //animateIn(content, false);
          }, 1000);
          return false;
        } else {

          animateIn(content, true);
          return false;
        }


      })

      $('.property-overlay-close', context).click(function() {
        $('#property-overlay').animateCss('fadeOutDown');
        $("#property-details").animate({
          left: 0 + "px"
        }, 500, function() {
          //Animation complete
          $('#property-overlay').removeClass('overlay-in');
        });

        $("#property-price-mobile").animate({
          left: 0 + "px"
        }, 800)
        content = false;
        return false;
      })

      function animateIn(content, init) {

        $('.property-overlay-content').removeClass('active');
        $(content).addClass('active');
        $('#property-overlay').animateCss('fadeInUp');
        if (init) {
          $("#property-details").animate({
            left: -480 + "px"
          }, 200, function() {
            //Animation complete
          });
          $("#property-price-mobile").animate({
            left: -480 + "px"
          }, 500)
        }


        $('#property-overlay').addClass('overlay-in');

      }

      $('.show-photos-full-bg a', context).click(function() {
        $('body').toggleClass('show-photos-full-bg');
        $("#property-details").animate({
          left: -480 + "px"
        }, 300);
        $("#property-price-mobile").animate({
          left: -480 + "px"
        }, 500);
        $('#property-overlay').animateCss('fadeOutDown');
        $('#property-overlay').removeClass('overlay-in');
        content = false;
        return false;
      });
    }
  }

  Drupal.behaviors.additionalSeats = {
    attach: function(context, settings) {

      function showSelectedProduct() {
        $('#purchase-seats-form .additional-seats-product', context).addClass('hidden');

        var currentId = $('#purchase-seats-form .form-select', context).val();
        $('#purchase-seats-form .product-' + currentId).removeClass('hidden');
      }

      if ($('#purchase-seats-form', context).length) {
        showSelectedProduct();
        $('#purchase-seats-form .form-select', context).change(function() {
          showSelectedProduct();
        });
      }
    }
  }

  Drupal.behaviors.relaCalculateDays = {
    attach: function(context, settings) {

      // Calculate the days between 2 date fields.
      if ($('.calculate-date-trigger', context).length) {
        relaCalculateDaysBetweenDates();
        $('.calculate-date-trigger input', context).change(function() {
          relaCalculateDaysBetweenDates();
        });
      }

      function relaCalculateDaysBetweenDates() {
        var wrappers = $('.calculate-date-trigger .form-type-date-popup', context);
        var startDate = new Date(wrappers.first().find('input:first').val());
        var endDate = new Date(wrappers.last().find('input:first').val());

        var diff = new Date(endDate - startDate);
        var days = Math.floor(diff / 1000 / 60 / 60 / 24);
        days += 1;

        if ($('.calculate-date-value', context).length) {
          var multiplier = $('.calculate-date-multiplier', context).text() || 1;
          days = days * multiplier;
          if (days < 0) {
            days = 0;
          }
          $('.calculate-date-value', context).text(days);
        }

        return days;
      }
    }
  }

  Drupal.behaviors.lazyVideo = {
    attach: function(context, settings) {

      $("video.lazy source", context).each(function() {
        var sourceFile = $(this).attr("data-src");
        $(this).attr("src", sourceFile);
        var video = this.parentElement;
        video.load();
        video.play();
      });

      $("video.hover-lazy", context).once().click(function() {

        var $playing = $('video.hover-lazy.active');
        if ($playing.length > 0) {
          $playing.get(0).pause();
          $playing.removeClass('active');
        }

        var sourceFile = $(this).find('source').attr("data-src");

        $(this).find('source').attr("src", sourceFile);
          if (!$(this).hasClass('active')) {
            $(this).addClass('active');
            console.log('fua');
            var exampleVideo = $(this);
            exampleVideo.load();
            exampleVideo.get(0).play();
          }

      });

      $("iframe.lazy", context).each(function() {
        var sourceUrl = $(this).attr("data-src");


        $(this).attr("src", sourceUrl);
        setTimeout(function() {
          $('.loader-wrap').remove();
        }, 3000);

      });
    }
  }

  Drupal.behaviors.relaLazyImage = {
      attach: function(context, settings) {

      $("img.rela-lazy", context).each(function () {
        if (!$(this).hasClass('img-processed')) {
          var target = $(this);
          // Attach handlers BEFORE setting src to catch cached images
          var preloader = $('<img/>');
          preloader.on('load', function () {
            $(this).remove(); // prevent memory leaks as @benweet suggested
            target.attr('src', target.data('src')).addClass('img-processed').removeClass('rela-lazy');
          });
          preloader.attr('src', target.data('src'));
        }
      });

        // Ultra-simple lazy loader: swap data-lazysrc to src
        // Uses data-lazysrc instead of data-src to avoid conflict with contrib lazyloader module
        $("img.rela-lazytw", context).once('rela-lazytw').each(function() {
          var $img = $(this);
          var src = $img.data('lazysrc');
          if (src) {
            // Handle image load failures (e.g., S3 file not yet available during Lambda processing)
            $img.on('error', function() {
              if (!$(this).hasClass('img-processing')) {
                $(this).addClass('img-processing')
                       .attr('src', '/sites/all/themes/relaz/images/lazy-ph.png');
              }
            });
            $img.attr('src', src).removeClass('rela-lazytw');
          }
        });

        $(".lazy-bg", context).each(function() {
          if (!$(this).hasClass('img-processed')) {
            var target = $(this);
            target.css('background-image', "url(" + target.data('src') + ")").addClass('img-processed');

          }
        });
      }
    }

  Drupal.behaviors.videoTabs = {
    attach: function(context, settings) {
      $(".video-tabs .tab", context).click(function() {
        var sourceFile = $(this).attr("data-src");
        $('video').attr("src", sourceFile);
        var video = ('#video-tab_video');
        $('.video-tabs .tab.active').removeClass('active');
        $(this).addClass('active');
       // video.load();
        // video.play();
      });
    }
  }

  Drupal.behaviors.relaAgentDiscounts = {
    attach: function(context, settings) {

      // var discounts = Drupal.settings.relaAgentDiscounts || '';
      // if (discounts.data !== undefined) {
      //   var arr = $(discounts.data)[0];
      //   $('.form-item-quantity input').change(function() {
      //     var quantity = parseInt($(this).val());
      //     $.each(arr, function(percent, value) {
      //       if (quantity >= value.min && quantity <= value.max) {
      //         console.log(percent);
      //         return false;
      //       }
      //     })
      //   })
      // }

    }
  }

  Drupal.behaviors.relaSliders = {
    attach: function(context, settings) {

      if ($('#thumb-size-slider').length) {
        var current = parseInt($('.view-property-images .views-row').css('width')) - 100;

        $('#thumb-size-slider').slider({
          min: 0,
          max: 200,
          step: 50,
          values: [current],
          slide: function(e, ui) {
            var rows = $('.view-property-images .views-row');
            $(rows).css('width', 100 + ui.value + 'px');
            $(rows).css('height', 'auto');

            if (ui.value < 50) {
              $(rows).addClass('row-sm');
            } else {
              $(rows).removeClass('row-sm');
            }
          },
          change: function(e, ui) {
            var rows = $('.view-property-images .views-row');
            $(rows).css('height', $('.view-property-images .views-row-first').css('height'));
          }
        });
      }

      // Remove the stupid Click to Edit text on property image editable fields.
      if ($('.views-field-field-property-image-description').length) {
        $('.views-field-field-property-image-description').find('.editablefield-edit').html('');

        // Blur textareas.
        $('.page-property-edit-photos', context).on('mousedown', function(e) {
          if (!$(e.target).hasClass('form-textarea')) {
            $('textarea:focus').blur();
          }
        });
      }

      $('.views-field-field-property-image-description textarea', context).on('focus', function() {
        var nid = $(this).closest('.views-row').attr('data-nid');
        localStorage.setItem(nid, $(this).val());
      });

      $('.views-field-field-property-image-description textarea', context).once().on('blur', function() {
        $viewsRow = $(this).closest('.views-row');
        var nid = $viewsRow.attr('data-nid');
        var orig = localStorage.getItem(nid);
        if ($(this).val() != orig) {
          $viewsRow.find('.form-submit').click();
        }
      });

    }
  }

  Drupal.behaviors.closeDiv = {
    attach: function(context, settings) {

      $('.close-div').click(function() {
        var divID = $(this).attr('data-close-div');
        $(divID).animateCss('slideOutUp', function() {
          $(divID).addClass('hidden');
        });
        return false;
      });


    }
  }

  Drupal.behaviors.getParamAjaxCallbacks = {
    attach: function(context, settings) {

      // Show order confirmation modal. Doing this because the users are bouncing
      // from order.wldomain.com to sites.wldomain.com, and our normal overlay
      // messages (session based) don't crossover.
      //
      var WLOrderConfirm = getUrlParameter('wl_order_confirm') || '';
      if (WLOrderConfirm) {
        $('body').once('openOrderConfirmation', function() {
          // get rid of the param so a reload doesnt fire it again.
          // This will also remove it from history so they can go back to the
          // original tab @see https://stackoverflow.com/a/22753103

          var newURL = location.href.split("?")[0];
          window.history.replaceState('object', document.title, newURL);
          relaAjaxLink('/relajax/wl-commerce/nojs/order-success-modal/' + WLOrderConfirm);
        });
      }

    }
  }

  Drupal.behaviors.relaHotspots = {
    attach: function(context, settings) {


      $(document).mousedown(function(e) {
        if ($('body').hasClass('page-property-edit-floorplans')) {
          var container = $("#mini-panel-property_edit_docs_floorplans .view-header.current-active");

          if ($(e.target).hasClass('hotspot')) {
            return;
          }
          if ($(e.target).parent().hasClass('hotspot')) {
            return;
          }

          // If the target of the click isn't the container nor a descendant of
          // the container.
          if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.removeClass('current-active');
            $('.view-display-id-hotspots .view-content').removeClass('disabled');
            $('.hotspot.active').removeClass('active');
          }
        }
      });
      // This is for dragging existing hotspots on floorplan
      var spotDraggableOptions = function() {

        return {
          containment: '.hotspot-map',
          start: function(e, ui) {

            var id = $(this).attr('data-nid');
            $('.hotspot-map-wrapper .active, .view-display-id-hotspots .active').removeClass('active');
            $(this).addClass('active');
            setActive(this);
          },

          stop: function(e, ui) {
            var id = ui.helper.attr('data-nid');

            var left = parseInt($(this).css('left'));
            var top = parseInt($(this).css('top'));

            var mapWidth = parseInt($('.hotspot-map').width());
            var mapHeight = parseInt($('.hotspot-map').height());

            var newLeft = left / mapWidth * 100;
            var newTop = top / mapHeight * 100;

            $(this).css('left', newLeft + '%');
            $(this).css('top', newTop + '%');

            var floorplanId = $(this).closest('.floorplan-hotspot').attr('data-nid');
            $.post('/relajax/nojs/docs/' + floorplanId + '/save-hotspot', {
              image: id,
              left: newLeft,
              top: newTop
            });
          }
        }
      }

     /// Set active class on hotspot click.
      $(window).scroll(function(){
        $('.hotspot-photos-wrapper').fadeOut();
        $('.hotspot-viewer .hotspot.active').removeClass('active');
      });
      $('.hotspot-viewer', context).on('click', function(event){
        // don't close if clicking a spot
        if ($(event.target).hasClass('hotspot') || $(event.target).parent().hasClass('hotspot')) {
          return false;
        }
        $('.hotspot-photos-wrapper').fadeOut();
        $('.hotspot-viewer .hotspot.active').removeClass('active');


      });
      $('.hotspot-viewer .hotspot', context).hover(function() {
        var hotspot = $(this);

        if ($(this).hasClass('active')) {

          return;
        }
        $('.hotspot-photos-wrapper').fadeIn();
        setActive(hotspot)
        var uri = $(hotspot).attr('data-uri');
        //$('.current-image').attr('src', uri);
        $('.current-image').attr('src', uri);

        var layout = $(hotspot).attr('data-layout');
        $('.current-image').removeClass('portrait').removeClass('landscape').addClass(layout);
        $('.hotspot-photos-wrapper').removeClass('portrait').removeClass('landscape').addClass(layout);

        setHotspotDescription(hotspot);

       // return false;
      });



      $('.hotspot-editor .hotspot', context).hover(function(){
        var hotspot = $(this);
        if ($(this).hasClass('active')) {
          return;
        }
        setActive(hotspot)
      });
      // Remove active class on any click.
      $('.hotspot-map-wrapper, #dashboard-left-nav').click(function(e) {
        if (!$(e.target).hasClass('hotspot')) {
          // $('.hotspot-map-wrapper .active, .view-display-id-hotspots .active').removeClass('active');
        }
      });

      // Remove active class on close click.
      $('.hotspot-close').click(function() {
        $('.hotspot-map-wrapper .active, .view-display-id-hotspots .active').removeClass('active');
      })

      // Set draggable.
      if ($('.hotspot.draggable').length) {
        $('.hotspot.draggable').draggable(spotDraggableOptions());
      }

      // Colorpicker - make the whole btn wrapper clickable, not just the tiny swatch.
      $('.field-name-field-doc-hotspot-color.btn', context).once('hotspot-color-btn').on('click', function(e) {
        if (!$(e.target).closest('.color_picker').length) {
          $(this).find('.color_picker').click();
        }
      });

      // Colorpicker - update visual on change.
      $('.field-name-field-doc-hotspot-color .color_picker', context).once('hotspot-color-change').on('change', function() {
        var spotColor = $(this).css('background-color');
        var lastComma = spotColor.lastIndexOf(')');
        var opacityColor = spotColor.slice(0, lastComma) + ", 0.4)";
        $('.floorplan-hotspot .hotspot-map-wrapper .hotspot-container .hotspot-map .circle').css('background-color', opacityColor);
        $('.floorplan-hotspot .hotspot-map-wrapper .hotspot-container .hotspot-map .circle').css('border-color', spotColor);
        $('.floorplan-hotspot .hotspot-map-wrapper .hotspot-container .hotspot-map .ringer').css('border-color', spotColor);
      });

      // Colorpicker - save on blur (when picker closes).
      $('.field-name-field-doc-hotspot-color .color_picker input', context).once('hotspot-color-save').on('blur', function() {
        var colorHex = $(this).val();
        var floorplanId = $('.floorplan-hotspot').attr('data-nid');
        $.post('/relajax/nojs/docs/' + floorplanId + '/save-hotspot-color', {color: colorHex});
      });

      // This is for dragging images on to the floorplan
      if (Drupal.settings.relaHotspots !== undefined) {
        if (Drupal.settings.relaHotspots.floorplanDrag) {
          $('.view-display-id-property_image_select img').draggable({
          helper: 'clone',
          appendTo: ".hotspot-map",
          stop: function(e, ui) {
            var id = ui.helper.attr('data-nid');

            var left = parseInt(ui.helper.css('left'));
            var top = parseInt(ui.helper.css('top'));

            var mapWidth = parseInt($('.hotspot-map').width());
            var mapHeight = parseInt($('.hotspot-map').height());

            var newLeft = left / mapWidth * 100;
            var newTop = top / mapHeight * 100;

            // If outside of bounds then put ti back.
            if (newLeft < 0) {
              newLeft = 5;
            }
            if (newLeft > 100) {
              newLeft = 95;
            }
            if (newTop < 0) {
              newTop = 5;
            }
            if (newTop > 100) {
              newTop = 95;
            }

            var spot = $('<div></div>').addClass('hotspot draggable').css({
              left: newLeft + '%',
              top: newTop + '%',
              position:'absolute',
            });

            $(spot).attr('data-image-description', ui.helper.attr('data-image-description'));
            $(spot).attr('data-layout', ui.helper.attr('data-layout'));
            $(spot).attr('data-nid', ui.helper.attr('data-nid'));
            $(spot).attr('data-uri', ui.helper.attr('data-uri'));
            $(spot).addClass('new');


            var inner = $('<span></span>').addClass('circle').css({
              border: '2px solid rgb(230, 0, 255)',
              backgroundColor: 'rgba(230, 0, 255)',
            });
            $(spot).append(inner);

            // initialize da drag.
            //$(spot).draggable(spotDraggableOptions());

            $('.hotspot-map').append(spot);

            var floorplanId = $('.floorplan-hotspot').attr('data-nid');
            $.post('/relajax/nojs/docs/' + floorplanId + '/save-hotspot', {
              image: id,
              left: newLeft,
              top: newTop,
              add: true
            })
            .done(function(data) {
              $('#floorplan-reload').click();
              $('.view-display-id-property_image_select img.image-nid-' + id).parent().addClass('used');
            });
            }
          });
        }
      }

      function setActive(hotspot) {
        $('.view-display-id-hotspots .view-content').addClass('disabled');
        $('.view-display-id-hotspots .view-header').addClass('current-active');
        var id = $(hotspot).attr('data-nid');
        $('.hotspot-map-wrapper .active, .view-display-id-hotspots .active').removeClass('active');
        $(hotspot).addClass('active');
        //$('.views-row-' + id).addClass('active');
        var activeClone = $('.views-row-' + id + ':not(.cloned)').clone('true').addClass('cloned')
        $('.cloned').removeClass('.views-row-' + id);
        $('#hotspot-current').html(activeClone);
      }

      function setHotspotDescription(hotspot) {
        var description = $(hotspot).attr('data-image-description');
        if (description.length > 0) {
          $('.hotspot-photos-wrapper .img-description').removeClass('hidden');
          $('.hotspot-photos-wrapper .img-description').html(description);
        } else {
          $('.hotspot-photos-wrapper .img-description').addClass('hidden');
        }
      }
    }
  }
  Drupal.behaviors.btnToggleTarget = {
    attach: function(context, settings){
      $('.btn-toggle-target', context).click(function() {
        var targetText = $(this).attr('data-target-text');
        var target = $(this).attr('data-target');
        var targetClass = $(this).attr('data-target-class');

        if ($(this).text() == targetText) {
          if ($(this).attr('data-target-original-text')) {
            $(this).html($(this).attr('data-target-original-text'));
          }
          else {
            $(this).html('<i class="icon icon-arrow-left m-r-1 valign-sub"></i>Back');
          }
        }
        else {
          if ($(this).attr('data-target-original-text')) {
            $(this).attr('data-target-original-text', $(this).text());
          }
          $(this).html(targetText);
        }

        $(target).toggleClass(targetClass);
      });
    }
  }

  Drupal.behaviors.socialSharePop = {
    attach: function(context, settings){
      $('.social-share-link').click(function(){
        var url = $(this).attr('href');
        window.open(url, 'Share','width=640,height=320');
        return false;
      });
    }
  }


  Drupal.behaviors.matterportDemo  = {
    attach: function(context, settings){

      $('#rela-matterport-add-demo-property-form input.matterport-id-input').blur(function(){
        var city = $(this).data('city');
        var state = $(this).data('state');
        var zip = $(this).data('zip');
        var street = $(this).data('street');

        $('input.thoroughfare').val(street);
        $('input.locality').val(city);
        $('select.state').val(state);
        $('input.postal-code').val(zip);
      });
    }
  }

  Drupal.behaviors.wlOrderForm = {
    attach: function(context, settings) {
      if ($('.page-booking-edit').length) {
        if ($('.wl-client-order-steps').length) {
          $('.wl-client-order-form-wrapper').affix({
            offset: {
              top: $('.wl-client-order-steps').offset().top + $('.wl-client-order-steps').outerHeight(true)
            }
          });
        }

      }

      $('#calendar-select-wrapper .cal-select-day', context).on('mousedown', function(){
        var $el = $('.selected-day-display');
        if ($el.is(':visible')) {
          var goto = $el.offset().top - 145;
          $('html, body').animate({
           scrollTop: goto
          }, 1000);
        }
      });
    }
  } // End wlOrderForm.

  Drupal.behaviors.primaryNav = {
    attach: function(context, settings) {
      //https://stackoverflow.com/a/7385673
      $(document).mouseup(function(e) {
        var container = $("#primary-front-nav");
        if ($('.primary-link.active').length > 0) {
          // if the target of the click isn't the container nor a descendant of the container
          if (!container.is(e.target) && container.has(e.target).length === 0) {
            $('.primary-link.active').removeClass('active');
          }
        }

      });


      $('.primary-link .drop-link').click(function(e){
        if ($(this).parent().hasClass('active')) {
          $(this).parent().removeClass('active');
          $('#primary-front-nav').removeClass('affix');
        }
        else {
          $('.primary-link.active').removeClass('active');
          $(this).parent().addClass('active');
          $('#primary-front-nav').addClass('affix');
        }
        e.preventDefault();
      });
    }
  }

  Drupal.behaviors.frontNav = {
    attach: function(context, settings) {
      $('#primary-front-nav .outside-menu-toggle').click(function(){
        $('#nav-menu-toggle').toggleClass('open');
        $('#nav-links').toggleClass('open');
      })
    }
  };

  Drupal.behaviors.relaWLOFakeSubmit = {
    attach: function(context, settings) {
      $('.sudo-submit').on('click', function(event){
        var formID = $(this).attr('data-form-id');
        var submitName = $(this).attr('data-submit-name');
        // console.log(formID);
        // console.log(submitName);
        // console.log(formID + ' .form-submit[name="' + submitName + '"]');
        $(formID + ' .form-submit[name="' + submitName + '"').mousedown();
      });
    }
  }

  Drupal.behaviors.colorPickerFancy = {
    attach: function(context, settings) {
      //form-colorpicker
      $('.color-picker-fancy input.form-colorpicker', context).change(function(){
        var colorVal = $(this).val();
        var target = $(this).attr('name');
        // replace targets that have group-name[fieldname] with -- cuz [ ] dont work
        target = target.replace(/\[|\]/g, '--');
        console.log(target);
        $('#target-' + target + '.color-preview svg').attr('fill', '#' + colorVal);
        $('#target-' + target + '.color-preview .color-value').text('#' + colorVal);
      });
    }
  }

  Drupal.behaviors.formDropdown = {
    attach: function(context, settings) {
      $(document).on('click', '.dropdown-form .dropdown-menu', function (e) {
        e.stopPropagation();
        //$('.date-filters .btn-group').stopPropagation();
      });
      $(document).on('click', '.ui-datepicker-header', function (e) {
         e.stopPropagation();
      });

      // Doc on so it works with ajax loaded content
      $(document).on('click', '.rela-exposed-sort-drop .views-widget-sort-sort_bef_combine .form-type-radios', function(){
        if ($(this).hasClass('open')) {
          $(this).removeClass('open');
        }
        else {
          $(this).addClass('open');
        }
      });
    }
  }

  // Feed Connection "Pull from Feed": flip to "Synced!" and make it a no-op so
  // it can't be re-clicked. The click's own AJAX still fires; the deferred
  // pointer-events:none only blocks subsequent clicks.
  Drupal.behaviors.relaFeedPull = {
    attach: function(context, settings) {
      $('.feed-pull-link', context).once('feed-pull').on('click', function() {
        var $btn = $(this);
        $btn.html('<i class="fa fa-check m-r-_5"></i> Synced!');
        setTimeout(function() {
          $btn.css('pointer-events', 'none').addClass('disabled');
        }, 0);
      });
    }
  };

})(jQuery, Drupal);
;/*})'"*/;/*})'"*/
(function($, Drupal, undefined) {

  Drupal.behaviors.RelazPropertySideMenu = {
    attach: function(context, settings) {
      $('.sidemenu-toggle', context).click(function() {
        var identifier = '#' + $(this).attr('data-menu-id');
        $(identifier).toggleClass('side-menu-open');
      });

      $('.side-menu-over a', context).click(function() {
        $('.side-menu-open').removeClass('side-menu-open');
      });

      $('.side-menu-under', context).click(function() {
        $('.side-menu-open').removeClass('side-menu-open');
      });

      $('body', context).on('screenMd', function() {
        $('.side-menu-open').removeClass('side-menu-open');
      });


    }
  }

  Drupal.behaviors.RelazPropertyOutsideMenu = {
    attach: function(context, settings) {
      $('.outside-menu-toggle', context).click(function() {

        if ($('body').hasClass('outside-menu-open')) {
          $('body').removeClass('outside-menu-open');
          var menuData = $(this).attr('menu-data');
          setTimeout(
            function() {
              $('#outside-menu').removeClass('outside-menu-' + menuData);
            }, 1500);

        }
        else {
          $('#outside-menu .menu-content-item').hide();
          $('body').addClass('outside-menu-open');
          var menuData = $(this).attr('menu-data');
          $('#outside-menu').addClass('outside-menu-' + menuData);
          $('.menu-content-item' + '.menu-content-' + menuData).show();
        }
      });

      $('#property-nav-links li a', context).click(function() {
        $('body.outside-menu-open').removeClass('outside-menu-open');
      });
      // $('#outside-menu a:not(.auto-click)', context).click(function() {
      //   $('body').toggleClass('outside-menu-open');
      // })

    }
  }

  Drupal.behaviors.RelazMainMobileMenu = {
    attach: function(context, settings) {
      $('.close-nav', context).click(function() {

        $('#nav-mobile').removeClass('mobile-nav-open');

      });

      $('#nav-mobile .menu a', context).click(function() {

        $('#nav-mobile').removeClass('mobile-nav-open');

      });

      $('.open-nav', context).click(function() {

        $('#nav-mobile').addClass('mobile-nav-open');

      });

    }
  }

})(jQuery, Drupal);
;/*})'"*/;/*})'"*/
(function ($) {

/**
 * Override Views prototype function so it can recognize Bootstrap AJAX pagers.
 * Attach the ajax behavior to each link.
 */
Drupal.views.ajaxView.prototype.attachPagerAjax = function() {
  this.$view.find('ul.pager > li > a, th.views-field a, .attachment .views-summary a, ul.pagination li a')
  .each(jQuery.proxy(this.attachPagerLinkAjax, this));
};

})(jQuery);
;/*})'"*/;/*})'"*/
/**
 * @file
 *
 * Overrides for ctools modal.
 *
 */

(function ($) {
  /**
   * Override CTools modal show function so it can recognize the Bootstrap modal classes correctly
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
      }
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
      $('div.ctools-modal-dialog', context).css({
        'width': width + Drupal.CTools.Modal.currentSettings.modalSize.addWidth + 'px',
        'height': height + Drupal.CTools.Modal.currentSettings.modalSize.addHeight + 'px'
      });
      $('div.ctools-modal-dialog .modal-body', context).css({
        'width': (width - Drupal.CTools.Modal.currentSettings.modalSize.contentRight) + 'px',
        'height': (height - Drupal.CTools.Modal.currentSettings.modalSize.contentBottom) + 'px'
      });
    }

    if (!Drupal.CTools.Modal.modal) {
      Drupal.CTools.Modal.modal = $(Drupal.theme(settings.modalTheme));
      if (settings.modalSize.type == 'scale') {
        $(window).bind('resize', resize);
      }
    }

    resize();

    $('.modal-title', Drupal.CTools.Modal.modal).html(Drupal.CTools.Modal.currentSettings.loadingText);
    Drupal.CTools.Modal.modalContent(Drupal.CTools.Modal.modal, settings.modalOptions, settings.animation, settings.animationSpeed);
    $('#modalContent .modal-body').html(Drupal.theme(settings.throbberTheme));
  };

  /**
   * Provide the HTML to create the modal dialog in the Bootstrap style.
   */
  Drupal.theme.prototype.CToolsModalDialog = function () {
    var html = ''
    html += '  <div id="ctools-modal">'
    html += '    <div class="ctools-modal-dialog">'
    html += '      <div class="modal-content">'
    html += '        <div class="modal-header">';
    html += '          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
    html += '          <h4 id="modal-title" class="modal-title">&nbsp;</h4>';
    html += '        </div>';
    html += '        <div id="modal-content" class="modal-body">';
    html += '        </div>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';

    return html;
  }

  /**
   * Provide the HTML to create a nice looking loading progress bar.
   */
  Drupal.theme.prototype.CToolsModalThrobber = function () {
    var html = '';
    html += '  <div class="loading-spinner" style="width: 200px; margin: -20px 0 0 -100px; position: absolute; top: 45%; left: 50%">';
    html += '    <div class="progress progress-striped active">';
    html += '      <div class="progress-bar" style="width: 100%;"></div>';
    html += '    </div>';
    html += '  </div>';

    return html;
  };


})(jQuery);
;/*})'"*/;/*})'"*/
(function ($) {

/**
 * Override Drupal's AJAX prototype beforeSend function so it can append the
 * throbber inside the pager links.
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
      options.extraData[this.element.name] = v;
    }
  }

  // Disable the element that received the change to prevent user interface
  // interaction while the Ajax request is in progress. ajax.ajaxing prevents
  // the element from triggering a new request, but does not prevent the user
  // from changing its value.
  $(this.element).addClass('progress-disabled').attr('disabled', true);

  // Insert progressbar or throbber.
  if (this.progress.type == 'bar') {
    var progressBar = new Drupal.progressBar('ajax-progress-' + this.element.id, eval(this.progress.update_callback), this.progress.method, eval(this.progress.error_callback));
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
    this.progress.element = $('<div class="ajax-progress ajax-progress-throbber"><i class="glyphicon glyphicon-refresh glyphicon-spin"></i></div>');
    // If element is an input type, append after.
    if ($(this.element).is('input')) {
      if (this.progress.message) {
        $('.throbber', this.progress.element).after('<div class="message">' + this.progress.message + '</div>');
      }
      $(this.element).after(this.progress.element);
    }
    // Otherwise inject it inside the element.
    else {
      if (this.progress.message) {
        $('.throbber', this.progress.element).append('<div class="message">' + this.progress.message + '</div>');
      }
      $(this.element).append(this.progress.element);
    }
  }
};

})(jQuery);
;/*})'"*/;/*})'"*/
