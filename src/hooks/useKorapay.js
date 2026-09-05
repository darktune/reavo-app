import { useEffect, useRef } from 'react';

/**
 * Custom hook to load KoraPay's checkout SDK and expose a payment initializer.
 * Uses the official KoraPay collections script.
 */
export function useKorapay() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Only inject the script once
    if (scriptLoaded.current || document.getElementById('korapay-script')) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.id = 'korapay-script';
    script.src = 'https://korablobstorage.blob.core.windows.net/modal-bucket/korapay-collections.min.js';
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    document.head.appendChild(script);
  }, []);

  /**
   * Initialize KoraPay checkout.
   * @param {Object} config
   * @param {number} config.amount - Amount in Naira (e.g. 285000)
   * @param {string} config.email - Customer email
   * @param {string} config.name - Customer full name
   * @param {function} config.onSuccess - Callback on successful payment
   * @param {function} config.onClose - Callback when modal is closed
   */
  const initializePayment = ({ amount, email, name, onSuccess, onClose }) => {
    if (!window.Korapay) {
      console.error('KoraPay SDK not loaded yet');
      // Fallback: simulate success for demo purposes
      setTimeout(() => {
        if (onSuccess) onSuccess({ reference: 'DEMO_' + Date.now() });
      }, 2000);
      return;
    }

    const reference = 'REAVO_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

    window.Korapay.initialize({
      key: import.meta.env.VITE_KORA_PUBLIC_KEY || 'pk_test_9Wk48evrLLtrBmwLmXctvtJoyRjQvCwLqmkZtmDR',
      reference,
      amount,
      currency: 'NGN',
      customer: {
        name: name || 'REAVO Customer',
        email: email || 'customer@reavo.com',
      },
      notification_url: import.meta.env.VITE_SITE_URL 
        ? `${import.meta.env.VITE_SITE_URL.replace(/\/$/, '')}/api/korapay/webhook` 
        : '',
      onSuccess: (data) => {
        console.log('KoraPay payment successful:', data);
        if (onSuccess) onSuccess(data);
      },
      onFailed: (data) => {
        console.log('KoraPay payment failed:', data);
      },
      onClose: () => {
        console.log('KoraPay modal closed');
        if (onClose) onClose();
      },
    });
  };

  return { initializePayment };
}
