// src/hooks/useRetroAudio.ts
import { useCallback } from 'react';

// Importe o seu som de comemoração (Ajuste a extensão se for .wav)
import goalSound from '../assets/goal-sound.mp3'; 

export function useRetroAudio() {
  
  // Som de "Click" de terminal
  const playClick = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (e) { /* Ignora se o navegador bloquear */ }
  }, []);

  // Som grave de erro ("Buzzer")
  const playError = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
  }, []);

  // Som de Vitória (Toca o seu arquivo mp3/wav)
  const playGoal = useCallback(() => {
    try {
      const audio = new Audio(goalSound);
      audio.volume = 0.6;
      audio.play();
    } catch (e) {}
  }, []);

  return { playClick, playError, playGoal };
}