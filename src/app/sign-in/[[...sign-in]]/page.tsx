// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAFBFA',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {/* Logo */}
        <a href="/" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          textDecoration: 'none', marginBottom: 4,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: '#0F9B76',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="3" fill="white"/>
              <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.5" strokeDasharray="2 2"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#111813', letterSpacing: '-0.02em' }}>
            GeoResearch
          </span>
        </a>
        <SignIn />
      </div>
    </div>
  )
}