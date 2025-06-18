'use client';
import React, { useState } from 'react';

export default function VoiturePage() {
  const [depart, setDepart] = useState('');
  const [destination, setDestination] = useState('');

  const handleCommander = () => {
    if (!depart || !destination) {
      alert("Remplis les deux champs !");
      return;
    }

    alert(Voiture commandée de "${depart}" vers "${destination}");
  };

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Commander une voiture</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Lieu de départ"
          value={depart}
          onChange={(e) => setDepart(e.target.value)}
          className="w-full p-3 rounded-lg border"
        />

        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full p-3 rounded-lg border"
        />

        <button
          onClick={handleCommander}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Commander
        </button>
      </div>
    </main>
  );
}