import './globals.css'

export const metadata = {
  title: 'Ronda Circle',
  description: 'Join small public circles in your city or remotely.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
