import { connectDB } from '../config/db.js';
import { fetchUnpaidOrders } from '../services/shopify.js';
import { sendReminderEmail } from '../services/email.js';
const UNPAID_STATUSES = ['PENDING', 'PARTIALLY_PAID'];
const getReminderDate = (dueAtString) => {
    if (!dueAtString) return null;
    const date = new Date(dueAtString);
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
};
// Returns null if a reminder should be sent today, otherwise the reason to skip
export const getSkipReason = (order, today) => {
    if (order.customer?.metafield?.value === 'true') return "customer has 'stopreminder' enabled";
    if (!UNPAID_STATUSES.includes(order.displayFinancialStatus)) return `financial status is ${order.displayFinancialStatus}`;
    if (!(Number(order.totalOutstandingSet?.shopMoney?.amount) > 0)) return 'nothing outstanding';
    const paymentSchedule = order.paymentTerms?.paymentSchedules?.nodes?.[0];
    if (!paymentSchedule?.dueAt) return 'no payment due date';
    if (paymentSchedule.completedAt) return 'payment schedule already completed';
    if (getReminderDate(paymentSchedule.dueAt) !== today) return 'not reminder day';
    return null;
};
export const runReminderJob = async ({ dryRun = process.env.DRY_RUN === 'true', today = new Date().toISOString().split('T')[0] } = {}) => {
    console.log(`🔄 Job Started: Checking for reminders...${dryRun ? ' (DRY RUN - no emails, no DB writes)' : ''}`);
    const sentCollection = dryRun ? null : (await connectDB()).collection('reminders_sent');
    console.log(`📅 Processing for Date: ${today}`);
    let hasNext = true;
    let cursor = null;
    let emailsSentCount = 0;
    const wouldSend = [];
    try {
        while (hasNext) {
            const data = await fetchUnpaidOrders(cursor);
            const { edges, pageInfo } = data;
            for (const edge of edges) {
                const order = edge.node;
                const skipReason = getSkipReason(order, today);
                if (skipReason) {
                    if (skipReason !== 'not reminder day' && skipReason !== 'no payment due date') {
                        console.log(`🚫 Skipping Order ${order.name}: ${skipReason}.`);
                    }
                    continue;
                }
                const emailData = {
                    name: order.name,
                    amount: order.totalOutstandingSet.shopMoney.amount,
                    dueDate: order.paymentTerms.paymentSchedules.nodes[0].dueAt.split('T')[0],
                    customerName: order.customer?.firstName || 'Customer',
                    order_status_url: order.statusPageUrl
                };
                if (dryRun) {
                    console.log(`🧪 Would email ${order.email} for Order ${order.name} (${order.displayFinancialStatus}, £${emailData.amount}, due ${emailData.dueDate})`);
                    wouldSend.push({ ...emailData, email: order.email, status: order.displayFinancialStatus });
                    continue;
                }
                const alreadySent = await sentCollection.findOne({
                    orderId: order.id,
                    date: today
                });
                if (!alreadySent) {
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
            cursor = pageInfo.endCursor;
            hasNext = pageInfo.hasNextPage;
        }
        console.log(`✅ Batch Complete. Emails Sent: ${emailsSentCount}`);
    } catch (err) {
        console.error('🔥 Job Error:', err);
    }
    return wouldSend;
};
