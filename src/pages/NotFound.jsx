import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <SEO 
        title="404 - Page Not Found"
        description="The page you are looking for does not exist."
        noindex={true}
      />
      <Navbar />
      <div className="pt-32 pb-24 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg w-full text-center"
        >
          <h1 className="text-[120px] md:text-[180px] font-black text-[var(--primary)] leading-none opacity-10 select-none">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[var(--primary)] -mt-10 mb-4">
            Page Not Found
          </h2>
          <p className="text-[var(--text-muted)] mb-10 leading-relaxed text-sm md:text-base">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back to our handcrafted collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-10 py-4 bg-[var(--primary)] text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-lg"
            >
              Back to Home
            </Link>
            <Link
              to="/shop"
              className="px-10 py-4 border-2 border-[var(--primary)] text-[var(--primary)] rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-[var(--primary)] hover:text-white transition-all"
            >
              Browse Shop
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
