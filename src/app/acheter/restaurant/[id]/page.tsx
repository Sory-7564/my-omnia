'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

const restaurants = [
  {
    id: 1,
    name: 'Brooklyn',
    categories: [
      {
        name: '🍔 Burgers',
        items: [
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
        ],
      },
      {
        name: '🍗 Poulet',
        items: [
          { name: 'Chicken Wrap', price: 4500, image: 'https://example.com/images/chicken-wrap.jpg' },
          { name: 'Chicken Wings Menu x6', price: 5000, image: 'https://example.com/images/chicken-wings-menu-6.jpg' },
          { name: 'Chicken Wings Menu x10', price: 7000, image: 'https://example.com/images/chicken-wings-menu-10.jpg' },
          { name: 'Chicken Tenders Menu x3', price: 4500, image: 'https://example.com/images/chicken-tenders-menu-3.jpg' },
          { name: 'Chicken Pièces Menu x3', price: 5000, image: 'https://example.com/images/chicken-pieces-menu-3.jpg' },
          { name: 'Chicken Nuggets Menu x5', price: 5000, image: 'https://example.com/images/chicken-nuggets-menu-5.jpg' },
          { name: 'Chicken Family (15 pièces + frites + 1 bouteille)', price: 22500, image: 'https://example.com/images/chicken-family.jpg' },
        ],
      },
      {
        name: '🍕 Pizzas',
        items: [
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
        ],
      },
      {
        name: '🌮 Tacos & Kebab',
        items: [
          { name: 'Tacos Poulet Menu', price: 6500, image: 'https://example.com/images/tacos-poulet-menu.jpg' },
          { name: 'Tacos Viande Menu', price: 6500, image: 'https://example.com/images/tacos-viande-menu.jpg' },
          { name: 'Tacos Merguez Menu', price: 6500, image: 'https://example.com/images/tacos-merguez-menu.jpg' },
          { name: 'Tacos Nuggets Menu', price: 6500, image: 'https://example.com/images/tacos-nuggets-menu.jpg' },
          { name: 'Tacos Mix (2 viandes) Menu', price: 8000, image: 'https://example.com/images/tacos-mix-menu.jpg' },
          { name: 'Kebab Menu', price: 7000, image: 'https://example.com/images/kebab-menu.jpg' },
        ],
      },
      {
        name: '🍰 Desserts',
        items: [
          { name: 'Tarte DAIM', price: 3000, image: 'https://example.com/images/tarte-daim.jpg' },
        ],
      },
    ],
  },
];

export default function RestaurantDetails() {
  const params = useParams();
  const id = Number(params.id);
  const restaurant = restaurants.find((r) => r.id === id);
  const [search, setSearch] = useState('');

  if (!restaurant) {
    return <div className="p-4">Restaurant introuvable</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{restaurant.name}</h1>

      <input
        type="text"
        placeholder="Rechercher un plat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 p-2 border rounded"
      />

      {restaurant.categories.map((category, index) => {
        const filteredItems = category.items.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        );

        if (filteredItems.length === 0) return null;

        return (
          <div key={index} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item, idx) => {
                const totalPrice = item.price + 500;
                return (
                  <li key={idx} className="border p-4 rounded-lg shadow">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">Prix de base : {item.price} FCFA</p>
                    <p className="text-sm text-gray-600">Commission : 500 FCFA</p>
                    <p className="font-bold mt-1">Total : {totalPrice} FCFA</p>
                    <button
                      onClick={() => alert(`${item.name} ajouté au panier.`)}
                      className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Ajouter au panier
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
