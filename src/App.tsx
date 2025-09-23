import './App.css'
import { useState } from 'react'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-buttons-container">
          <img src="/Tatted_By_Cam_logo.jpeg" alt="Tatted by Cam Logo" className="logo" />
          <button className="hamburger" aria-label="Open menu" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(o => !o)}>
            <svg viewBox="0 0 24 18" aria-hidden="true" focusable="false">
              <line x1="2" y1="2" x2="22" y2="2" />
              <line x1="2" y1="9" x2="22" y2="9" />
              <line x1="2" y1="16" x2="22" y2="16" />
            </svg>
          </button>
          
        </div>
      </header>
      {/* Off-screen drawer menu */}
      <div className={`drawer-overlay${isMenuOpen ? ' open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <aside className="drawer" onClick={(e) => e.stopPropagation()}>
          <nav className="drawer-nav">
            <button className='home-button' onClick={() => setIsMenuOpen(false)}>Home</button>
            <button className='about-button'>About Me</button>
            <button className='portfolio-button'>Portfolio</button>
            <button className='schedule-button'>Schedule</button>
            <button className='policy-button'>Policies</button>
          </nav>
        </aside>
      </div>
      
    </div>
  )
}

export default App
