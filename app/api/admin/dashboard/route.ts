import { NextRequest, NextResponse } from 'next/server';

import { requireStaff } from '@/lib/auth/guard';
import { AdminDashboardService } from '@/lib/services/adminDashboardService';

export async function GET(request: NextRequest) {
  // -----------------------------------------------------------
  // Authenticate admin/staff
  // -----------------------------------------------------------
  const auth =
    await requireStaff(request);

  if ('error' in auth) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: auth.error,
      },
      {
        status: auth.status,
      }
    );
  }

  try {
    const dashboard =
      await AdminDashboardService.getDashboard();

    return NextResponse.json({
      success: true,

      data: dashboard,

      error: null,
    });
  } catch (error:any) {
    console.error(
      'Admin dashboard API error:',
      error
    );

    return NextResponse.json(
      {
        success: false,

        data: null,

        error: {
          code:
            'ADMIN_DASHBOARD_FETCH_FAILED',

          message:
            'Failed to load admin dashboard',
        },
      },
      {
        status: 500,
      }
    );
  }
}