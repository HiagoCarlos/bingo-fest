// src/hooks/useBingoAudio.ts
import { useCallback } from 'react';

export function useBingoAudio() {
  
  const announceBall = useCallback((ball: string) => {
    // Verifica se o navegador suporta a API de voz
    if (!('speechSynthesis' in window)) return;

    // Divide a pedra (ex: "B-12" vira ["B", "12"])
    const [letter, number] = ball.split('-');

    // Mapa de pronúncia para soar natural em português
    const pronunciations: Record<string, string> = {
      'B': 'Bê',
      'I': 'I',
      'N': 'Ene',
      'G': 'Gê',
      'O': 'Ó'
    };

    // Monta o texto que o robô vai ler
    const textToSpeak = `${pronunciations[letter]}... ${number}`;

    // Cancela qualquer fala que esteja acontecendo para não encavalar
    window.speechSynthesis.cancel();

    // Configura a voz
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.85; // Velocidade um pouco mais lenta para dar suspense
    utterance.pitch = 1.0; // Tom de voz normal

    // Executa a fala
    window.speechSynthesis.speak(utterance);
  }, []);

  return { announceBall };
}