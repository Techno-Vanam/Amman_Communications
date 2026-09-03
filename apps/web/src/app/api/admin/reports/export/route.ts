import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '@/lib/server-api';
import { getAccessToken } from '@/lib/server-auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'pdf';

    const backendPath = format === 'excel' ? '/admin/reports/export/excel' : '/admin/reports/export/pdf';
    
    // Clean params for backend
    const backendParams = new URLSearchParams();
    searchParams.forEach((val, key) => {
      if (key !== 'format' && val && val !== 'ALL') {
        backendParams.append(key, val);
      }
    });

    const queryString = backendParams.toString();
    const endpoint = queryString ? `${backendPath}?${queryString}` : backendPath;

    // Retrieve token from request cookies, getAccessToken helper, or cookies() store
    const token =
      req.cookies.get('access_token')?.value ||
      (await getAccessToken()) ||
      (await cookies()).get('access_token')?.value;

    const authHeaders: Record<string, string> = {};
    if (token) {
      authHeaders['Authorization'] = `Bearer ${token}`;
    }

    const res = await serverApiFetch(endpoint, {
      headers: authHeaders,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`Export backend error [status ${res.status}]:`, errText);
      return new NextResponse(`Export failed: ${res.statusText}`, { status: res.status });
    }

    const contentType =
      format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `amman-communications-report-${dateStr}.${format === 'excel' ? 'xlsx' : 'pdf'}`;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error: any) {
    console.error('Export route error:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
