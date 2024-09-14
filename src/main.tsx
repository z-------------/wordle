import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Wordle from './Wordle.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Wordle />
  </StrictMode>,
)
