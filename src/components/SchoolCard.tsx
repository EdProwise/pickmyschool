'use client';

import Link from 'next/link';
import { MapPin, Star, IndianRupee, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { School } from '@/lib/api';

interface SchoolCardProps {
  school: School;
}

export default function SchoolCard({ school }: SchoolCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-5">
        {/* Logo, Name and Featured Badge Section */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* School Logo */}
            {school.logo && (
              <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden ring-2 ring-gray-100 flex-shrink-0">
                <img
                  src={school.logo}
                  alt={`${school.name} logo`}
                  className="w-12 h-12 object-contain"
                />
              </div>
            )}
            
            {/* School Name */}
            <Link href={`/schools/${school.id}`} className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground hover:text-[#04d3d3] transition-colors line-clamp-2">
                {school.name}
              </h3>
            </Link>
          </div>
          
          {/* Featured Badge */}
          {school.featured && (
            <Badge
              className="flex-shrink-0"
              style={{ backgroundColor: '#04d3d3', color: 'white' }}
            >
              Featured
            </Badge>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">
            {school.city}
            {school.state && `, ${school.state}`}
          </span>
        </div>

        {/* Board and Type */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary">{school.board}</Badge>
          {school.schoolType && <Badge variant="outline">{school.schoolType}</Badge>}
        </div>

        {/* Fees Range */}
        {school.feesMin && school.feesMax && (
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <IndianRupee size={14} className="mr-1" />
            <span>
              ₹{school.feesMin.toLocaleString()} - ₹{school.feesMax.toLocaleString()} / year
            </span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center mb-4">
          <Star size={16} className="fill-yellow-400 text-yellow-400 mr-1" />
          <span className="font-semibold text-foreground">{school.rating}</span>
          <span className="text-sm text-muted-foreground ml-1">
            ({school.reviewCount} reviews)
          </span>
        </div>

        {/* Key Highlights */}
        {school.facilities && school.facilities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {school.facilities.slice(0, 3).map((facility, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {facility}
                </span>
              ))}
              {school.facilities.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  +{school.facilities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/schools/${school.id}`} className="flex-1">
            <Button className="w-full" style={{ backgroundColor: '#04d3d3', color: 'white' }}>
              View Details
            </Button>
          </Link>
          <Button variant="outline" size="icon">
            <MessageCircle size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}