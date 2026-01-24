'use client';

import { useEffect, useRef } from 'react';

export default function StrataBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Geological layers
    const layers = [
      { y: 0, height: 200, color: '#1a1a1a' }, // Topsoil
      { y: 200, height: 150, color: '#2a2520' }, // Clay
      { y: 350, height: 200, color: '#3d3428' }, // Sandstone
      { y: 550, height: 180, color: '#4a3f2f' }, // Limestone
      { y: 730, height: 150, color: '#2d2416' }, // Shale
      { y: 880, height: 200, color: '#1a1410' }, // Oil reservoir
    ];

    let scrollY = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      layers.forEach((layer, index) => {
        const parallaxSpeed = 1 + index * 0.1;
        const offsetY = scrollY * parallaxSpeed * 0.3;

        // Create gradient for depth
        const gradient = ctx.createLinearGradient(0, layer.y - offsetY, 0, layer.y + layer.height - offsetY);
        gradient.addColorStop(0, layer.color);
        gradient.addColorStop(1, adjustBrightness(layer.color, -20));

        ctx.fillStyle = gradient;
        ctx.fillRect(0, layer.y - offsetY, canvas.width, layer.height);

        // Add texture lines
        ctx.strokeStyle = adjustBrightness(layer.color, -10);
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const lineY = layer.y + (layer.height / 5) * i - offsetY;
          ctx.beginPath();
          ctx.moveTo(0, lineY);
          ctx.lineTo(canvas.width, lineY);
          ctx.stroke();
        }
      });
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
      draw();
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    draw();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-30"
    />
  );
}

// Helper to adjust color brightness
function adjustBrightness(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
