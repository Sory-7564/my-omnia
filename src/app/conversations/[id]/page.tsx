"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Message = {
  auteur: string;
  contenu: string;
  date: string;
};

export default function ConversationDetail() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [nouveauMessage, setNouveauMessage] = useState("");

  useEffect(() => {
    const data = localStorage.getItem(`messages-${id}`);
    if (data) {
      setMessages(JSON.parse(data));
    }
  }, [id]);

  const envoyerMessage = () => {
    if (!nouveauMessage.trim()) return;

    const message: Message = {
      auteur: "Moi", // ou pseudo actuel
      contenu: nouveauMessage,
      date: new Date().toISOString(),
    };

    const nouveauxMessages = [...messages, message];
    setMessages(nouveauxMessages);
    localStorage.setItem(`messages-${id}`, JSON.stringify(nouveauxMessages));
    setNouveauMessage("");
  };

  return (
    <main className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Conversation</h1>

      <div className="space-y-2 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="bg-gray-800 p-3 rounded">
            <p className="font-bold">{msg.auteur}</p>
            <p>{msg.contenu}</p>
            <p className="text-xs text-gray-400">{new Date(msg.date).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={nouveauMessage}
          onChange={(e) => setNouveauMessage(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-700 text-white"
          placeholder="Écrire un message"
        />
        <button
          onClick={envoyerMessage}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
        >
          Envoyer
        </button>
      </div>
    </main>
  );
}

