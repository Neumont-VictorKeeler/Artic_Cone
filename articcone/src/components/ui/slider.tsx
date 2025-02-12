import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as styles from './slider.module.css';
import "./slider.module.css";
import { cn } from '../../lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center cursor-pointer group bg-Orange',
      className,
      styles.default['SliderRoot']
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        'relative h-1.5 w-full grow overflow-hidden rounded-full bg-orange',
        styles.default['SliderTrack']
      )}
    >
      <SliderPrimitive.Range
        className={cn(
          'absolute h-full bg-[hsl(var(--supplementary))]',
          styles.default['SliderRange']
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className='SliderThumb block size-4 scale-20 rounded-full bg-white hover:bg-orange-500' />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider }