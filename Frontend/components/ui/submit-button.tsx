import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';

// Define the props interface for the SubmitButton component
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting: boolean;
  text: string;
  children: React.ReactNode;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting, text, children, ...props }) => {
  return (
    <Button
      type="submit"
      className="w-full py-2 px-4 font-bold rounded-md transition duration-300"
      disabled={isSubmitting}
      {...props} // Spread the rest of the props onto the button
    >
      {isSubmitting ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{text}</span>
        </motion.div>
      ) : (
        children
      )}
    </Button>
  );
};

export default SubmitButton;
