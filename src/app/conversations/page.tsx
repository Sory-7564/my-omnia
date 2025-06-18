"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Conversation = {
  id: string;
  produit: { id: string; nom: string };
  vendeur: string;
  acheteur: string;
  dernierMessage: string;
  dateDernierMessage: string;
};

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("conversations");
    if (data) {
      setConversations(JSON.parse(data));
    }
  }, []);

  if (conversations.length === 0) {
    return <p className="p-6 text-white">Aucune conversation pour le moment.</p>;
  }

  return (
    <main className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl mb-4 font-bold">Vos conversations</h1>
      <ul>
        {conversations.map((conv) => (
          <li key={conv.id} className="mb-4 p-4 bg-gray-800 rounded">
            <Link href={`/conversations/${conv.id}`} className="block">
              <h2 className="text-xl font-semibold">{conv.produit.nom}</h2>
              <p>Avec : {conv.vendeur}</p>
              <p className="italic text-gray-400 truncate">{conv.dernierMessage}</p>
              <p className="text-sm text-gray-500">
                {new Date(conv.dateDernierMessage).toLocaleString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}