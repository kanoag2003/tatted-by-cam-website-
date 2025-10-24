import './App.css';
import { useState } from 'react';
import { scrollToSection } from './buttonClicks.ts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';


function App() {
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [name,setName] = useState("");
  const [email, setEmail] = useState(""); 
  const slider = [
    '/tyler-tattoo.jpeg',
    '/filipino-letters.JPG',
    '/pickaxe.jpeg',
    '/flower-butterfly-tattoo.jpeg',
    '/flower-tattoo.jpeg',
    '/inner-forearm.jpeg',
    '/name-tattoo.jpeg',
    '/poly-forearm-tattoo.jpeg'
  ];
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userData = { name, email, date };
    // Get the URL data and convert to JSON
    const response = await fetch('https://vrx2kxxqomkalbuehfkncwkdly0imcwk.lambda-url.us-west-2.on.aws/', { // Change to API gateway via lambda for production stage 
    
    method: 'POST',
    headers: { 'Content-Type' : 'application/json'},
    body: JSON.stringify(userData)
  }); 

  const data = await response.json();
  console.log(data); 
}; 
  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-buttons-container">
          <img src="/Tatted_By_Cam_logo.jpeg" alt="Tatted by Cam Logo" className="logo" />
        </div>

        <button className="hamburger" aria-label="Open menu" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(o => !o)}>
          <svg viewBox="0 0 24 18" aria-hidden="true" focusable="false">
            <line x1="2" y1="2" x2="22" y2="2" />
            <line x1="2" y1="9" x2="22" y2="9" />
            <line x1="2" y1="16" x2="22" y2="16" />
          </svg>
        </button>
      </header>
      {/* Off-screen drawer menu */}
      <div className={`drawer-overlay${isMenuOpen ? ' open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <aside className="drawer" onClick={(e) => e.stopPropagation()}>
          <nav className="drawer-nav">
            <button className='home-button' onClick={() => setIsMenuOpen(false)}>Home</button>
            <button className='about-button'
            onClick = { () => {
              scrollToSection('about');
              setIsMenuOpen(false);
            }} 
            >About Me</button>
            <button className='portfolio-button'
            onClick = { () => {
              scrollToSection('portfolio');
              setIsMenuOpen(false);
            }}
            >Portfolio</button>
            <button className='schedule-button'
            onClick = { () => {
              scrollToSection('schedule');
              setIsMenuOpen(false);
            }}
            >Schedule</button>
            <button className='policy-button'
            onClick = { () => {
              scrollToSection('policy');
              setIsMenuOpen(false);
            }}
            > Policies</button>
          </nav>
        </aside>
      </div>

      <main className="sections-wrapper">
        <div className='home-section section'>
          Home
        </div>

        <div className='section' id='about'>
          About
        </div>


        

        <div className='section' id='portfolio'>
        <div className='portfolio-header'>
          <h2 className='portfolio-title'>Portfolio</h2>
          <div className='underline'></div>
        </div>
            <Swiper
              effect='coverflow'
              grabCursor = {true}
              centeredSlides={true}
              slidesPerView= 'auto'
              loop={true}
              spaceBetween={-10}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              modules={[Autoplay, EffectCoverflow]}
              className="portfolio-swiper"
              coverflowEffect={{
                rotate: 25,                 
                stretch: 50,
                depth: 200,                 
                modifier: 1,
                slideShadows: true,
              }}
            >
              {slider.map((img, i) => (
                <SwiperSlide key={i} >
                  <img src={img} alt={`Tattoo ${i + 1}`} className='portfolio-img' />
                </SwiperSlide>
              ))}
      </Swiper>
        </div>

        <div className='section' id='schedule'>
        <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
            />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Full Email"
              required
            />
            <DatePicker
            value = {date}
            onChange = {(newDate) => setDate(date)}
            className = 'date-picker'
            />
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className='section' id='policy'>
          Policy
        </div>
      </main>
    </div>
  )
}
export default App
