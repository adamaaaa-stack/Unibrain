# 🧠 UniBrain

> **Turn any text into a complete learning experience in seconds.**

UniBrain is an AI-powered study platform that transforms your notes, articles, PDFs, and images into interactive learning materials — summaries, flashcards, quizzes, and study games.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?logo=stripe)](https://stripe.com/)
[![Gemini](https://img.shields.io/badge/Gemini-AI-orange?logo=google)](https://ai.google.dev/)

![UniBrain Demo](https://via.placeholder.com/800x400/0f172a/06b6d4?text=UniBrain+Demo)

---

## ✨ Features

### 📚 AI-Powered Course Generation
- Paste any text, upload images, or drag & drop PDFs
- AI generates comprehensive learning materials instantly
- Works with lecture notes, articles, textbooks, and more

### 🎯 10 Study Modes
| Mode | Description |
|------|-------------|
| 📝 **Summary** | AI-generated overview of key concepts |
| 📖 **Study Guide** | Structured sections with key points |
| 🏷️ **Key Terms** | Searchable glossary of vocabulary |
| 🃏 **Flashcards** | Classic flip cards for memorization |
| 🧠 **Learn Mode** | Adaptive spaced repetition (focuses on weak cards) |
| ✍️ **Write Mode** | Type answers for better retention |
| 🎮 **Match Game** | Timed drag & drop matching game |
| ❓ **Quiz** | Multiple choice with scoring |
| 💭 **Practice** | Open-ended questions with hints |
| 💡 **Study Tips** | Personalized recommendations |

### 🚀 Why It's Better Than Quizlet
- ✅ **AI generates everything** — no manual card creation
- ✅ **Upload images & PDFs** — AI reads and learns from them
- ✅ **Adaptive learning** — focuses on what you don't know
- ✅ **10 study modes** — more ways to learn
- ✅ **Study guides & key terms** — not just flashcards
- ✅ **Modern UI** — beautiful, fast, responsive

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, TypeScript, TailwindCSS |
| **Backend** | Next.js API Routes (serverless) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **AI** | Google Gemini 2.0 Flash |
| **Payments** | Stripe |
| **Hosting** | Vercel |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Gemini API key
- Stripe account (for payments)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/unibrain.git
cd unibrain

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini AI
GEMINI_API_KEY=your_gemini_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 💳 Pricing Model

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 3 courses/month, 2 files/course |
| **Pro Trial** | Free for 7 days | Full access, no credit card |
| **Pro** | $9.99/month | Unlimited everything |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── generateCourse/  # Gemini AI integration
│   │   ├── stripe/          # Payment webhooks
│   │   └── usage/           # Usage tracking
│   ├── course/[id]/       # Course view page
│   ├── create/            # Create course page
│   ├── dashboard/         # User dashboard
│   ├── pricing/           # Pricing page
│   └── ...
├── components/            # React components
│   ├── FlashcardList.tsx
│   ├── QuizList.tsx
│   ├── LearnMode.tsx
│   ├── WriteMode.tsx
│   ├── MatchGame.tsx
│   └── ...
├── context/              # Auth context
├── lib/                  # Utilities
│   ├── supabase.ts
│   ├── gemini.ts
│   ├── stripe.ts
│   └── types.ts
```

---

## 🗄️ Database Schema

```sql
-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT,
  summary TEXT,
  flashcards JSONB,
  quiz JSONB,
  key_terms JSONB,
  study_guide JSONB,
  practice_questions JSONB,
  study_tips JSONB,
  created_at TIMESTAMPTZ
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  plan TEXT, -- 'free' or 'pro'
  status TEXT, -- 'active', 'trialing', 'canceled'
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT
);
```

---

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/unibrain)

1. Click the button above
2. Add environment variables
3. Deploy!

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Google Gemini](https://ai.google.dev/) - AI model
- [Stripe](https://stripe.com/) - Payments
- [TailwindCSS](https://tailwindcss.com/) - Styling

---

<p align="center">
  Made with ❤️ for students and lifelong learners
</p>
