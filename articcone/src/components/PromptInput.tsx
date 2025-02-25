import React  ,{ useImperativeHandle, useState } from 'react'
import { Input } from './ui/input';

const PromptInput = React.forwardRef((props , ref: React.Ref<unknown>) => {
    const [userPrompt, setUserPrompt] = useState("");
    const [disabled, setDisabled] = React.useState(false);
    useImperativeHandle(ref, () => ({
      setDisabled: (value: boolean) => setDisabled(value),
      getPrompt: () => getPrompt()
    }));
    const getPrompt = () => {
      if (!userPrompt || userPrompt == ""){ 
          return "The Prompt was empty";
      }else{
          return userPrompt;}
    }
  return (
    <Input disabled={disabled} type="text" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} className="flex w-3/4 mx-auto mb-auto mt-2 bg-white border-2 border-black" placeholder="Enter prompt here"></Input>
  )
});
export default PromptInput