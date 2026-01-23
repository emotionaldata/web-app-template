import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-6">
            Website Template for Vitoria Consulting
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Build something amazing today
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            A modern web application template with React, TypeScript, Tailwind CSS, and Vite.
            Everything you need to get started quickly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
            >
              Explore Services
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why choose us?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We provide everything you need to build modern web applications
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Built with Vite for instant hot module replacement and blazing fast builds.',
              },
              {
                icon: '🎨',
                title: 'Beautiful UI',
                description: 'Tailwind CSS for rapid styling with a consistent, professional look.',
              },
              {
                icon: '🔒',
                title: 'Type Safe',
                description: 'Full TypeScript support for catching errors early and better DX.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-cyan-500/30 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-slate-400 mb-6">
              Join thousands of developers building amazing products.
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
            >
              Contact Us Today
            </Link>
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
