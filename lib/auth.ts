import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { hash, compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getDb } from './db';
import * as schema from '../db/schema';
import { MarketError, parse, sameOrigin } from './validation';
import { localUsernameEmail } from './local-accounts';
export type MarketUser={id:string;name:string;email:string;role:string;location:string;sellerVerified:boolean};
export function publicUser(u:typeof schema.user.$inferSelect):MarketUser { return {id:u.id,name:u.name,email:u.email,role:u.role,location:u.location,sellerVerified:u.sellerVerified}; }
function secret(){
 if(process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET;
 if(process.env.SILICON_DATA_DIR===':memory:') return randomBytes(32).toString('hex');
 const dir=path.resolve(process.env.SILICON_DATA_DIR||'.data/postgres','..'); mkdirSync(dir,{recursive:true}); const file=path.join(dir,'auth-secret');
 if(!existsSync(file)){try{writeFileSync(file,randomBytes(48).toString('hex'),{flag:'wx',mode:0o600});}catch(e){if(!existsSync(file))throw e;}}
 return readFileSync(file,'utf8').trim();
}
let authPromise:ReturnType<typeof createAuth>|undefined;
async function createAuth(){
 const db=await getDb();
 return betterAuth({secret:secret(),baseURL:process.env.BETTER_AUTH_URL||'http://127.0.0.1:8090',trustedOrigins:['http://127.0.0.1:8090','http://localhost:8090','http://127.0.0.1:8092','http://localhost:8092'],database:drizzleAdapter(db,{provider:'pg',schema}),emailAndPassword:{enabled:true,minPasswordLength:8,maxPasswordLength:72,password:{hash:password=>hash(password,12),verify:({hash:stored,password})=>compare(password,stored.replace(/^\$2y\$/,'$2b$'))}},user:{additionalFields:{role:{type:'string',defaultValue:'buyer',input:false},location:{type:'string',defaultValue:'',input:false},sellerVerified:{type:'boolean',defaultValue:false,input:false}}},session:{expiresIn:60*60*24*7,updateAge:60*60*24},advanced:{cookiePrefix:'silicon',useSecureCookies:false}});
}
export function getAuth(){return authPromise??=createAuth();}
export async function currentUser(request:Request):Promise<MarketUser|null>{
 const auth=await getAuth(); const session=await auth.api.getSession({headers:request.headers}); if(!session)return null;
 const db=await getDb(); const [u]=await db.select().from(schema.user).where(eq(schema.user.id,session.user.id)); return u?publicUser(u):null;
}
const password=z.string().min(8).max(72).regex(/[A-Za-z]/,'Include a letter.').regex(/\d/,'Include a number.');
const registration=z.object({name:z.string().trim().min(2).max(100),email:z.string().trim().toLowerCase().email().max(255),password,passwordConfirmation:z.string(),role:z.enum(['buyer','seller']),location:z.string().trim().min(2).max(120)}).refine(x=>x.password===x.passwordConfirmation,{path:['passwordConfirmation'],message:'Passwords must match.'});
const attempts=new Map<string,{count:number;until:number}>();
function throttle(request:Request){const key=request.headers.get('x-forwarded-for')?.split(',')[0]||'local';const now=Date.now();for(const[k,v]of attempts)if(v.until<now)attempts.delete(k); const item=attempts.get(key)||{count:0,until:now+60000}; if(++item.count>30)throw new MarketError(429,'Too many attempts. Please wait a minute.');attempts.set(key,item);}
export async function handleAccount(request:Request,action:string):Promise<Response>{
 try{
 sameOrigin(request); throttle(request); const auth=await getAuth();
 if(action==='logout'){const response=await auth.api.signOut({headers:request.headers,asResponse:true});return Response.json({ok:true},{status:response.status,headers:response.headers});}
 const body=await request.json(); let response:Response; let roleData:z.infer<typeof registration>|undefined;
 if(action==='register'){roleData=parse(registration,body);response=await auth.api.signUpEmail({body:{name:roleData.name,email:roleData.email,password:roleData.password},headers:request.headers,asResponse:true});}
 else if(action==='login'){const data=parse(z.object({email:z.string().trim().toLowerCase().min(1).max(255),password:z.string().min(1).max(72)}),body); const email=localUsernameEmail(data.email,request); if(!z.string().email().safeParse(email).success)throw new MarketError(422,'Enter your email or local test username.'); response=await auth.api.signInEmail({body:{email,password:data.password},headers:request.headers,asResponse:true});}
 else throw new MarketError(404,'Unknown account action.');
 const result=(await response.json()) as { message?: string; user: { id: string } };
 if(!response.ok)return Response.json({error:response.status===401?'Email or password is incorrect.':result.message||'Unable to complete sign-in.'},{status:response.status,headers:response.headers});
 const db=await getDb();
 if(roleData)await db.update(schema.user).set({role:roleData.role,location:roleData.location,updatedAt:new Date()}).where(eq(schema.user.id,result.user.id));
 const [u]=await db.select().from(schema.user).where(eq(schema.user.id,result.user.id));
 return Response.json({user:publicUser(u)},{headers:response.headers});
 }catch(e){if(e instanceof MarketError)return Response.json({error:e.message,fields:e.fields},{status:e.status});if(e instanceof SyntaxError)return Response.json({error:'Send valid JSON.'},{status:400});console.error('Account operation failed',e instanceof Error?e.message:'unknown error');return Response.json({error:'Unable to complete this account request.'},{status:500});}
}
