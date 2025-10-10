export default function formatTimeAgo(date) {
  const now = new Date();
  const createdDate = new Date(date);
  const diffMs = now - createdDate; // chênh lệch theo mili giây
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDays = Math.floor(diffMs / 1000 / 60 / 60 / 24);

  if (diffMinutes < 10) {
    return "Just now";
  } else if (diffMinutes < 60) {
    // Làm tròn xuống 15, 30, 45 phút
    const rounded = Math.floor(diffMinutes / 15) * 15;
    return `${rounded} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }
}
