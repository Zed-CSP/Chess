'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, Play, Brain, Trophy, Users, Zap, Shield } from 'lucide-react'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)

  const features = [
    {
      icon: Play,
      title: 'Real-time Multiplayer',
      description: 'Play against opponents worldwide with instant matchmaking and live games.'
    },
    {
      icon: Brain,
      title: 'AI Opponents',
      description: 'Challenge our advanced AI with adjustable difficulty levels from beginner to master.'
    },
    {
      icon: Trophy,
      title: 'Tournaments',
      description: 'Compete in tournaments and climb the leaderboards to prove your skills.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join a vibrant community of chess players and make new friends.'
    },
    {
      icon: Zap,
      title: 'Game Analysis',
      description: 'Analyze your games with powerful engine evaluation and improve your play.'
    },
    {
      icon: Shield,
      title: 'Fair Play',
      description: 'Advanced anti-cheat systems ensure a fair and competitive environment.'
    }
  ]

  const timeControls = [
    { name: 'Bullet', time: '1+0', description: '1 minute games' },
    { name: 'Blitz', time: '3+2', description: '3 min + 2 sec' },
    { name: 'Rapid', time: '10+5', description: '10 min + 5 sec' },
    { name: 'Classical', time: '30+30', description: '30 min + 30 sec' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">♔</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Chess Master</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/lobby" className="nav-link">Play</Link>
              <Link href="/puzzles" className="nav-link">Puzzles</Link>
              <Link href="/tournaments" className="nav-link">Tournaments</Link>
              <Link href="/learn" className="nav-link">Learn</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login" className="btn btn-ghost">Sign In</Link>
              <Link href="/register" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Chess with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}AI-Powered
              </span>
              <br />Training
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Play against advanced AI, solve tactical puzzles, and compete in tournaments. 
              Our platform combines cutting-edge technology with classical chess to help you improve your game.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/lobby" 
                className="btn btn-primary btn-lg group"
                onClick={() => setIsLoading(true)}
              >
                {isLoading ? (
                  <div className="loading-spinner w-5 h-5 mr-2" />
                ) : (
                  <Play className="w-5 h-5 mr-2" />
                )}
                Start Playing
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/demo" className="btn btn-outline btn-lg">
                Watch Demo
              </Link>
            </div>

            {/* Quick Play Options */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {timeControls.map((control) => (
                <Link
                  key={control.name}
                  href={`/lobby?time=${control.time}`}
                  className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                >
                  <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                    {control.name}
                  </div>
                  <div className="text-sm text-gray-500">{control.time}</div>
                  <div className="text-xs text-gray-400">{control.description}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Master Chess
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and features you need to improve your chess skills.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-blue-100">Active Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1M+</div>
              <div className="text-blue-100">Games Played</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-blue-100">Puzzles Solved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">Tournaments</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Elevate Your Chess Game?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of players who are already improving their skills with our AI-powered platform.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Start Your Journey
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Play</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/play" className="hover:text-gray-900">Quick Game</Link></li>
                <li><Link href="/play/ai" className="hover:text-gray-900">vs Computer</Link></li>
                <li><Link href="/play/friends" className="hover:text-gray-900">vs Friends</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Learn</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/puzzles" className="hover:text-gray-900">Puzzles</Link></li>
                <li><Link href="/lessons" className="hover:text-gray-900">Lessons</Link></li>
                <li><Link href="/analysis" className="hover:text-gray-900">Analysis</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Community</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/tournaments" className="hover:text-gray-900">Tournaments</Link></li>
                <li><Link href="/leaderboard" className="hover:text-gray-900">Leaderboard</Link></li>
                <li><Link href="/forum" className="hover:text-gray-900">Forum</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/help" className="hover:text-gray-900">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900">Contact</Link></li>
                <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">♔</span>
              </div>
              <span className="font-semibold text-gray-900">Chess Master</span>
            </div>
            <div className="text-gray-600 text-sm">
              © 2024 Chess Master. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 