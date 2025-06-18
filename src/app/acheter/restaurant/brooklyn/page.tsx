'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

const allItems = [
  // 🍔 Burgers
  { name: 'Double Cheese Burger', price: 5000, image: 'https://example.com/images/double-cheese-burger.jpg' },
  { name: 'Big Tasty', price: 6000, image: 'https://example.com/images/big-tasty.jpg' },
  { name: 'BBQ Western Chicken', price: 6000, image: 'https://example.com/images/bbq-western-chicken.jpg' },
  { name: 'Brooklyn Mythic', price: 7000, image: 'https://example.com/images/brooklyn-mythic.jpg' },
  { name: "L'Américain Buffalo", price: 6000, image: 'https://example.com/images/americain-buffalo.jpg' },
  { name: 'Smash Burger Deluxe', price: 7000, image: 'https://example.com/images/smash-burger-deluxe.jpg' },
  { name: 'American Dream Menu', price: 7500, image: 'https://example.com/images/american-dream-menu.jpg' },
  { name: 'Fish Burger Menu', price: 5000, image: 'https://example.com/images/fish-burger-menu.jpg' },
  { name: 'Chicken Boursino Menu', price: 5000, image: 'https://example.com/images/chicken-boursino-menu.jpg' },
  { name: 'Crazy Box', price: 7000, image: 'https://example.com/images/crazy-box.jpg' },

  // 🍗 Poulet
  { name: 'Chicken Wrap', price: 4500, image: 'https://example.com/images/chicken-wrap.jpg' },
  { name: 'Chicken Wings Menu x6', price: 5000, image: 'https://example.com/images/chicken-wings-menu-6.jpg' },
  { name: 'Chicken Wings Menu x10', price: 7000, image: 'https://example.com/images/chicken-wings-menu-10.jpg' },
  { name: 'Chicken Tenders Menu x3', price: 4500, image: 'https://example.com/images/chicken-tenders-menu-3.jpg' },
  { name: 'Chicken Pièces Menu x3', price: 5000, image: 'https://example.com/images/chicken-pieces-menu-3.jpg' },
  { name: 'Chicken Nuggets Menu x5', price: 5000, image: 'https://example.com/images/chicken-nuggets-menu-5.jpg' },
  { name: 'Chicken Family', price: 22500, image: 'https://example.com/images/chicken-family.jpg' },

  // 🍕 Pizzas
  { name: 'Pizza Brooklyn', price: 6500, image: 'https://example.com/images/pizza-brooklyn.jpg' },
  { name: 'Pizza Inwood', price: 7500, image: 'https://example.com/images/pizza-inwood.jpg' },
  { name: 'Pizza Broadway', price: 7500, image: 'https://example.com/images/pizza-broadway.jpg' },
  { name: 'Pizza Chelsea', price: 7500, image: 'https://example.com/images/pizza-chelsea.jpg' },
  { name: 'Pizza Soho', price: 7500, image: 'https://example.com/images/pizza-soho.jpg' },
  { name: 'Pizza Astoria', price: 6500, image: 'https://example.com/images/pizza-astoria.jpg' },
  { name: 'Pizza Queens', price: 6000, image: 'https://example.com/images/pizza-queens.jpg' },
  { name: 'Pizza Little T', price: 6000, image: 'https://example.com/images/pizza-little-t.jpg' },
  { name: 'Pizza Jersey', price: 6500, image: 'https://example.com/images/pizza-jersey.jpg' },
  { name: 'Pizza Bronx', price: 6500, image: 'https://example.com/images/pizza-bronx.jpg' },
  { name: 'Pizza Harlem', price: 6500, image: 'https://example.com/images/pizza-harlem.jpg' },
  { name: 'Pizza Manhattan', price: 6500, image: 'https://example.com/images/pizza-manhattan.jpg' },

  // 🌮 Tacos
  { name: 'Tacos Poulet Menu', price: 6500, image: 'https://example.com/images/tacos-poulet-menu.jpg' },
  { name: 'Tacos Viande Menu', price: 6500, image: 'https://example.com/images/tacos-viande-menu.jpg' },
  { name: 'Tacos Merguez Menu', price: 6500, image: 'https://example.com/images/tacos-merguez-menu.jpg' },
  { name: 'Tacos Nuggets Menu', price: 6500, image: 'https://example.com/images/tacos-nuggets-menu.jpg' },
  { name: 'Tacos Mix Menu', price: 8000, image: 'https://example.com/images/tacos-mix-menu.jpg' },
  { name: 'Kebab Menu', price: 7000, image: 'https://example.com/images/kebab-menu.jpg' },

  // 🍰 Desserts
  { name: 'Tarte DAIM', price: 3000, image: 'https://example.com/images/tarte-daim.jpg' },
];

export default function BrooklynPage() {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.name === item.name);
      if (existing) {
        return prev.map((p) =>
          p.name === item.name ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.price + 500) * item.quantity, 0);

  return (
    <div className="relative p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brooklyn - Tous les plats</h1>
        <button onClick={() => setShowCart(!showCart)} className="relative">
          <ShoppingCart className="w-8 h-8" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {allItems.map((item, index) => (
          <div key={index} className="border p-4 rounded-lg shadow">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h2 className="font-semibold text-lg">{item.name}</h2>
            <p className="text-sm text-gray-600">Prix : {item.price} FCFA + 500 FCFA (commission)</p>
            <p className="font-bold mt-1">{item.price + 500} FCFA</p>
            <button
              onClick={() => addToCart(item)}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>

      {showCart && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 border-l overflow-y-auto z-50">
          <h2 className="text-xl font-bold mb-4">🛒 Mon panier</h2>
          {cart.length === 0 ? (
            <p>Votre panier est vide.</p>
          ) : (
            <ul className="space-y-4">
              {cart.map((item, index) => (
                <li key={index} className="border p-2 rounded">
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                  </div>
                  <p className="text-sm text-gray-500">{(item.price + 500) * item.quantity} FCFA</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 font-bold">Total : {total} FCFA</div>
          <button
            onClick={() => alert('Commande envoyée !')}
            className="mt-4 bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
          >
            Commander
          </button>
        </div>
      )}
    </div>
  );
}
