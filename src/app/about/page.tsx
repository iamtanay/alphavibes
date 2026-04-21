import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10 pb-24 md:pb-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold gradient-text mb-2">AlphaVibes</h1>
          <p className="text-text-secondary">by Accrion</p>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-base font-semibold text-text-primary mb-3">What is AlphaVibes?</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              AlphaVibes helps you understand any Indian stock in 60 seconds. We give you insider-level
              insights — investor persona scores, technical indicators, fundamental ratios — all simplified
              so any investor can understand them, whether you're a beginner or an experienced trader.
            </p>
          </div>

          <div className="card">
            <h2 className="text-base font-semibold text-text-primary mb-3">How It Works</h2>
            <div className="space-y-3">
              {[
                { step: "1", title: "Search any stock", desc: "Type a ticker or company name — NSE and BSE supported." },
                { step: "2", title: "Investor Personas", desc: "See how legends like Buffett, Graham, and Lynch would rate the stock — all deterministic, no AI." },
                { step: "3", title: "Quick Summary", desc: "Get a plain-English verdict on health, growth, debt, and valuation." },
                { step: "4", title: "Deep Dive", desc: "Explore fundamentals, technicals, financials, and peer comparison in detail." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-violet flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-base font-semibold text-text-primary mb-3">Data & Disclaimers</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              All stock data is delayed (end-of-day via Yahoo Finance). AlphaVibes is for informational
              and educational purposes only. It is NOT financial advice. Always do your own research before
              making any investment decision.
            </p>
          </div>

          <div className="card text-center">
            <p className="text-sm text-text-secondary">
              Built with ❤️ by <span className="text-violet font-semibold">Accrion</span>
            </p>
            <p className="text-xs text-text-secondary mt-2">AlphaVibes V1 · India-First · Free Forever</p>
          </div>
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}
