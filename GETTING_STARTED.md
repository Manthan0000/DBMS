# 🚀 Getting Started Guide

## Step 1: Install Dependencies ✅

Dependencies are already installed! You can verify by running:
```bash
npm install
```

## Step 2: Set Up MySQL Database

### Option A: If MySQL is Already Installed

1. **Start MySQL Service:**
   ```bash
   # Windows (Run as Administrator)
   net start MySQL80
   # or
   net start MySQL
   
   # Check if MySQL is running
   mysql --version
   ```

2. **Create the Database:**
   ```bash
   mysql -u root -p
   ```
   Then in MySQL prompt:
   ```sql
   CREATE DATABASE college_erp;
   EXIT;
   ```

3. **Update .env file** with your MySQL credentials:
   ```env
   DATABASE_URL="mysql://YOUR_USERNAME:YOUR_PASSWORD@localhost:3306/college_erp"
   JWT_SECRET="college-erp-super-secret-jwt-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   **Replace:**
   - `YOUR_USERNAME` with your MySQL username (usually `root`)
   - `YOUR_PASSWORD` with your MySQL password

### Option B: Install MySQL (If Not Installed)

1. **Download MySQL:**
   - Visit: https://dev.mysql.com/downloads/mysql/
   - Download MySQL Installer for Windows
   - Install and set a root password

2. **Create Database:**
   ```bash
   mysql -u root -p
   ```
   Enter your password, then:
   ```sql
   CREATE DATABASE college_erp;
   EXIT;
   ```

3. **Update .env file** with your MySQL credentials

## Step 3: Initialize Database Schema

Once MySQL is running and .env is configured:

```bash
# Push schema to database
npm run db:push
```

This will create all tables in your database.

## Step 4: Seed Database with Sample Data

```bash
# Add sample data
npm run db:seed
```

This creates:
- 1 Admin user
- 3 Professors
- 20 Students
- 6 Courses
- Enrollments, Attendance, Grades, Fees

## Step 5: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## Step 6: Login

Use these default credentials:

### Admin
- **Email:** `admin@college.edu`
- **Password:** `password123`

### Student
- **Email:** `student1@college.edu`
- **Password:** `password123`

### Professor
- **Email:** `prof1@college.edu`
- **Password:** `password123`

## 🔧 Troubleshooting

### MySQL Connection Error

**Error:** `Authentication failed against database server`

**Solution:**
1. Check MySQL is running:
   ```bash
   mysql --version
   ```

2. Test connection manually:
   ```bash
   mysql -u root -p
   ```

3. Update `.env` file with correct credentials:
   ```env
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/college_erp"
   ```

### Database Doesn't Exist

**Error:** `Unknown database 'college_erp'`

**Solution:**
```bash
mysql -u root -p
```
Then:
```sql
CREATE DATABASE college_erp;
EXIT;
```

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
- Next.js will automatically use port 3001, 3002, etc.
- Or kill the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

## 📊 View Database

To visually browse your database:

```bash
npm run db:studio
```

This opens Prisma Studio at `http://localhost:5555`

## ✅ Verification Checklist

- [ ] MySQL is installed and running
- [ ] Database `college_erp` is created
- [ ] `.env` file has correct MySQL credentials
- [ ] `npm run db:push` completed successfully
- [ ] `npm run db:seed` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] Can login with default credentials

## 🎯 Next Steps

1. Explore the Admin Dashboard
2. Test Student features
3. Test Professor features
4. Review database in Prisma Studio
5. Read `README.md` for full documentation
6. Read `DBMS_DOCUMENTATION.md` for database design details

---

**Need Help?** Check `SETUP.md` for more detailed instructions.
