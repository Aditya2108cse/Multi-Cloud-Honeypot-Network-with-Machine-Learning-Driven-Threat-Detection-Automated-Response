# Personal Quick-Start Guide

## Project: MultiCloud-HoneypotNetwork with Automated Threat Detection & Response

---

## Prerequisites (Install Once)

```bash
# Cloud CLIs
# AWS
curl "https://awscli.amazonaws.com/AWSCLIV2.msi" -o AWSCLIV2.msi && msiexec /i AWSCLIV2.msi
# Azure
winget install Microsoft.AzureCLI
# GCP
winget install Google.CloudSDK

# Python 3.8+
winget install Python.Python.3.11

# OpenCanary (honeypot)
pip install opencanary
```

---

## Configuration (One-Time)

1. **Configure cloud credentials:**
   ```bash
   aws configure          # AWS keys + region
   az login               # Azure interactive login
   gcloud auth login      # GCP login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Create `/etc/auto-block.conf` (Linux) or `C:\auto-block.conf` (Windows):**
   ```ini
   # Required for blocking
   AWS_PL_ID=pl-xxxxxxxxxxxxxxxxx
   AWS_REGION=us-east-1
   
   AZURE_RG=your-resource-group
   AZURE_NSG=your-nsg-name
   
   GCP_PROJECT_ID=your-gcp-project
   
   # Optional: correlation tuning
   CORRELATION_WINDOW_MINUTES=15
   CORRELATION_THRESHOLD=3
   
   # Optional: OpenCanary log location (Linux default shown)
   OPENCANARY_LOG_FILE=/var/log/opencanary/opencanary.log
   
   # Optional: export file location
   EXPORT_FILE=/var/tmp/opencanary/opencanary_export.tsv
   ```

---

## Quick Test (Dry Run - No Changes Made)

```bash
cd scripts

# 1. Simulate correlation (creates export file)
python correlate_alerts.py --dry-run

# 2. Simulate blocking across all clouds
DRY_RUN=1 python block_attacker.py

# 3. Check block status for an IP
python multicloud_block_status.py 1.2.3.4

# 4. Simulate reset (cleanup)
DRY_RUN=1 python reset_all_blocks.py
```

---

## Production Run (Real Blocking)

```bash
cd scripts

# Run correlation once (or with --follow for continuous)
python correlate_alerts.py

# Block detected IPs across AWS, Azure, GCP
python block_attacker.py

# Verify blocks
python multicloud_block_status.py <IP>

# Rollback when done
python reset_all_blocks.py
```

---

## Environment Variables (Override Config File)

```bash
# Dry run mode (no actual changes)
DRY_RUN=1 python block_attacker.py

# Service principal for Azure (instead of interactive login)
AZURE_CLIENT_ID=xxx AZURE_CLIENT_SECRET=yyy AZURE_TENANT_ID=zzz python block_attacker.py

# Custom log file
OPENCANARY_LOG_FILE=/custom/path/opencanary.log python correlate_alerts.py
```

---

## ������ Frontend + Backend Dashboard (SafeNet Sentinel)

### Prerequisites (Install Once)

```bash
# Python 3.8+ for backend
winget install Python.Python.3.11

# Node.js 18+ for frontend
winget install OpenJS.NodeJS
```

### Install Dependencies

```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies
cd ../frontend
npm install
```

### Configuration Files

**Backend config** - Already uses `/etc/auto-block.conf` (same as CLI scripts)

**Frontend config** - `frontend/vite.config.js` proxies `/api/*` to backend:
```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

---

### Running the Dashboard

#### Terminal 1 — Backend (FastAPI)
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
��� **Verify:** http://localhost:8000/api/health

#### Terminal 2 — Frontend (Vite + React)
```bash
cd frontend
npm run dev
```
��� **Verify: Dashboard at `http://localhost:5177`** (port may vary - check terminal output)

---

## ����� Testing with Real Cloud Data

### Option 1: Dry Run (No Cloud Changes - Safe for Testing)
```bash
cd scripts

# Generate mock OpenCanary logs for testing
python -c "
import json, random, time
ips = ['1.2.3.4', '5.6.7.8', '9.10.11.12']
for _ in range(50):
    ip = random.choice(ips)
    log = {'src_ip': ip, 'utc_time': time.strftime('%Y-%m-%d %H:%M:%S'), 'logdata': {'SRC_IP': ip, 'msg': 'SSH brute force'}}
    print(json.dumps(log))
" > /tmp/test_opencanary.log

# Run correlation on test log
OPENCANARY_LOG_FILE=/tmp/test_opencanary.log python correlate_alerts.py --dry-run

# Check export
cat /var/tmp/opencanary/opencanary_export.tsv

# Now dashboard will show real correlated data!
```

### Option 2: Real OpenCanary Honeypot (Free)
```bash
# Install & run honeypot
pip install opencanary
opencanaryd --start

# Let it collect real attacks, then:
python correlate_alerts.py
python block_attacker.py  # Requires cloud credentials configured
```

### Option 3: Full Multi-Cloud (Requires Cloud Credentials)
1. **Configure cloud credentials** (see Configuration section above)
2. **Create managed resources:**
   - **AWS:** Managed Prefix List (`aws ec2 create-managed-prefix-list`)
   - **Azure:** NSG with scalable rule `AutoBlockedIPs-Honeypot`
   - **GCP:** VPC network with firewall rule creation permissions
3. **Run production pipeline:**
   ```bash
   # Continuous correlation + blocking
   python correlate_alerts.py --follow --interval 300 &
   python block_attacker.py
   ```

---