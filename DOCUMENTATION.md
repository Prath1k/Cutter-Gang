# Cutter Gang - Technical Documentation

## 📖 Introduction
Cutter Gang is a high-fidelity streetwear culture platform built for exclusive community engagement. It features a secure entry system, real-time communication, and premium video streaming.

---

## 🏗️ Architecture

The platform is built on a modern full-stack architecture leveraging **Next.js 16** and **Supabase**.

- **Frontend**: Next.js 16 (App Router) with Tailwind CSS 4 for a premium streetwear aesthetic.
- **Backend/API**: Next.js Server Actions and Route Handlers.
- **Database**: Supabase (PostgreSQL) for structured data.
- **Realtime**: Supabase Realtime for instant messaging.
- **Storage**: Supabase Storage for high-speed video delivery.
- **Security**: Custom cookie-based vetting system with middleware protection.

---

## 🛡️ Security & Access Control

### 🚪 The Gate (Vetting System)
All users are required to pass through "The Gate" before accessing the platform.
- **Middleware**: `src/middleware.ts` intercepts all non-public requests and redirects unauthenticated users to `/gate`.
- **Validation**: Authentication is based on a base64-encoded token (`cutter_vetted` cookie), which is verified against the `SITE_PASSWORD` environment variable.
- **Lockout Mechanism**: To prevent brute-force attacks, the `/api/gate` route tracks login attempts.
    - **Max Attempts**: 3
    - **Lockout Duration**: 30 minutes
    - **Tracking Table**: `password_attempts` stores IP-to-attempt counts.

---

## 📼 Core Features

### 📼 Video Streaming & Management
A central hub for community content.
- **Video Feed**: A high-performance grid layout (`VideoFeed.tsx`, `VideoGrid.tsx`) that fetches content from the `videos` table.
- **Custom Player**: `VideoPlayer.tsx` provides a premium, branded viewing experience with custom controls.
- **Upload System**: `UploadVideo.tsx` allows authorized members to contribute content. Videos are uploaded directly to the `videos` bucket in Supabase Storage, and their metadata is saved in the `videos` table.

### 🗨️ Real-time Global Chat
A shared space for community interaction.
- **Technology**: Powered by Supabase Realtime for sub-second message delivery.
- **Persistence**: Messages are stored in the `chat_messages` table.
- **Auto-Cleanup**: To keep the platform exclusive and current, messages are automatically deleted after 24 hours using a PostgreSQL cron job (`pg_cron`).

---

## 🗄️ Database Schema

The database is managed via Supabase. Below is a breakdown of the core tables:

### `videos`
Stores metadata for all uploaded content.
- `id`: (UUID) Primary key.
- `title`: (TEXT) Title of the video.
- `url`: (TEXT) Public URL to the video file in Storage.
- `user_id`: (TEXT) ID of the uploader.
- `created_at`: (TIMESTAMP) Upload time.

### `chat_messages`
Stores community discussion messages.
- `id`: (UUID) Primary key.
- `user_id`: (TEXT) ID of the sender.
- `user_name`: (TEXT) Display name of the sender.
- `message`: (TEXT) Content of the msg.
- `user_avatar`: (TEXT) URL for user avatar.
- `created_at`: (TIMESTAMP) Message timestamp.

### `password_attempts`
Manages the gate's security state.
- `ip`: (TEXT) Primary key (IP address).
- `attempts`: (INTEGER) Count of failed attempts.
- `last_attempt`: (TIMESTAMP) Time of the last attempt.

---

## 🛠️ Developer Guide

### Environment Variables
The following environment variables are required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous API key.
- `SITE_PASSWORD`: The secret password for "The Gate".

### Installation
1. Install dependencies: `npm install`
2. Set up environment variables.
3. Run migrations: Execute `schema.sql` in your Supabase SQL Editor.
4. Enable `pg_cron` in Supabase Extensions for the chat cleanup feature.
5. Start development: `npm run dev`

### Deployment
The site is optimized for deployment on **Vercel** or any Next.js-compatible host. Ensure that all environment variables are correctly configured in your deployment settings.
