import React from 'react';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <section 
      style={{
        paddingTop: 'var(--spacing-24)',
        paddingBottom: 'var(--spacing-16)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '400px',
        height: '400px',
        background: 'var(--color-accent-primary)',
        filter: 'blur(150px)',
        opacity: 0.2,
        borderRadius: '50%',
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'var(--color-accent-tertiary)',
        filter: 'blur(120px)',
        opacity: 0.15,
        borderRadius: '50%',
        zIndex: -1
      }} />

      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="animate-fade-in" style={{ fontSize: 'var(--font-size-5xl)', marginBottom: 'var(--spacing-6)' }}>
            Elevate Your Workflow at <br />
            <span className="text-gradient">Ur-Space</span>
          </h1>
          <p className="animate-fade-in delay-100" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-8)' }}>
            Experience premium coworking environments designed for innovators, creators, and teams. Flexible spaces, inspiring community, and limitless potential.
          </p>
          <div className="animate-fade-in delay-200" style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--spacing-4) var(--spacing-8)' }}>
              Explore Spaces
            </button>
            <button className="btn btn-secondary" style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--spacing-4) var(--spacing-8)' }}>
              Take a Tour
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
