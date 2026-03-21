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
    const agents: any[] = [];
    const vaultPath = path.join(process.env.HOME || '/', 'casper-oc-memory');
    const agentsDir = path.join(vaultPath, 'Agents');

    if (!fs.existsSync(agentsDir)) {
      return NextResponse.json([]);
    }

    const folders = fs.readdirSync(agentsDir).filter(f => !f.startsWith('.'));

    folders.forEach((folder) => {
      const agentPath = path.join(agentsDir, folder, 'agent.md');
      if (fs.existsSync(agentPath)) {
        try {
          const content = fs.readFileSync(agentPath, 'utf-8');
          const data = parseFrontMatter(content);

          agents.push({
            name: data.name || folder,
            status: data.status || 'idle',
            task_count: data.task_count || 0,
            last_activity: data.last_activity || null,
            avatar_color: data.avatar_color || 'hsl(0, 0%, 50%)',
          });
        } catch (error: any) {
          console.error(`Failed to parse agent ${folder}:`, error.message);
        }
      }
    });

    return NextResponse.json(agents);
  } catch (error: any) {
    console.error('Error reading agents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
