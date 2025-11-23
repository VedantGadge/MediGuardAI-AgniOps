import React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Input } from "./input"
import { cn } from "../../lib/utils"

const NumberInput = React.forwardRef(({ className, value, onChange, step = 1, ...props }, ref) => {
    const handleIncrement = (e) => {
        e.preventDefault();
        const currentValue = parseFloat(value) || 0;
        const newValue = (currentValue + Number(step)).toString();

        // Create a synthetic event to match standard input behavior
        const syntheticEvent = {
            target: {
                value: newValue,
                name: props.name
            }
        };
        onChange(syntheticEvent);
    };

    const handleDecrement = (e) => {
        e.preventDefault();
        const currentValue = parseFloat(value) || 0;
        const newValue = (currentValue - Number(step)).toString();

        // Create a synthetic event to match standard input behavior
        const syntheticEvent = {
            target: {
                value: newValue,
                name: props.name
            }
        };
        onChange(syntheticEvent);
    };

    return (
        <div className="relative">
            <Input
                type="number"
                value={value}
                onChange={onChange}
                step={step}
                className={cn("pr-12 bg-white text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none", className)}
                ref={ref}
                {...props}
            />
            <div className="absolute right-1 top-1 bottom-1 w-6 flex flex-col gap-[1px]">
                <button
                    type="button"
                    onClick={handleIncrement}
                    className="flex-1 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 rounded-t-sm transition-colors"
                    tabIndex={-1}
                >
                    <ChevronUp className="h-3 w-3" />
                </button>
                <button
                    type="button"
                    onClick={handleDecrement}
                    className="flex-1 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 rounded-b-sm transition-colors"
                    tabIndex={-1}
                >
                    <ChevronDown className="h-3 w-3" />
                </button>
            </div>
        </div>
    )
})
NumberInput.displayName = "NumberInput"

export { NumberInput }
