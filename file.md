# Setup & Run Guide: Clone, Install, and Generate APK

This guide provides a step-by-step walkthrough of how to clone, install, configure, run, and build the **Alphadex v2** mobile application. 

Alphadex is built using **React Native (Expo)**. There are two primary ways to run and test it on your mobile device:
1. **Expo Go (Quick Development)**: Runs the project locally on your machine and generates a QR code in your terminal. Scanning this QR code inside the **Expo Go** app runs the JavaScript bundle on your phone instantly.
2. **EAS Build (Standalone APK)**: Generates a standalone Android build (`.apk` file) through the Expo Application Services (EAS) cloud. When the build finishes, it prints a QR code in the terminal. Scanning this QR code opens a web page to download and install the APK directly on your phone.

---

## 🛠️ Prerequisites

Before starting, ensure you have the following installed on your machine:
*   **Git**: [Download Git](https://git-scm.com/downloads)
*   **Node.js** (LTS version 18.x or 20.x recommended): [Download Node.js](https://nodejs.org/)
*   **Expo Go App** (for testing via QR code without building an APK): Download it from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android) or [Apple App Store](https://apps.apple.com/us/app/expo-go/id984023720) (iOS).

---

## 💻 Step-by-Step Setup

### Step 1: Clone the Repository

Open your terminal or command prompt and run the following commands to clone the project and navigate into the project directory:

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate into the project folder
cd alphadex-v2
```

*(Replace `<your-repository-url>` with your actual repository URL)*

---

### Step 2: Install Node Dependencies

Install all necessary packages for the React Native/Expo project. We use `--legacy-peer-deps` to handle any peer dependency mismatches with React 19 / Expo SDK 56:

```bash
npm install --legacy-peer-deps
```

---

### Step 3: Configure Environment Variables

The application relies on Supabase for backend services (Auth, Database, Edge Functions).

1. Create a free Supabase project at [supabase.com](https://supabase.com/).
2. Copy the `.env.example` file to a new file named `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(On Windows PowerShell, use: `copy .env.example .env.local`)*
3. Open the newly created `.env.local` and replace the placeholder values with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
   *Note: `.env.local` is listed in `.gitignore` and should never be committed to Git.*

---

### Step 4: Setup the Backend Database & Edge Functions (Optional but Recommended)

To populate the app with content, run the database migrations and deploy the edge functions:

1. **Database Schema**: 
   Open your Supabase Project Dashboard, go to the **SQL Editor**, click **New query**, paste the contents of `supabase/migrations/0001_init.sql`, and click **Run**.
2. **Deploy the Ingestion Function**:
   Install the Supabase CLI globally, log in, link your project, and deploy the `feed-rank` Edge Function:
   ```bash
   # Install CLI
   npm install -g supabase

   # Log into your Supabase account
   supabase login

   # Link to your Supabase project (get your project-ref from your Supabase URL dashboard)
   supabase link --project-ref your-project-ref-here

   # Deploy the edge function
   supabase functions deploy feed-rank

   # Set API Secrets for the Edge Function
   supabase secrets set YOUTUBE_API_KEY=your_youtube_api_key_here
   supabase secrets set NEWSAPI_KEY=your_news_api_key_here
   ```

---

## 🚀 Running the Project

### Method A: Run via Expo Go (QR Code Scanner)

This is the fastest method to preview changes instantly on your device.

1. **Start the local Expo development server**:
   ```bash
   npx expo start -c
   ```
2. A **QR code** will be displayed in your terminal.
3. **Open the app**:
   *   **Android**: Open the **Expo Go** app and tap **"Scan QR Code"** to scan the terminal's QR code.
   *   **iOS**: Open the native iOS **Camera** app, scan the QR code, and tap the link to open it in **Expo Go**.
4. The JavaScript bundle will build and load on your phone. Any code changes you save in the editor will reload instantly on your screen (Fast Refresh).

---

### Method B: Build a Standalone APK (QR Code for APK Installation)

If you want a standalone Android app (`.apk`) that can be installed on any device without using Expo Go, you can build it using **EAS Build**.

1. **Install the EAS CLI globally**:
   ```bash
   npm install -g eas-cli
   ```
2. **Log in to your Expo account**:
   ```bash
   eas login
   ```
3. **Register/Configure the project with EAS** (run once):
   ```bash
   eas project:init
   ```
4. **Trigger the Android preview build**:
   ```bash
   eas build --platform android --profile preview
   ```
   *Note: The `preview` profile in `eas.json` is configured to build an installable APK file (`"distribution": "internal"`).*
5. **Scan and Install**:
   *   EAS will upload your project and build the APK in the cloud.
   *   Once the build completes, the terminal will print a **QR code** linking to the build details page.
   *   Scan this QR code with your phone's camera. It will open the Expo build page where you can tap **Download APK** and install the app directly on your Android phone!

---

## 🔑 Configuring Google Sign-In

To use the **Continue with Google** button, you must configure Google OAuth credentials in both Google Cloud Console and your Supabase Dashboard.

### Step 1: Create OAuth Credentials on Google Cloud
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** and select **OAuth client ID**.
5. Set the **Application type** to **Web application** (Supabase handles the OAuth exchange on its servers).
6. Under **Authorized redirect URIs**, add your Supabase redirect callback URL:
   `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
   *(Replace `<your-supabase-project-ref>` with your actual Supabase project reference).*
7. Click **Create** and copy the generated **Client ID** and **Client Secret**.

### Step 2: Enable Google Provider in Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** > **Providers** > **Google**.
3. Toggle Google provider **ON**.
4. Paste the **Client ID** and **Client Secret** you obtained in Step 1.
5. Click **Save**.

### Step 3: Configure Mobile Redirect URLs in Supabase
Because the OAuth flow opens in a mobile browser overlay, Supabase needs to know which deep links are allowed to redirect back into the mobile app.
1. In your Supabase Dashboard, navigate to **Authentication** > **URL Configuration**.
2. Under **Redirect URLs**, add the following deep links:
   *   `alphadex:///(auth)/login` (For standalone built APKs)
   *   `exp://192.168.x.x:8081/--/(auth)/login` (For local Expo Go testing — replace `192.168.x.x` with your computer's actual local IP address).
3. Under **Site URL**, you can set `alphadex://`.
4. Click **Save**.

