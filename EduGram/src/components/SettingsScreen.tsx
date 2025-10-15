import { ArrowLeft, Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTheme } from '../utils/theme';
import { Label } from './ui/label';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun, description: 'Clean and bright interface' },
    { value: 'dark' as const, label: 'Dark', icon: Moon, description: 'Perfect for late-night studying' },
    { value: 'system' as const, label: 'System', icon: Monitor, description: 'Match your device' },
  ];

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      {/* Header */}
      <header className="bg-[var(--app-surface)] border-b border-[var(--app-border)] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-[var(--app-text-secondary)] hover:text-[var(--app-cyan)] transition-colors p-2 hover:bg-[var(--app-surface-elevated)] rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-[var(--app-cyan)]">Settings</h2>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Appearance Section */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6 shadow-lg mb-6">
          <div className="mb-6">
            <h3 className="text-[var(--app-text-primary)] mb-2">Appearance</h3>
            <p className="text-[var(--app-text-secondary)]">
              Choose how EduGram looks to you. Select a single theme, or sync with your system settings.
            </p>
          </div>

          <div className="space-y-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-[var(--app-blue)] bg-[var(--app-blue-light)]'
                      : 'border-[var(--app-border)] bg-[var(--app-bg)] hover:border-[var(--app-blue)] hover:bg-[var(--app-surface-elevated)]'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-blue-dark)] text-white'
                      : 'bg-[var(--app-surface-elevated)] text-[var(--app-text-secondary)]'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${
                        isSelected ? 'text-[var(--app-blue)]' : 'text-[var(--app-text-primary)]'
                      }`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--app-blue)] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-[var(--app-text-secondary)]">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6 shadow-lg">
          <h3 className="text-[var(--app-text-primary)] mb-4">Preview</h3>
          <div className="space-y-3">
            {/* Sample Post Card */}
            <div className="bg-[var(--app-surface-elevated)] border border-[var(--app-border)] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--app-cyan)] to-[var(--app-cyan-dark)] flex items-center justify-center">
                  <span className="text-[var(--app-bg)]">JD</span>
                </div>
                <div>
                  <p className="text-[var(--app-text-primary)]">John Doe</p>
                  <p className="text-[var(--app-text-tertiary)]">2h ago</p>
                </div>
              </div>
              <p className="text-[var(--app-text-secondary)] mb-3">
                This is how your posts will look in the selected theme. The colors adjust automatically!
              </p>
              <div className="flex items-center gap-4">
                <button className="text-[var(--app-text-secondary)] hover:text-[var(--app-cyan)] transition-colors flex items-center gap-2">
                  <span>❤️</span>
                  <span>24</span>
                </button>
                <button className="text-[var(--app-text-secondary)] hover:text-[var(--app-cyan)] transition-colors flex items-center gap-2">
                  <span>💬</span>
                  <span>5</span>
                </button>
              </div>
            </div>

            {/* Sample Button */}
            <div className="flex gap-3">
              <button className="flex-1 bg-gradient-to-br from-[var(--app-cyan)] to-[var(--app-cyan-dark)] text-[var(--app-bg)] px-4 py-3 rounded-xl shadow-lg transition-transform hover:scale-105">
                Primary Button
              </button>
              <button className="flex-1 bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-[var(--app-text-primary)] px-4 py-3 rounded-xl hover:border-[var(--app-cyan)] transition-colors">
                Secondary Button
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-[var(--app-blue-light)] border border-[var(--app-blue)] rounded-xl p-4">
          <p className="text-[var(--app-text-primary)]">
            💡 <strong>Tip:</strong> Dark mode can help reduce eye strain during late-night study sessions!
          </p>
        </div>
      </main>
    </div>
  );
}
