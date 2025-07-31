import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function DiagramViewer({ diagramCode }) {
  const containerRef = useRef(null);
  const renderTimeout = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any previous render timeout
    if (renderTimeout.current) {
      clearTimeout(renderTimeout.current);
    }

    renderTimeout.current = setTimeout(() => {
      if (diagramCode && diagramCode.startsWith('%% Error:')) {
        containerRef.current.innerHTML = `<div style="color:red; padding:16px;">${diagramCode.replace('%% Error:', 'Error:')}</div>`;
        return;
      }

      if (!diagramCode || !diagramCode.trim().startsWith('erDiagram')) {
        containerRef.current.innerHTML = '<div style="color:gray; padding:16px;">No diagram to display</div>';
        return;
      }

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
        });

        const renderId = 'mermaid-diagram';

        mermaid.render(renderId, diagramCode).then(({ svg }) => {
          containerRef.current.innerHTML = svg;
        }).catch(err => {
          containerRef.current.innerHTML = `<div style="color:red; padding:16px;">Diagram error: ${err.message}</div>`;
        });
      } catch (err) {
        containerRef.current.innerHTML = `<div style="color:red; padding:16px;">Diagram error: ${err.message}</div>`;
      }
    }, 300); // debounce delay

    return () => clearTimeout(renderTimeout.current);
  }, [diagramCode]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--bg-secondary)',
        overflow: 'auto',
        padding: '16px'
      }}
    />
  );
}
