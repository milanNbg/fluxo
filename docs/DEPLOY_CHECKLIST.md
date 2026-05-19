# Production Deploy Checklist

Reference checklist for deploying Fluxo to production. Complete each section before moving to the next.

---

## Phase 1: Account Setup (10 min)

### Neon — PostgreSQL Cloud Database
- [ ] Sign up at https://neon.tech (use GitHub OAuth)
- [ ] Create new project: "fluxo-production"
- [ ] Note connection string (starts with postgresql://)
- [ ] Verify SSL connection is enabled by default

### Vercel — Frontend Hosting
- [ ] Sign up at https://vercel.com (use GitHub OAuth)
- [ ] Authorize Vercel to access GitHub repos
- [ ] Verify free tier limits (100GB bandwidth/month)

### Railway — Backend Hosting (or Render as alternative)
- [ ] Sign up at https://railway.app (use GitHub OAuth)
- [ ] Verify free tier: $5 credit/month
- [ ] Alternative: https://render.com with free web service tier

### Anthropic API Production Key
- [ ] Decide: reuse dev key OR create separate production key
- [ ] If new: create at https://console.anthropic.com
- [ ] Verify credit balance ($5+ recommended)
- [ ] Note: production key should be different from dev key for security

---

## Phase 2: Database Migration (15 min)

- [ ] Get Neon connection string with SSL parameters
- [ ] Update local .env temporarily with Neon URL
- [ ] Run migrations against Neon using these PowerShell commands:
    - First set: $env:NODE_TLS_REJECT_UNAUTHORIZED="0"
    - Then run: pnpm --filter @fluxo/api exec prisma migrate deploy
- [ ] Verify tables created in Neon dashboard
- [ ] Restore local .env to local Postgres URL
- [ ] Document Neon connection string in password manager

---

## Phase 3: Backend Deploy (45 min)

### Railway/Render Setup
- [ ] Connect GitHub repo to deployment platform
- [ ] Select apps/api as root directory
- [ ] Set build command: pnpm install && pnpm --filter @fluxo/api build
- [ ] Set start command: pnpm --filter @fluxo/api start
- [ ] Configure Node.js version 22

### Environment Variables (Backend)
- [ ] DATABASE_URL — Neon connection string
- [ ] JWT_ACCESS_SECRET — strong random string (32+ chars)
- [ ] JWT_REFRESH_SECRET — strong random string (32+ chars)
- [ ] COOKIE_SECRET — strong random string (32+ chars)
- [ ] ANTHROPIC_API_KEY — production key
- [ ] CORS_ORIGIN — Vercel frontend URL (will set after frontend deploys)
- [ ] NODE_ENV=production
- [ ] PORT — usually set automatically by platform

### Verify Backend Deploy
- [ ] Visit deployed URL: your-backend.railway.app
- [ ] Test health check: /health/ready
- [ ] Expected response includes status: ready
- [ ] Document backend URL

---

## Phase 4: Frontend Deploy (30 min)

### Vercel Setup
- [ ] Import GitHub repo to Vercel
- [ ] Select apps/web as root directory
- [ ] Framework preset: Vite
- [ ] Build command: pnpm install && pnpm --filter @fluxo/web build
- [ ] Output directory: apps/web/dist

### Environment Variables (Frontend)
- [ ] VITE_API_URL — backend deployed URL

### Deploy and Test
- [ ] Trigger first deploy
- [ ] Visit Vercel URL
- [ ] Verify frontend loads
- [ ] Try to register a new account
- [ ] Note Vercel URL

---

## Phase 5: Connect Frontend ↔ Backend (15 min)

- [ ] Update backend CORS_ORIGIN to actual Vercel URL
- [ ] Update backend cookie configuration for cross-origin requests
- [ ] Backend may need cookie.sameSite=none and secure=true for production
- [ ] Restart backend after env var changes
- [ ] Test login flow: register → login → see dashboard

---

## Phase 6: End-to-End Testing (20 min)

- [ ] Register new account on live demo
- [ ] Verify email field validates correctly
- [ ] Login with new credentials
- [ ] Add 5-10 sample transactions
- [ ] Verify Dashboard stats update in real-time
- [ ] Test transaction filtering and search
- [ ] Test AI Assistant — streaming response works
- [ ] Test AI Assistant — context shows real numbers
- [ ] Logout and login again — session persists
- [ ] Test on mobile device (responsive design)

---

## Phase 7: Polish & Documentation (15 min)

- [ ] Update README.md with live demo URL
  - [ ] Replace "Coming soon" with actual link
- [ ] Add link to LinkedIn profile
- [ ] Add link to CV/portfolio
- [ ] Commit and push: docs add live demo URL
- [ ] Verify GitHub repo About section has live demo link

---

## Phase 8: Optional Enhancements

### Custom Domain (Optional, ~30 min)
- [ ] Buy domain (e.g., fluxo.app or use subdomain)
- [ ] Configure DNS in Vercel
- [ ] Add to backend CORS_ORIGIN

### Analytics (Optional, ~10 min)
- [ ] Add Vercel Analytics (free)
- [ ] Or Plausible/Umami for privacy-focused tracking

### Monitoring (Optional, ~20 min)
- [ ] Set up Sentry for error tracking
- [ ] Configure backend logging to Logtail or Better Stack

### CI/CD (Optional, ~45 min)
- [ ] GitHub Actions for automated testing on PR
- [ ] Lint + type-check on every commit
- [ ] Vercel and Railway auto-deploy on main push (default)

---

## Common Issues & Solutions

### Issue: Backend fails to connect to Neon
**Solution:** Ensure connection string includes sslmode=require parameter

### Issue: CORS errors in production
**Solution:** Backend CORS_ORIGIN must be exact Vercel URL with https:// prefix

### Issue: Cookies not being set on login
**Solution:** Production needs cookie.secure=true and cookie.sameSite=none

### Issue: AI streaming fails in production
**Solution:** Verify Anthropic API key is set, no rate limiting on platform

### Issue: Build fails due to monorepo dependencies
**Solution:** Use platform-specific monorepo support or build script with pnpm --filter

---

## Resources

- Neon Documentation: https://neon.tech/docs
- Vercel Monorepo Guide: https://vercel.com/docs/monorepos
- Railway Deploy Guide: https://docs.railway.app/guides/nodejs
- Anthropic Best Practices: https://docs.anthropic.com/claude/docs/best-practices