import { useEffect } from 'react';

const LaserCanvas = ({ context }) => {
  useEffect(() => {
    if (!context) return;

    const canvas = context.canvas;
    let trail = [];

    const drawLaser = (event) => {
      const { offsetX, offsetY } = event;
      trail.push({ x: offsetX, y: offsetY });

      // Drawing the fading trail
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 0.1;
      context.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      context.lineWidth = 10;

      if (trail.length > 1) {
        context.beginPath();
        context.moveTo(trail[0].x, trail[0].y);

        for (let i = 1; i < trail.length; i++) {
          context.lineTo(trail[i].x, trail[i].y);
        }

        context.stroke();
      }

      if (trail.length > 20) {
        trail.shift();
      }
      context.globalAlpha = 1;
      context.beginPath();
      context.arc(offsetX, offsetY, 10, 0, 2 * Math.PI);
      context.fillStyle = 'rgba(255, 0, 0, 0.8)';
      context.fill();
    };

    canvas.addEventListener('mousemove', drawLaser);

    return () => {
    
      canvas.removeEventListener('mousemove', drawLaser);
    };
  }, [context]);

  return null; 
};

export default LaserCanvas;
