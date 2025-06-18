'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

const restaurants = [
  {
    id: 1,
    name: 'Brooklyn',
    image: 'https://example.com/images/brooklyn-logo.jpg', // à remplacer par une vraie image
  },
  {
    id: 2,
    name: 'KFC',
    image: 'https://example.com/images/kfc-logo.jpg',
  },
  {
    id: 3,
    name: 'Arbab Chicken',
    image: 'https://example.com/images/arbab-logo.jpg',
  },
];

export default function RestaurantList() {
  const router = useRouter();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Restaurants</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="border p-4 rounded-lg hover:shadow-lg transition"
          >
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-40 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
            <Link
              href={`/acheter/restaurant/${restaurant.id}`}
              className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Voir le menu
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
