import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ANALYTICS_FILE = path.join(process.cwd(), "data", "popup-analytics.json");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, timestamp = Date.now(), path: currentPath } = body;

    const logEntry = {
      event,
      timestamp,
      path: currentPath,
      userAgent: req.headers.get("user-agent") || "",
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    };

    // Read or init analytics
    let logs: any[] = [];
    try {
      if (fs.existsSync(ANALYTICS_FILE)) {
        logs = JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf8"));
      }
    } catch {
      logs = [];
    }

    logs.push(logEntry);
    // Keep last 1,000 events
    if (logs.length > 1000) logs = logs.slice(-1000);

    try {
      if (!fs.existsSync(path.dirname(ANALYTICS_FILE))) {
        fs.mkdirSync(path.dirname(ANALYTICS_FILE), { recursive: true });
      }
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(logs, null, 2), "utf8");
    } catch {
      // In read-only environments, accept gracefully
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    let logs: any[] = [];
    if (fs.existsSync(ANALYTICS_FILE)) {
      logs = JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf8"));
    }
    const counts = {
      shown: logs.filter((l) => l.event === "popup_shown").length,
      clicked: logs.filter((l) => l.event === "popup_clicked").length,
      closed: logs.filter((l) => l.event === "popup_closed").length,
      recent: logs.slice(-20),
    };
    return NextResponse.json({ success: true, counts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

