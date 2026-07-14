/*!
 * Alpha Clinic – main.js
 * Premium preloader + all original site features.
 */

/* =========================================
   NEW PRELOADER (vanilla JS, no jQuery)
   Replaces old spinner. Runs immediately.
   ========================================= */
(function initPreloader() {
  var spinner = document.getElementById('spinner');
  if (!spinner) return;

  var percentEl = document.getElementById('preloaderPercent');
  var progressFill = document.getElementById('progressFill');
  var startTime = Date.now();
var minDuration = 2800;   // percentage will reach 100% after ~2.8s
var maxDuration = 3200;   // safety fallback (slightly longer)
  var loaded = false;
  var exitTriggered = false;
  var currentPercent = 0;
  var animationId = null;

  // Cubic bezier ease-out (0.25,0.1,0.25,1)
  function cubicBezier(t) {
    var x1 = 0.25, y1 = 0.1, x2 = 0.25, y2 = 1;
    function sampleCurveX(t) {
      return ((1 - t) * (1 - t) * (1 - t) * 0) +
        (3 * (1 - t) * (1 - t) * t * x1) +
        (3 * (1 - t) * t * t * x2) +
        (t * t * t * 1);
    }
    function sampleCurveDerivativeX(t) {
      return (3 * (1 - t) * (1 - t) * x1) +
        (6 * (1 - t) * t * (x2 - x1)) +
        (3 * t * t * (1 - x2));
    }
    var x = t;
    for (var i = 0; i < 8; i++) {
      var dx = sampleCurveX(x) - t;
      if (Math.abs(dx) < 1e-7) break;
      x -= dx / sampleCurveDerivativeX(x);
    }
    return ((1 - x) * (1 - x) * (1 - x) * 0) +
      (3 * (1 - x) * (1 - x) * x * y1) +
      (3 * (1 - x) * x * x * y2) +
      (x * x * x * 1);
  }

  function updateProgress() {
    var elapsed = Date.now() - startTime;
    var t = Math.min(elapsed / minDuration, 1);
    var eased = cubicBezier(t);
    currentPercent = Math.round(eased * 100);
    if (loaded && t >= 0.95) currentPercent = 100;
    if (currentPercent > 100) currentPercent = 100;

    percentEl.textContent = currentPercent + '%';
    progressFill.style.width = currentPercent + '%';

    if (currentPercent === 100) {
      cancelAnimationFrame(animationId);
      setTimeout(triggerExit, 200);
    } else {
      animationId = requestAnimationFrame(updateProgress);
    }
  }

  function onLoadComplete() {
    if (loaded) return;
    loaded = true;
    // Speed up remaining progress
    if (currentPercent < 100) {
      cancelAnimationFrame(animationId);
      var start = currentPercent;
      var startRapid = Date.now();
      function rapidUpdate() {
        var elapsed = Date.now() - startRapid;
        var percent = Math.min(start + Math.round((100 - start) * (elapsed / 200)), 100);
        percentEl.textContent = percent + '%';
        progressFill.style.width = percent + '%';
        if (percent >= 100) {
          setTimeout(triggerExit, 200);
        } else {
          requestAnimationFrame(rapidUpdate);
        }
      }
      requestAnimationFrame(rapidUpdate);
    }
  }

  function triggerExit() {
    if (exitTriggered) return;
    exitTriggered = true;

    // Cinematic exit: shrink clip-path to reveal the page
    spinner.classList.add('hide');

    spinner.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'clip-path') {
        spinner.style.display = 'none';
        spinner.removeEventListener('transitionend', handler);
      }
    });
  }

  // Start the progress loop
  animationId = requestAnimationFrame(updateProgress);

  // Detect full page load
  window.addEventListener('load', onLoadComplete);

  // Safety timeout
  setTimeout(function () {
    if (!exitTriggered) {
      if (!loaded) onLoadComplete();
      if (currentPercent < 100) {
        percentEl.textContent = '100%';
        progressFill.style.width = '100%';
      }
      triggerExit();
    }
  }, maxDuration);
})();


/* =========================================
   ORIGINAL SITE CODE (unchanged, jQuery)
   ========================================= */
(function ($) {
    "use strict";

    // Initiate the wowjs
    if (typeof WOW !== 'undefined') {
        new WOW().init();
    }


    // Modern suspended navbar — expands to cover header on scroll
    var $siteNav = $('#siteNav');
    var navExpandAt = 40;

    function updateSiteNav() {
        if (!$siteNav.length) return;
        if ($(window).scrollTop() > navExpandAt) {
            $siteNav.addClass('is-expanded');
        } else {
            $siteNav.removeClass('is-expanded');
        }
    }

    updateSiteNav();
    $(window).on('scroll', updateSiteNav);

    // Mobile menu toggle
    $('#siteNavToggle').on('click', function () {
        var open = !$siteNav.hasClass('is-open');
        $siteNav.toggleClass('is-open', open);
        $(this).attr('aria-expanded', open);
        $(this).find('i').toggleClass('fa-bars', !open).toggleClass('fa-times', open);
    });

    // Mobile dropdown
    $('.site-nav__dropdown > .site-nav__link').on('click', function (e) {
        if (window.innerWidth < 992) {
            e.preventDefault();
            $(this).parent().toggleClass('is-open');
        }
    });

    // Close mobile menu on link click
    $('.site-nav__menu a:not(.site-nav__dropdown > .site-nav__link)').on('click', function () {
        if (window.innerWidth < 992) {
            $siteNav.removeClass('is-open');
            $('#siteNavToggle').attr('aria-expanded', false)
                .find('i').removeClass('fa-times').addClass('fa-bars');
        }
    });


    // Back to top button
    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').on('click', function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    if ($.fn.counterUp) {
        $('[data-toggle="counter-up"]').counterUp({
            delay: 10,
            time: 2000
        });
    }


    // Header carousel — autoplay + synced left taglines
    function initHeaderCarousel(root) {
        var $root = $(root);
        var $slides = $root.find('.carousel-slide');
        var $dotsWrap = $root.find('.carousel-dots');
        var $tagline = $('#heroTagline');
        var $subline = $('#heroSubline');
        var index = 0;
        var animating = false;
        var autoplayMs = parseInt($root.data('interval'), 10) || 4500;
        var timer = null;

        if (!$slides.length) return;

        $slides.each(function (i) {
            $dotsWrap.append(
                $('<button type="button" class="carousel-dot" aria-label="Go to slide ' + (i + 1) + '"></button>')
                    .toggleClass('active', i === 0)
                    .data('index', i)
            );
        });

        function updateTagline(slideIndex) {
            var $slide = $slides.eq(slideIndex);
            var nextTitle = $slide.data('tagline');
            var nextSub = $slide.data('subline');

            if (!nextTitle || !$tagline.length) return;

            $tagline.add($subline).removeClass('is-visible');

            setTimeout(function () {
                $tagline.text(nextTitle);
                if ($subline.length && nextSub) {
                    $subline.text(nextSub);
                }
                $tagline.add($subline).addClass('is-visible');
            }, 280);
        }

        function goTo(next) {
            if (animating || next === index) return;
            animating = true;

            var $current = $slides.eq(index);
            var $next = $slides.eq(next);

            $current.addClass('leaving').removeClass('active entering');
            $next.addClass('active entering').removeClass('leaving');

            $dotsWrap.find('.carousel-dot').removeClass('active').eq(next).addClass('active');
            index = next;
            updateTagline(index);

            setTimeout(function () {
                $slides.removeClass('leaving entering');
                animating = false;
            }, 600);
        }

        function startAutoplay() {
            stopAutoplay();
            if ($root.data('autoplay') === false) return;
            timer = setInterval(function () {
                goTo((index + 1) % $slides.length);
            }, autoplayMs);
        }

        function stopAutoplay() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        $root.find('.carousel-prev').on('click', function () {
            goTo((index - 1 + $slides.length) % $slides.length);
            startAutoplay();
        });

        $root.find('.carousel-next').on('click', function () {
            goTo((index + 1) % $slides.length);
            startAutoplay();
        });

        $dotsWrap.on('click', '.carousel-dot', function () {
            goTo($(this).data('index'));
            startAutoplay();
        });

        $root.on('mouseenter', stopAutoplay);
        $root.on('mouseleave', startAutoplay);

        // Keep autoplay running even if the page is backgrounded briefly
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });

        startAutoplay();
    }


    // Testimonials carousel — center mode + scale (matches previous Owl behavior)
    function initTestimonialCarousel(root) {
        var $root = $(root);
        var $track = $root.find('.carousel-track');
        var $items = $track.children('.carousel-item');
        var index = 0;
        var animating = false;

        if ($items.length < 1) return;

        // Clone for seamless loop
        $items.clone().appendTo($track);
        $items.clone().prependTo($track);
        $items = $track.children('.carousel-item');

        var originalCount = $items.length / 3;
        index = originalCount;

        function itemsPerView() {
            return window.innerWidth >= 768 ? 2 : 1;
        }

        function itemWidth() {
            return $root.width() / itemsPerView();
        }

        // Center the active slide in the viewport (Owl center: true)
        function offsetFor(i) {
            var w = itemWidth();
            var centerPad = ($root.width() - w) / 2;
            return -(i * w) + centerPad;
        }

        function setSizes(animate) {
            var w = itemWidth();
            $items.css({ flex: '0 0 ' + w + 'px', maxWidth: w + 'px' });
            if (!animate) {
                $track.css('transition', 'none');
            }
            $track.css('transform', 'translateX(' + offsetFor(index) + 'px)');
            $track[0].offsetHeight;
            $track.css('transition', 'transform 1s ease');
            updateCenter();
        }

        function updateCenter() {
            $items.removeClass('center');
            $items.eq(index).addClass('center');
        }

        function go(delta) {
            if (animating) return;
            animating = true;
            index += delta;
            $track.css('transform', 'translateX(' + offsetFor(index) + 'px)');
            updateCenter();

            setTimeout(function () {
                if (index >= originalCount * 2) {
                    index -= originalCount;
                    $track.css('transition', 'none');
                    $track.css('transform', 'translateX(' + offsetFor(index) + 'px)');
                    $track[0].offsetHeight;
                    $track.css('transition', 'transform 1s ease');
                    updateCenter();
                } else if (index < originalCount) {
                    index += originalCount;
                    $track.css('transition', 'none');
                    $track.css('transform', 'translateX(' + offsetFor(index) + 'px)');
                    $track[0].offsetHeight;
                    $track.css('transition', 'transform 1s ease');
                    updateCenter();
                }
                animating = false;
            }, 1000);
        }

        $root.find('.carousel-prev').on('click', function () { go(-1); });
        $root.find('.carousel-next').on('click', function () { go(1); });

        $(window).on('resize', function () { setSizes(false); });
        setSizes(false);
    }


    $('.header-carousel').each(function () {
        initHeaderCarousel(this);
    });

    $('.testimonial-carousel').each(function () {
        initTestimonialCarousel(this);
    });

})(jQuery);