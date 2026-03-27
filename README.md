# stephenjdunn

Terminal-styled personal website built with Next.js App Router, TypeScript, Tailwind CSS, and file-backed MDX content.

## Stack

- `next` App Router
- `typescript`
- `tailwindcss`
- `@mdx-js/mdx` for MDX content rendering
- `rehype-pretty-code` for code blocks
- `lucide-react` for UI icons

## Local development

```bash
cd /Users/stephendunn/stephenjdunn
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Content workflow

- Add projects in `content/projects/*.mdx`
- Add posts in `content/blog/*.mdx`
- Update resume data in `content/resume.json`

## Deploy notes

- Netlify build command: `npm run build`
- Production branch: `main`
- Custom headers remain configured in `netlify.toml`
