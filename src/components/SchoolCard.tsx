'use client';

import Link from 'next/link';
import { MapPin, Star, IndianRupee, MessageCircle, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { School } from '@/lib/api';

interface SchoolCardProps {
  school: School;
}

export default function SchoolCard({ school }: SchoolCardProps) {
  return (
    <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white rounded-2xl hover:scale-[1.02] hover:-translate-y-1">
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Top Accent Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600" />
      
      <CardContent className="p-6 relative">
        {/* Logo and Rating Row */}
        <div className="flex items-start justify-between mb-4 gap-3">
          {/* School Logo with Premium Frame */}
          {school.logo && (
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg flex items-center justify-center overflow-hidden ring-2 ring-gray-100 group-hover:ring-cyan-300 transition-all duration-300 flex-shrink-0">
                <img
                  src={school.logo}
                  alt={`${school.name} logo`}
                  className="w-14 h-14 object-contain"
                />
              </div>
              {/* Decorative corner */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
          
          {/* Premium Rating Badge */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-sm">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-foreground text-base">{school.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {school.reviewCount} reviews
            </span>
          </div>
        </div>

        {/* School Name with Hover Effect */}
        <Link href={`/schools/${school.id}`} className="block mb-3">
          <h3 className="text-xl font-bold text-foreground group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300 line-clamp-2 leading-snug">
            {school.name}
          </h3>
        </Link>

        {/* Location with Enhanced Icon */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center group-hover:from-cyan-100 group-hover:to-blue-100 transition-colors duration-300">
            <MapPin size={16} className="text-cyan-600" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {school.city}
            {school.state && `, ${school.state}`}
          </span>
        </div>

        {/* Premium Board and Type Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-0 font-semibold hover:from-blue-200 hover:to-cyan-200 transition-colors">
            {school.board}
          </Badge>
          {school.schoolType && (
            <Badge className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 font-semibold hover:from-purple-200 hover:to-pink-200 transition-colors">
              {school.schoolType}
            </Badge>
          )}
        </div>

        {/* Fees Range with Premium Styling */}
        {school.feesMin && school.feesMax && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <IndianRupee size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Annual Fees</p>
              <p className="text-sm font-bold text-foreground">
                ₹{school.feesMin.toLocaleString('en-IN')} - ₹{school.feesMax.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        {/* Key Facilities with Premium Pills */}
        {school.facilities && school.facilities.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap gap-2">
              {school.facilities.slice(0, 3).map((facility, index) => (
                <span
                  key={index}
                  className="text-xs bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 px-3 py-1.5 rounded-full font-medium border border-gray-200 hover:from-gray-200 hover:to-gray-100 transition-colors"
                >
                  {facility}
                </span>
              ))}
              {school.facilities.length > 3 && (
                <span className="text-xs bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 px-3 py-1.5 rounded-full font-bold border border-cyan-200">
                  +{school.facilities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Premium Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <Link href={`/schools/${school.id}`} className="flex-1">
            <Button className="w-full h-11 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group/btn">
              <span>View Details</span>
              <svg className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="icon"
            className="h-11 w-11 rounded-xl border-2 border-gray-200 hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-300 hover:scale-110"
          >
            <MessageCircle size={20} className="text-gray-600 hover:text-cyan-600" />
          </Button>
        </div>

        {/* Corner Accent (visible on hover) */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-cyan-500/10 via-blue-500/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </CardContent>
    </Card>
  );
}