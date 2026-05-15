import { motion } from 'framer-motion'
import { Sun, Moon, Bell, Shield, Code2 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Settings() {
  const { theme, toggle, isDark } = useTheme()

  const Section = ({ title, children }) => (
    <div className="card p-6">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-5 pb-3 border-b border-light-border dark:border-dark-border">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  )

  const Row = ({ icon: Icon, label, desc, control }) => (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-100 dark:bg-dark-card2 rounded-lg flex items-center justify-center">
          <Icon size={15} className="text-light-text dark:text-dark-text" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-white">{label}</p>
          {desc && <p className="text-xs text-light-text dark:text-dark-text mt-0.5">{desc}</p>}
        </div>
      </div>
      {control}
    </div>
  )

  return (
    <div className="page max-w-2xl">
      <div>
        <h2 className="page-title">Settings</h2>
        <p className="page-sub">Manage your preferences</p>
      </div>

      <Section title="Appearance">
        <Row
          icon={isDark ? Moon : Sun}
          label="Theme"
          desc={`Currently using ${theme} mode`}
          control={
            <button onClick={toggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300
                ${isDark ? 'bg-accent' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300
                ${isDark ? 'left-7' : 'left-1'}`} />
            </button>
          }
        />
      </Section>

      {/* <Section title="Notifications">
        {[
          { label: 'Review complete', desc: 'Notify when analysis finishes' },
          { label: 'Critical issues', desc: 'Alert on critical severity findings' },
        ].map(({ label, desc }) => (
          <Row key={label} icon={Bell} label={label} desc={desc}
            control={
              <button className="relative w-12 h-6 rounded-full bg-slate-300 dark:bg-dark-border2 transition-colors">
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow" />
              </button>
            }
          />
        ))}
      </Section>

      <Section title="Analysis">
        {[
          { label: 'Scan private repos', desc: 'Include private repositories in analysis' },
          { label: 'Deep scan mode',     desc: 'Analyze up to 100 files per repo (slower)' },
        ].map(({ label, desc }) => (
          <Row key={label} icon={Code2} label={label} desc={desc}
            control={
              <button className="relative w-12 h-6 rounded-full bg-accent transition-colors">
                <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full shadow" />
              </button>
            }
          />
        ))}
      </Section>

      <Section title="Privacy & Security">
        <Row icon={Shield} label="Data retention"
          desc="Analysis results are stored for 90 days"
          control={<span className="badge badge-info">90 days</span>} />
      </Section> */}
    </div>
  )
}
