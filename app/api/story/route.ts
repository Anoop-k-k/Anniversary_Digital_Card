import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "story.json");

function getStoryData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading story.json:", error);
  }
  return null;
}

function saveStoryData(data: unknown) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = getStoryData();
  if (!data) {
    return NextResponse.json({ error: "Story data not found" }, { status: 440 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.storyItems) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    saveStoryData(body);
    return NextResponse.json({ success: true, message: "Story items saved successfully!", data: body });
  } catch (error) {
    console.error("Failed to save story data:", error);
    return NextResponse.json({ error: "Failed to save story data" }, { status: 500 });
  }
}
