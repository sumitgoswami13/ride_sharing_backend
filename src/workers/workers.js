const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const rabbitMQUrl = 'amqp://localhost'; // Replace with your RabbitMQ URL
const queue = 'task_queue';


const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'your_email@gmail.com', 
    pass: 'your_email_password'   
  }
});

async function sendOtp(email) {
  const otp = uuidv4().split('-')[0];
  const mailOptions = {
    from: 'your_email@gmail.com',
    to: email,
    subject: 'Your OTP',
    text: `Your OTP is ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send OTP to ${email}`, error);
  }
}

async function uploadImage(imageData, imageName) {
  const filePath = path.join(__dirname, 'uploads', imageName);
  try {
    fs.writeFileSync(filePath, imageData, 'base64');
    console.log(`Image uploaded to ${filePath}`);
  } catch (error) {
    console.error(`Failed to upload image ${imageName}`, error);
  }
}

async function sendNotification(email, message) {
  const mailOptions = {
    from: 'your_email@gmail.com',
    to: email,
    subject: 'Notification',
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send notification to ${email}`, error);
  }
}

async function handleTask(task) {
  const { type, email, userId, imageData, imageName, message } = task;

  switch (type) {
    case 'send_otp':
      await sendOtp(email);
      break;
    case 'upload_image':
      await uploadImage(imageData, imageName);
      break;
    case 'send_notification':
      await sendNotification(email, message);
      break;
    default:
      console.error(`Unknown task type: ${type}`);
  }
}

async function consumeMessages() {
  const connection = await amqp.connect(rabbitMQUrl);
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const task = JSON.parse(msg.content.toString());
      await handleTask(task);
      channel.ack(msg);
    }
  }, { noAck: false });
}

consumeMessages().catch(console.error);
