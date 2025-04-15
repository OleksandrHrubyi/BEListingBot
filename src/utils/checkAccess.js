import allowedUsers from "../constants/allowedUsers.js";

export default function checkAccess(userId) {
    return allowedUsers.includes(userId);
  }