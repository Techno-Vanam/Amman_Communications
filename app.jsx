import { useState } from 'react'
import './App.css'

const EMAIL_PATTERN = /^[^\s@]+@gmail\.com$/i
const PHONE_PATTERN = /^\d{10}$/

function passwordChecks(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@#$%^&*!]/.test(password),
  }
}

function isValidPassword(password) {
  return Object.values(passwordChecks(password)).every(Boolean)
}

function PasswordRequirements({ password }) {
  const checks = passwordChecks(password)

  return (
    <ul className="requirements" aria-label="Password requirements">
      <li className={checks.length ? 'valid' : ''}>8+ characters</li>
      <li className={checks.uppercase ? 'valid' : ''}>1 uppercase letter</li>
      <li className={checks.number ? 'valid' : ''}>1 number (0-9)</li>
      <li className={checks.special ? 'valid' : ''}>1 special (@#$%^&amp;*!)</li>
    </ul>
  )
}

function Field({ label, name, type = 'text', value, onChange, placeholder, error, inputMode, prefix, maxLength }) {
  return (
    <label className="field">
      <span>{label}</span>
      <span className={prefix ? 'input-wrap' : ''}>
        {prefix && <span className="phone-prefix">{prefix}</span>}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          inputMode={inputMode}
          maxLength={maxLength}
          required
        />
      </span>
      {error && <small className="error">{error}</small>}
    </label>
  )
}

function App() {
  const [page, setPage] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '', mobile: '' })
  const [error, setError] = useState('')

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
    setError('')
  }

  const goTo = (nextPage) => {
    setForm({ email: '', password: '', confirmPassword: '', name: '', mobile: '' })
    setError('')
    setPage(nextPage)
  }

  const submitLogin = (event) => {
    event.preventDefault()
    const account = JSON.parse(localStorage.getItem('customerAccount') || 'null')
    if (!EMAIL_PATTERN.test(form.email)) return setError('Enter a valid Gmail address.')
    if (!isValidPassword(form.password)) return setError('Password does not meet all the requirements.')
    if (!account || account.email.toLowerCase() !== form.email.toLowerCase() || account.password !== form.password) {
      return setError('No matching account found. Check your details or create a new account.')
    }
      setPage('blank')
  }

  const submitSignup = (event) => {
    event.preventDefault()
    if (!form.name.trim()) return setError('Enter your name.')
    if (!EMAIL_PATTERN.test(form.email)) return setError('Use a valid Gmail address.')
    if (!isValidPassword(form.password)) return setError('Password does not meet all the requirements.')
    if (!PHONE_PATTERN.test(form.mobile)) return setError('Enter exactly 10 digits after +91.')
    localStorage.setItem('customerAccount', JSON.stringify({ ...form }))
    goTo('login')
  }

  const submitReset = (event) => {
    event.preventDefault()
    const account = JSON.parse(localStorage.getItem('customerAccount') || 'null')
    if (!EMAIL_PATTERN.test(form.email)) return setError('Enter a valid Gmail address.')
    if (!isValidPassword(form.password)) return setError('New password does not meet all the requirements.')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    if (!account || account.email.toLowerCase() !== form.email.toLowerCase()) return setError('No account found for this email.')
    localStorage.setItem('customerAccount', JSON.stringify({ ...account, password: form.password }))
    goTo('login')
  }

  if (page === 'blank') return <main className="blank-page" />

  const isSignup = page === 'signup'
  const isReset = page === 'reset'
  const title = isSignup ? 'Create your account' : isReset ? 'Reset your password' : 'Sign in to your account'
  const subtitle = isSignup ? 'Register for secure customer access.' : isReset ? 'Choose a new password for your account.' : 'Use your registered Gmail and secure password.'

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="heading">
          <h1>{isSignup || isReset ? title : 'Welcome back'}</h1>
          <p>{subtitle}</p>
        </div>
        <form onSubmit={isSignup ? submitSignup : isReset ? submitReset : submitLogin} noValidate>
          {isSignup && <Field label="Full Name" name="name" value={form.name} onChange={update} placeholder="Your name" error={error && !form.name ? error : ''} />}
          <Field label="Email Address" name="email" type="email" value={form.email} onChange={update} placeholder="yourname@gmail.com" error={error && !EMAIL_PATTERN.test(form.email) ? error : ''} />
            {isSignup && <Field label="Mobile Number" name="mobile" value={form.mobile} onChange={update} placeholder="9876543210" inputMode="numeric" maxLength={10} prefix="+91" error={error && !PHONE_PATTERN.test(form.mobile) ? error : ''} />}
          <Field label={isReset ? 'New Password' : 'Password'} name="password" type="password" value={form.password} onChange={update} placeholder="Enter your password" />
          {(isSignup || isReset) && <PasswordRequirements password={form.password} />}
          {isReset && <Field label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} placeholder="Re-enter your password" error={error && form.password !== form.confirmPassword ? error : ''} />}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit">{isSignup ? 'Create Account' : isReset ? 'Proceed Next' : 'Sign In to Portal'}</button>
        </form>
        {!isSignup && !isReset && <button className="text-button forgot" type="button" onClick={() => goTo('reset')}>Forgot Password?</button>}
        {(isSignup || isReset) && <button className="text-button back" type="button" onClick={() => goTo('login')}>Back to Sign In</button>}
        {!isReset && <div className="account-prompt">{isSignup ? 'Already have an account?' : "Don't have an account already?"} <button className="text-button" type="button" onClick={() => goTo(isSignup ? 'login' : 'signup')}>{isSignup ? 'Sign In' : 'Create New Account'}</button></div>}
      </section>
    </main>
  )
}

export default App
