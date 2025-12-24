'use client'
import { useRouter } from "next/navigation"

 export default function Navbar(){
     const router=useRouter()

    return(
        <nav className="w-full flex items-center jusutify-between px-6 py-4 shadow-md bg-white">
          {/*left logo*/}
        <div className="text-2xl font-bold text-blue-600 cursor-pointer" >
        CodeSync

      </div>

      

      {/*user profile and log out*/}
        
    

     </nav>
  )
}