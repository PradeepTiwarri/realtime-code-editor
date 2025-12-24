'use client';

import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
};

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        'px-4 py-2 rounded-md text-white font-medium transition',
        variant === 'default' && 'bg-blue-600 hover:bg-blue-700',
        variant === 'outline' && 'border border-blue-600 text-blue-600 hover:bg-blue-100',
        variant === 'ghost' && 'text-blue-600 hover:underline',
        className
      )}
    />
  );
}
