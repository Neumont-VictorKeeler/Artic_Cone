# Artic Cone
![image](https://github.com/user-attachments/assets/6fa22666-2679-469d-8e76-45d3de116ff4)

Artic Cone is a rendition of Gartic Phone - a multiplayer drawing and guessing game where players are given prompts and do their best to draw them. Other players then try to guess what was drawn, creating a hilarious chain of interpretations!

## 🛠️ Technology Stack

**Frontend:**
- Next.js 15 (React 19, TypeScript)
- Tailwind CSS for styling
- ShadCN UI components for accelerated development
- React Hook Form with Zod validation

**Backend:**
- Node.js with Socket.IO for real-time multiplayer functionality
- Firebase for data persistence

**Drawing & Canvas:**
- Konva.js with React-Konva for drawing functionality
- HTML5 Canvas with advanced drawing tools

**Additional Features:**
- Real-time multiplayer lobbies
- GIF generation and export
- Responsive design
## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Neumont-VictorKeeler/Artic_Cone.git
   cd Artic_Cone
   ```

2. **Navigate to the main application directory:**
   ```bash
   cd articcone
   ```

3. **Install dependencies:**
   ```bash
   npm install
   # or if you prefer pnpm
   pnpm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to play the game!

### Additional Commands

- **Build for production:**
  ```bash
  npm run build
  ```

- **Start production server:**
  ```bash
  npm run start
  ```

- **Lint the code:**
  ```bash
  npm run lint
  ```

## 🎮 How to Play

1. Create or join a game lobby using a room code
2. Wait for other players to join
3. When the game starts, draw the prompt you're given
4. Guess what other players have drawn
5. Enjoy the hilarious results at the end!

## 🏗️ Project Structure

```
articcone/
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utility functions and configurations
├── server/           # Socket.IO server configuration
├── public/           # Static assets
└── package.json      # Dependencies and scripts
```

## 🔧 Development

The project uses modern development tools and practices:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Tailwind CSS** for styling
- **Socket.IO** for real-time communication

## 🌐 Architecture

Artic Cone is built as a full-stack Next.js application with integrated real-time capabilities:

- **Frontend**: Next.js with React Server Components and client-side interactivity
- **Real-time Communication**: Socket.IO server integrated with Next.js
- **Database**: Firebase for game state and user data persistence
- **Drawing Engine**: Konva.js for high-performance 2D canvas rendering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is created for educational purposes.