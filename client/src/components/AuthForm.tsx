'use client'

import React,{useState} from 'react';
import { useRouter } from 'next/navigation';


interface AuthFormProps{
    type: 'login'|'signup'
    onSubmit:(data:{fullName?:string ; email:string; password:string})=>void | Promise<void>
}
export default function AuthForm({type,onSubmit}:AuthFormProps){
const [fullName,setFullName]=useState("")
const [email,setEmail]= useState('')
const [password,setPassword]=useState('')
const [showPassword,setShowPassword]=useState(false)

const handleSubmit=(e:React.FormEvent)=>{
    e.preventDefault();
    const data = type==="signup"?{fullName,email,password}:{email,password} ;
    onSubmit(data)
}

return (
    <form onSubmit={handleSubmit} className='w-full max-w-sm p-6 bg-white shadow-md rounded-xl space-y-4'>

        {type === 'signup' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
          name='fullName'
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-gray-800 focus:ring-blue-500"
             value={fullName}
            onChange={(e) => setFullName(e.target.value)}
           
            
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="mt-1 block w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

<div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="mt-1  text-gray-800 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-3 text-sm text-blue-500"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
      >
        {type === 'signup' ? 'Sign Up' : 'Log In'}
      </button>

    </form>
)



}