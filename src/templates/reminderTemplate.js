export const getReminderHtml = (orderData) => {
  const [year, month, day] = orderData.dueDate.split('-');
  const formattedDate = `${day}-${month}-${year}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Basic reset for clients that support it */
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
    
    <div style="background-color: #f8f8f8; padding: 20px; text-align: center;">
      <img src="https://www.oldacre.co.uk/cdn/shop/files/Frame_1000002399_1.svg" alt="Oldacre" style="max-height: 50px; width: auto;">
    </div>

    <div style="padding: 20px;">
      <p>Dear ${orderData.customerName || 'Customer'},</p>
      
      <p>This is a friendly reminder regarding your order <strong>${orderData.name}</strong>. Your payment is due in 7 days.</p>
      
      <p style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
        <strong>Amount Due:</strong> £${orderData.amount}<br>
        <strong>Due Date:</strong> ${formattedDate}
      </p>

      <p>Please arrange for payment at your earliest convenience to avoid any service interruptions.</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="${orderData.order_status_url}" 
           style="display: inline-block; padding: 14px 28px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
           Pay Now
        </a>
      </p>

      <p>If you have already made this payment, please disregard this notice.</p>
    </div>

    <div style="margin-top: 20px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
      <p>Oldacre Team | info@flowerstation.co.uk</p>
    </div>
  </div>
</body>
</html>
  `;
};