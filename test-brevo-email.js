// Simple script to test Brevo email sending

require('dotenv').config({ path: '.env.local' }); // Load environment variables
const { sendTestEmail } = require('./src/lib/brevo-email');
const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get email address from user input

// Call the test function and log the result
async function runTest(email) {
  console.log(`Sending test email to ${email}...`);
  try {
    const result = await sendTestEmail(email);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Failed to send email:', result.message);
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
  rl.close();
}

// Ask for email address and then run test
rl.question('Enter your email address for testing: ', (email) => {
  if (!email || !email.includes('@')) {
    console.log('Invalid email address');
    rl.close();
    return;
  }
  runTest(email);
});
