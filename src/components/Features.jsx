const features = [
  {
    id: 'tournaments',
    emoji: '\u{1F3C6}',
    title: 'Tournaments',
    description: 'Compete in daily tournaments across multiple games and win exciting prizes.',
  },
  {
    id: 'live-streaming',
    emoji: '\u{1F3AE}',
    title: 'Live Streaming',
    description: 'Watch and stream live gameplay with your favorite gamers.',
  },
  {
    id: 'community',
    emoji: '\u{1F465}',
    title: 'Community',
    description: 'Connect with millions of gamers, form teams, and make friends.',
  },
  {
    id: 'rewards',
    emoji: '\u{2B50}',
    title: 'Rewards',
    description: 'Earn points, unlock achievements, and redeem exclusive rewards.',
  },
  {
    id: 'chickenracing',
    emoji: '\u{1F414}',
    title: 'Chicken Racing',
    description: 'Tap to race your chicken and dodge obstacles before time runs out!',
  },
]

function Features({ onNavigate }) {
  return (
    <section id="features" className="features-section">
      <h2 className="section-title">What We Offer</h2>
      <div className="features-grid">
        {features.map((feature) => (
          <div
            className="feature-card clickable"
            key={feature.title}
            onClick={() => onNavigate(feature.id)}
          >
            <span className="feature-emoji">{feature.emoji}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features
