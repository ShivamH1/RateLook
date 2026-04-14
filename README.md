# RateLook – AI Aesthetic Analysis

RateLook is a premium AI-powered aesthetic analysis platform that provides objective feedback on grooming, style, and posture, along with personalized recommendations to boost your confidence.

![RateLook Logo](public/logo.png)

## 🚀 Features

- **AI Aesthetic Analysis**: Objective scoring (0-100) across Grooming, Style, and Posture.
- **Smart Recommendations**: Tailored advice on outfits, accessories, and grooming.
- **Confidence Boosters**: AI-identified strengths to build your self-image.
- **Guest Flow**: One free analysis for new visitors.
- **Secure Authentication**: User accounts to unlock unlimited analyses.
- **Privacy First**: Analysis is private and secure.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context (Auth)

### Backend
- **Framework**: [ElysiaJS](https://elysiajs.com/) (Bun runtime)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **AI**: Google Gemini (via AI Gateway/OpenAI compatible API)
- **Auth**: JWT with HttpOnly Cookies

## 🏁 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed on your machine.
- A PostgreSQL database.
- A Gemini API Key.

### 1. Clone the repository
```sh
git clone https://github.com/ShivamH1/RateLook.git
cd RateLook
```

### 2. Backend Setup
```sh
cd backend
bun install
```

Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgres://user:password@localhost:5432/ratelook"
JWT_SECRET="your-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
```

Push the database schema:
```sh
bun run db:push
```

Start the backend:
```sh
bun run dev
```

### 3. Frontend Setup
```sh
# From the root directory
bun install
bun dev
```

The application will be available at `http://localhost:8080`.

## 📄 License

This project is licensed under the MIT License.
