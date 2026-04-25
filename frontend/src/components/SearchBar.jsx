import React, { useState } from 'react';

const DEMO_USERS = ['torvalds', 'gaearon', 'sindresorhus', 'tj', 'yyx990803', 'nicolo-ribaudo'];

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  const loadDemo = () => {
    const pick = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
    setValue(pick);
    onSearch(pick);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        className="input flex-1"
        type="text"
        placeholder="Enter GitHub username…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
        autoFocus
      />
      <button className="btn btn-primary" type="submit" disabled={loading || !value.trim()}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Analyzing
          </span>
        ) : (
          'Analyze'
        )}
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={loadDemo}
        disabled={loading}
      >
        Demo
      </button>
    </form>
  );
}
