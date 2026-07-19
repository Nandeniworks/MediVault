import React, { useRef } from 'react';
import type { HTMLAttributes, MouseEvent } from 'react';
import './Card.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactiveGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glow = false,
  hoverable = false,
  padding = 'md',
  interactiveGlow = false,
  className = '',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!interactiveGlow || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--x', `${x}px`);
    cardRef.current.style.setProperty('--y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`card card-pad-${padding} ${glow ? 'card-glow' : ''} ${hoverable ? 'card-hoverable' : ''} ${interactiveGlow ? 'card-interactive' : ''} ${className}`}
      {...props}
    >
      <div className="card-border-overlay"></div>
      <div className="card-content-inner">{children}</div>
    </div>
  );
};
