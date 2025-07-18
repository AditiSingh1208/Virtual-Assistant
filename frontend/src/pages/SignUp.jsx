import React from 'react'
import bg from '../assets/authBg.png';
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userDataContext } from '../context/UserContext';
import { useContext } from 'react';


function SignUp() {
const [showPassword, setShowPassword]=React.useState(false)
const {serverUrl,userData, setUserData} =useContext(userDataContext)
const navigate = useNavigate()
const [name, setName] = React.useState("")
const [email, setEmail] = React.useState("")
const [loading, setLoading] = React.useState(false)
const [password, setPassword] = React.useState("")

const [err,setErr] = React.useState("")

const handleSignUp = async (e) => {
  e.preventDefault()
  setErr("")
  setLoading(true)
  try {
    let result = await axios.post(`${serverUrl}/api/auth/signup`, {name, email, password} , {withCredentials: true})
    setUserData(result.data)
    setLoading(false)
    navigate("/customize")
  } catch (error) {
    console.log(error)
    setUserData(null)
    setLoading(false)
    setErr(error.response.data.message)
  }
}

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' 
    style ={{backgroundImage: `url(${bg})`}}>
      <form className='w-[90%] h-[600px] max-w-[500px] bg-[#00000069] backdrop-blur
      shadow-lg shadow-black flex flex-col justify-center items-center gap-[20px] px-[20px]' onSubmit={handleSignUp}>
        <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Register to <span className='text-blue-400'>Virtual Assistant</span></h1>

        <input type="text" placeholder='Enter your Name' className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px] 'required onChange={(e)=> setName(e.target.value)} value={name}/>

        <input type="email" placeholder='Email' className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]' required onChange={(e)=> setEmail(e.target.value)} value={email}/>

        <div className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white px-[20px] py-[10px] rounded-full text-[18px] relative'>
          <input type={showPassword?"text":"Password"} placeholder='Password' className='w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[20px] py-[10px]' required onChange={(e)=> setPassword(e.target.value)} value={password}/>
          {!showPassword && <IoEye className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-white ' onClick={()=>setShowPassword(true)}/>}

            {showPassword && <IoEyeOff  className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-white ' onClick={()=>setShowPassword(false)}/>}
        </div>

        {err.length>0 && <p className='text-red-500 text-[16px] font-semibold'>*{err}</p>}

        <button className='min-w-[150px] h-[60px] mt-[30px] text-black bg-white rounded-full font-semibold text-[19px]' disabled={loading}>{loading?"Loading...": "Sign Up"}</button>

        <p className='text-white text-[18px] cursor-pointer' onClick={()=>navigate("/signin")}>Already have an account ?<span className='text-blue-400'> Sign In</span> </p>

      </form>

    </div>
  )
}

export default SignUp