export const getReminderHtml = (orderData) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }
    .header { background-color: #f8f8f8; padding: 10px; text-align: center; }
    .content { padding: 20px; }
    .footer { margin-top: 20px; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Payment Reminder</h2>
    </div>
    <div class="content">
      <p>Dear ${orderData.customerName || 'Customer'},</p>
      <p>This is a friendly reminder regarding your order <strong>${orderData.name}</strong>.</p>
      
      <p>
        <strong>Amount Due:</strong> ${orderData.amount}<br>
        <strong>Due Date:</strong> ${orderData.dueDate}
      </p>

      <p>Please arrange for payment at your earliest convenience to avoid any service interruptions.</p>
      
      <p>If you have already made this payment, please disregard this notice.</p>
    </div>
    <div class="footer">
      <p>Oldacre Team | info@flowerstation.co.uk</p>
    </div>
  </div>
</body>
</html>
  `;
};