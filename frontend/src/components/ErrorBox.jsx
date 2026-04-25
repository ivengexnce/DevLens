import React from 'react';

export default function ErrorBox({ message }) {
  return (
    <div
      className="rounded-lg px-4 py-3 text-sm"
      style={{
        background: 'rgba(255,107,107,0.08)',
        border: '1px solid rgba(255,107,107,0.25)',
        color: '#ff6b6b',
      }}
    >
      <strong>Error:</strong> {message}
      <br />
      <span className="text-xs" style={{ color: '#6b7280' }}>
        Check the username or try again. GitHub API rate limits may apply.
      </span>
    </div>
  );
}
