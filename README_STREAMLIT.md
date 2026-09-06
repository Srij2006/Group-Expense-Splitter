# Group Expense Splitter - Streamlit Edition

A simple and elegant web application for splitting shared group expenses.

## 🚀 Features

- ✅ Add and track group expenses
- ✅ Manage multiple group members
- ✅ Support for equal and custom splits
- ✅ Automatic settlement calculation
- ✅ Visual expense reports and analytics
- ✅ Export data as JSON
- ✅ Responsive and user-friendly interface

## 📋 Pages

### 1. **Home**
- Overview of total expenses, members, and transactions
- Quick guide on how to use the app

### 2. **Add Expense**
- Manage group members
- Record new expenses
- Choose split method (equal or custom)
- Track payment dates

### 3. **View Expenses**
- See all recorded expenses
- View detailed split information
- Delete expenses if needed
- Summary statistics

### 4. **Calculate Splits**
- View member balances
- Get settlement instructions
- See who owes whom and how much
- Export settlement summary

### 5. **Settings**
- Download all data as JSON
- Clear all data
- View current data summary

## 🌐 Deploy on Streamlit Cloud (FREE)

### Step 1: Push to GitHub ✅ (Already done!)
Your code is already in: `https://github.com/Srij2006/Group-Expense-Splitter`

### Step 2: Sign Up for Streamlit Cloud
1. Go to [streamlit.io](https://streamlit.io)
2. Click "Sign up" → Sign in with your GitHub account
3. Authorize Streamlit to access your repositories

### Step 3: Deploy
1. Click "New app" on the Streamlit Cloud dashboard
2. Select:
   - **Repository**: `Srij2006/Group-Expense-Splitter`
   - **Branch**: `main`
   - **Main file path**: `streamlit_app.py`
3. Click "Deploy"

### Step 4: Access Your App
- Your app will be live at: `https://share.streamlit.io/Srij2006/Group-Expense-Splitter/main/streamlit_app.py`
- Streamlit will generate a custom URL for you

## 🛠️ Run Locally

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the app:**
   ```bash
   streamlit run streamlit_app.py
   ```

3. **Open in browser:**
   - Streamlit will automatically open at `http://localhost:8501`

## 📦 Deployment Files

- `streamlit_app.py` - Main Streamlit application
- `requirements.txt` - Python dependencies
- `.streamlit/config.toml` - Streamlit configuration

## 💾 Data Storage

Currently, data is stored in **Streamlit Session State** and will reset when the browser is refreshed. For persistent storage, you can:

- Connect to a database (PostgreSQL, SQLite)
- Use Streamlit Cloud's secrets management
- Store data in cloud storage (AWS S3, Google Cloud Storage)

## 📱 Browser Support

Works on all modern browsers:
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## 📄 License

This project is open source and available under the MIT License.

---

**Questions?** Check out [Streamlit Documentation](https://docs.streamlit.io/)
