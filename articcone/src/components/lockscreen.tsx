
import React, { use } from 'react'

export default function Lockscreen({ isEnabled}: { isEnabled: boolean }) { 
     
    return (
        <div className={`absolute top-0 left-0 w-full h-full rounded-md bg-black bg-opacity-50 flex items-center justify-center ${
                            isEnabled ? "block" : "hidden"} justify-center text-9xl  text-center` }
                            >🔒</div>
      );
    
}
