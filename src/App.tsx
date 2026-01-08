import './App.css';
import { useEffect, useState } from 'react';
import { scrollToSection } from './buttonClicks.ts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // wrap date picker/tells how to format dates 
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

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

  const [date, setDate] = useState<dayjs.Dayjs | null>(dayjs()); // typescript requires us to take into account possible null
  const [bookedDates, setBookedDates] =useState<string[]>([]);  // expect an array of strings 
  const formattedDate = date ? date.format('MM/DD/YYYY') : "No date" ; // format to string to send to API
  const [alert, setAlert] = useState("");
  const [showAlert, setShowAlert] = useState(false); 
  const [appointmentTime, setappointmentTime] = useState('12:00 PM'); 
  const [cancelName, setCancelName] = useState("");  
  const [cancelEmail, setCancelEmail] = useState(""); 
  const [cancelDate, setCancelDate] = useState<dayjs.Dayjs | null>(dayjs());
  const formattedCancelDate =  cancelDate ? cancelDate.format('MM/DD/YYYY') : "No date"
  const [file, setFile] = useState<File | null >(null); 
  const [description, setDescription]  = useState(''); 

  const nextAvailibility = () => {

    if (!date) return null; 
    let nextDate = dayjs().add(1, 'day'); // get currentDate from dayjs


    while (true) {
      nextDate = nextDate.add(1, 'day'); 
      const formattedNextDate = nextDate.format('MM/DD/YYYY') 

      const currentDay = nextDate.day(); 

      // check if date is taken
      if (bookedDates.includes(formattedNextDate)){
        continue
      }
      // not a weekend
      if (currentDay !== 0 && currentDay !== 6){
        return nextDate;  
      }
    }
  }
  // get data for calender after rendering for next available date
  useEffect(() => {
    const fetchDate = async () =>{
      try {
        const getDate = await fetch('https://vrx2kxxqomkalbuehfkncwkdly0imcwk.lambda-url.us-west-2.on.aws/',{
          method: 'GET',
          headers: { 'Content-Type': 'application/json'},
        })
        const dateData = await getDate.json(); 
        const dateString = dateData.map((item: {formattedDate: string}) => item.formattedDate) //  change to array of strings from objects so date is grayed out when refreshed 
        setBookedDates(dateString); 
      } catch (error){
        console.log('Error fetching date: ', error)
      }
    }
    fetchDate(); 
  }, []);
  // get next available date when page refreshes
  useEffect(() => {
    if (bookedDates.length > 0) {
      setDate(nextAvailibility());
    }
  }, [bookedDates]);

  const dateDisabled = (day: dayjs.Dayjs) => {
    const formatted = day.format('MM/DD/YYYY');
    return bookedDates.includes(formatted) || day.day() === 0 || day.day() === 6;
  };

  const cancelSectionDateDisabled =  (day: dayjs.Dayjs) => {
    const formatted = day.format('MM/DD/YYYY')
    return !bookedDates.includes(formatted) ||  day.day() === 0 || day.day() === 6; 
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userData = { name, email, formattedDate, appointmentTime };
    try {
      // Get the URL data and convert to JSON
    const response = await fetch('https://vrx2kxxqomkalbuehfkncwkdly0imcwk.lambda-url.us-west-2.on.aws/', { // Change to API gateway via lambda for production stage 
      method: 'POST',
      headers: { 'Content-Type' : 'application/json'},
      body: JSON.stringify(userData)
    });


    const uploadPhoto = async () => {
      if (!file) return; 
      // save JSON as virtual HTML form 
      const dataPDF = new FormData(); 
      //push this data to form
      dataPDF.append('pdf', file)
      dataPDF.append('description', description);
      dataPDF.append('name', name);
      dataPDF.append('email', email);
      dataPDF.append('date', formattedDate);
      dataPDF.append('time', appointmentTime);


      await fetch ('https://qdpptyrlzoapoxnimedhse7aoy0ascxm.lambda-url.us-west-2.on.aws/', {
        method: 'POST',
        body: dataPDF
      });
    }


    const data = await response.json();

    if (!response.ok) {
      console.error("Backend error:", data);
      setAlert(`Backend error: ${JSON.stringify(data)}`);
      return;
    }
    if (response.ok) {
      await uploadPhoto(); //upload photo after booking or if failed photo wont upload
      setBookedDates(prevDate => [...prevDate, formattedDate]); 
      setDate(nextAvailibility());
      setAlert(`Appointment confirmed for ${formattedDate} `)
      setShowAlert(true);
      console.log('Successfully booked: ', data); 
      setTimeout(() => setShowAlert(false), 3000)

    } else{
      setAlert('Date already booked. Please choose another date.')
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    };

    

    } catch (error) {
      console.error('Fetch error:', error);
      setAlert('Error booking appointment. Please try again.');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return; 
    }
  };

    const handleDelete =  async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const userData = { cancelName, cancelEmail, formattedCancelDate, appointmentTime };
      try {
          // Get the URL data and convert to JSON
        const response = await fetch('https://qdpptyrlzoapoxnimedhse7aoy0ascxm.lambda-url.us-west-2.on.aws/', { // Change to API gateway via lambda for production stage 
          method: 'DELETE',
          headers: { 'Content-Type' : 'application/json'},
          body: JSON.stringify(userData)
        }); 

        const deleteData =  await response.json(); 
        if (response.ok) {
          setBookedDates(prevDate => prevDate.filter(date => date != formattedCancelDate)); 
          setAlert(`Appointment deleted for : ${formattedCancelDate}`);
          setShowAlert(true); 
          console.log('Succesfully deleted: ', deleteData); 
          setTimeout(() => setShowAlert(false), 3000); 

        } else {
          setAlert('Date not found. Please try again.')
          setShowAlert(true); 
          setTimeout(() => setShowAlert(false), 3000); 
        } 

      } catch {
        setAlert('Error deleting appointment. Please try again.');
        setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
      };
}; 
//  venmo direct deposit link 
    const depositAmount = 50; 
    const encodeDeposit =  encodeURIComponent('Tattoo deposit for appointment');
    const directDeposit  = `https://venmo.com/camiep14?txn=pay&amount=${depositAmount}&note=${encodeDeposit}`;
// cash app direct deposit 
    const cashAppDepositAmount = 50; 
    const cashAppDeposit = `https://cash.app/$CamiePascual/${cashAppDepositAmount}`;
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
            <button className='cancel-button'
            onClick = { () => {
              scrollToSection('cancelling')
              setIsMenuOpen(false);
            }}
            >
              Cancel
            </button>
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
            <div className='date-picker'>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={date}
                  onChange={(newDate) => setDate(newDate)}
                  shouldDisableDate={dateDisabled}
                  slotProps={{
                    textField: {
                      sx: {
                        '& .MuiInputBase-root': {
                          backgroundColor: '#FFFFFF !important',
                        },
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#FFFFFF !important',
                        },
                        '& .MuiOutlinedInput-input': {
                          backgroundColor: '#FFFFFF !important',
                        },
                        backgroundColor: '#FFFFFF !important',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 20, 147, 0.5)',
                          borderWidth: '2px',
                          backgroundColor: '#FFFFFF !important',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ff1493',
                        },
                        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ff1493',
                        },
                      }
                    }
                  }}
                ></DatePicker>
              </LocalizationProvider>
              <div className='time-slots'>
                <select
                value ={appointmentTime}
                onChange={(e) => setappointmentTime(e.target.value)}
                >
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                </select>
              </div>
              <div className='reference'>
                <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <label>Photo referernce</label>
                <input
                type='file'
                accept ='application/pdf,image/*'
                onChange={(e) => setFile(e.target.files ? e.target.files[0]: null)}
                ></input>
              </div>
            </div>
            <a href={cashAppDeposit} target="_blank" rel="noopener noreferrer">
              <button type="button"><img src="/cashapp-logo.png" alt="Cash App Logo" className="cash-app-logo" /><span>Cash App</span></button>
            </a>
            <a href={directDeposit} target="_blank" rel="noopener noreferrer">
              <button type="button"><img src="/venmo-logo.png" alt="Venmo Logo" className="venmo-logo" /><span>Venmo</span></button>
            </a>
            <button type="submit">Submit</button>
          </form>
          {showAlert && (
            <div className='alert'>
              {alert}
            </div>
          )}
        </div>

        <div className='section' id='cancelling'>
        <form onSubmit={handleDelete}>
            <input
              type="text"
              value={cancelName}
              onChange={(e) => setCancelName(e.target.value)}
              placeholder="Full Name"
              required
            />
            <input
              type="text"
              value={cancelEmail}
              onChange={(e) => setCancelEmail(e.target.value)}
              placeholder="Full Email"
              required
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
              value ={cancelDate}
              onChange={(newDate) => setCancelDate(newDate)}
              shouldDisableDate={cancelSectionDateDisabled}
              slotProps={{
                textField: {
                  sx: {
                    '& .MuiInputBase-root': {
                      backgroundColor: '#FFFFFF !important',
                    },
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#FFFFFF !important',
                    },
                    '& .MuiOutlinedInput-input': {
                      backgroundColor: '#FFFFFF !important',
                    },
                    backgroundColor: '#FFFFFF !important',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 20, 147, 0.5)',
                      borderWidth: '2px',
                      backgroundColor: '#FFFFFF !important',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff1493',
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff1493',
                    },
                  }
                }
              }}
              ></DatePicker>
            </LocalizationProvider>
            <button type="submit">Cancel</button>
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
