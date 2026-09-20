# Campus Fix-It Web App

Campus Fix-It is a comprehensive issue-reporting platform designed to streamline campus maintenance. It allows students to easily report infrastructure problems, while giving maintenance workers and administrators a dedicated dashboard to track, assign, and resolve those issues efficiently.

## 🚀 Key Features

*   **Role-Based Access Control:** Dedicated portals and dashboards for **Students**, **Workers**, and **Admins**.
*   **Real-time Database:** Reports are updated and synced in real-time across all dashboards.
*   **Image Uploads:** Students can attach photos to their maintenance reports.
*   **Secure Authentication:** Powered by Firebase Auth, featuring a secure, backend-driven 6-digit OTP password reset system.
*   **Automated Cleanups:** The database features a global garbage collection system to keep unused OTPs and dead data scrubbed clean.

## 🛠 Tech Stack

This project is built using a modern, serverless architecture:

*   **Frontend:** Vanilla HTML, CSS, and JavaScript. No bulky frameworks, ensuring lightning-fast load times.
*   **Backend:** Vercel Serverless Functions (Node.js). API endpoints wake up on demand to handle sensitive tasks.
*   **Database & Authentication:** Firebase (Firestore & Firebase Auth) for real-time data syncing and secure user management.
*   **Email Delivery:** EmailJS (Triggered securely from the Vercel backend to send OTP codes without exposing API keys to the browser).
*   **Image Hosting:** ImgBB API for lightweight, external image storage.
*   **Hosting:** Vercel.

## ⚙️ Setup & Installation

To run this project locally, you will need Node.js and the Vercel CLI installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/adolph-mulangatshivalo/campus-fix-it.git
    cd campus-fix-it
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Duplicate the `.env.example` file, rename it to `.env`, and fill in your private API keys and Firebase Service Account credentials.
    > **Note:** Never commit the `.env` file to version control.

4.  **Run the local development server:**
    Since the app relies on Vercel Serverless Functions, use the Vercel CLI to run it locally:
    ```bash
    vercel dev
    ```

## 🔒 Security Notes
*   **Firestore Rules:** The database is locked down. Users can only read/write their own profiles and reports. Password reset tokens are completely blocked from frontend access and can only be managed by the secure Admin SDK in the Vercel backend.
*   **Instant Redirects:** The app uses a `vercel.json` configuration for instant, server-side route protection and redirection.


