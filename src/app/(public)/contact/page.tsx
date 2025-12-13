'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { Button, Card, Input, Textarea } from '../../components/ui';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setLoading(false);
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });

        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
    };

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Hero Section */}
            <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-stone-900 text-white">
                <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-stone-900/90"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                        Contactez <span className="text-amber-500">Nour Distribution</span>
                    </h1>
                    <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto font-light">
                        Une question sur nos produits ? Besoin d'un devis personnalisé ?
                        Notre équipe est à votre écoute pour vous accompagner.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="h-full bg-white/95 backdrop-blur-sm border-stone-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                                        <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
                                        Nos Coordonnées
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4 group">
                                            <div className="w-12 h-12 bg-stone-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                                <Phone className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-stone-500 mb-1">Téléphone</p>
                                                <p className="text-stone-900 font-semibold">+33 1 23 45 67 89</p>
                                                <p className="text-sm text-stone-500">Lun-Ven, 9h-18h</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group">
                                            <div className="w-12 h-12 bg-stone-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                                <Mail className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-stone-500 mb-1">Email</p>
                                                <p className="text-stone-900 font-semibold">contact@nourdistribution.com</p>
                                                <p className="text-sm text-stone-500">Réponse sous 24h</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group">
                                            <div className="w-12 h-12 bg-stone-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-stone-500 mb-1">Siège Social</p>
                                                <p className="text-stone-900 font-semibold">123 Avenue des Champs-Élysées</p>
                                                <p className="text-stone-900">75008 Paris, France</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-stone-100">
                                    <h4 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-500" />
                                        Horaires d'ouverture
                                    </h4>
                                    <ul className="space-y-2 text-sm text-stone-600">
                                        <li className="flex justify-between">
                                            <span>Lundi - Vendredi</span>
                                            <span className="font-medium text-stone-900">09:00 - 18:00</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Samedi</span>
                                            <span className="font-medium text-stone-900">10:00 - 15:00</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="text-red-500">Dimanche</span>
                                            <span className="text-red-500 font-medium">Fermé</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white border-none shadow-xl p-8 relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-stone-900 mb-2">Envoyez-nous un message</h2>
                                <p className="text-stone-500 mb-8">
                                    Remplissez le formulaire ci-dessous et nous vous recontacterons dans les plus brefs délais.
                                </p>

                                {success ? (
                                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-8 text-center animate-fade-in py-12">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Message envoyé !</h3>
                                        <p>Merci de nous avoir contactés. Nous reviendrons vers vous très bientôt.</p>
                                        <Button
                                            variant="ghost"
                                            className="mt-6 text-green-700 hover:text-green-800 hover:bg-green-100"
                                            onClick={() => setSuccess(false)}
                                        >
                                            Envoyer un autre message
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Nom complet"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Votre nom"
                                                required
                                                className="bg-stone-50 border-transparent focus:bg-white focus:border-amber-500 transition-all duration-300"
                                            />
                                            <Input
                                                label="Adresse email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="vous@exemple.com"
                                                required
                                                className="bg-stone-50 border-transparent focus:bg-white focus:border-amber-500 transition-all duration-300"
                                            />
                                        </div>

                                        <Input
                                            label="Sujet"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="L'objet de votre demande"
                                            required
                                            className="bg-stone-50 border-transparent focus:bg-white focus:border-amber-500 transition-all duration-300"
                                        />

                                        <Textarea
                                            label="Message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="En quoi pouvons-nous vous aider ?"
                                            rows={6}
                                            required
                                            className="bg-stone-50 border-transparent focus:bg-white focus:border-amber-500 transition-all duration-300"
                                        />

                                        <div className="flex items-center justify-end pt-4">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                disabled={loading}
                                                className="bg-amber-600 hover:bg-amber-700 text-white border-none rounded-lg px-8 shadow-lg hover:shadow-amber-500/20 transition-all w-full sm:w-auto"
                                            >
                                                {loading ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                        Envoi en cours...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        Envoyer le message
                                                        <Send className="w-4 h-4" />
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Map Section (Placeholder) */}
                <section className="mt-16">
                    <Card className="p-0 overflow-hidden shadow-lg h-[400px] relative bg-stone-200 flex items-center justify-center group">
                        {/* Use an actual iframe if address is real, otherwise a placeholder styled nicely */}
                        <div className="absolute inset-0 bg-[url('/images/map-placeholder.jpg')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700"></div>
                        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-all duration-500"></div>

                        <div className="relative z-10 bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-lg text-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                            <MapPin className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                            <p className="font-bold text-stone-900">Nous trouver</p>
                            <p className="text-sm text-stone-600">123 Avenue des Champs-Élysées, Paris</p>
                            <Button variant="ghost" size="sm" className="mt-2 text-amber-600 hover:text-amber-700">
                                Voir sur Google Maps
                            </Button>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}
