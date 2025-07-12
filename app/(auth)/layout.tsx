import { ReactNode } from 'react'

const AuthLayout = ({ children}:{ children : ReactNode}) => {
  return (
    <div className="min-h-screen flex bg-neutral-900 items-center justify-center">
      { children }
    </div>
  )
}

export default AuthLayout
