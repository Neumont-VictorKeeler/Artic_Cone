
import React, { use } from 'react'

export default function Lockscreen({ isEnabled }: { isEnabled: boolean }) {
     
    return (
        <div className={`absolute  w-1/4 h-3/4 bg-black  ${isEnabled ? '' : 'hidden'} justify-center  text-center` }>🔒</div>
      );
    
}
