import { Link } from 'react-router-dom';
import { Cpu, Phone, Send, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Cpu size={16} className="text-white"/>
              </div>
              <span className="font-black text-white text-base font-display">
                Robo<span className="text-gradient">Market</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Namangan shahridagi robototexnika va elektronika mahsulotlari online do'koni.
            </p>
          </div>
          <div>
            <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wide">Navigatsiya</h4>
            <div className="space-y-2 text-sm">
              {[['/', 'Bosh sahifa'], ['/products', 'Mahsulotlar'], ['/categories', 'Kategoriyalar'], ['/blog', 'Yangiliklar'], ['/contact', 'Aloqa']].map(([to, l]) => (
                <Link key={to} to={to} className="block text-slate-500 hover:text-gradient transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wide">Kategoriyalar</h4>
            <div className="space-y-2 text-sm">
              {[['arduino', 'Arduino'], ['sensors', 'Sensorlar'], ['motors', 'Motorlar'], ['display', 'Displeylar']].map(([s, l]) => (
                <Link key={s} to={`/products?category=${s}`} className="block text-slate-500 hover:text-gradient transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wide">Aloqa</h4>
            <div className="space-y-3 text-sm">
              {[
                [Phone, '+998 91 355 14 03'],
                [Send, '@RoboMarket_Admin'],
                [MapPin, 'Namangan viloyati, Namangan shahri'],
                [Clock, 'Dush-Shan: 9:00-18:00'],
              ].map(([Icon, t], i) => (
                <div key={i} className="flex items-start gap-2.5 text-slate-500">
                  <Icon size={14} className="text-violet-400 flex-shrink-0 mt-0.5"/>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>2025 RoboMarket. Barcha huquqlar himoyalangan.</span>
          <span className="text-violet-400 font-bold">Namangan, O'zbekiston</span>
        </div>
      </div>
    </footer>
  );
}
