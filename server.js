
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
// In-memory sessions for live play (no persistence needed for active games if server restarts)
const sessions = new Map();
const participants = new Map();
const answers = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }

  // Prioritize common home subnets: 192.168.1.x, then 192.168.0.x
  // Avoid common VirtualBox subnets: 192.168.56.x
  const priority = addresses.find(ip => ip.startsWith('192.168.1.'));
  if (priority) return priority;

  const secondary = addresses.find(ip => ip.startsWith('192.168.0.'));
  if (secondary) return secondary;

  // Fallback: exclude VirtualBox default if possible
  const valid = addresses.find(ip => !ip.startsWith('192.168.56.'));
  if (valid) return valid;

  return addresses[0] || 'localhost';
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve the built frontend files from 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing by serving index.html for all other routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Helper to reconstruct full session state
function getFullSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const sessionParticipants = Array.from(participants.values()).filter(p => p.sessionId === sessionId);
  const sessionAnswers = Array.from(answers.values()).filter(a => a.sessionId === sessionId);

  return {
    ...session,
    participants: sessionParticipants,
    answers: sessionAnswers
  };
}

io.on('connection', (socket) => {
  console.log('Utilisateur connecté:', socket.id);
  
  // Send server IP info to the connected client
  socket.emit('server:info', { ip: getLocalIpAddress() });

  // Allow client to request IP info explicitly (useful if they missed the first emit)
  socket.on('server:request_info', () => {
    socket.emit('server:info', { ip: getLocalIpAddress() });
  });

  // Le prof crée une session et fournit le quiz complet
  socket.on('session:create', async (data) => {
    try {
      const { session, quiz } = data;
      
      sessions.set(session.id, {
        id: session.id,
        joinCode: session.joinCode,
        hostId: socket.id,
        quizId: session.quizId || quiz.id,
        quiz: quiz,
        status: session.status || 'waiting',
        currentQuestionIndex: session.currentQuestionIndex || 0,
        isRevealed: session.isRevealed || false,
        createdAt: session.createdAt || new Date().toISOString()
      });

      socket.join(session.id);
      console.log(`Session créée: ${session.joinCode} pour le quiz: ${quiz.title}`);
    } catch (err) {
      console.error('Error creating session:', err);
    }
  });

  // L'élève cherche une session par son code court
  socket.on('session:find', async (joinCode) => {
    try {
      const code = joinCode.toUpperCase();
      const session = Array.from(sessions.values()).find(s => s.joinCode === code);
      
      if (session) {
        socket.emit('session:found', session);
      } else {
        socket.emit('session:not_found', "Code de session invalide.");
      }
    } catch (err) {
      console.error('Error finding session:', err);
      socket.emit('session:not_found', "Erreur serveur.");
    }
  });

  // L'élève rejoint officiellement
  socket.on('session:join', async (data) => {
    try {
      const { sessionId, participant } = data;
      
      const sessionExists = sessions.get(sessionId);
      if (!sessionExists) return;

      const participantKey = `${sessionId}-${participant.id}`;
      if (!participants.has(participantKey)) {
        participants.set(participantKey, {
          id: participant.id,
          sessionId: sessionId,
          name: participant.name,
          emoji: participant.emoji,
          score: participant.score || 0,
          joinedAt: new Date().toISOString()
        });
      }

      socket.join(sessionId);
      
      const fullSession = getFullSession(sessionId);
      io.to(sessionId).emit('sync:state', fullSession);
      console.log(`${participant.name} a rejoint la session ${sessionExists.joinCode}`);
    } catch (err) {
      console.error('Error joining session:', err);
    }
  });

  // Mise à jour de l'état (Changement de question, Reveal, etc.)
  socket.on('session:update', async (updatedSession) => {
    try {
      const currentSession = sessions.get(updatedSession.id);
      console.log('[session:update] Updating session:', updatedSession.id, 'with status:', updatedSession.status);
      
      if (!currentSession) return;

      const updates = {
        ...currentSession,
        currentQuestionIndex: updatedSession.currentQuestionIndex !== undefined ? updatedSession.currentQuestionIndex : currentSession.currentQuestionIndex,
        isRevealed: updatedSession.isRevealed !== undefined ? updatedSession.isRevealed : currentSession.isRevealed,
        status: updatedSession.status || currentSession.status
      };
      
      if (updatedSession.quiz) {
        updates.quiz = updatedSession.quiz;
      }
      
      sessions.set(updatedSession.id, updates);

      const fullSession = getFullSession(updatedSession.id);
      console.log('[session:update] Broadcasting sync:state to room:', updatedSession.id, 'with status:', fullSession.status);
      io.to(updatedSession.id).emit('sync:state', fullSession);
    } catch (err) {
      console.error('Error updating session:', err);
    }
  });

  // Soumission de réponse
  socket.on('answer:submit', async (data) => {
    try {
      const { sessionId, answer } = data;
      
      const answerKey = `${sessionId}-${answer.participantId}-${answer.questionIndex}`;

      if (!answers.has(answerKey)) {
        answers.set(answerKey, {
          sessionId: sessionId,
          participantId: answer.participantId,
          questionIndex: answer.questionIndex,
          choiceIndex: answer.choiceIndex,
          isCorrect: answer.isCorrect,
          timestamp: answer.timestamp || Date.now(),
          submittedAt: new Date().toISOString()
        });
        
        const fullSession = getFullSession(sessionId);
        io.to(sessionId).emit('sync:state', fullSession);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  });

  // Récupérer l'état complet d'une session (pour le recap ou reconnexion prof)
  socket.on('session:get_full', async (sessionId) => {
    try {
      const fullSession = getFullSession(sessionId);
      if (fullSession) {
        socket.emit('session:full_state', fullSession);
      } else {
        socket.emit('session:not_found', "Session introuvable");
      }
    } catch (err) {
      console.error('Error getting full session:', err);
    }
  });

  // Reconnexion robuste du prof
  socket.on('session:host_join', async (sessionId) => {
    try {
      socket.join(sessionId);
      const fullSession = getFullSession(sessionId);
      if (fullSession) {
         socket.emit('sync:state', fullSession);
      } else {
         socket.emit('session:not_found');
      }
    } catch (err) {
      console.error('Error in host join:', err);
    }
  });

  // --- REMOVED QUIZ PERSISTENCE LOGIC (NOW IN CLIENT INDEXEDDB) ---

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('-----------------------------------------');
  console.log(`QUIZ LIVE SERVER RUNNING (Relay Mode)`);
  console.log(`Port: ${PORT}`);
  
  // Only show local IP hints if running in a typical local environment
  const localIp = getLocalIpAddress();
  if (localIp && !localIp.startsWith('127.')) {
    console.log(`Accès élèves: http://${localIp}:${PORT}`);
  } else {
    console.log(`Serveur accessible sur le port ${PORT}`);
  }
  console.log('-----------------------------------------');
});
