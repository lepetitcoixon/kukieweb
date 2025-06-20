
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 ease-in-out';
  
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-kukie-yellow text-kukie-brown hover:bg-yellow-500 focus:ring-yellow-400';
      break;
    case 'secondary':
      variantStyles = 'bg-kukie-light-brown text-kukie-beige hover:bg-opacity-80 focus:ring-kukie-light-brown';
      break;
    case 'outline':
      variantStyles = 'border border-kukie-yellow text-kukie-yellow hover:bg-kukie-yellow hover:text-kukie-brown focus:ring-kukie-yellow';
      break;
    case 'ghost':
      variantStyles = 'text-kukie-brown hover:bg-kukie-dark-beige focus:ring-kukie-brown';
      break;
  }

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-sm';
      break;
    case 'md':
      sizeStyles = 'px-4 py-2 text-base';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-3 text-lg';
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
