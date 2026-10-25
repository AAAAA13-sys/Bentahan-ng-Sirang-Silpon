import { currentUser } from '../../../lib/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){return Response.json({user:await currentUser(request)},{headers:{'Cache-Control':'no-store'}});}
