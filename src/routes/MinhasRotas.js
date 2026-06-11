import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import Detalhes from '../pages/Detalhes';
import MinhasAvaliacoes from '../pages/MinhasAvaliacoes';
import Favoritos from '../pages/Favoritos';
import Perfil from '../pages/Perfil';
import RecuperarSenha from '../pages/RecuperarSenha';
import RedefinirSenha from '../pages/RedefinirSenha';

export default function MinhasRotas() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/detalhes/:tipo/:id" element={<Detalhes />} />
        <Route path="/minhas-avaliacoes" element={<MinhasAvaliacoes />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
      </Routes>
    </BrowserRouter>
  );
}
