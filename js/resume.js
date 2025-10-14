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
    var maxParticles = 100; // slightly reduced for subtle effect
    var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    function spawnParticles(x, y) {
      for (var i = 0; i < 4; i++) { // back to original spawn count
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          life: 1, // back to original life
          size: 2.0 + Math.random() * 1.5
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
        p.life -= 0.02; // back to original fade rate
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

  // Floating line animations for about section
  (function floatingLinesAnimation() {
    var canvas = document.createElement('canvas');
    canvas.id = 'floating-lines-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    canvas.style.opacity = '0.7'; // increased opacity for more visibility
    
    var aboutSection = document.getElementById('about');
    if (!aboutSection) return;
    
    aboutSection.style.position = 'relative';
    aboutSection.appendChild(canvas);
    
    var ctx = canvas.getContext('2d');
    var animationId;
    
    function resizeCanvas() {
      var rect = aboutSection.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    var nodes = [];
    var maxNodes = 25; // increased from 15 to 25 for more density
    var connectionDistance = 150; // increased connection distance
    
    // Initialize nodes
    function initNodes() {
      nodes = [];
      for (var i = 0; i < maxNodes; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.2, // increased speed from 0.5 to 1.2
          vy: (Math.random() - 0.5) * 1.2, // increased speed from 0.5 to 1.2
          size: Math.random() * 4 + 2 // increased size from 1-4 to 2-6
        });
      }
    }
    
    function updateNodes() {
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        
        // Keep within bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      }
    }
    
    function drawConnections() {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x;
          var dy = nodes[i].y - nodes[j].y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            var opacity = 1 - (distance / connectionDistance);
            ctx.strokeStyle = 'rgba(56, 189, 248, ' + opacity * 0.8 + ')'; // increased from 0.4 to 0.8
            ctx.lineWidth = 2; // increased from 1 to 2
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
    }
    
    function drawNodes() {
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        ctx.fillStyle = 'rgba(56, 189, 248, 0.9)'; // increased from 0.6 to 0.9
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a glowing effect
        ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateNodes();
      drawConnections();
      drawNodes();
      animationId = requestAnimationFrame(animate);
    }
    
    // Start animation
    initNodes();
    animate();
    
    // Cleanup function
    window.addEventListener('beforeunload', function() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    });
  })();

})(jQuery); // End of use strict
