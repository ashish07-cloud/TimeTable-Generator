import { ArrowRight, CalendarCheck, Cpu, Sliders, Zap, Users, Clock, Shield, Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

function Home() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-gray-900'
    }`}>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className={`absolute top-20 left-10 w-4 h-4 rounded-full opacity-20 animate-pulse ${
            isDark ? 'bg-green-500' : 'bg-green-400'
          }`}></div>
          <div className={`absolute top-40 right-20 w-6 h-6 rounded-full opacity-30 animate-bounce ${
            isDark ? 'bg-green-400' : 'bg-green-500'
          }`}></div>
          <div className={`absolute bottom-20 left-1/4 w-3 h-3 rounded-full opacity-40 animate-pulse delay-1000 ${
            isDark ? 'bg-green-600' : 'bg-green-600'
          }`}></div>
        </div>

        <div className="container mx-auto px-6 py-20 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 mb-8 ${
              isDark 
                ? 'bg-gray-900 border-green-500/30 text-green-400' 
                : 'bg-gray-100 border-green-400/30 text-green-600'
            }`}>
              <Zap size={16} className={isDark ? 'text-green-400' : 'text-green-600'} />
              <span className="text-sm font-medium">AI-Powered Timetable Generation</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
              Say Goodbye to
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent block">
                Timetable Chaos
              </span>
            </h1>
            
            <p className={`text-xl max-w-2xl mx-auto mb-8 leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Harness the power of AI to create flawless, conflict-free academic schedules in minutes. 
              Optimized for NEP 2020 with intelligent resource allocation and zero clashes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-4 px-8 rounded-lg hover:from-green-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 text-lg">
                Start Free Trial <ArrowRight size={20} />
              </button>
              <button className={`border font-semibold py-4 px-8 rounded-lg hover:border-green-500 transition-all duration-300 ${
                isDark 
                  ? 'border-gray-600 text-white hover:text-green-400' 
                  : 'border-gray-300 text-gray-700 hover:text-green-600'
              }`}>
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-green-400">99.9%</div>
                <div className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Clash-Free</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">10x</div>
                <div className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Faster</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">24/7</div>
                <div className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 transition-colors duration-300 ${
        isDark ? 'bg-gray-900/50' : 'bg-gray-50'
      }`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-green-400">AcadiaPlan</span>?
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Built specifically for the complex requirements of NEP 2020 with cutting-edge technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: <Cpu size={32} />,
                title: "AI-Powered Optimization",
                description: "Advanced algorithms analyze thousands of constraints to generate optimal schedules in seconds."
              },
              {
                icon: <CalendarCheck size={32} />,
                title: "Zero Clash Guarantee",
                description: "Automatically detect and resolve conflicts between faculty, rooms, and student groups."
              },
              {
                icon: <Users size={32} />,
                title: "NEP 2020 Compliant",
                description: "Specifically designed for multidisciplinary programs and credit-based systems."
              },
              {
                icon: <Clock size={32} />,
                title: "Real-time Updates",
                description: "Make changes on the fly and see immediate impacts across the entire timetable."
              },
              {
                icon: <Sliders size={32} />,
                title: "Customizable Rules",
                description: "Set your own constraints, preferences, and institutional requirements easily."
              },
              {
                icon: <Shield size={32} />,
                title: "Secure & Reliable",
                description: "Enterprise-grade security with 99.9% uptime guarantee for uninterrupted operations."
              },
              {
                icon: <Zap size={32} />,
                title: "Lightning Fast",
                description: "Generate complex timetables in minutes instead of weeks with our optimized engine."
              },
              {
                icon: <Star size={32} />,
                title: "Easy Integration",
                description: "Seamlessly connect with your existing student information systems and portals."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl border transition-all duration-300 hover:transform hover:scale-105 group ${
                  isDark 
                    ? 'bg-gray-800/50 border-gray-700 hover:border-green-500' 
                    : 'bg-white border-gray-200 hover:border-green-400 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-3 group-hover:text-green-400 transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`leading-relaxed ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Timetable?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join hundreds of institutions already using AcadiaPlan to streamline their academic scheduling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-black text-green-400 font-bold py-4 px-8 rounded-lg hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 text-lg">
              Start Free Trial <ArrowRight size={20} />
            </button>
            <button className="bg-white/20 text-white font-semibold py-4 px-8 rounded-lg hover:bg-white/30 transition-all duration-300 backdrop-blur-sm">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;