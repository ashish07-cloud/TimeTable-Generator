import {
  ArrowRight,
  CalendarCheck,
  Cpu,
  Sliders,
  Zap,
  Users,
  Clock,
  Shield,
  Star,
  CheckCircle,
  BarChart3,
  Sparkles,
  GraduationCap,
  BookOpen,
  Building2,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Home() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate("/admin");
    } else {
      navigate("/login");
    }
  };

  // Adjust for fixed navbar height (approx 80px)
  const navbarHeight = "80px";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-black text-white" : "bg-white text-gray-900"
      } pt-[80px]`}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />

        {/* Floating Decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="container mx-auto px-6 py-20 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 mb-8 backdrop-blur-sm ${
                isDark
                  ? "bg-gray-900/50 border-orange-500/30 text-orange-400"
                  : "bg-white/50 border-orange-400/30 text-orange-600"
              }`}
            >
              <Sparkles size={16} className="text-orange-500" />
              <span className="text-sm font-medium">
                AI-Powered Timetable Generation
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Intelligent
              </span>
              <br />
              Academic Scheduling
            </h1>

            <p
              className={`text-xl md:text-2xl max-w-2xl mx-auto mb-8 leading-relaxed ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Eliminate timetable conflicts forever with our AI-driven engine.
              Perfectly aligned with NEP 2020 guidelines and built for modern
              universities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleStart}
                className="bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold py-4 px-8 rounded-xl hover:from-orange-600 hover:to-orange-800 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 text-lg shadow-lg"
              >
                {user ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight size={20} />
              </button>
              <button
                className={`border-2 font-semibold py-4 px-8 rounded-xl hover:border-orange-500 transition-all duration-300 backdrop-blur-sm ${
                  isDark
                    ? "border-gray-600 text-white hover:text-orange-400"
                    : "border-gray-300 text-gray-700 hover:text-orange-600"
                }`}
              >
                Watch Demo
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-400">
                  99.9%
                </div>
                <div
                  className={
                    isDark ? "text-gray-400 text-sm" : "text-gray-600 text-sm"
                  }
                >
                  Clash-Free
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-400">
                  10x
                </div>
                <div
                  className={
                    isDark ? "text-gray-400 text-sm" : "text-gray-600 text-sm"
                  }
                >
                  Faster
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-400">
                  24/7
                </div>
                <div
                  className={
                    isDark ? "text-gray-400 text-sm" : "text-gray-600 text-sm"
                  }
                >
                  Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className={`py-20 transition-colors duration-300 scroll-mt-[80px] ${
          isDark ? "bg-gray-900/50" : "bg-gray-50"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                AcadiaPlan
              </span>
              ?
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Designed for academic excellence with cutting-edge technology and
              deep understanding of institutional needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: <Cpu size={32} />,
                title: "AI-Powered Optimization",
                description:
                  "Advanced algorithms analyze thousands of constraints to generate optimal schedules in seconds.",
              },
              {
                icon: <CalendarCheck size={32} />,
                title: "Zero Clash Guarantee",
                description:
                  "Automatically detect and resolve conflicts between faculty, rooms, and student groups.",
              },
              {
                icon: <Users size={32} />,
                title: "NEP 2020 Compliant",
                description:
                  "Specifically designed for multidisciplinary programs and credit-based systems.",
              },
              {
                icon: <Clock size={32} />,
                title: "Real-time Updates",
                description:
                  "Make changes on the fly and see immediate impacts across the entire timetable.",
              },
              {
                icon: <Sliders size={32} />,
                title: "Customizable Rules",
                description:
                  "Set your own constraints, preferences, and institutional requirements easily.",
              },
              {
                icon: <Shield size={32} />,
                title: "Secure & Reliable",
                description:
                  "Enterprise-grade security with 99.9% uptime guarantee for uninterrupted operations.",
              },
              {
                icon: <Zap size={32} />,
                title: "Lightning Fast",
                description:
                  "Generate complex timetables in minutes instead of weeks with our optimized engine.",
              },
              {
                icon: <Star size={32} />,
                title: "Easy Integration",
                description:
                  "Seamlessly connect with your existing student information systems and portals.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl border transition-all duration-300 hover:transform hover:scale-105 ${
                  isDark
                    ? "bg-gray-800/50 border-gray-700 hover:border-orange-500"
                    : "bg-white border-gray-200 hover:border-orange-400 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3
                  className={`text-xl font-semibold mb-3 group-hover:text-orange-400 transition-colors ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`leading-relaxed ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It{" "}
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Simple, intuitive steps to transform your academic scheduling.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <BookOpen size={40} />,
                title: "1. Input Data",
                description:
                  "Add courses, subjects, faculty, and rooms. Define constraints and preferences.",
              },
              {
                icon: <BarChart3 size={40} />,
                title: "2. AI Analysis",
                description:
                  "Our engine processes thousands of possibilities in seconds, optimizing for all constraints.",
              },
              {
                icon: <GraduationCap size={40} />,
                title: "3. Generate & Publish",
                description:
                  "Get a complete, clash-free timetable. Publish instantly and share with students.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl border text-center transition-all duration-300 hover:shadow-xl ${
                  isDark
                    ? "bg-gray-800/30 border-gray-700"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl text-white">
                    {step.icon}
                  </div>
                </div>
                <h3
                  className={`text-2xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`leading-relaxed ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {step.description}
                </p>
                {index < 2 && (
                  <ChevronRight
                    size={32}
                    className={`absolute top-1/2 -right-4 hidden md:block ${
                      isDark ? "text-gray-600" : "text-gray-400"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className={`py-20 transition-colors duration-300 ${
          isDark ? "bg-gray-900/50" : "bg-gray-50"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Leading Institutions
              </span>
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              See what academic leaders are saying about AcadiaPlan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote:
                  "AcadiaPlan reduced our timetable planning time from 3 weeks to just 2 hours. The AI engine is incredibly smart.",
                name: "Dr. Sarah Johnson",
                title: "Dean of Academics, Tech University",
              },
              {
                quote:
                  "Finally, a tool that handles the complexity of NEP 2020 with ease. No more faculty clashes or room conflicts.",
                name: "Prof. Michael Chen",
                title: "Head of Department, State College",
              },
              {
                quote:
                  "The real-time updates and intuitive interface have made schedule changes a breeze. Our staff loves it.",
                name: "Anita Sharma",
                title: "Administrator, Central University",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border transition-all duration-300 hover:transform hover:scale-105 ${
                  isDark
                    ? "bg-gray-800/30 border-gray-700"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="fill-orange-500 text-orange-500"
                    />
                  ))}
                </div>
                <p
                  className={`text-lg italic mb-6 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {testimonial.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Timetable?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join hundreds of institutions already using AcadiaPlan to streamline
            their academic scheduling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleStart}
              className="bg-black text-orange-400 font-bold py-4 px-8 rounded-xl hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 text-lg shadow-lg"
            >
              {user ? "Go to Dashboard" : "Start Free Trial"}
            </button>
            <button className="bg-white/20 text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

