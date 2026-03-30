export const metadata = {
  title: "EduLearn",
  description: "Learning Platform",
};

import "../styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}