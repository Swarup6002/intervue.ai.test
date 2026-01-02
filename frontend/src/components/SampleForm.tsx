import React, { useState } from 'react';

export default function SampleForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert(`Submitted: ${name} <${email}>`); }}>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input className="mt-1 block w-full rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 block w-full rounded border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button type="submit" className="px-4 py-2 bg-accent text-background rounded">Submit</button>
    </form>
  );
}
