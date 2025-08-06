'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { Bed, MessageCircle, Sparkles, Star } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFE3C6]/20 to-[#FFE3C6]/10" />
        <div className="relative container mx-auto px-4 pt-12 pb-8">
          <div className="text-center">
            {/* Logo/Brand Section */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="flex items-center space-x-3">
               
                  <div className="text-left">
                  <img src='/logo.png' className='h-12' />
                    <p className="text-sm text-[#6C7275] font-medium font-['Roboto',sans-serif]">Customer Assistant</p>
                  </div>
                </div>
                <div className="absolute -top-1 -right-12">
                  <div className="flex items-center space-x-1 bg-[#61CE70]/20 text-[#204532] px-2 py-1 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-[#61CE70] rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <div className="max-w-2xl mx-auto mb-8">
              <h2 className="text-xl font-semibold text-[#141718] mb-3 font-['Roboto',sans-serif]">
                Premium Handcrafted Swing Beds from Charleston
              </h2>
              <p className="text-[#6C7275] leading-relaxed font-['Roboto',sans-serif]">
                Get instant answers about our luxury swing beds, custom sizing, installation, 
                and find your perfect outdoor relaxation solution.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 mb-8 text-sm text-[#6C7275]">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-[#FFE3C6] fill-current" />
                <span className="font-['Roboto',sans-serif]">12+ Years Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#61CE70]" />
                <span className="font-['Roboto',sans-serif]">1000+ Happy Customers</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-[#204532]" />
                <span className="font-['Roboto',sans-serif]">Instant Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Chat Container */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-[#FFE3C6]/30 overflow-hidden">
            <div className="bg-gradient-to-r from-[#141718] to-[#204532] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold font-['Roboto',sans-serif]">Chat with our Assistant</h3>
                    <p className="text-[#FFE3C6]/80 text-sm font-['Roboto',sans-serif]">Ask about products, sizing, installation & more</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-[#FFE3C6]/80 text-xs">
                  <div className="w-2 h-2 bg-[#61CE70] rounded-full"></div>
                  <span className="font-['Roboto',sans-serif]">Available 24/7</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <ChatInterface />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FFE3C6]/30 backdrop-blur-sm rounded-xl p-4 border border-[#FFE3C6]/40 hover:bg-[#FFE3C6]/50 transition-all cursor-pointer group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#FFE3C6] rounded-lg flex items-center justify-center group-hover:bg-[#FFE3C6]/80 transition-colors">
                  <Bed className="w-5 h-5 text-[#204532]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#141718] text-sm font-['Roboto',sans-serif]">Browse Products</h4>
                  <p className="text-xs text-[#6C7275] font-['Roboto',sans-serif]">View our swing bed collection</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFE3C6]/30 backdrop-blur-sm rounded-xl p-4 border border-[#FFE3C6]/40 hover:bg-[#FFE3C6]/50 transition-all cursor-pointer group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#61CE70]/20 rounded-lg flex items-center justify-center group-hover:bg-[#61CE70]/30 transition-colors">
                  <Star className="w-5 h-5 text-[#204532]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#141718] text-sm font-['Roboto',sans-serif]">Size Guide</h4>
                  <p className="text-xs text-[#6C7275] font-['Roboto',sans-serif]">Find the perfect fit</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFE3C6]/30 backdrop-blur-sm rounded-xl p-4 border border-[#FFE3C6]/40 hover:bg-[#FFE3C6]/50 transition-all cursor-pointer group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#FFE3C6] rounded-lg flex items-center justify-center group-hover:bg-[#FFE3C6]/80 transition-colors">
                  <Sparkles className="w-5 h-5 text-[#204532]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#141718] text-sm font-['Roboto',sans-serif]">Custom Orders</h4>
                  <p className="text-xs text-[#6C7275] font-['Roboto',sans-serif]">Create your dream bed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#FFE3C6]/30 bg-[#FFE3C6]/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-[#6C7275] font-['Roboto',sans-serif]">
              <span>Handcrafted in Charleston, SC</span>
              <span className="w-1 h-1 bg-[#6C7275] rounded-full"></span>
              <span>Premium Quality Since 2012</span>
              <span className="w-1 h-1 bg-[#6C7275] rounded-full"></span>
              <span>Free Shipping Over $3,000</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}