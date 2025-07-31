import React from 'react';

const CompileErrorsViewer = ({ diagnostics, onErrorClick }) => {
  if (!diagnostics || diagnostics.diags.length === 0) return null;

  return (
    <div style={{ color: '#b00020' }}>
      {diagnostics.diags.map((diag, index) => {
        const message = diag.message || diag.error || 'Unknown error';
        const line = diag.location?.start?.line ?? '?';
        const column = diag.location?.start?.column ?? '?';

        return (
          <ul key={index} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
            <li onClick={() => onErrorClick?.(diag)}>
              <strong>❌</strong> {message}
              <strong> 📍</strong> Line {line}, Column {column}
              <strong> 🧾 Code:</strong> {diag.code || 'N/A'}
            </li>
          </ul>
        );
      })}
    </div>
  );
};

export default CompileErrorsViewer;
