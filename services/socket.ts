
import { io, Socket } from 'socket.io-client';
import { WSMessage, MessageType } from '../types';

/**
 * Le service Socket communique avec le serveur Node.js central.
 * Pour un usage sur réseau Wi-Fi, le serveur doit être lancé sur le PC prof
 * et les élèves s'y connectent via l'adresse IP du prof.
 */
class SocketService {
  private socket: Socket;

  constructor() {
    // Priority:
    // 1. Environment variable VITE_SOCKET_URL (useful for separate frontend/backend hosting)
    // 2. Same origin (window.location.origin) if not on dev ports
    // 3. Fallback to localhost:3000 for local development
    
    let url = import.meta.env.VITE_SOCKET_URL;
    
    if (!url) {
      if (window.location.protocol === 'file:') {
        url = 'http://localhost:3000';
      } else {
        const port = window.location.port;
        // If we are on Vite dev port (5173) or typical dev ports, assume local backend on 3000
        // Otherwise, use the same origin (production/online case)
        if (port === '5173' || port === '3000' || port === '5000') {
          url = `http://${window.location.hostname}:3000`;
        } else {
          url = window.location.origin;
        }
      }
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Connecté au serveur de quiz master sur', url);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('Erreur de connexion socket (le serveur est-il lancé sur le port 3000 ?):', err.message);
    });
  }

  on(type: string, callback: (payload: any) => void) {
    this.socket.on(type, callback);
  }

  off(type: string, callback: (payload: any) => void) {
    this.socket.off(type, callback);
  }

  emit(type: string, payload?: any) {
    this.socket.emit(type, payload);
  }

  isConnected() {
    return this.socket.connected;
  }
}

export const socket = new SocketService();
