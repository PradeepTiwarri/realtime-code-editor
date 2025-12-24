'use client'

import { useState } from "react";

interface JoinRoomModalProps{
    onClose:()=>void;
    onJoin:(roomId:string)=>void

}


export default function JoinRoomModal({onClose,onJoin}:JoinRoomModalProps){

    const [roomId,setRoomId]=useState('')

    const handleSubmit=(e:React.FormEvent)=>{
        e.preventDefault()
        if (roomId.trim()){
            onJoin(roomId);
            onClose();
        }
    }


return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

        <div className="bg-white rounded-xl p-6 shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Join a Room</h2>
            <form onSubmit={handleSubmit}>
            <input type="text"placeholder="Enter Room Id" value={roomId} onChange={(e)=>setRoomId(e.target.value)} className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button type="button"onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              Join
            </button>
          </div>

            </form>
        
        
        
        
        </div></div>
)


}