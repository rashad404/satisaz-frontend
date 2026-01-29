'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function WalletCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(searchParams.get('error_description') || 'Authentication failed');
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        return;
      }

      // Verify state (using localStorage since popup is a separate window)
      const savedState = localStorage.getItem('wallet_oauth_state');
      if (state !== savedState) {
        setStatus('error');
        setMessage('Invalid state parameter');
        return;
      }

      try {
        const codeVerifier = localStorage.getItem('wallet_code_verifier');

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8013/api';

        // Exchange code for token via our backend
        const response = await fetch(`${API_URL}/auth/wallet/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            redirect_uri: `${window.location.origin}/auth/wallet/callback`,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.status === 'error') {
          throw new Error(data.message || 'Authentication failed');
        }

        // Clean up localStorage
        localStorage.removeItem('wallet_oauth_state');
        localStorage.removeItem('wallet_code_verifier');

        // Store the token
        if (data.data?.token) {
          localStorage.setItem('token', data.data.token);
          setStatus('success');
          setMessage('Login successful');

          // If opened in popup, send message to opener and close
          if (window.opener) {
            window.opener.postMessage({ type: 'oauth_success' }, '*');
            setTimeout(() => window.close(), 1000);
          } else {
            // Redirect to dashboard after short delay
            setTimeout(() => {
              router.push('/az/workspaces');
            }, 1500);
          }
        } else {
          throw new Error('No token received');
        }
      } catch (err: any) {
        console.error('Wallet OAuth error:', err);
        setStatus('error');
        const errorMessage = err.message || 'Authentication failed';
        setMessage(errorMessage);

        // If opened in popup, send error message to opener
        if (window.opener) {
          window.opener.postMessage({ type: 'oauth_error', message: errorMessage }, '*');
        }
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-xl">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-indigo-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Login Successful
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <button
              onClick={() => window.close()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
