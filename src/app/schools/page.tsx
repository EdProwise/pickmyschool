'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  LocateFixed, 
  Check, 
  ChevronsUpDown,
  Search,
  GraduationCap,
  MapPin,
  IndianRupee,
  Sparkles,
  Trash2,
  Star,
  Globe,
  Settings2,
  LayoutGrid
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchoolCard from '@/components/SchoolCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getSchools, type School } from '@/lib/api';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Option {
  name: string;
  count: number;
}

interface FilterPanelProps {
  localSearch: string;
  setLocalSearch: (val: string) => void;
  setSearch: (val: string) => void;
  citySearchOpen: boolean;
  setCitySearchOpen: (val: boolean) => void;
  selectedCities: string[];
  setSelectedCities: (val: string[]) => void;
  availableCities: Option[];
  board: string;
  setBoard: (val: string) => void;
  availableBoards: Option[];
  k12Level: string;
  setK12Level: (val: string) => void;
  availableK12Levels: Option[];
  language: string;
  setLanguage: (val: string) => void;
  availableLanguages: Option[];
  stream: string;
  setStream: (val: string) => void;
    availableStreams: Option[];
    schoolType: string;
    setSchoolType: (val: string) => void;
    availableSchoolTypes: Option[];
    gender: string;
    setGender: (val: string) => void;
    availableGenders: Option[];
    minRating: number[];
  setMinRating: (val: number[]) => void;
  coords: { lat: number | null; lng: number | null };
  handleUseMyLocation: () => void;
  radiusKm: number[];
  setRadiusKm: (val: number[]) => void;
  geoError: string | null;
  feesMin: string;
  setFeesMin: (val: string) => void;
  feesMax: string;
  setFeesMax: (val: string) => void;
  isInternational: boolean | null;
  setIsInternational: (val: boolean | null) => void;
  selectedFacilities: string[];
  handleFacilityToggle: (facility: string) => void;
  facilities: string[];
  clearAllFilters: () => void;
}

const FilterPanel = ({
  localSearch,
  setLocalSearch,
  setSearch,
  citySearchOpen,
  setCitySearchOpen,
  selectedCities,
  setSelectedCities,
  availableCities,
  board,
  setBoard,
  availableBoards,
  k12Level,
  setK12Level,
  availableK12Levels,
  language,
  setLanguage,
  availableLanguages,
  stream,
  setStream,
  availableStreams,
  schoolType,
  setSchoolType,
  availableSchoolTypes,
  gender,
  setGender,
  availableGenders,
  minRating,
  setMinRating,
  coords,
  handleUseMyLocation,
  radiusKm,
  setRadiusKm,
  geoError,
  feesMin,
  setFeesMin,
  feesMax,
  setFeesMax,
  isInternational,
  setIsInternational,
  selectedFacilities,
  handleFacilityToggle,
  facilities,
  clearAllFilters
}: FilterPanelProps) => {
  const feeOptions = Array.from({ length: 101 }, (_, i) => (i * 5000).toString()); // Up to 500k in 5k steps

  return (
    <div className="space-y-6">
      {/* Quick Search & City Section */}
      <div className="space-y-4">
        <div className="space-y-3 group">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 block px-1">
            Find School
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
            <Input
              placeholder="Type name or location..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSearch(localSearch);
              }}
              className="pl-9 h-11 bg-white border-2 border-transparent shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] focus-visible:ring-0 focus-visible:border-primary/30 transition-all rounded-2xl hover:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)]"
            />
          </div>
          <Button 
            onClick={() => setSearch(localSearch)}
            className="w-full h-10 bg-primary/10 text-primary hover:bg-primary hover:text-white border-none rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 shadow-sm"
          >
            Execute Search
          </Button>
        </div>

        <div>
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block px-1">
            Choose Cities
          </Label>
          <Popover open={citySearchOpen} onOpenChange={setCitySearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={citySearchOpen}
                className="w-full justify-between h-auto min-h-11 font-medium border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/[0.02] transition-all rounded-2xl"
              >
                {selectedCities.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 py-1.5">
                    {selectedCities.map((city) => (
                      <Badge
                        key={city}
                        variant="secondary"
                        className="pl-2 pr-1.5 py-1 bg-primary/5 text-primary hover:bg-primary/10 border-none flex items-center gap-1.5 animate-in fade-in zoom-in duration-300 rounded-lg group"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCities(selectedCities.filter((c) => c !== city));
                        }}
                      >
                        <span className="text-[11px] font-semibold">{city}</span>
                        <div className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                          <X className="h-3 w-3" />
                        </div>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground/60 flex items-center gap-2">
                    <MapPin className="h-4 w-4 opacity-50" />
                    Select cities...
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="start">
              <Command className="border-none">
                <CommandInput placeholder="Type city name..." className="h-12 border-none focus:ring-0" />
                <CommandEmpty>No cities found</CommandEmpty>
                <CommandList className="max-h-72">
                  <CommandGroup className="p-2">
                    {availableCities.map((city) => (
                      <CommandItem
                        key={city.name}
                        value={city.name}
                        onSelect={() => {
                          if (selectedCities.includes(city.name)) {
                            setSelectedCities(selectedCities.filter((c) => c !== city.name));
                          } else {
                            setSelectedCities([...selectedCities, city.name]);
                          }
                        }}
                        className="flex items-center justify-between py-3 px-3 rounded-xl cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-all duration-300",
                            selectedCities.includes(city.name) 
                              ? "bg-primary border-primary text-primary-foreground scale-110" 
                              : "border-muted-foreground/20 opacity-50"
                          )}>
                            {selectedCities.includes(city.name) && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                          <span className="font-medium text-sm">{city.name}</span>
                        </div>
                        <Badge variant="outline" className="ml-auto font-mono text-[10px] bg-muted/30 border-none px-2">{city.count}</Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedCities.length > 0 && (
            <Button
              variant="link"
              size="sm"
              className="mt-2 h-auto p-0 text-[11px] font-bold text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5"
              onClick={() => setSelectedCities([])}
            >
              <Trash2 className="h-3 w-3" />
              Reset city selection
            </Button>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent" />

      <Accordion type="multiple" defaultValue={['academic', 'location', 'preferences']} className="w-full space-y-3">
        {/* Academic Details */}
        <AccordionItem value="academic" className="border-none bg-blue-50/40 rounded-3xl overflow-hidden px-4 hover:bg-blue-50/60 transition-all duration-300">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-sm font-bold text-blue-900/80">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </div>
              Academic Filters
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-blue-800/60 uppercase tracking-widest px-1">Curriculum / Board</Label>
                <Select value={board} onValueChange={setBoard}>
                  <SelectTrigger className="h-10 bg-white/80 border-none shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select Board" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="all" className="rounded-lg">All Boards</SelectItem>
                    {availableBoards.map((b) => (
                      <SelectItem key={b.name} value={b.name} className="rounded-lg">
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{b.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{b.count}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-blue-800/60 uppercase tracking-widest px-1">Class Level</Label>
                <Select value={k12Level} onValueChange={setK12Level}>
                  <SelectTrigger className="h-10 bg-white/80 border-none shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="all" className="rounded-lg">All Classes</SelectItem>
                    {availableK12Levels.map((level) => (
                      <SelectItem key={level.name} value={level.name} className="rounded-lg">
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{level.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{level.count}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-blue-800/60 uppercase tracking-widest px-1">Instruction Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-10 bg-white/80 border-none shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="all" className="rounded-lg">All Languages</SelectItem>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.name} value={lang.name} className="rounded-lg">
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{lang.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{lang.count}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-blue-800/60 uppercase tracking-widest px-1">Academic Stream</Label>
                  <Select value={stream} onValueChange={setStream}>
                    <SelectTrigger className="h-10 bg-white/80 border-none shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select Stream" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="all" className="rounded-lg">All Streams</SelectItem>
                      {availableStreams.map((s) => (
                        <SelectItem key={s.name} value={s.name} className="rounded-lg">
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{s.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s.count}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-blue-800/60 uppercase tracking-widest px-1">School Type</Label>
                  <Select value={schoolType} onValueChange={setSchoolType}>
                    <SelectTrigger className="h-10 bg-white/80 border-none shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="all" className="rounded-lg">All Types</SelectItem>
                      {availableSchoolTypes.map((type) => (
                        <SelectItem key={type.name} value={type.name} className="rounded-lg">
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{type.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{type.count}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-blue-800/60 uppercase tracking-widest px-1">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-10 bg-white/80 border-none shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="all" className="rounded-lg">All Genders</SelectItem>
                      {availableGenders.map((g) => (
                        <SelectItem key={g.name} value={g.name} className="rounded-lg">
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{g.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{g.count}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Location & Rating */}
        <AccordionItem value="location" className="border-none bg-emerald-50/40 rounded-3xl overflow-hidden px-4 hover:bg-emerald-50/60 transition-all duration-300">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-sm font-bold text-emerald-900/80">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Star className="h-4 w-4 text-emerald-600" />
              </div>
              Rating & Proximity
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pb-6">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">Minimum Rating</Label>
                <Badge variant="secondary" className="font-bold text-emerald-700 bg-emerald-500/10 border-none h-6 px-2.5 rounded-lg flex items-center gap-1">
                  {minRating[0]} <Star className="h-3 w-3 fill-current" />
                </Badge>
              </div>
              <Slider
                value={minRating}
                onValueChange={setMinRating}
                min={0}
                max={5}
                step={0.5}
                className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-emerald-600 [&_[role=slider]]:border-emerald-600 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-emerald-200"
              />
              <div className="flex justify-between text-[10px] text-emerald-900/40 font-bold px-1 uppercase tracking-tighter">
                <span>Any</span>
                <span>Average</span>
                <span>Elite</span>
              </div>
            </div>

            <div className="h-[1px] bg-emerald-500/10" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">Distance Range</Label>
                {coords.lat && (
                  <Badge variant="secondary" className="font-bold text-emerald-700 bg-emerald-500/10 border-none h-6 px-2.5 rounded-lg animate-pulse">
                    ACTIVE
                  </Badge>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUseMyLocation}
                className="w-full h-10 text-xs font-bold border-emerald-500/20 bg-white/80 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 rounded-xl gap-2"
              >
                <LocateFixed className="h-3.5 w-3.5" />
                Find Near Me
              </Button>

              <div className="space-y-4">
                <Slider
                  value={radiusKm}
                  onValueChange={(v) => setRadiusKm(v)}
                  min={0}
                  max={50}
                  step={1}
                  disabled={!coords.lat}
                  className={cn("[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-emerald-600 [&_[role=slider]]:border-emerald-600 [&_[role=slider]]:shadow-lg", !coords.lat && "opacity-30")}
                />
                <div className="flex justify-between items-center text-[10px] text-emerald-900/40 font-bold px-1">
                  <span>0 KM</span>
                  <span className="text-emerald-700 bg-emerald-500/5 px-2 py-0.5 rounded-full ring-1 ring-emerald-500/20">{radiusKm[0]} KM RADIUS</span>
                  <span>50 KM</span>
                </div>
              </div>
              {geoError && <p className="text-[10px] text-destructive font-bold text-center animate-bounce">{geoError}</p>}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Fees & Preferences */}
        <AccordionItem value="preferences" className="border-none bg-amber-50/40 rounded-3xl overflow-hidden px-4 hover:bg-amber-50/60 transition-all duration-300">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-sm font-bold text-amber-900/80">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <IndianRupee className="h-4 w-4 text-amber-600" />
              </div>
              Budget & Perks
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-5 pb-6">
            <div className="space-y-3 pt-2">
              <Label className="text-[10px] font-bold text-amber-800/60 uppercase tracking-widest px-1">Annual Fees Range</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold text-amber-800/40 uppercase px-1">Min Fees</Label>
                  <Select value={feesMin || "0"} onValueChange={setFeesMin}>
                    <SelectTrigger className="h-10 bg-white/80 border-none shadow-sm rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500/20">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl max-h-[300px]">
                      {feeOptions.map((fee) => (
                        <SelectItem key={`min-${fee}`} value={fee} className="rounded-lg">
                          ₹{parseInt(fee).toLocaleString('en-IN')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold text-amber-800/40 uppercase px-1">Max Fees</Label>
                  <Select value={feesMax || "all"} onValueChange={setFeesMax}>
                    <SelectTrigger className="h-10 bg-white/80 border-none shadow-sm rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500/20">
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl max-h-[300px]">
                      <SelectItem value="all" className="rounded-lg italic">Any Max</SelectItem>
                      {feeOptions.map((fee) => (
                        <SelectItem key={`max-${fee}`} value={fee} className="rounded-lg">
                          ₹{parseInt(fee).toLocaleString('en-IN')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl border-2 border-amber-500/10 transition-all hover:scale-[1.02] cursor-pointer group" onClick={() => setIsInternational(isInternational === true ? null : true)}>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="international-premium"
                  checked={isInternational === true}
                  onCheckedChange={(checked) => setIsInternational(checked ? true : null)}
                  className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 h-5 w-5 rounded-lg border-2 border-amber-600/30"
                />
                <div className="space-y-0.5">
                  <Label
                    htmlFor="international-premium"
                    className="text-xs font-bold text-amber-900/80 leading-none cursor-pointer flex items-center gap-2"
                  >
                    International Standard
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                  </Label>
                  <p className="text-[10px] text-amber-800/40 font-semibold uppercase tracking-tighter">Global curricula only</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold text-amber-800/60 uppercase tracking-widest">Campus Facilities</Label>
                <Badge variant="secondary" className="h-5 text-[9px] px-2 font-bold bg-amber-500/10 text-amber-700 border-none">{selectedFacilities.length} SELECTED</Badge>
              </div>
              <ScrollArea className="h-[220px] pr-4">
                <div className="grid gap-2 p-1">
                  {facilities.map((facility) => (
                    <div 
                      key={facility} 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border-2 cursor-pointer",
                        selectedFacilities.includes(facility) 
                          ? "bg-white border-amber-500/30 shadow-sm" 
                          : "bg-white/40 border-transparent hover:bg-white/80"
                      )}
                      onClick={() => handleFacilityToggle(facility)}
                    >
                      <Checkbox
                        id={`fac-${facility}`}
                        checked={selectedFacilities.includes(facility)}
                        onCheckedChange={() => handleFacilityToggle(facility)}
                        className="h-4 w-4 border-2 border-amber-600/30 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                      />
                      <label
                        htmlFor={`fac-${facility}`}
                        className="text-[11px] font-bold text-amber-900/70 cursor-pointer flex-1"
                      >
                        {facility}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-4">
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="w-full h-12 text-[10px] font-black uppercase tracking-[0.25em] border-2 border-muted-foreground/10 hover:bg-destructive hover:text-white hover:border-destructive transition-all duration-500 rounded-2xl gap-3 group"
        >
          <Trash2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          Purge All Filters
        </Button>
      </div>
    </div>
  );
};

function SchoolsPageContent() {
  const searchParams = useSearchParams();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedCities, setSelectedCities] = useState<string[]>(
    searchParams.get('city') ? searchParams.get('city')!.split(',').map(c => c.trim()) : []
  );
  const [availableCities, setAvailableCities] = useState<Option[]>([]);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [board, setBoard] = useState(searchParams.get('board') || 'all');
  const [schoolType, setSchoolType] = useState(searchParams.get('schoolType') || 'all');
  const [feesMin, setFeesMin] = useState('');
  const [feesMax, setFeesMax] = useState(searchParams.get('feesMax') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  
  // New filter states
  const [minRating, setMinRating] = useState<number[]>([0]);
    const [gender, setGender] = useState(searchParams.get('gender') || 'all');
    const [language, setLanguage] = useState('all');
    const [stream, setStream] = useState('all');
    const [k12Level, setK12Level] = useState(searchParams.get('k12Level') || 'all');
  const [isInternational, setIsInternational] = useState<boolean | null>(null);
  // Distance filter
  const [radiusKm, setRadiusKm] = useState<number[]>([0]);
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [geoError, setGeoError] = useState<string | null>(null);
  
  // Dynamic filter options from database
  const [availableLanguages, setAvailableLanguages] = useState<Option[]>([]);
  const [availableSchoolTypes, setAvailableSchoolTypes] = useState<Option[]>([]);
  const [availableBoards, setAvailableBoards] = useState<Option[]>([]);
  const [availableGenders, setAvailableGenders] = useState<Option[]>([]);
  const [availableK12Levels, setAvailableK12Levels] = useState<Option[]>([]);
  const [availableStreams, setAvailableStreams] = useState<Option[]>([]);

  const facilities = [
    'Library',
    'Sports Complex',
    'Science Lab',
    'Computer Lab',
    'Swimming Pool',
    'Transport',
    'Hostel',
    'Playground',
    'Auditorium',
    'Smart Classrooms',
    'Cafeteria',
  ];

  useEffect(() => {
    loadCities();
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadSchools();
  }, [selectedCities, board, schoolType, feesMin, feesMax, search, sortBy, sortOrder, selectedFacilities, minRating, gender, language, stream, k12Level, isInternational, radiusKm, coords]);

  const loadCities = async () => {
    try {
      const res = await fetch('/api/cities/stats');
      if (res.ok) {
        const data = await res.json();
        setAvailableCities(data.filter((c: { name: string }) => c.name && c.name.trim()));
      }
    } catch (error) {
      console.error('Failed to load cities:', error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const res = await fetch('/api/schools/filter-options');
      if (res.ok) {
        const data = await res.json();
        setAvailableLanguages(data.languages || []);
        setAvailableSchoolTypes(data.schoolTypes || []);
        setAvailableBoards(data.boards || []);
        setAvailableGenders(data.genders || []);
        setAvailableK12Levels(data.k12Levels || []);
        setAvailableStreams(data.streams || []);
      }
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadSchools = async () => {
    setLoading(true);
    try {
      const params: any = {
        sort: sortBy,
        order: sortOrder,
        limit: 50,
      };

      if (selectedCities.length > 0) {
        params.city = selectedCities.join(',');
      }
      if (board && board !== 'all') params.board = board;
      if (schoolType && schoolType !== 'all') params.schoolType = schoolType;
      if (feesMin) params.feesMin = parseInt(feesMin);
      if (feesMax && feesMax !== 'all') params.feesMax = parseInt(feesMax);
      if (search) params.search = search;
      if (selectedFacilities.length > 0) params.facilities = selectedFacilities.join(',');
      if (minRating[0] > 0) params.minRating = minRating[0];
      if (gender && gender !== 'all') params.gender = gender;
      if (language && language !== 'all') params.language = language;
      if (stream && stream !== 'all') params.stream = stream;
      if (k12Level && k12Level !== 'all') params.k12Level = k12Level;
      if (isInternational !== null) params.isInternational = isInternational.toString();
      if (coords.lat !== null && coords.lng !== null) {
        params.lat = coords.lat;
        params.lng = coords.lng;
        if (radiusKm[0] > 0) {
          params.radiusKm = radiusKm[0];
        }
      }

      const data = await getSchools(params);
      setSchools(data);
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityToggle = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setGeoError('Unable to retrieve your location')
    );
  };

  const clearAllFilters = () => {
    setSelectedCities([]);
    setBoard('all');
    setSchoolType('all');
    setFeesMin('');
    setFeesMax('');
    setSearch('');
    setLocalSearch('');
    setSelectedFacilities([]);
    setMinRating([0]);
    setGender('all');
    setLanguage('all');
    setStream('all');
    setK12Level('all');
    setIsInternational(null);
    setRadiusKm([0]);
    setCoords({ lat: null, lng: null });
    setGeoError(null);
  };

  const filterPanelProps: FilterPanelProps = {
    localSearch,
    setLocalSearch,
    setSearch,
    citySearchOpen,
    setCitySearchOpen,
    selectedCities,
    setSelectedCities,
    availableCities,
    board,
    setBoard,
    availableBoards,
    k12Level,
    setK12Level,
    availableK12Levels,
    language,
    setLanguage,
    availableLanguages,
    stream,
    setStream,
    availableStreams,
    schoolType,
    setSchoolType,
    availableSchoolTypes,
    gender,
    setGender,
    availableGenders,
    minRating,
    setMinRating,
    coords,
    handleUseMyLocation,
    radiusKm,
    setRadiusKm,
    geoError,
    feesMin,
    setFeesMin,
    feesMax,
    setFeesMax,
    isInternational,
    setIsInternational,
    selectedFacilities,
    handleFacilityToggle,
    facilities,
    clearAllFilters,
  };

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="pt-16 sm:pt-20 pb-8 sm:pb-16 px-3 sm:px-4">
            <div className="container mx-auto">
              {/* Header */}
              <div className="mb-4 sm:mb-8 text-center sm:text-left">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-1 sm:mb-2 tracking-tight">
                  Find Your Perfect School
                </h1>
                <p className="text-xs sm:text-lg font-medium text-muted-foreground">
                  {loading ? 'Loading schools...' : `${schools.length} premier institutions found`}
                </p>
              </div>


            <div className="flex gap-4 lg:gap-8">
            {/* Desktop Filters */}
            <Card className="hidden lg:block w-[340px] h-fit sticky top-24 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white/70 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden ring-1 ring-black/[0.03]">
              <CardHeader className="pb-6 pt-8 px-8 border-b border-muted/20 bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3 italic">
                      <div className="p-2.5 bg-primary rounded-2xl shadow-xl shadow-primary/20 -rotate-6 group-hover:rotate-0 transition-all duration-500">
                        <Settings2 className="h-5 w-5 text-primary-foreground" />
                      </div>
                      FILTERS
                    </CardTitle>
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-1">Tailor your search</p>
                  </div>
                  <Badge variant="secondary" className="h-6 px-2.5 font-black text-[9px] bg-primary/10 text-primary border-none rounded-lg animate-pulse">
                    LIVE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar">
                <FilterPanel {...filterPanelProps} />
              </CardContent>
            </Card>

              {/* Main Content */}
              <div className="flex-1">
                  {/* Sort and Mobile Filter */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-10 items-stretch sm:items-center">
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none z-10">
                          <SlidersHorizontal className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
                        </div>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="pl-9 sm:pl-12 h-11 sm:h-14 bg-white border-2 border-transparent shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] rounded-xl sm:rounded-[1.5rem] ring-1 ring-black/[0.03] focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-bold text-xs sm:text-sm">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                            <SelectContent className="rounded-xl sm:rounded-[1.5rem] border-none shadow-2xl p-1 sm:p-2">
                              <SelectItem value="profileViews" className="rounded-lg sm:rounded-xl py-2 sm:py-3 text-xs sm:text-sm font-semibold">Popular</SelectItem>
                              <SelectItem value="rating" className="rounded-lg sm:rounded-xl py-2 sm:py-3 text-xs sm:text-sm font-semibold">Rating</SelectItem>
                            <SelectItem value="feesMin" className="rounded-lg sm:rounded-xl py-2 sm:py-3 text-xs sm:text-sm font-semibold">Fees (Low)</SelectItem>
                            <SelectItem value="feesMax" className="rounded-lg sm:rounded-xl py-2 sm:py-3 text-xs sm:text-sm font-semibold">Fees (High)</SelectItem>
                            <SelectItem value="name" className="rounded-lg sm:rounded-xl py-2 sm:py-3 text-xs sm:text-sm font-semibold">A-Z</SelectItem>
                            <SelectItem value="distance" className="rounded-lg sm:rounded-xl py-2 sm:py-3 text-xs sm:text-sm font-semibold">Nearest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                      <div className="flex-1 sm:flex-none sm:w-36">
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                          <SelectTrigger className="h-11 sm:h-14 bg-white border-2 border-transparent shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] rounded-xl sm:rounded-[1.5rem] ring-1 ring-black/[0.03] focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-bold text-xs sm:text-sm">
                            <SelectValue placeholder="Order" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl sm:rounded-[1.5rem] border-none shadow-2xl p-1 sm:p-2">
                            <SelectItem value="asc" className="rounded-lg sm:rounded-xl py-2 sm:py-3 text-xs sm:text-sm font-semibold">Ascending</SelectItem>
                            <SelectItem value="desc" className="rounded-lg sm:rounded-xl py-2 sm:py-3 text-xs sm:text-sm font-semibold">Descending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Mobile Filter Button */}
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" className="lg:hidden flex-1 sm:flex-none h-11 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-[1.5rem] bg-primary text-white border-none shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest">
                            <Filter className="mr-1.5 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                            Filter
                          </Button>
                        </SheetTrigger>

                      <SheetContent side="right" className="w-[92vw] sm:w-[450px] p-0 border-none rounded-l-2xl sm:rounded-l-[3rem] overflow-hidden bg-white/95 backdrop-blur-xl">
                        <div className="h-full flex flex-col">
                          <SheetHeader className="p-4 sm:p-8 border-b border-muted/10 bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <SheetTitle className="text-xl sm:text-3xl font-black tracking-tighter flex items-center gap-2 sm:gap-4 italic">
                                  <div className="p-2 sm:p-3 bg-primary rounded-xl sm:rounded-2xl shadow-2xl shadow-primary/30">
                                    <Filter className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
                                  </div>
                                  REFINE
                                </SheetTitle>
                                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] sm:tracking-[0.3em] px-1">Customize your discovery</p>
                              </div>
                            </div>
                          </SheetHeader>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                              <FilterPanel {...filterPanelProps} />
                            </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                {/* Schools Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="h-32 sm:h-48 bg-gray-200" />
                        <CardContent className="p-3 sm:p-5">
                          <div className="h-5 sm:h-6 bg-gray-200 rounded mb-2 sm:mb-3" />
                          <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2" />
                          <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : schools.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 sm:p-12 text-center">
                      <p className="text-sm sm:text-lg text-muted-foreground mb-3 sm:mb-4">
                        No schools found matching your criteria.
                      </p>
                      <Button onClick={clearAllFilters} size="sm" className="sm:text-base">
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                    {schools.map((school) => (
                      <SchoolCard key={school.id} school={school} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      <Footer />
    </div>
  );
}

function SchoolsPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <div className="h-10 w-80 bg-gray-200 rounded-lg mb-2 animate-pulse" />
            <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-6">
            <div className="hidden lg:block w-80 h-96 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <CardContent className="p-5">
                      <div className="h-6 bg-gray-200 rounded mb-3" />
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function SchoolsPage() {
  return (
    <Suspense fallback={<SchoolsPageLoading />}>
      <SchoolsPageContent />
    </Suspense>
  );
}
