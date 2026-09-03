# Men Let's Talk

Men Let's Talk (MLT) is a movement creating safe spaces where men can have honest
conversations about life, relationships, fatherhood, mental health, faith, purpose,
failure, finances and the pressures of being a man.

This repo is the MLT website — a Next.js app on Vercel, with content for the
regularly-updated sections (events, articles, resources, stories, etc.) managed
through a Sanity Studio.

## Local development

```bash
npm install
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm run test                           # unit tests (Vitest)
npm run dev &                          # e2e needs the app running first
conda run -n ds python e2e/run.py      # end-to-end smoke tests
```
