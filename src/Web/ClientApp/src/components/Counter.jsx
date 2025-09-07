import React, { useState } from 'react';

function Counter() {
  const [currentCount, setCurrentCount] = useState(0);

  const incrementCounter = () => {
    setCurrentCount(currentCount + 1);
  };

  return (
    <div>
      <h1>Counter Test</h1>

      <p>This is a simple example of a React component.</p>

      <p aria-live="polite">Current count: <strong>{currentCount}</strong></p>

      <button className="btn btn-secondary" onClick={incrementCounter}>Increment</button>
    </div>
  );
}

export default Counter;