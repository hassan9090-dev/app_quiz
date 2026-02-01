
import { WSMessage, MessageType } from '../types';

/**
 * MockSocket uses BroadcastChannel to allow different tabs (Teacher/Students)
 * to communicate in real-time within the same browser session.
 */
class MockSocket {
  private channel: BroadcastChannel;
  private listeners: Map<MessageType, ((payload: any) => void)[]> = new Map();

  constructor() {
    this.channel = new BroadcastChannel('quizmaster_live_bus');
    this.channel.onmessage = (event) => {
      const message: WSMessage = event.data;
      const callbacks = this.listeners.get(message.type);
      if (callbacks) {
        callbacks.forEach(cb => cb(message.payload));
      }
    };
  }

  on(type: MessageType, callback: (payload: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
  }

  off(type: MessageType, callback: (payload: any) => void) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      this.listeners.set(type, callbacks.filter(cb => cb !== callback));
    }
  }

  emit(type: MessageType, payload: any) {
    const message: WSMessage = { type, payload, senderId: 'current-user' };
    // Also trigger locally
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(cb => cb(payload));
    }
    // Broadcast to other tabs
    this.channel.postMessage(message);
  }
}

export const socket = new MockSocket();
