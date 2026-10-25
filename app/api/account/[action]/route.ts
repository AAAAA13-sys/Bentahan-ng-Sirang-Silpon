import { handleAccount } from '../../../../lib/auth';
export const runtime='nodejs';
export async function POST(request:Request,context:{params:Promise<{action:string}>}){return handleAccount(request,(await context.params).action);}
