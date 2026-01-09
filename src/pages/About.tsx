export default function About() {
  const team = [
    { name: 'Alex Johnson', role: 'CEO & Founder', image: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Sarah Williams', role: 'CTO', image: 'https://i.pravatar.cc/150?img=5' },
    { name: 'Michael Chen', role: 'Lead Developer', image: 'https://i.pravatar.cc/150?img=3' },
    { name: 'Emily Davis', role: 'Design Lead', image: 'https://i.pravatar.cc/150?img=9' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            We're a passionate team dedicated to building exceptional digital experiences.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-slate-400 mb-4">
                Founded in 2024, we started with a simple mission: make web development accessible
                and enjoyable for everyone. What began as a small team of three has grown into
                a thriving community of developers and designers.
              </p>
              <p className="text-slate-400">
                Today, we continue to push the boundaries of what's possible on the web,
                creating tools and templates that help developers build faster and better.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-cyan-400">500+</div>
                  <div className="text-slate-400 text-sm mt-1">Projects Delivered</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-cyan-400">50+</div>
                  <div className="text-slate-400 text-sm mt-1">Team Members</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-cyan-400">99%</div>
                  <div className="text-slate-400 text-sm mt-1">Client Satisfaction</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-cyan-400">24/7</div>
                  <div className="text-slate-400 text-sm mt-1">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Innovation',
                description: 'We constantly explore new technologies and approaches to deliver cutting-edge solutions.',
              },
              {
                title: 'Quality',
                description: 'Every line of code we write is crafted with care, ensuring reliability and performance.',
              },
              {
                title: 'Collaboration',
                description: 'We believe the best results come from working closely with our clients and each other.',
              },
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <span className="text-2xl text-cyan-400">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-slate-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-slate-700"
                />
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-slate-400 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AppName. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
