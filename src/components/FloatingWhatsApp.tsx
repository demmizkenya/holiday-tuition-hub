import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  whatsappNumber?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  whatsappNumber = '0708083643'
}) => {
  // International Kenyan format: 254708083643
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const internationalNumber = cleanNumber.startsWith('0')
    ? '254' + cleanNumber.substring(1)
    : cleanNumber.startsWith('254')
    ? cleanNumber
    : '254' + cleanNumber;

  const prefilledMessage = encodeURIComponent('Hello, I would like to inquire about Holiday Tuition Hub.');
  const whatsappUrl = `https://wa.me/${internationalNumber}?text=${prefilledMessage}`;

  return (
    <aside
      aria-label="Direct WhatsApp tutor assistance"
      className="fixed bottom-5 right-5 z-40 flex items-center print:hidden"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with tutor Daniel Owino on WhatsApp (0708083643)"
        className="group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <MessageCircle className="w-5 h-5 text-white fill-current shrink-0" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-wide hidden sm:inline">WhatsApp Daniel Owino</span>
        <span className="text-xs bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-full font-mono hidden md:inline">0708083643</span>
      </a>
    </aside>
  );
};
