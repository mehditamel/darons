import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const db = new PGlite();
const ids = ['11111111','22222222','33333333','44444444'].map(x => `${x}-1111-4111-8111-111111111111`);
const [owner, recipient, outsider, unconfirmed] = ids;
const household = 'aaaaaaaa-1111-4111-8111-111111111111';
let checks = 0;
async function check(label, fn) { await fn(); checks++; console.log(`PASS ${label}`); }
async function asUser(id, role = 'authenticated') {
  await db.exec('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id || '']);
  await db.exec(`SET ROLE ${role}`);
}
await db.exec(`
  CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
  CREATE SCHEMA auth;
  CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb DEFAULT '{}');
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
  CREATE TABLE public.profiles(id uuid PRIMARY KEY, email text, first_name text, last_name text, avatar_url text, phone_number text,
    referral_code text, calendar_tokens jsonb, updated_at timestamptz, subscription_plan text DEFAULT 'free', stripe_customer_id text, role text DEFAULT 'owner', is_admin boolean NOT NULL DEFAULT false);
  CREATE TABLE public.households(id uuid PRIMARY KEY, owner_id uuid REFERENCES public.profiles(id));
  CREATE TABLE public.household_members(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), household_id uuid REFERENCES public.households(id),
    user_id uuid REFERENCES public.profiles(id), role text CHECK(role IN ('owner','partner','viewer','nanny')), joined_at timestamptz DEFAULT now(), UNIQUE(household_id,user_id));
  CREATE TABLE public.household_invitations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), household_id uuid REFERENCES public.households(id),
    inviter_id uuid REFERENCES public.profiles(id), invitee_email text, role text CHECK(role IN ('partner','viewer','nanny')),
    token text UNIQUE, status text DEFAULT 'pending', expires_at timestamptz DEFAULT now()+interval '7 days', accepted_at timestamptz, created_at timestamptz DEFAULT now());
  CREATE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
    INSERT INTO public.profiles(id,email,first_name,last_name) VALUES(NEW.id,NEW.email,COALESCE(NEW.raw_user_meta_data->>'first_name',''),COALESCE(NEW.raw_user_meta_data->>'last_name',''));
    RETURN NEW; END $$;
  CREATE FUNCTION public.update_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
  CREATE FUNCTION public.compute_document_status() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$;
  CREATE FUNCTION public.user_household_ids() RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT id FROM public.households WHERE owner_id=auth.uid(); $$;
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  CREATE POLICY own_read ON public.profiles FOR SELECT USING(id=auth.uid());
  CREATE POLICY own_update ON public.profiles FOR UPDATE USING(id=auth.uid());
  ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
  CREATE POLICY own_household ON public.households FOR ALL USING(owner_id=auth.uid());
  ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
  CREATE POLICY recursive_members ON public.household_members FOR SELECT USING(household_id IN (SELECT household_id FROM public.household_members WHERE user_id=auth.uid()));
  CREATE POLICY self_join ON public.household_members FOR INSERT WITH CHECK(user_id=auth.uid());
  GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
`);
for (const [i, id] of ids.entries()) {
  const email = ['owner@example.test','recipient@example.test','outsider@example.test','unconfirmed@example.test'][i];
  await db.query('INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)',[id,email,i===3?null:new Date()]);
  await db.query("INSERT INTO public.profiles(id,email,first_name) VALUES($1,$2,'Test')",[id,email]);
}
await db.query('INSERT INTO public.households VALUES($1,$2)',[household,owner]);
await asUser(outsider);
await db.query("UPDATE public.profiles SET subscription_plan='family_pro' WHERE id=$1",[outsider]);
await check('baseline reproduces writable subscription',async()=>assert.equal((await db.query('SELECT subscription_plan FROM public.profiles')).rows[0].subscription_plan,'family_pro'));
await db.exec('RESET ROLE');
await db.query("UPDATE public.profiles SET subscription_plan='free' WHERE id=$1",[outsider]);
// The project owner's email in an editable profile must not bootstrap an admin.
await db.query("UPDATE public.profiles SET email='mehdi@tamel.fr', is_admin=true WHERE id=$1",[outsider]);
await db.exec(await readFile(new URL('../supabase/migrations/20260912003858_secure_profiles_and_household_invitations.sql',import.meta.url),'utf8'));
await check('legacy self-assigned flag and editable email cannot bootstrap an administrator',async()=>assert.equal((await db.query('SELECT is_admin FROM public.profiles WHERE id=$1',[outsider])).rows[0].is_admin,false));
await db.exec('CREATE TRIGGER create_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); CREATE TRIGGER update_profile BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();');
await check('signup trigger works with fixed search path and ignores privileged metadata',async()=>{
  const id='55555555-1111-4111-8111-111111111111';
  await db.query("INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES($1,'signup@example.test',$2)",[id,JSON.stringify({first_name:'New',is_admin:true,subscription_plan:'family_pro'})]);
  const row=(await db.query('SELECT first_name,is_admin,subscription_plan FROM public.profiles WHERE id=$1',[id])).rows[0];
  assert.deepEqual(row,{first_name:'New',is_admin:false,subscription_plan:'free'});
});

await asUser(outsider);
for (const column of ['subscription_plan','stripe_customer_id','is_admin','role','email']) {
  await check(`profile ${column} cannot be self-assigned`,()=>assert.rejects(db.query(`UPDATE public.profiles SET ${column}=${column} WHERE id=$1`,[outsider]),/permission denied/));
}
await check('own name remains editable',async()=>{await db.query("UPDATE public.profiles SET first_name='Updated' WHERE id=$1",[outsider]);assert.equal((await db.query('SELECT first_name FROM public.profiles')).rows[0].first_name,'Updated');});
await check('other profiles remain invisible',async()=>assert.equal((await db.query('SELECT * FROM public.profiles WHERE id=$1',[owner])).rows.length,0));
await check('profile update trigger still runs',async()=>assert.ok((await db.query('SELECT updated_at FROM public.profiles')).rows[0].updated_at));
await check('members query no longer recurses',async()=>assert.deepEqual((await db.query('SELECT * FROM public.household_members')).rows,[]));
await check('direct household membership rejected',()=>assert.rejects(db.query("INSERT INTO public.household_members(household_id,user_id,role) VALUES($1,$2,'partner')",[household,outsider]),/permission denied/));
await check('non-owner cannot fabricate invitations',()=>assert.rejects(db.query("INSERT INTO public.household_invitations(household_id,inviter_id,invitee_email,role,token) VALUES($1,$2,'outsider@example.test','partner',$3)",[household,outsider,'f'.repeat(64)]),/row-level security/));
await asUser(owner);
const token='a'.repeat(64);
await check('owner can create a seven-day invitation',async()=>{await db.query("INSERT INTO public.household_invitations(household_id,inviter_id,invitee_email,role,token) VALUES($1,$2,'Recipient@Example.Test','viewer',$3)",[household,owner,token]);});
await asUser(outsider);
await check('wrong recipient cannot redeem token',()=>assert.rejects(db.query('SELECT public.accept_household_invitation($1)',[token]),/Invitation introuvable/));
await check('wrong recipient cannot read invitation',async()=>assert.equal((await db.query('SELECT * FROM public.household_invitations')).rows.length,0));
await asUser(recipient);
await check('recipient cannot change invited role',()=>assert.rejects(db.query("UPDATE public.household_invitations SET role='partner' WHERE token=$1",[token]),/permission denied/));
await check('recipient accepts atomically with exact role',async()=>{
  assert.equal((await db.query('SELECT public.accept_household_invitation($1) AS id',[token])).rows[0].id,household);
  assert.equal((await db.query('SELECT role FROM public.household_members')).rows[0].role,'viewer');
  assert.equal((await db.query('SELECT status FROM public.household_invitations')).rows[0].status,'accepted');
});
await check('accepted token cannot be replayed',()=>assert.rejects(db.query('SELECT public.accept_household_invitation($1)',[token]),/Invitation introuvable/));
await check('member cannot promote self',async()=>assert.equal((await db.query("UPDATE public.household_members SET role='partner' RETURNING id")).rows.length,0));
await check('member cannot move membership into another household',()=>assert.rejects(db.query('UPDATE public.household_members SET household_id=household_id'),/permission denied/));
await asUser(owner);
await check('owner can see members without recursion',async()=>assert.equal((await db.query('SELECT * FROM public.household_members')).rows.length,1));
await check('owner can change a member role',async()=>assert.equal((await db.query("UPDATE public.household_members SET role='partner' RETURNING role")).rows[0].role,'partner'));
await check('owner cannot create a second owner role',()=>assert.rejects(db.query("UPDATE public.household_members SET role='owner'"),/row-level security/));
await db.exec('RESET ROLE');
await db.query("INSERT INTO public.household_invitations(household_id,inviter_id,invitee_email,role,token,expires_at) VALUES($1,$2,'outsider@example.test','viewer',$3,now()-interval '1 second')",[household,owner,'b'.repeat(64)]);
await db.query("INSERT INTO public.household_invitations(household_id,inviter_id,invitee_email,role,token) VALUES($1,$2,'unconfirmed@example.test','viewer',$3)",[household,owner,'c'.repeat(64)]);
await asUser(outsider);
await check('expired invitation is rejected',()=>assert.rejects(db.query('SELECT public.accept_household_invitation($1)',['b'.repeat(64)]),/Invitation introuvable/));
await asUser(unconfirmed);
await check('unverified email is rejected',()=>assert.rejects(db.query('SELECT public.accept_household_invitation($1)',['c'.repeat(64)]),/Invitation introuvable/));
await asUser(null,'anon');
await check('anonymous RPC denied',()=>assert.rejects(db.query('SELECT public.accept_household_invitation($1)',[token]),/permission denied/));
await db.exec('RESET ROLE');
await check('RPC failure leaves no membership',async()=>assert.equal((await db.query('SELECT * FROM public.household_members WHERE user_id=$1',[outsider])).rows.length,0));
await check('no public definer entry point remains',async()=>assert.equal((await db.query("SELECT proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prosecdef AND has_function_privilege('authenticated',p.oid,'EXECUTE')")).rows.length,0));
await asUser(null,'service_role');
await check('trusted billing client can still update protected fields',async()=>{
  const result=await db.query("UPDATE public.profiles SET stripe_customer_id='cus_test', subscription_plan='premium' WHERE id=$1 RETURNING subscription_plan",[owner]);
  assert.equal(result.rows[0].subscription_plan,'premium');
});

await db.exec('RESET ROLE');
const trustedAdminMigration = await readFile(new URL('../supabase/migrations/20260912015005_trusted_admin_authorization.sql',import.meta.url),'utf8');
// Reproduce an installation that already applied the former migration without clearing legacy flags.
await db.query('UPDATE public.profiles SET is_admin=true WHERE id=$1',[outsider]);
await db.exec('GRANT UPDATE (is_admin) ON public.profiles TO authenticated');
await db.exec(trustedAdminMigration);
await asUser(outsider);
await check('repair migration clears a pre-existing forged admin flag',async()=>assert.equal((await db.query('SELECT public.is_current_user_admin() AS allowed')).rows[0].allowed,false));
await check('repair migration revokes legacy column-level self-promotion',()=>assert.rejects(db.query('UPDATE public.profiles SET is_admin=true'),/permission denied/));
await asUser(null,'anon');
await check('anonymous admin authorization is denied',()=>assert.rejects(db.query('SELECT public.is_current_user_admin()'),/permission denied/));
await db.exec('RESET ROLE');
await db.query("UPDATE auth.users SET email='mehdi@tamel.fr', email_confirmed_at=NULL WHERE id=$1",[owner]);
await db.exec(trustedAdminMigration);
await asUser(owner);
await check('unconfirmed project-owner email cannot bootstrap admin',async()=>assert.equal((await db.query('SELECT public.is_current_user_admin() AS allowed')).rows[0].allowed,false));
await db.exec('RESET ROLE');
await db.query('UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1',[owner]);
await db.exec(trustedAdminMigration);
await asUser(owner);
await check('verified project owner is authorized after the repair',async()=>assert.equal((await db.query('SELECT public.is_current_user_admin() AS allowed')).rows[0].allowed,true));
await asUser(outsider);
await check('admin authorization never uses another users flag',async()=>assert.equal((await db.query('SELECT public.is_current_user_admin() AS allowed')).rows[0].allowed,false));

await db.close();
console.log(`${checks} database security checks passed`);
