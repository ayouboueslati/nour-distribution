import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker and monitoring systems
 * Returns application health status
 */
export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production'
    });
}
