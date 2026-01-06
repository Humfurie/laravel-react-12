import { Head, useForm } from '@inertiajs/react';
import { Bed, Bath, Maximize, MapPin, Building2, Mail, Phone, User, MessageSquare, Clock } from 'lucide-react';
import { FormEvent } from 'react';

interface Property {
    id: number;
    title: string;
    description?: string;
    property_type: string;
    bedrooms?: number;
    bathrooms?: number;
    floor_area?: number;
    parking_spaces?: number;
    orientation?: string;
    view_type?: string;
    virtual_tour_url?: string;
    project: {
        name: string;
        city: string;
        province: string;
        address?: string;
        developer: {
            company_name: string;
        };
    };
    pricing?: {
        total_contract_price: number;
        currency: string;
        reservation_fee?: number;
        downpayment_percentage?: number;
        monthly_equity?: number;
        payment_scheme_name?: string;
    };
    images: Array<{ url: string; is_primary: boolean }>;
}

interface Props {
    property: Property;
    similarProperties: Property[];
}

export default function PropertyShow({ property, similarProperties }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        inquiry_type: 'general',
        message: '',
        preferred_contact_time: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/api/v1/properties/${property.id}/inquiries`, {
            onSuccess: () => {
                reset();
                alert('Your inquiry has been submitted! We will contact you soon.');
            },
        });
    };

    const primaryImage = property.images.find(img => img.is_primary) || property.images[0];
    const formatPrice = (price: number, currency: string) => {
        return `${currency === 'PHP' ? '₱' : '$'}${price.toLocaleString()}`;
    };

    return (
        <>
            <Head title={property.title} />
            <div className="min-h-screen bg-gray-50">
                {/* Hero Image */}
                <div className="relative h-96 bg-gray-900">
                    {primaryImage && (
                        <img
                            src={primaryImage.url}
                            alt={property.title}
                            className="w-full h-full object-cover opacity-90"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 text-white p-8">
                        <div className="container mx-auto">
                            <div className="max-w-4xl">
                                <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
                                <div className="flex items-center gap-2 text-lg">
                                    <MapPin className="h-5 w-5" />
                                    <span>{property.project.name}, {property.project.city}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Price Card */}
                            {property.pricing && (
                                <div className="bg-white rounded-xl p-6 shadow-sm">
                                    <div className="flex items-baseline gap-3">
                                        <div className="text-4xl font-bold text-orange-600">
                                            {formatPrice(property.pricing.total_contract_price, property.pricing.currency)}
                                        </div>
                                        {property.pricing.payment_scheme_name && (
                                            <span className="text-gray-600">({property.pricing.payment_scheme_name})</span>
                                        )}
                                    </div>
                                    {property.pricing.reservation_fee && (
                                        <div className="mt-2 text-gray-600">
                                            Reservation Fee: {formatPrice(property.pricing.reservation_fee, property.pricing.currency)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Details */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-2xl font-bold mb-4">Property Details</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {property.bedrooms && (
                                        <div className="text-center">
                                            <Bed className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                                            <div className="text-2xl font-bold">{property.bedrooms}</div>
                                            <div className="text-sm text-gray-600">Bedrooms</div>
                                        </div>
                                    )}
                                    {property.bathrooms && (
                                        <div className="text-center">
                                            <Bath className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                                            <div className="text-2xl font-bold">{property.bathrooms}</div>
                                            <div className="text-sm text-gray-600">Bathrooms</div>
                                        </div>
                                    )}
                                    {property.floor_area && (
                                        <div className="text-center">
                                            <Maximize className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                                            <div className="text-2xl font-bold">{property.floor_area}</div>
                                            <div className="text-sm text-gray-600">sqm</div>
                                        </div>
                                    )}
                                    {property.parking_spaces && (
                                        <div className="text-center">
                                            <Building2 className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                                            <div className="text-2xl font-bold">{property.parking_spaces}</div>
                                            <div className="text-sm text-gray-600">Parking</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {property.description && (
                                <div className="bg-white rounded-xl p-6 shadow-sm">
                                    <h2 className="text-2xl font-bold mb-4">About This Property</h2>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
                                </div>
                            )}

                            {/* Virtual Tour */}
                            {property.virtual_tour_url && (
                                <div className="bg-white rounded-xl p-6 shadow-sm">
                                    <h2 className="text-2xl font-bold mb-4">Virtual Tour</h2>
                                    <div className="aspect-video">
                                        <iframe
                                            src={property.virtual_tour_url}
                                            className="w-full h-full rounded-lg"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Inquiry Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
                                <h3 className="text-xl font-bold mb-4">Inquire About This Property</h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <User className="inline h-4 w-4 mr-1" />
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.customer_name}
                                            onChange={(e) => setData('customer_name', e.target.value)}
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                        {errors.customer_name && <div className="text-sm text-red-600 mt-1">{errors.customer_name}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Mail className="inline h-4 w-4 mr-1" />
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.customer_email}
                                            onChange={(e) => setData('customer_email', e.target.value)}
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                        {errors.customer_email && <div className="text-sm text-red-600 mt-1">{errors.customer_email}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Phone className="inline h-4 w-4 mr-1" />
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.customer_phone}
                                            onChange={(e) => setData('customer_phone', e.target.value)}
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                        {errors.customer_phone && <div className="text-sm text-red-600 mt-1">{errors.customer_phone}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Inquiry Type</label>
                                        <select
                                            value={data.inquiry_type}
                                            onChange={(e) => setData('inquiry_type', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="general">General</option>
                                            <option value="site_visit">Site Visit</option>
                                            <option value="pricing_info">Pricing Info</option>
                                            <option value="availability">Availability</option>
                                            <option value="financing">Financing</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <MessageSquare className="inline h-4 w-4 mr-1" />
                                            Message *
                                        </label>
                                        <textarea
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            required
                                            rows={4}
                                            className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                        {errors.message && <div className="text-sm text-red-600 mt-1">{errors.message}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Clock className="inline h-4 w-4 mr-1" />
                                            Preferred Contact Time
                                        </label>
                                        <input
                                            type="text"
                                            value={data.preferred_contact_time}
                                            onChange={(e) => setData('preferred_contact_time', e.target.value)}
                                            placeholder="e.g., Weekdays 9AM-5PM"
                                            className="w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Sending...' : 'Send Inquiry'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Similar Properties */}
                    {similarProperties.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {similarProperties.map((similar) => {
                                    const img = similar.images.find(i => i.is_primary) || similar.images[0];
                                    return (
                                        <a
                                            key={similar.id}
                                            href={`/properties/${similar.id}`}
                                            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                                        >
                                            <div className="h-40 bg-gray-200">
                                                {img && <img src={img.url} alt={similar.title} className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold mb-2">{similar.title}</h3>
                                                {similar.pricing && (
                                                    <div className="text-orange-600 font-bold">
                                                        {formatPrice(similar.pricing.total_contract_price, similar.pricing.currency)}
                                                    </div>
                                                )}
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
