# AI Mock Interviewer

This project is a full-stack application featuring a React frontend and a Node.js backend.

## Final Project Structure

- **/frontend**: Contains the React + Vite frontend application.
- **/backend**: Contains the Node.js + Express backend server.

---

## Important: Clean Up Old Files

After these changes, your project root will have old files mixed with the new `frontend` and `backend` directories. **You must manually delete the old files and directories from the project root** to avoid errors and confusion.

**DELETE the following from your project's root directory:**

- `App.tsx`
- `constants.ts`
- `index.html`
- `index.tsx`
- `metadata.json`
- `package.json`
- `server.js`
- `tsconfig.json`
- `tsconfig.node.json`
- `types.ts`
- `vite.config.ts`
- The `components/` directory
- The `contexts/` directory
- The `hooks/` directory
- The `server/` directory
- The `services/` directory
- `services/geminiService.ts`
- `services/authService.ts`
- The `supabase/` directory (if it exists)
- `.env.example` (if it exists)

---

## Backend Setup

1.  **Navigate to the backend directory:**
    ```sh
    cd backend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Create an environment file:**
    Copy the `backend/.env.example` to a new file named `backend/.env`.

4.  **Fill in your environment variables** in the `.env` file with your credentials from Google AI Studio and your Supabase project.

5.  **Set up your Supabase database:**
    Go to your Supabase project's SQL Editor and run the entire script from `backend/supabase/schema.sql`. This will create the necessary tables, policies, and triggers.

6.  **Start the backend server:**
    ```sh
    npm start
    ```
    The server will run on `http://localhost:3001`.

---

## Frontend Setup

1.  **Navigate to the frontend directory** in a new terminal window:
    ```sh
    cd frontend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Start the frontend development server:**
    ```sh
    npm run dev
    ```
    The application will be accessible at the local URL provided by Vite (usually `https://localhost:5173`). The Vite server is pre-configured to proxy API requests to the backend.