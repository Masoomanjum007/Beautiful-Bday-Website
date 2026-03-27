import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import CanvasBackground from './components/CanvasBackground';
import myAudioFile from './assets/music.mp3'; 

const CONFIG = {
  loveMessage:
    `My moon in the night sky 🌙...\n` +
    `Happy Birthday Mansha❤️!!, the most beautiful soul I've ever met 💖.\n` +
    `I get a bit lost in thoughts of you, and the silence of previous days was just me missing your smile 😊.\n` +
    `May Allah Almighty give you all the happiness of your life ❤️ and make you more gorgeous 💫.\n` +
    `I love you, and I'll wait for the day you feel the same 🌹.`,
  typingStagger: 0.02, 
};

export default function App() {
  const [giftOpened, setGiftOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trig, setTrig] = useState(false);
  
  const audioRef = useRef(null);
  const messageRef = useRef(null);
  const parchmentRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const giftBtnRef = useRef(null);
  const landingRef = useRef(null);
  const cakeWrapRef = useRef(null);
  const giftSceneRef = useRef(null);

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.log("Music Error:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleOpenGift = () => {
    setGiftOpened(true);
    if (!isPlaying) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    document.documentElement.classList.add('unlocked');
  };

  useEffect(() => {
    if (!giftOpened && line1Ref.current) {
      gsap.to(line1Ref.current, { opacity: 1, y: 0, duration: 1.5, delay: 0.5 });
      gsap.to(line2Ref.current, { opacity: 1, y: 0, duration: 1.8, delay: 0.8 });
      gsap.to(giftBtnRef.current, { opacity: 1, y: 0, duration: 1.5, delay: 1.2, ease: 'elastic.out(1, 0.6)' });
    }
  }, [giftOpened]);

  useEffect(() => {
    if (giftOpened) {
      const tl = gsap.timeline();
      tl.to(landingRef.current, { opacity: 0, scale: 0.9, duration: 1.0, onComplete: () => {
          if(landingRef.current) landingRef.current.style.display = 'none';
      }});
      tl.to('.curtain-left', { x: '-110%', duration: 2.2, ease: 'power4.inOut' }, '+=0.2');
      tl.to('.curtain-right', { x: '110%', duration: 2.2, ease: 'power4.inOut' }, '<');
      tl.to(cakeWrapRef.current, { opacity: 1, y: 0, scale: 1, duration: 2.0, ease: 'elastic.out(1, 0.7)' }, '-=1.4');
      gsap.to('.cake', { y: -15, rotation: 1.5, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      tl.call(() => {
        if (giftSceneRef.current) {
            giftSceneRef.current.style.position = 'relative';
            document.documentElement.classList.add('unlocked');
            document.body.classList.add('unlocked');
        }
      }, null, '+=0.8');
    }
  }, [giftOpened]);

  const startTyping = () => {
    if (!messageRef.current || trig) return;
    setTrig(true);
    const container = messageRef.current;
    container.innerHTML = '';
    const spans = CONFIG.loveMessage.split('').map(ch => {
      if (ch === '\n') {
        container.appendChild(document.createElement('br'));
        container.appendChild(document.createElement('br'));
        return null;
      }
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch;
      s.style.opacity = '0';
      s.style.display = 'inline';
      container.appendChild(s);
      return s;
    }).filter(s => s !== null);

    gsap.to(spans, { opacity: 1, duration: 0.18, stagger: CONFIG.typingStagger, ease: 'none' });
  };

  useEffect(() => {
    if (giftOpened && parchmentRef.current) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          gsap.to(parchmentRef.current, { opacity: 1, scaleY: 1, scaleX: 1, duration: 1.5, ease: 'power4.out', onComplete: startTyping });
          observer.disconnect();
        }
      }, { threshold: 0.2 });
      observer.observe(parchmentRef.current);
      return () => observer.disconnect();
    }
  }, [giftOpened]);

  return (
    <div className="app-container">
      <CanvasBackground giftOpened={giftOpened} />
      <div className="music-controls">
        <button className={`music-btn ${isPlaying ? 'playing' : ''}`} onClick={toggleMusic}>
          <span className="music-icon">🎵</span>
          <span className="music-text">{isPlaying ? 'Pause' : 'Music'}</span>
        </button>
        <audio ref={audioRef} src={myAudioFile} loop preload="auto" />
      </div>

      {!giftOpened ? (
        <section key="landing" ref={landingRef} id="landing" className="scene active" style={{ opacity: 1, pointerEvents: 'auto' }}>
          <div className="landing-content">
            <h1 className="landing-title">
              <span ref={line1Ref} className="line1" style={{ opacity: 0, transform: 'translateY(20px)' }}>A Little Surprise</span>
              <span ref={line2Ref} className="line2" style={{ opacity: 0, transform: 'translateY(20px)' }}>Just For You</span>
            </h1>
            <button ref={giftBtnRef} className="gift-btn" onClick={handleOpenGift} style={{ opacity: 0, transform: 'translateY(20px)' }}>
              <span className="btn-emoji">🎁</span>
              <span className="btn-text">Open the Gift</span>
            </button>
          </div>
        </section>
      ) : (
        <div key="flow" className="main-flow">
          <section ref={giftSceneRef} id="giftScene" className="scene active" style={{ opacity: 1, pointerEvents: 'auto' }}>
            <div className="curtain curtain-left"></div>
            <div className="curtain curtain-right"></div>
            <div className="cake-wrap" ref={cakeWrapRef} style={{ opacity: 0, transform: 'translateY(60px) scale(0.8)' }}>
              <div className="cake" id="cakeEl">
                <div className="candles">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="candle"><div className="flame"><div className="flame-inner"></div></div></div>
                  ))}
                </div>
                <div className="cake-tier tier-top"><div className="tier-deco"></div></div>
                <div className="cake-tier tier-middle"><div className="tier-deco"></div></div>
                <div className="cake-tier tier-bottom"><div className="tier-deco"></div></div>
                <div className="cake-plate"></div>
              </div>
            </div>
          </section>
          <section id="messageScene" className="scene active" style={{ opacity: 1, pointerEvents: 'auto' }}>
             <div className="scroll-parchment" ref={parchmentRef} style={{ opacity: 0, transform: 'scaleY(0)' }}>
               <div className="scroll-edge scroll-edge-top"></div>
               <div className="scroll-body"><div className="msg-text" ref={messageRef}>Revealing Mansha's surprise...</div></div>
               <div className="scroll-edge scroll-edge-bottom"></div>
             </div>
          </section>
          <footer id="footer" className="scene active" style={{ opacity: 1 }}><p className="footer-text">Made with Love ❤️</p></footer>
        </div>
      )}
    </div>
  );
}