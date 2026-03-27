# Cutter Gang

A modern, high-fidelity platform for street culture content, featuring a secure entry gate, high-performance video streaming, and real-time community engagement.

## 🚀 Features

### 🚪 The Gate (Vetting System)
- **Password Protection**: Secure entry point for verified members.
- **Vetting Middleware**: Automatic redirection of unauthenticated users to the gate.
- **IP Protection**: Built-in lockout system for multiple failed attempts.

### 📼 Video Streaming
- **Video Feed**: A sleek, high-performance grid showing the latest uploads.
- **Video Player**: Custom-built video player with support for high-quality streaming.
- **Member Uploads**: Integrated system for members to contribute content directly.

### 🗨️ Global Chat
- **Real-Time Communication**: Instant messaging powered by Supabase Realtime.
- **Community Focus**: Shared space for discussions and interactions.
- **Auto-Cleanup**: Messages are automatically cleared every 24 hours to keep the conversation fresh.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Storage**: Supabase Storage for high-speed video delivery
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: Lucide React
- **Authentication**: Custom cookie-based vetting system

## ⚙️ Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Prath1k/Cutter-Gang.git
   cd Cutter-Gang
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Supabase Setup**:
   - Create a new project on [Supabase](https://supabase.com/).
   - Run the provided `schema.sql` in the Supabase SQL Editor to set up the database and storage buckets.
   - Set up the necessary environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

4. **Environment Variables**:
   Update your `.env.local` with your Supabase credentials.

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## 📜 License

Private - For use by Cutter Gang members and authorized personnel only.
