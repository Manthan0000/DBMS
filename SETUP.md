# 🚀 Quick Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** or **yarn** package manager

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Navigate to project directory
cd college-erp-system

# Install dependencies
npm install
```

### 2. Database Setup

#### Create MySQL Database

```sql
CREATE DATABASE college_erp;
```

#### Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mysql://username:password@localhost:3306/college_erp"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Replace:**
- `username` with your MySQL username
- `password` with your MySQL password
- `localhost:3306` if your MySQL runs on a different host/port

### 3. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔑 Default Login Credentials

After seeding, use these credentials:

### Admin
- **Email:** `admin@college.edu`
- **Password:** `password123`

### Student
- **Email:** `student1@college.edu`
- **Password:** `password123`

### Professor
- **Email:** `prof1@college.edu`
- **Password:** `password123`

## 📊 Database Management

### View Database in Prisma Studio

```bash
npm run db:studio
```

This opens a visual database browser at `http://localhost:5555`

### Create Migration

```bash
npm run db:migrate
```

### Reset Database (⚠️ Deletes all data)

```bash
npx prisma migrate reset
```

## 🐛 Troubleshooting

### Database Connection Issues

1. **Check MySQL is running:**
   ```bash
   # Windows
   net start MySQL80
   
   # Linux/Mac
   sudo systemctl start mysql
   ```

2. **Verify DATABASE_URL in .env file:**
   - Format: `mysql://user:password@host:port/database`
   - Ensure no spaces around `=`

3. **Test connection:**
   ```bash
   mysql -u username -p -e "USE college_erp; SHOW TABLES;"
   ```

### Port Already in Use

If port 3000 is busy, Next.js will automatically use the next available port (3001, 3002, etc.)

### Prisma Client Issues

If you see "PrismaClient is not generated" errors:

```bash
npm run db:generate
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📁 Project Structure Overview

```
college-erp-system/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── student/           # Student pages
│   ├── professor/         # Professor pages
│   └── login/             # Login page
├── components/            # React components
│   ├── ui/               # UI components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication
│   ├── db.ts             # Database client
│   └── validations.ts    # Zod schemas
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Seed script
└── README.md             # Main documentation
```

## 🎯 Next Steps

1. **Explore the Admin Dashboard:**
   - View statistics
   - Manage students, professors, courses
   - View enrollments, attendance, grades

2. **Test Student Features:**
   - Login as student
   - View enrolled courses
   - Check attendance and grades
   - View fee invoices

3. **Test Professor Features:**
   - Login as professor
   - View assigned courses
   - Mark attendance
   - Enter grades

4. **Review Database:**
   - Open Prisma Studio to explore data
   - Review schema in `prisma/schema.prisma`
   - Check DBMS documentation in `DBMS_DOCUMENTATION.md`

## 📚 Additional Resources

- **Main README:** See `README.md` for comprehensive documentation
- **DBMS Documentation:** See `DBMS_DOCUMENTATION.md` for database design details
- **API Documentation:** See `README.md` API section for endpoint details

## 🆘 Need Help?

1. Check the error message in terminal/console
2. Review `README.md` and `DBMS_DOCUMENTATION.md`
3. Verify all environment variables are set correctly
4. Ensure MySQL is running and accessible
5. Check that all dependencies are installed

---

**Happy Coding! 🎓**
