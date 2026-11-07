import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DEFAULT_POPUP_CONFIG, AntiTarnishPopupConfig } from "@/lib/antiTarnishConfig";

const CONFIG_FILE = path.join(process.cwd(), "data", "anti-tarnish-popup.json");

function getStoredConfig(): AntiTarnishPopupConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf8");
      return { ...DEFAULT_POPUP_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_POPUP_CONFIG;
}

export async function GET() {
  const config = getStoredConfig();
  return NextResponse.json({ success: true, config });
}

export async function POST(req: NextRequest) {
  try {
    const newConfig = await req.json();
    const merged = { ...getStoredConfig(), ...newConfig };

    try {
      if (!fs.existsSync(path.dirname(CONFIG_FILE))) {
        fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
      }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), "utf8");
    } catch {
      // In read-only fallback, accept
    }

    return NextResponse.json({ success: true, config: merged });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

