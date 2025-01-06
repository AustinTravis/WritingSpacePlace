import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      <span className="ml-2 text-xl text-gray-600">Loading...</span>
    </div>
  );
}