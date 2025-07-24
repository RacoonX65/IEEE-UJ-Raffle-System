import * as Brevo from '@getbrevo/brevo'

export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'email'
  variables: string[]
}

export interface NotificationRecipient {
  name: string
  email?: string
  ticketNumber?: string
}

export interface NotificationData {
  template: string
  recipients: NotificationRecipient[]
  variables: Record<string, string>
  scheduledFor?: Date
  priority: 'low' | 'medium' | 'high'
}

// Pre-defined notification templates
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'ticket_confirmation',
    name: 'Ticket Purchase Confirmation',
    subject: '🎫 IEEE UJ Raffle Ticket Confirmation - {{ticketNumber}}',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>IEEE UJ Raffle Ticket Confirmation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
    
    body {
      font-family: 'Poppins', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f0f0f0;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #00629B 0%, #0078d4 100%);
      position: relative;
      overflow: hidden;
    }
    .header:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('https://i.imgur.com/8JIGed6.png');
      background-size: cover;
      opacity: 0.1;
      z-index: 0;
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .logo {
      width: 180px;
      height: auto;
      margin-bottom: 15px;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .header p {
      color: rgba(255,255,255,0.9);
      margin: 10px 0 0;
      font-size: 16px;
    }
    .content {
      padding: 30px;
    }
    .ticket-container {
      position: relative;
      margin: 20px 0 40px;
    }
    .ticket {
      background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%);
      border-radius: 16px;
      padding: 25px;
      color: white;
      text-align: center;
      box-shadow: 0 10px 20px rgba(255, 94, 98, 0.3);
      position: relative;
      z-index: 1;
      overflow: hidden;
    }
    .ticket:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('https://i.imgur.com/JWPjXV9.png');
      background-size: cover;
      opacity: 0.1;
      z-index: -1;
    }
    .ticket-label {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 5px;
      opacity: 0.9;
    }
    .ticket-number {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 2px;
      margin: 10px 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .ticket-divider {
      height: 3px;
      background: rgba(255,255,255,0.3);
      width: 80%;
      margin: 15px auto;
      border-radius: 3px;
    }
    .ticket-event {
      font-size: 18px;
      font-weight: 600;
    }
    .confetti {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: -1;
      opacity: 0.6;
    }
    .section {
      margin-bottom: 30px;
      background-color: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #00629B;
      margin-top: 0;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
    .section-title i {
      margin-right: 10px;
      font-size: 20px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: 0;
    }
    .detail-label {
      font-weight: 600;
      color: #555;
    }
    .detail-value {
      font-weight: 600;
      color: #333;
    }
    .payment-instructions {
      background: linear-gradient(135deg, #ffe8cc 0%, #fff6e6 100%);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      border-left: 5px solid #ff9800;
      box-shadow: 0 4px 15px rgba(255, 152, 0, 0.1);
    }
    .payment-title {
      display: flex;
      align-items: center;
      color: #ff9800;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .payment-title i {
      margin-right: 10px;
      font-size: 20px;
    }
    .next-steps {
      background: linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      border-left: 5px solid #26a69a;
    }
    .steps-title {
      display: flex;
      align-items: center;
      color: #26a69a;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .steps-title i {
      margin-right: 10px;
      font-size: 20px;
    }
    .steps-list {
      padding-left: 30px;
      margin: 15px 0;
    }
    .steps-list li {
      margin-bottom: 10px;
      position: relative;
    }
    .steps-list li:before {
      content: '✓';
      position: absolute;
      left: -25px;
      color: #26a69a;
      font-weight: bold;
    }
    .help-section {
      background: linear-gradient(135deg, #e8eaf6 0%, #e3f2fd 100%);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      border-left: 5px solid #3f51b5;
    }
    .help-title {
      display: flex;
      align-items: center;
      color: #3f51b5;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .help-title i {
      margin-right: 10px;
      font-size: 20px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #00629B 0%, #0078d4 100%);
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0, 98, 155, 0.3);
    }
    .button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 98, 155, 0.4);
    }
    .button i {
      margin-right: 8px;
    }
    .footer {
      text-align: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
      padding: 30px;
      border-top: 1px solid #e0e0e0;
    }
    .footer-logo {
      width: 100px;
      margin-bottom: 15px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #00629B;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .social-links a:hover {
      color: #0078d4;
    }
    .good-luck {
      font-size: 20px;
      font-weight: 700;
      color: #00629B;
      margin: 20px 0;
    }
    .emoji {
      font-size: 24px;
      vertical-align: middle;
      margin: 0 5px;
    }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <img class="logo" src="https://brand-experience.ieee.org/wp-content/uploads/2022/11/IEEE_logo_white.png" alt="IEEE Logo">
        <h1>Raffle Ticket Confirmation</h1>
        <p>Your entry to win amazing prizes!</p>
      </div>
    </div>
    
    <div class="content">
      <h2 style="text-align: center; color: #00629B;">Hello {{buyerName}}! <span class="emoji">👋</span></h2>
      
      <p style="text-align: center; font-size: 18px;">Thank you for purchasing a ticket for the <strong>IEEE UJ Raffle</strong>! Your ticket has been successfully registered.</p>
      
      <div class="ticket-container">
        <div class="confetti">
          <img src="https://i.imgur.com/ZXqJO3o.gif" alt="confetti" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="ticket">
          <div class="ticket-label">YOUR TICKET NUMBER</div>
          <div class="ticket-number">{{ticketNumber}}</div>
          <div class="ticket-divider"></div>
          <div class="ticket-event">IEEE UJ RAFFLE</div>
        </div>
      </div>
      
      <div class="section">
        <h3 class="section-title"><i class="fas fa-ticket-alt"></i> Ticket Details</h3>
        <div class="detail-row">
          <span class="detail-label">Purchase Date:</span>
          <span class="detail-value">{{purchaseDate}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">{{paymentMethod}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount:</span>
          <span class="detail-value">R{{ticketPrice}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Seller:</span>
          <span class="detail-value">{{sellerName}}</span>
        </div>
      </div>
      
      {{#if paymentMethod === 'EFT'}}
      <div class="payment-instructions">
        <h3 class="payment-title"><i class="fas fa-money-bill-wave"></i> EFT Payment Instructions</h3>
        <p>Please transfer <strong>R{{ticketPrice}}</strong> to the following account:</p>
        <div class="detail-row">
          <span class="detail-label">Account Holder:</span>
          <span class="detail-value">MR MQHELOMHLE N MTHUNZI</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Bank:</span>
          <span class="detail-value">First National Bank (FNB)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Account Number:</span>
          <span class="detail-value">63042909185</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Branch Code:</span>
          <span class="detail-value">250841</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Reference:</span>
          <span class="detail-value">{{ticketNumber}}</span>
        </div>
        <p style="margin-top: 15px;"><strong>Important:</strong> Your ticket will be verified once payment is confirmed.</p>
      </div>
      {{/if}}
      
      <div class="next-steps">
        <h3 class="steps-title"><i class="fas fa-clipboard-list"></i> What's Next</h3>
        <ul class="steps-list">
          <li>Keep this confirmation email safe</li>
          <li>Your ticket will be verified at the event</li>
          <li>Winner announcement: <strong>{{drawDate}}</strong></li>
          <li>Check your email regularly for updates</li>
        </ul>
      </div>
      
      <div class="help-section">
        <h3 class="help-title"><i class="fas fa-question-circle"></i> Need Help?</h3>
        <p>If you have any questions, please contact your seller:</p>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">{{sellerName}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">{{sellerEmail}}</span>
        </div>
      </div>
      
      <div class="button-container">
        <a href="https://ieee-uj.org/verify-ticket?ticket={{ticketNumber}}" class="button">
          <i class="fas fa-qrcode"></i> Verify Your Ticket
        </a>
      </div>
      
      <div class="good-luck">
        Good luck in the raffle! <span class="emoji">🍀</span> <span class="emoji">🎉</span> <span class="emoji">🎁</span>
      </div>
    </div>
    
    <div class="footer">
      <img class="footer-logo" src="https://brand-experience.ieee.org/wp-content/uploads/2019/11/ieee_mb_blue.png" alt="IEEE Logo">
      <div class="social-links">
        <a href="https://facebook.com/ieeeuj"><i class="fab fa-facebook"></i> Facebook</a> | 
        <a href="https://instagram.com/ieee_uj"><i class="fab fa-instagram"></i> Instagram</a> | 
        <a href="https://twitter.com/ieee_uj"><i class="fab fa-twitter"></i> Twitter</a>
      </div>
      <p>&copy; 2025 IEEE University of Johannesburg Student Branch. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    type: 'email',
    variables: ['buyerName', 'ticketNumber', 'purchaseDate', 'paymentMethod', 'sellerName', 'sellerEmail', 'ticketPrice', 'drawDate']
  },
  {
    id: 'payment_reminder',
    name: 'EFT Payment Reminder',
    subject: '⚠️ IEEE UJ Raffle - Payment Reminder for Ticket {{ticketNumber}}',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>IEEE UJ Raffle Payment Reminder</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
    
    body {
      font-family: 'Poppins', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f0f0f0;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
    .header {
      text-align: center;
      padding: 30px 0;
      background: linear-gradient(135deg, #f44336 0%, #ff7043 100%);
      position: relative;
      overflow: hidden;
    }
    .header:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('https://i.imgur.com/8JIGed6.png');
      background-size: cover;
      opacity: 0.1;
      z-index: 0;
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .logo {
      width: 180px;
      height: auto;
      margin-bottom: 15px;
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2));
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .header p {
      color: rgba(255,255,255,0.9);
      margin: 10px 0 0;
      font-size: 16px;
    }
    .content {
      padding: 30px;
    }
    .alert-banner {
      background: linear-gradient(135deg, #ff5252 0%, #ff1744 100%);
      color: white;
      text-align: center;
      padding: 15px;
      margin: -30px -30px 30px -30px;
      position: relative;
      box-shadow: 0 4px 15px rgba(255, 23, 68, 0.3);
    }
    .alert-banner h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      text-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .alert-banner p {
      margin: 5px 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .alert-icon {
      font-size: 36px;
      margin-bottom: 10px;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    .ticket-container {
      position: relative;
      margin: 20px 0 40px;
    }
    .ticket {
      background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%);
      border-radius: 16px;
      padding: 25px;
      color: white;
      text-align: center;
      box-shadow: 0 10px 20px rgba(255, 94, 98, 0.3);
      position: relative;
      z-index: 1;
      overflow: hidden;
    }
    .ticket:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('https://i.imgur.com/JWPjXV9.png');
      background-size: cover;
      opacity: 0.1;
      z-index: -1;
    }
    .ticket-label {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 5px;
      opacity: 0.9;
    }
    .ticket-number {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 2px;
      margin: 10px 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .ticket-divider {
      height: 3px;
      background: rgba(255,255,255,0.3);
      width: 80%;
      margin: 15px auto;
      border-radius: 3px;
    }
    .ticket-status {
      font-size: 18px;
      font-weight: 600;
      background-color: rgba(255, 255, 255, 0.2);
      padding: 5px 15px;
      border-radius: 30px;
      display: inline-block;
    }
    .countdown-container {
      margin: 30px 0;
      text-align: center;
    }
    .countdown-title {
      font-size: 18px;
      font-weight: 600;
      color: #f44336;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .countdown-timer {
      display: flex;
      justify-content: center;
      gap: 15px;
    }
    .countdown-block {
      background: linear-gradient(135deg, #f44336 0%, #ff7043 100%);
      color: white;
      border-radius: 10px;
      padding: 15px 10px;
      min-width: 80px;
      box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
      position: relative;
      overflow: hidden;
    }
    .countdown-block:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0));
      z-index: 0;
    }
    .countdown-value {
      font-size: 36px;
      font-weight: 700;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .countdown-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }
    .due-date {
      font-size: 18px;
      font-weight: 600;
      margin-top: 15px;
      color: #f44336;
    }
    .section {
      margin-bottom: 30px;
      background-color: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #00629B;
      margin-top: 0;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
    .section-title i {
      margin-right: 10px;
      font-size: 20px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: 0;
    }
    .detail-label {
      font-weight: 600;
      color: #555;
    }
    .detail-value {
      font-weight: 600;
      color: #333;
    }
    .payment-instructions {
      background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      border-left: 5px solid #ffc107;
      box-shadow: 0 4px 15px rgba(255, 193, 7, 0.2);
      position: relative;
      overflow: hidden;
    }
    .payment-instructions:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('https://i.imgur.com/JWPjXV9.png');
      background-size: cover;
      opacity: 0.05;
      z-index: 0;
    }
    .payment-content {
      position: relative;
      z-index: 1;
    }
    .payment-title {
      display: flex;
      align-items: center;
      color: #ff9800;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .payment-title i {
      margin-right: 10px;
      font-size: 20px;
    }
    .help-section {
      background: linear-gradient(135deg, #e8eaf6 0%, #e3f2fd 100%);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      border-left: 5px solid #3f51b5;
    }
    .help-title {
      display: flex;
      align-items: center;
      color: #3f51b5;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .help-title i {
      margin-right: 10px;
      font-size: 20px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #4CAF50 0%, #43a047 100%);
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
      position: relative;
      overflow: hidden;
    }
    .button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
    }
    .button:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: 0.5s;
    }
    .button:hover:before {
      left: 100%;
    }
    .button i {
      margin-right: 8px;
    }
    .footer {
      text-align: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
      padding: 30px;
      border-top: 1px solid #e0e0e0;
    }
    .footer-logo {
      width: 100px;
      margin-bottom: 15px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #00629B;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .social-links a:hover {
      color: #0078d4;
    }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <img class="logo" src="https://brand-experience.ieee.org/wp-content/uploads/2022/11/IEEE_logo_white.png" alt="IEEE Logo">
        <h1>Payment Reminder</h1>
        <p>Action required for your raffle ticket</p>
      </div>
    </div>
    
    <div class="content">
      <div class="alert-banner">
        <div class="alert-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <h2>Payment Required</h2>
        <p>Your ticket will be confirmed once payment is received</p>
      </div>
      
      <h2 style="text-align: center; color: #f44336;">Hello {{buyerName}}!</h2>
      
      <p style="text-align: center; font-size: 18px;">This is a friendly reminder that we haven't received payment for your <strong>IEEE UJ Raffle</strong> ticket yet. To secure your entry in the raffle, please complete your payment as soon as possible.</p>
      
      <div class="ticket-container">
        <div class="ticket">
          <div class="ticket-label">YOUR TICKET NUMBER</div>
          <div class="ticket-number">{{ticketNumber}}</div>
          <div class="ticket-divider"></div>
          <div class="ticket-status">PAYMENT PENDING</div>
        </div>
      </div>
      
      <div class="countdown-container">
        <div class="countdown-title">Payment Due In</div>
        <div class="countdown-timer">
          <div class="countdown-block">
            <div class="countdown-value">{{daysToDueDate}}</div>
            <div class="countdown-label">Days</div>
          </div>
        </div>
        <div class="due-date">Due Date: {{dueDate}}</div>
      </div>
      
      <div class="section">
        <h3 class="section-title"><i class="fas fa-ticket-alt"></i> Ticket Details</h3>
        <div class="detail-row">
          <span class="detail-label">Purchase Date:</span>
          <span class="detail-value">{{purchaseDate}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Days Since Purchase:</span>
          <span class="detail-value">{{daysSincePurchase}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount Due:</span>
          <span class="detail-value">R{{ticketPrice}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Seller:</span>
          <span class="detail-value">{{sellerName}}</span>
        </div>
      </div>
      
      <div class="payment-instructions">
        <div class="payment-content">
          <h3 class="payment-title"><i class="fas fa-money-bill-wave"></i> EFT Payment Instructions</h3>
          <p>Please transfer <strong>R{{ticketPrice}}</strong> to the following account:</p>
          <div class="detail-row">
            <span class="detail-label">Account Holder:</span>
            <span class="detail-value">{{accountHolder}}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Bank:</span>
            <span class="detail-value">{{bankName}}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Account Number:</span>
            <span class="detail-value">{{accountNumber}}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Branch Code:</span>
            <span class="detail-value">{{branchCode}}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Reference:</span>
            <span class="detail-value">{{reference}}</span>
          </div>
        </div>
      </div>
      
      <div class="button-container">
        <a href="https://ieee-uj.org/pay-now?ticket={{ticketNumber}}" class="button">
          <i class="fas fa-credit-card"></i> Pay Now
        </a>
      </div>
      
      <div class="help-section">
        <h3 class="help-title"><i class="fas fa-question-circle"></i> Need Help?</h3>
        <p>If you have already made the payment or have any questions, please contact your seller:</p>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">{{sellerName}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">{{sellerEmail}}</span>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <img class="footer-logo" src="https://brand-experience.ieee.org/wp-content/uploads/2019/11/ieee_mb_blue.png" alt="IEEE Logo">
      <div class="social-links">
        <a href="https://facebook.com/ieeeuj"><i class="fab fa-facebook"></i> Facebook</a> | 
        <a href="https://instagram.com/ieee_uj"><i class="fab fa-instagram"></i> Instagram</a> | 
        <a href="https://twitter.com/ieee_uj"><i class="fab fa-twitter"></i> Twitter</a>
      </div>
      <p>&copy; 2025 IEEE University of Johannesburg Student Branch. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    type: 'email',
    variables: ['buyerName', 'ticketNumber', 'purchaseDate', 'paymentMethod', 'sellerName', 'sellerEmail', 'ticketPrice', 'drawDate', 'daysToDueDate', 'dueDate', 'accountHolder', 'bankName', 'accountNumber', 'branchCode', 'reference']
  },
  {
    id: 'winner_announcement',
    name: 'Winner Announcement',
    subject: '🎉 CONGRATULATIONS! You Won the IEEE UJ Raffle!',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>IEEE UJ Raffle Winner Announcement</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #00629B; /* IEEE Blue */
      border-radius: 8px 8px 0 0;
      margin: -20px -20px 20px;
    }
    .header img {
      max-width: 150px;
      height: auto;
    }
    .header h1 {
      color: white;
      margin: 10px 0 0;
      font-size: 24px;
    }
    .winner-badge {
      background-color: #4CAF50;
      color: white;
      font-weight: bold;
      padding: 8px 15px;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 15px;
    }
    .celebration {
      font-size: 32px;
      text-align: center;
      margin: 20px 0;
    }
    .ticket-number {
      font-size: 28px;
      text-align: center;
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      border: 2px dashed #00629B;
      color: #00629B;
      font-weight: bold;
    }
    .section {
      margin-bottom: 25px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 6px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #00629B;
      margin-top: 0;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .detail-label {
      font-weight: bold;
      color: #555;
    }
    .prize-section {
      background-color: #e8f5e9;
      border-left: 4px solid #4CAF50;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .steps-section {
      background-color: #e3f2fd;
      border-left: 4px solid #2196F3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .steps-list {
      margin: 10px 0;
      padding-left: 20px;
    }
    .steps-list li {
      margin-bottom: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #777;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background-color: #00629B;
      color: white;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 15px 0;
    }
    .claim-button {
      background-color: #4CAF50;
    }
    .social-links {
      margin-top: 15px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 5px;
      color: #00629B;
      text-decoration: none;
    }
    .confetti {
      position: relative;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://brand-experience.ieee.org/wp-content/uploads/2022/11/IEEE_logo_white.png" alt="IEEE Logo">
      <h1>Winner Announcement</h1>
    </div>
    
    <div style="text-align: center;">
      <span class="winner-badge">WINNER!</span>
    </div>
    
    <div class="celebration">
      🎉 CONGRATULATIONS! 🎉
    </div>
    
    <p style="text-align: center; font-size: 20px; font-weight: bold;">Dear {{winnerName}},</p>
    
    <p style="text-align: center; font-size: 18px;">You are the <strong>WINNER</strong> of the IEEE UJ Raffle!</p>
    
    <div class="ticket-number">
      Winning Ticket #: {{ticketNumber}}
    </div>
    
    <div class="prize-section">
      <h2 class="section-title">Prize Details</h2>
      <div class="detail-row">
        <span class="detail-label">Prize:</span>
        <span><strong>{{prizeName}}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Draw Date:</span>
        <span>{{drawDate}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Tickets Sold:</span>
        <span>{{totalTickets}}</span>
      </div>
    </div>
    
    <div class="steps-section">
      <h2 class="section-title">Next Steps</h2>
      <ol class="steps-list">
        <li>Contact us within 7 days to claim your prize</li>
        <li>Bring valid ID and this notification</li>
        <li>Collection details will be sent separately</li>
      </ol>
    </div>
    
    <div class="section">
      <h2 class="section-title">Contact Information</h2>
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span>{{contactEmail}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phone:</span>
        <span>Contact us for details</span>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:{{contactEmail}}?subject=IEEE%20UJ%20Raffle%20Prize%20Claim%20-%20Ticket%20{{ticketNumber}}" class="button claim-button">Claim Your Prize</a>
    </div>
    
    <div class="footer">
      <p>Thank you for supporting IEEE UJ! 🙏</p>
      <p>&copy; 2025 IEEE University of Johannesburg Student Branch. All rights reserved.</p>
      <div class="social-links">
        <a href="https://facebook.com/ieeeuj">Facebook</a> | 
        <a href="https://instagram.com/ieee_uj">Instagram</a> | 
        <a href="https://twitter.com/ieee_uj">Twitter</a>
      </div>
    </div>
  </div>
</body>
</html>`,
    type: 'email',
    variables: ['winnerName', 'ticketNumber', 'prizeName', 'drawDate', 'totalTickets', 'contactEmail']
  },
  {
    id: 'seller_summary',
    name: 'Daily Seller Summary',
    subject: '📊 Your IEEE UJ Raffle Sales Summary - {{date}}',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>IEEE UJ Raffle Seller Summary</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #00629B; /* IEEE Blue */
      border-radius: 8px 8px 0 0;
      margin: -20px -20px 20px;
    }
    .header img {
      max-width: 150px;
      height: auto;
    }
    .header h1 {
      color: white;
      margin: 10px 0 0;
      font-size: 24px;
    }
    .date-badge {
      background-color: #00629B;
      color: white;
      font-weight: bold;
      padding: 8px 15px;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 15px;
    }
    .section {
      margin-bottom: 25px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 6px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #00629B;
      margin-top: 0;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .detail-label {
      font-weight: bold;
      color: #555;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
    }
    .stat-card {
      background-color: #f5f5f5;
      border-radius: 6px;
      padding: 15px;
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #00629B;
      margin: 5px 0;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
    }
    .top-seller {
      background-color: #fef9e6;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      text-align: center;
    }
    .top-seller-badge {
      font-size: 20px;
      font-weight: bold;
      color: #ff9800;
      margin-bottom: 5px;
    }
    .tips-section {
      background-color: #e8f4fd;
      border-left: 4px solid #2196F3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .tips-list {
      margin: 10px 0;
      padding-left: 20px;
    }
    .tips-list li {
      margin-bottom: 8px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #777;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background-color: #00629B;
      color: white;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 15px 0;
    }
    .social-links {
      margin-top: 15px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 5px;
      color: #00629B;
      text-decoration: none;
    }
    .rank-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px 0;
    }
    .rank-badge {
      background-color: #00629B;
      color: white;
      font-weight: bold;
      font-size: 18px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
    }
    .rank-text {
      font-size: 16px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://brand-experience.ieee.org/wp-content/uploads/2022/11/IEEE_logo_white.png" alt="IEEE Logo">
      <h1>Seller Performance Summary</h1>
    </div>
    
    <div style="text-align: center;">
      <span class="date-badge">{{date}}</span>
    </div>
    
    <p>Hello {{sellerName}},</p>
    
    <p>Here's your daily sales summary for the IEEE UJ Raffle. Keep up the great work!</p>
    
    <div class="section">
      <h2 class="section-title">Today's Performance</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ticketsSoldToday}}</div>
          <div class="stat-label">Tickets Sold</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">R{{revenueToday}}</div>
          <div class="stat-label">Revenue</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{verifiedToday}}</div>
          <div class="stat-label">Verified Payments</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{pendingToday}}</div>
          <div class="stat-label">Pending Payments</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">Overall Statistics</h2>
      <div class="detail-row">
        <span class="detail-label">Total Tickets Sold:</span>
        <span><strong>{{totalTickets}}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Revenue:</span>
        <span><strong>R{{totalRevenue}}</strong></span>
      </div>
      
      <div class="rank-indicator">
        <div class="rank-badge">{{sellerRank}}</div>
        <div class="rank-text">Your rank out of {{totalSellers}} sellers</div>
      </div>
    </div>
    
    {{#if topSeller}}
    <div class="top-seller">
      <div class="top-seller-badge">🥇 TOP SELLER!</div>
      <p>Congratulations! You're today's top-performing seller!</p>
    </div>
    {{/if}}
    
    <div class="tips-section">
      <h2 class="section-title">Tips for Success</h2>
      <ul class="tips-list">
        <li>Follow up on pending EFT payments to increase your verification rate</li>
        <li>Share QR codes with buyers for easy ticket verification</li>
        <li>Use email notifications for quick confirmations and reminders</li>
        <li>Reach out to previous buyers for referrals</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://ieee-uj.org/dashboard" class="button">View Full Dashboard</a>
    </div>
    
    <div class="footer">
      <p>Keep up the great work! 🚀</p>
      <p>&copy; 2025 IEEE University of Johannesburg Student Branch. All rights reserved.</p>
      <div class="social-links">
        <a href="https://facebook.com/ieeeuj">Facebook</a> | 
        <a href="https://instagram.com/ieee_uj">Instagram</a> | 
        <a href="https://twitter.com/ieee_uj">Twitter</a>
      </div>
    </div>
  </div>
</body>
</html>`,
    type: 'email',
    variables: ['sellerName', 'date', 'ticketsSoldToday', 'revenueToday', 'verifiedToday', 'pendingToday', 'totalTickets', 'totalRevenue', 'sellerRank', 'totalSellers']
  },
  {
    id: 'bulk_update',
    name: 'Bulk Update Notification',
    subject: '📢 IEEE UJ Raffle - {{updateTitle}}',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>IEEE UJ Raffle Update</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #00629B; /* IEEE Blue */
      border-radius: 8px 8px 0 0;
      margin: -20px -20px 20px;
    }
    .header img {
      max-width: 150px;
      height: auto;
    }
    .header h1 {
      color: white;
      margin: 10px 0 0;
      font-size: 24px;
    }
    .update-title {
      font-size: 24px;
      font-weight: bold;
      color: #00629B;
      margin: 20px 0;
      text-align: center;
    }
    .update-content {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 25px;
    }
    .section {
      margin-bottom: 25px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 6px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #00629B;
      margin-top: 0;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .detail-label {
      font-weight: bold;
      color: #555;
    }
    .action-required {
      background-color: #fff0f0;
      border-left: 4px solid #f44336;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #777;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background-color: #00629B;
      color: white;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 15px 0;
    }
    .social-links {
      margin-top: 15px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 5px;
      color: #00629B;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://brand-experience.ieee.org/wp-content/uploads/2022/11/IEEE_logo_white.png" alt="IEEE Logo">
      <h1>Raffle Update</h1>
    </div>
    
    <p>Hello {{recipientName}},</p>
    
    <div class="update-title">{{updateTitle}}</div>
    
    <div class="update-content">
      {{updateContent}}
    </div>
    
    <div class="section">
      <h2 class="section-title">Raffle Details</h2>
      <div class="detail-row">
        <span class="detail-label">Draw Date:</span>
        <span>{{drawDate}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Tickets Sold:</span>
        <span>{{totalTickets}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Prize:</span>
        <span>{{prizeName}}</span>
      </div>
    </div>
    
    {{#if actionRequired}}
    <div class="action-required">
      <h2 class="section-title">Action Required</h2>
      <p>{{actionDetails}}</p>
    </div>
    {{/if}}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://ieee-uj.org/raffle" class="button">View Raffle Details</a>
    </div>
    
    <div class="footer">
      <p>Thank you for supporting IEEE UJ! 🙏</p>
      <p>&copy; 2025 IEEE University of Johannesburg Student Branch. All rights reserved.</p>
      <div class="social-links">
        <a href="https://facebook.com/ieeeuj">Facebook</a> | 
        <a href="https://instagram.com/ieee_uj">Instagram</a> | 
        <a href="https://twitter.com/ieee_uj">Twitter</a>
      </div>
    </div>
  </div>
</body>
</html>`,
    type: 'email',
    variables: ['recipientName', 'updateTitle', 'updateContent', 'drawDate', 'totalTickets', 'prizeName', 'actionRequired', 'actionDetails']
  }
]

// Brevo API client initialization
let apiInstance: Brevo.TransactionalEmailsApi | null = null;

export function initializeEmailService(): Brevo.TransactionalEmailsApi | null {
  if (!process.env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not configured. Email notifications will be disabled.');
    return null;
  }

  try {
    if (!apiInstance) {
      console.log('Initializing Brevo API client with key:', process.env.BREVO_API_KEY?.substring(0, 5) + '...');
      
      // Initialize Brevo API client
      apiInstance = new Brevo.TransactionalEmailsApi();
      
      // Set the API key from environment variable
      // Cast to any to access protected property in TypeScript
      // This is the official pattern recommended in Brevo documentation
      (apiInstance as any).authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
      
      console.log('Brevo API client initialized successfully');
    }
    
    return apiInstance;
  } catch (error) {
    console.error('Failed to initialize Brevo API:', error);
    return null;
  }
}

// Default sender email - can be overridden with environment variables
const DEFAULT_FROM = {
  email: process.env.EMAIL_FROM_ADDRESS || 'noreply@ieee-uj.org',
  name: process.env.EMAIL_FROM_NAME || 'IEEE UJ Raffle System'
};

// Send email notification using Brevo
export async function sendEmailNotification(
  to: string,
  subject: string,
  content: string,
  attachments?: { filename: string; content: Buffer; contentType: string }[]
): Promise<boolean> {
  try {
    // Initialize API client if not already initialized
    if (!apiInstance) {
      apiInstance = initializeEmailService();
    }
    
    // Check if API client is initialized
    if (!apiInstance) {
      console.error('Brevo API client not initialized - check BREVO_API_KEY environment variable');
      return false;
    }
    
    // Log the email content for debugging
    console.log('Sending email with subject:', subject);
    console.log('Email content:', content);
    
    // Create email sending request
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    // Set sender
    sendSmtpEmail.sender = {
      name: DEFAULT_FROM.name,
      email: DEFAULT_FROM.email
    };
    
    // Set recipient(s)
    sendSmtpEmail.to = [{
      email: to,
      name: to.split('@')[0] // Use part before @ as name
    }];
    
    // Set content
    sendSmtpEmail.subject = subject;
    
    // Convert markdown-style formatting to HTML
    let htmlContent = content
      .replace(/\n/g, '<br>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/•/g, '&bull;');
      
    sendSmtpEmail.htmlContent = htmlContent;
    
    // Set plain text content by stripping HTML tags
    sendSmtpEmail.textContent = content.replace(/<[^>]*>/g, '');
    
    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      sendSmtpEmail.attachment = attachments.map(attachment => ({
        name: attachment.filename,
        content: attachment.content.toString('base64'),
        type: attachment.contentType
      }));
    }
    
    // Send the email
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully via Brevo:', data.body && data.body.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email via Brevo:', error);
    return false;
  }
}

// WhatsApp functionality removed - email-only notifications

// Template variable replacement
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template

  // Log variables for debugging
  console.log('Template variables available:', Object.keys(variables));
  console.log('Template before replacement:', template.substring(0, 100) + '...');
  
  // Simple variable replacement
  Object.entries(variables).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      console.warn(`Warning: Variable ${key} has null/undefined value`);
      return;
    }
    
    const regex = new RegExp(`{{${key}}}`, 'g');
    const valueStr = String(value); // Ensure value is a string
    result = result.replace(regex, valueStr);
    
    // Check if replacement happened
    if (template.includes(`{{${key}}}`) && !result.includes(`{{${key}}}}`)) {
      console.log(`Replaced {{${key}}} with: ${valueStr.substring(0, 30)}${valueStr.length > 30 ? '...' : ''}`);
    }
  })

  // Handle conditional blocks (basic implementation)
  result = result.replace(/{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
    // Simple condition evaluation (you could make this more sophisticated)
    const conditionValue = variables[condition.trim()]
    return conditionValue && conditionValue !== 'false' ? content : ''
  })
  
  // Check for any remaining unreplaced variables
  const remainingVars = result.match(/{{[^{}]+}}/g);
  if (remainingVars && remainingVars.length > 0) {
    console.warn('Unreplaced variables in template:', remainingVars);
  }

  console.log('Template after replacement (first 100 chars):', result.substring(0, 100) + '...');
  return result
}

// Get template by ID
export function getTemplate(templateId: string): NotificationTemplate | undefined {
  return NOTIFICATION_TEMPLATES.find(t => t.id === templateId)
}

// Send notification using template
export async function sendNotification(data: NotificationData): Promise<{
  success: boolean
  emailResults: boolean[]
  errors: string[]
}> {
  // Get template
  const template = getTemplate(data.template)
  if (!template) {
    return {
      success: false,
      emailResults: [],
      errors: [`Template ${data.template} not found`]
    }
  }

  const emailResults: boolean[] = []
  const errors: string[] = []

  // Initialize email service if not already initialized
  if (!apiInstance) {
    apiInstance = initializeEmailService();
    if (!apiInstance) {
      return {
        success: false,
        emailResults: [],
        errors: ['Failed to initialize email service - check BREVO_API_KEY environment variable']
      };
    }
  }

  for (const recipient of data.recipients) {
    try {
      if (!recipient.email) {
        console.error('Recipient email is missing');
        errors.push(`Recipient email is missing for ${recipient.name}`);
        emailResults.push(false);
        continue;
      }

      // Create personalized variables without overriding existing ones
      const personalizedVariables: Record<string, string> = {};
      
      // Copy all existing variables
      Object.entries(data.variables).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          personalizedVariables[key] = String(value);
        }
      });
      
      // Add recipient-specific variables with fallbacks
      personalizedVariables.recipientName = personalizedVariables.recipientName || recipient.name || '';
      personalizedVariables.buyerName = personalizedVariables.buyerName || recipient.name || '';
      personalizedVariables.winnerName = personalizedVariables.winnerName || recipient.name || '';
      personalizedVariables.sellerName = personalizedVariables.sellerName || '';
      
      // Add ticketNumber from recipient if available
      if (recipient.ticketNumber) {
        personalizedVariables.ticketNumber = recipient.ticketNumber;
      }
      
      // Log the final variables being used for this recipient
      console.log(`Preparing notification for ${recipient.email} with variables:`, personalizedVariables);

      const subject = replaceTemplateVariables(template.subject, personalizedVariables)
      const content = replaceTemplateVariables(template.content, personalizedVariables)

      // Send email notification (email-only system)
      if (template.type === 'email' && recipient.email) {
        const emailSuccess = await sendEmailNotification(recipient.email, subject, content)
        emailResults.push(emailSuccess)
        if (!emailSuccess) {
          errors.push(`Failed to send email to ${recipient.email}`)
        }
      }
    } catch (error) {
      errors.push(`Error processing recipient ${recipient.name}: ${error}`)
    }
  }

  return {
    success: errors.length === 0,
    emailResults,
    errors
  }
}

// Utility functions for common notification scenarios
export async function sendTicketConfirmation(
  buyerName: string,
  buyerEmail: string,
  ticketNumber: string,
  paymentMethod: string,
  sellerName: string,
  sellerEmail: string,
  ticketPrice: number = 50
): Promise<boolean> {
  const result = await sendNotification({
    template: 'ticket_confirmation',
    recipients: [{
      name: buyerName,
      email: buyerEmail,
      ticketNumber
    }],
    variables: {
      ticketNumber,
      purchaseDate: new Date().toLocaleDateString(),
      paymentMethod,
      sellerName,
      sellerEmail,
      ticketPrice: ticketPrice.toString(),
      drawDate: 'TBA' // You can make this configurable
    },
    priority: 'high'
  })

  return result.success
}

export async function sendPaymentReminder(
  buyerName: string,
  buyerEmail: string,
  ticketNumber: string,
  sellerName: string,
  sellerEmail: string,
  daysSincePurchase: number,
  ticketPrice: number = 50
): Promise<boolean> {
  // Log the variables being sent to help with debugging
  console.log('Sending payment reminder with variables:', {
    buyerName,
    buyerEmail,
    ticketNumber,
    sellerName,
    sellerEmail,
    daysSincePurchase,
    ticketPrice
  });
  
  // Ensure all template variables are explicitly set
  const variables = {
    // Required variables for payment_reminder template
    buyerName,
    ticketNumber,
    ticketPrice: ticketPrice.toString(),
    daysSincePurchase: daysSincePurchase.toString(),
    sellerName,
    sellerEmail,
    // Additional variables that might be referenced in the template
    purchaseDate: new Date(Date.now() - daysSincePurchase * 24 * 60 * 60 * 1000).toLocaleDateString(),
    // Ensure these are explicitly set to prevent undefined values
    recipientName: buyerName,
    email: buyerEmail,
    // Set default values for any other variables that might be used
    drawDate: 'TBA',
    paymentMethod: 'EFT',
    // Add reference to the template for debugging
    _template: 'payment_reminder'
  };
  
  // Log the complete set of variables
  console.log('Complete set of variables for payment reminder:', variables);
  
  const result = await sendNotification({
    template: 'payment_reminder',
    recipients: [{
      name: buyerName,
      email: buyerEmail,
      ticketNumber
    }],
    variables,
    priority: 'medium'
  })

  return result.success
}
