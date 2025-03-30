import { useState, useEffect, useRef } from 'react'
import './App.css'
import audioFile from './assets/takbit.mp3';

function Home() {
  // Existing state variables
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [schedule, setSchedule] = useState(null);
  const inputRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);
  const targetDate = new Date("2025-03-31T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  // Audio-related state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleDoa = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const difference = targetDate - now;
  
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  // Initialize audio player when component mounts
  useEffect(() => {
    // Create audio element with the Eid/Ramadan music URL
    audioRef.current = new Audio(audioFile); // Replace with your actual audio file path
    audioRef.current.loop = true; // Make the music loop continuously
  
    // Add event listener for when audio ends (as a backup in case loop doesn't work)
    const handleAudioEnd = () => {
      audioRef.current.currentTime = 0; // Reset to beginning
      audioRef.current.play().catch(error => {
        console.error("Error replaying audio:", error);
      });
    };
    
    audioRef.current.addEventListener('ended', handleAudioEnd);
    
    // Clean up function to stop audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleAudioEnd);
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Function to toggle play/pause
  const toggleAudio = () => {
    if (audioRef.current) {
      if (!isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fungsi untuk mengambil ID kota berdasarkan input user
  const fetchCityId = async () => {
    try {
      const res = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${city}`);
      const data = await res.json();
      if (data.data.length > 0) {
        return data.data[0].id; // Ambil ID kota pertama yang ditemukan
      }
      return null;
    } catch (error) {
      console.error("Gagal mengambil ID kota:", error);
      return null;
    }
  };

  // Fungsi untuk mengambil jadwal sholat berdasarkan ID kota dan tanggal
  const fetchPrayerTimes = async () => {
    if (!city || !date) return; // Pastikan input tidak kosong
    const cityId = await fetchCityId();
    if (!cityId) {
      alert("Kota tidak ditemukan!");
      return;
    }

    try {
      const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${date}`);
      const data = await res.json();
      setSchedule(data.data.jadwal);
    } catch (error) {
      console.error("Gagal mengambil jadwal sholat:", error);
    }
  };

  // Jalankan fetchPrayerTimes secara otomatis ketika city & date terisi
  useEffect(() => {
    if (city && date) {
      fetchPrayerTimes();
    }
  }, [city, date]);

  const doaList = [
    { 
      id: 1, 
      title: "Doa Sholat Idul Fitri", 
      arabic: "أُصَلِّي سُنَّةً لِعِيْدِ الْفِطْرِ رَكْعَتَيْنِ ( إِمَامًا - مَأْمُوْمًا ) لِلَّهِ تَعَالَ", 
      latin: "Usholli  sunnatan liidil fitri rok'ataini (imaman/makmuman) lillahi ta'ala.", 
      translation: "Aku berniat sholat sunnah idul fitri dua rakaat (menjadi makmum/imam) karena Allah taala."
    },
    { 
      id: 2, 
      title: "Niat Mandi Sunnah Idul Fitri", 
      arabic: "نَوَيْتُ غُسْلَ عِيْدِ الْفِطْرِ سُنَّةً لِلهِ تَعَالَ", 
      latin: "Nawaitul ghusla li 'idil fithri sunnatan lillahi ta'ala.", 
      translation: "Aku niat mandi Idul Fitri, sunnah karena Allah ta'ala." 
    }
  ];

  return (
    <>
    <main className='min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-950 text-white flex flex-col relative overflow-hidden'>
        <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(50)].map((_, i) => {
          const size = Math.random() * 3 + 1;
          const animClass = i % 3 === 0 ? 'star-slow' : i % 3 === 1 ? 'star-medium' : 'star-fast';
          return (
            <div 
              key={i}
              className={`star ${animClass}`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random(),
                boxShadow: `0 0 ${size}px ${size/2}px rgba(255, 205, 41, 0.8)`
              }}
            />
          );
        })}
      </div>
      {/* Music control button - simple play/pause */}
      <button 
        onClick={toggleAudio}
        className="fixed bottom-3 right-6 z-40 bg-emerald-800/80 hover:bg-emerald-700 p-3 rounded-full shadow-lg border border-emerald-700/50 backdrop-blur-sm transition-all hover:scale-110"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      <div className='container mx-auto px-4 py-8 flex-grow relative z-10'>
        {/* Header */}
        
        <div className="font-sans flex items-center justify-center mt-5">
            <div className="text-center mb-12 relative">
              <div className="absolute inset-0 -mx-8 -my-4">
                  <div className='absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent'>
                  </div>
              </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-amber-400 animate-float">عيد مبارك</h1>
                <p className="text-2xl md:text-3xl font-medium text-amber-300 mt-5">Eid Mubarak</p>
                <p className="text-lg mt-2 text-emerald-100">Selamat Merayakan Hari Raya Idul Fitri 1446 H</p>

                <div className="absolute inset-0 -mx-8 -my-4">
                  <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent'>
                  </div>
                  <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent'>
                  </div>
                </div>
            </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-12'>
          <div className="mt-10">
            <div className="bg-emerald-800/30 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-emerald-700/30 transition-transform duration-300 hover:scale-[1.02] h-120">
              {/* Icon dan Judul */}
              <div className="text-2xl font-semibold mb-4 text-amber-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#ffcd29" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m17.775 9.649l-1.926-1.926C14.034 5.908 13.126 5 11.998 5s-2.036.908-3.851 2.723L6.22 9.65c-1.815 1.815-2.723 2.723-2.723 3.851s.908 2.036 2.723 3.851l1.926 1.926C9.962 21.092 10.87 22 11.998 22s2.036-.908 3.851-2.723l1.926-1.926c1.815-1.815 2.723-2.723 2.723-3.851s-.908-2.036-2.723-3.851m-1.027-.899l-4.75 4.75m0 0l-4.75 4.75m4.75-4.75l-4.75-4.75m4.75 4.75l4.75 4.75M15 2c-2.4.24-3 2.3-3 3c-.167-.6-1-1.8-3-1.8" color="#ffcd29"/></svg>
                <h2 className="text-lg font-bold text-yellow-400 ml-2">Hitung Mundur</h2>
              </div>

              {/* Timer */}
              <div className="flex justify-center bg-emerald-700/70 rounded-3xl p-6 md:p-8 text-4xl font-bold tracking-widest shadow-lg border border-emerald-600/30 md:text-6xl text-white mb-2 text-center">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </div>

              {/* Ucapan */}
              <p className="text-center mt-4 text-emerald-100 text-lg">
                {/* Taqabbalallahu Minna Wa Minkum, */}
                {/* <br /> */}
                {/* <span> Selamat Hari Raya Idul Fitri</span> */}
                Minal Aidin Wal Faizin, Mohon Maaf Lahir dan Batin. 
                <span> Selamat Merayakan Hari Raya Idul Fitri 1446 H 🙏</span>
              </p>
            </div>
          </div>
          <div className='mt-10 bg-emerald-800/30 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-emerald-700/30 transition-transform duration-300 hover:scale-[1.02] h-120'>
            <h2 className='text-2xl font-semibold mb-4 text-amber-300 flex items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="none" stroke="#ffcd29" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 12a4 4 0 1 1-8 0a4 4 0 0 1 8 0m-4-9v2m0 14.004v2M5 12H3m18 0h-2m0-7l-2 2M5 5l2 2m0 10l-2 2m14 0l-2-2" />
              </svg> <span className='ml-2'>Jadwal Sholat</span>
            </h2>
            <div className='flex flex-col sm:flex-row gap-2 mb-4'>
              <flex className='flex-1'>
                <label htmlFor="city" className='block text-sm text-emerald-200 mb-1'>Kota</label>
                <input
                  // ref={inputRef}  
                  type="text"
                  className="w-full px-3 py-2 rounded bg-emerald-700/30 border border-emerald-600/30 text-white placeholder-emerald-300 focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="Masukkan Kota"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </flex>
              <flex className='flex-1'>
                <label htmlFor="date" for="date" className='block text-sm text-emerald-200 mb-1'>Tanggal</label>
                 <input
                  // ref={inputRef}
                  type="date"
                  className="w-full px-3 py-2 rounded bg-emerald-700/30 border border-emerald-600/30 text-white placeholder-emerald-300 focus:outline-none focus:border-amber-400 transition-colors"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </flex>
            </div>
            <div className="space-y-2">
              {/* Tampilkan Jadwal Sholat */}
                {schedule && (
                  <div className="mt-4 space-y-2">
                    {[
                      { name: "Imsak", time: schedule.imsak },
                      { name: "Subuh", time: schedule.subuh },
                      { name: "Dzuhur", time: schedule.dzuhur },
                      { name: "Ashar", time: schedule.ashar },
                      { name: "Maghrib", time: schedule.maghrib },
                      { name: "Isya", time: schedule.isya },
                    ].map((prayer, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded-xl bg-emerald-700/30 hover:bg-emerald-700/50 transition-colors">
                        <span className="text-sm sm:text-base text-white">{prayer.name}</span>
                        <span className="font-medium text-amber-200 text-sm sm:text-base">{prayer.time}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className='bg-emerald-800/30 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-emerald-700/30'>
            <h2 className='text-3xl font-semibold mb-4 text-amber-300 text-center'>Doa-doa Idul Fitri</h2>
            <div className="space-y-4">
                {doaList.map((doa, index) => (
                  <div key={doa.id} className="bg-emerald-800/30 backdrop-blur-sm rounded-2xl border border-emerald-700/30 overflow-hidden transition-all duration-300">
                    {/* Tombol */}
                    <button
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-emerald-700/30 transition-colors"
                      onClick={() => toggleDoa(index)}
                    >
                      <span className="text-amber-300 font-medium">{doa.title}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 16 7"
                        className={`transform transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                      >
                        <path
                          fill="#ffcd29"
                          d="M8 6.5a.47.47 0 0 1-.35-.15l-4.5-4.5c-.2-.2-.2-.51 0-.71s.51-.2.71 0l4.15 4.15l4.14-4.14c.2-.2.51-.2.71 0s.2.51 0 .71l-4.5 4.5c-.1.1-.23.15-.35.15Z"
                        />
                      </svg>
                    </button>

                    {/* Konten Doa (Tampil jika openIndex === index) */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="p-4 space-y-4">
                          <div className="space-y-2">
                            {/* Arab */}
                            <div
                              className="text-right text-xl md:text-2xl leading-relaxed text-amber-200"
                              style={{ fontFamily: '"Traditional Arabic", Arial' }}
                            >
                              {doa.arabic}
                            </div>
                            
                            {/* Latin */}
                            <div className="text-emerald-100 italic">
                              {doa.latin}
                            </div>

                            {/* Terjemahan */}
                            <div className="text-emerald-200 border-t border-emerald-700/30 pt-2 mt-2">
                              <span className="font-medium text-amber-300 mr-2">Artinya:</span>
                              {doa.translation}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </div>
      <footer className='mt-auto py-6 px-4 border-t border-emerald-800/30 relative z-10 bg-emerald-900/30 backdrop-blur-sm'>
        <div className='container mx-auto text-center'>
          <p className='text-emerald-200 text-sm md:text-base'> This theme design is inspired by the work of <span className='text-amber-300 font-medium'>Mutia Pegi Intanswari </span> The website was developed by <span className='text-amber-300 font-medium'>Ilham Adi Purnomo</span></p>
        </div>
      </footer>
    </main>
    </>
  )
}

export default Home