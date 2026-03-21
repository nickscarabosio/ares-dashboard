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
    const clients: any[] = [];
    const vaultPath = path.join(process.env.HOME || '/', 'casper-oc-memory');
    const clientsDir = path.join(vaultPath, 'Active Clients');

    if (!fs.existsSync(clientsDir)) {
      return NextResponse.json([]);
    }

    const folders = fs.readdirSync(clientsDir).filter(f => !f.startsWith('.'));

    folders.forEach((folder) => {
      const mapPath = path.join(clientsDir, folder, 'MAP.md');
      if (fs.existsSync(mapPath)) {
        try {
          const content = fs.readFileSync(mapPath, 'utf-8');
          const data = parseFrontMatter(content);

          clients.push({
            client_id: data.client_id || folder,
            name: data.name || folder,
            status: data.status || 'prospect',
            mrr: data.mrr || data.revenue || 0,
            revenue: data.revenue || data.mrr || 0,
            last_contact: data.last_contact || null,
            next_action: data.next_action || null,
            contact_email: data.contact_email || data.email || null,
            notes: data.notes || null,
          });
        } catch (error: any) {
          console.error(`Failed to parse ${folder}:`, error.message);
        }
      }
    });

    return NextResponse.json(clients);
  } catch (error: any) {
    console.error('Error reading clients:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
