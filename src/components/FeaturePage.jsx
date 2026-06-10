const featureData = {
  tournaments: {
    emoji: '\u{1F3C6}',
    title: 'Tournaments',
    description: 'Compete in daily tournaments across multiple games and win exciting prizes. Battle your way to the top of the leaderboard and claim your rewards.',
  },
  'live-streaming': {
    emoji: '\u{1F3AE}',
    title: 'Live Streaming',
    description: 'Watch and stream live gameplay with your favorite gamers. Share your skills, build your audience, and enjoy real-time interaction with the community.',
  },
  community: {
    emoji: '\u{1F465}',
    title: 'Community',
    description: 'Connect with millions of gamers, form teams, and make friends. Join clans, participate in discussions, and be part of a thriving gaming ecosystem.',
  },
  rewards: {
    emoji: '\u{2B50}',
    title: 'Rewards',
    description: 'Earn points, unlock achievements, and redeem exclusive rewards. Every game you play brings you closer to amazing prizes and recognition.',
  },
}

function FeaturePage({ featureId, onBack }) {
  const feature = featureData[featureId]

  if (!feature) return null

  return (
    <section className="feature-page">
      <div className="feature-page-content">
        <span className="feature-page-emoji">{feature.emoji}</span>
        <h1>{feature.title}</h1>
        <p>{feature.description}</p>
        <button className="btn-cta" onClick={onBack}>Back to Home</button>
      </div>
    </section>
  )
}

export default FeaturePage
