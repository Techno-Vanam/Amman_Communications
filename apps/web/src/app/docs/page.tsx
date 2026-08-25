'use client';

import React, { useEffect } from 'react';
import Head from 'next/head';

export default function SwaggerDocsPage() {
  useEffect(() => {
    // Load Swagger UI CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css';
    document.head.appendChild(link);

    // Load Swagger UI Bundle Script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      // @ts-ignore
      if (window.SwaggerUIBundle) {
        // @ts-ignore
        window.SwaggerUIBundle({
          url: '/swagger.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            // @ts-ignore
            window.SwaggerUIBundle.presets.apis,
            // @ts-ignore
            window.SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: 'BaseLayout',
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#3b4151' }}>
      {/* Top Navbar Banner */}
      <header
        style={{
          background: '#0b0f19',
          color: '#ffffff',
          padding: '1rem 2rem',
          borderBottom: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <span style={{ fontWeight: 800, letterSpacing: '0.05em' }}>
            AMMAN COMMUNICATIONS — API DOCUMENTATION
          </span>
          <span
            style={{
              background: '#10b981',
              color: '#0b0f19',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontWeight: 800,
              fontSize: '0.75rem',
            }}
          >
            OpenAPI 3.0
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <a
            href="/swagger.json"
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#06b6d4',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            📥 swagger.json
          </a>
          <a
            href="/swagger.yaml"
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#06b6d4',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            📥 swagger.yaml
          </a>
          <a
            href="/client/dashboard"
            style={{
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            ← Back to Client Portal
          </a>
        </div>
      </header>

      {/* Container where Swagger UI renders */}
      <div id="swagger-ui" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }} />
    </div>
  );
}
