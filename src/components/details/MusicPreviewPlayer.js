import { useEffect, useRef, useState } from 'react';

export default function MusicPreviewPlayer({ titulo, artista, imagem, previewUrl, avisoSemPreview, compacto = false }) {
  const audioRef = useRef(null);
  const [tocando, setTocando] = useState(false);
  const [tempoAtual, setTempoAtual] = useState(0);
  const [duracao, setDuracao] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    setTocando(false);
    setTempoAtual(0);
    setDuracao(0);
  }, [previewUrl]);

  function alternarPlay() {
    const audio = audioRef.current;
    if (!audio || !previewUrl) return;

    if (audio.paused) {
      audio.play();
      setTocando(true);
    } else {
      audio.pause();
      setTocando(false);
    }
  }

  function alterarTempo(e) {
    const novoTempo = Number(e.target.value);
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = novoTempo;
    setTempoAtual(novoTempo);
  }

  function alterarVolume(e) {
    const novoVolume = Number(e.target.value);
    const audio = audioRef.current;
    setVolume(novoVolume);
    if (audio) audio.volume = novoVolume;
  }

  function formatarTempo(segundos) {
    if (!segundos || Number.isNaN(segundos)) return '0:00';
    const min = Math.floor(segundos / 60);
    const sec = Math.floor(segundos % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

  if (!previewUrl) {
    return <p className="texto-suave">{avisoSemPreview || 'Preview indisponível.'}</p>;
  }

  return (
    <div className={`preview-player ${compacto ? 'preview-player-compacto' : ''}`}>
      <div className="preview-header">
        {imagem && <img src={imagem} alt={titulo} className="preview-cover" />}

        <div className="preview-info">
          <span className="preview-label">Preview Deezer</span>
          <strong className="preview-title">{titulo}</strong>
          {artista && <span className="preview-artist">{artista}</span>}
        </div>
      </div>

      <div className="preview-controls">
        <button
          type="button"
          className="preview-play-btn"
          onClick={alternarPlay}
          aria-label={tocando ? 'Pausar' : 'Tocar'}
        >
          {tocando ? '❚❚' : '▶'}
        </button>

        <div className="preview-progress-wrap">
          <input
            className="preview-progress"
            type="range"
            min="0"
            max={duracao || 0}
            step="0.1"
            value={tempoAtual}
            onChange={alterarTempo}
          />
          <div className="preview-times">
            <span>{formatarTempo(tempoAtual)}</span>
            <span>{formatarTempo(duracao)}</span>
          </div>
        </div>

        <label className="preview-volume" aria-label="Volume">
          <span>{volume === 0 ? '🔇' : '🔊'}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={alterarVolume}
          />
        </label>
      </div>

      <audio
        ref={audioRef}
        src={previewUrl}
        onLoadedMetadata={e => setDuracao(e.currentTarget.duration || 0)}
        onTimeUpdate={e => setTempoAtual(e.currentTarget.currentTime || 0)}
        onEnded={() => setTocando(false)}
        preload="metadata"
      />
    </div>
  );
}
