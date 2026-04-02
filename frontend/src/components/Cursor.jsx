import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function Cursor() {
  const { pathname } = useLocation();
  const curRef = useRef(null);
  const curRRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (pathname.includes('/admin')) {
      document.body.classList.add('admin-mode');
    } else {
      document.body.classList.remove('admin-mode');
    }
  }, [pathname]);

  if (pathname.includes('/admin')) {
    return null;
  }

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;

    const handleMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!isVisible) setIsVisible(true);
      
      if (curRef.current) {
        curRef.current.style.left = `${mx}px`;
        curRef.current.style.top = `${my}px`;
      }

      // Dynamic hover detection via event delegation
      const target = e.target;
      const isInteractive = target && (
        target.closest('a, button, [role="button"], .ep-card, .ev-card, .poster, .m-item, .rev-card, .fc-card, .stat-item, .nav-link')
      );
      setIsHovered(!!isInteractive);
    };

    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (curRRef.current) {
        curRRef.current.style.left = `${rx}px`;
        curRRef.current.style.top = `${ry}px`;
      }
      requestAnimationFrame(animate);
    };

    const handleMouseOut = (e) => {
      if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    const frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(frame);
    };
  }, []);

  const gold = '#c9a84c';

  return (
    <>
      <div 
        ref={curRef}
        style={{
          width: isHovered ? '12px' : '6px',
          height: isHovered ? '12px' : '6px',
          background: gold,
          borderRadius: '50%',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 9999999,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s, height 0.2s',
          opacity: isVisible ? 1 : 0,
          mixBlendMode: 'difference'
        }}
      />
      <div 
        ref={curRRef}
        style={{
          width: isHovered ? '50px' : '32px',
          height: isHovered ? '50px' : '32px',
          border: `1px solid ${gold}`,
          borderRadius: '50%',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 2147483646, // MAX-1 Z-INDEX
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.15s, height 0.15s',
          opacity: isVisible ? 0.4 : 0
        }}
      />
    </>
  );
}
