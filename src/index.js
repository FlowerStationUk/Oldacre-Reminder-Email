import cron from 'node-cron';
import { runReminderJob } from './jobs/dailyReminder.js';
console.log('🚀 Service Started: Oldacre Reminder System');
console.log('⏰ Scheduler Active: Waiting for 12:00 PM...');
cron.schedule('0 12 * * *', async () => {
    try {
        await runReminderJob();
    } catch (error) {
        console.error('❌ CRON FAILED:', error);
    }
});
console.log('✅ Checking server current time:', new Date().toLocaleString());