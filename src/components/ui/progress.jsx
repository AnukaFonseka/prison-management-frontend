// // src/components/ui/progress.jsx
// 'use client';

// import * as React from 'react';
// import * as ProgressPrimitive from '@radix-ui/react-progress';

// import { cn } from '@/lib/utils';

// const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
//   <ProgressPrimitive.Root
//     ref={ref}
//     className={cn(
//       'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
//       className
//     )}
//     {...props}
//   >
//     <ProgressPrimitive.Indicator
//       className="h-full w-full flex-1 bg-primary transition-all"
//       style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
//     />
//   </ProgressPrimitive.Root>
// ));
// Progress.displayName = ProgressPrimitive.Root.displayName;

// export { Progress };


// src/components/ui/progress.jsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={value}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));
Progress.displayName = 'Progress';

export { Progress };