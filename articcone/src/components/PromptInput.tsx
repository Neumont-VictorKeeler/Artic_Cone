import React, { useImperativeHandle, useState } from 'react';
import { Input } from './ui/input';

interface PromptInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PromptInput = React.forwardRef((props: PromptInputProps, ref: React.Ref<unknown>) => {
    const { value, onChange } = props;
    const [disabled, setDisabled] = useState(false);

    const getPrompt = () => {
        if (!value || value === ""){
            return "The Prompt was empty";
        } else {
            return value;
        }
    };

    useImperativeHandle(ref, () => ({
        setDisabled: (value: boolean) => setDisabled(value),
        getPrompt: () => getPrompt()
    }));

    return (
        <Input
            disabled={disabled}
            type="text"
            value={value}
            onChange={onChange}
            className="flex w-3/4 mx-auto mb-2 mt-2 bg-white border-2 border-black text-amber-900"
            placeholder="Enter prompt here"
        />
    );
});


PromptInput.displayName = "PromptInput";

export default PromptInput;