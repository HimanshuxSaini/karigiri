import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Facebook, Instagram, Twitter, Youtube, Smartphone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-12 md:py-20 px-4 md:px-12 bg-white text-slate-900 border-t border-gray-100 mt-20">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-12 mb-16">
          <div className="text-center sm:text-left">
            <h4 className="font-black uppercase text-xs tracking-widest mb-6 text-slate-900">Online Shopping</h4>
            <ul className="space-y-3 text-[13px] font-bold text-slate-500">
              <li><Link to="/shop" className="hover:text-black hover:underline underline-offset-4">All Collections</Link></li>
              <li><Link to="/shop?category=Women" className="hover:text-black hover:underline underline-offset-4">Women</Link></li>
              <li><Link to="/shop?category=Kids" className="hover:text-black hover:underline underline-offset-4">Kids</Link></li>
              <li><Link to="/shop?category=Men" className="hover:text-black hover:underline underline-offset-4">Men</Link></li>
              <li><Link to="/shop?category=Bouquet" className="hover:text-black hover:underline underline-offset-4">Bouquet</Link></li>
              <li><Link to="/shop?category=Laddu Gopal" className="hover:text-black hover:underline underline-offset-4">Laddu Gopal</Link></li>
              <li><Link to="/shop?category=Yarn" className="hover:text-black hover:underline underline-offset-4">Yarn</Link></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-black uppercase text-xs tracking-widest mb-6 text-slate-900">Useful Links</h4>
            <ul className="space-y-3 text-[13px] font-bold text-slate-500">
              <li><a href="#" className="hover:text-black hover:underline underline-offset-4">Contact Us</a></li>
              <li><a href="#" className="hover:text-black hover:underline underline-offset-4">FAQ</a></li>
              <li><a href="#" className="hover:text-black hover:underline underline-offset-4">T&C</a></li>
              <li><a href="#" className="hover:text-black hover:underline underline-offset-4">Terms Of Use</a></li>
              <li><a href="#" className="hover:text-black hover:underline underline-offset-4">Track Orders</a></li>
              <li><a href="#" className="hover:text-black hover:underline underline-offset-4">Shipping</a></li>
              <li><a href="#" className="hover:text-black hover:underline underline-offset-4">Cancellation</a></li>
              <li><a href="#" className="hover:text-black hover:underline underline-offset-4">Returns</a></li>
              <li><a href="#" className="hover:text-black hover:underline underline-offset-4">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="lg:col-span-1 text-center sm:text-left">
             <h4 className="font-black uppercase text-xs tracking-widest mb-4 text-slate-900">Mobile Experience</h4>
             <div className="flex items-start space-x-3 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-w-[260px] mx-auto sm:mx-0">
                <div className="p-2.5 bg-white rounded-xl shadow-sm flex-shrink-0 text-[var(--primary)]">
                   <Smartphone size={20} strokeWidth={2.5} />
                </div>
                <div className="text-left pt-0.5">
                   <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-0.5">App-Like Web</p>
                   <p className="text-[10px] font-bold text-slate-500 leading-snug">Enjoy a seamless shopping experience directly in your mobile browser.</p>
                </div>
             </div>
             
             <h4 className="font-black uppercase text-xs tracking-widest mb-4 text-slate-900">Keep In Touch</h4>
             <div className="flex justify-center sm:justify-start space-x-4">
                <div className="p-2 border rounded-full hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer"><Facebook size={16} /></div>
                <div className="p-2 border rounded-full hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer"><Instagram size={16} /></div>
                <div className="p-2 border rounded-full hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer"><Twitter size={16} /></div>
                <div className="p-2 border rounded-full hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer"><Youtube size={16} /></div>
             </div>
          </div>

          <div className="lg:col-span-2 flex flex-col space-y-8 pl-0 lg:pl-10 items-center sm:items-start">
             <div className="flex items-start space-x-4">
                <div className="mt-1 hidden sm:block">
                  <ShieldCheck size={40} strokeWidth={1} className="text-slate-400" />
                </div>
                <div className="text-center sm:text-left">
                   <p className="text-sm font-bold text-slate-900 italic">
                     <span className="font-black">100% ORIGINAL</span> guarantee
                   </p>
                   <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">for all products at karigiri.com</p>
                </div>
             </div>

             <div className="flex items-start space-x-4">
                <div className="mt-1 hidden sm:block">
                  <RotateCcw size={40} strokeWidth={1} className="text-slate-400" />
                </div>
                <div className="text-center sm:text-left">
                    <p className="text-sm font-bold text-slate-900 italic">
                      <span className="font-black">Easy 7-Day Returns</span> &
                    </p>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Exchange Policy</p>
                </div>
             </div>
          </div>
        </div>

        <hr className="mb-12 border-gray-100" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-16 text-center sm:text-left">
           <div>
              <h5 className="text-slate-900 mb-4">Registered Office Address</h5>
              <p className="leading-loose">
                 Karigiri Artisanal Studio <br />
                 573, behind Holy Child School <br />
                 Rajiv Nagar, Sector 1A <br />
                 Sonipat, Haryana - 131001 <br />
                 India
              </p>
           </div>
           <div>
              <h5 className="text-slate-900 mb-4">Contact Sales</h5>
              <p className="leading-loose text-slate-500">
                 PH: <a href="https://wa.me/917027311213" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)]">+91 70273 11213</a> <br />
                 Email: sales@karigiri.com
              </p>
           </div>
           <div className="sm:col-span-2">
              <h5 className="text-slate-900 mb-4">Our Commitment</h5>
              <p className="leading-relaxed normal-case text-slate-400 font-normal italic">
                 "Karigiri is more than a store. It is a movement to protect the heritage of hand-weaving. Every purchase supports an artisan community directly, ensuring that true craftsmanship never dies out in the fast-fashion world."
              </p>
           </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300 text-center md:text-left">
           <div className="space-y-4 flex flex-col items-center md:items-start">
              <p>© 2026 KARIGIRI HANDCRAFTED PVT LTD. ALL RIGHTS RESERVED.</p>
           </div>
           <div className="flex flex-col items-center md:items-end space-y-2 mt-8 md:mt-0">
              <span className="text-slate-200">GSTIN: 07AAGCK7777A1Z5</span>
              <div className="flex space-x-8">
                <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
