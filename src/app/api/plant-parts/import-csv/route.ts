/**
 * POST /api/plant-parts/import-csv
 * Upload a CSV of parts (name, category, description) and bulk-insert them.
 * Expects multipart/form-data with a "file" field.
 * Managers and admins only.
 *
 * CSV format (header row required):
 *   name,category,description
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { PLANT_MODULE_DEV_MODE } from '@/lib/plantModeDev';
import { FieldValue } from 'firebase-admin/firestore';

function parseCSV(text: string): Array<{ name: string; category: string; description: string }> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf('name');
  const catIdx = headers.indexOf('category');
  const descIdx = headers.indexOf('description');

  if (nameIdx === -1) return [];

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    return {
      name: cols[nameIdx] ?? '',
      category: catIdx !== -1 ? (cols[catIdx] ?? '') : '',
      description: descIdx !== -1 ? (cols[descIdx] ?? '') : '',
    };
  }).filter((r) => r.name);
}

export async function POST(request: NextRequest) {
  try {
    const idToken = request.headers.get('authorization')?.slice(7) ?? '';
    if (!idToken) return NextResponse.json({ error: 'Authorization required' }, { status: 401 });

    let uid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const db = getAdminDb();
    const profileSnap = await db.collection('profiles').doc(uid).get();
    if (!profileSnap.exists) return NextResponse.json({ error: 'Profile not found' }, { status: 403 });

    const profile = profileSnap.data()!;
    const { company_id: companyId, role } = profile;

    if (role !== 'admin' && role !== 'manager') {
      return NextResponse.json({ error: 'Only managers and admins can import parts' }, { status: 403 });
    }

    if (!PLANT_MODULE_DEV_MODE) {
      const orgSnap = await db.collection('organisations').doc(companyId).get();
      if (!orgSnap.exists || !orgSnap.data()?.has_plant_module) {
        return NextResponse.json({ error: 'Plant module not active' }, { status: 403 });
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!file.name.endsWith('.csv')) return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    if (file.size > 500_000) return NextResponse.json({ error: 'CSV file must be under 500 KB' }, { status: 400 });

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows found. Ensure CSV has a "name" column.' }, { status: 400 });
    }
    if (rows.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 parts per import' }, { status: 400 });
    }

    const batch = db.batch();
    const now = FieldValue.serverTimestamp();
    for (const row of rows) {
      const ref = db.collection('plant_parts').doc();
      batch.set(ref, {
        company_id: companyId,
        name: row.name,
        category: row.category || null,
        description: row.description || null,
        applicable_categories: [],
        created_at: now,
        created_by: uid,
      });
    }
    await batch.commit();

    return NextResponse.json({ imported: rows.length }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/plant-parts/import-csv]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
