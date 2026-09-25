import crypto from 'node:crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import webpush from 'web-push';

function database() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
  if (!serviceAccount.project_id || !serviceAccount.private_key) throw new Error('Push server is not configured');
  if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
  return getFirestore();
}

function configurePush() {
  const publicKey = process.env.PUSH_VAPID_PUBLIC_KEY;
  const privateKey = process.env.PUSH_VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) throw new Error('Push keys are not configured');
  webpush.setVapidDetails('mailto:' + (process.env.PUSH_CONTACT_EMAIL || 'admin@rums-app.vercel.app'), publicKey, privateKey);
}

const deviceId = (endpoint) => crypto.createHash('sha256').update(endpoint).digest('hex');
const accountFingerprint = (user) => crypto.createHash('sha256').update(`${user.username}:${user.password}`).digest('hex');

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Use POST' });
  try {
    configurePush();
    const db = database();
    const { action, username, password, subscription, endpoint, activityIds } = request.body || {};
    if (action === 'subscribe') {
      if (typeof username !== 'string' || typeof password !== 'string' || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) return response.status(400).json({ error: 'Missing subscription details' });
      const users = JSON.parse((await db.doc('shared/rums-users').get()).data()?.value || '[]');
      const user = users.find((item) => item.username === username && item.password === password);
      if (!user) return response.status(401).json({ error: 'Wrong password' });
      await db.collection('push_devices').doc(deviceId(subscription.endpoint)).set({ username: user.username, accountFingerprint: accountFingerprint(user), subscription: { endpoint: subscription.endpoint, keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth } }, updatedAt: Date.now() });
      return response.status(200).json({ ok: true });
    }
    if (action === 'unsubscribe') {
      if (typeof endpoint !== 'string' || !endpoint.startsWith('https://')) return response.status(400).json({ error: 'Missing endpoint' });
      await db.collection('push_devices').doc(deviceId(endpoint)).delete();
      return response.status(200).json({ ok: true });
    }
    if (action === 'notify') {
      if (!Array.isArray(activityIds) || activityIds.length > 20) return response.status(400).json({ error: 'Invalid activities' });
      const activities = JSON.parse((await db.doc('shared/rums-plaza-plus').get()).data()?.value || '{}').activities || [];
      const users = JSON.parse((await db.doc('shared/rums-users').get()).data()?.value || '[]');
      for (const id of activityIds) {
        if (typeof id !== 'string' || id.length > 120) continue;
        const activity = activities.find((item) => item.id === id);
        if (!activity?.targetUser || activity.targetUser === activity.actor) continue;
        // A transaction prevents repeated requests from sending the same event twice.
        const sentRef = db.collection('push_sent').doc(deviceId(id));
        const fresh = await db.runTransaction(async (transaction) => {
          if ((await transaction.get(sentRef)).exists) return false;
          transaction.create(sentRef, { at: Date.now() });
          return true;
        });
        if (!fresh) continue;
        const devices = await db.collection('push_devices').where('username', '==', activity.targetUser).get();
        const isChat = activity.type === 'message';
        const payload = JSON.stringify({ title: isChat ? 'New chat message' : 'New on RUMS Plaza', body: isChat ? `${activity.actor} sent you a message` : activity.text || 'You have new activity.', url: isChat ? '/?notification=chat' : '/?notification=plazaPlus', tag: `rums-${id}` });
        await Promise.all(devices.docs.map(async (device) => {
          const owner = users.find((user) => user.username === device.data().username);
          if (!owner || device.data().accountFingerprint !== accountFingerprint(owner)) { await device.ref.delete(); return; }
          try { await webpush.sendNotification(device.data().subscription, payload, { TTL: 86400 }); }
          catch (error) { if (error.statusCode === 404 || error.statusCode === 410) await device.ref.delete(); else console.error('Push delivery failed', error.statusCode || error); }
        }));
      }
      return response.status(200).json({ ok: true });
    }
    return response.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('Push request failed', error);
    return response.status(503).json({ error: 'Device notifications are unavailable right now' });
  }
}
