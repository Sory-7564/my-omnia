// src/app/reservation/page.tsx
"use client";

import { useState } from "react";

export default function ReservationPage() {
  const [choix, setChoix] = useState<string | null>(null);
  const [lieu, setLieu] = useState("");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");

  const lieuxHotel = ["Hôtel Azalaï", "Radisson Blu", "Hôtel Salam"];
  const lieuxAppartement = ["Appartement ACI", "Appartement Hamdallaye", "Appartement Golf"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Réservation pour : ${lieu}\nDate : ${date}\nHeure : ${heure}`);
  };

  return (
    <main className="p-6 min-h-screen bg-black text-white font-sans">
      <h1 className="text-3xl font-bold mb-6">Réservation</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setChoix("hotel")}
          className={`px-4 py-2 rounded ${
            choix === "hotel" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Hôtel
        </button>
        <button
          onClick={() => setChoix("appartement")}
          className={`px-4 py-2 rounded ${
            choix === "appartement" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Appartement
        </button>
      </div>

      {choix && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="lieu" className="block mb-1">
              Choisissez un {choix}
            </label>
            <select
              id="lieu"
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
              className="w-full p-2 rounded bg-white text-black"
              required
            >
              <option value="">-- Sélectionner --</option>
              {(choix === "hotel" ? lieuxHotel : lieuxAppartement).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block mb-1">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 rounded bg-white text-black"
              required
            />
          </div>

          <div>
            <label htmlFor="heure" className="block mb-1">Heure</label>
            <input
              type="time"
              id="heure"
              value={heure}
              onChange={(e) => setHeure(e.target.value)}
              className="w-full p-2 rounded bg-white text-black"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
          >
            Réserver
          </button>
        </form>
      )}
    </main>
  );
}