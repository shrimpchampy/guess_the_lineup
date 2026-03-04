# Deploy to guess-the-lineup.vercel.app — Step-by-Step

Follow these steps **exactly** in your terminal.

---

## Step 1: Open Terminal and go to your project

```bash
cd /Users/mmenotti/missing-man-chicago
```

Press **Enter**.

---

## Step 2: Remove the current Vercel link

```bash
rm -rf .vercel
```

Press **Enter**.  
(You won't see any output — that's normal.)

---

## Step 3: Run vercel link (do NOT use --prod yet)

```bash
vercel link
```

Press **Enter**.

---

## Step 4: Answer the prompts

You'll see several questions. Here's what to do for each:

### Question 1: "Which scope do you want to deploy to?"
- Use the **arrow keys** to select **Michael's projects**
- Press **Enter**

### Question 2: "Link to existing project?"
- Type **y** (for yes) and press Enter

### Question 3: "What's the name of your existing project?"
- Type: **guess-the-lineup**
- Press **Enter**

(If it shows a list of projects instead, use arrow keys to select **guess-the-lineup** and press Enter.)

---

## Step 5: Deploy

```bash
npx vercel --prod
```

Press **Enter**. It will deploy without asking questions (because you're now linked to guess-the-lineup).

---

## Step 6: Check your site

Open: **https://guess-the-lineup.vercel.app**

Your changes should be there. If not, try a hard refresh: **Cmd + Shift + R**

---

## If something goes wrong

**"Project not found"** when typing guess-the-lineup:
- Go to https://vercel.com/dashboard
- Click on your **guess-the-lineup** project
- Check the exact project name in the URL or Settings

**vercel link asks different questions:**
- The CLI sometimes changes. If you see "Link to existing project?" — say **yes**
- If you see a list of projects — select **guess-the-lineup**
