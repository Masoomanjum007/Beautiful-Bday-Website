import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CONFIG = {
  starCount: 100,
  heartCount: 15,
  fireworkInterval: 1800,
};

const CanvasBackground = ({ giftOpened }) => {
  const canvasRef = useRef(null);
  const data = useRef({
    stars: [],
    hearts: [],
    fireworks: [],
    ribbons: [],
    sparkles: [],
    lastFirework: 0,
    hasBurst: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rand = (a, b) => Math.random() * (b - a) + a;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      data.current.stars = [];
      for (let i = 0; i < CONFIG.starCount; i++) {
        data.current.stars.push({
          x: rand(0, canvas.width), y: rand(0, canvas.height),
          r: rand(0.3, 2.0), alpha: rand(0.3, 1),
          twinkleSpeed: rand(0.004, 0.02), twinkleDir: 1, drift: rand(-0.04, 0.04)
        });
      }
    };

    const spawnHeart = () => {
      data.current.hearts.push({
        x: rand(0, canvas.width), y: rand(canvas.height, canvas.height + 300),
        size: rand(5, 15), alpha: rand(0.2, 0.6), speed: rand(0.3, 1.1),
        sway: rand(0.5, 1.5), swayOffset: rand(0, Math.PI * 2), hue: rand(320, 360)
      });
    };

    const explodeSupernova = (x, y, hue) => {
      const particleCount = 150 + Math.floor(rand(0, 80));
      for (let i = 0; i < particleCount; i++) {
          const angle = rand(0, Math.PI * 2);
          const speed = rand(1, 10);
          data.current.ribbons.push({
              points: [{x, y}],
              vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
              hue: (hue + rand(0, 30)) % 360, alpha: 1, decay: rand(0.008, 0.018),
              gravity: 0.05, friction: 0.97, width: rand(2, 5), flicker: Math.random() < 0.3
          });
      }
    };

    const launchFirework = (isBurst = false) => {
      const startX = isBurst ? (canvas.width / 2 + rand(-300, 300)) : rand(canvas.width * 0.1, canvas.width * 0.9);
      const targetY = rand(canvas.height * 0.05, canvas.height * 0.4);
      data.current.fireworks.push({
        x: startX, y: canvas.height, targetY: targetY,
        vx: isBurst ? rand(-2, 2) : rand(-1, 1), 
        vy: -rand(12, 18), 
        hue: rand(0, 360),
        history: [], maxHistory: 15
      });
    };

    const launchBurst = (count) => {
      if (data.current.hasBurst) return;
      data.current.hasBurst = true;
      for (let i = 0; i < count; i++) {
        setTimeout(() => launchFirework(true), i * 140);
      }
    };

    // Trigger burst on open
    if (giftOpened && !data.current.hasBurst) {
       launchBurst(12);
    }

    resize();
    for (let i = 0; i < CONFIG.heartCount; i++) spawnHeart();
    window.addEventListener('resize', resize);

    let animFrame;
    const loop = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars
      data.current.stars.forEach(s => {
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha >= 1) s.twinkleDir = -1; else if (s.alpha <= 0.1) s.twinkleDir = 1;
        s.y += s.drift; if (s.y < -2) s.y = canvas.height + 2; else if (s.y > canvas.height + 2) s.y = -2;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,245,255,${s.alpha})`; ctx.fill();
      });

      // Hearts
      for (let i = data.current.hearts.length - 1; i >= 0; i--) {
        const h = data.current.hearts[i];
        h.y -= h.speed; h.x += Math.sin(time * 0.001 + h.swayOffset) * 0.3;
        if (h.y < -30) { data.current.hearts.splice(i, 1); spawnHeart(); continue; }
        ctx.beginPath(); ctx.save(); ctx.translate(h.x, h.y);
        const s = h.size;
        ctx.moveTo(0, s * 0.3); ctx.bezierCurveTo(-s, -s * 0.4, -s, s * 0.6, 0, s); ctx.bezierCurveTo(s, s * 0.6, s, -s * 0.4, 0, s * 0.3);
        ctx.fillStyle = `hsla(${h.hue}, 85%, 75%, ${h.alpha})`; ctx.fill(); ctx.restore();
      }

      // Fireworks
      if (giftOpened) {
        if (time - data.current.lastFirework > CONFIG.fireworkInterval) {
          launchFirework();
          data.current.lastFirework = time;
        }

        for (let i = data.current.fireworks.length - 1; i >= 0; i--) {
          const fw = data.current.fireworks[i];
          fw.x += fw.vx; fw.y += fw.vy; fw.vy += 0.06; fw.vx *= 0.99;
          fw.history.push({x: fw.x, y: fw.y}); if (fw.history.length > fw.maxHistory) fw.history.shift();
          
          ctx.beginPath(); ctx.moveTo(fw.history[0].x, fw.history[0].y);
          fw.history.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.strokeStyle = `hsla(${fw.hue}, 100%, 75%, 0.3)`; ctx.stroke();

          if (fw.vy >= 0 || fw.y <= fw.targetY) {
            explodeSupernova(fw.x, fw.y, fw.hue);
            data.current.fireworks.splice(i, 1);
          }
        }

        // Ribbons
        for (let i = data.current.ribbons.length - 1; i >= 0; i--) {
          const r = data.current.ribbons[i];
          const last = r.points[r.points.length-1];
          r.vx *= r.friction; r.vy *= r.friction; r.vy += r.gravity; r.alpha -= r.decay;
          if (r.alpha <= 0) { data.current.ribbons.splice(i, 1); continue; }
          const next = { x: last.x + r.vx, y: last.y + r.vy };
          r.points.push(next); if (r.points.length > 15) r.points.shift();
          
          if (r.flicker && Math.random() < 0.2) continue;
          ctx.beginPath(); ctx.moveTo(r.points[0].x, r.points[0].y);
          r.points.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.strokeStyle = `hsla(${r.hue}, 100%, 75%, ${r.alpha})`;
          ctx.lineWidth = r.width * r.alpha; ctx.stroke();
        }
      }

      animFrame = requestAnimationFrame(loop);
    };
    animFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, [giftOpened]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: giftOpened ? 105 : 0, pointerEvents: 'none' }} />;
};

export default CanvasBackground;
