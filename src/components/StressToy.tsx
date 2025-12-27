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
  const [message, setMessage] = useState('Click or tap the target');
  const particlesRef = useRef<Particle[]>([]);
  const targetRef = useRef<Target>({
    x: 200,
    y: 150,
    radius: 50,
    hits: 0,
    shake: 0,
    emotion: '😐',
  });
  const animationFrameRef = useRef<number | null>(null);

  // Create explosion particles
  const createParticles = useCallback((x: number, y: number) => {
    const colors = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
    const newParticles: Particle[] = [];
    const count = 12 + Math.floor(Math.random() * 8);
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
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
      target.shake = 12;
      setHitCount(target.hits);
      createParticles(x, y);

      // Update emotion
      const emotionIndex = Math.min(Math.floor(target.hits / 5), emotions.length - 1);
      target.emotion = emotions[emotionIndex];

      // Update message
      if (target.hits < 5) {
        setMessage('Keep going! 💪');
      } else if (target.hits < 15) {
        setMessage("That's it! Let it out!");
      } else if (target.hits < 30) {
        setMessage('UNLEASH YOUR FURY! ⚡');
      } else if (target.hits < 50) {
        setMessage('MAXIMUM POWER! 💥');
      } else {
        setMessage('UNSTOPPABLE! 🌟');
      }
    } else {
      // Missed
      createParticles(x, y);
      setMessage('Try again! 🎯');
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
      canvas.height = 280;
      targetRef.current.x = canvas.width / 2;
      targetRef.current.y = canvas.height / 2;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update and draw target
      const target = targetRef.current;
      
      // Apply shake
      const shakeX = target.shake > 0 ? (Math.random() - 0.5) * target.shake : 0;
      const shakeY = target.shake > 0 ? (Math.random() - 0.5) * target.shake : 0;
      target.shake *= 0.9;

      // Draw target glow
      const glowGradient = ctx.createRadialGradient(
        target.x + shakeX, target.y + shakeY, target.radius * 0.5,
        target.x + shakeX, target.y + shakeY, target.radius * 2
      );
      glowGradient.addColorStop(0, 'rgba(244, 63, 94, 0.2)');
      glowGradient.addColorStop(1, 'rgba(244, 63, 94, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(target.x + shakeX, target.y + shakeY, target.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw outer ring
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(target.x + shakeX, target.y + shakeY, target.radius + 10, 0, Math.PI * 2);
      ctx.stroke();

      // Draw target circle with gradient
      const targetGradient = ctx.createRadialGradient(
        target.x + shakeX - target.radius * 0.3, 
        target.y + shakeY - target.radius * 0.3, 
        0,
        target.x + shakeX, target.y + shakeY, target.radius
      );
      targetGradient.addColorStop(0, '#fb7185');
      targetGradient.addColorStop(1, '#e11d48');
      ctx.fillStyle = targetGradient;
      ctx.beginPath();
      ctx.arc(target.x + shakeX, target.y + shakeY, target.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw emotion
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(target.emotion, target.x + shakeX, target.y + shakeY);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life -= 0.025;

        if (p.life <= 0) return false;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        return true;
      });

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
    setMessage('Click or tap the target');
    particlesRef.current = [];
  }, []);

  return (
    <div className="glass-card rounded-3xl p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          Stress Relief
        </h2>
        <p className="text-sm text-zinc-500">
          {message}
        </p>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="rounded-2xl overflow-hidden mb-6 bg-zinc-900/50 border border-white/5">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          onTouchStart={handleTouch}
          className="w-full cursor-pointer touch-none"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{hitCount}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Hits</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl text-sm font-medium
            bg-zinc-800 text-zinc-400 border border-white/10
            hover:bg-zinc-700 hover:text-white transition-all duration-300"
        >
          Reset
        </button>
      </div>

      {/* Privacy badge */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400">No tracking whatsoever</span>
        </div>
      </div>
    </div>
  );
}
