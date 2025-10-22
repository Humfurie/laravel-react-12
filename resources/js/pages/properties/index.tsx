import { Head, Link, router } from '@inertiajs/react';
import { Bed, Bath, Maximize, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface Property {
    id: number;
    title: string;
    property_type: string;
    bedrooms?: number;
    bathrooms?: number;
    floor_area?: number;
    listing_status: string;
    project: {
        name: string;
        city: string;
        developer: {
            company_name: string;
        };
    };
    pricing?: {
        total_contract_price: number;
        currency: string;
    };
    images: Array<{ url: string; is_primary: boolean }>;
}

interface Filters {
    property_types: string[];
    cities: string[];
}

interface Props {
    properties: {
        data: Property[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: Filters;
    appliedFilters: Record<string, string>;
}

export default function PropertiesIndex({ properties, filters, appliedFilters }: Props) {
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState(appliedFilters.search || '');

    const handleFilter = (key: string, value: string) => {
        router.get('/properties', {
            ...appliedFilters,
            [key]: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = () => {
        router.get('/properties', {
            ...appliedFilters,
            search,
        });
    };

    const formatPrice = (price: number, currency: string) => {
        return `${currency === 'PHP' ? '₱' : '$'}${price.toLocaleString()}`;
    };

    return (
        <>
            <Head title="Properties for Sale" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <div className="container mx-auto px-4 py-12">
                        <h1 className="text-4xl font-bold mb-4">Find Your Dream Property</h1>
                        <p className="text-lg text-orange-100">Browse through our exclusive listings</p>

                        {/* Search Bar */}
                        <div className="mt-8 flex gap-2 max-w-2xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search properties..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white text-gray-900"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                            >
                                Search
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="bg-orange-700 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-800 transition-colors"
                            >
                                <SlidersHorizontal className="h-5 w-5" />
                                Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white border-b">
                        <div className="container mx-auto px-4 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <select
                                    value={appliedFilters.property_type || ''}
                                    onChange={(e) => handleFilter('property_type', e.target.value)}
                                    className="rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="">All Property Types</option>
                                    {filters.property_types.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>

                                <select
                                    value={appliedFilters.city || ''}
                                    onChange={(e) => handleFilter('city', e.target.value)}
                                    className="rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="">All Cities</option>
                                    {filters.cities.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    placeholder="Min Price"
                                    value={appliedFilters.min_price || ''}
                                    onChange={(e) => handleFilter('min_price', e.target.value)}
                                    className="rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                />

                                <input
                                    type="number"
                                    placeholder="Max Price"
                                    value={appliedFilters.max_price || ''}
                                    onChange={(e) => handleFilter('max_price', e.target.value)}
                                    className="rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Properties Grid */}
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-6 text-gray-600">
                        Showing {properties.data.length} of {properties.total} properties
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.data.map((property) => {
                            const primaryImage = property.images.find(img => img.is_primary) || property.images[0];

                            return (
                                <Link
                                    key={property.id}
                                    href={`/properties/${property.id}`}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                                >
                                    <div className="relative h-48 bg-gray-200">
                                        {primaryImage && (
                                            <img
                                                src={primaryImage.url}
                                                alt={property.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                {property.property_type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>

                                        <div className="flex items-center text-gray-600 mb-3">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            <span className="text-sm">{property.project.name}, {property.project.city}</span>
                                        </div>

                                        {property.pricing && (
                                            <div className="text-2xl font-bold text-orange-600 mb-4">
                                                {formatPrice(property.pricing.total_contract_price, property.pricing.currency)}
                                            </div>
                                        )}

                                        <div className="flex gap-4 text-sm text-gray-600">
                                            {property.bedrooms && (
                                                <div className="flex items-center gap-1">
                                                    <Bed className="h-4 w-4" />
                                                    <span>{property.bedrooms} Beds</span>
                                                </div>
                                            )}
                                            {property.bathrooms && (
                                                <div className="flex items-center gap-1">
                                                    <Bath className="h-4 w-4" />
                                                    <span>{property.bathrooms} Baths</span>
                                                </div>
                                            )}
                                            {property.floor_area && (
                                                <div className="flex items-center gap-1">
                                                    <Maximize className="h-4 w-4" />
                                                    <span>{property.floor_area} m²</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {properties.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {Array.from({ length: properties.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => router.get(`/properties?page=${page}`, appliedFilters)}
                                    className={`px-4 py-2 rounded-lg ${
                                        page === properties.current_page
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
