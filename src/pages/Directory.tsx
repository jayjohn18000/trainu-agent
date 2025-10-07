import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { trainers } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, CheckCircle2, Search, X } from "lucide-react";

const ITEMS_PER_PAGE = 9;

export default function Directory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique cities, states, specialties
  const cities = useMemo(() => {
    const citySet = new Set(trainers.map((t) => t.location.split(", ")[0]));
    return Array.from(citySet).sort();
  }, []);

  const states = useMemo(() => {
    const stateSet = new Set(trainers.map((t) => t.location.split(", ")[1]));
    return Array.from(stateSet).sort();
  }, []);

  const specialties = useMemo(() => {
    const specialtySet = new Set(trainers.flatMap((t) => t.specialties));
    return Array.from(specialtySet).sort();
  }, []);

  const filteredTrainers = useMemo(() => {
    return trainers.filter((trainer) => {
      const matchesSearch =
        trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        trainer.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = cityFilter === "all" || trainer.location.includes(cityFilter);
      const matchesState = stateFilter === "all" || trainer.location.includes(stateFilter);
      const matchesSpecialty =
        specialtyFilter === "all" || trainer.specialties.includes(specialtyFilter);

      return matchesSearch && matchesCity && matchesState && matchesSpecialty;
    });
  }, [searchQuery, cityFilter, stateFilter, specialtyFilter]);

  const totalPages = Math.ceil(filteredTrainers.length / ITEMS_PER_PAGE);
  const paginatedTrainers = filteredTrainers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeFiltersCount =
    (cityFilter !== "all" ? 1 : 0) +
    (stateFilter !== "all" ? 1 : 0) +
    (specialtyFilter !== "all" ? 1 : 0);

  const clearAllFilters = () => {
    setCityFilter("all");
    setStateFilter("all");
    setSpecialtyFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trainer Directory</h1>
        <p className="text-muted-foreground mt-1">
          Find your perfect trainer and start your fitness journey.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, specialty, or location..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={cityFilter} onValueChange={(v) => { setCityFilter(v); setCurrentPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setCurrentPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={specialtyFilter} onValueChange={(v) => { setSpecialtyFilter(v); setCurrentPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {cityFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                City: {cityFilter}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary"
                  onClick={() => { setCityFilter("all"); setCurrentPage(1); }}
                />
              </Badge>
            )}
            {stateFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                State: {stateFilter}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary"
                  onClick={() => { setStateFilter("all"); setCurrentPage(1); }}
                />
              </Badge>
            )}
            {specialtyFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {specialtyFilter}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary"
                  onClick={() => { setSpecialtyFilter("all"); setCurrentPage(1); }}
                />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedTrainers.length} of {filteredTrainers.length} trainers
        </p>
      </div>

      {/* Trainer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedTrainers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No trainers found matching your criteria.</p>
            <Button variant="outline" onClick={clearAllFilters} className="mt-4">
              Clear Filters
            </Button>
          </div>
        ) : (
          paginatedTrainers.map((trainer) => (
          <div key={trainer.id} className="metric-card hover:card-elevated transition-all">
            <div className="aspect-video bg-secondary rounded-lg mb-4 overflow-hidden">
              <img
                src={trainer.image}
                alt={trainer.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{trainer.name}</h3>
                  {trainer.verified && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{trainer.title}</p>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{trainer.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium">{trainer.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({trainer.clients} clients)
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {trainer.specialties.slice(0, 3).map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <Link to={`/trainers/${trainer.slug}`}>
                <Button className="w-full">View Profile</Button>
              </Link>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          })}
          {totalPages > 5 && <span className="text-muted-foreground">...</span>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
