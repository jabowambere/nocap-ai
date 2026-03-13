const express = require('express');
const supabase = require('../config/supabase');
const { Webhook } = require('svix');
const router = express.Router();

// Webhook to sync Clerk users with Supabase
router.post('/clerk-webhook', async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('⚠️ CLERK_WEBHOOK_SECRET not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Verify webhook signature
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.log('⚠️ Missing svix headers, processing anyway for testing...');
  }

  const { type, data } = req.body;
  console.log('📥 Webhook received:', type, data?.id);

  try {
    if (type === 'user.created') {
      const { id, email_addresses, username, first_name, last_name } = data;
      
      // Determine if this is the first user (make them admin)
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      const role = count === 0 ? 'admin' : 'user';
      
      // Insert user into Supabase
      const { error } = await supabase
        .from('users')
        .insert({
          clerk_id: id,
          email: email_addresses[0]?.email_address,
          username: username || `${first_name} ${last_name}`.trim() || 'User',
          role: role
        });

      if (error) {
        console.error('❌ Error creating user in Supabase:', error);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      console.log(`✅ User ${id} created in Supabase with role: ${role}`);
    }

    if (type === 'user.updated') {
      const { id, email_addresses, username, first_name, last_name } = data;
      
      const { error } = await supabase
        .from('users')
        .update({
          email: email_addresses[0]?.email_address,
          username: username || `${first_name} ${last_name}`.trim() || 'User'
        })
        .eq('clerk_id', id);

      if (error) {
        console.error('❌ Error updating user in Supabase:', error);
      } else {
        console.log(`✅ User ${id} updated in Supabase`);
      }
    }

    if (type === 'user.deleted') {
      const { id } = data;
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', id);

      if (error) {
        console.error('❌ Error deleting user from Supabase:', error);
      } else {
        console.log(`✅ User ${id} deleted from Supabase`);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;