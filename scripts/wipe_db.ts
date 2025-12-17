
import { db } from '@/lib/db';
import { account, user, session } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('Deleting all users...');
    await db.delete(session);
    await db.delete(account);
    await db.delete(user);
    console.log('Done.');
    process.exit(0);
}
main();

