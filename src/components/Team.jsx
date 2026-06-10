const team = [
  { name: 'Alex Rivera', role: 'CEO & Founder', initials: 'AR', color: '#7c3aed' },
  { name: 'Sarah Chen', role: 'Head of Product', initials: 'SC', color: '#ec4899' },
  { name: 'James Okafor', role: 'Lead Engineer', initials: 'JO', color: '#14b8a6' },
  { name: 'Priya Sharma', role: 'Design Director', initials: 'PS', color: '#f59e0b' },
]

function Team() {
  return (
    <section id="team" className="team-section">
      <h2 className="section-title">Meet Our Team</h2>
      <div className="team-grid">
        {team.map((member) => (
          <div className="team-card" key={member.name}>
            <div
              className="team-avatar"
              style={{ background: member.color }}
            >
              {member.initials}
            </div>
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Team
