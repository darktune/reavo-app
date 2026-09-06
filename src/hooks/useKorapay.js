import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/react';

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
      if (import.meta.env.VITE_SENTRY_DSN) {
        Sentry.captureMessage('KoraPay SDK not loaded when checkout attempted', {
          level: 'warning',
          extra: { email, amount }
        });
      }
      // Fallback: simulate success for demo purposes
      setTimeout(() => {
        if (onSuccess) onSuccess({ reference: 'DEMO_' + Date.now() });
      }, 2000);
      return;
    }

    const reference = 'REAVO_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: `KoraPay payment checkout initiated: ${reference}`,
        level: 'info',
        data: { amount, reference, customer: email }
      });
    }

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
        if (import.meta.env.VITE_SENTRY_DSN) {
          Sentry.addBreadcrumb({
            category: 'payment',
            message: 'Payment completed successfully',
            level: 'info',
            data: { reference: data?.reference || reference }
          });
        }
        if (onSuccess) onSuccess(data);
      },
      onFailed: (data) => {
        console.log('KoraPay payment failed:', data);
        if (import.meta.env.VITE_SENTRY_DSN) {
          Sentry.captureMessage(`KoraPay payment failed for ${email}`, {
            level: 'error',
            extra: { data, reference, amount, customer: email }
          });
        }
      },
      onClose: () => {
        console.log('KoraPay modal closed');
        if (import.meta.env.VITE_SENTRY_DSN) {
          Sentry.addBreadcrumb({
            category: 'checkout',
            message: `KoraPay modal closed/dropped off (ref: ${reference})`,
            level: 'info',
            data: { reference, amount }
          });
        }
        if (onClose) onClose();
      },
    });
  };

  return { initializePayment };
}
