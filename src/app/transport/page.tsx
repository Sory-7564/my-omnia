'use client';

import { useState } from 'react';

export default function Transport() {
  const [type, setType] = useState('');
  const [details, setDetails] = useState({
    depart: '',
    destination: '',
    heure: '',
    infos: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Demande ${type?.toUpperCase()} : ${JSON.stringify(details, null, 2)}`);
  };

  return (
    <main className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Quel type de transport souhaitez-vous ?</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={() => setType('voiture')}
          className={`flex-1 p-4 rounded-lg border ${
            type === 'voiture' ? 'bg-blue-600' : 'bg-gray-800'
          }`}
        >
          Voiture
        </button>
        <button
          onClick={() => setType('moto')}
          className={`flex-1 p-4 rounded-lg border ${
            type === 'moto' ? 'bg-blue-600' : 'bg-gray-800'
          }`}
        >
          Moto
        </button>
        <button
          onClick={() => setType('livreur')}
          className={`flex-1 p-4 rounded-lg border ${
            type === 'livreur' ? 'bg-blue-600' : 'bg-gray-800'
          }`}
        >
          Livreur
        </button>
      </div>

      {type && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Lieu de départ :</label>
            <input
              type="text"
              value={details.depart}
              onChange={(e) => setDetails({ ...details, depart: e.target.value })}
              className="w-full p-2 rounded bg-white text-black"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Destination :</label>
            <input
              type="text"
              value={details.destination}
              onChange={(e) => setDetails({ ...details, destination: e.target.value })}
              className="w-full p-2 rounded bg-white text-black"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Heure souhaitée :</label>
            <input
              type="time"
              value={details.heure}
              onChange={(e) => setDetails({ ...details, heure: e.target.value })}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="block mb-1">Autres informations :</label>
            <textarea
              value={details.infos}
              onChange={(e) => setDetails({ ...details, infos: e.target.value })}
              className="w-full p-2 rounded bg-white text-black"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Envoyer la demande
          </button>
        </form>
      )}
    </main>
  );
}