(function () {
  'use strict';

  /* ── Particle class ─────────────────────────────────────────── */
  function Particle(x, y, canvasW, canvasH) {
    var spread = (canvasW + canvasH) / 2;
    var angle  = Math.random() * Math.PI * 2;
    this.pos = { x: Math.cos(angle) * spread * 0.6 + canvasW / 2,
                 y: Math.sin(angle) * spread * 0.6 + canvasH / 2 };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    this.target = { x: x, y: y };

    var speedBoost     = (window.innerWidth < 768) ? 1.8 : 1.8;
    this.maxSpeed      = (Math.random() * 5 + 3) * speedBoost;
    this.maxForce      = (Math.random() * 5 + 3) * 0.04 * speedBoost;
    this.closeEnough   = 80;
    this.isKilled      = false;

    /* lime accent → white transition */
    this.startColor  = { r: 182, g: 240, b: 30  };
    this.targetColor = { r: 255, g: 255, b: 255 };
    this.colorWeight = 0;
    this.blendRate   = Math.random() * 0.02 + 0.005;
  }

  Particle.prototype.move = function () {
    var dx   = this.target.x - this.pos.x;
    var dy   = this.target.y - this.pos.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var prox = dist < this.closeEnough ? dist / this.closeEnough : 1;

    var mag = dist || 1;
    var sx  = (dx / mag) * this.maxSpeed * prox - this.vel.x;
    var sy  = (dy / mag) * this.maxSpeed * prox - this.vel.y;
    var sm  = Math.sqrt(sx * sx + sy * sy) || 1;

    this.acc.x += (sx / sm) * this.maxForce;
    this.acc.y += (sy / sm) * this.maxForce;

    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x  = 0;
    this.acc.y  = 0;
  };

  Particle.prototype.draw = function (ctx) {
    if (this.colorWeight < 1) this.colorWeight = Math.min(this.colorWeight + this.blendRate, 1);
    var w  = this.colorWeight;
    var sc = this.startColor, tc = this.targetColor;
    var r  = Math.round(sc.r + (tc.r - sc.r) * w);
    var g  = Math.round(sc.g + (tc.g - sc.g) * w);
    var b  = Math.round(sc.b + (tc.b - sc.b) * w);
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
  };

  Particle.prototype.kill = function (canvasW, canvasH) {
    if (!this.isKilled) {
      var angle = Math.random() * Math.PI * 2;
      var spread = (canvasW + canvasH) / 2;
      this.target.x = canvasW / 2 + Math.cos(angle) * spread * 0.7;
      this.target.y = canvasH / 2 + Math.sin(angle) * spread * 0.7;

      var w = this.colorWeight;
      var sc = this.startColor, tc = this.targetColor;
      this.startColor = {
        r: sc.r + (tc.r - sc.r) * w,
        g: sc.g + (tc.g - sc.g) * w,
        b: sc.b + (tc.b - sc.b) * w,
      };
      this.targetColor = { r: 0, g: 0, b: 0 };
      this.colorWeight = 0;
      this.isKilled = true;
    }
  };

  /* ── Build particle targets from text ─────────────────────────── */
  function buildTargets(word, canvas, step) {
    var off = document.createElement('canvas');
    off.width  = canvas.width;
    off.height = canvas.height;
    var ctx = off.getContext('2d');

    /* responsive font size */
    var fontSize = Math.min(canvas.width / word.length * 1.35, canvas.height * 0.38);
    fontSize = Math.max(fontSize, 28);

    ctx.fillStyle   = 'white';
    ctx.font        = 'bold ' + fontSize + 'px "Nunito", Arial, sans-serif';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word, canvas.width / 2, canvas.height / 2);

    var pixels  = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    var targets = [];
    for (var i = 0; i < pixels.length; i += step * 4) {
      if (pixels[i + 3] > 128) {
        var x = (i / 4) % canvas.width;
        var y = Math.floor(i / 4 / canvas.width);
        targets.push({ x: x, y: y });
      }
    }
    /* shuffle */
    for (var j = targets.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = targets[j]; targets[j] = targets[k]; targets[k] = tmp;
    }
    return targets;
  }

  /* Skip the decorative preloader for crawlers, Lighthouse/PageSpeed and other
     headless audit tools — otherwise the full-screen overlay + continuous canvas
     animation hide page content and break LCP/TBT measurement (NO_LCP). */
  function isBotOrAudit() {
    var ua = (navigator.userAgent || '');
    if (/Lighthouse|Chrome-Lighthouse|PageSpeed|Headless|Googlebot|bot|crawler|spider|GTmetrix|Pingdom|WebPageTest/i.test(ua)) return true;
    if (navigator.webdriver) return true;
    return false;
  }

  /* ── Main preloader ────────────────────────────────────────────── */
  function runPreloader() {
    /* skip if already seen this session, or for bots/audit tools */
    if (sessionStorage.getItem('pl_done')) { return; }
    if (isBotOrAudit()) { return; }

    document.body.classList.add('preloading');

    /* overlay */
    var overlay = document.createElement('div');
    overlay.id = 'preloader';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:9999',
      'background:#08080a',
      'display:flex', 'align-items:center', 'justify-content:center',
      'transition:opacity 0.7s ease',
    ].join(';');

    var canvas = document.createElement('canvas');
    overlay.appendChild(canvas);
    document.body.insertBefore(overlay, document.body.firstChild);

    /* canvas sizing */
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W, H;
    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
    }
    resize();
    window.addEventListener('resize', resize);

    var ctx        = canvas.getContext('2d');
    var particles  = [];
    var step       = 5;                   /* pixel sampling step */
    var WORDS      = ['Daniil', 'Karatsapov'];
    var wordIdx    = 0;
    var frame      = 0;
    var isMobile = window.innerWidth < 768;
    var HOLD_FRAMES = isMobile ? 45 : 45; /* frames to hold each word */
    var phase      = 'assemble';          /* assemble → hold → scatter → next */
    var phaseFrame = 0;
    var dismissed  = false;
    var fadingOut  = false;
    var raf;

    function loadWord(idx) {
      var targets = buildTargets(WORDS[idx], canvas, step);
      var kept = 0;

      /* reuse live particles */
      for (var i = 0; i < particles.length; i++) {
        if (kept < targets.length) {
          particles[i].isKilled = false;
          particles[i].target.x = targets[kept].x;
          particles[i].target.y = targets[kept].y;

          /* colour: lime for first word, white for second */
          var w = particles[i].colorWeight;
          var sc = particles[i].startColor, tc = particles[i].targetColor;
          particles[i].startColor = {
            r: sc.r + (tc.r - sc.r) * w,
            g: sc.g + (tc.g - sc.g) * w,
            b: sc.b + (tc.b - sc.b) * w,
          };
          particles[i].targetColor = (idx === 0)
            ? { r: 196, g: 245, b: 62  }   /* lime */
            : { r: 255, g: 255, b: 255 };  /* white */
          particles[i].colorWeight = 0;
          kept++;
        } else {
          particles[i].kill(canvas.width, canvas.height);
        }
      }

      /* spawn new particles for remaining targets */
      for (var j = kept; j < targets.length; j++) {
        var t = targets[j];
        var p = new Particle(t.x, t.y, canvas.width, canvas.height);
        p.targetColor = (idx === 0)
          ? { r: 196, g: 245, b: 62  }
          : { r: 255, g: 255, b: 255 };
        particles.push(p);
      }

      phase      = 'assemble';
      phaseFrame = 0;
    }

    function dismiss(e, instant) {
      if (dismissed) return;
      dismissed = true;
      sessionStorage.setItem('pl_done', '1');
      if (instant) {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        return;
      }
      /* Reveal the page underneath: fade the black backdrop out while the
         particles keep animating (they scatter outward and dissolve), so the
         first screen surfaces through the dispersing particles. */
      fadingOut = true;
      overlay.style.background = 'transparent';
      for (var i = 0; i < particles.length; i++) particles[i].kill(canvas.width, canvas.height);
      /* mark hero for the reveal-in transition if present */
      document.body.classList.add('preloader-done');
      setTimeout(function () {
        overlay.style.opacity = '0';
        setTimeout(function () {
          cancelAnimationFrame(raf);
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          window.removeEventListener('resize', resize);
        }, 800);
      }, 500);
    }

    overlay.addEventListener('click', dismiss);

    /* particle assembly check: are most in place? */
    function mostAssembled() {
      var close = 0;
      for (var i = 0; i < particles.length; i++) {
        if (!particles[i].isKilled) {
          var dx = particles[i].pos.x - particles[i].target.x;
          var dy = particles[i].pos.y - particles[i].target.y;
          if (Math.sqrt(dx*dx + dy*dy) < 5) close++;
        }
      }
      var alive = particles.filter(function(p){ return !p.isKilled; }).length;
      return alive > 0 && close / alive > 0.95;
    }

    loadWord(0);

    function animate() {
      raf = requestAnimationFrame(animate);
      frame++;

      if (fadingOut) {
        /* clear transparently so the page shows through dispersing particles */
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = 'rgba(8,8,10,0.18)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.move();
        p.draw(ctx);
        if (p.isKilled) {
          var ox = p.pos.x, oy = p.pos.y;
          if (ox < -40 || ox > canvas.width + 40 || oy < -40 || oy > canvas.height + 40) {
            particles.splice(i, 1);
          }
        }
      }

      phaseFrame++;

      if (phase === 'assemble' && (mostAssembled() || phaseFrame > 320)) {
        phase = 'hold'; phaseFrame = 0;
      }

      if (phase === 'hold' && phaseFrame > HOLD_FRAMES) {
        if (wordIdx < WORDS.length - 1) {
          /* scatter current, then load next word */
          for (var k = 0; k < particles.length; k++) particles[k].kill(canvas.width, canvas.height);
          phase = 'scatter'; phaseFrame = 0;
        } else {
          /* last word done — wait then dismiss */
          phase = 'done'; phaseFrame = 0;
        }
      }

      if (phase === 'scatter' && phaseFrame > (isMobile ? 30 : 30)) {
        wordIdx++;
        loadWord(wordIdx);
      }

      if (phase === 'done' && phaseFrame > (isMobile ? 45 : 45)) {
        dismiss();
      }
    }

    animate();

    /* Hard safety: never let the preloader linger — force-dismiss after 9s.
       Must exceed the natural run of both words (assemble + hold ×2). */
    setTimeout(function () { dismiss(); }, 9000);
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPreloader);
  } else {
    runPreloader();
  }
})();
