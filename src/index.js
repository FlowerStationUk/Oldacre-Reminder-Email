import cron from 'node-cron';
import { runReminderJob } from './jobs/dailyReminder.js';
console.log('🚀 Service Started: Oldacre Reminder System');
console.log('⏰ Scheduler Active: Waiting for 09:00 AM...');
cron.schedule('* * * * *', async () => {
    try {
        await runReminderJob();
    } catch (error) {
        console.error('❌ CRON FAILED:', error);
    }
});