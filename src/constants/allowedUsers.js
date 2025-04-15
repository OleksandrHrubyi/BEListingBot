import dotenv from 'dotenv';
dotenv.config();

const allowedUsers = process.env.TELEGRAM_ALLOWED_IDS
  .split(',')
  .map(id => parseInt(id.trim()));

export default allowedUsers;