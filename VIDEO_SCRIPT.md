# 🎬 QuoteBot - Demo Video Script

**Duration:** 3 minutes  
**For:** The AI Champion Ship Hackathon  
**Category:** Best AI Solution for Public Good

---

## 🎯 Video Structure

### INTRO (0:00 - 0:30)

**[Screen: Show QuoteBot logo/homepage]**

**Script:**
> "Hi, I'm Jorge Lopez from Mantenimiento Sinai, and this is QuoteBot - an AI-powered solution that's transforming how small construction contractors estimate project costs.
>
> The problem? Small contractors spend hours manually calculating estimates, often losing clients to faster competitors. QuoteBot solves this with AI, generating accurate quotes in seconds instead of hours."

**Visual:**
- Show homepage with clean UI
- Quick transition showing "Hours → Seconds" comparison

---

### DEMO: CORE FUNCTIONALITY (0:30 - 1:30)

**[Screen: Login page]**

**Script:**
> "Let me show you how it works. First, secure authentication powered by WorkOS..."

**Actions:**
1. Click "Sign In"
2. Show WorkOS login flow
3. Successfully log in

---

**[Screen: Main dashboard]**

**Script:**
> "Once logged in, creating a quote is simple. Let's say a client needs a door repair..."

**Actions:**
1. Type in description field: "Repair wooden door at main entrance, replace hinges and repaint"
2. Optionally upload a photo
3. Show language selector: "Notice we support both English and Spanish - critical for the 41 million Spanish-speaking construction workers in the US"

---

**[Screen: Click "Get Quote" button]**

**Script:**
> "Now watch this - I click 'Get Quote' and our Vultr-powered AI analyzes the job description..."

**Actions:**
1. Click button
2. Show loading animation
3. **Reveal estimate in ~2 seconds**

**Script:**
> "In just 2 seconds, we have an accurate estimate of $450. This same process would take a contractor 30-60 minutes manually."

---

**[Screen: Switch to Projects view]**

**Script:**
> "QuoteBot also includes project management. Contractors can organize multiple jobs under construction projects..."

**Actions:**
1. Click "Projects" tab
2. Show list of projects
3. Click "New Project"
4. Quickly create a project: "Residential Tower - Downtown"
5. Show project details

---

**[Screen: Language toggle]**

**Script:**
> "And remember - everything works in both English and Spanish."

**Actions:**
1. Click language selector
2. Toggle to Spanish
3. Show interface change
4. Toggle back to English

---

### TECHNICAL DEEP DIVE (1:30 - 2:30)

**[Screen: Split screen - Code + Architecture diagram]**

**Script:**
> "Now let's talk about the technology. QuoteBot is built on LiquidMetal's Raindrop Platform, which provides the backbone for our AI application."

**[Screen: Show raindrop.manifest file]**

**Script:**
> "Here's our Raindrop manifest. We're using SmartSQL for our database, storing projects, jobs, and quotes. We have a bucket for job photos, and our API service is deployed on Raindrop Cloud."

**Visual:**
```hcl
application "quotebot-backend" {
  service "api" {
    visibility = "public"
  }
  
  smartsql "main" {}
  bucket "job-photos" {}
}
```

---

**[Screen: Show API code with Vultr integration]**

**Script:**
> "The magic happens here - our integration with Vultr's AI inference server. When a user submits a job description, we send it to our custom-trained ML model running on Vultr infrastructure."

**Visual:**
```typescript
const aiRes = await fetch("http://216.238.87.125/predict", {
  method: "POST",
  body: JSON.stringify({
    description: jobDescription,
    category: category
  })
});
```

**Script:**
> "The model analyzes the description and returns an accurate cost estimate based on real construction data. This isn't just an API wrapper - it's real machine learning solving a real problem."

---

**[Screen: Show multilingual implementation]**

**Script:**
> "We've also implemented intelligent language detection. The API automatically detects the user's language from browser settings or query parameters, and responds accordingly."

**Visual:**
```typescript
function getLang(c) {
  const queryLang = c.req.query('lang');
  if (queryLang === 'en' || queryLang === 'es') return queryLang;
  
  const acceptLang = c.req.header('Accept-Language');
  if (acceptLang?.includes('en')) return 'en';
  
  return 'es'; // default
}
```

---

**[Screen: Architecture diagram]**

**Script:**
> "The complete architecture: React frontend deployed on Netlify, Raindrop backend with Hono.js, SmartSQL database, photo storage, and Vultr AI - all working together seamlessly."

**Visual:**
- Show clean architecture diagram
- Highlight Raindrop components
- Highlight Vultr integration

---

### IMPACT & CLOSING (2:30 - 3:00)

**[Screen: Impact statistics/visuals]**

**Script:**
> "But QuoteBot isn't just about technology - it's about impact. We're helping small construction contractors compete with large companies. We're reducing estimation time by 95%. We're serving Spanish-speaking contractors who are often overlooked by mainstream software.
>
> This is AI for public good - empowering small businesses, optimizing resources in construction, and making professional tools accessible to everyone.
>
> QuoteBot is live at wiki-maestra-v1.netlify.app, fully open source on GitHub, and ready to help contractors today.
>
> Thank you for watching, and thank you to LiquidMetal AI and Vultr for making this possible!"

**Visual:**
- Show key metrics:
  - "95% faster estimates"
  - "41M Spanish speakers served"
  - "Small teams empowered"
- End with QuoteBot logo + URLs
- GitHub: github.com/jorgeahmed/qoutebot
- Live: wiki-maestra-v1.netlify.app

---

## 🎥 Recording Tips

### Setup
1. **Screen Resolution:** 1920x1080 (Full HD)
2. **Browser:** Chrome (clean, no extensions visible)
3. **Audio:** Clear microphone, quiet environment
4. **Lighting:** Good lighting for webcam (if showing face)

### Recording Tools
- **OBS Studio** (Free, professional)
- **Loom** (Easy, web-based)
- **Zoom** (Record screen + audio)

### Before Recording
- [ ] Close unnecessary tabs
- [ ] Clear browser history/cache
- [ ] Test audio levels
- [ ] Practice run-through (2-3 times)
- [ ] Have script visible but don't read robotically
- [ ] Prepare test data (job descriptions ready to paste)

### During Recording
- [ ] Speak clearly and enthusiastically
- [ ] Pause briefly between sections
- [ ] Show, don't just tell
- [ ] Keep cursor movements smooth
- [ ] Smile when speaking (it shows in your voice!)

### After Recording
- [ ] Review for errors
- [ ] Add captions (YouTube auto-generate)
- [ ] Upload to YouTube as "Unlisted" or "Public"
- [ ] Add to video description:
  ```
  QuoteBot - AI-Powered Construction Cost Estimator
  
  Submission for The AI Champion Ship Hackathon
  Category: Best AI Solution for Public Good
  
  Built with:
  - LiquidMetal Raindrop Platform
  - Vultr AI Inference
  - React + TypeScript
  - WorkOS Authentication
  
  Live App: https://wiki-maestra-v1.netlify.app/
  GitHub: https://github.com/jorgeahmed/qoutebot
  
  #AIChampionShip #LiquidMetalAI #Vultr #BuildWithAI
  ```

---

## 📝 Backup Script (If Short on Time)

**90-Second Version:**

**0:00-0:20** - Problem + Solution intro  
**0:20-0:50** - Quick demo (login, create quote, show estimate)  
**0:50-1:20** - Tech stack (Raindrop + Vultr)  
**1:20-1:30** - Impact + closing  

---

## ✅ Pre-Recording Checklist

- [ ] App is working and deployed
- [ ] Test account ready (or use real login)
- [ ] Sample job descriptions prepared
- [ ] Projects created for demo
- [ ] Code files ready to show
- [ ] Architecture diagram ready
- [ ] Recording software tested
- [ ] Microphone tested
- [ ] Script practiced 2-3 times
- [ ] Timer ready (stay under 3 min!)

---

**Good luck! You've got this! 🎬🚀**
