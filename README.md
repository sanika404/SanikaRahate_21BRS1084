﻿# SanikaRahate_21BRS1084
### Project Structure

This project consists of two primary components:

1. **Server (WebSocket)**
2. **Client (Frontend)**

### How to Run the Project

1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd <repository_name>
   ```

2. **Install Dependencies:**

   - **Server:** 
     ```bash
     cd server
     npm install
     ```
   
   - **Client:**
     ```bash
     cd client
     npm install
     ```

### Tech Stack

- **Client:** Vite, React, JavaScript
- **Server:** Node.js with WebSockets

### Running the Project

- **Start the Server:**
  ```bash
  cd server
  node index.js
  ```

- **Start the Client:**
  ```bash
  cd client
  npm run dev
  ```

### Game Rules

**Characters and Movement:**

- **Pawn:**
  - Moves one block in any direction (Left, Right, Forward, or Backward).
  - Move commands: `L` (Left), `R` (Right), `F` (Forward), `B` (Backward)

- **Hero1:**
  - Moves two blocks straight in any direction.
  - Eliminates any opponent's character in its path.
  - Move commands: `L` (Left), `R` (Right), `F` (Forward), `B` (Backward)

- **Hero2:**
  - Moves two blocks diagonally in any direction.
  - Eliminates any opponent's character in its path.
  - Move commands: `FL` (Forward-Left), `FR` (Forward-Right), `BL` (Backward-Left), `BR` (Backward-Right)

**Winning the Game:**
- The game concludes when one player eliminates all of their opponent's characters.
- The victorious player is declared, and players have the option to start a new game.
