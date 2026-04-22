import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqData = [
  {
    question: "What makes Karigiri's wool unique?",
    answer: "We source premium wool and handle all our artisanal knitting and design work right here in Sonipat, Haryana. Our Merino and Pashmina are hand-sorted to ensure only the longest and softest fibers are used, resulting in superior warmth and a signature silky feel that machine-made alternatives cannot replicate."
  },
  {
    question: "How do you support local artisans?",
    answer: "Karigiri works directly with master weavers and knitters based in Sonipat. We eliminate middlemen to ensure that the majority of the product value goes directly to the artisans, helping preserve ancestral techniques while providing sustainable livelihoods in our local community."
  },
  {
    question: "Can I request a custom design?",
    answer: "Yes! Our 'Customised Orders' service allows you to be the designer. You can share your desired pattern, size, and color preferences via WhatsApp, and our master knitters will create a bespoke piece tailored exclusively for you."
  },
  {
    question: "Is Karigiri a sustainable brand?",
    answer: "Sustainability is at our core. We use 100% biodegradable natural fibers, low-impact traditional dyes, and follow a zero-waste production model. By focusing on quality over quantity, we promote 'Slow Fashion' that lasts for generations."
  },
  {
    question: "What is your return policy for handmade items?",
    answer: "We offer a 14-day 'No Questions Asked' return policy. If you're not completely in love with the craftsmanship or fit, we'll arrange a free reverse pickup and provide a full refund or exchange."
  }
];

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-100 last:border-none">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={`text-sm md:text-lg font-bold transition-colors ${isOpen ? 'text-[var(--primary)]' : 'text-slate-700 group-hover:text-[var(--primary)]'}`}>
          {question}
        </span>
        <div className={`flex-shrink-0 ml-4 p-1 rounded-full transition-all ${isOpen ? 'bg-[var(--primary)] text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-xs md:text-base text-slate-500 leading-relaxed max-w-3xl italic">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-20 md:py-32 px-4 md:px-12 bg-[#FAF9F6]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--primary)] font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-4 block"
          >
            Transparency & Trust
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-[var(--primary)] mb-6"
          >
            Why Choose Karigiri?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto italic"
          >
            Everything you need to know about our commitment to artisanal excellence and ethical craftsmanship.
          </motion.p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white">
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
           <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest mb-6">Still have questions?</p>
           <a 
             href="https://wa.me/917404142034" 
             target="_blank" 
             rel="noopener noreferrer"
             className="inline-flex items-center space-x-3 bg-white border-2 border-slate-900 px-8 py-4 rounded-full font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-1"
           >
             Chat With an Expert
           </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
