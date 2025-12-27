/**
 * STRESS TOY CANVAS COMPONENT
 * 
 * PRIVACY GUARANTEE:
 * - All interactions happen locally in the browser
 * - No click data, interaction patterns, or user behavior is tracked
 * - Canvas rendering is purely client-side
 * - No external assets are loaded
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface Target {
  x: number;
  y: number;
  radius: number;
  hits: number;
  shake: number;
  emotion: string;
}

export default function StressToy() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hitCount, setHitCount] = useState(0);
  const [message, setMessage] = useState('Click/tap to punch! 👊');
  const particlesRef = useRef<Particle[]>([]);
  const targetRef = useRef<Target>({
    x: 200,
    y: 150,
    radius: 60,
    hits: 0,
    shake: 0,
    emotion: '😐',
  });
  const animationFrameRef = useRef<number | null>(null);

  // Create explosion particles
  const createParticles = useCallback((x: number, y: number) => {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff66c4'];
    const newParticles: Particle[] = [];
    const count = 15 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 3 + Math.random() * 5;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10,
      });
    }
    
    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  // Handle click/tap
  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    const emotions = ['😐', '😣', '😫', '😵', '💀', '🤕', '😵‍💫', '🥴'];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const target = targetRef.current;

    // Check if hit target
    const distance = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
    
    if (distance <= target.radius + 20) {
      // Hit!
      target.hits++;
      target.shake = 15;
      setHitCount(target.hits);
      createParticles(x, y);

      // Update emotion
      const emotionIndex = Math.min(Math.floor(target.hits / 5), emotions.length - 1);
      target.emotion = emotions[emotionIndex];

      // Update message
      if (target.hits < 5) {
        setMessage('Keep going! 💪');
      } else if (target.hits < 15) {
        setMessage("That's it! Let it out! 🔥");
      } else if (target.hits < 30) {
        setMessage('UNLEASH YOUR FURY! ⚡');
      } else if (target.hits < 50) {
        setMessage('MAXIMUM POWER! 💥');
      } else {
        setMessage('YOU ARE UNSTOPPABLE! 🌟');
      }
    } else {
      // Missed
      createParticles(x, y);
      setMessage('Almost! Try again! 🎯');
    }
  }, [createParticles]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  const handleTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      handleInteraction(touch.clientX, touch.clientY);
    }
  }, [handleInteraction]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 300;
      targetRef.current.x = canvas.width / 2;
      targetRef.current.y = canvas.height / 2;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw target
      const target = targetRef.current;
      
      // Apply shake
      const shakeX = target.shake > 0 ? (Math.random() - 0.5) * target.shake : 0;
      const shakeY = target.shake > 0 ? (Math.random() - 0.5) * target.shake : 0;
      target.shake *= 0.9;

      // Draw target glow
      const glowGradient = ctx.createRadialGradient(
        target.x + shakeX, target.y + shakeY, target.radius * 0.5,
        target.x + shakeX, target.y + shakeY, target.radius * 1.5
      );
      glowGradient.addColorStop(0, 'rgba(255, 107, 107, 0.3)');
      glowGradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(target.x + shakeX, target.y + shakeY, target.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw target circle
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(target.x + shakeX, target.y + shakeY, target.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw inner circle
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(target.x + shakeX, target.y + shakeY, target.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Draw emotion
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(target.emotion, target.x + shakeX, target.y + shakeY);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life -= 0.02;

        if (p.life <= 0) return false;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        return true;
      });

      // Draw hit counter
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Hits: ${target.hits}`, 20, 30);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Reset function
  const handleReset = useCallback(() => {
    targetRef.current.hits = 0;
    targetRef.current.emotion = '😐';
    targetRef.current.shake = 0;
    setHitCount(0);
    setMessage('Click/tap to punch! 👊');
    particlesRef.current = [];
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">
          🥊 Stress Relief Punching Bag
        </h2>
        <p className="text-slate-400 text-sm">
          {message}
        </p>
      </div>

      <div ref={containerRef} className="rounded-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onTouchStart={handleTouch}
          className="w-full cursor-pointer touch-none"
          style={{ touchAction: 'none' }}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="text-slate-300">
          Total Hits: <span className="font-bold text-white">{hitCount}</span>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
        >
          🔄 Reset
        </button>
      </div>

      {/* Privacy notice */}
      <p className="text-xs text-center text-slate-500 mt-4">
        🔒 No interaction data is tracked or stored anywhere.
      </p>
    </div>
  );
}
