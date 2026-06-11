import { FreeMode, Mousewheel, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import CardMidia from './CardMidia';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

export default function CarrosselMidia({ titulo, itens = [] }) {
  if (!itens || itens.length === 0) return null;

  const id = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');

  return (
    <section className="secao-carrossel">
      <div className="carrossel-topo">
        <h2>{titulo}</h2>

        <div className="botoes-carrossel">
          <button
            type="button"
            className={`swiper-btn-prev swiper-btn-prev-${id}`}
            aria-label={`Voltar ${titulo}`}
          >
            ‹
          </button>

          <button
            type="button"
            className={`swiper-btn-next swiper-btn-next-${id}`}
            aria-label={`Avançar ${titulo}`}
          >
            ›
          </button>
        </div>
      </div>

      <div className="carrossel-moldura carrossel-moldura-swiper">
        <Swiper
          modules={[Navigation, FreeMode, Mousewheel]}
          navigation={{
            prevEl: `.swiper-btn-prev-${id}`,
            nextEl: `.swiper-btn-next-${id}`
          }}
          freeMode
          grabCursor
          mousewheel={{ forceToAxis: true }}
          spaceBetween={18}
          slidesPerView="auto"
          className="carrossel-swiper"
        >
          {itens.map((midia, index) => (
            <SwiperSlide
              className="carrossel-slide"
              key={`${midia.tipo}-${midia.id}-${index}`}
            >
              <CardMidia midia={midia} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
