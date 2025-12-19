import { connectDB } from '../config/db.js';
import { fetchUnpaidOrders } from '../services/shopify.js';
import { sendReminderEmail } from '../services/email.js';
const getReminderDate = (dueAtString) => {
    if (!dueAtString) return null;
    const date = new Date(dueAtString);
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
};
export const runReminderJob = async () => {
    console.log('🔄 Job Started: Checking for reminders...');
    const db = await connectDB();
    const sentCollection = db.collection('reminders_sent');
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Processing for Date: ${today}`);
    let hasNext = true;
    let cursor = null;
    let emailsSentCount = 0;
    try {
        while (hasNext) {
            const data = await fetchUnpaidOrders(cursor);
            const { edges, pageInfo } = data;
            for (const edge of edges) {
                const order = edge.node;
                const stopReminder = order.customer?.metafield?.value === 'true';
                if (stopReminder) {
                    console.log(`🚫 Skipping Order ${order.name}: Customer has 'stopreminder' enabled.`);
                    continue;
                }
                const paymentSchedule = order.paymentTerms?.paymentSchedules?.nodes?.[0];
                if (paymentSchedule?.dueAt) {
                    const reminderTargetDate = getReminderDate(paymentSchedule.dueAt);
                    const rawDueDate = paymentSchedule.dueAt.split('T')[0];
                    if (reminderTargetDate === today) {
                        const alreadySent = await sentCollection.findOne({
                            orderId: order.id,
                            date: today
                        });
                        if (!alreadySent) {
                            const emailData = {
                                name: order.name,
                                amount: order.currentSubtotalPriceSet?.shopMoney?.amount,
                                dueDate: rawDueDate,
                                customerName: order.customer?.firstName || 'Customer',
                                order_status_url: order.statusPageUrl
                            };
                            const success = await sendReminderEmail(order.email, emailData);
                            if (success) {
                                await sentCollection.insertOne({
                                    orderId: order.id,
                                    email: order.email,
                                    date: today,
                                    status: 'sent',
                                    createdAt: new Date()
                                });
                                emailsSentCount++;
                            }
                        }
                    }
                }
            }
            cursor = pageInfo.endCursor;
            hasNext = pageInfo.hasNextPage;
        }
        console.log(`✅ Batch Complete. Emails Sent: ${emailsSentCount}`);
    } catch (err) {
        console.error('🔥 Job Error:', err);
    }
};