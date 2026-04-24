import { Webhook } from 'svix';
import { headers } from 'next/headers';
import supabase from '@/lib/supabase';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Get svix headers for signature verification
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get raw body
  const payload = await req.text();

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let event;

  try {
    event = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response('Invalid signature', { status: 400 });
  }

  const { type, data } = event;
  console.log('📥 Clerk webhook received:', type);

  if (type === 'user.created') {
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      image_url,
      created_at,
    } = data;

    const email = email_addresses?.[0]?.email_address ?? null;

    const { error } = await supabase.from('users').insert({
      clerk_id: id,
      email,
      first_name: first_name ?? null,
      last_name: last_name ?? null,
      avatar_url: image_url ?? null,
      created_at: new Date(created_at).toISOString(),
    });

    if (error) {
      console.error('❌ Failed to insert user into Supabase:', error.message);
      return new Response('Database error', { status: 500 });
    }

    console.log('✅ User saved to Supabase:', id, email);
  }

  return new Response('OK', { status: 200 });
}
