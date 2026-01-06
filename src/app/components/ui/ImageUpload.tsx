import { useState, useRef } from 'react';
import { Button } from './Button';
import { getProductImageUrl } from '../../lib/api';

interface ImageUploadProps {
    label: string;
    files: File[];
    onFilesChange: (files: File[]) => void;
    existingImages?: string[];
    onDeleteExisting?: (imagePath: string) => void;
    multiple?: boolean;
    helpText?: string;
    maxSizeInMB?: number;
}

export function ImageUpload({
    label,
    files,
    onFilesChange,
    existingImages = [],
    onDeleteExisting,
    multiple = false,
    helpText,
    maxSizeInMB = 5
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length === 0) return;

        // Validate files
        const validFiles: File[] = [];
        let hasError = false;

        selectedFiles.forEach(file => {
            // Check type
            if (!file.type.startsWith('image/')) {
                setError('Format de fichier non supporté. Utilisez JPG, PNG ou WEBP.');
                hasError = true;
                return;
            }

            // Check size
            if (file.size > maxSizeInMB * 1024 * 1024) {
                setError(`L'image ${file.name} dépasse la taille maximale de ${maxSizeInMB}MB.`);
                hasError = true;
                return;
            }

            validFiles.push(file);
        });

        if (hasError && validFiles.length === 0) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (multiple) {
            onFilesChange([...files, ...validFiles]);
        } else {
            onFilesChange([validFiles[0]]);
        }

        // Reset input so same file can be selected again if needed (e.g. after removing)
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
    };

    const removeExisting = (path: string) => {
        if (onDeleteExisting) {
            onDeleteExisting(path);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">
                {label}
            </label>

            <div className="space-y-4">
                {/* Upload Area */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-amber-500 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple={multiple}
                        onChange={handleFileSelect}
                    />
                    <div className="space-y-1">
                        <span className="text-4xl">📸</span>
                        <p className="text-sm text-stone-600 font-medium">
                            Cliquez pour ajouter {multiple ? 'des images' : 'une image'}
                        </p>
                        <p className="text-xs text-stone-500">
                            JPG, PNG, WEBP (max {maxSizeInMB}MB)
                        </p>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                {helpText && !error && (
                    <p className="text-xs text-stone-500">{helpText}</p>
                )}

                {/* Previews */}
                {(files.length > 0 || existingImages.length > 0) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Existing Images */}
                        {existingImages.map((path, index) => (
                            <div key={`existing-${index}`} className="relative group aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                                <img
                                    src={getProductImageUrl(path)}
                                    alt={`Existing ${index}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeExisting(path);
                                        }}
                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        title="Supprimer l'image"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                {/* Badge for existing */}
                                <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded shadow-sm">
                                    En ligne
                                </div>
                            </div>
                        ))}

                        {/* New Files */}
                        {files.map((file, index) => {
                            const previewUrl = URL.createObjectURL(file);
                            return (
                                <div key={`new-${index}`} className="relative group aspect-square bg-stone-100 rounded-lg overflow-hidden border-2 border-amber-500 border-dashed">
                                    <img
                                        src={previewUrl}
                                        alt={`Preview ${index}`}
                                        className="w-full h-full object-cover"
                                        onLoad={() => URL.revokeObjectURL(previewUrl)} // Cleanup memory
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(index);
                                            }}
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            title="Retirer la sélection"
                                        >
                                            ✖
                                        </button>
                                    </div>
                                    {/* Badge for new */}
                                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded shadow-sm">
                                        Nouveau
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
