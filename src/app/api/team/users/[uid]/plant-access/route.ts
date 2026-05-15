/**
 * PATCH /api/team/users/[uid]/plant-access
 * Grant or revoke plant module access for a team member (admins/managers only).
 * Updates: can_access_plant_module, plant_role on the target user's profile.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid: targetUid } = await params;
    const idToken = request.headers.get('authorization')?.slice(7) ?? '';
    if (!idToken) return NextResponse.json({ error: 'Authorization required' }, { status: 401 });

    let callerUid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      callerUid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const db = getAdminDb();
    const callerSnap = await db.collection('profiles').doc(callerUid).get();
    if (!callerSnap.exists) return NextResponse.json({ error: 'Profile not found' }, { status: 403 });

    const caller = callerSnap.data()!;
    if (caller.role !== 'admin' && caller.role !== 'manager') {
      return NextResponse.json({ error: 'Only managers and admins can manage plant access' }, { status: 403 });
    }

    // Verify target user belongs to same company
    const targetSnap = await db.collection('profiles').doc(targetUid).get();
    if (!targetSnap.exists || targetSnap.data()!.company_id !== caller.company_id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { can_access_plant_module, plant_role } = await request.json();

    if (typeof can_access_plant_module !== 'boolean') {
      return NextResponse.json({ error: 'can_access_plant_module must be a boolean' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { can_access_plant_module };
    if (plant_role) {
      if (!['inspector', 'viewer'].includes(plant_role)) {
        return NextResponse.json({ error: 'plant_role must be "inspector" or "viewer"' }, { status: 400 });
      }
      updates.plant_role = plant_role;
    }

    await db.collection('profiles').doc(targetUid).update(updates);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/team/users/[uid]/plant-access]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
