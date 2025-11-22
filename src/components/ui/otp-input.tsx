import * as React from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  ({ value, onChange, length = 6, disabled = false }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, digit: string) => {
      if (digit.length > 1) {
        digit = digit[digit.length - 1];
      }

      if (!/^\d*$/.test(digit)) {
        return;
      }

      const newValue = value.split('');
      newValue[index] = digit;
      onChange(newValue.join(''));

      // Move to next input if digit is entered
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
      if (/^\d+$/.test(pastedData)) {
        onChange(pastedData);
        // Focus the last filled input
        const nextIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
      }
    };

    return (
      <div ref={ref} className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              'w-12 h-12 text-center text-lg font-semibold',
              'border border-input rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all'
            )}
          />
        ))}
      </div>
    );
  }
);

OtpInput.displayName = 'OtpInput';

export { OtpInput };
