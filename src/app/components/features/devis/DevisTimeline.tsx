'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    FilePlus,
    CheckCircle,
    FileCheck,
    XCircle,
    Clock,
    User
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { apiService } from '../../../lib/api';
import { DevisTimelineResponse, TimelineEvent, TimelineEventType } from '../../../../types/devis';

interface DevisTimelineProps {
    orderId: string;
}

export const DevisTimeline: React.FC<DevisTimelineProps> = ({ orderId }) => {
    const [timelineData, setTimelineData] = useState<DevisTimelineResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTimeline();
    }, [orderId]);

    const loadTimeline = async () => {
        try {
            setLoading(true);
            const response = await apiService.getOrderDevisTimeline(orderId);
            setTimelineData(response);
        } catch (error) {
            console.error('Error loading timeline:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventIcon = (eventType: TimelineEventType) => {
        switch (eventType) {
            case 'created':
                return FileText;
            case 'version_created':
                return FilePlus;
            case 'accepted':
                return CheckCircle;
            case 'converted_to_facture':
                return FileCheck;
            case 'cancelled':
                return XCircle;
            default:
                return FileText;
        }
    };

    const getEventColor = (eventType: TimelineEventType) => {
        switch (eventType) {
            case 'created':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-600',
                    border: 'border-blue-200'
                };
            case 'version_created':
                return {
                    bg: 'bg-orange-100',
                    text: 'text-orange-600',
                    border: 'border-orange-200'
                };
            case 'accepted':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-600',
                    border: 'border-green-200'
                };
            case 'converted_to_facture':
                return {
                    bg: 'bg-purple-100',
                    text: 'text-purple-600',
                    border: 'border-purple-200'
                };
            case 'cancelled':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-600',
                    border: 'border-red-200'
                };
            default:
                return {
                    bg: 'bg-stone-100',
                    text: 'text-stone-600',
                    border: 'border-stone-200'
                };
        }
    };

    const getEventTitle = (eventType: TimelineEventType) => {
        switch (eventType) {
            case 'created':
                return 'Devis créé';
            case 'version_created':
                return 'Nouvelle version créée';
            case 'accepted':
                return 'Devis accepté';
            case 'converted_to_facture':
                return 'Converti en facture';
            case 'cancelled':
                return 'Devis annulé';
            default:
                return 'Événement';
        }
    };

    const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
        const s = status?.toLowerCase();
        if (s === 'brouillon' || s === 'draft') return 'default';
        if (s === 'en_attente' || s === 'pending') return 'warning';
        if (s === 'accepte' || s === 'accepted') return 'success';
        if (s === 'facture' || s === 'invoiced') return 'info';
        if (s === 'annule' || s === 'cancelled') return 'danger';
        return 'default';
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' DT';
    };

    // Group events by devis number
    const groupedEvents = timelineData?.events.reduce((acc, event) => {
        const key = event.devis_number;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(event);
        return acc;
    }, {} as Record<string, TimelineEvent[]>) || {};

    if (loading) {
        return (
            <Card>
                <div className="p-6">
                    <div className="animate-pulse space-y-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 bg-stone-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-stone-200 rounded w-1/4"></div>
                                    <div className="h-3 bg-stone-100 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    if (!timelineData || timelineData.total_events === 0) {
        return (
            <Card>
                <div className="p-12 text-center">
                    <Clock className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">Aucun événement</h3>
                    <p className="text-stone-600">
                        Aucun événement n'est disponible pour cette commande.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-bold text-stone-900">Chronologie des Devis</h2>
                    <Badge variant="info" size="md">
                        {timelineData.total_events} {timelineData.total_events > 1 ? 'événements' : 'événement'}
                    </Badge>
                </div>

                <div className="space-y-8">
                    {Object.entries(groupedEvents).map(([devisNumber, events], groupIndex) => (
                        <div key={devisNumber}>
                            {/* Devis Group Header */}
                            <div className="mb-4 pb-2 border-b-2 border-stone-200">
                                <h3 className="text-lg font-semibold text-stone-900">
                                    {devisNumber}
                                </h3>
                            </div>

                            {/* Timeline for this devis */}
                            <div className="relative border-l-2 border-stone-200 ml-5 space-y-8 pb-4">
                                {events.map((event, eventIndex) => {
                                    const Icon = getEventIcon(event.event_type);
                                    const colors = getEventColor(event.event_type);
                                    const isLast = eventIndex === events.length - 1 && groupIndex === Object.keys(groupedEvents).length - 1;

                                    return (
                                        <div key={`${event.devis_id}-${eventIndex}`} className="relative pl-8">
                                            {/* Timeline Node */}
                                            <span
                                                className={`absolute -left-[17px] ${colors.bg} ${colors.text} rounded-full p-2 border-4 border-white shadow-sm`}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </span>

                                            {/* Event Content */}
                                            <div className={`bg-white border ${colors.border} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-stone-900">
                                                            {getEventTitle(event.event_type)}
                                                        </h4>
                                                        <p className="text-sm text-stone-800 font-medium mt-1">
                                                            {event.description}
                                                        </p>
                                                    </div>
                                                    <Badge variant={getStatusColor(event.status)} size="sm">
                                                        v{event.version}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-stone-100">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="w-4 h-4 text-stone-700" />
                                                        <span className="text-stone-800 font-medium">
                                                            {formatTimestamp(event.timestamp)}
                                                        </span>
                                                    </div>

                                                    {event.changed_by_name && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="w-4 h-4 text-stone-700" />
                                                            <span className="text-stone-800 font-medium">
                                                                {event.changed_by_name}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="text-sm font-semibold text-stone-900">
                                                        Montant: {formatAmount(event.total_amount)}
                                                    </div>

                                                    {event.action_details?.old_value && event.action_details?.new_value && (
                                                        <div className="text-sm text-stone-800">
                                                            <span className="line-through text-stone-500">
                                                                {event.action_details.old_value}
                                                            </span>
                                                            {' → '}
                                                            <span className="font-bold text-stone-900">
                                                                {event.action_details.new_value}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};
