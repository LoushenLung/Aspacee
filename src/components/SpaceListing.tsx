"use client";

import React from 'react';
import Image from 'next/image';

const spaces = [
  {
    id: 1,
    name: 'The Greenhouse',
    type: 'Dedicated Desk',
    price: '$299/mo',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    features: ['24/7 Access', 'Ergonomic Chair', 'Lockable Storage']
  },
  {
    id: 2,
    name: 'Innovation Lab',
    type: 'Private Office',
    price: '$899/mo',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
    features: ['Up to 4 people', 'Whiteboard Wall', 'High-Speed LAN']
  },
  {
    id: 3,
    name: 'Creator Studio',
    type: 'Hot Desk',
    price: '$199/mo',
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=800',
    features: ['Flexible Seating', 'Free Coffee', 'Networking Events']
  }
];

const SpaceListing: React.FC = () => {
  return (
    <section id="spaces" style={{ padding: 'var(--spacing-16) 0', background: 'var(--color-bg-secondary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
          <h2 style={{ fontSize: 'var(--font-size-4xl)' }}>Find Your Perfect <span className="text-gradient">Workspace</span></h2>
          <p style={{ fontSize: 'var(--font-size-lg)', maxWidth: '600px', margin: '0 auto' }}>
            Whether you are a solo freelancer or a growing team, we have the ideal environment to fuel your productivity.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 'var(--spacing-8)' 
        }}>
          {spaces.map(space => (
            <div key={space.id} className="glass-panel" style={{ 
              overflow: 'hidden', 
              transition: 'transform var(--transition-normal)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <Image src={space.image} alt={space.name} fill style={{ objectFit: 'cover' }} unoptimized />
              </div>
              <div style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>{space.name}</h3>
                    <span style={{ color: 'var(--color-accent-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      {space.type}
                    </span>
                  </div>
                  <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>
                    {space.price}
                  </div>
                </div>
                
                <ul style={{ listStyle: 'none', marginBottom: 'var(--spacing-6)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {space.features.map((feature, idx) => (
                    <li key={idx} style={{ marginBottom: 'var(--spacing-2)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                      <span style={{ color: 'var(--color-success)' }}>✓</span> {feature}
                    </li>
                  ))}
                </ul>

                <button className="btn btn-secondary" style={{ width: '100%' }}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpaceListing;
