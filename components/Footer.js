import { Github, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="text-center py-8 mt-4 text-sm text-slate-400">
      <p className="mb-3">made by Abdullah because he can&apos;t remember things</p>
      <div className="flex items-center justify-center gap-5">
        <a
          href="https://github.com/LegenWirLos"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-violet-500 transition-colors"
        >
          <Github size={15} />
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/abdullah-basharat/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-violet-500 transition-colors"
        >
          <Linkedin size={15} />
          LinkedIn
        </a>
      </div>
    </footer>
  )
}
