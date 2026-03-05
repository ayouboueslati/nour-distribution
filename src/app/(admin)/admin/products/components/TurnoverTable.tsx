import React from 'react';
import Link from 'next/link';
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '../../../../components/ui';
import { ProductTurnover } from '../../../../../types/inventory';

interface TurnoverTableProps {
    data: ProductTurnover[];
    loading?: boolean;
}

export const TurnoverTable = ({ data, loading }: TurnoverTableProps) => {
    if (loading) {
        return (
            <Card className="p-6">
                <div className="h-6 bg-stone-200 rounded w-48 skeleton mb-4" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-10 bg-stone-100 rounded animate-pulse" />
                    ))}
                </div>
            </Card>
        );
    }

    const getSpeedBadge = (speed: string) => {
        switch (speed) {
            case 'fast':
                return <Badge variant="success" size="sm">Rapide</Badge>;
            case 'medium':
                return <Badge variant="warning" size="sm">Moyen</Badge>;
            case 'slow':
                return <Badge variant="default" size="sm">Lent</Badge>;
            default:
                return null;
        }
    };

    return (
        <Card className="overflow-hidden">
            <div className="p-6 border-b border-stone-200">
                <h3 className="text-lg font-semibold text-stone-800">Analyse de Rotation (Top 5)</h3>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Stock Actuel</TableHead>
                        <TableHead>Ventes (30j)</TableHead>
                        <TableHead>Rotation</TableHead>
                        <TableHead>Vitesse</TableHead>
                        <TableHead>Rupture Estimée</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-stone-500">
                                Aucune donnée de rotation disponible
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow key={item.product_id}>
                                <TableCell>
                                    <div>
                                        <p className="font-medium text-stone-800">{item.product_name}</p>
                                        <p className="text-xs text-stone-500 font-mono">{item.sku}</p>
                                    </div>
                                </TableCell>
                                <TableCell>{item.current_stock}</TableCell>
                                <TableCell>{item.units_sold}</TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        <span className="font-medium">{item.turnover_rate}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>{getSpeedBadge(item.movement_speed)}</TableCell>
                                <TableCell>
                                    {item.days_to_stockout ? (
                                        <span className={`text-sm ${item.days_to_stockout < 7 ? 'text-red-600 font-medium' : 'text-stone-600'}`}>
                                            {item.days_to_stockout} jours
                                        </span>
                                    ) : (
                                        <span className="text-stone-400">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Link
                                        href={`/admin/products/${item.product_id}`}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Voir
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    );
};
