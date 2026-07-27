import { Check, Link } from "lucide-react";
import { INDIA_BROKERS, US_BROKERS } from "../../../constants.js";

function BrokerCard({
  name,
  description,
  logo,
  logoBg = "",
  connected,
  onConnect,
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border-2 p-5 transition-all duration-300 ${
        connected
          ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10"
          : "border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-cyan-500"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`h-14 w-14 rounded-xl overflow-hidden flex items-center justify-center shadow ${logoBg}`}
        >
          <img
            src={logo}
            alt={name}
            className="w-10 h-10 object-contain"
            onError={(e) => {
              e.target.src = "/placeholder-broker.png";
            }}
          />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {name}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {connected ? (
        <span className="flex items-center justify-center gap-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 px-5 py-2 font-semibold text-emerald-600 dark:text-emerald-400">
          <Check size={18} />
          Connected
        </span>
      ) : (
        <button
          onClick={() => onConnect(name)}
          className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 font-semibold text-white hover:from-cyan-500 hover:to-blue-500"
        >
          Connect
        </button>
      )}
    </div>
  );
}

export default function BrokerConnection() {
  const handleConnect = (broker) => {
    console.log(`Connect ${broker}`);

    // Future:
    // Navigate to OAuth
    // Open Broker Login
    // Call API
  };

  return (
    <div className="p-4 sm:p-6">

      <div className="max-w-5xl mx-auto space-y-10">

        <div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <Link className="w-5 h-5 text-cyan-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Broker Connections
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Securely connect your investment accounts.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-200 dark:border-cyan-900 bg-cyan-50 dark:bg-cyan-950/20 p-4">

            <p className="text-sm text-slate-600 dark:text-slate-300">
              FinVault connects directly with supported brokers using secure
              APIs. Your broker password is never stored on our servers.
            </p>

          </div>
        </div>

        {/* Indian Brokers */}

        <section>

          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-500">
            Indian Brokers
          </h3>

          <div className="grid gap-4">

            {INDIA_BROKERS.map((broker) => (
              <BrokerCard
                key={broker.name}
                {...broker}
                onConnect={handleConnect}
              />
            ))}

          </div>

        </section>

        {/* US Brokers */}

        <section>

          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-500">
            Global Markets & Crypto
          </h3>

          <div className="grid gap-4">

            {US_BROKERS.map((broker) => (
              <BrokerCard
                key={broker.name}
                {...broker}
                onConnect={handleConnect}
              />
            ))}

          </div>

        </section>

      </div>
    </div>
  );
}