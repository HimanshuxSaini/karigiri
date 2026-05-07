import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/917027311213"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[4.5rem] md:bottom-8 left-4 md:left-8 z-[90] bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
    >
      <MessageCircle size={20} className="md:w-6 md:h-6" fill="currentColor" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 whitespace-nowrap text-xs md:text-sm font-bold">
        Chat with Us
      </span>
    </a>
  );
};

export default WhatsAppButton;
