import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { getDb } from './db';
import { user, account, listing } from '../db/schema';
export const localAccounts=[{username:'user1',role:'buyer',name:'Local Buyer'},{username:'user2',role:'seller',name:'Local Seller'},{username:'user3',role:'admin',name:'Local Admin'}] as const;
export function localUsernameEmail(value:string,request:Request){
 if(!process.env.DATABASE_URL && ['127.0.0.1','localhost','[::1]'].includes(new URL(request.url).hostname) && /^user[1-3]$/.test(value)) return value+'@local.silicon.test';
 return value;
}
export async function seedLocalAccounts(){
 if(process.env.DATABASE_URL) return false;
 const db=await getDb();const password=await hash('1234',12);
 await db.transaction(async tx=>{
 for(const item of localAccounts){
 const id='local-'+item.username;
 await tx.insert(user).values({id,name:item.name,email:item.username+'@local.silicon.test',role:item.role,location:'Pasig City',sellerVerified:item.role==='seller'}).onConflictDoNothing();
 const [existing]=await tx.select().from(user).where(eq(user.id,id));
 if(!existing || existing.email!==item.username+'@local.silicon.test')throw new Error('Local test account identifier is already in use.');
 await tx.insert(account).values({id:id+'-credential',accountId:id,providerId:'credential',userId:id,password}).onConflictDoNothing();
 }
 const [sample]=await tx.select({id:listing.id}).from(listing).where(eq(listing.sellerId,'local-user2')).limit(1);
 if(!sample)await tx.insert(listing).values({sellerId:'local-user2',title:'Local test iPhone donor board',brand:'Apple',model:'iPhone 12',category:'Donor boards',condition:'For harvesting',description:'Local testing component for practicing the buyer and seller reservation workflow.',diagnostics:'Visual inspection complete. This listing is for local workflow testing.',priceCentavos:12500,quantity:20,minimumQuantity:1,art:'board'});
 });
 return true;
}
