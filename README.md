# 🎓 Interactive Quiz Application

A modern, real-time interactive quiz application built with **React**, **Socket.io**, and **Tailwind CSS**. Designed for teachers to host live sessions and students to participate from any device.

## ✨ Features

- **Live Quiz Sessions**: Real-time interaction between teacher and students.
- **Teacher Dashboard**: Create, edit, and manage quizzes with ease.
- **Student Join**: Simple join process via code or QR code.
- **Real-time Leaderboard**: Instant feedback and scoring.
- **Offline First**: Local storage using IndexedDB for quiz persistence.
- **Responsive Design**: Beautiful UI that works on desktops, tablets, and phones.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd app_quiz
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Running the application**:
   - Start the Socket.io server (Backend):
     ```bash
     npm start
     ```
   - Start the development server (Frontend):
     ```bash
     npm run dev -- --host 0.0.0.0 --port 5000
     ```
   *Alternatively, you can run `execute.bat` on Windows to start both automatically.*

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, Socket.io.
- **Storage**: IndexedDB (via `idb` library).
- **Communication**: WebSockets for real-time state synchronization.

## 📝 License

This project is open-source and available under the MIT License.
