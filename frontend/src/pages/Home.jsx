import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import userImg from "../assets/user.gif"
import { TbMenuDeep } from "react-icons/tb"
import { TbCut } from "react-icons/tb";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const[userText,setUserText]=useState("")
  const[aiText,setAiText]=useState("")
  const [ham,setHam]= useState(false)

  const [voiceReady, setVoiceReady] = useState(false)
  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const isRecognitionInitialized = useRef(false) // ✅ This prevents double setup

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      navigate("/sigin")
      setUserData(null)
    } catch (error) {
      console.log(error)
    }
  }

  const activateVoice = () => {
    const utterance = new SpeechSynthesisUtterance("Voice activated")
    utterance.onend = () => setVoiceReady(true)
    window.speechSynthesis.speak(utterance)
  }

  const speak = (text) => {
    if (!text) return
    console.log("Speaking:", text)
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    utterance.lang = 'en-US'
    utterance.pitch = 1
    utterance.rate = 1
    utterance.volume = 1

    utterance.onstart = () => console.log("🔊 Speech started")
    utterance.onend = () => {
      console.log("✅ Speech finished")
      setAiText("")
    }
    utterance.onerror = (e) => console.error("❌ Speech error:", e)

    window.speechSynthesis.speak(utterance)
  }

const handleCommand = (data) => {
  const { type, userInput, response } = data;
  speak(response);

  const lowerInput = userInput.toLowerCase();
  const cleanedQuery = encodeURIComponent(
    userInput.replace(/(open|search|play|youtube|on|in)/gi, '').trim()
  );

  // ✅ Always search on YouTube if "youtube" is mentioned
  if (lowerInput.includes('youtube')) {
    window.open(`https://www.youtube.com/results?search_query=${cleanedQuery}`, '_blank');
    return;
  }

  if (type === 'google-search') {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank');
  }

  if (type === 'calculator-open') {
    window.open(`https://www.google.com/search?q=calculator`, '_blank');
  }

  if (type === 'instagram-open') {
    window.open(`https://www.instagram.com/`, '_blank');
  }

  if (type === 'facebook-open') {
    window.open(`https://www.facebook.com/`, '_blank');
  }

  if (type === 'linkedin-open') {
    window.open(`https://www.linkedin.com/`, '_blank');
  }

  if (type === 'weather-show') {
    window.open(`https://www.google.com/search?q=weather`, '_blank');
  }

  if (type === 'news') {
    window.open(`https://www.google.com/news`, '_blank');
  }

  if (type === 'github-open') {
    window.open(`https://www.github.com/`, '_blank');
  }
};



  useEffect(() => {
    if (!voiceReady || isRecognitionInitialized.current) return

    isRecognitionInitialized.current = true // ✅ Mark setup done

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      isRecognizingRef.current = true
      console.log("🎙️ Recognition started")
    }

    recognition.onend = () => {
      isRecognizingRef.current = false
      console.log("Recognition ended, restarting...")
      setTimeout(() => {
        if (!isRecognizingRef.current) {
          try {
            recognition.start()
            isRecognizingRef.current = true
          } catch (err) {
            console.error("❌ Restart error:", err.message)
          }
        }
      }, 1000)
    }

    recognition.onerror = (e) => {
      isRecognizingRef.current = false
      console.error("Recognition error:", e.error)
      setTimeout(() => {
        if (!isRecognizingRef.current) {
          try {
            recognition.start()
            isRecognizingRef.current = true
          } catch (err) {
            console.error("❌ Restart error:", err.message)
          }
        }
      }, 1000)
    }

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      console.log("Heard:", transcript)

      if (!userData?.assistantName) return

      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setAiText("")
        setUserText(transcript)
        const data = await getGeminiResponse(transcript)
        console.log(data)
        // speak(data.response)
        handleCommand(data)
        setAiText(data.response)
        setUserText("")
      }
    }

    try {
      recognition.start()
      isRecognizingRef.current = true
    } catch (err) {
      console.error("Start error:", err.message)
    }

    return () => {
      recognition.stop()
      isRecognizingRef.current = false
      isRecognitionInitialized.current = false // Optional: allow restart later
    }
  }, [userData, voiceReady])

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col relative gap-[20px] overflow-hidden'>

      <TbMenuDeep
  className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]'
  onClick={() => setHam(true)}
/>

<div
  className={`absolute top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col items-start gap-[10px] transition-transform duration-300 ${
    ham ? "translate-x-0" : "translate-x-full"
  }`}
>
  <TbCut
    className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]'
    onClick={() => setHam(false)}
  />

  <button
    className='min-w-[150px] h-[60px] mt-[30px] text-black bg-white rounded-full font-semibold text-[19px] cursor-pointer'
    onClick={handleLogOut}
  >
    Log Out
  </button>

  <button
    className='min-w-[150px] h-[60px] mt-[30px] text-black bg-white rounded-full font-semibold text-[19px] px-[20px] py-[10px] cursor-pointer'
    onClick={() => navigate("/customize")}
  >
    Customize your Assistant
  </button>

  <div className='w-full h-[3px] bg-gray-400'></div>

  <h1 className='text-white font-semibold text-[19px]'>History</h1>

  <div className='w-full h-[400px] gap-[20px] flex flex-col overflow-y-auto'>
    {userData.history?.map((his, idx) => (
      <span key={idx} className='text-gray-200 text-[18px] truncate'>
        {his}
      </span>
    ))}
  </div>
</div>


      {!voiceReady && (
  <button
    onClick={activateVoice}
    className="fixed top-5 left-5 sm:top-6 sm:left-6 px-4 sm:px-6 py-2 sm:py-3 bg-[#02023d] text-white rounded-xl shadow-lg z-[1000] max-w-[90%] text-sm sm:text-base"
  >
    🎤 
  </button>
)}


      <button
        className='min-w-[150px] h-[60px] mt-[30px] text-black bg-white rounded-full font-semibold absolute hidden lg:block top-[20px] right-[20px] text-[19px] cursor-pointer '
        onClick={handleLogOut}
      >
        Log Out
      </button>

      <button
        className='min-w-[150px] h-[60px] mt-[30px] text-black bg-white rounded-full font-semibold absolute hidden lg:block top-[100px] right-[20px] text-[19px] px-[20px] py-[10px] cursor-pointer'
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>

      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt='' className='h-full object-cover' />
      </div>

      <h1 className='text-white'>I'm {userData?.assistantName}</h1>

      {!aiText && <img src={userImg} alt="" className='w-[200px]'/>}

      {aiText && <img src={aiImg} alt="" className='w-[200px]'/>}

      <h1 className='text-white text-wrap text-[18px] font-semibold '>{userText?userText : aiText?aiText : null}</h1>
      
    </div>
  )
}

export default Home
