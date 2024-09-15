import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Wordle from './Wordle'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Wordle />
  </StrictMode>,
)
