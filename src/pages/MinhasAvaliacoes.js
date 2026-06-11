import { useEffect, useState } from 'react';
import { apiGet } from '../services/api';
import ReviewCard from '../components/ReviewCard';

export default function MinhasAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState([]);

  useEffect(() => {
    apiGet('/minhas-avaliacoes').then(dados => setAvaliacoes(dados.avaliacoes || []));
  }, []);

  return (
    <main className="container">
      <h1>Minhas avaliações</h1>
      <section className="grid">
        {avaliacoes.map(avaliacao => <ReviewCard key={avaliacao._id} avaliacao={avaliacao} />)}
      </section>
    </main>
  );
}
