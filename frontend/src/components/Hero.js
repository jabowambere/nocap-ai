import React from 'react';
import { Search, Shield, Zap } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-white dark:bg-black text-black dark:text-white relative overflow-hidden animate-in fade-in duration-700">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-black/10 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 text-sm border border-black/20 dark:border-white/20 animate-in fade-in slide-in-from-top-8 duration-500 delay-200 hover:scale-105 transition-transform">
          <Search className="text-gray-700 dark:text-gray-300 animate-pulse" size={16} />
          <span className="font-medium text-gray-900 dark:text-gray-100">AI-Powered Truth Detection</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          Verify News
          <br />
          <span className="text-black dark:text-white animate-in fade-in slide-in-from-left-8 duration-500 delay-800">
            Instantly
          </span>
        </h1>
        
        <p className="text-xl text-gray-900 dark:text-gray-100 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-1000">
          Advanced AI analyzes news content for credibility, bias, and misinformation patterns in real-time.
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 animate-in fade-in slide-in-from-left-8 duration-500 delay-1200 hover:scale-110 transition-transform cursor-pointer">
            <div className="w-10 h-10 bg-gray-800/20 dark:bg-gray-500/20 rounded-full flex items-center justify-center hover:bg-gray-800/30 dark:hover:bg-gray-500/30 transition-colors">
              <Zap className="text-gray-700 dark:text-gray-300 animate-bounce" size={20} />
            </div>
            <span className="font-medium">Instant Analysis</span>
          </div>
          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-1400 hover:scale-110 transition-transform cursor-pointer">
            <div className="w-10 h-10 bg-gray-900/20 dark:bg-gray-600/20 rounded-full flex items-center justify-center hover:bg-gray-900/30 dark:hover:bg-gray-600/30 transition-colors">
              <Shield className="text-gray-700 dark:text-gray-300 animate-pulse" size={20} />
            </div>
            <span className="font-medium">Source Verification</span>
          </div>
          <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 animate-in fade-in slide-in-from-right-8 duration-500 delay-1600 hover:scale-110 transition-transform cursor-pointer">
            <div className="w-10 h-10 bg-black/20 dark:bg-gray-700/20 rounded-full flex items-center justify-center hover:bg-black/30 dark:hover:bg-gray-700/30 transition-colors">
              <Search className="text-gray-700 dark:text-gray-300 animate-spin" size={20} />
            </div>
            <span className="font-medium">Pattern Detection</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
