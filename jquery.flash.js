(function($) {

 /* -- how to use it!

  // -- global call
  $.flash('did you know youre awesome?');

  $.flash('hey, ur awesome', {
    redirUrl: '#organize'
  });

  $.flash('WARNING', {
    type: 'error',
    redirUrl: '#organize',
    onShow: function() {
      c('hi');
    },
    onClose: function() {
      c('bye');
    }
  });

  -- close programmatically
  $.flash.close();

  $.flash.close({
    redirUrl: '#organize',
    onClose: function() {
      c('bye');
    }
  });

  */


  $.flash = function (message, options, callback) { // callback is an optional, totally wild callback
    return $.flash.impl.init(message, options, callback);
  };

  $.flash.close = function (options) {
    return $.flash.impl.close(options);
  };

  $.flash.defaults = {          // gets rewritten in init()
    baseCss: 'flash',           // css: class="flash info"
    closeCss: 'flash-close',
    alignTarget: '#body',
    eventNamespace: 'flash',
    posY: 50,
    posX: 50,
    message: 'DEFAULT MESSAGE',
    type: 'info',               // info, success, error, warning
    links: null,                // map of href: innerHTML
    hints: null,                // map of href: innerHTML
    redirUrl: null,
    onShow: null,
    onClose: null
  }


  // TODO allows attachment to jquery element instead of global attach point
  $.fn.flash = function (message, options, callback) {
    return $.flash.impl.init(this, options, callback);
  };



  // -------------------------------------------- IMPL

  $.flash.impl = {
    init: function(msg, opts, call) {  // call is an optional, totally wild callback
      if(!msg) return;                 // console.log('no flash message passed!');

      // -- setup
      var self = this;
      var opt = self.opt = $.extend({}, $.flash.defaults, opts);

      // -- dead chicken wave
      $('body').unbind('.' + opt.eventNamespace);
      $('input').unbind('.' + opt.eventNamespace);

      // -- create
      //    produces div.flash > div.error | div.close | ul > li > a (optional)
      var flash$ = $('<div>')
        .attr('class', opt.baseCss);

      var message$ = $('<div>')
        .attr('class', opt.type)  // type doubles as classname
        .html(msg)
        .appendTo(flash$);

      var close$ = $('<div>')
        .attr('class', opt.closeCss)
        .click(function() {
          self.close(opt);
        })
        .appendTo(message$);

      if(opt.links) {
        var ul$ = $('<ul>');
        ul$.attr('class', opt.baseCss + '-links');
        for(var i in opt.links) {
          var a$ = $('<a>'),
              li$ = $('<li>'),
              p$;
          a$.attr('class', opt.baseCss + '-link');
          for(key in opt.links[i]) {
            var val = opt.links[i][key];
            if(key == 'url') a$.attr('href', val);
            else if(key == 'text') a$.html(val);
            else if(key == 'hint') {
              p$ = $('<p>')
                .attr('class', opt.baseCss + '-hint')
                .html(val);
            }
            else return;
            li$.append(a$);
            li$.append(p$);
            ul$.append(li$);
          };
        }
        message$.append(ul$);
      }

      if(opt.hints) {
        for(p in opt.hints) {
        var p$ = $('<p>')
              .attr('class', opt.baseCss + '-hint')
              .html(opt.hints[p]);
          message$.append(p$);
        }
      }

      // -- attach
      $('body').append(flash$);

      // -- present
      var posX = $(opt.alignTarget).offset().left - 30;
      var posY = opt.posY;
      flash$.offset({top: posY + $(window).scrollTop(), left: -1000});
      flash$.animate({
        top: posY,
        left: posX
      }, 500, function() {
        if(opt.onShow) opt.onShow();
        if(!opt.links) {  // don't bind close events if there are links
          $('body').bind('click.' + opt.eventNamespace, function(e) {
            self.close(opt);
          });
          $('input').bind('keydown.' + opt.eventNamespace, function(e) {
            self.close(opt);
          });
        }
      });
    },

    close: function(opts) {
      if(!$('.' + $.flash.defaults.baseCss).length) return false;

      // setup
      var self = this;

      if(opts) { // callback and destroy
        var opt = self.opt = $.extend({}, $.flash.defaults, opts); // dont rewrite global defaults
        if(opt.onClose) opt.onClose();
        destroy(opt);
      }
      else { // just destroy using default
        destroy();
      }
    }
  }


  // -------------------------------------------- DESTROY
  function destroy(opts) {
    var self = this;

    // unbind all events in namespace
    if(opts) {
      $('body').unbind('.' + opts.eventNamespace);
      $('input').unbind('.' + opts.eventNamespace);
    }

    $('.' + $.flash.defaults.baseCss).animate({
        top: $.flash.defaults.posY,
        left: -1000
      }, 500, function() {
      $('.' + $.flash.defaults.baseCss).remove();
      if(opts && opts.redirUrl) {
        var opt = self.opt = $.extend({}, $.flash.defaults, opts); // dont rewrite global defaults
        window.location.hash = opt.redirUrl;
      }
    });
  }


})(jQuery);


