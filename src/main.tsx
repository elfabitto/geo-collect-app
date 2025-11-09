import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/geo-collect-app/sw.js', { 
      scope: '/geo-collect-app/' 
    }).then(registration => {
      console.log('✓ Service Worker registrado com sucesso:', registration.scope);
      
      // Verificar atualizações do service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✓ Nova versão do app disponível! Recarregue a página para atualizar.');
            }
          });
        }
      });
    }).catch(error => {
      console.log('✗ Falha ao registrar Service Worker:', error);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
