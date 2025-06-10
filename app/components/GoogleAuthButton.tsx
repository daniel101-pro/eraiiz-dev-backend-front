import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface GoogleAuthButtonProps {
  text: string;
  onSuccess?: () => void;
}

export default function GoogleAuthButton({ text, onSuccess }: GoogleAuthButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Check if Google Client ID is configured
  const isGoogleConfigured = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      try {
        setIsLoading(true);
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
          { code: codeResponse.code }
        );

        // Store user data and tokens
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('role', data.user.role);

        toast.success('Successfully signed in with Google!');
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Redirect to appropriate dashboard
        router.push(`/dashboard/${data.user.role}`);
      } catch (error: any) {
        console.error('Google auth error:', error);
        toast.error(error.response?.data?.message || 'Failed to sign in with Google. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google login error:', errorResponse);
      toast.error('Google sign in failed. Please try again.');
      setIsLoading(false);
    },
  });

  const handleClick = () => {
    if (!isGoogleConfigured) {
      toast.error('Google authentication is not configured. Please try another method.');
      return;
    }
    handleGoogleLogin();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-lg mb-4 flex items-center justify-center transition duration-200 ${
        isGoogleConfigured ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
      }`}
      disabled={!isGoogleConfigured || isLoading}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin mr-2"></div>
          Signing in...
        </div>
      ) : (
        <>
          <FcGoogle className="mr-2 text-xl" /> {text}
          {!isGoogleConfigured && <span className="ml-2 text-xs text-red-500">(Not configured)</span>}
        </>
      )}
    </button>
  );
} 