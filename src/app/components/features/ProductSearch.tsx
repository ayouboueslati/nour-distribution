'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Package } from 'lucide-react';
import { apiService } from '../../lib/api';
import { Input } from '../ui/Input';
import { Product } from '../../../types';

interface ProductSearchProps {
    onSelect: (product: Product) => void;
    excludeIds?: string[];
    placeholder?: string;
}

export default function ProductSearch({ onSelect, excludeIds = [], placeholder = "Rechercher un produit..." }: ProductSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchProducts = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await apiService.getProducts({
                    search: query,
                    is_active: true,
                    limit: 10
                });

                const filteredResults = (response.products || []).filter(
                    (product: Product) => !excludeIds.includes(product.id)
                );

                setResults(filteredResults);
                setShowDropdown(true);
            } catch (error) {
                console.error('Error searching products:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounceTimer);
    }, [query, excludeIds]);

    const handleSelect = (product: Product) => {
        onSelect(product);
        setQuery('');
        setResults([]);
        setShowDropdown(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10"
                />
            </div>

            {showDropdown && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-stone-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {results.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => handleSelect(product)}
                            className="w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                {product.main_image ? (
                                    <img
                                        src={product.main_image}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded-md bg-stone-100"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-stone-100 rounded-md flex items-center justify-center">
                                        <Package className="w-6 h-6 text-stone-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-stone-900 truncate">{product.name}</p>
                                    <p className="text-sm text-stone-500">SKU: {product.sku}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className={`text-xs font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.stock_quantity > 0 ? `${product.stock_quantity} en stock` : 'Rupture de stock'}
                                        </span>
                                        {product.retail_price && (
                                            <span className="text-xs text-stone-500">{product.retail_price.toFixed(2)} DT</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {showDropdown && query.length >= 2 && results.length === 0 && !loading && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-stone-200 rounded-lg shadow-lg p-4 text-center text-stone-500">
                    Aucun produit trouvé
                </div>
            )}

            {loading && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-stone-200 rounded-lg shadow-lg p-4 text-center">
                    <div className="inline-block w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}
