import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { teams, users, teamMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentPhase } from "@/lib/competition-config";

interface MemberPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  grade: string;
  photoUrl: string;
  ktmUrl: string;
  proofFollowUrl: string;
  proofShareUrl: string;
  proofStoryCompeUrl: string;
  proofTwibbonUrl: string;
  isLeader: boolean;
  igAccountLink: string;
}

interface RequestBody {
  compeType: "physics-olympiad" | "science-project" | "industrial-case";
  teamName: string;
  institutionName: string;
  abstractUrl: string;
  members: MemberPayload[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({}, { status: 401 });

    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (dbUser.length === 0) return NextResponse.json({}, { status: 404 });

    const userTeam = await db.select().from(teams).where(eq(teams.userId, dbUser[0].id)).limit(1);
    if (userTeam.length === 0) return NextResponse.json(null, { status: 200 }); 

    const tMembers = await db.select({
      id: teamMembers.id,
      teamId: teamMembers.teamId,
      fullName: teamMembers.fullName,
      email: teamMembers.email,
      phoneNumber: teamMembers.phoneNumber,
      grade: teamMembers.grade,
      photoUrl: teamMembers.photoUrl,
      ktmUrl: teamMembers.ktmUrl,
      proofFollowUrl: teamMembers.proofFollowUrl,
      proofShareUrl: teamMembers.proofShareUrl,
      proofStoryCompeUrl: teamMembers.proofStoryCompeUrl,
      proofTwibbonUrl: teamMembers.proofTwibbonUrl,
      igAccountLink: teamMembers.igAccountLink,
      isLeader: teamMembers.isLeader,
    }).from(teamMembers).where(eq(teamMembers.teamId, userTeam[0].id));
    
    return NextResponse.json({
      team: userTeam[0],
      members: tMembers
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: "Access denied." }, { status: 401 });

    const body = (await req.json()) as RequestBody;
    const { compeType, teamName, institutionName, abstractUrl, members } = body;

    if (!compeType || !teamName || !institutionName || members.length === 0) {
      return NextResponse.json({ error: "All essential fields are required!" }, { status: 400 });
    }

    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    const userId = dbUser[0].id;

    const existingTeam = await db.select().from(teams).where(eq(teams.userId, userId)).limit(1);
    
    let targetTeamId = "";
    const activePhase = getCurrentPhase();

    if (existingTeam.length > 0) {
      if (existingTeam[0].compeType === "science-project" || existingTeam[0].compeType === "industrial-case") {
         return NextResponse.json({ error: "Data SPC dan ICC telah dikunci permanen setelah registrasi." }, { status: 403 });
      }
      
      if (existingTeam[0].statusPayment !== "unpaid") {
        return NextResponse.json({ error: "Data cannot be edited because payment is processed!" }, { status: 403 });
      }

      const isSwitchingCompe = existingTeam[0].compeType !== compeType;
      
      await db.update(teams).set({
        teamName,
        institutionName,
        compeType,
        abstractUrl: isSwitchingCompe ? null : (abstractUrl || existingTeam[0].abstractUrl),
        abstractStatus: isSwitchingCompe ? "waiting" : existingTeam[0].abstractStatus,
        caseChoice: isSwitchingCompe ? null : existingTeam[0].caseChoice
      }).where(eq(teams.id, existingTeam[0].id));
      
      targetTeamId = existingTeam[0].id;
      await db.delete(teamMembers).where(eq(teamMembers.teamId, targetTeamId));
    } else {
      const newTeam = await db.insert(teams).values({
        userId, 
        teamName, 
        institutionName, 
        compeType, 
        registrationPhase: activePhase, 
        abstractUrl: abstractUrl || null,
        abstractStatus: "waiting"
      }).returning({ id: teams.id });
      targetTeamId = newTeam[0].id;
    }

    for (const member of members) {
      if (member.fullName.trim() !== "") {
        await db.insert(teamMembers).values({
          teamId: targetTeamId,
          fullName: member.fullName,
          email: member.email,
          phoneNumber: member.phoneNumber,
          grade: member.grade,
          photoUrl: member.photoUrl,
          ktmUrl: member.ktmUrl, 
          proofFollowUrl: member.proofFollowUrl,
          proofShareUrl: member.proofShareUrl,
          proofStoryCompeUrl: member.proofStoryCompeUrl,
          proofTwibbonUrl: member.proofTwibbonUrl,
          igAccountLink: member.igAccountLink,          
          isLeader: member.isLeader,
        });
      }
    }

    return NextResponse.json({ message: "Data successfully saved!" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Teams POST Error:", error);
    return NextResponse.json({ error: "Server error occurred." }, { status: 500 });
  }
}