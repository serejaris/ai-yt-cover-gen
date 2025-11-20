import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-red-500 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0";
  
  const variants = {
    primary: "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-900/20 hover:from-red-600 hover:to-red-600 disabled:from-zinc-700 disabled:to-zinc-700 disabled:shadow-none disabled:text-zinc-400 disabled:transform-none",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:border-zinc-700 disabled:transform-none",
    outline: "bg-transparent border-2 border-zinc-700 hover:border-zinc-500 text-zinc-300 disabled:border-zinc-800 disabled:text-zinc-600 disabled:transform-none"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      ) : children}
    </button>
  );
};

export default Button;