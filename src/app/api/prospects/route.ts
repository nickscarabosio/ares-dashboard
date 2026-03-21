import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';

function parseFrontMatter(content: string): Record<string, any> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  try {
    return parse(match[1]) || {};
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    const prospects: any[] = [];
    const vaultPath = path.join(process.env.HOME || '/', 'casper-oc-memory');
    const prospectsDir = path.join(vaultPath, 'Prospects');

    if (!fs.existsSync(prospectsDir)) {
      return NextResponse.json([]);
    }

    const folders = fs.readdirSync(prospectsDir).filter(f => !f.startsWith('.'));

    folders.forEach((folder) => {
      const mapPath = path.join(prospectsDir, folder, 'MAP.md');
      if (fs.existsSync(mapPath)) {
        try {
          const content = fs.readFileSync(mapPath, 'utf-8');
          const data = parseFrontMatter(content);

          prospects.push({
            prospect_id: data.prospect_id || folder,
            name: data.name || folder,
            company: data.company || null,
            deal_size: data.deal_size || 0,
            stage: data.stage || 'inquiry',
            contact_email: data.contact_email || data.email || null,
            contact_person: data.contact_person || null,
            close_date: data.close_date || null,
            notes: data.notes || null,
          });
        } catch (error: any) {
          console.error(`Failed to parse prospect ${folder}:`, error.message);
        }
      }
    });

    return NextResponse.json(prospects);
  } catch (error: any) {
    console.error('Error reading prospects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
