# 💡 IdeaForge

> Collaborative project ideation and voting platform

IdeaForge is a real-time collaboration tool that lets users create projects, brainstorm with idea cards, vote, comment, and chat—all within a shared workspace.

---

## 🚀 MVP Features

### ✅ Core Modules

- **Auth & Profiles** – JWT login/register, profile editing
- **Projects** – Create, join via invite link, manage roles
- **Idea Cards** – Feature/bug/idea/sketch cards with voting, likes, and comments
- **Real-Time Chat** – Socket.io-based, scoped per project
- **Filtering & Sorting** – By vote count, type, or recency
- **Dashboard** – View your owned and joined projects

---

## 🧱 Tech Stack

| Layer       | Tech                       |
|-------------|----------------------------|
| Frontend    | React                      |
| Routing     | React Router               |
| State Mgmt  | Context API (Redux optional) |
| Backend     | Node.js + Express          |
| DB          | PostgreSQL + Sequelize     |
| Auth        | JWT                        |
| Real-Time   | Socket.io                  |
| Image Upload| (optional)                 |

---

## 🔧 Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/ideaforge.git
cd ideaforge

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in DB credentials, JWT secret, etc.

# 4. Run migrations
npx sequelize-cli db:migrate

# 5. Start dev server
npm run dev
