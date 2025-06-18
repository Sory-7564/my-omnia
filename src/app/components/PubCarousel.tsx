'use client';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function PubCarousel() {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    dots: true,
    pauseOnHover: true,
  };

  return (
    <div className="bg-white text-black p-4 rounded-xl shadow w-full max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">Offres en vedette</h3>
      <Slider {...settings}>
        <div className="bg-yellow-300 p-4 rounded-lg shadow">Pub 1 - Offre spéciale</div>
        <div className="bg-orange-300 p-4 rounded-lg shadow">Pub 2 - Promo du moment</div>
        <div className="bg-pink-300 p-4 rounded-lg shadow">Pub 3 - Réduction exclusive</div>
      </Slider>
    </div>
  );
}