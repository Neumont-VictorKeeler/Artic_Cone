import { set } from 'firebase/database';
import React, { use } from 'react'

export default function Lockscreen({ isEnabled }: { isEnabled: boolean }) {
     
    return (
        <div className={` Absolute bg-black opacity-50 ${isEnabled ? '' : 'hidden'} text-center` }>🔒</div>
      );
    
}
