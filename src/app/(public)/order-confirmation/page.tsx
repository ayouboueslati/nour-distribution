'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Printer } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function OrderConfirmationPage() {
    const [orderInfo, setOrderInfo] = useState<{ number: string; code: string } | null>(null);

    useEffect(() => {
        // Retrieve order info from localStorage
        const number = localStorage.getItem('lastOrderNumber');
        const code = localStorage.getItem('lastVerificationCode');

        if (number && code) {
            setOrderInfo({ number, code });
        }
    }, []);

    if (!orderInfo) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-stone-400" />
                    </div>
                    <h1 className="text-xl font-bold text-stone-900 mb-2">Aucune commande récente</h1>
                    <p className="text-stone-600 mb-6">
                        Il semble que vous n'ayez pas passé de commande récemment ou que les informations aient expiré.
                    </p>
                    <Link href="/products">
                        <Button variant="primary" fullWidth>
                            Retour à la boutique
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Success Card */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="bg-emerald-50 p-8 text-center border-b border-emerald-100">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-emerald-900 mb-2">
                            Commande Confirmée !
                        </h1>
                        <p className="text-emerald-700 text-lg">
                            Merci pour votre confiance. Votre commande a bien été enregistrée.
                        </p>
                    </div>

                    <div className="p-8">
                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                                <p className="text-sm text-stone-500 mb-1">Numéro de commande</p>
                                <p className="text-2xl font-mono font-bold text-stone-900 tracking-wider">
                                    {orderInfo.number}
                                </p>
                            </div>

                            <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                                <p className="text-sm text-stone-500 mb-1">Code de vérification</p>
                                <p className="text-2xl font-mono font-bold text-stone-900 tracking-wider">
                                    {orderInfo.code}
                                </p>
                                <p className="text-xs text-stone-400 mt-2">
                                    Conservez ce code pour suivre votre commande
                                </p>
                            </div>
                        </div>

                        {/* Steps Timeline */}
                        <div className="border-t border-stone-100 pt-8 mb-8">
                            <h3 className="font-semibold text-stone-900 mb-6">Prochaines étapes</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        1
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-stone-900">Validation des prix</h4>
                                        <p className="text-sm text-stone-600 mt-1">
                                            Notre équipe va examiner votre commande et calculer les meilleurs prix pour vous (remises volumétriques, grossiste).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-stone-200 text-stone-500 rounded-full flex items-center justify-center font-bold text-sm">
                                        2
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-stone-900">Envoi du devis</h4>
                                        <p className="text-sm text-stone-600 mt-1">
                                            Vous recevrez un devis détaillé avec les prix finaux et les frais de livraison sous 24h.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-stone-200 text-stone-500 rounded-full flex items-center justify-center font-bold text-sm">
                                        3
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-stone-900">Confirmation & Expédition</h4>
                                        <p className="text-sm text-stone-600 mt-1">
                                            Une fois le devis validé par vos soins, nous expédierons votre commande immédiatement.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/track-order" className="flex-1">
                                <Button variant="secondary" fullWidth className="h-12">
                                    Suivre ma commande
                                </Button>
                            </Link>
                            <Link href="/products" className="flex-1">
                                <Button variant="primary" fullWidth className="h-12">
                                    Continuer mes achats
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="text-center text-sm text-stone-500">
                    Un email récapitulatif a été envoyé à l'adresse fournie.
                </p>
            </div>
        </div>
    );
}
