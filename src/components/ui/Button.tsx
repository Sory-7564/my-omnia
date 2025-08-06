'use client'

import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      className={clsx(
        'w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700',
        className
      )}
    />
  )
}
