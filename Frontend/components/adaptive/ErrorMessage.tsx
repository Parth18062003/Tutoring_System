// src/components/adaptive/ErrorMessage.tsx
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorMessageProps {
  message: string | null;
  title?: string;
}

export function ErrorMessage({ message, title = 'Error' }: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}