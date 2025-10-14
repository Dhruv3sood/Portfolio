(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#topNav'
  });

  // Cursor trail effect (GPU-friendly, uses requestAnimationFrame)
  (function initCursorTrail() {
    var canvas = document.createElement('canvas');
    canvas.id = 'cursor-trail-canvas';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var dpr = window.devicePixelRatio || 1;
    function resize() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var particles = [];
    var maxParticles = 80; // lower density for elegance
    var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    function spawnParticles(x, y) {
      for (var i = 0; i < 4; i++) {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          life: 1,
          size: 2.2 + Math.random() * 1.6
        });
      }
      if (particles.length > maxParticles) particles.splice(0, particles.length - maxParticles);
    }

    window.addEventListener('mousemove', function(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      spawnParticles(mouse.x, mouse.y);
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) { particles.splice(i, 1); continue; }

        var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
        grd.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
        grd.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  // Animate project cards on enter
  (function observeProjects(){
    var cards = document.querySelectorAll('.flip-card');
    if (!('IntersectionObserver' in window)) {
      for (var i=0;i<cards.length;i++){ cards[i].classList.add('in-view'); }
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ if (entry.isIntersecting) { entry.target.classList.add('in-view'); io.unobserve(entry.target); } });
    }, { threshold: 0.2 });
    for (var i=0;i<cards.length;i++){ io.observe(cards[i]); }
  })();

  // Typing effect for About text
  (function typingEffect(){
    var el = document.getElementById('about-typing');
    if (!el) return;
    var text = el.getAttribute('data-text') || '';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = text; return;
    }
    var i = 0;
    function step(){
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        var delay = 8 + Math.random() * 35; // subtle humanized cadence
        setTimeout(step, delay);
      }
    }
    step();
  })();

})(jQuery); // End of use strict
