'use client'

import { useEffect } from 'react'

const styles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: '0.95rem',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    // Fallback si les variables CSS ne sont pas définies
    color: '#fff',
  },
  primary: {
    background: '#FF6B5A',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(255,107,90,0.4)',
    padding: '13px 28px',
  },
  secondary: {
    background: '#fff',
    color: '#2B2725',
    border: '1.5px solid #E9DDD4',
    padding: '13px 28px',
  },
  ghost: {
    background: 'transparent',
    color: '#706965',
    padding: '10px 20px',
  },
  sm: { padding: '8px 18px', fontSize: '0.85rem' },
  lg: { padding: '16px 36px', fontSize: '1.05rem' },
}

export default function Button({
  children,
  variant = 'primary',
  size,
  onClick,
  disabled,
  loading,
  type = 'button',
  style,
  ...props
}) {
  // Injection des keyframes pour l'animation du spinner
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const combined = {
    ...styles.base,
    ...styles[variant],
    ...(size ? styles[size] : {}),
    ...(disabled || loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
    ...style,
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={combined}
      onMouseEnter={e => {
        if (disabled || loading) return
        if (variant === 'primary') {
          e.currentTarget.style.background = '#F45542'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 12px 36px rgba(255,107,81,0.42)'
        } else if (variant === 'secondary') {
          e.currentTarget.style.borderColor = '#FF6B5A'
          e.currentTarget.style.color = '#FF6B5A'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        if (variant === 'primary') {
          e.currentTarget.style.background = '#FF6B5A'
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,90,0.4)'
        } else if (variant === 'secondary') {
          e.currentTarget.style.borderColor = '#E9DDD4'
          e.currentTarget.style.color = '#2B2725'
          e.currentTarget.style.transform = 'none'
        }
      }}
      {...props}
    >
      {loading ? (
        <>
          <span style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite'
          }} />
          Loading…
        </>
      ) : children}
    </button>
  )
}