# IP Tracking Dashboard - Quick Reference Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Clone/Download the Project
```bash
cd IPTrackingDashboard
```

### Step 2: Setup Firebase
1. Go to https://console.firebase.google.com/
2. Click "Create Project" → Name it "IP-Tracking-Dashboard"
3. Skip analytics, click "Create"
4. Go to Project Settings (gear icon) → Service Accounts
5. Click "Generate New Private Key" → JSON file will download
6. Open the JSON file and copy these values:
   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY
   - `client_email` → FIREBASE_CLIENT_EMAIL

### Step 3: Configure Backend
```bash
cd backend
cp .env.example .env
```
Edit `.env` with your Firebase credentials:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email@...
PORT=5000
```

### Step 4: Install & Run Backend
```bash
npm install
npm run dev
```
Backend runs on: http://localhost:5000/api

### Step 5: Run Frontend
Open `frontend/index.html` in your browser
Or use a local server:
```bash
# Terminal at project root
npx http-server -p 3000
```
Frontend runs on: http://localhost:3000

## 📋 Main Features

### Dashboard
- **Real-time Statistics**: Total IPs, URIs, Files, Critical alerts
- **Analytics Charts**: Severity, Source, Threat Types, Malware Types
- **Time Filtering**:
  - Quick: 1h, 3h, 6h, 12h, 24h, 1d, 5d, 12d
  - Custom: Select date range or enter duration (1 week, 2 months, etc.)

### IP Management
| Action | Steps |
|--------|-------|
| **Add IP** | IP Addresses → + Add IP → Fill form → Save |
| **Block IP** | Select Status: BLOCKED, Source: WAF/Firewall/IDS |
| **Search** | Use search bar or filter by status |
| **Edit** | Click edit icon on any IP row |
| **Delete** | Click trash icon on any IP row |

**Required Fields:**
- IP Address (e.g., 192.168.1.1)
- Status (BLOCKED, WHITELIST, SUSPICIOUS, MONITORING)
- Source (WAF, FIREWALL, IDS, SOC_ANALYST)
- Reason (why it's being blocked/flagged)

### URI Management
Similar to IP management but for URLs/URIs
- Threat Types: MALWARE, PHISHING, C2, EXFILTRATION, UNKNOWN
- Can associate multiple IPs with a URI

### File Management
Track malicious files by hash
- Hash Types: MD5, SHA1, SHA256
- Malware Types: TROJAN, RANSOMWARE, WORM, VIRUS, SPYWARE
- Block Locations: ENDPOINT, EMAIL, WEB, NETWORK

### Action History
- Complete timeline of all actions
- Filter by entity type (IP, URI, FILE)
- See who performed each action and when

## 🔧 Customization

### Change API URL
Edit `frontend/js/api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url/api';
```

### Change Colors/Styling
Edit `frontend/css/styles.css`:
```css
:root {
    --primary-color: #2563eb;
    --danger-color: #dc2626;
    --success-color: #16a34a;
    /* ... more colors */
}
```

### Add New Entity Type
1. Create controller in `backend/src/controllers/`
2. Create model schema
3. Add routes in `backend/src/routes/`
4. Add frontend page and forms
5. Add API client methods in `frontend/js/api.js`

## 🌐 Deployment to Vercel

### Deploy Backend
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
cd backend
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
# Add: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
```

### Deploy Frontend
1. Update API URL in `frontend/js/api.js`
2. Commit to GitHub
3. Connect GitHub repo to Vercel
4. Vercel auto-deploys on push

Or manually:
```bash
cd frontend
vercel --prod
```

## 📊 Timeframe Filtering Examples

### Relative (Predefined)
```
Last 1 hour → 1h
Last 3 hours → 3h
Last 24 hours → 24h
Last 5 days → 5d
```

### Absolute (Custom)
```
Start Date: 2024-01-01
End Date: 2024-01-31
Apply → Shows data for that period
```

### Duration-Based
```
Value: 2
Unit: Weeks
→ Shows data for last 2 weeks

Value: 1
Unit: Months
→ Shows data for last 1 month
```

## 🔍 Search & Filter

### Global Search (Top Bar)
- Searches across IPs, URIs, file names and hashes
- Real-time results

### Table Filters
- Status dropdown (BLOCKED, WHITELIST, SUSPICIOUS, MONITORING)
- Search box (specific to each table)
- Pagination (50 items per page)

## 📊 Data Structure

### IP Log Entry
```
{
  ipAddress: "192.168.1.1",
  status: "BLOCKED",
  source: "WAF",
  severity: "HIGH",
  reason: "Detected brute force attack",
  location: "Unknown",
  notes: "Block for 24 hours",
  actionTakenBy: "SOC Team"
}
```

### URI Log Entry
```
{
  uri: "https://malicious.com/payload",
  status: "BLOCKED",
  threatType: "MALWARE",
  severity: "CRITICAL",
  reason: "Hosts ransomware",
  associatedIPs: ["10.0.0.5"],
  actionTakenBy: "Security Analyst"
}
```

### File Entry
```
{
  fileName: "trojan.exe",
  fileHash: "a1b2c3d4e5f...",
  hashType: "SHA256",
  status: "QUARANTINED",
  malwareType: "TROJAN",
  blockLocation: "ENDPOINT",
  severity: "CRITICAL"
}
```

## ⚡ Performance Tips

1. **Limit Date Ranges**: Don't query too far back, use timeframes
2. **Batch Operations**: Add multiple items before filtering
3. **Index Creation**: Firestore auto-creates indexes for common queries
4. **Pagination**: Always use pagination for large datasets

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Backend won't start | Check .env file, verify Node.js version |
| Firebase connection fails | Check credentials in .env (use quotes for private key) |
| API returns 404 | Verify API_BASE_URL in frontend/js/api.js |
| CORS errors | Check backend CORS settings, add frontend URL |
| Charts not loading | Check Chart.js CDN link in HTML |
| Modal won't close | Check modal ID matches button onclick |

## 📞 Support Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Express.js**: https://expressjs.com/
- **Chart.js**: https://www.chartjs.org/
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: Create issue in repository

## 🎯 Roadmap / Future Enhancements

- [ ] User authentication (Firebase Auth)
- [ ] Role-based access control
- [ ] IP geolocation mapping
- [ ] Threat intelligence API integration
- [ ] Email notifications for critical events
- [ ] Export data to CSV/JSON
- [ ] Mobile app version
- [ ] API rate limiting
- [ ] Advanced analytics (ML-based anomaly detection)
- [ ] Integration with SIEM platforms

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**License**: MIT
