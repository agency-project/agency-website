import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="flex min-h-screen items-center justify-center px-6 py-12 text-center">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Agency</h1>
        <p className="mt-4 text-lg text-gray-600">A platform for researching and optimizing AI agents.</p>
        <a className="mt-6 inline-block text-blue-700 underline hover:text-blue-900" href="https://github.com/agency-project/agency">
          GitHub
        </a>
      </div>
    </main>
  </StrictMode>,
)
